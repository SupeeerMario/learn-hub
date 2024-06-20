const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, required: false, default: '' },
    firstname: { type: String, required: false, unique: false },
    lastname: { type: String, required: false, unique: false },
    profilepic: { type: String, required: false, unique: false, default: '' },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    role: { type: String, required: true, enum: ['student', 'instructor'], default: 'user' },
    cv: { type: String, required: false, unique: false, default: '' },
    status: { type: String, required: true, enum: ['pending', 'approved', 'declined'], default: 'pending' }

  },
  { timestamps: true }
)

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'admin' }

  }
)

UserSchema.pre('save', function (next) {
  if (this.role !== 'instructor') {
    this.cv = undefined // Removes the cv attribute if the role is not 'instructor'
  }
  next()
})
const User = mongoose.model('User', UserSchema)
const Admin = mongoose.model('Admin', AdminSchema)

/* mongoose.connection.on('connected', async () => {
  try {
    await mongoose.connection.db.dropCollection('users') // Replace 'users' with the actual name of your collection
    console.log('User collection dropped.')
  } catch (error) {
    if (error.code === 26) {
      console.log('User collection does not exist.')
    } else {
      console.error('Error dropping User collection:', error)
    }
  }
}) */
module.exports = { User, Admin }
