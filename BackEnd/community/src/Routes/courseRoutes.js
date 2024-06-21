const express = require('express')
const router = express.Router()
const CourseController = require('../Controller/courseController')
const courseMiddlewares = require('../middlewares/courseMiddlewares')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage })
const courseController = new CourseController()

router.post('/new', courseMiddlewares.userFromToken, upload.array('files'), courseController.addNewCourse.bind(courseController))
router.get('/get/:courseId', courseMiddlewares.userFromToken, courseController.findCourseById.bind(courseController))
router.get('/getallforuser', courseMiddlewares.userFromToken, courseController.getCourses.bind(courseController))
router.post('/join/:courseId', courseMiddlewares.userFromToken, courseController.joinCourse)
router.get('/joined-courses', courseMiddlewares.userFromToken, courseController.getJoinedCoursesForUser.bind(courseController))

router.post('/upload/:courseId', upload.array('files'), courseController.uploadMaterial.bind(courseController))
router.get('/getFilesFromCourse/:courseId', courseMiddlewares.userFromToken, courseController.getFilesFromCourse.bind(courseController))

router.get('/random6Courses', courseMiddlewares.userFromToken, courseController.getRandomCourses.bind(courseController))

router.put('/complete/:courseId', courseController.markCourseStatus.bind(courseController))

router.get('/getAllPostsforcourse/:courseId', courseController.getAllPostsForCourse.bind(courseController))
router.post('/createpost/:courseId', courseController.createPost.bind(courseController))

module.exports = router
