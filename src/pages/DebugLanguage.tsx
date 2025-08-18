import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/language'
import { ActivityService } from '../lib/activityService'

const DebugLanguage: React.FC = () => {
  const { language, setLanguage } = useLanguage()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [lastApiCall, setLastApiCall] = useState<string>('')

  // 加载分类数据
  const loadCategories = async () => {
    setLoading(true)
    try {
      console.log(`🔍 [DebugLanguage] 当前语言: ${language}`)
      console.log(`🔍 [DebugLanguage] 开始调用 ActivityService.getActivityCategories(${language})`)
      
      const result = await ActivityService.getActivityCategories(language)
      console.log(`🔍 [DebugLanguage] API返回结果:`, result)
      
      setCategories(result)
      setLastApiCall(`${new Date().toLocaleTimeString()} - 语言: ${language}`)
    } catch (error) {
      console.error(`❌ [DebugLanguage] 加载分类失败:`, error)
    } finally {
      setLoading(false)
    }
  }

  // 语言变化时重新加载
  useEffect(() => {
    loadCategories()
  }, [language])

  // 查找测试分类
  const testCategory = categories.find(cat => cat.id === '1ca52152-11f7-451c-9fa0-ca71a6771e51')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🐛 语言调试页面</h1>
      
      {/* 当前状态 */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">📊 当前状态</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>当前语言:</strong> {language}
          </div>
          <div>
            <strong>localStorage语言:</strong> {localStorage.getItem('language') || '未设置'}
          </div>
          <div>
            <strong>最后API调用:</strong> {lastApiCall}
          </div>
          <div>
            <strong>分类数量:</strong> {categories.length}
          </div>
        </div>
      </div>

      {/* 语言切换按钮 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">🌐 语言切换测试</h2>
        <div className="flex gap-2">
          {[
            { code: 'zh', name: '简体中文' },
            { code: 'zh-TW', name: '繁体中文' },
            { code: 'en', name: 'English' },
            { code: 'vi', name: 'Tiếng Việt' }
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                console.log(`🔄 [DebugLanguage] 切换语言到: ${lang.code}`)
                setLanguage(lang.code as any)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                language === lang.code
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* 测试分类显示 */}
      {testCategory && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">🎯 测试分类 (ID: 1ca52152-11f7-451c-9fa0-ca71a6771e51)</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>当前显示名称:</strong> <span className="text-red-600 font-bold">{testCategory.name}</span>
            </div>
            <div>
              <strong>描述:</strong> {testCategory.description}
            </div>
            <div>
              <strong>中文名 (name_zh):</strong> {testCategory.name_zh || '未设置'}
            </div>
            <div>
              <strong>英文名 (name_en):</strong> {testCategory.name_en || '未设置'}
            </div>
            <div>
              <strong>繁体中文 (name_zh_tw):</strong> {testCategory.name_zh_tw || '未设置'}
            </div>
            <div>
              <strong>越南语 (name_vi):</strong> {testCategory.name_vi || '未设置'}
            </div>
          </div>
        </div>
      )}

      {/* 所有分类列表 */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">📝 所有分类 ({categories.length})</h2>
          {loading && <p className="text-blue-600 text-sm mt-1">加载中...</p>}
        </div>
        <div className="p-4">
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.slice(0, 10).map((cat, index) => (
                <div key={cat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{index + 1}. {cat.name}</span>
                    <span className="text-gray-500 text-sm ml-2">(ID: {cat.id.slice(0, 8)}...)</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {cat.description}
                  </div>
                </div>
              ))}
              {categories.length > 10 && (
                <p className="text-gray-500 text-sm text-center pt-2">
                  还有 {categories.length - 10} 个分类...
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              {loading ? '加载中...' : '暂无分类数据'}
            </p>
          )}
        </div>
      </div>

      {/* 手动刷新按钮 */}
      <div className="mt-6 text-center">
        <button
          onClick={loadCategories}
          disabled={loading}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '加载中...' : '🔄 手动刷新分类数据'}
        </button>
      </div>
    </div>
  )
}

export default DebugLanguage