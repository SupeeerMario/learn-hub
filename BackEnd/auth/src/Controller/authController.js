const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth')
const { firebaseApp } = require('../Config/firebaseeconfig')
const { admin } = require('../Config/firebaseeconfig')
const AuthService = require('../Service/service')
const tenYearsInSeconds = 10 * 365 * 24 * 60 * 60
const cloudinary = require('../Config/cloudinary')

/* const AuthMiddlewares = require('../middlewares/authMiddlewares') */

class AuthController {
  constructor () {
    this.authService = new AuthService()
  }

  /*   async login (req, res) {
    const { email, password } = req.body

    const result = await this.authService.loginUser(email, password)

    if (result.success) {
      res.json({ message: result.message, token: result.token })
    } else {
      res.status(400).json({ message: result.message })
    }

  } */
  /*
  async register (req, res) {
    const user = req.body

    try {
      const existingUserEmail = await this.authService.existingUserEmail(user.email)
      const existingUserName = await this.authService.existingUserName(user.username)

      if (existingUserEmail) {
        throw new Error('Email already taken')
      }

      if (existingUserName) {
        throw new Error('Username already taken')
      }

      const result = await this.authService.registerUser(user)
      res.json(result)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  } */

  async register (req, res) {
    const user = req.body
    const cvFilePath = req.file ? req.file.path : ''

    console.log('Role:', user.role) // Log the role to check its value
    console.log('CV File Path:', cvFilePath) // Log the cvFile path to check its value

    try {
      const existingUserEmail = await this.authService.existingUserEmail(user.email)
      const existingUserName = await this.authService.existingUserName(user.username)

      if (existingUserEmail) {
        throw new Error('Email already taken')
      }

      if (existingUserName) {
        throw new Error('Username already taken')
      }

      const auth = getAuth(firebaseApp)
      const { email, password } = user
      await createUserWithEmailAndPassword(auth, email, password)

      if (user.role === 'instructor') {
        user.cv = cvFilePath
      }

      const result = await this.authService.registerUser(user)
      console.log(`User: ${result}`)
      res.json(result)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async login (req, res) {
    const auth = getAuth()
    const { email, password } = req.body
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUid = userCredential.user.uid

      const mongoUser = await this.authService.getMongoUserFromEmail(email)
      console.log('Retrieved MongoDB user:', mongoUser)

      if (!mongoUser) {
        throw new Error('User not found in MongoDB')
      }

      if (mongoUser.status !== 'approved') {
        return res.status(403).json({ errorCode: 'ACCOUNT_NOT_APPROVED', errorMessage: 'Account is not approved' })
      }

      // Set custom claims
      const customClaims = {
        mongoUserID: mongoUser._id.toString(),
        mongoUserName: mongoUser.username,
        email: mongoUser.email,
        userProfilePic: mongoUser.profilepic,
        userRole: mongoUser.role
      }
      await admin.auth().setCustomUserClaims(firebaseUid, customClaims)

      // Get Firebase token
      const token = await userCredential.user.getIdToken(true)

      res.cookie('token', token, { httpOnly: true })
      res.json({ message: 'Authentication successful', token })
    } catch (error) {
      console.error('Login error:', error)
      res.status(400).json({ errorCode: error.code, errorMessage: error.message })
    }
  }

  async getProfile (req, res) {
    try {
      const userId = req.mongouserId

      const user = await this.authService.getUserById(userId)
      res.json(user)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async getAll (req, res) {
    try {
      const users = await this.authService.getAllUsers()
      res.json(users)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async addFriend (req, res) {
    try {
      const userId = req.mongouserId
      const { friendID } = req.body
      const result = await this.authService.addFriend(userId, friendID)
      res.json(result)
    } catch (err) {
      console.error('Error in addFriend:', err.message)

      res.status(400).json({ message: err.message })
    }
  }

  async getFriendList (req, res) {
    try {
      const userId = req.mongouserId
      const friends = await this.authService.getFriendList(userId)
      res.json(friends)
    } catch (err) {
      console.error('Error in getFriendList:', err.message)
      res.status(400).json({ message: err.message })
    }
  }

  async setcookie (req, res) {
    try {
      const userToken = req.headers.authorization
      res.setHeader('Set-Cookie', `token=${userToken}; Path=/; HttpOnly; Max-Age=${tenYearsInSeconds}`)
      res.send('got a cookie')
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async uploadphoto (req, res) {
    const userId = req.mongouserId
    const user = await this.authService.getUserById(userId)

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.'
      })
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found!'
      })
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path)
      const updateResult = await this.authService.updateOne(
        { _id: userId }, // Correct filter to update the correct user
        { $set: { profilepic: result.secure_url } }
      )

      if (updateResult.nModified === 0) {
        return res.status(400).json({
          success: false,
          message: 'Error while updating profile picture.'
        })
      }

      res.status(200).json({
        success: true,
        message: 'Uploaded successfully!',
        data: result
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        success: false,
        message: 'Error during file upload',
        error: err.message
      })
    }
  }

  async logout (req, res) {
    try {
      res.clearCookie('token', { httpOnly: true })
      res.json({ message: 'Logged Out' })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async updateUser (req, res) {
    try {
      const userId = req.mongouserId
      const updateData = {
        username: req.body.username,
        bio: req.body.bio
      }

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path)
        updateData.profilepic = result.secure_url
      }

      const updatedUser = await this.authService.updateUser(userId, updateData)
      res.json(updatedUser)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.message })
    }
  }

  async approveInstructor (req, res) {
    try {
      const { instructorId } = req.params
      const user = await this.authService.approveInstructor(instructorId)
      if (!user) {
        throw new Error('Instructor not found')
      }
      res.json({ message: 'Instructor approved successfully', user })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async declineInstructor (req, res) {
    try {
      const { instructorId } = req.params
      const user = await this.authService.declineInstructor(instructorId)
      if (!user) {
        throw new Error('Instructor not found')
      }
      res.json({ message: 'Instructor declined successfully', user })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async getPendingInstructors (req, res) {
    try {
      const pendingInstructors = await this.authService.getPendingInstructors()
      res.json(pendingInstructors)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async createAdmin (req, res) {
    const { username, email, password } = req.body

    console.log(username)
    console.log(email)
    console.log(password)

    try {
      const result = await this.authService.createAdmin(username, email, password)
      res.json(result)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async adminLogin (req, res) {
    const { email, password } = req.body

    try {
      const result = await this.authService.adminLogin(email, password)
      res.json(result)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }
}

module.exports = AuthController
