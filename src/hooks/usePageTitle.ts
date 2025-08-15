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

