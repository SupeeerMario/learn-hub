const CommunityService = require('../Service/communityService')
const { bucket } = require('../Config/firebaseeconfig')
const admin = require('firebase-admin')

class CommunityController {
  constructor () {
    this.communityService = new CommunityService()
  }

  async addNewCommunity (req, res) {
    try {
      const userId = req.mongouserId
      const memberusername = req.username
      const userEmail = req.useremail
      const userProfilePic = req.userProfilePic
      console.log(`userId: ${userId}`)
      console.log(`username: ${memberusername}`)
      const community = {
        ownerID: userId,
        name: req.body.name,
        members: [{
          username: memberusername,
          _id: userId,
          email: userEmail,
          profilepic: userProfilePic

        }],
        privacy: req.body.privacy,
        about: req.body.about

      }
      console.log(`community data: ${JSON.stringify(community)}`)
      const result = await this.communityService.newCommunity(community, memberusername)
      console.log(`ownerID : ${community.ownerID}`)
      res.json(result)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async findCommunityById (req, res) {
    try {
      const userId = req.mongouserId
      const communityId = req.params.communityId
      console.log(`Community ID: ${communityId}`)

      const community = await this.communityService.getCommunityById(communityId)
      console.log('Fetched Community:', community)

      res.json({
        community,
        userRole: req.userRole,
        userId
      })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async joinCommunity (req, res) {
    try {
      const communityId = req.params.communityId
      const userId = req.mongouserId
      const username = req.username
      const userEmail = req.useremail
      const userProfilePic = req.userProfilePic || '' // Default to an empty string if not provided

      // Debugging logs
      console.log('Community ID:', communityId)
      console.log('User ID:', userId)
      console.log('Username:', username)
      console.log('User Email:', userEmail)
      console.log('User Profile Pic:', userProfilePic)

      if (!username || !userEmail) {
        return res.status(400).json({ error: 'Missing required user information' })
      }

      const updatedCommunity = await this.communityService.joinCommunity(communityId, userId, username, userEmail, userProfilePic)

      res.json({ ...updatedCommunity })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getAllForUser (req, res) {
    try {
      const userId = req.mongouserId
      const communities = await this.communityService.getAllCommunitiesforuser(userId)

      res.json({ communities })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async allMemberForCommunity (req, res) {
    try {
      const communityId = req.params.communityId
      const userRole = req.userRole
      const communityMembers = await this.communityService.allMemberForCommunity(communityId)
      console.log(`communityMembers::::${communityMembers}`)
      res.json({ communityMembers, userRole })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async getTenCommunities (req, res) {
    try {
      const userId = req.mongouserId
      const { excludeIds } = req.query
      const excludeIdsArray = excludeIds ? excludeIds.split(',') : []
      const communities = await this.communityService.getTenCommunities(userId, excludeIdsArray)
      console.log('Random communities', communities)
      res.json({ communities })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async uploadFile (req, res) {
    try {
      const file = req.file
      const userId = req.mongouserId
      const communityId = req.params.communityId
      const { title, description, category } = req.body

      if (!file) {
        console.error('No file uploaded')
        return res.status(400).json({ error: 'No file uploaded.' })
      }

      console.log('File details:', { file, userId, communityId, title, description, category })

      const fileDetails = { title, description, category }

      // Process the file and upload to Firebase Storage
      const blob = bucket.file(Date.now() + '_' + file.originalname)
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      })

      blobStream.on('error', (error) => {
        console.error('Blob stream error:', error)
        res.status(500).json({ error: 'Blob stream error' })
      })

      blobStream.on('finish', async () => {
        try {
          // Make the file public
          await blob.makePublic()
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
          fileDetails.fileUrl = publicUrl // Add the public URL to the file details
          console.log('File uploaded to:', publicUrl)

          // Call the service to save the file details to the community
          const result = await this.communityService.uploadFile(communityId, userId, fileDetails)

          res.json(result)
        } catch (error) {
          console.error('Error making file public:', error)
          res.status(500).json({ error: 'Error making file public' })
        }
      })

      // Write the file buffer to the blob stream
      blobStream.end(file.buffer)
    } catch (error) {
      console.error('Error in uploadFile controller:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getFilesFromCommunity (req, res) {
    try {
      const communityID = req.params.communityId
      const files = await this.communityService.getFilesFromCommunity(communityID)

      res.json(files)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async createPost (req, res) {
    try {
      const { title, description, category, username, imageUrl } = req.body // Correctly extract imageUrl from req.body
      const { communityId } = req.params

      console.log(title)
      console.log(description)
      console.log(category)
      console.log(imageUrl)
      console.log(username)

      if (!title || !description || !category || !imageUrl || !username) { // Correct the condition to check for missing fields
        console.log('please enter all fields')
        return res.status(400).json({ error: 'Please enter all fields' })
      }

      const community = await this.communityService.getCommunityById(communityId)
      if (!community) {
        return res.status(404).json({ error: 'Community not found' })
      }

      const newPost = await this.communityService.createPost(title, description, category, imageUrl, username, communityId)
      console.log(`New Post: ${newPost}`)
      res.status(201).json(newPost)
    } catch (error) {
      console.error('Error creating post:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getAllPostsForCommunity (req, res) {
    try {
      const { communityId } = req.params

      const posts = await this.communityService.getAllPostsForCommunity(communityId)
      res.json(posts)
    } catch (error) {
      console.error('Error fetching posts for community:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

/*   async getPostById (req, res) {
    try {
      const postId = req.params.id
      const post = await this.communityService.getPostById(postId)
      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }
      res.json(post)
    } catch (error) {
      console.error('Error fetching post by ID:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async updatePost (req, res) {
    try {
      const postId = req.params.id
      const { title, content } = req.body
      const updatedPost = await this.communityService.updatePost(postId, title, content)
      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found' })
      }
      res.json(updatedPost)
    } catch (error) {
      console.error('Error updating post:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async deletePost (req, res) {
    try {
      const postId = req.params.id
      const deleted = await this.communityService.deletePost(postId)
      if (!deleted) {
        return res.status(404).json({ error: 'Post not found' })
      }
      res.status(204).end()
    } catch (error) {
      console.error('Error deleting post:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  } */
}

module.exports = CommunityController
