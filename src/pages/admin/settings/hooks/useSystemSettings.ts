import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../../../services/admin'
import { settingsService } from '../../../../services/SettingsService'
import { toast } from 'sonner'
import { SystemSettings } from '../types'

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('basic')
  const [resetConfirmModal, setResetConfirmModal] = useState(false)
  const [isCacheHit, setIsCacheHit] = useState(false)
  const [cacheTimestamp, setCacheTimestamp] = useState<string>('')
  const navigate = useNavigate()

  // 获取系统设置
  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await adminService.getSystemSettings()
      
      console.log('原始响应数据:', response)
      
      // 处理缓存信息
      const cacheInfo = response._cacheInfo
      if (cacheInfo) {
        setIsCacheHit(cacheInfo.cached || false)
        setCacheTimestamp(cacheInfo.timestamp || '')
      } else {
        setIsCacheHit(false)
        setCacheTimestamp('')
      }
      
      // 检查响应数据是否有效
      if (response && response.data && Object.keys(response.data).length > 0) {
        setSettings(response.data as SystemSettings)
        console.log('系统设置获取成功:', response.data)
      } else if (response && typeof response === 'object' && Object.keys(response).length > 0) {
        // 如果response本身就是数据对象（没有嵌套的data字段）
        setSettings(response as unknown as SystemSettings)
        console.log('系统设置获取成功（直接数据）:', response)
      } else {
        console.warn('系统设置响应数据为空或无效:', response)
        // 如果数据为空，尝试强制刷新
        if (!isCacheHit) {
          console.log('尝试强制刷新获取数据...')
          await forceRefresh()
        } else {
          setSettings(response?.data || response || null)
        }
      }
    } catch (error) {
      console.error('获取系统设置失败:', error)
      if (error instanceof Error && error.name === 'AuthenticationError') {
        toast.error('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
      toast.error('获取系统设置失败')
      
      // 如果是网络错误或其他可重试错误，尝试重新获取
      if (error instanceof Error && !error.message.includes('认证')) {
        console.log('尝试重新获取系统设置...')
        setTimeout(() => {
          fetchSettings()
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  // 强制刷新设置（绕过缓存）
  const forceRefresh = async () => {
    try {
      setLoading(true)
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/settings?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('刷新设置失败')
      }
      
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
      
      // 检查数据是否有效
      if (data && data.data && Object.keys(data.data).length > 0) {
        setSettings(data.data as SystemSettings)
        console.log('强制刷新设置成功:', data.data)
        toast.success('设置数据已刷新')
      } else {
        console.warn('强制刷新后数据仍为空:', data)
        setSettings(data?.data || data || null)
        toast.warning('刷新完成，但未获取到有效数据')
      }
    } catch (error) {
      console.error('强制刷新设置失败:', error)
      toast.error('刷新设置失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 更新系统设置
  const updateSettings = async (updates: Record<string, any>) => {
    try {
      setSaving(true)
      // 直接使用updates对象，它已经是category.key: value的格式
      await adminService.updateSystemSettings(updates)
      
      // 清除前台缓存
      try {
        settingsService.clearCache()
        console.log('前台设置缓存已清除')
      } catch (cacheError) {
        console.warn('清除前台缓存失败:', cacheError)
      }
      
      // 重新获取设置以确保状态同步
      await fetchSettings()
      toast.success('设置保存成功')
    } catch (error) {
      console.error('保存设置失败:', error)
      if (error instanceof Error && error.name === 'AuthenticationError') {
        toast.error('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
      toast.error('保存设置失败')
    } finally {
      setSaving(false)
    }
  }

  // 重置设置到默认值
  const resetToDefaults = async () => {
    setResetConfirmModal(true)
  }

  // 确认重置设置
  const confirmResetToDefaults = async () => {
    try {
      setSaving(true)
      await adminService.resetSystemSettings()
      await fetchSettings()
      toast.success('设置已重置到默认值')
      setResetConfirmModal(false)
    } catch (error) {
      console.error('重置设置失败:', error)
      toast.error('重置设置失败')
    } finally {
      setSaving(false)
    }
  }

  // 导出设置
  const exportSettings = async () => {
    try {
      const data = await adminService.exportSystemSettings()
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('设置导出成功')
    } catch (error) {
      console.error('导出设置失败:', error)
      toast.error('导出设置失败')
    }
  }

  // 导入设置
  const importSettings = async (file: File) => {
    try {
      setSaving(true)
      const text = await file.text()
      const importedSettings = JSON.parse(text)
      
      await adminService.importSystemSettings(importedSettings)
      await fetchSettings()
      toast.success('设置导入成功')
    } catch (error) {
      console.error('导入设置失败:', error)
      toast.error('导入设置失败，请检查文件格式')
    } finally {
      setSaving(false)
    }
  }

  // 测试邮件配置
  const testEmailConfig = async () => {
    if (!settings) return

    try {
      setSaving(true)
      await adminService.testEmailConfig(settings)
      toast.success('邮件配置测试成功')
    } catch (error) {
      console.error('邮件配置测试失败:', error)
      toast.error('邮件配置测试失败')
    } finally {
      setSaving(false)
    }
  }

  // 清除缓存
  const clearCache = async () => {
    try {
      setSaving(true)
      await settingsService.clearCache()
      toast.success('缓存清除成功')
    } catch (error) {
      console.error('清除缓存失败:', error)
      toast.error('清除缓存失败')
    } finally {
      setSaving(false)
    }
  }

  // 初始化
  useEffect(() => {
    console.log('useSystemSettings: 开始初始化')
    fetchSettings()
  }, [])

  // 添加调试信息
  useEffect(() => {
    console.log('useSystemSettings: 状态更新', {
      settings: settings ? Object.keys(settings).length : 0,
      loading,
      saving,
      isCacheHit,
      cacheTimestamp
    })
  }, [settings, loading, saving, isCacheHit, cacheTimestamp])

  return {
    // 数据状态
    settings,
    loading,
    saving,
    
    // 缓存状态
    isCacheHit,
    cacheTimestamp,
    
    // UI状态
    activeTab,
    setActiveTab,
    resetConfirmModal,
    setResetConfirmModal,
    
    // 操作方法
    updateSettings,
    resetToDefaults,
    confirmResetToDefaults,
    exportSettings,
    importSettings,
    testEmailConfig,
    clearCache,
    fetchSettings,
    forceRefresh
  }
}
