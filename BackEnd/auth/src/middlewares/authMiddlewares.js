const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const tenYearsInSeconds = 10 * 365 * 24 * 60 * 60

require('dotenv').config()

function tokenassign (user) {
  const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: tenYearsInSeconds })
  return token
}

function isAuthenticated (req, res, next) {
  // Extract the token from the 'token' header
  const token = req.headers.token

  if (!token) {
    console.log('Token not found')
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      console.error('Token verification failed:', err)
      return res.sendStatus(403)
    }

    req.decodedUserId = decodedUser.userId
    next()
  })
}

module.exports = { tokenassign, isAuthenticated, cookieParser }