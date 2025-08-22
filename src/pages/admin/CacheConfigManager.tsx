import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Database,
  RefreshCw,
  Trash2,
  Edit3,
  Save,
  X,
  Layers,
  Clock,
  TrendingUp,
  Activity,
  MemoryStick,
  Check
} from 'lucide-react'
import { useLanguage } from '../../contexts/language'
import { cacheConfigService } from '../../services/cacheConfigService'

interface CacheConfig {
  type: string
  maxSize: number
  defaultTTL: number
  cleanupInterval: number
  enabled: boolean
  stats?: {
    hitRate: number
    memoryUsage: number
    totalRequests: number
    cacheHits: number
    cacheMisses: number
  }
}

interface CacheConfigManagerProps {
  onConfigUpdate?: () => void
}

const CacheConfigManager: React.FC<CacheConfigManagerProps> = ({ onConfigUpdate }) => {
  const { t } = useLanguage()
  const [configs, setConfigs] = useState<Record<string, CacheConfig>>({})
  const [loading, setLoading] = useState(true)
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<CacheConfig>>({})
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState<string | null>(null)

  // 获取缓存配置
  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await cacheConfigService.getCacheConfigs()
      
      // 修复: 正确处理后端返回的数据格式
      const { cacheTypes } = response.data
      
      // 转换为前端期望的格式
      const mergedConfigs = {}
      cacheTypes.forEach((cacheConfig: any) => {
        mergedConfigs[cacheConfig.type] = {
          type: cacheConfig.type,
          maxSize: cacheConfig.maxSize,
          defaultTTL: cacheConfig.defaultTTL,
          cleanupInterval: cacheConfig.cleanupInterval,
          enabled: cacheConfig.enabled !== false,
          stats: cacheConfig.currentStats || {
            totalRequests: 0,
            hitRate: 0,
            memoryUsage: 0
          }
        }
      })
      
      setConfigs(mergedConfigs)
    } catch (error) {
      console.error('获取缓存配置失败:', error)
      if (error.message.includes('401') || error.message.includes('认证')) {
        // 认证过期，跳转到登录页
        window.location.href = '/admin/login'
      }
    } finally {
      setLoading(false)
    }
  }

  // 更新缓存配置
  const updateConfig = async (cacheType: string, config: Partial<CacheConfig>) => {
    setSaving(true)
    try {
      const result = await cacheConfigService.updateCacheConfig({
        cacheType,
        maxSize: config.maxSize || 1000,
        defaultTTL: config.defaultTTL || 300000,
        cleanupInterval: config.cleanupInterval
      })
      if (result.success) {
        toast.success(`${cacheType} 缓存配置已更新`)
        await fetchConfigs()
        onConfigUpdate?.()
        setEditingConfig(null)
        setEditValues({})
      } else {
        throw new Error('更新失败')
      }
    } catch (error) {
      console.error('更新缓存配置失败:', error)
      if (error instanceof Error && error.message.includes('认证token')) {
        toast.error('认证已过期，请重新登录')
      } else {
        toast.error(error instanceof Error ? error.message : '更新缓存配置失败')
      }
    } finally {
      setSaving(false)
    }
  }

  // 清理缓存
  const clearCache = async (cacheType: string) => {
    setClearing(cacheType)
    try {
      const result = await cacheConfigService.clearCache(cacheType)
      if (result.success) {
        toast.success(`${cacheType} 缓存已清理`)
        await fetchConfigs()
        onConfigUpdate?.()
      } else {
        throw new Error('清理失败')
      }
    } catch (error) {
      console.error('清理缓存失败:', error)
      if (error instanceof Error && error.message.includes('认证token')) {
        toast.error('认证已过期，请重新登录')
      } else {
        toast.error(error instanceof Error ? error.message : '清理缓存失败')
      }
    } finally {
      setClearing(null)
    }
  }

  // 开始编辑
  const startEdit = (cacheType: string) => {
    const config = configs[cacheType]
    if (config) {
      setEditingConfig(cacheType)
      setEditValues({
        maxSize: config.maxSize,
        defaultTTL: Math.round(config.defaultTTL / 1000), // 转为秒
        cleanupInterval: Math.round(config.cleanupInterval / 1000), // 转为秒
        enabled: config.enabled
      })
    }
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingConfig(null)
    setEditValues({})
  }

  // 保存编辑
  const saveEdit = async () => {
    if (!editingConfig) return
    
    await updateConfig(editingConfig, {
      maxSize: Number(editValues.maxSize),
      defaultTTL: Number(editValues.defaultTTL) * 1000, // 转为毫秒
      cleanupInterval: Number(editValues.cleanupInterval) * 1000, // 转为毫秒
      enabled: editValues.enabled
    })
  }

  // 格式化字节数
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // 格式化时间
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m`
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">加载缓存配置...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">缓存配置管理</h2>
        </div>
        <button
          onClick={fetchConfigs}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>刷新</span>
        </button>
      </div>

      {/* 缓存配置列表 */}
      <div className="grid gap-6">
        {Object.values(configs).map((config) => (
          <div key={config.type} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MemoryStick className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{config.type}</h3>
                  <p className="text-sm text-gray-500">
                    状态: <span className={config.enabled ? 'text-green-600' : 'text-red-600'}>
                      {config.enabled ? '启用' : '禁用'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => startEdit(config.type)}
                  disabled={editingConfig === config.type}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => clearCache(config.type)}
                  disabled={clearing === config.type}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  {clearing === config.type ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {editingConfig === config.type ? (
              /* 编辑模式 */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最大条目数
                    </label>
                    <input
                      type="number"
                      value={editValues.maxSize || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, maxSize: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      默认TTL (秒)
                    </label>
                    <input
                      type="number"
                      value={editValues.defaultTTL || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, defaultTTL: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      清理间隔 (秒)
                    </label>
                    <input
                      type="number"
                      value={editValues.cleanupInterval || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, cleanupInterval: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editValues.enabled || false}
                      onChange={(e) => setEditValues(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">启用缓存</span>
                  </label>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>保存</span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    <span>取消</span>
                  </button>
                </div>
              </div>
            ) : (
              /* 显示模式 */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">最大条目:</span>
                    <span className="font-medium">{config.maxSize.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">默认TTL:</span>
                    <span className="font-medium">{formatDuration(config.defaultTTL)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">清理间隔:</span>
                    <span className="font-medium">{formatDuration(config.cleanupInterval)}</span>
                  </div>
                </div>
                
                {config.stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{config.stats.totalRequests}</div>
                      <div className="text-sm text-gray-600">当前条目数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(config.stats.hitRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">命中率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatBytes(config.stats.memoryUsage)}
                      </div>
                      <div className="text-sm text-gray-600">内存使用</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(configs).length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">暂无缓存配置</p>
        </div>
      )}
    </div>
  )
}

export default CacheConfigManager