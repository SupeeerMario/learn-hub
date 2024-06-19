const dotenv = require('dotenv')
const { admin } = require('../Config/firebaseeconfig')
const { Community, Post } = require('../models/community')

dotenv.config()

async function userFromToken (req, res, next) {
  const token = req.cookies.token
  console.log(`tokenHeader : ${token}`)

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  try {
    /*     const token = tokenHeader.split('Bearer ')[1]
    console.log(`token : ${token}`) */

    const decodedToken = await admin.auth().verifyIdToken(token)
    console.log('Firebase ID token verified successfully:', decodedToken)

    req.userId = decodedToken.uid
    req.mongouserId = decodedToken.mongoUserID
    req.username = decodedToken.mongoUserName
    req.useremail = decodedToken.email
    req.userProfilePic = decodedToken.userProfilePic

    next()
  } catch (error) {
    console.error(`Error while verifying token: ${error}`)
    res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}

async function checkIsOwner (req, res, next) {
  try {
    const { communityId } = req.params
    const userId = req.mongouserId
    const username = req.username

    console.log(`Checking ownership for user ${userId} on community ${communityId}`)

    const community = await Community.findById(communityId).lean()
    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    req.userRole = (community.ownerID.toString() === userId) ? 'Admin' : 'Member'
    console.log(`UserName: ${username}`)
    console.log(`UserRole: ${req.userRole}`)
    next()
  } catch (error) {
    console.error(`Error while checking ownership: ${error}`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

exports.validatePost = (req, res, next) => {
  const { title, content, communityId } = req.body
  if (!title || !content || !communityId) {
    return res.status(400).json({ error: 'Title and content are required' })
  }
  next()
}

exports.checkPostExists = (req, res, next) => {
  const postId = req.params.id
  const post = Post.find(post => post.id === parseInt(postId))
  if (!post) {
    return res.status(404).json({ error: 'Post not found' })
  }
  next()
}

module.exports = { userFromToken, checkIsOwner }
