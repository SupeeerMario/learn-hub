const { Courses, Post } = require('../models/courses')
const { admin } = require('../Config/firebaseeconfig')
const bucket = admin.storage().bucket()
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

class CourseRepository {
  async createCourse (courseData) {
    try {
      console.log('CourseRepository - Before creating course:', courseData)
      const newCourse = await Courses.create({
        ...courseData,
        members: courseData.members || [],
        materials: courseData.materials || [],
        introVideo: courseData.introVideo || ''
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

  async addMaterials (courseId, userId, materials) {
    try {
      const course = await Courses.findById(courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      course.materials.push(...materials)
      await course.save()

      return course
    } catch (error) {
      throw new Error(`Failed to add materials: ${error.message}`)
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

  async findCoursesByUserId (userId) {
    try {
      const courses = await Courses.find({ 'members._id': userId }).lean()
      return courses
    } catch (error) {
      console.error('CourseRepository - Error in findCoursesByUserId:', error)
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }
  }

  async getRandomCourses (userId, limit = 6) {
    try {
      const courses = await Courses.aggregate([
        { $match: { 'members._id': { $ne: new ObjectId(userId) } } }, // Exclude courses where the user is a member
        { $sample: { size: limit } }
      ])

      return courses.map(course => ({
        _id: course._id,
        name: course.name,
        about: course.about,
        level: course.level,
        materials: course.materials,
        language: course.language,
        completed: course.completed
      }))
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

  async uploadMaterial (courseId, userId, materials) {
    try {
      console.log('Repository - uploadMaterial:', { courseId, userId, materials })
      const course = await Courses.findById(courseId)
      if (!course) {
        console.error('Course not found:', courseId)
        throw new Error('Course not found')
      }

      materials.forEach((material) => {
        course.materials.push(material)
      })

      await course.save()

      return { course }
    } catch (error) {
      console.error('Error in uploadMaterial repository:', error)
      throw new Error(`Failed to upload material: ${error.message}`)
    }
  }

  async joinCourse (userId, username, userEmail, userProfilePic, courseId) {
    try {
      console.log('Repository - joinCourse:', { userId, courseId })
      const course = await Courses.findById(courseId)
      if (!course) {
        console.error('Course not found:', courseId)
        throw new Error('Course not found')
      }

      if (course.members.some(member => member._id.toString() === userId)) {
        console.error('User already joined the course:', { userId, courseId })
        throw new Error('User already joined the course')
      }

      course.members.push({
        _id: userId,
        username,
        email: userEmail,
        profilepic: userProfilePic
      })

      await course.save()
      return { message: 'User successfully joined the course' }
    } catch (error) {
      console.error('Error in joinCourse repository:', error)
      throw new Error(`Failed to join course: ${error.message}`)
    }
  }

  async getJoinedCoursesForUser (userId) {
    try {
      console.log('Repository - getJoinedCoursesForUser:', { userId })
      const courses = await Courses.find({ 'members._id': userId })
      return courses
    } catch (error) {
      console.error('Error in getJoinedCoursesForUser repository:', error)
      throw new Error(`Failed to get joined courses: ${error.message}`)
    }
  }

  async addFeedback (courseId, feedback) {
    try {
      const course = await Courses.findById(courseId)
      if (!course) throw new Error('Course not found')

      console.log('Repository - addFeedback - course:', course)
      console.log('Repository - addFeedback - feedback:', feedback)

      course.feedbacks.push(feedback)
      await course.save()

      console.log('Repository - addFeedback - updated course:', course)
      return course
    } catch (error) {
      console.error('Repository - addFeedback - error:', error)
      throw new Error(error.message)
    }
  }

  async getFeedbacks (courseId) {
    const course = await Courses.findById(courseId).populate('feedbacks.userId', 'username email profilepic')
    if (!course) throw new Error('Course not found')
    return course.feedbacks
  }

  async getCoursesByEnrollment () {
    return await Courses.aggregate([
      {
        $project: {
          _id: '$_id',
          name: '$name',
          enrollmentCount: { $size: '$members' }
        }
      },
      { $sort: { enrollmentCount: -1 } }
    ])
  };

  async getCoursesByAvgFeedback () {
    return await Courses.aggregate([
      { $unwind: '$feedbacks' },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          avgFeedback: { $avg: '$feedbacks.rating' }
        }
      },
      { $sort: { avgFeedback: -1 } }
    ])
  };
}

module.exports = CourseRepository
