import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalPosts: number
  publishedPosts: number
  pendingPosts: number
  totalActivities: number
  activeActivities: number
  totalComments: number
  totalLikes: number
  totalShares: number
  roleDistribution: Record<string, number>
  growthRate: number
  lastUpdated: string
}

export interface RecentActivity {
  id: string
  type: 'user_register' | 'post_create' | 'post_pending' | 'admin_login' | 'login' | 'unauthorized_admin_access_attempt' | 'ip_blocked' | 'ip_permanently_blocked' | 'ip_auto_unblocked' | 'blacklist_cleanup' | 'login_attempts_cleanup' | 'security_cleanup_summary' | 'security_cleanup_failed'
  user_email?: string
  ip_address?: string
  user_agent?: string
  details: string
  created_at: string
  severity: 'info' | 'warning' | 'error'
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [isCacheHit, setIsCacheHit] = useState(false)
  const [cacheTimestamp, setCacheTimestamp] = useState('')
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0)

  // 获取仪表板数据
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (forceRefresh) {
        params.append('_t', Date.now().toString())
      }
      
      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/admin/dashboard/stats?${params.toString()}`),
        fetch(`/api/admin/dashboard/recent-activities?${params.toString()}`)
      ])

      if (statsResponse.ok && activitiesResponse.ok) {
        const [statsData, activitiesData] = await Promise.all([
          statsResponse.json(),
          activitiesResponse.json()
        ])

        // 处理缓存信息
        const statsCacheInfo = statsData._cacheInfo
        const activitiesCacheInfo = activitiesData._cacheInfo
        
        setIsCacheHit(statsCacheInfo?.cached || activitiesCacheInfo?.cached || false)
        setCacheTimestamp(statsCacheInfo?.timestamp || activitiesCacheInfo?.timestamp || '')
        
        setStats(statsData.data)
        setRecentActivities(activitiesData.data || [])
        setLastUpdateTime(Date.now())
      } else {
        throw new Error('获取仪表板数据失败')
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
      toast.error('获取仪表板数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 强制刷新（用于实时数据更新）
  const forceRefresh = useCallback(() => {
    fetchDashboardData(true)
  }, [fetchDashboardData])

  // 检查缓存是否过期
  const isCacheExpired = useCallback(() => {
    if (!cacheTimestamp) return true
    
    const cacheTime = new Date(cacheTimestamp).getTime()
    const now = Date.now()
    const cacheAge = now - cacheTime
    
    // 仪表板数据缓存超过2分钟认为过期
    return cacheAge > 2 * 60 * 1000
  }, [cacheTimestamp])

  // 定时刷新（每2分钟自动刷新一次）
  useEffect(() => {
    const interval = setInterval(() => {
      // 如果缓存过期，自动刷新
      if (isCacheExpired()) {
        fetchDashboardData(false) // 使用缓存，不强制刷新
      }
    }, 2 * 60 * 1000) // 2分钟检查一次

    return () => clearInterval(interval)
  }, [fetchDashboardData, isCacheExpired])

  // 初始化加载
  useEffect(() => {
    fetchDashboardData(false) // 首次加载使用缓存
  }, [fetchDashboardData])

  return {
    stats,
    recentActivities,
    loading,
    isCacheHit,
    cacheTimestamp,
    lastUpdateTime,
    isCacheExpired,
    fetchDashboardData,
    forceRefresh
  }
}
