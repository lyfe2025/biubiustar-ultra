import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Settings, 
  Save,
  RefreshCw,
  Globe,
  Shield,
  Mail,
  Database,
  Image,
  Bell,
  Users,
  FileText,
  Palette,
  Server,
  Key,
  AlertTriangle,
  CheckCircle,
  Info,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '../../lib/utils'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminService } from '../../services/AdminService'

interface SystemSettings {
  // 基本设置
  site_name: string
  site_description: string
  site_logo?: string
  site_favicon?: string
  
  // 用户设置
  allow_registration: boolean
  require_email_verification: boolean
  default_user_role: 'user' | 'moderator'
  max_posts_per_day: number
  max_file_size_mb: number
  
  // 内容设置
  enable_content_moderation: boolean
  auto_approve_posts: boolean
  enable_comments: boolean
  enable_likes: boolean
  enable_shares: boolean
  
  // 邮件设置
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  smtp_encryption: 'none' | 'tls' | 'ssl'
  from_email: string
  from_name: string
  
  // 存储设置
  storage_provider: 'local' | 'supabase' | 's3'
  max_storage_size_gb: number
  allowed_file_types: string[]
  
  // 安全设置
  enable_rate_limiting: boolean
  max_login_attempts: number
  session_timeout_hours: number
  enable_two_factor: boolean
  
  // 通知设置
  enable_push_notifications: boolean
  enable_email_notifications: boolean
  enable_sms_notifications: boolean
  
  // 主题设置
  primary_color: string
  secondary_color: string
  enable_dark_mode: boolean
  custom_css?: string
  
  // 语言设置
  default_language: 'zh' | 'en' | 'vi'
  supported_languages: string[]
  
  // 缓存设置
  enable_redis_cache: boolean
  cache_ttl_minutes: number
  
  // 备份设置
  enable_auto_backup: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  backup_retention_days: number
}

