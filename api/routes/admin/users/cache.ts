import { supabaseAdmin } from '../../../lib/supabase'

// 🚀 方案B优化：添加认证用户信息缓存（5分钟有效期）
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    full_name?: string;
    email?: string;
  };
  created_at?: string;
  last_sign_in_at?: string;
  [key: string]: unknown;
}

interface AuthUsersCache {
  data: AuthUser[]
  timestamp: number
  ttl: number // 缓存有效期（毫秒）
}

let authUsersCache: AuthUsersCache | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

// 获取缓存的认证用户数据
export const getCachedAuthUsers = async (): Promise<AuthUser[]> => {
  const now = Date.now()
  
  // 检查缓存是否有效
  if (authUsersCache && (now - authUsersCache.timestamp) < authUsersCache.ttl) {
    console.log(`使用缓存的认证用户数据，缓存中有${authUsersCache.data.length}个用户`)
    return authUsersCache.data
  }
  
  // 缓存无效或不存在，重新获取
  console.log('缓存失效，重新获取认证用户数据...')
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  
  if (authError) {
    console.error('获取认证用户失败:', authError)
    return []
  }
  
  // 更新缓存
  authUsersCache = {
    data: authUsers.users as AuthUser[],
    timestamp: now,
    ttl: CACHE_TTL
  }
  
  console.log(`认证用户数据已缓存，共${authUsers.users.length}个用户，缓存有效期${CACHE_TTL/1000}秒`)
  return authUsers.users as AuthUser[]
}

// 清除认证用户缓存
export const clearAuthUsersCache = () => {
  authUsersCache = null
  console.log('认证用户缓存已清除')
}