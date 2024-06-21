/* const express = require('express')
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

router.post('/feedback/:courseId', courseMiddlewares.userFromToken, courseController.addFeedback.bind(courseController))
router.get('/feedback/:courseId', courseMiddlewares.userFromToken, courseController.getFeedbacks.bind(courseController))

module.exports = router
 */

const express = require('express')
const router = express.Router()
const CourseController = require('../Controller/courseController')
const courseMiddlewares = require('../middlewares/courseMiddlewares')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'video/mp4']
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, PPT, and MP4 are allowed.'))
    }
  }
})

const courseController = new CourseController()
const multiUpload = upload.fields([{ name: 'files' }, { name: 'introVideo', maxCount: 1 }])

router.post('/new', courseMiddlewares.userFromToken, multiUpload, courseController.addNewCourse.bind(courseController))
router.get('/get/:courseId', courseMiddlewares.userFromToken, courseController.findCourseById.bind(courseController))
router.get('/getallforuser', courseMiddlewares.userFromToken, courseController.getCourses.bind(courseController))
router.get('/getCourseuser', courseMiddlewares.userFromToken, courseController.getCourseuser.bind(courseController))
router.get('/getCourseuser', courseMiddlewares.userFromToken, courseController.getCourseuser.bind(courseController))
router.get('/getownerusername/:courseId', courseMiddlewares.userFromToken, courseController.getFirstMemberUsername.bind(courseController))
router.post('/join/:courseId', courseMiddlewares.userFromToken, courseController.joinCourse)

router.get('/joined-courses', courseMiddlewares.userFromToken, courseController.getJoinedCoursesForUser.bind(courseController))
router.post('/upload/:courseId', upload.array('files'), courseController.uploadMaterial.bind(courseController))
router.get('/getFilesFromCourse/:courseId', courseMiddlewares.userFromToken, courseController.getFilesFromCourse.bind(courseController))
router.get('/random6Courses', courseMiddlewares.userFromToken, courseController.getRandomCourses.bind(courseController))
router.put('/complete/:courseId', courseController.markCourseStatus.bind(courseController))
router.post('/feedback/:courseId', courseMiddlewares.userFromToken, courseController.addFeedback.bind(courseController))
router.get('/feedback/:courseId', courseMiddlewares.userFromToken, courseController.getFeedbacks.bind(courseController))

module.exports = router
