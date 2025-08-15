import React from 'react'

/**
 * 用户管理页面骨架屏组件
 * 在数据加载时显示，提升用户体验
 */
const UserListSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 表格头部骨架 */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-7 gap-4">
          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* 表格内容骨架 - 模拟10行数据 */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-7 gap-4 items-center">
              {/* 用户信息列 */}
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>

              {/* 联系信息列 */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>

              {/* 状态列 */}
              <div>
                <div className="h-6 bg-gray-300 rounded-full w-16 animate-pulse"></div>
              </div>

              {/* 角色列 */}
              <div>
                <div className="h-6 bg-gray-300 rounded-full w-14 animate-pulse"></div>
              </div>

              {/* 统计列 */}
              <div className="space-y-1">
                <div className="h-3 bg-gray-300 rounded w-12 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-10 animate-pulse"></div>
              </div>

              {/* 注册时间列 */}
              <div className="space-y-1">
                <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>

              {/* 操作列 */}
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-300 rounded w-12 animate-pulse"></div>
                <div className="h-8 bg-gray-300 rounded w-12 animate-pulse"></div>
                <div className="h-8 bg-gray-300 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 分页骨架 */}
      <div className="bg-white px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 rounded w-48 animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
            <div className="flex space-x-1">
              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserListSkeleton
