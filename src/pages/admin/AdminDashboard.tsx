import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Heart, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/language'
import { adminService, type DashboardStats, type RecentActivity } from '../../services/AdminService'

// 接口定义已移至AdminService中

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalActivities: 0,
    activeUsers: 0,
    totalViews: 0,
    pendingPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    newUsersToday: 0,
    activeActivities: 0,
    upcomingActivities: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // 检查管理员登录状态
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin')
      return
    }

    // 加载真实数据
    const loadData = async () => {
      setLoading(true)
      
      try {
        // 并行获取统计数据和最近活动
        const [statsData, activitiesData] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentActivities()
        ])
        
        setStats(statsData)
        setRecentActivities(activitiesData)
      } catch (error) {
        console.error('加载管理后台数据失败:', error)
        
        // 检查是否为认证失败错误
        if (error instanceof Error && error.name === 'AuthenticationError') {
          alert('认证令牌已失效，请重新登录')
          navigate('/admin')
          return
        }
        
        // 设置默认数据以防API失败
        setStats({
          totalUsers: 0,
          totalPosts: 0,
          totalActivities: 0,
          activeUsers: 0,
          totalViews: 0,
          pendingPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          newUsersToday: 0,
          activeActivities: 0,
          upcomingActivities: 0
        })
        setRecentActivities([])
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [navigate])

  const statCards = [
    {
      title: t('admin.dashboard.totalUsers'),
      value: stats.totalUsers,
      change: `+${stats.newUsersToday} ${t('admin.dashboard.newToday')}`,
      icon: Users,
      color: 'bg-blue-500',
      changeColor: 'text-green-600'
    },
    {
      title: t('admin.dashboard.totalPosts'),
      value: stats.totalPosts,
      change: `${stats.pendingPosts} ${t('admin.dashboard.pending')}`,
      icon: FileText,
      color: 'bg-purple-500',
      changeColor: 'text-orange-600'
    },
    {
      title: t('admin.dashboard.totalActivities'),
      value: stats.totalActivities,
      change: `${stats.activeActivities} ${t('admin.dashboard.active')}`,
      icon: Calendar,
      color: 'bg-green-500',
      changeColor: 'text-blue-600'
    },
    {
      title: t('admin.dashboard.totalViews'),
      value: stats.totalViews,
      change: `+12.5% ${t('admin.dashboard.thisWeek')}`,
      icon: Eye,
      color: 'bg-orange-500',
      changeColor: 'text-green-600'
    }
  ]

  const quickActions = [
    {
      title: t('admin.dashboard.contentReview'),
      description: t('admin.dashboard.contentReviewDesc'),
      icon: CheckCircle,
      link: '/admin/content',
      color: 'bg-purple-500',
      badge: stats.pendingPosts
    },
    {
      title: t('admin.dashboard.userManagement'),
      description: t('admin.dashboard.userManagementDesc'),
      icon: Users,
      link: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: t('admin.dashboard.activityManagement'),
      description: t('admin.dashboard.activityManagementDesc'),
      icon: Calendar,
      link: '/admin/activities',
      color: 'bg-green-500'
    },
    {
      title: t('admin.dashboard.systemSettings'),
      description: t('admin.dashboard.systemSettingsDesc'),
      icon: AlertCircle,
      link: '/admin/settings',
      color: 'bg-orange-500'
    }
  ]

  // recentActivities 现在从API获取，不再使用静态数据

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
          <p className="text-gray-600">{t('admin.dashboard.welcome')}</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                    <p className={`text-sm ${card.changeColor}`}>{card.change}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 快速操作 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.quickActions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className="relative p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`${action.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                    {action.badge && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {action.badge}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 最近活动 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.recentActivities')}</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                // 使用接口定义的属性
                const IconComponent = activity.icon === 'UserPlus' ? UserPlus : 
                                    activity.icon === 'FileText' ? FileText : Clock
                const color = activity.color || 'text-gray-600'
                const message = activity.message
                const time = activity.time
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`${color} mt-1`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{message}</p>
                      <p className="text-xs text-gray-500">{time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                to="/admin/logs"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {t('admin.dashboard.viewAllActivities')} →
              </Link>
            </div>
          </div>
        </div>

        {/* 互动统计 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.interactionStats')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-lg inline-block mb-2">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{t('admin.dashboard.totalLikes')}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-lg inline-block mb-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComments.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{t('admin.dashboard.totalComments')}</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-lg inline-block mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{((stats.totalLikes + stats.totalComments) / stats.totalPosts * 100).toFixed(1)}%</p>
              <p className="text-sm text-gray-600">{t('admin.dashboard.interactionRate')}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard