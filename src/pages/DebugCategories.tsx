import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/language'
import { ActivityService, ActivityCategory } from '../lib/activityService'
import { getCategoryName } from '../utils/categoryUtils'

const DebugCategories: React.FC = () => {
  const { language, setLanguage } = useLanguage()
  const [categories, setCategories] = useState<ActivityCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [apiUrl, setApiUrl] = useState('')
  const [rawApiResponse, setRawApiResponse] = useState<any>(null)

  // 加载分类数据
  const loadCategories = async () => {
    setLoading(true)
    try {
      console.log(`🔍 [DebugCategories] 当前语言: ${language}`)
      
      // 记录API URL
      const url = `/api/categories/activity?lang=${language}`
      setApiUrl(url)
      console.log(`🔍 [DebugCategories] API URL: ${url}`)
      
      // 直接调用fetch获取原始响应
      const response = await fetch(url)
      const rawData = await response.json()
      setRawApiResponse(rawData)
      console.log(`🔍 [DebugCategories] 原始API响应:`, rawData)
      
      // 调用ActivityService
      const categoriesData = await ActivityService.getActivityCategories(language)
      console.log(`🔍 [DebugCategories] ActivityService返回:`, categoriesData)
      
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('❌ [DebugCategories] 加载分类失败:', error)
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
  const testCategoryFromRaw = rawApiResponse?.data?.categories?.find((cat: any) => cat.id === '1ca52152-11f7-451c-9fa0-ca71a6771e51')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🐛 分类调试页面</h1>
      
      {/* 当前状态 */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">📊 当前状态</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>当前语言:</strong> {language}
          </div>
          <div>
            <strong>localStorage语言:</strong> {localStorage.getItem('language')}
          </div>
          <div>
            <strong>HTML lang:</strong> {document.documentElement.lang}
          </div>
          <div>
            <strong>浏览器语言:</strong> {navigator.language}
          </div>
          <div>
            <strong>API URL:</strong> {apiUrl}
          </div>
          <div>
            <strong>加载状态:</strong> {loading ? '加载中...' : '已完成'}
          </div>
        </div>
      </div>

      {/* 语言切换 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">🌐 语言切换测试</h2>
        <div className="flex gap-2">
          {[
            { code: 'zh', name: '简体中文' },
            { code: 'zh-TW', name: '繁體中文' },
            { code: 'en', name: 'English' },
            { code: 'vi', name: 'Tiếng Việt' }
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                console.log(`🔄 [DebugCategories] 切换语言到: ${lang.code}`)
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

      {/* 原始API响应 */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">📡 原始API响应</h2>
        <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-40">
          {JSON.stringify(rawApiResponse, null, 2)}
        </pre>
      </div>

      {/* ActivityService处理后的数据 */}
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">⚙️ ActivityService处理后的数据</h2>
        <div className="text-sm mb-3">
          <strong>分类数量:</strong> {categories.length}
        </div>
        <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-40">
          {JSON.stringify(categories, null, 2)}
        </pre>
      </div>

      {/* 测试分类详情 */}
      <div className="bg-purple-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">🎯 测试分类 (ID: 1ca52152-11f7-451c-9fa0-ca71a6771e51)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">原始API数据:</h3>
            {testCategoryFromRaw ? (
              <div className="bg-white p-3 rounded border text-sm">
                <div><strong>ID:</strong> {testCategoryFromRaw.id}</div>
                <div><strong>name:</strong> "{testCategoryFromRaw.name}"</div>
                <div><strong>description:</strong> "{testCategoryFromRaw.description}"</div>
              </div>
            ) : (
              <div className="text-gray-500">未找到测试分类</div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">ActivityService处理后:</h3>
            {testCategory ? (
              <div className="bg-white p-3 rounded border text-sm">
                <div><strong>ID:</strong> {testCategory.id}</div>
                <div><strong>name:</strong> "{testCategory.name}"</div>
                <div><strong>description:</strong> "{testCategory.description}"</div>
                <div><strong>getCategoryName():</strong> "{getCategoryName(testCategory, language)}"</div>
              </div>
            ) : (
              <div className="text-gray-500">未找到测试分类</div>
            )}
          </div>
        </div>
      </div>

      {/* 所有分类列表 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">📋 所有分类列表</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(category => (
            <div key={category.id} className="bg-white p-3 rounded border text-sm">
              <div className="font-medium">{getCategoryName(category, language)}</div>
              <div className="text-gray-500 text-xs mt-1">ID: {category.id}</div>
              <div className="text-gray-500 text-xs">原始name: "{category.name}"</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DebugCategories