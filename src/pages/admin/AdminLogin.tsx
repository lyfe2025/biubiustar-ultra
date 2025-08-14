import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useLanguage } from '../../contexts/LanguageContext'

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        setError(data.error || t('admin.login.invalidCredentials'))
      }
    } catch (err) {
      console.error('管理员登录错误:', err)
      setError(t('admin.login.loginFailed'))
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
            <h1 className="text-2xl font-bold text-white mb-2">{t('admin.login.title')}</h1>
            <p className="text-purple-100">{t('admin.login.subtitle')}</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-100 text-sm">
                {error}
              </div>
            )}

            {/* 邮箱输入 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-purple-100 mb-2">
                {t('admin.login.email')}
              </label>
              <input
                type="email"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder={t('admin.login.emailPlaceholder')}
                required
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-100 mb-2">
                {t('admin.login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  placeholder={t('admin.login.passwordPlaceholder')}
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
              disabled={loading}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-medium transition-all duration-200',
                loading
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  : 'bg-white/20 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400'
              )}
            >
              {loading ? t('admin.login.loggingIn') : t('admin.login.login')}
            </button>
          </form>


        </div>

        {/* 返回首页链接 */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-purple-200 hover:text-white transition-colors text-sm"
          >
            ← {t('admin.login.backToHome')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin