import React, { useState } from 'react'
import UserListSkeleton from '../admin/UserListSkeleton'

/**
 * 骨架屏效果演示组件
 * 用于展示骨架屏的视觉效果
 */
const SkeletonDemo: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(true)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">骨架屏效果演示</h1>
        <p className="text-gray-600 mb-4">
          骨架屏是一种用户体验优化技术，在数据加载时显示页面结构，减少用户等待焦虑。
        </p>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setShowSkeleton(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showSkeleton 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            显示骨架屏
          </button>
          <button
            onClick={() => setShowSkeleton(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !showSkeleton 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            显示传统加载
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 骨架屏示例 */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-green-600">
            ✅ 骨架屏加载（推荐）
          </h2>
          <div className="bg-white rounded-lg border">
            {showSkeleton ? (
              <UserListSkeleton />
            ) : (
              <div className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-sm text-gray-900 font-medium">用户数据加载完成</div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium">张三</div>
                      <div className="text-gray-500">zhang@example.com</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium">李四</div>
                      <div className="text-gray-500">li@example.com</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium">王五</div>
                      <div className="text-gray-500">wang@example.com</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 传统加载示例 */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-red-600">
            ❌ 传统加载方式
          </h2>
          <div className="bg-white rounded-lg border">
            {showSkeleton ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-sm text-gray-900 font-medium">用户数据加载完成</div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium">张三</div>
                      <div className="text-gray-500">zhang@example.com</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium">李四</div>
                      <div className="text-gray-500">li@example.com</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium">王五</div>
                      <div className="text-gray-500">wang@example.com</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 对比说明 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 效果对比</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-700 mb-2">✅ 骨架屏优势</h4>
            <ul className="space-y-1 text-green-600">
              <li>• 用户感知加载更快</li>
              <li>• 减少页面跳跃感</li>
              <li>• 提供结构化预期</li>
              <li>• 降低用户焦虑</li>
              <li>• 现代化的用户体验</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-700 mb-2">❌ 传统加载问题</h4>
            <ul className="space-y-1 text-red-600">
              <li>• 空白页面等待时间长</li>
              <li>• 内容突然出现有跳跃感</li>
              <li>• 用户不知道要等多久</li>
              <li>• 容易产生焦虑情绪</li>
              <li>• 体验相对落后</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 实现说明 */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🛠️ 技术实现</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>核心技术：</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><code className="bg-gray-200 px-2 py-1 rounded">animate-pulse</code> CSS类实现脉动动画</li>
            <li><code className="bg-gray-200 px-2 py-1 rounded">bg-gray-300</code> 灰色占位块</li>
            <li><code className="bg-gray-200 px-2 py-1 rounded">useSkeleton</code> Hook管理显示状态</li>
            <li>最小显示时间避免闪烁</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SkeletonDemo
