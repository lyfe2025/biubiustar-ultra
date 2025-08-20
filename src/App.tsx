import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Trending from './pages/Trending'
import Activities from './pages/Activities'
import ActivityDetail from './pages/ActivityDetail'
import PostDetail from './pages/PostDetail'
import About from './pages/About'
import Profile from './pages/Profile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminContent from './pages/admin/AdminContent'
import AdminUsers from './pages/admin/AdminUsers'
import AdminActivities from './pages/admin/AdminActivities'
import AdminCategories from './pages/admin/AdminCategories'
import AdminContacts from './pages/admin/AdminContacts'
import AdminSettings from './pages/admin/AdminSettings'
import AdminSecurity from './pages/admin/AdminSecurity'
import AdminLogs from './pages/admin/AdminLogs'
import TestCategories from './pages/TestCategories'
import DebugLanguage from './pages/DebugLanguage'
import DebugCategories from './pages/DebugCategories'
import AdminAuthGuard from './components/AdminAuthGuard'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import AuthModal from './components/AuthModal'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/language'
import { Toaster } from 'sonner'
import { useFavicon } from './hooks/useFavicon'
import './utils/debugAuth' // 加载调试工具

// 重定向组件：将 /posts/:id 重定向到 /post/:id
function PostRedirect() {
  const { id } = useParams()
  return <Navigate to={`/post/${id}`} replace />
}

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login')
  const [authModalOnLoginSuccess, setAuthModalOnLoginSuccess] = useState<(() => void) | undefined>(undefined)
  useFavicon() // 使网站图标响应系统设置

  const openAuthModal = (type: 'login' | 'register' = 'login', onLoginSuccess?: () => void) => {
    setAuthModalType(type)
    setAuthModalOnLoginSuccess(() => onLoginSuccess)
    setIsAuthModalOpen(true)
  }

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)
    setAuthModalOnLoginSuccess(undefined)
  }

  // 监听全局认证模态框打开事件
  useEffect(() => {
    const handleGlobalAuthModal = (event: CustomEvent) => {
      const { type, onLoginSuccess } = event.detail
      openAuthModal(type, onLoginSuccess)
    }

    window.addEventListener('openAuthModal', handleGlobalAuthModal as EventListener)
    
    return () => {
      window.removeEventListener('openAuthModal', handleGlobalAuthModal as EventListener)
    }
  }, [])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {!isAdminRoute && <Navbar onRequireAuth={openAuthModal} />}
        <ErrorBoundary>
          <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/activities/:id" element={<ActivityDetail />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/posts/:id" element={<PostRedirect />} />
                  <Route path="/test-categories" element={<TestCategories />} />
                  <Route path="/debug-language" element={<DebugLanguage />} />
                  <Route path="/debug-categories" element={<DebugCategories />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/profile" element={
                    <ProtectedRoute onRequireAuth={openAuthModal}>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />
                  <Route path="/admin/content" element={<AdminAuthGuard><AdminContent /></AdminAuthGuard>} />
                  <Route path="/admin/users" element={<AdminAuthGuard><AdminUsers /></AdminAuthGuard>} />
                  <Route path="/admin/activities" element={<AdminAuthGuard><AdminActivities /></AdminAuthGuard>} />
                  <Route path="/admin/categories" element={<AdminAuthGuard><AdminCategories /></AdminAuthGuard>} />
                  <Route path="/admin/contacts" element={<AdminAuthGuard><AdminContacts /></AdminAuthGuard>} />
                  <Route path="/admin/settings" element={<AdminAuthGuard><AdminSettings /></AdminAuthGuard>} />
                  <Route path="/admin/security" element={<AdminAuthGuard><AdminSecurity /></AdminAuthGuard>} />
                  <Route path="/admin/logs" element={<AdminAuthGuard><AdminLogs /></AdminAuthGuard>} />
          </Routes>
        </ErrorBoundary>
        {!isAdminRoute && <Footer />}
        <Toaster position="top-right" richColors />
        
        {/* 全局登录弹窗 */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleAuthModalClose}
          type={authModalType}
          onLoginSuccess={authModalOnLoginSuccess}
        />
      </div>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
