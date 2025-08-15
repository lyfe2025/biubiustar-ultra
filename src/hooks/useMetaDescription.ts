import { useEffect } from 'react'
import { useSiteInfo } from './useSettings'

/**
 * 自定义Hook用于设置页面Meta描述
 * @param pageDescription 页面特定描述，如果为空则使用站点描述
 */
export const useMetaDescription = (pageDescription?: string) => {
  const { siteDescription } = useSiteInfo()
  
  useEffect(() => {
    const defaultDescription = '一个现代化的社交平台'
    const currentDescription = pageDescription || siteDescription || defaultDescription
    
    // 查找现有的description meta标签
    let metaDescription = document.querySelector('meta[name="description"]')
    
    if (!metaDescription) {
      // 如果不存在，创建新的meta标签
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    
    // 更新description内容，确保长度适合SEO（150-160字符）
    const truncatedDescription = currentDescription.length > 160 
      ? currentDescription.substring(0, 157) + '...' 
      : currentDescription
    
    metaDescription.setAttribute('content', truncatedDescription)
    
    // 清理函数：组件卸载时恢复默认描述
    return () => {
      if (metaDescription) {
        const defaultDesc = siteDescription || defaultDescription
        const truncatedDefault = defaultDesc.length > 160 
          ? defaultDesc.substring(0, 157) + '...' 
          : defaultDesc
        metaDescription.setAttribute('content', truncatedDefault)
      }
    }
  }, [pageDescription, siteDescription])
}

/**
 * 设置Open Graph和Twitter卡片的meta标签
 * @param title 页面标题
 * @param description 页面描述
 * @param imageUrl 分享图片URL（可选）
 */
export const useSocialMetaTags = (
  title?: string, 
  description?: string, 
  imageUrl?: string
) => {
  const { siteDescription, siteName } = useSiteInfo()
  
  useEffect(() => {
    const finalTitle = title || siteName || 'BiuBiuStar'
    const finalDescription = description || siteDescription || '一个现代化的社交平台'
    const truncatedDescription = finalDescription.length > 200 
      ? finalDescription.substring(0, 197) + '...' 
      : finalDescription
    
    // Open Graph标签
    const setOrCreateMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`)
      if (!metaTag) {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('property', property)
        document.head.appendChild(metaTag)
      }
      metaTag.setAttribute('content', content)
    }
    
    // Twitter Card标签
    const setOrCreateTwitterTag = (name: string, content: string) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`)
      if (!metaTag) {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('name', name)
        document.head.appendChild(metaTag)
      }
      metaTag.setAttribute('content', content)
    }
    
    // 设置Open Graph标签
    setOrCreateMetaTag('og:title', finalTitle)
    setOrCreateMetaTag('og:description', truncatedDescription)
    setOrCreateMetaTag('og:type', 'website')
    setOrCreateMetaTag('og:url', window.location.href)
    
    if (imageUrl) {
      setOrCreateMetaTag('og:image', imageUrl)
    }
    
    // 设置Twitter Card标签
    setOrCreateTwitterTag('twitter:card', 'summary_large_image')
    setOrCreateTwitterTag('twitter:title', finalTitle)
    setOrCreateTwitterTag('twitter:description', truncatedDescription)
    
    if (imageUrl) {
      setOrCreateTwitterTag('twitter:image', imageUrl)
    }
    
  }, [title, description, imageUrl, siteDescription, siteName])
}
