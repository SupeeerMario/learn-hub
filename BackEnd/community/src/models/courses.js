const mongoose = require('mongoose')

const MemberSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  profilepic: { type: String, default: '' }
})

const FileSchema = new mongoose.Schema({
  file: { type: String, required: true }
})

const CoursesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    about: { type: String },
    ownerID: { type: String, required: true },
    members: [MemberSchema],
    materials: [FileSchema],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    level: { type: String, required: true },
    language: { type: String, required: true },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const Courses = mongoose.model('Courses', CoursesSchema)

module.exports = { Courses }
