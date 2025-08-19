import React, { useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, AlertTriangle, LogIn } from 'lucide-react'
import { useLanguage } from '../contexts/language'
import { adminService } from '../services/AdminService'
import AuthGuardState from '../utils/authGuard'

interface AdminAuthGuardProps {
  children: ReactNode
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
  title: string
  message: string
}

// 认证失败提示弹窗组件
const AuthModal: React.FC<AuthModalProps & { t: (key: string) => string }> = ({ isOpen, onClose, onLogin, title, message, t }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 max-w-md w-full mx-4">
        <div className="text-center">
          {/* 图标 */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          {/* 标题 */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          
          {/* 消息 */}
          <p className="text-gray-600 mb-6">{message}</p>
          
          {/* 按钮组 */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t('common.actions.cancel')}
            </button>
            <button
              onClick={onLogin}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('admin.login.title')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 加载状态组件
const AuthLoadingScreen: React.FC<{ t: (key: string) => string }> = ({ t }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl mb-4">
          <Shield className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('admin.auth.verifyingPermissions')}</h2>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

/**
 * 管理后台认证守卫组件
 * 功能：
 * 1. 检查管理员token有效性
 * 2. token过期时显示友好提示弹窗
 * 3. 自动跳转到登录页面
 * 4. 提供统一的认证状态管理
 * 5. 防止循环认证检查
 */
const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authError, setAuthError] = useState<string>('')
  const [isAuthChecked, setIsAuthChecked] = useState(false) // 防止重复检查
  const [isNavigating, setIsNavigating] = useState(false) // 防止重复导航

  // 检查认证状态
  const checkAuth = async () => {
    // 使用全局状态防止重复检查
    if (isAuthChecked || isNavigating || !AuthGuardState.canCheckAuth()) {
      return
    }

    try {
      setIsChecking(true)
      AuthGuardState.startChecking()
      
      // 首先检查本地是否有token
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        throw new Error('未找到管理员认证token')
      }

      // 验证token有效性（通过调用一个需要认证的API）
      await adminService.getStats()
      
      // 如果到这里说明认证成功
      setIsAuthChecked(true)
      setIsChecking(false)
      AuthGuardState.checkSuccess()
    } catch (error) {
      console.error('管理员认证检查失败:', error)
      
      let errorMessage = '认证失败，请重新登录'
      
      if (error instanceof Error) {
        if (error.name === 'AuthenticationError') {
          errorMessage = '认证令牌已失效，请重新登录'
        } else if (error.message.includes('未找到')) {
          errorMessage = '未找到有效的认证信息，请先登录'
        }
      }
      
      setAuthError(errorMessage)
      setShowAuthModal(true)
      setIsChecking(false)
      setIsAuthChecked(true) // 标记已检查，防止循环
      AuthGuardState.checkFailed()
    }
  }

  // 处理重新登录
  const handleLogin = () => {
    if (isNavigating) return // 防止重复导航
    
    setIsNavigating(true)
    setShowAuthModal(false)
    
    // 清除可能存在的无效token
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('supabase.auth.token')
    
    // 重置全局认证状态
    AuthGuardState.reset()
    
    // 延迟导航，确保状态更新
    setTimeout(() => {
      navigate('/admin', { replace: true })
    }, 100)
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    if (isNavigating) return // 防止重复导航
    
    setIsNavigating(true)
    setShowAuthModal(false)
    
    // 清除可能存在的无效token
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('supabase.auth.token')
    
    // 重置全局认证状态
    AuthGuardState.reset()
    
    // 延迟导航，确保状态更新
    setTimeout(() => {
      navigate('/admin', { replace: true })
    }, 100)
  }

  // 组件挂载时检查认证
  useEffect(() => {
    if (!isAuthChecked && !isNavigating) {
      checkAuth()
    }
  }, [isAuthChecked, isNavigating])

  // 如果正在检查认证状态，显示加载界面
  if (isChecking) {
    return <AuthLoadingScreen t={t} />
  }

  // 如果正在导航或认证失败，显示提示弹窗
  if (showAuthModal || isNavigating) {
    return (
      <>
        {/* 背景 */}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100"></div>
        
        {/* 认证失败弹窗 */}
        <AuthModal
          isOpen={showAuthModal && !isNavigating}
          onClose={handleCloseModal}
          onLogin={handleLogin}
          title="认证失败"
          message={authError}
          t={t}
        />
      </>
    )
  }

  // 认证成功，渲染子组件
  return <>{children}</>
}

export default AdminAuthGuard