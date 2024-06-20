const { Courses, Post } = require('../models/courses')
const { admin } = require('../Config/firebaseeconfig')
const bucket = admin.storage().bucket()
const mongoose = require('mongoose')

class CourseRepository {
  async createCourse (courseData) {
    try {
      console.log('CourseRepository - Before creating course:', courseData)
      const newCourse = await Courses.create({
        ...courseData,
        members: courseData.members || [],
        materials: courseData.materials || []
      })
      console.log('CourseRepository - After creating course:', newCourse)
      return newCourse.toObject()
    } catch (error) {
      console.error('CourseRepository - Error in createCourse:', error)
      throw new Error(`Course creation failed: ${error.message}`)
    }
  }

  async findCourseById (courseId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new Error('Invalid course ID')
      }

      const course = await Courses.findById(courseId).populate('ownerID').lean()
      if (!course) {
        throw new Error('Course not found')
      }

      return course
    } catch (error) {
      throw new Error(`Failed to fetch course: ${error.message}`)
    }
  }

  async updateCourse (course) {
    try {
      await course.save()
      return course.toObject()
    } catch (error) {
      throw new Error(`Failed to update course: ${error.message}`)
    }
  }

  async getAllCoursesForUser (userId) {
    try {
      const userIdObject = new mongoose.Types.ObjectId(userId)
      const courses = await Courses.find({ 'creator._id': userIdObject }).lean()
      return courses
    } catch (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }
  }

  async createPost (postData) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const newPost = new Post(postData)
      await newPost.save({ session })

      await Courses.findByIdAndUpdate(
        postData.courseId,
        { $push: { posts: newPost._id } },
        { session }
      )

      await session.commitTransaction()
      session.endSession()

      return newPost.toObject()
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      throw new Error(`Failed to create post: ${error.message}`)
    }
  }

  async findPostsByCourseId (courseId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new Error('Invalid course ID')
      }

      const course = await Courses.findById(courseId).lean().populate('posts')
      if (!course) {
        throw new Error('Course not found')
      }

      const postIds = course.posts

      if (!postIds || postIds.length === 0) {
        return []
      }

      const posts = await Post.find({ _id: { $in: postIds } }).lean()
      return posts
    } catch (error) {
      throw new Error(`Failed to fetch posts for course: ${error.message}`)
    }
  }

  async uploadFile (courseId, userId, file, fileDetails) {
    try {
      const course = await Courses.findById(courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      const filePath = `uploads/${Date.now()}_${file.originalname}`
      const fileRef = bucket.file(filePath)

      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype
        }
      })

      const fileLink = `https://storage.googleapis.com/${bucket.name}/${filePath}`
      const newFile = {
        link: fileLink,
        title: fileDetails.title,
        description: fileDetails.description
      }

      course.materials.push(newFile)
      await course.save()

      return { downloadURL: fileLink }
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }
  }

  async getFilesFromCourse (courseId) {
    try {
      const course = await Courses.findById(courseId)
      if (!course) {
        throw new Error('Course not found')
      }
      return course.materials
    } catch (error) {
      throw new Error(`Failed to get files from course: ${error.message}`)
    }
  }

  async findCoursesByOwnerId (ownerId) {
    try {
      const courses = await Courses.find({ ownerID: ownerId }).lean()
      return courses
    } catch (error) {
      console.error('CourseRepository - Error in findCoursesByOwnerId:', error)
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }
  }

  async getRandomCourses (limit = 6) {
    try {
      const courses = await Courses.aggregate([{ $sample: { size: limit } }])
      return courses.map(course => ({ _id: course._id, name: course.name, about: course.about, level: course.level, language: course.language, completed: course.completed }))
    } catch (error) {
      console.error('CourseRepository - Error in getRandomCourses:', error)
      throw new Error('Failed to fetch random courses')
    }
  }

  async updateCourseStatus (courseId, completed) {
    try {
      const course = await Courses.findByIdAndUpdate(
        courseId,
        { completed },
        { new: true }
      )
      return course
    } catch (error) {
      throw new Error(`Failed to update course: ${error.message}`)
    }
  }
}

module.exports = CourseRepository
