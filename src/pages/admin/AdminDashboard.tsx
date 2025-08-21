import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
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
  Activity,
  Shield,
  BarChart3,
  Database
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/language'
import { adminService, type DashboardStats, type RecentActivity } from '../../services/AdminService'

// 接口定义已移至AdminService中

// 辅助函数：格式化时间为相对时间
const formatTimeAgo = (dateString: string, t?: (key: string) => string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return t ? t('admin.dashboard.time.justNow') : '刚刚'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}${t ? t('admin.dashboard.time.minutesAgo') : '分钟前'}`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}${t ? t('admin.dashboard.time.hoursAgo') : '小时前'}`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days}${t ? t('admin.dashboard.time.daysAgo') : '天前'}`
  }
}

// 辅助函数：根据类型获取图标
const getIconByType = (type: string): string => {
  switch (type) {
    case 'user_register':
      return 'UserPlus'
    case 'post_create':
    case 'post_pending':
      return 'FileText'
    case 'admin_login':
    case 'login':
      return 'Shield'
    default:
      return 'Clock'
  }
}

// 辅助函数：根据类型获取颜色
const getColorByType = (type: string): string => {
  switch (type) {
    case 'user_register':
      return 'text-green-600'
    case 'post_create':
    case 'post_pending':
      return 'text-orange-600'
    case 'admin_login':
    case 'admin_login_success':
    case 'login':
      return 'text-blue-600'
    case 'unauthorized_admin_access_attempt':
    case 'login_system_error':
      return 'text-red-600'
    case 'ip_blocked':
    case 'ip_permanently_blocked':
      return 'text-red-600'
    case 'ip_auto_unblocked':
      return 'text-green-600'
    case 'blacklist_cleanup':
    case 'login_attempts_cleanup':
    case 'security_cleanup_summary':
      return 'text-blue-600'
    case 'security_cleanup_failed':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

// 辅助函数：格式化活动消息为用户友好的描述
const formatActivityMessage = (type: string, details: string, userEmail?: string, ipAddress?: string, userAgent?: string, t?: (key: string) => string): string => {
  try {
    // 尝试解析JSON格式的details
    let parsedDetails: any = {}
    if (details && details.trim().startsWith('{')) {
      try {
        parsedDetails = JSON.parse(details)
      } catch {
        // 如果解析失败，使用原始字符串
        parsedDetails = { raw: details }
      }
    } else {
      parsedDetails = { raw: details }
    }

    // 提取通用信息
    const username = parsedDetails.username || userEmail || (t ? t('admin.dashboard.activityMessages.unknownUser') : '未知用户')
    const ip = parsedDetails.ip || ipAddress || (t ? t('admin.dashboard.unknownIP') : '未知IP')
    const browser = parsedDetails.userAgent || userAgent
    
    // 简化浏览器信息显示
    const getBrowserInfo = (userAgent?: string): string => {
      if (!userAgent) return ''
      if (userAgent.includes('Chrome')) return 'Chrome'
      if (userAgent.includes('Firefox')) return 'Firefox'
      if (userAgent.includes('Safari')) return 'Safari'
      if (userAgent.includes('Edge')) return 'Edge'
      return t ? t('admin.dashboard.activityMessages.unknownBrowser') : '未知浏览器'
    }
    
    const browserInfo = getBrowserInfo(browser)

    switch (type) {
      case 'admin_login_success': {
        const loginDetails = [t ? t('admin.dashboard.activityMessages.adminLoginSuccess').replace('{username}', username) : `管理员 ${username} 登录成功`]
        if (ip !== (t ? t('admin.dashboard.unknownIP') : '未知IP')) loginDetails.push(`${t ? t('admin.dashboard.activityMessages.fromIP') : '来自'} ${ip}`)
        if (browserInfo) loginDetails.push(`${t ? t('admin.dashboard.activityMessages.usingBrowser') : '使用'} ${browserInfo}`)
        return loginDetails.join(' ')
      }
      
      case 'unauthorized_admin_access_attempt': {
        const attemptDetails = [`非管理员用户 ${username} 尝试访问管理后台`]
        if (ip !== '未知IP') attemptDetails.push(`来自 ${ip}`)
        if (browserInfo) attemptDetails.push(`使用 ${browserInfo}`)
        return attemptDetails.join(' ')
      }
      
      case 'login_system_error': {
        const errorDetails = [`登录系统发生错误`]
        if (parsedDetails.error) errorDetails.push(`: ${parsedDetails.error}`)
        if (ip !== '未知IP') errorDetails.push(`，来源IP: ${ip}`)
        return errorDetails.join('')
      }
      
      case 'ip_blocked': {
        const blockDetails = [`IP地址 ${ip} 被临时封禁`]
        if (parsedDetails.reason) blockDetails.push(`，原因: ${parsedDetails.reason}`)
        if (parsedDetails.failed_attempts) blockDetails.push(`，失败尝试: ${parsedDetails.failed_attempts}次`)
        if (parsedDetails.blocked_until) {
          const blockedUntil = new Date(parsedDetails.blocked_until).toLocaleString('zh-CN')
          blockDetails.push(`，解锁时间: ${blockedUntil}`)
        }
        return blockDetails.join('')
      }
      
      case 'ip_permanently_blocked': {
        const permBlockDetails = [`IP地址 ${ip} 被永久封禁`]
        if (parsedDetails.reason) permBlockDetails.push(`，原因: ${parsedDetails.reason}`)
        if (parsedDetails.blocked_by) permBlockDetails.push(`，操作者: ${parsedDetails.blocked_by}`)
        return permBlockDetails.join('')
      }
      
      case 'ip_auto_unblocked': {
        const unblockDetails = [`IP地址 ${ip} 自动解锁`]
        if (parsedDetails.reason) unblockDetails.push(`，原因: ${parsedDetails.reason}`)
        return unblockDetails.join('')
      }
      
      case 'blacklist_cleanup': {
        const blacklistCount = parsedDetails.blacklist_cleaned || 0
        return `系统清理了 ${blacklistCount} 个过期IP黑名单记录`
      }
      
      case 'login_attempts_cleanup': {
        const attemptsCount = parsedDetails.login_attempts_cleaned || 0
        return `系统清理了 ${attemptsCount} 个过期登录尝试记录`
      }
      
      case 'security_cleanup_summary': {
        const blacklistCleaned = parsedDetails.blacklist_cleaned || 0
        const attemptsCleaned = parsedDetails.login_attempts_cleaned || 0
        const totalCleaned = blacklistCleaned + attemptsCleaned
        return `安全数据清理完成，清理IP黑名单 ${blacklistCleaned} 条，登录尝试记录 ${attemptsCleaned} 条，共 ${totalCleaned} 条记录`
      }
      
      case 'security_cleanup_failed': {
        const failDetails = [`安全数据清理失败`]
        if (parsedDetails.error) failDetails.push(`: ${parsedDetails.error}`)
        return failDetails.join('')
      }
      
      case 'user_register': {
        const regDetails = [`新用户 ${username} 注册`]
        if (ip !== '未知IP') regDetails.push(`，来自 ${ip}`)
        return regDetails.join('')
      }
      
      case 'post_create': {
        const postDetails = [`用户 ${username} 发布了新帖子`]
        if (parsedDetails.title) postDetails.push(`: ${parsedDetails.title}`)
        return postDetails.join('')
      }
      
      default:
        // 如果无法识别类型，显示通用描述
        if (parsedDetails.raw && parsedDetails.raw !== details) {
          return parsedDetails.raw
        }
        return `${t ? t('admin.dashboard.systemActivity') : '系统活动'}: ${type}${ip !== (t ? t('admin.dashboard.unknownIP') : '未知IP') ? ` (${ip})` : ''}`
    }
  } catch {
    // 如果处理过程中出现任何错误，返回通用描述
    return `${t ? t('admin.dashboard.systemActivity') : '系统活动'}: ${type}`
  }
}

const AdminDashboard = () => {
  const { t, language } = useLanguage();
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
    completedActivities: 0,
    totalParticipants: 0,
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
          adminService.getActivityLogs(1, 5) // 获取前5条活动日志作为最近活动
        ])
        
        setStats(statsData)
        // 适配activity_logs表的数据结构
        const formattedActivities = activitiesData.data.map((log: any) => ({
          id: log.id,
          type: log.type as 'post' | 'comment' | 'like' | 'follow',
          user: {
            id: log.user_id || 'system',
            username: log.user_email || 'System',
            avatar: undefined
          },
          content: formatActivityMessage(log.type, log.details || '', log.user_email, log.ip_address, log.user_agent, t),
          message: formatActivityMessage(log.type, log.details || '', log.user_email, log.ip_address, log.user_agent, t),
                      time: formatTimeAgo(log.created_at, t),
          icon: getIconByType(log.type),
          color: getColorByType(log.type),
          created_at: log.created_at
        }))
        setRecentActivities(formattedActivities)
      } catch (error) {
        console.error('加载管理后台数据失败:', error)
        
        // 检查是否为认证失败错误
        if (error instanceof Error && error.name === 'AuthenticationError') {
          toast.error('认证令牌已失效，请重新登录')
          setTimeout(() => {
            navigate('/admin')
          }, 1000)
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
          completedActivities: 0,
          totalParticipants: 0,
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
      title: t('admin.performance.title') || '系统性能监控',
      description: t('admin.performance.description') || '查看系统性能指标和监控数据',
      icon: BarChart3,
      link: '/admin/system-performance',
      color: 'bg-indigo-500'
    },
    {
      title: t('admin.cache.title') || '缓存性能监控',
      description: t('admin.cache.description') || '查看缓存性能和健康状态',
      icon: Database,
      link: '/admin/cache-performance',
      color: 'bg-cyan-500'
    },
    {
      title: t('admin.dashboard.securityManagement'),
      description: t('admin.dashboard.securityManagementDesc'),
      icon: Shield,
      link: '/admin/security',
      color: 'bg-red-500'
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
                // 根据图标字符串映射到实际组件
                const IconComponent = activity.icon === 'UserPlus' ? UserPlus : 
                                    activity.icon === 'FileText' ? FileText :
                                    activity.icon === 'Shield' ? Shield : Clock
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