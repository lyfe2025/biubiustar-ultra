import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useLanguage } from '../../contexts/language'
import { usePageTitle } from '../../hooks/usePageTitle'
import { adminService } from '../../services/admin'

const AdminLogin = () => {
  const { t } = useLanguage()
  
  // 设置登录页面标题
  usePageTitle(t('admin.auth.login.title'))
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [securityInfo, setSecurityInfo] = useState({
    attemptsRemaining: 3,
    maxAttempts: 3,
    isLocked: false,
    lockedUntil: null as string | null,
    lastAttemptAt: null as string | null,
    showSecurityWarning: false
  })
  const navigate = useNavigate()

  // 检查IP安全状态
  const checkSecurityStatus = async () => {
    try {
      const data = await adminService.getSecurityStats()
      setSecurityInfo({
          attemptsRemaining: 3,
          maxAttempts: 3,
          isLocked: false,
          lockedUntil: null,
          lastAttemptAt: null,
          showSecurityWarning: false
        })
    } catch (err) {
      console.error('检查安全状态失败:', err)
    }
  }

  // 组件加载时检查安全状态
  useEffect(() => {
    checkSecurityStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 如果IP被锁定，阻止提交
    if (securityInfo.isLocked) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      // 调用真实的管理员登录API
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.username, // 使用邮箱作为用户名
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 存储管理员登录状态和真实token
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminUser', JSON.stringify(data.user))
        navigate('/admin/dashboard')
      } else {
        // 处理不同类型的错误响应
        if (response.status === 429) {
          // 处理429错误（IP限制或尝试次数过多）
          if (data.error === 'IP_ADDRESS_RESTRICTED' || data.message === 'IP_ADDRESS_RESTRICTED') {
            // IP被限制时，设置锁定状态，清除通用错误信息，不显示剩余尝试次数
            setSecurityInfo(prev => ({ 
              ...prev, 
              isLocked: true, 
              showSecurityWarning: false // 确保不显示剩余尝试次数
            }))
            setError('') // 清除错误信息，使用IP限制提示
          } else if (data.error === 'TOO_MANY_LOGIN_ATTEMPTS' || data.message === 'TOO_MANY_LOGIN_ATTEMPTS') {
            // 达到最大尝试次数，设置锁定状态
            setSecurityInfo(prev => ({ 
              ...prev, 
              isLocked: true, 
              attemptsRemaining: 0,
              showSecurityWarning: false // 确保不显示剩余尝试次数
            }))
            setError('') // 清除错误信息，使用IP限制提示
          } else {
            setError(data.error || t('admin.auth.login.loginFailed'))
          }
        } else {
          // 处理其他错误（如401认证失败）
          setError(data.error || t('admin.auth.login.invalidCredentials'))
          
          // 更新安全信息
          if (data.attemptsRemaining !== undefined) {
            setSecurityInfo(prev => ({
              ...prev,
              attemptsRemaining: data.attemptsRemaining,
              maxAttempts: data.maxAttempts || 3,
              // 登录失败后显示剩余尝试次数
              showSecurityWarning: data.attemptsRemaining < (data.maxAttempts || 3),
              isLocked: data.attemptsRemaining === 0
            }))
          }
        }
      }
    } catch (err: any) {
      console.error('管理员登录错误:', err)
      setError(t('admin.auth.login.loginFailed'))
      
      // 登录失败后重新检查安全状态
      await checkSecurityStatus()
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 管理员登录卡片 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('admin.auth.login.title')}</h1>
            <p className="text-purple-100">{t('admin.auth.login.subtitle')}</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 安全警告信息 */}
            {/* 安全警告 - 只在未被锁定时显示剩余尝试次数 */}
            {securityInfo.showSecurityWarning && !securityInfo.isLocked && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-yellow-100 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <div>
                                  {t('admin.auth.login.attemptsRemaining')
                  .replace('{remaining}', securityInfo.attemptsRemaining.toString())
                  .replace('{total}', securityInfo.maxAttempts.toString())}
                </div>
              </div>
            )}

            {/* IP限制提示 - 只在被锁定时显示 */}
            {securityInfo.isLocked && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-100 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <div>
                  <div className="font-medium">{t('admin.auth.login.accountLocked')}</div>
                  {securityInfo.lockedUntil && (
                    <div className="text-xs mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t('admin.auth.login.lockedUntil').replace('{time}', new Date(securityInfo.lockedUntil).toLocaleString())}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 错误提示 - 只在非IP限制错误时显示 */}
            {error && !securityInfo.isLocked && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-100 text-sm">
                {error}
              </div>
            )}

            {/* 邮箱输入 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-purple-100 mb-2">
                {t('admin.auth.login.email')}
              </label>
              <input
                type="email"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder={t('admin.auth.login.emailPlaceholder')}
                required
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-100 mb-2">
                {t('admin.auth.login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  placeholder={t('admin.auth.login.passwordPlaceholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-200 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading || securityInfo.isLocked}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-medium transition-all duration-200',
                loading || securityInfo.isLocked
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  : 'bg-white/20 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400'
              )}
            >
              {securityInfo.isLocked 
                ? t('admin.auth.login.accountLocked')
                : loading 
                  ? t('admin.auth.login.loggingIn') 
                  : t('admin.auth.login.login')
              }
            </button>
          </form>


        </div>

        {/* 返回首页链接 */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-purple-200 hover:text-white transition-colors text-sm"
          >
            ← {t('admin.auth.login.backToHome')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin