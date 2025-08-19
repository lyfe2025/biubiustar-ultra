import React from 'react'
import { useLanguage } from '../contexts/language'

const DebugLanguage = () => {
  const { t, language } = useLanguage()

  // 测试各种翻译键
  const testKeys = [
    'admin.auth.login.title',
    'admin.auth.login.subtitle',
    'admin.auth.login.email',
    'admin.title',
    'common.loading'
  ]

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">语言调试页面</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">当前语言: {language}</h2>
        <p>LocalStorage 语言设置: {localStorage.getItem('language')}</p>
        <p>浏览器语言: {navigator.language}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">翻译测试</h2>
        <div className="space-y-2">
          {testKeys.map(key => (
            <div key={key} className="p-3 bg-gray-100 rounded">
              <strong>{key}:</strong> {t(key)}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">直接测试 admin.auth.login.title</h2>
        <div className="p-3 bg-blue-100 rounded">
          <strong>admin.auth.login.title:</strong> {t('admin.auth.login.title')}
        </div>
        <div className="p-3 bg-blue-100 rounded mt-2">
          <strong>admin.auth.login.subtitle:</strong> {t('admin.auth.login.subtitle')}
        </div>
        <div className="p-3 bg-blue-100 rounded mt-2">
          <strong>admin.auth.login.email:</strong> {t('admin.auth.login.email')}
        </div>
      </div>
    </div>
  )
}

export default DebugLanguage