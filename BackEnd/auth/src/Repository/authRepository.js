const { User } = require('../models/user')
const { Admin } = require('../models/user')

class AuthRepository {
  async createUser (userData) {
    const newUser = await User.create(userData)
    return newUser.toObject()
  }

  async findUserById (_id) {
    try {
      const user = await User.findById(_id).lean()
      return user
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`)
    }
  }

  async findUserByEmail (email) {
    try {
      console.log(email)

      const user = await User.findOne({ email }, { _id: 1, username: 1, profilepic: 1, role: 1, status: 1 }).lean()
      return user
    } catch (error) {
      console.error('Error finding user by email:', error)
      throw error
    }
  }

  async findUserByUsername (username) {
    const user = await User.findOne({ username }).lean()
    return user
  }

  async updateOne (filter, update) {
    try {
      const result = await User.updateOne(filter, update)
      return result
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }
  }

  async getAllUsers () {
    try {
      const users = await User.find().lean()
      return users
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }
  }

  async addFriend (userID, friendID) {
    try {
      const user = await User.findById(userID)
      const friend = await User.findById(friendID)
      if (!user) {
        throw new Error('User not found')
      }
      if (!friend) {
        throw new Error('friend not found')
      }

      if (user.friends.includes(friendID)) {
        throw new Error('Friend already added')
      }

      user.friends.push(friendID)
      friend.friends.push(userID)

      await user.save()
      await friend.save()

      return user
    } catch (error) {
      throw new Error(`Failed to Add Friend: ${error.message}`)
    }
  }

  async getFriendList (friendIds) {
    try {
      const friends = await User.find({ _id: { $in: friendIds } })
      return friends
    } catch (error) {
      throw new Error(`Failed to Get Friends: ${error.message}`)
    }
  }

  async updateUser (userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true })
  }

  async updateUserStatus (userId, status) {
    return await User.findByIdAndUpdate(userId, { status }, { new: true })
  }

  async removeUserById (userId) {
    try {
      const user = await User.findByIdAndDelete(userId)
      return user
    } catch (error) {
      console.error('Error removing user by ID:', error)
      throw error
    }
  }

  async findPendingInstructors () {
    return await User.find({ role: 'instructor', status: 'pending' }, 'id cv')
  }

  async createAdminUser (adminData) {
    try {
      const newAdmin = await Admin.create(adminData)
      return newAdmin.toObject()
    } catch (error) {
      console.error('Error creating admin user:', error)
      throw error
    }
  }

  async findAdminByEmail (email) {
    try {
      const admin = await Admin.findOne({ email }).lean()
      return admin
    } catch (error) {
      console.error('Error finding admin by email:', error)
      throw error
    }
  }

  async findAdminByUsername (username) {
    try {
      const admin = await Admin.findOne({ username }).lean()
      return admin
    } catch (error) {
      console.error('Error finding admin by username:', error)
      throw error
    }
  }
}

module.exports = AuthRepository
