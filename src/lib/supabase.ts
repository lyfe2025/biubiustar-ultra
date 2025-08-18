import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 认证相关的类型定义
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

// 认证服务类
export class AuthService {
  // API基础URL
  private static readonly API_BASE = '/api/auth';

  // 用户注册
  static async signUp(email: string, password: string, username?: string) {
    try {
      const response = await fetch(`${this.API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          username: username || email.split('@')[0]
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '注册失败');
      }

      return { user: result.data.user, session: result.data.session };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '注册失败');
    }
  }

  // 用户登录
  static async signIn(account: string, password: string) {
    try {
      const response = await fetch(`${this.API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account, password })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '登录失败');
      }

      return { user: result.data.user, session: result.data.session };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '登录失败');
    }
  }

  // 用户登出
  static async signOut() {
    try {
      // 获取存储的token
      const sessionData = localStorage.getItem('supabase.auth.token');
      let token = '';
      
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          token = session.access_token || '';
        } catch (parseError) {
          console.warn('解析session数据失败:', parseError);
        }
      }

      // 如果没有token，直接清除本地数据即可
      if (!token) {
        console.warn('未找到有效的访问令牌，直接清除本地数据');
        localStorage.removeItem('supabase.auth.token');
        return;
      }

      const response = await fetch(`${this.API_BASE}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (!result.success) {
        // 即使服务器端登出失败，我们也应该清除本地token
        console.warn('服务器端登出失败，但会清除本地token:', result.message);
      }
      
      // 无论服务器端登出是否成功，都清除本地存储
      localStorage.removeItem('supabase.auth.token');
      
    } catch (error) {
      // 即使出现错误，也要确保清除本地token
      localStorage.removeItem('supabase.auth.token');
      console.warn('登出过程中出现错误，已清除本地token:', error);
      // 不抛出错误，因为用户体验上我们希望总是能"成功"登出
    }
  }

  // 重置密码
  static async resetPassword(email: string) {
    try {
      const response = await fetch(`${this.API_BASE}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '重置密码失败');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '重置密码失败');
    }
  }

  // 更新密码
  static async updatePassword(newPassword: string, accessToken: string) {
    try {
      const response = await fetch(`${this.API_BASE}/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ newPassword })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '更新密码失败');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '更新密码失败');
    }
  }

  // 获取当前用户
  static async getCurrentUser(accessToken: string) {
    try {
      const response = await fetch(`${this.API_BASE}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '获取用户信息失败');
      }

      return result.data.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '获取用户信息失败');
    }
  }

  // 获取用户资料
  static async getUserProfile(userId: string) {
    try {
      console.log('AuthService: 获取用户资料，用户ID:', userId);
      
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('AuthService: 未找到用户资料，用户ID:', userId);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('AuthService: 成功获取用户资料:', data);
      return data;
    } catch (error) {
      console.error('AuthService: getUserProfile异常:', error);
      throw new Error(error instanceof Error ? error.message : '获取用户资料失败');
    }
  }

  // 更新用户资料
  static async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '更新用户资料失败');
    }
  }
}

export default AuthService;