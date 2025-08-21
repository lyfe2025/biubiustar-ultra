import React, { useState, useRef } from 'react'
import { Settings, Save, RefreshCw, Download, Upload } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout'
import { useLanguage } from '../../../contexts/language'
import { useSystemSettings } from './hooks/useSystemSettings'
import BasicSettings from './BasicSettings'
import UserSettings from './UserSettings'
import ContentSettings from './ContentSettings'
import EmailSettings from './EmailSettings'
import SecuritySettings from './SecuritySettings'
import ThemeSettings from './ThemeSettings'
import DeleteConfirmModal from '../../../components/DeleteConfirmModal'

const AdminSettings = () => {
  const { t } = useLanguage()
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({})
  const basicSettingsRef = useRef<{ resetEditingState: () => void }>(null)
  
  const {
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
    // testEmailConfig,
    // clearCache,
    fetchSettings,
    forceRefresh
  } = useSystemSettings()

  // 处理设置更新（不立即保存，只更新待保存状态）
  const handleSettingsChange = (updates: Record<string, any>) => {
    setPendingChanges(prev => ({ ...prev, ...updates }))
  }

  // 保存所有待保存的更改
  const handleSave = async () => {
    if (Object.keys(pendingChanges).length > 0) {
      await updateSettings(pendingChanges)
      setPendingChanges({}) // 清除待保存状态
      
      // 重置BasicSettings的编辑状态，允许useEffect同步最新数据
      // 无论当前在哪个标签页，都要重置编辑状态以确保数据同步
      if (basicSettingsRef.current) {
        basicSettingsRef.current.resetEditingState()
      }
    }
  }

  const tabs = [
    { id: 'basic', name: t('admin.settings.tabs.basic'), icon: Settings },
    { id: 'users', name: t('admin.settings.tabs.users'), icon: Settings },
    { id: 'content', name: t('admin.settings.tabs.content'), icon: Settings },
    { id: 'email', name: t('admin.settings.tabs.email'), icon: Settings },
    { id: 'security', name: t('admin.settings.tabs.security'), icon: Settings },
    { id: 'theme', name: t('admin.settings.tabs.theme'), icon: Settings }
  ]

  const handleFileImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        importSettings(file)
      }
    }
    input.click()
  }

  const renderTabContent = () => {
    const commonProps = {
      settings,
      loading,
      onUpdate: handleSettingsChange  // 使用新的处理函数，不立即保存
    }

    switch (activeTab) {
      case 'basic':
        return <BasicSettings {...commonProps} ref={basicSettingsRef} />
      case 'users':
        return <UserSettings {...commonProps} />
      case 'content':
        return <ContentSettings {...commonProps} />
      case 'email':
        return <EmailSettings {...commonProps} />
      case 'security':
        return <SecuritySettings {...commonProps} />
      case 'theme':
        return <ThemeSettings {...commonProps} />
      default:
        return <BasicSettings {...commonProps} ref={basicSettingsRef} />
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.settings.title')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.settings.description')}</p>
        </div>

        {/* 操作按钮栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* 缓存状态显示 */}
              {!loading && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${isCacheHit ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <span className="text-gray-600">
                    {isCacheHit ? '缓存数据' : '实时数据'}
                    {cacheTimestamp && (
                      <span className="ml-1 text-xs">
                        ({new Date(cacheTimestamp).toLocaleTimeString()})
                      </span>
                    )}
                  </span>
                </div>
              )}
              
              <button
                onClick={forceRefresh}
                disabled={loading}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                title={isCacheHit ? '刷新设置缓存' : '刷新设置'}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{isCacheHit ? '刷新缓存' : '刷新'}</span>
              </button>
              
              <button
                onClick={exportSettings}
                className="flex items-center space-x-2 px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t('admin.settings.export')}</span>
              </button>
              
              <button
                onClick={handleFileImport}
                className="flex items-center space-x-2 px-4 py-2 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{t('admin.settings.import')}</span>
              </button>
              
              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('admin.settings.reset')}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={saving || Object.keys(pendingChanges).length === 0}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? t('admin.settings.saving') : t('admin.settings.save')}</span>
                {Object.keys(pendingChanges).length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-white text-purple-600 rounded-full">
                    {Object.keys(pendingChanges).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* 侧边导航 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* 保存状态指示 */}
        {saving && (
          <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t('admin.settings.saving')}</span>
          </div>
        )}

        {/* 重置设置确认弹窗 */}
        <DeleteConfirmModal
          isOpen={resetConfirmModal}
          onClose={() => setResetConfirmModal(false)}
          onConfirm={confirmResetToDefaults}
          title={t('admin.settings.resetConfirmTitle')}
          message={t('admin.settings.resetConfirm')}
          loading={saving}
          confirmText={t('admin.settings.reset')}
          cancelText={t('common.cancel')}
        />
      </div>
    </AdminLayout>
  )
}

export default AdminSettings