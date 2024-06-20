const { admin } = require('../Config/firebaseeconfig')
const jwt = require('jsonwebtoken')

async function isAuthenticated (req, res, next) {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ error: 'Token is missing' })
  }

  try {
    console.log('Verifying Firebase ID token...')
    const decodedToken = await admin.auth().verifyIdToken(token)
    console.log(decodedToken)

    if (decodedToken.mongoUserID) {
      console.log('MongoDB user ID found in token:', decodedToken.mongoUserID)
    }

    const userId = decodedToken.uid
    const mongouserId = decodedToken.mongoUserID
    const username = decodedToken.mongoUserName
    const email = decodedToken.email
    const profilepic = decodedToken.profilepic
    const role = decodedToken.role
    req.userId = userId
    req.mongouserId = mongouserId
    req.username = username
    req.email = email
    req.userProfilePic = profilepic
    req.userrole = role

    next()
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error)
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Firebase ID token has expired. Please login again.' })
    } else if (error.code === 'auth/argument-error') {
      return res.status(401).json({ error: 'Firebase ID token is malformed or invalid.' })
    } else {
      return res.status(403).json({ error: 'Failed to verify Firebase ID token.' })
    }
  }
}


module.exports = { isAuthenticated }
