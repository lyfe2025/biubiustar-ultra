import type { MediaFile } from '../../../types'

// 内容管理相关类型定义
export interface Post {
  id: string
  title: string
  content: string
  image_url?: string
  video?: string
  thumbnail?: string
  status: 'pending' | 'published' | 'rejected' | 'draft'
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  created_at: string
  updated_at: string
  user_id: string
  category: string
  tags?: string[]
  media_files?: MediaFile[]
  author?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
}

export interface ContentCategory {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  // 多语言字段
  name_zh?: string
  name_zh_tw?: string
  name_en?: string
  name_vi?: string
  description_zh?: string
  description_zh_tw?: string
  description_en?: string
  description_vi?: string
}

export interface ContentFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  onRefresh: () => void
}

export interface ContentListProps {
  posts: Post[]
  loading: boolean
  onView: (post: Post) => void
  onUpdateStatus: (postId: string, status: Post['status']) => void
  onDelete: (post: Post) => void
}

export interface ContentPreviewProps {
  post: Post | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (status: Post['status']) => void
  onDelete: () => void
}

export interface CategoryManagementProps {
  categories: ContentCategory[]
  loading: boolean
  searchTerm: string
  onSearchChange: (term: string) => void
  onCreate: () => void
  onEdit: (category: ContentCategory) => void
  onDelete: (category: ContentCategory) => void
  onToggleStatus: (category: ContentCategory) => void
}

export interface NewCategoryData {
  name: string
  description: string
  color: string
  icon: string
  sort_order: number
  // 多语言字段
  name_zh?: string
  name_zh_tw?: string
  name_en?: string
  name_vi?: string
  description_zh?: string
  description_zh_tw?: string
  description_en?: string
  description_vi?: string
}
