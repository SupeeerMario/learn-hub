const CommunityService = require('../Service/communityService')
const { uploadFile } = require('../Config/firebaseeconfig')
const admin = require('firebase-admin')
const { User } = require('../../../auth/src/models/user')

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
      const userProfilePic = req.userProfilePic
      console.log('userProfilePifghfghfgc', userProfilePic)

      const updatedCommunity = await this.communityService.joinCommunity(communityId, userId, username, userEmail, userProfilePic)
      console.log(`Updated Community: ${JSON.stringify(updatedCommunity)}`)
      await User.findByIdAndUpdate(userId, { $addToSet: { joinedCommunities: communityId } })

      res.json({ ...updatedCommunity }) // Send isOwner as part of the response
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
      const communities = await this.communityService.getTenCommunities(userId)
      console.log('Randomcommunities', communities)
      res.json(communities)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }

  async uploadFile (req, res) {
    try {
      const file = req.file
      const userId = req.mongouserId
      const communityId = req.params.communityId

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' })
      }

      const result = await this.communityService.uploadFile(communityId, userId, file)

      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async createPost (req, res) {
    try {
      const { title, content } = req.body
      const { communityId } = req.params

      const community = await this.communityService.getCommunityById(communityId)
      if (!community) {
        return res.status(404).json({ error: 'Community not found' })
      }

      const newPost = await this.communityService.createPost(title, content, communityId)
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
