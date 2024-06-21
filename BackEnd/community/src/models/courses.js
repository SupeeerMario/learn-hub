const mongoose = require('mongoose')

const MemberSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  profilepic: { type: String, default: '' }
})

const FileSchema = new mongoose.Schema({
  file: { type: String, required: true }
})

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  profilepic: { type: String },
  rating: { type: Number, required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const CoursesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    about: { type: String },
    ownerID: { type: String, required: true },
    members: [MemberSchema],
    materials: [FileSchema],
    level: { type: String, required: true },
    language: { type: String, required: true },
    introVideo: { type: String, default: '', required: true },

    completed: { type: Boolean, default: false },
    feedbacks: [FeedbackSchema]

  },
  { timestamps: true }
)

const Courses = mongoose.model('Courses', CoursesSchema)

module.exports = { Courses }
