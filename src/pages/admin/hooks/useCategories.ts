import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // 多语言字段
  name_zh?: string
  name_zh_tw?: string
  name_en?: string
  name_vi?: string
  description_zh?: string
  description_zh_tw?: string
  description_en?: string
  description_vi?: string
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isCacheHit, setIsCacheHit] = useState(false)
  const [cacheTimestamp, setCacheTimestamp] = useState('')
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0)

  // 获取分类数据（支持缓存）
  const fetchCategories = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      // 构建请求参数
      const params = new URLSearchParams()
      if (forceRefresh) {
        params.append('_t', Date.now().toString()) // 强制刷新
      }
      
      const response = await fetch(`/api/admin/categories/content?${params.toString()}`)
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
        
        setCategories(data)
        setLastUpdateTime(Date.now())
      } else {
        throw new Error('获取分类失败')
      }
    } catch (error) {
      console.error('获取分类失败:', error)
      toast.error('获取分类失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 创建分类后自动失效缓存
  const createCategory = useCallback(async (categoryData: Partial<Category>) => {
    try {
      const response = await fetch('/api/admin/categories/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })

      if (response.ok) {
        toast.success('分类创建成功')
        
        // 🚨 关键：创建成功后立即刷新数据，确保获取最新数据
        await fetchCategories(true) // 强制刷新
        
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '创建分类失败')
        return false
      }
    } catch (error) {
      console.error('创建分类失败:', error)
      toast.error('创建分类失败')
      return false
    }
  }, [fetchCategories])

  // 更新分类后自动失效缓存
  const updateCategory = useCallback(async (id: string, categoryData: Partial<Category>) => {
    try {
      const response = await fetch(`/api/admin/categories/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })

      if (response.ok) {
        toast.success('分类更新成功')
        
        // 🚨 关键：更新成功后立即刷新数据
        await fetchCategories(true) // 强制刷新
        
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '更新分类失败')
        return false
      }
    } catch (error) {
      console.error('更新分类失败:', error)
      toast.error('更新分类失败')
      return false
    }
  }, [fetchCategories])

  // 删除分类后自动失效缓存
  const deleteCategory = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/categories/content/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('分类删除成功')
        
        // 🚨 关键：删除成功后立即刷新数据
        await fetchCategories(true) // 强制刷新
        
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '删除分类失败')
        return false
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      toast.error('删除分类失败')
      return false
    }
  }, [fetchCategories])

  // 切换分类状态后自动失效缓存
  const toggleCategoryStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/categories/content/${id}/toggle`, {
        method: 'PUT'
      })

      if (response.ok) {
        toast.success('分类状态切换成功')
        
        // 🚨 关键：状态切换成功后立即刷新数据
        await fetchCategories(true) // 强制刷新
        
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '切换分类状态失败')
        return false
      }
    } catch (error) {
      console.error('切换分类状态失败:', error)
      toast.error('切换分类状态失败')
      return false
    }
  }, [fetchCategories])

  // 强制刷新缓存
  const forceRefresh = useCallback(() => {
    fetchCategories(true)
  }, [fetchCategories])

  // 检查缓存是否过期（可选）
  const isCacheExpired = useCallback(() => {
    if (!cacheTimestamp) return true
    
    const cacheTime = new Date(cacheTimestamp).getTime()
    const now = Date.now()
    const cacheAge = now - cacheTime
    
    // 缓存超过5分钟认为过期
    return cacheAge > 5 * 60 * 1000
  }, [cacheTimestamp])

  // 初始化加载
  useEffect(() => {
    fetchCategories(false) // 首次加载使用缓存
  }, [fetchCategories])

  return {
    categories,
    loading,
    isCacheHit,
    cacheTimestamp,
    lastUpdateTime,
    isCacheExpired,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    forceRefresh
  }
}
