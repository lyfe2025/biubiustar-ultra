import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { cn } from '../lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  fallback?: string
  onLoad?: () => void
  onError?: () => void
  loading?: 'lazy' | 'eager'
  aspectRatio?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
  maxRetries?: number
}

const LazyImage: React.FC<LazyImageProps> = React.memo(({
  src,
  alt,
  className,
  placeholder = '/images/placeholder.svg',
  fallback = '/images/placeholder-activity.svg',
  onLoad,
  onError,
  loading = 'lazy',
  aspectRatio,
  objectFit = 'cover',
  maxRetries = 2
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // 如果浏览器不支持 Intersection Observer 或者设置为 eager 加载，直接显示图片
    if (!('IntersectionObserver' in window) || loading === 'eager') {
      setIsInView(true)
      return
    }

    // 创建 Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsInView(true)
          // 一旦进入视口就停止观察
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current)
          }
        }
      },
      {
        // 提前 100px 开始加载
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    // 开始观察
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setIsError(false)
    setRetryCount(0)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement
    console.warn(`图片加载失败: ${target.src}`, {
      originalSrc: src,
      currentSrc: target.src,
      retryCount,
      alt,
      error: event
    })

    // 如果当前加载的是原始图片且还有重试次数
    if (target.src === src && retryCount < maxRetries) {
      console.log(`重试加载图片 (${retryCount + 1}/${maxRetries}): ${src}`)
      setRetryCount(prev => prev + 1)
      // 添加随机参数避免缓存
      const retryUrl = `${src}${src.includes('?') ? '&' : '?'}retry=${Date.now()}`
      setCurrentSrc(retryUrl)
      return
    }

    // 如果重试失败或当前加载的是fallback，则显示错误状态
    if (target.src === fallback || retryCount >= maxRetries) {
      console.error(`图片最终加载失败: ${src}`, {
        fallbackSrc: fallback,
        retryCount,
        alt
      })
      setIsError(true)
      setIsLoaded(false)
      onError?.()
    } else {
      // 尝试加载fallback图片
      console.log(`尝试加载fallback图片: ${fallback}`)
      setCurrentSrc(fallback)
    }
  }, [src, fallback, retryCount, maxRetries, alt, onError])

  // 获取实际显示的图片源
  const imageSrc = useMemo(() => {
    if (isError) return fallback
    if (!isInView) return placeholder
    return currentSrc
  }, [isError, isInView, fallback, placeholder, currentSrc])

  // 当src改变时重置状态
  useEffect(() => {
    setCurrentSrc(src)
    setIsLoaded(false)
    setIsError(false)
    setRetryCount(0)
  }, [src])

  return (
    <div 
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'scale-down' && 'object-scale-down',
          objectFit === 'none' && 'object-none',
          isLoaded ? 'opacity-100' : 'opacity-70'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
      />
      
      {/* 加载状态指示器 */}
      {!isLoaded && !isError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* 错误状态指示器 */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs">加载失败</div>
          </div>
        </div>
      )}
    </div>
  )
})

export default LazyImage