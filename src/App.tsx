import React, { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import Navbar from './components/Navbar'
import AdminAuthGuard from './components/AdminAuthGuard'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import { ErrorBoundary } from './components/ErrorBoundary'
import AuthModal from './components/AuthModal'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/language'
import { Toaster } from 'sonner'
import { useFavicon } from './hooks/useFavicon'
import { useCacheWarmup } from './hooks/useCacheWarmup'
import './services/performanceMonitor' // 初始化性能监控
import './utils/debugAuth' // 加载调试工具

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'))
const Trending = lazy(() => import('./pages/Trending'))
const Activities = lazy(() => import('./pages/Activities'))
const ActivityDetail = lazy(() => import('./pages/ActivityDetail'))
const PostDetail = lazy(() => import('./pages/PostDetail'))
const About = lazy(() => import('./pages/About'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminContent = lazy(() => import('./pages/admin/AdminContent'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminSecurity = lazy(() => import('./pages/admin/AdminSecurity'))
const AdminSystemPerformance = lazy(() => import('./pages/admin/AdminSystemPerformance'))
const AdminCachePerformance = lazy(() => import('./pages/admin/AdminCachePerformance'))
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'))
const TestCategories = lazy(() => import('./pages/TestCategories'))
const DebugLanguage = lazy(() => import('./pages/DebugLanguage'))
const DebugCategories = lazy(() => import('./pages/DebugCategories'))

// 加载状态组件
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg font-medium">加载中...</p>
      </div>
    </div>
  )
}

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
  const { isInitialized } = useCacheWarmup() // 初始化缓存预热

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
          <Suspense fallback={<LoadingSpinner />}>
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
                  <Route path="/admin/system-performance" element={<AdminAuthGuard><AdminSystemPerformance /></AdminAuthGuard>} />
                  <Route path="/admin/cache-performance" element={<AdminAuthGuard><AdminCachePerformance /></AdminAuthGuard>} />
                  <Route path="/admin/logs" element={<AdminAuthGuard><AdminLogs /></AdminAuthGuard>} />
            </Routes>
          </Suspense>
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
