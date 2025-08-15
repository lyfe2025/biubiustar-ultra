import React, { useState, useEffect, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useLanguage } from '../contexts/language'
import { useTranslation } from '../contexts/language'
import { AdminService } from '../services/AdminService'
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Tag,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronDown,
  Mail
} from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { t, language, setLanguage } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    AdminService.clearAuth()
    navigate('/admin')
  }

  // 设置认证错误回调
  useEffect(() => {
    const handleAuthError = () => {
      // 显示友好提示
      alert(t('admin.tokenExpired'))
      // 跳转到登录页
      navigate('/admin')
    }

    AdminService.setAuthErrorCallback(handleAuthError)

    // 组件卸载时清除回调
    return () => {
      AdminService.clearAuthErrorCallback()
    }
  }, [navigate, t])

  // 定期检查token有效性
  useEffect(() => {
    const checkTokenValidity = () => {
      if (!AdminService.hasValidToken()) {
        handleLogout()
      }
    }

    // 立即检查一次
    checkTokenValidity()

    // 每5分钟检查一次
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const navigation = [
    {
      name: t('admin.dashboard.title'),
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      name: t('admin.content.title'),
      href: '/admin/content',
      icon: FileText
    },
    {
      name: t('admin.users.title'),
      href: '/admin/users',
      icon: Users
    },
    {
      name: t('admin.activities.title'),
      href: '/admin/activities',
      icon: Calendar
    },
    {
      name: t('admin.contacts.title'),
      href: '/admin/contacts',
      icon: Mail
    },
    {
      name: t('admin.settings.title'),
      href: '/admin/settings',
      icon: Settings
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* 移动端菜单遮罩 */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>
      )}

      {/* 统一顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* 左侧：品牌标识和标题 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl backdrop-blur-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {t('admin.title')}
                  </span>
                  <div className="text-xs text-gray-500">{t('admin.console')}</div>
                </div>
              </div>
            </div>

            {/* 中间：桌面端导航菜单 */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const IconComponent = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative",
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25"
                        : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    )}
                  >
                    <IconComponent className={cn(
                      "mr-2 h-4 w-4 transition-all duration-200",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-purple-500"
                    )} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* 右侧：管理员操作 */}
            <div className="flex items-center space-x-4">
              {/* 语言切换 */}
              <div className="relative">
                <button
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    {language === 'zh' ? '简体中文' : language === 'zh-TW' ? '繁體中文' : language === 'en' ? 'English' : 'Tiếng Việt'}
                  </span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>
                
                {/* 语言下拉菜单 */}
                {languageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        setLanguage('zh')
                        setLanguageMenuOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                        language === 'zh' ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"
                      )}
                    >
                      简体中文
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('zh-TW')
                        setLanguageMenuOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                        language === 'zh-TW' ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"
                      )}
                    >
                      繁體中文
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en')
                        setLanguageMenuOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                        language === 'en' ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"
                      )}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('vi')
                        setLanguageMenuOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                        language === 'vi' ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"
                      )}
                    >
                      Tiếng Việt
                    </button>
                  </div>
                )}
              </div>
              
              {/* 分割线 */}
              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
              
              {/* 退出登录 */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('admin.logout')}</span>
              </button>
              
              {/* 返回前台 */}
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                {t('admin.backToFrontend')}
              </Link>

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        <div className={cn(
          "lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const IconComponent = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconComponent className={cn(
                    "mr-3 h-5 w-5 transition-all duration-200",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-purple-500"
                  )} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            {/* 移动端退出登录 */}
            <button
              onClick={() => {
                handleLogout()
                setMobileMenuOpen(false)
              }}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 transition-all duration-200" />
              <span>{t('admin.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 - 占满整个宽度 */}
      <main className="p-6 sm:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout