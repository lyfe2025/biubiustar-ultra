import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Globe, ChevronUp } from 'lucide-react'
import { useLanguage } from '../contexts/language'
import { useAuth } from '../contexts/AuthContext'
import { generateDefaultAvatarUrl, getUserDefaultAvatarUrl } from '../utils/avatarGenerator'
import LanguageSelector from './LanguageSelector'
import { cn } from '../utils/cn'
import { useSiteInfo } from '../hooks/useSettings'

interface NavbarProps {
  onRequireAuth: (type?: 'login' | 'register') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onRequireAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const { user, userProfile, logout } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const { siteName, siteLogo } = useSiteInfo()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // 监听页面滚动
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 10)
      setShowBackToTop(scrollTop > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 监听点击外部区域关闭移动端菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        // 检查点击的是否是菜单按钮本身
        const menuButton = document.querySelector('[data-menu-button]')
        if (menuButton && !menuButton.contains(event.target as Node)) {
          setIsMenuOpen(false)
        }
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const openAuthModal = (type: 'login' | 'register') => {
    onRequireAuth(type)
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const navItems = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.trending', path: '/trending' },
    { key: 'nav.activities', path: '/activities' },
    { key: 'nav.about', path: '/about' },
  ]

  const isActive = (path: string) => location.pathname === path

  // 处理首页导航
  const handleHomeNavigation = () => {
    if (location.pathname === '/') {
      // 如果已经在首页，刷新页面
      window.location.reload()
    } else {
      // 否则导航到首页
      navigate('/')
    }
  }



  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md border-purple-100/50" 
          : "bg-white border-purple-100"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button onClick={handleHomeNavigation} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              {siteLogo ? (
                <img 
                  src={siteLogo} 
                  alt={siteName} 
                  className="w-8 h-8 rounded-lg object-cover"
                  onError={(e) => {
                    // 如果Logo加载失败，显示默认Logo
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center ${siteLogo ? 'hidden' : ''}`}>
                <span className="text-white font-bold text-sm">{siteName?.charAt(0) || 'B'}</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {siteName || 'Biubiustar'}
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                    isActive(item.path)
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  )}
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>

            {/* 语言选择器和用户菜单 */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <LanguageSelector />
              {user ? (
                <>
                  {/* 桌面端用户菜单 */}
                  <div className="hidden md:flex items-center space-x-4">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
                    >
                      <img
                        src={userProfile?.avatar_url
                    ? userProfile.avatar_url
                    : getUserDefaultAvatarUrl(userProfile?.username || user?.email?.split('@')[0] || 'User', userProfile?.avatar_url)
                  }
                        alt={userProfile?.username || 'User'}
                        className="h-6 w-6 rounded-full object-cover border border-white/30"
                      />
                      <span className="text-sm font-medium">{t('nav.profile')}</span>
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                  {/* 移动端用户头像按钮 */}
                  <Link
                    to="/profile"
                    className="md:hidden p-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
                  >
                    <img
                      src={userProfile?.avatar_url
                    ? userProfile.avatar_url
                    : getUserDefaultAvatarUrl(userProfile?.username || user?.email?.split('@')[0] || 'User', userProfile?.avatar_url)
                  }
                      alt={userProfile?.username || 'User'}
                      className="h-8 w-8 rounded-full object-cover border-2 border-purple-200 hover:border-purple-400 transition-all duration-200"
                    />
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-0 md:space-x-3">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-2 md:px-4 py-2 text-sm md:text-base bg-purple-600 hover:bg-purple-700 text-white rounded-lg md:bg-transparent md:text-gray-700 md:hover:text-purple-600 md:hover:bg-transparent transition-all duration-200"
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="hidden md:block px-2 md:px-4 py-2 text-sm md:text-base bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all duration-200"
                  >
                    {t('nav.register')}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                data-menu-button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden" ref={mobileMenuRef}>
              <div className={cn(
                "px-2 pt-2 pb-3 space-y-1 rounded-lg mt-2 border transition-all duration-300 max-w-full overflow-hidden",
                isScrolled 
                  ? "bg-white/90 backdrop-blur-sm border-purple-100/50" 
                  : "bg-white border-purple-100"
              )}>
                {navItems.map((item) => {
                  if (item.path === '/') {
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleHomeNavigation()
                        }}
                        className={cn(
                          'block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis',
                          isActive(item.path)
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                        )}
                      >
                        {t(item.key)}
                      </button>
                    )
                  }
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis',
                        isActive(item.path)
                          ? 'text-purple-600 bg-purple-50'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                      )}
                    >
                      {t(item.key)}
                    </Link>
                  )
                })}
                {/* 移动端语言选择器 */}
                <div className="px-3 py-2">
                  <LanguageSelector />
                </div>
                <div className="pt-2 border-t border-purple-100">
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-700">{t('nav.welcome')}, {user.email}</div>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200 whitespace-nowrap overflow-hidden"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <img
                          src={userProfile?.avatar_url
                    ? userProfile.avatar_url
                    : getUserDefaultAvatarUrl(userProfile?.username || user?.email?.split('@')[0] || 'User', userProfile?.avatar_url)
                  }
                          alt={userProfile?.username || 'User'}
                          className="h-6 w-6 rounded-full object-cover border border-gray-200"
                        />
                        <span>{t('nav.profile')}</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleLogoutClick()
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 w-full text-left whitespace-nowrap overflow-hidden"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          openAuthModal('login')
                          setIsMenuOpen(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {t('nav.login')}
                      </button>
                      <button
                        onClick={() => {
                          openAuthModal('register')
                          setIsMenuOpen(false)
                        }}
                        className="block w-full text-left px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {t('nav.register')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('nav.confirmLogout')}</h3>
            <p className="text-gray-600 mb-6">
              {t('profile.confirmSignOut')}
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-600 ease-out transform hover:scale-110 flex items-center justify-center group ${
          showBackToTop 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="回到顶部"
      >
        <ChevronUp className="w-5 h-5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5" />
      </button>
    </>
  )
}

export default Navbar