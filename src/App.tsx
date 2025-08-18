import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Trending from './pages/Trending'
import Activities from './pages/Activities'
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
import AdminAuthGuard from './components/AdminAuthGuard'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/language'
import { Toaster } from 'sonner'
import { useFavicon } from './hooks/useFavicon'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  useFavicon() // 使网站图标响应系统设置

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {!isAdminRoute && <Navbar />}
        <ErrorBoundary>
          <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/profile" element={<Profile />} />
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
