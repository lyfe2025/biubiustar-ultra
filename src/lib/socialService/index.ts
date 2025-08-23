import { supabase } from '../supabase'
import { PostService } from './posts'
import { LikeService } from './likes'
import { CommentService } from './comments'
import { FollowService } from './follows'
import { UserService } from './users'
import type { Post, Comment, User } from './types'

class SocialService {
  private postService: PostService
  private likeService: LikeService
  private commentService: CommentService
  private followService: FollowService
  private userService: UserService

  // 帖子相关方法
  getPosts!: (page?: number, limit?: number, category?: string) => Promise<Post[]>
  getPostsWithPagination!: (page?: number, limit?: number, category?: string) => Promise<{ posts: Post[]; total: number }>
  getPopularPosts!: (limit?: number) => Promise<Post[]>
  getPost!: (id: string) => Promise<Post | null>
  createPost!: (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'status'>) => Promise<Post>
  deletePost!: (postId: string) => Promise<void>
  sharePost!: (postId: string) => Promise<void>
  getTrendingPosts!: (limit?: number) => Promise<Post[]>
  getTrendingPostsPaginated!: (page?: number, limit?: number, category?: string, search?: string) => Promise<{ posts: Post[]; total: number; hasMore: boolean }>
  getUserPosts!: (userId: string, page?: number, limit?: number) => Promise<{ posts: Post[]; total: number }>

  // 点赞相关方法
  likePost!: (postId: string, userId: string) => Promise<void>
  isPostLiked!: (postId: string, userId: string) => Promise<boolean>
  unlikePost!: (postId: string, userId: string) => Promise<void>
  getPostLikesCount!: (postId: string) => Promise<number>

  // 评论相关方法
  getPostComments!: (postId: string) => Promise<Comment[]>
  addComment!: (comment: { post_id: string; user_id: string; content: string }) => Promise<Comment>
  deleteComment!: (commentId: string, userId: string) => Promise<void>
  getPostCommentsCount!: (postId: string) => Promise<number>

  // 关注相关方法
  followUser!: (followerId: string, followingId: string) => Promise<void>
  unfollowUser!: (followerId: string, followingId: string) => Promise<void>
  isUserFollowed!: (followerId: string, followingId: string) => Promise<boolean>
  isFollowing!: (followerId: string, followingId: string) => Promise<boolean>
  getUserFollowingCount!: (userId: string) => Promise<number>
  getUserFollowersCount!: (userId: string) => Promise<number>
  getUserFollowing!: (userId: string) => Promise<unknown[]>
  getUserFollowers!: (userId: string) => Promise<unknown[]>
  getFollowers!: (userId: string) => Promise<User[]>
  getFollowing!: (userId: string) => Promise<User[]>

  // 用户相关方法
  updateUserProfile!: (userId: string, profile: { username?: string; full_name?: string; bio?: string; avatar_url?: string }) => Promise<User>
  getUserStats!: (userId: string) => Promise<{ postsCount: number; followersCount: number; followingCount: number }>
  getUserProfile!: (userId: string) => Promise<User | null>
  getContentCategories!: (language?: string) => Promise<any[]>

  constructor() {
    this.postService = new PostService()
    this.likeService = new LikeService()
    this.commentService = new CommentService()
    this.followService = new FollowService()
    this.userService = new UserService()

    // 在构造函数中绑定方法
    this.getPosts = this.postService.getPosts.bind(this.postService)
    this.getPostsWithPagination = this.postService.getPostsWithPagination.bind(this.postService)
    this.getPopularPosts = this.postService.getPopularPosts.bind(this.postService)
    this.getPost = this.postService.getPost.bind(this.postService)
    this.createPost = this.postService.createPost.bind(this.postService)
    this.deletePost = this.postService.deletePost.bind(this.postService)
    this.sharePost = this.postService.sharePost.bind(this.postService)
    this.getTrendingPosts = this.postService.getTrendingPosts.bind(this.postService)
    this.getTrendingPostsPaginated = this.postService.getTrendingPostsPaginated.bind(this.postService)
    this.getUserPosts = this.postService.getUserPosts.bind(this.postService)

    // 点赞相关方法
    this.likePost = this.likeService.likePost.bind(this.likeService)
    this.isPostLiked = this.likeService.isPostLiked.bind(this.likeService)
    this.unlikePost = this.likeService.unlikePost.bind(this.likeService)
    this.getPostLikesCount = this.likeService.getPostLikesCount.bind(this.likeService)

    // 评论相关方法
    this.getPostComments = this.commentService.getPostComments.bind(this.commentService)
    this.addComment = this.commentService.addComment.bind(this.commentService)
    this.deleteComment = this.commentService.deleteComment.bind(this.commentService)
    this.getPostCommentsCount = this.commentService.getPostCommentsCount.bind(this.commentService)

    // 关注相关方法
    this.followUser = this.followService.followUser.bind(this.followService)
    this.unfollowUser = this.followService.unfollowUser.bind(this.followService)
    this.isUserFollowed = this.followService.isUserFollowed.bind(this.followService)
    this.isFollowing = this.followService.isFollowing.bind(this.followService)
    this.getUserFollowingCount = this.followService.getUserFollowingCount.bind(this.followService)
    this.getUserFollowersCount = this.followService.getUserFollowersCount.bind(this.followService)
    this.getUserFollowing = this.followService.getUserFollowing.bind(this.followService)
    this.getUserFollowers = this.followService.getUserFollowers.bind(this.followService)
    this.getFollowers = this.followService.getFollowers.bind(this.followService)
    this.getFollowing = this.followService.getFollowing.bind(this.followService)

    // 用户相关方法
    this.updateUserProfile = this.userService.updateUserProfile.bind(this.userService)
    this.getUserStats = this.userService.getUserStats.bind(this.userService)
    this.getUserProfile = this.userService.getUserProfile.bind(this.userService)
    this.getContentCategories = this.userService.getContentCategories.bind(this.userService)
  }

  // 添加缺失的方法
  async toggleLike(postId: string, userId: string): Promise<void> {
    // 首先检查是否已经点赞
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingLike) {
      // 如果已经点赞，则取消点赞
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id)
      
      if (error) throw error
    } else {
      // 如果没有点赞，则添加点赞
      const { error } = await supabase
        .from('likes')
        .insert([{
          post_id: postId,
          user_id: userId
        }])
      
      if (error) throw error
    }
  }
}

export const socialService = new SocialService()
export default socialService
