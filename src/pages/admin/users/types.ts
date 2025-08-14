// 用户管理相关类型定义
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  full_name?: string
  bio?: string
  location?: string
  website?: string
  followers_count: number
  following_count: number
  posts_count: number
  status: 'active' | 'suspended' | 'banned' | 'pending'
  role: 'user' | 'moderator' | 'admin'
  email_verified: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface NewUserData {
  username: string
  email: string
  password: string
  full_name: string
  role: 'user' | 'moderator' | 'admin'
  status: 'active' | 'suspended' | 'banned' | 'pending'
}

export interface PasswordData {
  newPassword: string
  confirmPassword: string
}

export interface UserFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  selectedRole: string
  setSelectedRole: (role: string) => void
}

export interface UserActionsProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onUpdateStatus: (userId: string, status: User['status']) => void
  onUpdateRole: (userId: string, role: User['role']) => void
  onChangePassword: (user: User) => void
}

export interface UserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (userData: Partial<User>) => void
  onDelete: (user: User) => void
  loading?: boolean
}

export interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: NewUserData) => void
  loading?: boolean
}

export interface PasswordModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (password: string) => void
  loading?: boolean
}