const AdminSettings = () => {
  const { t } = useLanguage()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [showPassword, setShowPassword] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // 检查管理员登录状态
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin')
      return
    }

    // 获取系统设置
    const fetchSettings = async () => {
      try {
        const settingsData = await adminService.getSettings()
        setSettings(settingsData as SystemSettings)
      } catch (error) {
        console.error('获取系统设置失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [navigate])

  const handleSaveSettings = async () => {
    if (!settings) return
    
    setSaving(true)
    try {
      await adminService.saveSettings(settings)
      alert('设置保存成功！')
    } catch (error) {
      console.error('保存设置失败:', error)
      alert('保存设置失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!settings.from_email) {
      alert('请先配置发件人邮箱')
      return
    }
    
    setTestingEmail(true)
    try {
      const result = await adminService.testEmail(settings.from_email)
      if (result.success) {
        alert('测试邮件发送成功，请检查您的邮箱')
      } else {
        alert(result.message || '发送测试邮件失败')
      }
    } catch (error) {
      console.error('发送测试邮件失败:', error)
      alert('发送测试邮件失败')
    } finally {
      setTestingEmail(false)
    }
  }

  const handleBackupDatabase = async () => {
    setIsBackingUp(true)
    setBackupProgress(0)
    
    try {
      // 模拟备份进度
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      alert('数据库备份完成！')
    } catch (error) {
      console.error('备份失败:', error)
      alert('备份失败，请重试')
    } finally {
      setIsBackingUp(false)
      setBackupProgress(0)
    }
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  const tabs = [
    { id: 'basic', label: t('admin.settings.tabs.basic'), icon: Settings },
    { id: 'users', label: t('admin.settings.tabs.users'), icon: Users },
    { id: 'content', label: t('admin.settings.tabs.content'), icon: FileText },
    { id: 'email', label: t('admin.settings.tabs.email'), icon: Mail },
    { id: 'storage', label: t('admin.settings.tabs.storage'), icon: Database },
    { id: 'security', label: t('admin.settings.tabs.security'), icon: Shield },
    { id: 'notifications', label: t('admin.settings.tabs.notifications'), icon: Bell },
    { id: 'theme', label: t('admin.settings.tabs.theme'), icon: Palette },
    { id: 'language', label: t('admin.settings.tabs.language'), icon: Globe },
    { id: 'cache', label: t('admin.settings.tabs.cache'), icon: Server },
    { id: 'backup', label: t('admin.settings.tabs.backup'), icon: Download }
  ]

  if (loading || !settings) {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.settings.title')}</h1>
            <p className="text-gray-600">{t('admin.settings.description')}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? t('admin.settings.saving') : t('admin.settings.save')}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 标签页导航 */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* 设置内容 */}
          <div className="p-6">
            {/* 基本设置 */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.basic.siteName')}
                    </label>
                    <input
                      type="text"
                      value={settings.site_name}
                      onChange={(e) => updateSetting('site_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.basic.siteDescription')}
                    </label>
                    <textarea
                      value={settings.site_description}
                      onChange={(e) => updateSetting('site_description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.basic.siteLogo')}
                    </label>
                    <div className="flex items-center space-x-4">
                      {settings.site_logo && (
                        <img
                          src={settings.site_logo}
                          alt="Logo"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>{t('admin.settings.basic.uploadLogo')}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.basic.siteFavicon')}
                    </label>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>{t('admin.settings.basic.uploadFavicon')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 用户设置 */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.settings.users.allowRegistration')}
                        </label>
                        <p className="text-sm text-gray-500">{t('admin.settings.users.allowRegistrationDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.allow_registration}
                        onChange={(e) => updateSetting('allow_registration', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.settings.users.requireEmailVerification')}
                        </label>
                        <p className="text-sm text-gray-500">{t('admin.settings.users.requireEmailVerificationDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.require_email_verification}
                        onChange={(e) => updateSetting('require_email_verification', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.settings.users.defaultUserRole')}
                      </label>
                      <select
                        value={settings.default_user_role}
                        onChange={(e) => updateSetting('default_user_role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="user">{t('admin.settings.users.roleUser')}</option>
                        <option value="moderator">{t('admin.settings.users.roleModerator')}</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.users.maxPostsPerDay')}
                    </label>
                    <input
                      type="number"
                      value={settings.max_posts_per_day}
                      onChange={(e) => updateSetting('max_posts_per_day', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.users.maxFileSize')}
                    </label>
                    <input
                      type="number"
                      value={settings.max_file_size_mb}
                      onChange={(e) => updateSetting('max_file_size_mb', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 内容设置 */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.settings.content.enableContentModeration')}
                        </label>
                        <p className="text-sm text-gray-500">{t('admin.settings.content.enableContentModerationDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enable_content_moderation}
                        onChange={(e) => updateSetting('enable_content_moderation', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.settings.content.autoApproveContent')}
                        </label>
                        <p className="text-sm text-gray-500">{t('admin.settings.content.autoApproveContentDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.auto_approve_posts}
                        onChange={(e) => updateSetting('auto_approve_posts', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.settings.content.enableComments')}
                        </label>
                        <p className="text-sm text-gray-500">{t('admin.settings.content.enableCommentsDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enable_comments}
                        onChange={(e) => updateSetting('enable_comments', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.settings.content.enableLikes')}
                        </label>
                        <p className="text-sm text-gray-500">{t('admin.settings.content.enableLikesDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enable_likes}
                        onChange={(e) => updateSetting('enable_likes', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.settings.content.enableSharing')}
                        </label>
                        <p className="text-sm text-gray-500">{t('admin.settings.content.enableSharingDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enable_shares}
                        onChange={(e) => updateSetting('enable_shares', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 邮件设置 */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.email.smtpHost')}
                    </label>
                    <input
                      type="text"
                      value={settings.smtp_host}
                      onChange={(e) => updateSetting('smtp_host', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.email.smtpPort')}
                    </label>
                    <input
                      type="number"
                      value={settings.smtp_port}
                      onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.email.smtpUsername')}
                    </label>
                    <input
                      type="text"
                      value={settings.smtp_username}
                      onChange={(e) => updateSetting('smtp_username', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.email.smtpPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={settings.smtp_password}
                        onChange={(e) => updateSetting('smtp_password', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.email.smtpEncryption')}
                    </label>
                    <select
                      value={settings.smtp_encryption}
                      onChange={(e) => updateSetting('smtp_encryption', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="none">{t('admin.settings.email.encryptionNone')}</option>
                      <option value="tls">{t('admin.settings.email.encryptionTLS')}</option>
                      <option value="ssl">{t('admin.settings.email.encryptionSSL')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.email.fromEmail')}
                    </label>
                    <input
                      type="email"
                      value={settings.from_email}
                      onChange={(e) => updateSetting('from_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.email.fromName')}
                    </label>
                    <input
                      type="text"
                      value={settings.from_name}
                      onChange={(e) => updateSetting('from_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {testingEmail ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span>{testingEmail ? t('admin.settings.email.sending') : t('admin.settings.email.sendTestEmail')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 存储设置 */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.storage.provider')}
                    </label>
                    <select
                      value={settings.storage_provider}
                      onChange={(e) => updateSetting('storage_provider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="local">{t('admin.settings.storage.local')}</option>
                      <option value="supabase">{t('admin.settings.storage.supabase')}</option>
                      <option value="s3">{t('admin.settings.storage.s3')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.storage.maxSize')}
                    </label>
                    <input
                      type="number"
                      value={settings.max_storage_size_gb}
                      onChange={(e) => updateSetting('max_storage_size_gb', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.settings.storage.allowedTypes')}
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf', 'doc', 'docx', 'txt'].map(type => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.allowed_file_types.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSetting('allowed_file_types', [...settings.allowed_file_types, type])
                            } else {
                              updateSetting('allowed_file_types', settings.allowed_file_types.filter(t => t !== type))
                            }
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 安全设置 */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.settings.security.enableRateLimit')}
                        </label>
                        <p className="text-sm text-gray-500">{t('admin.settings.security.rateLimitDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enable_rate_limiting}
                        onChange={(e) => updateSetting('enable_rate_limiting', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.settings.security.enableTwoFactor')}
                        </label>
                        <p className="text-sm text-gray-500">{t('admin.settings.security.twoFactorDesc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enable_two_factor}
                        onChange={(e) => updateSetting('enable_two_factor', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.settings.security.maxLoginAttempts')}
                      </label>
                      <input
                        type="number"
                        value={settings.max_login_attempts}
                        onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.settings.security.sessionTimeout')}
                      </label>
                      <input
                        type="number"
                        value={settings.session_timeout_hours}
                        onChange={(e) => updateSetting('session_timeout_hours', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 通知设置 */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {t('admin.settings.notifications.pushNotifications')}
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.enable_push_notifications}
                      onChange={(e) => updateSetting('enable_push_notifications', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {t('admin.settings.notifications.emailNotifications')}
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.enable_email_notifications}
                      onChange={(e) => updateSetting('enable_email_notifications', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {t('admin.settings.notifications.smsNotifications')}
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.enable_sms_notifications}
                      onChange={(e) => updateSetting('enable_sms_notifications', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 主题设置 */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.theme.primaryColor')}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primary_color}
                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.theme.secondaryColor')}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.secondary_color}
                        onChange={(e) => updateSetting('secondary_color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.secondary_color}
                        onChange={(e) => updateSetting('secondary_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {t('admin.settings.theme.enableDarkMode')}
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.enable_dark_mode}
                      onChange={(e) => updateSetting('enable_dark_mode', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.settings.theme.customCss')}
                  </label>
                  <textarea
                    value={settings.custom_css || ''}
                    onChange={(e) => updateSetting('custom_css', e.target.value)}
                    rows={8}
                    placeholder={t('admin.settings.theme.customCssPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* 语言设置 */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.language.defaultLanguage')}
                    </label>
                    <select
                      value={settings.default_language}
                      onChange={(e) => updateSetting('default_language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="zh">{t('admin.settings.language.chinese')}</option>
                      <option value="en">{t('admin.settings.language.english')}</option>
                      <option value="vi">{t('admin.settings.language.vietnamese')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.language.supportedLanguages')}
                    </label>
                    <div className="space-y-2">
                      {[
                        {code: 'zh', name: t('admin.settings.language.chinese')}, 
                        {code: 'en', name: t('admin.settings.language.english')}, 
                        {code: 'vi', name: t('admin.settings.language.vietnamese')}
                      ].map(lang => (
                        <label key={lang.code} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={settings.supported_languages.includes(lang.code)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateSetting('supported_languages', [...settings.supported_languages, lang.code])
                              } else {
                                updateSetting('supported_languages', settings.supported_languages.filter(l => l !== lang.code))
                              }
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{lang.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 缓存设置 */}
            {activeTab === 'cache' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {t('admin.settings.cache.enableRedis')}
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.enable_redis_cache}
                      onChange={(e) => updateSetting('enable_redis_cache', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.cache.expiration')}
                    </label>
                    <input
                      type="number"
                      value={settings.cache_ttl_minutes}
                      onChange={(e) => updateSetting('cache_ttl_minutes', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 备份设置 */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t('admin.settings.backup.enableAutoBackup')}</h3>
                      <p className="text-sm text-gray-500">{t('admin.settings.backup.enableAutoBackupDesc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.enable_auto_backup || false}
                        onChange={(e) => updateSetting('enable_auto_backup', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.backup.frequency')}
                    </label>
                    <select
                      value={settings?.backup_frequency || 'daily'}
                      onChange={(e) => updateSetting('backup_frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="daily">{t('admin.settings.backup.daily')}</option>
                      <option value="weekly">{t('admin.settings.backup.weekly')}</option>
                      <option value="monthly">{t('admin.settings.backup.monthly')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.settings.backup.retentionDays')}
                    </label>
                    <input
                      type="number"
                      value={settings?.backup_retention_days || 30}
                      onChange={(e) => updateSetting('backup_retention_days', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <button
                      onClick={handleBackupDatabase}
                      disabled={isBackingUp}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isBackingUp ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{isBackingUp ? t('admin.settings.backup.backing') : t('admin.settings.backup.backupNow')}</span>
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSettings