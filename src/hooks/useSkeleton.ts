import { useState, useEffect } from 'react'

/**
 * 骨架屏Hook
 * 管理骨架屏的显示状态和最小显示时间
 */
export const useSkeleton = (
  isLoading: boolean, 
  minDisplayTime: number = 800 // 最小显示时间800ms，避免闪烁
) => {
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minDisplayTime - elapsed)
      
      setTimeout(() => {
        setShowSkeleton(false)
      }, remainingTime)
    }
  }, [isLoading, startTime, minDisplayTime])

  return showSkeleton && isLoading
}

/**
 * 骨架屏动画样式类名
 */
export const skeletonClasses = {
  base: "bg-gray-300 animate-pulse rounded",
  text: "h-4 bg-gray-300 animate-pulse rounded",
  textSm: "h-3 bg-gray-200 animate-pulse rounded",
  avatar: "bg-gray-300 animate-pulse rounded-full",
  button: "h-8 bg-gray-300 animate-pulse rounded",
  badge: "h-6 bg-gray-300 animate-pulse rounded-full",
}
