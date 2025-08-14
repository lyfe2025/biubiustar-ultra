import React from 'react'
import { Settings, Save, RefreshCw, Download, Upload, Trash2 } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout'
import { useLanguage } from '../../../contexts/language'
import { useSystemSettings } from './hooks/useSystemSettings'
import BasicSettings from './BasicSettings'
import UserSettings from './UserSettings'
import ContentSettings from './ContentSettings'
import EmailSettings from './EmailSettings'
import SecuritySettings from './SecuritySettings'
import ThemeSettings from './ThemeSettings'

const AdminSettings = () => {
  const { t } = useLanguage()
  const {
    // 数据状态
    settings,
    loading,
    saving,
    
    // UI状态
    activeTab,
    setActiveTab,
    
    // 操作方法
    updateSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    testEmailConfig,
    clearCache,
    fetchSettings
  } = useSystemSettings()

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
      onUpdate: updateSettings
    }

    switch (activeTab) {
      case 'basic':
        return <BasicSettings {...commonProps} />
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
        return <BasicSettings {...commonProps} />
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
              <button
                onClick={fetchSettings}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{t('admin.settings.refresh')}</span>
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
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('admin.settings.reset')}</span>
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
      </div>
    </AdminLayout>
  )
}

export default AdminSettings