import type { Post as PostType, Comment as CommentType, User as UserType } from '../../types'

// 使用导入的类型别名
export type Post = PostType;
export type Comment = CommentType;
export type User = UserType;

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}
