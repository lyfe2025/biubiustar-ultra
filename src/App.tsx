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
import AdminSettings from './pages/admin/AdminSettings'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/language'
import { Toaster } from 'sonner'
import { useFavicon } from './hooks/usePageTitle'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  useFavicon() // 使网站图标响应系统设置

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {!isAdminRoute && <Navbar />}
      <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/content" element={<AdminContent />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/activities" element={<AdminActivities />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </div>
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
