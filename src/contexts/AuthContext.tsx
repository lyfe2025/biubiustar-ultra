import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import AuthService, { User } from '../lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (account: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  checkSessionExpiry: () => boolean;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取用户资料
  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await AuthService.getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  // 刷新用户资料
  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  // 用户注册
  const signUp = async (email: string, password: string, username?: string) => {
    try {
      setLoading(true);
      const { user: newUser, session: newSession } = await AuthService.signUp(email, password, username);
      
      if (newUser && newSession) {
        setUser(newUser);
        setSession(newSession);
        // 保存会话信息到localStorage
        localStorage.setItem('supabase.auth.token', JSON.stringify(newSession));
        await fetchUserProfile(newUser.id);
      }
    } finally {
      setLoading(false);
    }
  };

  // 用户登录
  const signIn = async (account: string, password: string) => {
    try {
      setLoading(true);
      const { user: signedInUser, session: newSession } = await AuthService.signIn(account, password);
      
      if (signedInUser && newSession) {
        setUser(signedInUser);
        setSession(newSession);
        // 保存会话信息到localStorage
        localStorage.setItem('supabase.auth.token', JSON.stringify(newSession));
        await fetchUserProfile(signedInUser.id);
      }
    } finally {
      setLoading(false);
    }
  };

  // 检查会话是否过期
  const checkSessionExpiry = () => {
    if (!session || !session.expires_at) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    
    if (now >= expiresAt) {
      // 会话已过期，显示友好提示并登出
      toast.error('登录已过期，请重新登录', {
        duration: 4000,
        position: 'top-center'
      });
      handleExpiredSession();
      return true;
    }
    
    return false;
  };

  // 处理过期会话
  const handleExpiredSession = async () => {
    try {
      setUser(null);
      setUserProfile(null);
      setSession(null);
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Error handling expired session:', error);
    }
  };

  // 用户登出
  const signOut = async () => {
    try {
      setLoading(true);
      
      // 调用AuthService的登出方法（它会处理服务器端登出和本地token清除）
      await AuthService.signOut();
      
      // 重置用户状态
      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      // 确保本地存储被清除（AuthService.signOut已经做了，但这里作为保险）
      localStorage.removeItem('supabase.auth.token');
      
      console.log('用户已成功登出');
    } catch (error) {
      // 即使出现错误，也要确保用户状态被重置
      console.warn('登出过程中出现错误，但用户状态仍会被重置:', error);
      setUser(null);
      setUserProfile(null);
      setSession(null);
      localStorage.removeItem('supabase.auth.token');
    } finally {
      setLoading(false);
    }
  };

  // 重置密码
  const resetPassword = async (email: string) => {
    await AuthService.resetPassword(email);
  };

  // 更新密码
  const updatePassword = async (newPassword: string) => {
    if (!session?.access_token) {
      throw new Error('用户未登录或会话已过期');
    }
    
    await AuthService.updatePassword(newPassword, session.access_token);
  };

  // 更新用户资料
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    const updatedProfile = await AuthService.updateUserProfile(user.id, updates);
    setUserProfile(updatedProfile);
  };

  // 初始化认证状态
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 检查本地存储的会话信息
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            if (sessionData.access_token) {
              const currentUser = await AuthService.getCurrentUser(sessionData.access_token);
              
              if (mounted && currentUser) {
                setUser(currentUser);
                setSession(sessionData);
                try {
                  await fetchUserProfile(currentUser.id);
                } catch (profileError) {
                  console.warn('Error fetching user profile:', profileError);
                }
              }
            }
          } catch (parseError) {
            console.warn('Error parsing stored session:', parseError);
            localStorage.removeItem('supabase.auth.token');
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.warn('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
       mounted = false;
     };
   }, []);
  
   const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    logout: signOut, // logout is an alias for signOut
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    checkSessionExpiry
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;