import React, { useState } from 'react'
import { Bell, Mail, Smartphone, LogOut, Shield, Globe } from 'lucide-react'
import { useLanguage } from '../../contexts/language'
import { ProfileSettingsProps } from './types'

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  notificationSettings,
  onNotificationSettingsChange,
  onSignOut
}) => {
  const { t } = useLanguage()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleNotificationToggle = (type: keyof typeof notificationSettings) => {
    onNotificationSettingsChange({
      ...notificationSettings,
      [type]: !notificationSettings[type]
    })
  }

  const handleSignOutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmSignOut = async () => {
    setShowLogoutConfirm(false)
    await onSignOut()
  }

  const cancelSignOut = () => {
    setShowLogoutConfirm(false)
  }

  return (
    <div className="space-y-6">
      {/* 通知设置 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('profile.settings.notifications')}
          </h3>
        </div>

        <div className="space-y-4">
          {/* 邮件通知 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">{t('profile.settings.emailNotifications')}</div>
                <div className="text-sm text-gray-500">{t('profile.settings.emailNotificationsDesc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.email}
                onChange={() => handleNotificationToggle('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* 推送通知 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">{t('profile.settings.pushNotifications')}</div>
                <div className="text-sm text-gray-500">{t('profile.settings.pushNotificationsDesc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.push}
                onChange={() => handleNotificationToggle('push')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* 短信通知 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">{t('profile.settings.smsNotifications')}</div>
                <div className="text-sm text-gray-500">{t('profile.settings.smsNotificationsDesc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.sms}
                onChange={() => handleNotificationToggle('sms')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 隐私设置 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('profile.settings.privacy')}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900 mb-2">{t('profile.settings.profileVisibility')}</div>
            <div className="text-sm text-gray-500 mb-3">{t('profile.settings.profileVisibilityDesc')}</div>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="public">{t('profile.settings.visibility.public')}</option>
              <option value="friends">{t('profile.settings.visibility.friends')}</option>
              <option value="private">{t('profile.settings.visibility.private')}</option>
            </select>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900 mb-2">{t('profile.settings.activityPrivacy')}</div>
            <div className="text-sm text-gray-500 mb-3">{t('profile.settings.activityPrivacyDesc')}</div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="text-sm">{t('profile.settings.showOnlineStatus')}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 语言设置 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Globe className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('profile.settings.language')}
          </h3>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-900 mb-2">{t('profile.settings.preferredLanguage')}</div>
          <div className="text-sm text-gray-500 mb-3">{t('profile.settings.preferredLanguageDesc')}</div>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="zh">{t('profile.settings.languages.chinese')}</option>
            <option value="zh-TW">{t('profile.settings.languages.traditionalChinese')}</option>
            <option value="en">{t('profile.settings.languages.english')}</option>
            <option value="vi">{t('profile.settings.languages.vietnamese')}</option>
          </select>
        </div>
      </div>

      {/* 账户操作 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {t('profile.settings.account')}
        </h3>

        <div className="space-y-4">
          <button
            onClick={handleSignOutClick}
            className="flex items-center space-x-2 w-full px-4 py-3 text-left text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('profile.settings.signOut')}</span>
          </button>

          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
            <p>{t('profile.settings.accountNote')}</p>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('profile.settings.signOut')}</h3>
            <p className="text-gray-600 mb-6">
              {t('profile.confirmSignOut')}
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelSignOut}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {t('profile.settings.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileSettings
