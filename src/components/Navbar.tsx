import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Globe } from 'lucide-react'
import { useLanguage } from '../contexts/language'
import { useAuth } from '../contexts/AuthContext'
import { isDefaultAvatar, generateDefaultAvatarUrl, getUserDefaultAvatarUrl } from '../utils/avatarGenerator'
import LanguageSelector from './LanguageSelector'
import { cn } from '../utils/cn'
import { useSiteInfo } from '../hooks/useSettings'

interface NavbarProps {
  onRequireAuth: (type?: 'login' | 'register') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onRequireAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { user, userProfile, logout } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()
  const { siteName, siteLogo } = useSiteInfo()

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

  const navItems = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.trending', path: '/trending' },
    { key: 'nav.activities', path: '/activities' },
    { key: 'nav.about', path: '/about' },
  ]

  const isActive = (path: string) => location.pathname === path



  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
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
            </Link>

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
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
                  >
                    <img
                      src={userProfile?.avatar_url && !isDefaultAvatar(userProfile.avatar_url) 
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
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all duration-200"
                  >
                    {t('nav.register')}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-sm rounded-lg mt-2 border border-purple-100">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
                      isActive(item.path)
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                    )}
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <div className="pt-2 border-t border-purple-100">
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-700">{t('nav.welcome')}, {user.email}</div>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <img
                          src={userProfile?.avatar_url && !isDefaultAvatar(userProfile.avatar_url) 
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
                        className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 w-full text-left"
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
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                      >
                        {t('nav.login')}
                      </button>
                      <button
                        onClick={() => {
                          openAuthModal('register')
                          setIsMenuOpen(false)
                        }}
                        className="block w-full text-left px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200"
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
    </>
  )
}

export default Navbar