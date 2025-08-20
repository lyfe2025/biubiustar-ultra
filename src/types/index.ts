export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  status: 'active' | 'suspended' | 'banned' | 'pending';
  role: 'user' | 'moderator' | 'admin';
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  post_id: string;
  file_url: string;
  file_type: 'image' | 'video';
  thumbnail_url?: string;
  display_order: number;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  video?: string;
  thumbnail?: string;
  media_files?: MediaFile[];
  category: string;
  tags?: string[];
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  status: 'pending' | 'published' | 'rejected' | 'draft';
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface Activity {
  id: string
  title: string
  description?: string
  image_url?: string
  category: string
  category_id?: number
  start_date: string
  end_date?: string
  location?: string
  max_participants?: number
  current_participants: number
  created_at: string
  updated_at: string
  user_id: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'published' | 'draft'
  author: {
    id: string
    username: string
    full_name?: string
  }
}