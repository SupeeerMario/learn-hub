const CourseRepository = require('../Repository/courseRepository')
const { uploadFileToStorage } = require('../Config/firebaseeconfig')
const joi = require('joi')

class CourseService {
  constructor () {
    this.courseRepository = new CourseRepository()
  }

  validateCourseData (data) {
    const schema = joi.object({
      name: joi.string().required().label('name'),
      about: joi.string().label('about'),
      ownerID: joi.string().required().label('ownerID'),
      level: joi.string().required().label('level'),
      language: joi.string().required().label('language'),
      introVideo: joi.string().allow('').label('introVideo'),
      members: joi.array().items(
        joi.object({
          username: joi.string().required(),
          email: joi.string().required(),
          profilepic: joi.string().allow('')
        })
      ),
      materials: joi.array().items(
        joi.object({
          title: joi.string().required(),
          file: joi.string().required()
        })
      ),
      creator: joi.object({
        username: joi.string().required(),
        _id: joi.string().required(),
        email: joi.string().required(),
        profilepic: joi.string().allow('')
      }).required()
    })
    return schema.validate(data)
  }

  async newCourse (courseData) {
    try {
      const { error } = this.validateCourseData(courseData)
      if (error) {
        throw new Error(error.details[0].message)
      }

      console.log('CourseService - Before calling createCourse:', courseData)
      const newCourse = await this.courseRepository.createCourse({
        ...courseData,
        materials: courseData.materials || []
      })
      console.log('CourseService - After calling createCourse:', newCourse)

      return { message: 'Course created successfully', course: newCourse }
    } catch (error) {
      console.error('CourseService - Error in newCourse:', error)
      throw new Error(`Course creation failed: ${error.message}`)
    }
  }

  async getCourseById (courseId) {
    try {
      const course = await this.courseRepository.findCourseById(courseId)
      return course
    } catch (error) {
      throw new Error(`Failed to fetch course: ${error.message}`)
    }
  }

  async addMaterials (courseId, userId, materials) {
    try {
      const course = await this.courseRepository.addMaterials(courseId, userId, materials)
      return course
    } catch (error) {
      throw new Error(`Failed to add materials: ${error.message}`)
    }
  }

  async getFilesFromCourse (courseId) {
    try {
      const files = await this.courseRepository.getFilesFromCourse(courseId)
      return files
    } catch (error) {
      throw new Error(`Failed to get files from course: ${error.message}`)
    }
  }

  async getAllCoursesForUser (userId) {
    try {
      const courses = await this.courseRepository.getAllCoursesForUser(userId)
      return courses
    } catch (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }
  }

  async createPost (title, description, category, imageUrl, username, courseId) {
    try {
      const post = {
        title,
        description,
        category,
        imageUrl,
        username,
        courseId,
        createdAt: new Date()
      }

      const newPost = await this.courseRepository.createPost(post)
      return newPost
    } catch (error) {
      throw new Error(`Failed to create post: ${error.message}`)
    }
  }

  async getAllPostsForCourse (courseId) {
    try {
      const posts = await this.courseRepository.findPostsByCourseId(courseId)
      return posts
    } catch (error) {
      throw new Error(`Failed to fetch posts for course: ${error.message}`)
    }
  }

  async getCoursesByOwnerId (ownerId) {
    try {
      const courses = await this.courseRepository.findCoursesByOwnerId(ownerId)
      return courses
    } catch (error) {
      console.error('CourseService - Error in getCoursesByOwnerId:', error)
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }
  }

  async getRandomCourses (userId) {
    try {
      return await this.courseRepository.getRandomCourses(userId)
    } catch (error) {
      console.error('CourseService - Error in getRandomCourses:', error)
      throw new Error('Failed to fetch random courses')
    }
  }

  async updateCourseStatus (courseId, completed) {
    try {
      const course = await this.courseRepository.updateCourseStatus(courseId, completed)
      return course
    } catch (error) {
      throw new Error(`Failed to update course: ${error.message}`)
    }
  }

  async uploadMaterial (courseId, userId, materials) {
    try {
      console.log('Service - uploadMaterial:', { courseId, userId, materials })
      const result = await this.courseRepository.uploadMaterial(courseId, userId, materials)
      return result
    } catch (error) {
      console.error('Error in uploadMaterial service:', error)
      throw new Error(`Failed to upload material: ${error.message}`)
    }
  }

  async joinCourse (userId, username, userEmail, userProfilePic, courseId) {
    try {
      console.log('Service - joinCourse:', { userId, courseId })
      const result = await this.courseRepository.joinCourse(userId, username, userEmail, userProfilePic, courseId)
      return result
    } catch (error) {
      console.error('Error in joinCourse service:', error)
      throw new Error(`Failed to join course: ${error.message}`)
    }
  }

  async getJoinedCoursesForUser (userId) {
    try {
      console.log('Service - getJoinedCoursesForUser:', { userId })
      const result = await this.courseRepository.getJoinedCoursesForUser(userId)
      return result
    } catch (error) {
      console.error('Error in getJoinedCoursesForUser service:', error)
      throw new Error(`Failed to get joined courses: ${error.message}`)
    }
  }

  async addFeedback (courseId, userId, username, profilepic, rating, feedback) {
    try {
      const feedbackData = { userId, username, profilepic, rating, feedback }
      console.log('Service - addFeedback - courseId:', courseId)
      console.log('Service - addFeedback - feedbackData:', feedbackData)

      const updatedCourse = await this.courseRepository.addFeedback(courseId, feedbackData)
      return updatedCourse
    } catch (error) {
      console.error('Service - addFeedback - error:', error)
      throw new Error(error.message)
    }
  }

  async getFeedbacks (courseId) {
    return await this.courseRepository.getFeedbacks(courseId)
  }

  async getCoursesByEnrollment () {
    return await this.coursesRepository.getCoursesByEnrollment()
  };

  async getCoursesByAvgFeedback () {
    return await this.coursesRepository.getCoursesByAvgFeedback()
  };
}

module.exports = CourseService
