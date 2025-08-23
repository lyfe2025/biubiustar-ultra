import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface AdminActivity {
  id: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  category_id?: string
  max_participants: number
  current_participants: number
  image_url?: string
  status: 'published' | 'draft' | 'cancelled' | 'active' | 'completed' | 'pending'
  is_featured: boolean
  is_recommended?: boolean
  user_id: string
  created_at: string
  updated_at: string
  organizer: {
    id: string
    username: string
    avatar?: string
  }
  tags: string[]
}

export const useActivities = () => {
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [isCacheHit, setIsCacheHit] = useState(false)
  const [cacheTimestamp, setCacheTimestamp] = useState('')
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 获取活动数据（支持缓存）
  const fetchActivities = useCallback(async (page = 1, limit = 10, forceRefresh = false) => {
    try {
      setLoading(true)
      
      // 构建请求参数
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (forceRefresh) {
        params.append('_t', Date.now().toString()) // 强制刷新
      }
      
      const response = await fetch(`/api/admin/activities?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        
        // 处理缓存信息
        const cacheInfo = data._cacheInfo
        if (cacheInfo) {
          setIsCacheHit(cacheInfo.cached || false)
          setCacheTimestamp(cacheInfo.timestamp || '')
        } else {
          setIsCacheHit(false)
          setCacheTimestamp('')
        }
        
        setActivities(data.activities || [])
        setPagination(data.pagination || { page, limit, total: 0, totalPages: 0 })
        setLastUpdateTime(Date.now())
      } else {
        throw new Error('获取活动失败')
      }
    } catch (error) {
      console.error('获取活动失败:', error)
      toast.error('获取活动失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 创建活动后自动失效缓存
  const createActivity = useCallback(async (activityData: Partial<AdminActivity>) => {
    try {
      const response = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      })

      if (response.ok) {
        toast.success('活动创建成功')
        
        // 🚨 关键：创建成功后立即刷新数据，确保获取最新数据
        await fetchActivities(pagination.page, pagination.limit, true) // 强制刷新
        
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '创建活动失败')
        return false
      }
    } catch (error) {
      console.error('创建活动失败:', error)
      toast.error('创建活动失败')
      return false
    }
  }, [fetchActivities, pagination.page, pagination.limit])

  // 更新活动状态后自动失效缓存
  const updateActivityStatus = useCallback(async (id: string, status: string, is_featured?: boolean) => {
    try {
      const body: { status: string; is_featured?: boolean } = { status }
      if (is_featured !== undefined) {
        body.is_featured = is_featured
      }

      const response = await fetch(`/api/admin/activities/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        toast.success('活动状态更新成功')
        
        // 🚨 关键：状态更新成功后立即刷新数据
        await fetchActivities(pagination.page, pagination.limit, true) // 强制刷新
        
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '更新活动状态失败')
        return false
      }
    } catch (error) {
      console.error('更新活动状态失败:', error)
      toast.error('更新活动状态失败')
      return false
    }
  }, [fetchActivities, pagination.page, pagination.limit])

  // 删除活动后自动失效缓存
  const deleteActivity = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/activities/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('活动删除成功')
        
        // 🚨 关键：删除成功后立即刷新数据
        await fetchActivities(pagination.page, pagination.limit, true) // 强制刷新
        
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '删除活动失败')
        return false
      }
    } catch (error) {
      console.error('删除活动失败:', error)
      toast.error('删除活动失败')
      return false
    }
  }, [fetchActivities, pagination.page, pagination.limit])

  // 强制刷新缓存
  const forceRefresh = useCallback(() => {
    fetchActivities(pagination.page, pagination.limit, true)
  }, [fetchActivities, pagination.page, pagination.limit])

  // 检查缓存是否过期（可选）
  const isCacheExpired = useCallback(() => {
    if (!cacheTimestamp) return true
    
    const cacheTime = new Date(cacheTimestamp).getTime()
    const now = Date.now()
    const cacheAge = now - cacheTime
    
    // 缓存超过5分钟认为过期
    return cacheAge > 5 * 60 * 1000
  }, [cacheTimestamp])

  // 分页处理
  const changePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
    fetchActivities(page, pagination.limit, false) // 分页切换使用缓存
  }, [fetchActivities, pagination.limit])

  const changePageSize = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
    fetchActivities(1, limit, false) // 分页大小切换使用缓存
  }, [fetchActivities])

  // 初始化加载
  useEffect(() => {
    fetchActivities(1, 10, false) // 首次加载使用缓存
  }, [fetchActivities])

  return {
    activities,
    loading,
    isCacheHit,
    cacheTimestamp,
    lastUpdateTime,
    isCacheExpired,
    pagination,
    fetchActivities,
    createActivity,
    updateActivityStatus,
    deleteActivity,
    forceRefresh,
    changePage,
    changePageSize
  }
}
