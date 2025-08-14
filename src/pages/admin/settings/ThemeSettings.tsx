import React, { useState } from 'react'
import { Palette, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { SettingsSectionProps, ThemeSettingsData } from './types'

const ThemeSettings: React.FC<SettingsSectionProps> = ({ settings, loading, onUpdate }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<ThemeSettingsData>({
    primary_color: settings?.primary_color || '#8B5CF6',
    secondary_color: settings?.secondary_color || '#06B6D4',
    enable_dark_mode: settings?.enable_dark_mode || false,
    custom_css: settings?.custom_css || ''
  })

  // 同步settings变化到formData
  React.useEffect(() => {
    if (settings) {
      setFormData({
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        enable_dark_mode: settings.enable_dark_mode,
        custom_css: settings.custom_css || ''
      })
    }
  }, [settings])

  const handleChange = <K extends keyof ThemeSettingsData>(
    field: K,
    value: ThemeSettingsData[K]
  ) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }

  const presetColors = [
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' }
  ]

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Palette className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('admin.settings.theme.title')}
        </h3>
      </div>

      {/* 主色调 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.theme.primaryColor')}
        </label>
        <div className="flex items-center space-x-4 mb-3">
          <input
            type="color"
            value={formData.primary_color}
            onChange={(e) => handleChange('primary_color', e.target.value)}
            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={formData.primary_color}
            onChange={(e) => handleChange('primary_color', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {presetColors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleChange('primary_color', color.value)}
              className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.theme.primaryColorDescription')}
        </p>
      </div>

      {/* 辅助色 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.theme.secondaryColor')}
        </label>
        <div className="flex items-center space-x-4 mb-3">
          <input
            type="color"
            value={formData.secondary_color}
            onChange={(e) => handleChange('secondary_color', e.target.value)}
            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={formData.secondary_color}
            onChange={(e) => handleChange('secondary_color', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {presetColors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleChange('secondary_color', color.value)}
              className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.theme.secondaryColorDescription')}
        </p>
      </div>

      {/* 深色模式 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">
            {formData.enable_dark_mode ? <Eye className="w-4 h-4 inline mr-2" /> : <EyeOff className="w-4 h-4 inline mr-2" />}
            {t('admin.settings.theme.enableDarkMode')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {t('admin.settings.theme.enableDarkModeDescription')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enable_dark_mode}
            onChange={(e) => handleChange('enable_dark_mode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* 自定义CSS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.theme.customCSS')}
        </label>
        <textarea
          value={formData.custom_css}
          onChange={(e) => handleChange('custom_css', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={t('admin.settings.theme.customCSSPlaceholder')}
        />
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.theme.customCSSDescription')}
        </p>
      </div>

      {/* 颜色预览 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {t('admin.settings.theme.preview')}
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: formData.primary_color }}
            />
            <span className="text-sm text-gray-700">
              {t('admin.settings.theme.primaryColorPreview')}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: formData.secondary_color }}
            />
            <span className="text-sm text-gray-700">
              {t('admin.settings.theme.secondaryColorPreview')}
            </span>
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              className="px-4 py-2 text-white text-sm rounded-lg"
              style={{ backgroundColor: formData.primary_color }}
            >
              {t('admin.settings.theme.sampleButton')}
            </button>
            <button
              className="px-4 py-2 text-white text-sm rounded-lg"
              style={{ backgroundColor: formData.secondary_color }}
            >
              {t('admin.settings.theme.sampleSecondary')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeSettings
