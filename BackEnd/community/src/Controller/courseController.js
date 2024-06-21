const CourseService = require('../Service/courseService')
const { bucket } = require('../Config/firebaseeconfig')

class CourseController {
  constructor () {
    this.courseService = new CourseService()
    this.joinCourse = this.joinCourse.bind(this)
  }

  async addNewCourse (req, res) {
    try {
      const userId = req.mongouserId
      const username = req.username
      const userEmail = req.useremail
      const userProfilePic = req.userProfilePic

      console.log('UserId:', userId)
      console.log('Username:', username)
      console.log('UserEmail:', userEmail)
      console.log('UserProfilePic:', userProfilePic)
      console.log('Request Body:', req.body)
      console.log('Request Files:', req.files)

      const files = req.files
      const materials = []

      console.log('Bucket:', bucket) // Log bucket to check if it is correctly imported
      console.log('Bucket type:', typeof bucket) // Log the type of bucket

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log('Processing file:', file.originalname) // Log each file being processed
        const blob = bucket.file(Date.now() + '_' + file.originalname)
        console.log('Blob:', blob) // Log blob to ensure it is created correctly
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype
          }
        })

        await new Promise((resolve, reject) => {
          blobStream.on('error', error => {
            console.error('Blob stream error:', error)
            reject(error)
          })

          blobStream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            materials.push({
              title: req.body.lectures[i],
              file: publicUrl
            })

            // Make the file public
            await blob.makePublic()

            console.log('File uploaded to:', publicUrl) // Log the public URL of the uploaded file
            resolve()
          })

          blobStream.end(file.buffer)
        })
      }

      const course = {
        ownerID: userId,
        name: req.body.name,
        about: req.body.about,
        level: req.body.level,
        language: req.body.language,
        materials,
        members: [
          {
            username,
            email: userEmail,
            profilepic: userProfilePic || ''
          }
        ],
        creator: {
          username,
          _id: userId,
          email: userEmail,
          profilepic: userProfilePic
        }
      }

      console.log('Course Object:', course)

      const result = await this.courseService.newCourse(course)
      res.json(result)
    } catch (error) {
      console.error('Error in addNewCourse:', error)
      res.status(400).json({ message: error.message })
    }
  }

  async findCourseById (req, res) {
    try {
      const userId = req.mongouserId
      const courseId = req.params.courseId

      const course = await this.courseService.getCourseById(courseId)

      res.json({
        course,
        userRole: req.userRole,
        userId
      })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async uploadMaterial (req, res) {
    try {
      console.log('Received request for /course/upload/:courseId')
      console.log('Request Files:', req.files) // Log the files received
      console.log('Request Body:', req.body) // Log the body received

      const files = req.files
      const userId = req.mongouserId
      const courseId = req.params.courseId
      const { lectures } = req.body

      if (!files || files.length === 0) {
        console.error('No file uploaded')
        return res.status(400).json({ error: 'No file uploaded.' })
      }

      const materials = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log('Processing file:', file.originalname)

        const blob = bucket.file(Date.now() + '_' + file.originalname)
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype
          }
        })

        await new Promise((resolve, reject) => {
          blobStream.on('error', (error) => {
            console.error('Blob stream error:', error)
            reject(error)
          })

          blobStream.on('finish', async () => {
            try {
              await blob.makePublic()
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
              materials.push({
                lecture: lectures[i],
                file: publicUrl
              })
              console.log('File uploaded to:', publicUrl)
              resolve()
            } catch (error) {
              console.error('Error making file public:', error)
              reject(error)
            }
          })

          // Write the file buffer to the blob stream
          blobStream.end(file.buffer)
        })
      }

      // Call the service to save the file details to the course
      const result = await this.courseService.uploadMaterial(courseId, userId, materials)

      res.json(result)
    } catch (error) {
      console.error('Error in uploadMaterial controller:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getFilesFromCourse (req, res) {
    try {
      const courseId = req.params.courseId
      const files = await this.courseService.getFilesFromCourse(courseId)

      res.json(files)
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getAllCoursesForUser (req, res) {
    try {
      const userId = req.mongouserId
      const courses = await this.courseService.getAllCoursesForUser(userId)

      res.json({ courses })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async createPost (req, res) {
    try {
      const { title, description, category, username, imageUrl } = req.body
      const { courseId } = req.params

      if (!title || !description || !category || !imageUrl || !username) {
        return res.status(400).json({ error: 'Please enter all fields' })
      }

      const newPost = await this.courseService.createPost(title, description, category, imageUrl, username, courseId)
      res.status(201).json(newPost)
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getAllPostsForCourse (req, res) {
    try {
      const { courseId } = req.params

      const posts = await this.courseService.getAllPostsForCourse(courseId)
      res.json(posts)
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getCourses (req, res) {
    try {
      const userId = req.mongouserId
      const courses = await this.courseService.getCoursesByOwnerId(userId)
      res.json(courses)
    } catch (error) {
      console.error('Error in getCourses:', error)
      res.status(400).json({ message: error.message })
    }
  }

  async getRandomCourses (req, res) {
    try {
      const userId = req.mongouserId
      const courses = await this.courseService.getRandomCourses(userId)
      res.json(courses)
    } catch (error) {
      console.error('Error in getRandomCourses:', error)
      res.status(500).json({ message: 'Failed to fetch random courses' })
    }
  }

  async markCourseStatus (req, res) {
    try {
      const courseId = req.params.courseId
      const { completed } = req.body
      const course = await this.courseService.updateCourseStatus(courseId, completed)
      res.json({ course, message: `Course marked as ${completed ? 'completed' : 'ongoing'} successfully` })
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async joinCourse (req, res) {
    try {
      const userId = req.mongouserId
      const username = req.username
      const userEmail = req.useremail
      const userProfilePic = req.userProfilePic || ''

      const courseId = req.params.courseId

      console.log('Joining course:', { userId, courseId })

      const result = await this.courseService.joinCourse(userId, username, userEmail, userProfilePic, courseId)
      res.json(result)
    } catch (error) {
      console.error('Error in joinCourse controller:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getJoinedCoursesForUser (req, res) {
    try {
      const userId = req.mongouserId
      console.log('Getting joined courses for user:', { userId })

      const result = await this.courseService.getJoinedCoursesForUser(userId)
      res.json(result)
    } catch (error) {
      console.error('Error in getJoinedCoursesForUser controller:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}

module.exports = CourseController
