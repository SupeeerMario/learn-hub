const bcrypt = require('bcrypt')
const joi = require('joi')
const AuthRepository = require('../Repository/authRepository')
const AuthMiddlewares = require('../middlewares/authMiddlewares')
const { firebaseApp } = require('../Config/firebaseeconfig')
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')
const jwt = require('jsonwebtoken')
/* const { sendMail } = require('../Config/nodemailer')
 */
class AuthService {
  constructor () {
    this.authRepository = new AuthRepository()
  }

  validateUserData (data) {
    const schema = joi.object({
      username: joi.string().required().label('UserName'),
      firstname: joi.string().label('First Name'),
      lastname: joi.string().label('Last Name'),
      email: joi.string().email().required().label('Email'),
      password: joi.string().required().label('Password'),
      profilepic: joi.string().label('Profilepic'),
      role: joi.string().valid('student', 'instructor').required().label('User Role'),
      cv: joi.string().when('role', {
        is: 'instructor',
        then: joi.required().label('CV'),
        otherwise: joi.optional()
      }).label('CV')
    })

    return schema.validate(data)
  }

  async registerUser (userData) {
    try {
      const { error } = this.validateUserData(userData)
      if (error) {
        throw new Error(error.details[0].message)
      }

      if (userData.role === 'instructor') {
        userData.status = 'pending'
      } else {
        userData.status = 'approved'
      }

      const salt = await bcrypt.genSalt(Number(process.env.SALT))
      const hashPassword = await bcrypt.hash(userData.password, salt)

      const newUser = await this.authRepository.createUser({
        ...userData,
        password: hashPassword
      })

      return { message: 'User created successfully', user: newUser }
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`)
    }
  }

  async existingUserEmail (email) {
    const user = await this.authRepository.findUserByEmail(email)
    return !!user
  }

  async existingUserName (username) {
    const user = await this.authRepository.findUserByUsername(username)
    return !!user
  }

  async loginUser (email, password) {
    try {
      const user = await this.authRepository.findUserByEmail(email)
      if (!user) {
        console.log('Email:', email)
        throw new Error('Invalid Email')
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        console.log('Entered Password:', password)
        console.log('Hashed Password from DB:', user.password)
        throw new Error('Invalid Password')
      }

      // Firebase token assignment is handled in the controller, no need to return token here
      return { message: 'Login successful', success: true }
    } catch (error) {
      console.error(`Login failed: ${error.message}`)
      return { message: 'Login not successful', success: false }
    }
  }

  async getUserById (_id) {
    try {
      const user = await this.authRepository.findUserById(_id)
      return user
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`)
    }
  }

  async updateOne (filter, update) {
    return this.authRepository.updateOne(filter, update)
  }

  async getAllUsers () {
    try {
      const users = await this.authRepository.getAllUsers()
      return users
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }
  }

  async addFriend (userID, friendID) {
    try {
      if (userID === friendID) {
        throw new Error('You cannot add yourself as a friend.')
      }
      const user = await this.authRepository.addFriend(userID, friendID)
      return { message: 'Friend added !!', user }
    } catch (error) {
      throw new Error(`Failed to Add Friend: ${error.message}`)
    }
  }

  async getFriendList (userId) {
    try {
      const user = await this.authRepository.findUserById(userId)
      if (!user) {
        throw new Error('User not found')
      }
      const friends = await this.authRepository.getFriendList(user.friends)
      return friends
    } catch (error) {
      throw new Error(`Failed to Get Friend List: ${error.message}`)
    }
  }

  async getMongoUserFromEmail (email) {
    try {
      const user = await this.authRepository.findUserByEmail(email)

      if (user) {
        return user
      } else {
        throw new Error('User not found')
      }
    } catch (error) {
      console.error('Error fetching MongoDB user ID by email:', error)
      throw new Error('Error fetching MongoDB user ID by email')
    }
  }

  async updateUser (userId, updateData) {
    const user = await this.authRepository.updateUser(userId, updateData)
    if (!user) {
      throw new Error('Failed to update user')
    }
    return user
  }

  async approveInstructor (instructorId) {
    const user = await this.authRepository.findUserById(instructorId)
    if (!user) {
      throw new Error('Instructor not found')
    }

    if (user.role !== 'instructor') {
      throw new Error('User is not an instructor')
    }

    const updatedUser = await this.authRepository.updateUserStatus(instructorId, 'approved')
    /*     const approvalSubject = 'Your Instructor Account Has Been Approved!'
    const approvalText = `
    Dear ${user.username},

    We are pleased to inform you that your instructor account on LearnHub has been approved! You can now log in and start sharing your knowledge with our community.

    Thank you for your patience during the review process.

    Best regards,
    The LearnHub Team
    `

    await sendMail(user.email, approvalSubject, approvalText) */
    return updatedUser
  }

  async declineInstructor (instructorId) {
    const user = await this.authRepository.findUserById(instructorId)
    if (!user) {
      throw new Error('Instructor not found')
    }

    if (user.role === 'instructor') {
      await this.authRepository.removeUserById(instructorId)
      /*       const declineSubject = 'Your Instructor Account Application'
      const declineText = `
        Dear ${user.username},

        We regret to inform you that your application for an instructor account on LearnHub has been declined. Unfortunately, we are unable to proceed with your account at this time.

        If you have any questions or require further information, please feel free to contact us.

        Best regards,
        The LearnHub Team
      `

      await sendMail(user.email, declineSubject, declineText) */
      return { message: 'Instructor removed' }
    } else {
      const updatedUser = await this.authRepository.updateUserStatus(instructorId, 'declined')
      return updatedUser
    }
  }

  async getPendingInstructors () {
    return await this.authRepository.findPendingInstructors()
  }

  async createAdmin (username, email, password) {
    const existingUserEmail = await this.authRepository.findAdminByEmail(email)
    const existingUserName = await this.authRepository.findAdminByUsername(username)

    if (existingUserEmail) {
      throw new Error('Email already taken')
    }

    if (existingUserName) {
      throw new Error('Username already taken')
    }

    const auth = getAuth(firebaseApp)
    await createUserWithEmailAndPassword(auth, email, password)

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'approved'
    }

    const savedUser = await this.authRepository.createAdminUser(newUser)

    return { message: 'Admin created successfully', savedUser }
  }

  async adminLogin (email, password) {
    const user = await this.authRepository.findAdminByEmail(email)
    console.log('Admin user:', user)

    if (!user) {
      throw new Error('User not found')
    }

    if (user.role !== 'admin') {
      throw new Error('Not authorized')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      throw new Error('Invalid credentials')
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, // Include role in the token payload
      process.env.JWT_SECRET,
      { expiresIn: '1h', algorithm: 'HS256' } // Specify the algorithm
    )

    return { message: 'Login successful', token }
  }

  async getUserRoleByEmail (email) {
    try {
      const user = await this.authRepository.findUserByEmail(email)
      if (!user) {
        throw new Error('User not found')
      }
      return user.role
    } catch (error) {
      throw new Error(`Failed to get user role: ${error.message}`)
    }
  }
}
module.exports = AuthService
