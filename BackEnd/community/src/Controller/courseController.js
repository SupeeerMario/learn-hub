const CourseService = require('../Service/courseService')
const { bucket } = require('../Config/firebaseeconfig')

class CourseController {
  constructor () {
    this.courseService = new CourseService()
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

  async uploadFile (req, res) {
    try {
      const file = req.file
      const userId = req.mongouserId
      const courseId = req.params.courseId
      const { title, description } = req.body

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' })
      }

      const fileDetails = { title, description }

      const result = await this.courseService.uploadFile(courseId, userId, file, fileDetails)

      res.json(result)
    } catch (error) {
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
      const courses = await this.courseService.getRandomCourses()
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
}

module.exports = CourseController
