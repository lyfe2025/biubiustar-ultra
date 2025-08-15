import { useEffect } from 'react';
import { useSiteInfo } from './useSettings';

/**
 * 自定义钩子：动态更新网站图标
 * 监听系统设置中的站点图标变化，并动态更新页面的favicon
 */
export const useFavicon = () => {
  const { siteIcon } = useSiteInfo();

  useEffect(() => {
    // 获取或创建favicon link元素
    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (!faviconLink) {
      // 如果不存在favicon link，创建一个新的
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/png';
      document.head.appendChild(faviconLink);
    }

    // 更新favicon的href
    if (siteIcon && siteIcon.trim() !== '') {
      faviconLink.href = siteIcon;
    } else {
      // 如果没有设置图标，使用默认图标
      faviconLink.href = '/logo.png';
    }
  }, [siteIcon]);
};