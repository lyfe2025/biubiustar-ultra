import { useEffect } from 'react'
import { useSiteInfo } from './useSettings'

/**
 * 自定义Hook用于设置页面标题
 * @param pageTitle 页面特定标题，如果为空则只显示网站名称
 */
export const usePageTitle = (pageTitle?: string) => {
  const { siteName } = useSiteInfo()
  
  useEffect(() => {
    const defaultSiteName = 'Biubiustar'
    const currentSiteName = siteName || defaultSiteName
    
    if (pageTitle) {
      document.title = `${pageTitle} - ${currentSiteName}`
    } else {
      document.title = currentSiteName
    }
    
    // 清理函数：组件卸载时恢复默认标题
    return () => {
      document.title = currentSiteName
    }
  }, [pageTitle, siteName])
}

/**
 * 设置网站图标
 * @param iconUrl 图标URL
 */
export const useFavicon = (iconUrl?: string) => {
  useEffect(() => {
    if (!iconUrl) return
    
    // 查找现有的favicon链接
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    
    if (!link) {
      // 如果不存在，创建新的favicon链接
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    
    link.href = iconUrl
  }, [iconUrl])
}