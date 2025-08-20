import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { cn } from '../lib/utils'
import { 
  getResponsiveImageProps, 
  checkWebPSupport, 
  RESPONSIVE_IMAGE_CONFIGS,
  generateImageUrl,
  IMAGE_QUALITY
} from '../utils/imageUtils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  fallback?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  loading?: 'lazy' | 'eager'
  aspectRatio?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
  maxRetries?: number
  srcSet?: string
  sizes?: string
  enableWebP?: boolean
  webpSrc?: string
  responsive?: keyof typeof RESPONSIVE_IMAGE_CONFIGS
  quality?: keyof typeof IMAGE_QUALITY
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
  maxRetries = 2,
  srcSet,
  sizes,
  enableWebP = true,
  webpSrc,
  responsive,
  quality = 'medium'
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [currentSrcSet, setCurrentSrcSet] = useState(srcSet)
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // WebP 支持检测
  useEffect(() => {
    if (!enableWebP) {
      setSupportsWebP(false)
      return
    }

    checkWebPSupport().then(setSupportsWebP)
  }, [enableWebP])

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
      onError?.(new Error(`Image failed to load: ${src}`))
    } else {
      // 尝试加载fallback图片
      console.log(`尝试加载fallback图片: ${fallback}`)
      setCurrentSrc(fallback)
    }
  }, [src, fallback, retryCount, maxRetries, alt, onError])

  // 计算当前应该使用的图片源
  const { imageSrc: finalSrc, imageSrcSet: finalSrcSet, imageSizes: finalSizes } = useMemo(() => {
    if (isError) {
      return {
        imageSrc: fallback,
        imageSrcSet: undefined,
        imageSizes: undefined
      }
    }

    if (!isInView) {
      return {
        imageSrc: placeholder,
        imageSrcSet: undefined,
        imageSizes: undefined
      }
    }

    // 如果使用预设配置
    if (responsive) {
      const format = supportsWebP && enableWebP ? 'webp' : 'jpg'
      const responsiveProps = getResponsiveImageProps(src, responsive, format, IMAGE_QUALITY[quality])
      return {
        imageSrc: responsiveProps.src,
        imageSrcSet: responsiveProps.srcSet,
        imageSizes: responsiveProps.sizes
      }
    }

    // 如果支持WebP且提供了webpSrc，优先使用WebP
    if (supportsWebP && webpSrc) {
      return {
        imageSrc: webpSrc,
        imageSrcSet: srcSet ? convertSrcSetToWebP(srcSet) : undefined,
        imageSizes: sizes
      }
    }

    // 使用优化后的图片URL
    const optimizedSrc = generateImageUrl(
      currentSrc,
      undefined,
      supportsWebP && enableWebP ? 'webp' : undefined,
      IMAGE_QUALITY[quality]
    )

    return {
      imageSrc: optimizedSrc,
      imageSrcSet: currentSrcSet,
      imageSizes: sizes
    }
  }, [isError, isInView, fallback, placeholder, currentSrc, currentSrcSet, supportsWebP, webpSrc, responsive, src, quality, enableWebP, srcSet, sizes])

  // 将srcSet转换为WebP格式
  const convertSrcSetToWebP = useCallback((srcSetStr: string) => {
    return srcSetStr.replace(/\.(jpg|jpeg|png)/gi, '.webp')
  }, [])

  // 当src或srcSet改变时重置状态
  useEffect(() => {
    setCurrentSrc(src)
    setCurrentSrcSet(srcSet)
    setIsLoaded(false)
    setIsError(false)
    setRetryCount(0)
  }, [src, srcSet])

  return (
    <div 
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        ref={imgRef}
        src={finalSrc}
        srcSet={finalSrcSet}
        sizes={finalSizes}
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