import { format } from 'date-fns'
import { 
  enUS, 
  zhCN, 
  zhTW 
} from 'date-fns/locale'

// 语言到 date-fns locale 的映射
const localeMap = {
  'zh': zhCN,
  'zh-TW': zhTW,
  'en': enUS,
  'vi': enUS // 越南语暂时使用英文，因为 date-fns 没有越南语支持
}

// 翻译函数类型
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string

/**
 * 根据语言格式化日期
 * @param date 日期对象或日期字符串
 * @param formatStr 格式化字符串，默认为 'PPP' (例如: "April 29th, 2023")
 * @param language 语言代码
 * @returns 格式化后的日期字符串
 */
export const formatDateByLanguage = (
  date: Date | string | number, 
  formatStr: string = 'PPP', 
  language: string = 'en'
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const locale = localeMap[language as keyof typeof localeMap] || enUS
  
  try {
    return format(dateObj, formatStr, { locale })
  } catch (error) {
    console.error('日期格式化失败:', error)
    // 如果格式化失败，返回默认格式
    return dateObj.toLocaleDateString()
  }
}

/**
 * 格式化加入时间（使用 'PPP' 格式）
 * @param date 日期对象或日期字符串
 * @param language 语言代码
 * @returns 格式化后的加入时间字符串
 */
export const formatJoinDate = (
  date: Date | string | number, 
  language: string = 'en'
): string => {
  return formatDateByLanguage(date, 'PPP', language)
}

/**
 * 格式化相对时间（例如：2 天前）
 * @param date 日期对象或日期字符串
 * @param language 语言代码
 * @param t 翻译函数
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (
  date: Date | string | number, 
  language: string = 'en',
  t?: TranslationFunction
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  // 如果有翻译函数，使用翻译函数
  if (t) {
    if (diffInDays === 0) return t('common.time.today')
    if (diffInDays === 1) return t('common.time.yesterday')
    if (diffInDays < 7) return t('common.time.days', { count: diffInDays })
    if (diffInDays < 30) return t('common.time.weeks', { count: Math.floor(diffInDays / 7) })
    if (diffInDays < 365) return t('common.time.months', { count: Math.floor(diffInDays / 30) })
    return t('common.time.years', { count: Math.floor(diffInDays / 365) })
  }
  
  // 如果没有翻译函数，使用硬编码的文本（向后兼容）
  if (language === 'zh' || language === 'zh-TW') {
    if (diffInDays === 0) return '今天'
    if (diffInDays === 1) return '昨天'
    if (diffInDays < 7) return `${diffInDays} 天前`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} 周前`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} 个月前`
    return `${Math.floor(diffInDays / 365)} 年前`
  } else if (language === 'vi') {
    if (diffInDays === 0) return 'Hôm nay'
    if (diffInDays === 1) return 'Hôm qua'
    if (diffInDays < 7) return `${diffInDays} ngày trước`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`
    return `${Math.floor(diffInDays / 365)} năm trước`
  } else {
    // 英文
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }
}
