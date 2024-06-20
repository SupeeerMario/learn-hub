const express = require('express')
const router = express.Router()
const authMiddlewares = require('../middlewares/authMiddlewares')
const AuthController = require('../Controller/authController')
const authController = new AuthController()
const upload = require('../middlewares/multer')
const parser = require('../Config/multerConfig')

router.post('/register', parser.single('cvFile'), authController.register.bind(authController))
router.post('/login', authController.login.bind(authController))
router.put('/editUser', authMiddlewares.isAuthenticated, parser.single('profileImage'), authController.updateUser.bind(authController))

router.get('/setcookie', authController.setcookie.bind(authController))
router.post('/uploadphoto', upload.single('image'), authMiddlewares.isAuthenticated, authController.uploadphoto.bind(authController))
router.post('/logout', authController.logout.bind(authController))

router.post('/approveInstructor/:instructorId', authMiddlewares.isAdmin, authController.approveInstructor.bind(authController))
router.post('/declineInstructor/:instructorId', authMiddlewares.isAdmin, authController.declineInstructor.bind(authController))
router.get('/pendingInstructors', authMiddlewares.isAdmin, authController.getPendingInstructors.bind(authController))

// Admin-specific routes
router.post('/createAdmin', authController.createAdmin.bind(authController))
router.post('/adminLogin', authController.adminLogin.bind(authController))

router.get('/profile', authMiddlewares.isAuthenticated, authController.getProfile.bind(authController))
router.get('/all', authController.getAll.bind(authController))
router.post('/addFriend', authMiddlewares.isAuthenticated, authController.addFriend.bind(authController))
router.get('/getFriendList', authMiddlewares.isAuthenticated, authController.getFriendList.bind(authController))
router.post('/getUserRole', authMiddlewares.isAuthenticated, authController.getUserRole)

module.exports = router
