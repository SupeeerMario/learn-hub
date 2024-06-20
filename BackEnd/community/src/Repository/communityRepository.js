const { Community, Post } = require('../models/community')
const { admin } = require('../Config/firebaseeconfig')
const bucket = admin.storage().bucket()
console.log(`Bucket name: ${bucket.name}`)
const mongoose = require('mongoose')

class CommunityRepository {
  async createCommunity (communityData) {
    try {
      const newCommunity = await Community.create({
        ...communityData,
        members: communityData.members || []
      })
      return newCommunity.toObject()
    } catch (error) {
      throw new Error(`Community creation failed: ${error.message}`)
    }
  }

  async findCommunityById (_id) {
    try {
      const community = await Community.findById(_id).lean().populate('posts')

      console.log(`communityID: ${_id}`)

      return community
    } catch (error) {
      throw new Error(`Failed to fetch communityData: ${error.message}`)
    }
  }

  async joinCommunity (communityId, userId, username, userEmail, userProfilePic) {
    try {
      const community = await Community.findById(communityId)
      if (!community) {
        throw new Error('Community not found')
      }

      // Debugging logs
      console.log('Repository - Community:', community)
      console.log('Repository - User ID:', userId)
      console.log('Repository - Username:', username)
      console.log('Repository - User Email:', userEmail)
      console.log('Repository - User Profile Pic:', userProfilePic)

      const isMember = community.members.some((member) => member._id.toString() === userId)
      if (isMember) {
        throw new Error('User is already a member of this community')
      }

      // Create a new member instance
      const newMember = {
        _id: userId,
        username,
        email: userEmail,
        profilepic: userProfilePic || ''
      }

      // Push the new member instance to the members array
      community.members.push(newMember)

      console.log('Updated Community Members:', community.members) // Log members before saving

      await community.save()

      return community.toObject()
    } catch (error) {
      throw new Error(`Failed to join community: ${error.message}`)
    }
  }

  async allCommunitiesforuser (userId) {
    try {
      const userIdObject = new mongoose.Types.ObjectId(userId)
      const communities = await Community.find({ 'members._id': userIdObject }).lean()
      if (!communities) {
        throw new Error('No Communities Found!!')
      }
      console.log('communities:', communities)
      return communities
    } catch (error) {
      throw new Error(`Failed to fetch communities: ${error.message}`)
    }
  }

  async allMemberForCommunity (_id) {
    try {
      const communityObjectId = new mongoose.Types.ObjectId(_id) // Use 'new' keyword
      const community = await Community.findById(communityObjectId).lean()
      if (!community) {
        throw new Error('Community not found')
      }
      console.log('retrived community', community)
      const members = community.members.map(member => {
        if (member._id && mongoose.Types.ObjectId.isValid(member._id)) {
          const memberID = new mongoose.Types.ObjectId(member._id) // Use 'new' keyword
          const memberUserName = member.username
          return { _id: memberID, username: memberUserName }
        } else {
          throw new Error(`Invalid member ID: ${JSON.stringify(member)}`)
        }
      })

      console.log(`Fetching members with IDs: ${members}`)

      // Fetch only necessary fields
      console.log('membersssssssssssssss', members)
      return members
    } catch (error) {
      console.error(`Failed to fetch community members for community ID ${_id}: ${error.message}`)
      throw new Error(`Failed to fetch community members: ${error.message}`)
    }
  }

  async getTenCommunities (userId, excludeIds = []) {
    try {
      const communities = await Community.aggregate([
        {
          $match: {
            _id: { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) },
            'members._id': { $ne: new mongoose.Types.ObjectId(userId) } // Ensure the user is not a member
          }
        },
        { $sample: { size: 10 } } // Ensures randomness
      ])
      return communities
    } catch (error) {
      throw new Error(`Failed to fetch communities: ${error.message}`)
    }
  }

  async getAdditionalCommunities (seenCommunityIds) {
    try {
      const additionalCommunities = await Community.find({
        _id: { $nin: Array.from(seenCommunityIds) }
      }).limit(10).lean()
      return additionalCommunities
    } catch (error) {
      throw new Error(`Failed to fetch additional communities: ${error.message}`)
    }
  }

  async updateUserRole (_id, isOwner) {
    const updateObject = { isOwner: Boolean(isOwner) }
    const community = await Community.findById(_id, updateObject, { new: true })
    return community
  }

  async uploadFile (communityId, userId, fileDetails) {
    try {
      console.log('Repository - uploadFile:', { communityId, userId, fileDetails })
      const community = await Community.findById(communityId)
      if (!community) {
        console.error('Community not found:', communityId)
        throw new Error('Community not found')
      }

      const newFile = {
        link: fileDetails.fileUrl,
        title: fileDetails.title,
        description: fileDetails.description,
        category: fileDetails.category
      }

      community.files.push(newFile)

      await community.save()

      return { downloadURL: fileDetails.fileUrl }
    } catch (error) {
      console.error('Error in uploadFile repository:', error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }
  }

  async getFilesFromCommunity (communityID) {
    try {
      const community = await Community.findById(communityID)
      if (!community) {
        throw new Error('Community not found')
      }
      return community.files
    } catch (error) {
      throw new Error(`Failed to get files from community: ${error.message}`)
    }
  }

  async createPost (title, description, category, imageUrl, username, communityId) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const newPost = new Post({
        title,
        description,
        category,
        imageUrl,
        username,
        communityId,
        createdAt: Date.now()
      })
      await newPost.save({ session })

      await Community.findByIdAndUpdate(
        communityId,
        { $push: { posts: newPost._id } },
        { session }
      )

      await session.commitTransaction()
      session.endSession()

      return newPost.toObject()
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      console.error('Error creating post:', error)
      throw new Error('Failed to create post')
    }
  }

  async getAllPostsForCommunity (communityId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(communityId)) {
        throw new Error('Invalid community ID')
      }

      const community = await Community.findById(communityId).lean()
      if (!community) {
        throw new Error('Community not found')
      }

      console.log('Community:', community)

      const postIds = community.posts
      console.log('Post IDs:', postIds)

      if (!postIds || postIds.length === 0) {
        return [] // No posts to fetch
      }

      const posts = await Post.find({ _id: { $in: postIds } }).lean()
      console.log('Posts:', posts)

      return posts
    } catch (error) {
      console.error('Error fetching posts for community:', error)
      throw new Error('Failed to fetch posts for community')
    }
  }

/*   async getPostById (id) {
    try {
      const post = Post.find(post => post.id === parseInt(id))
      if (!post) {
        throw new Error('Post not found')
      }
      return post
    } catch (error) {
      console.error(`Error fetching post with ID ${id}:`, error)
      throw new Error(`Failed to fetch post with ID ${id}`)
    }
  }

  async updatePost (postId, title, content) {
    try {
      const post = this.getPostById(postId)
      if (!post) {
        throw new Error('Post not found')
      }
      post.title = title || post.title
      post.content = content || post.content
      return post
    } catch (error) {
      console.error(`Error updating post with ID ${postId}:`, error)
      throw new Error(`Failed to update post with ID ${postId}`)
    }
  }

  async deletePost (postId) {
    try {
      const index = Post.findIndex(post => post.id === parseInt(postId))
      if (index === -1) {
        throw new Error('Post not found')
      }
      Post.splice(index, 1)
      return true
    } catch (error) {
      console.error(`Error deleting post with ID ${postId}:`, error)
      throw new Error(`Failed to delete post with ID ${postId}`)
    }
  } */
}

module.exports = CommunityRepository
