/**
 * 图片优化工具函数
 */

// 响应式图片断点配置
export const IMAGE_BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

// 图片质量配置
export const IMAGE_QUALITY = {
  low: 60,
  medium: 75,
  high: 85,
  max: 95
} as const

/**
 * 生成响应式图片的srcSet
 * @param baseUrl 基础图片URL
 * @param widths 需要的宽度数组
 * @param format 图片格式 (webp, jpg, png)
 * @param quality 图片质量
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[],
  format: 'webp' | 'jpg' | 'png' = 'webp',
  quality: number = IMAGE_QUALITY.medium
): string {
  return widths
    .map(width => {
      const url = generateImageUrl(baseUrl, width, format, quality)
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * 生成优化后的图片URL
 * @param baseUrl 基础图片URL
 * @param width 图片宽度
 * @param format 图片格式
 * @param quality 图片质量
 */
export function generateImageUrl(
  baseUrl: string,
  width?: number,
  format?: 'webp' | 'jpg' | 'png',
  quality?: number
): string {
  // 如果是外部URL或已经包含参数的URL，直接返回
  if (baseUrl.startsWith('http') || baseUrl.includes('?')) {
    return baseUrl
  }

  const params = new URLSearchParams()
  
  if (width) {
    params.append('w', width.toString())
  }
  
  if (format) {
    params.append('f', format)
  }
  
  if (quality) {
    params.append('q', quality.toString())
  }

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * 生成常用的响应式图片配置
 */
export const RESPONSIVE_IMAGE_CONFIGS = {
  // 头像图片
  avatar: {
    widths: [40, 80, 120] as const,
    defaultWidth: 80,
    sizes: '(max-width: 768px) 40px, (max-width: 1024px) 60px, 80px'
  },
  
  // 卡片图片
  card: {
    widths: [300, 600, 900] as const,
    defaultWidth: 600,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
  },
  
  // 活动横幅
  banner: {
    widths: [640, 1280, 1920] as const,
    defaultWidth: 1280,
    sizes: '100vw'
  },
  
  // 缩略图
  thumbnail: {
    widths: [150, 300, 450] as const,
    defaultWidth: 300,
    sizes: '(max-width: 768px) 150px, (max-width: 1024px) 200px, 300px'
  },
  
  // 详情页图片
  detail: {
    widths: [400, 800, 1200] as const,
    defaultWidth: 800,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw'
  }
} as const

/**
 * 根据配置类型生成响应式图片属性
 * @param baseUrl 基础图片URL
 * @param configType 配置类型
 * @param format 图片格式
 * @param quality 图片质量
 */
export function getResponsiveImageProps(
  baseUrl: string,
  type: keyof typeof RESPONSIVE_IMAGE_CONFIGS,
  format: 'webp' | 'jpg' = 'jpg',
  quality: number = IMAGE_QUALITY.medium
) {
  const config = RESPONSIVE_IMAGE_CONFIGS[type]
  
  return {
    src: generateImageUrl(baseUrl, config.defaultWidth, format, quality),
    srcSet: generateSrcSet(baseUrl, [...config.widths], format, quality),
    sizes: config.sizes
  }
}

/**
 * 检测浏览器是否支持WebP格式
 */
export function checkWebPSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * 预加载图片
 * @param src 图片URL
 * @param srcSet 响应式图片集
 */
export function preloadImage(src: string, srcSet?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => resolve()
    img.onerror = reject
    
    if (srcSet) {
      img.srcset = srcSet
    }
    img.src = src
  })
}

/**
 * 批量预加载图片
 * @param images 图片配置数组
 */
export async function preloadImages(images: Array<{ src: string; srcSet?: string }>): Promise<void> {
  const promises = images.map(({ src, srcSet }) => preloadImage(src, srcSet))
  await Promise.allSettled(promises)
}

/**
 * 获取图片的主要颜色（用于占位符背景）
 * @param imageUrl 图片URL
 */
export function getImageDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          resolve('#f3f4f6') // 默认灰色
          return
        }
        
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        let r = 0, g = 0, b = 0
        const pixelCount = data.length / 4
        
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }
        
        r = Math.floor(r / pixelCount)
        g = Math.floor(g / pixelCount)
        b = Math.floor(b / pixelCount)
        
        resolve(`rgb(${r}, ${g}, ${b})`)
      } catch (error) {
        resolve('#f3f4f6') // 默认灰色
      }
    }
    
    img.onerror = () => resolve('#f3f4f6')
    img.src = imageUrl
  })
}