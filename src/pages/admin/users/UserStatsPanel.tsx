import React, { useState, useEffect } from 'react'
import { Users, UserPlus, TrendingUp, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { adminService } from '../../../services/admin'

interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  userGrowthRate: number
  _cacheInfo?: { cached: boolean, timestamp: string }
}

const UserStatsPanel: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cacheInfo, setCacheInfo] = useState<{
    cached: boolean
    timestamp: string
  } | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await adminService.getUserStats()
      setStats(result.data)
      setCacheInfo(result._cacheInfo)
    } catch (error) {
      console.error('加载用户统计数据失败:', error)
      let errorMessage = '未知错误'
      
      if (error instanceof Error) {
        if (error.name === 'AuthenticationError') {
          errorMessage = '认证失败，请重新登录'
        } else if (error.message.includes('未找到有效的认证token')) {
          errorMessage = '未提供认证令牌，请先登录'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(`加载用户统计数据失败: ${errorMessage}`)
      toast.error(`加载用户统计数据失败: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">{error}</div>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // 为stats属性提供安全的默认值
  const safeStats = {
    totalUsers: stats.totalUsers ?? 0,
    activeUsers: stats.activeUsers ?? 0,
    newUsersToday: stats.newUsersToday ?? 0,
    userGrowthRate: stats.userGrowthRate ?? 0
  }

  const formatGrowthRate = (rate: number | undefined) => {
    const safeRate = rate ?? 0
    const isPositive = safeRate >= 0
    return (
      <span className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <TrendingUp className={`w-3 h-3 mr-1 ${!isPositive ? 'rotate-180' : ''}`} />
        {isPositive ? '+' : ''}{safeRate.toFixed(1)}%
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-600" />
          <span>用户统计概览</span>
        </h3>
        
        {/* 缓存状态指示器 */}
        {cacheInfo && (
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${cacheInfo.cached ? 'bg-green-500' : 'bg-blue-500'}`} />
            <span className="text-gray-500">
              {cacheInfo.cached ? '缓存数据' : '实时数据'}
              <span className="ml-1 text-xs">
                ({new Date(cacheInfo.timestamp).toLocaleTimeString()})
              </span>
            </span>
            <button
              onClick={loadStats}
              className="text-purple-600 hover:text-purple-800 text-xs underline"
            >
              刷新
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 总用户数 */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {safeStats.totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-blue-700">总用户数</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* 活跃用户数 */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {safeStats.activeUsers.toLocaleString()}
              </p>
              <p className="text-sm text-green-700">活跃用户</p>
            </div>
            <UserPlus className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* 今日新增 */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {safeStats.newUsersToday.toLocaleString()}
              </p>
              <p className="text-sm text-purple-700">今日新增</p>
              {formatGrowthRate(safeStats.userGrowthRate)}
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        {/* 活跃度比例 */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {safeStats.totalUsers > 0 ? ((safeStats.activeUsers / safeStats.totalUsers) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-orange-700">活跃度</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
              %
            </div>
          </div>
        </div>
      </div>

      
    </div>
  )
}

export default UserStatsPanel
