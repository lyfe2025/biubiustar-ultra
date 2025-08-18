// 翻译加载器 - 动态合并所有翻译模块
import type { Language, Translations } from './types'
import {
  navigationTranslations,
  homeTranslations,
  activitiesTranslations,
  authTranslations,
  postTranslations,
  profileTranslations,
  adminAuthTranslations,
  adminDashboardTranslations,
  adminUsersTranslations,
  adminContentTranslations,
  adminActivitiesTranslations,
  adminContactsTranslations,
  adminSettingsTranslations,
  adminSecurityTranslations,
  adminLogsTranslations,
  trendingTranslations,
  aboutCoreTranslations,
  aboutCompanyTranslations,
  aboutTeamTranslations,
  aboutContactTranslations,
  commonTranslations
} from './translations'

// 深度合并对象的辅助函数
const deepMerge = (target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> => {
  const result = { ...target }
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
        result[key] = deepMerge(result[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
      } else {
        result[key] = { ...source[key] }
      }
    } else {
      result[key] = source[key]
    }
  })
  
  return result
}

// 合并所有翻译模块
export const mergeTranslations = (...translationModules: Record<string, unknown>[]): Translations => {
  const languages: Language[] = ['zh', 'zh-TW', 'en', 'vi']
  const result: Record<string, Record<string, unknown>> = {}

  languages.forEach(lang => {
    result[lang] = {}
    translationModules.forEach(module => {
      if (module[lang]) {
        result[lang] = deepMerge(result[lang] as Record<string, unknown>, module[lang] as Record<string, unknown>)
      }
    })
  })

  return result as unknown as Translations
}

// 合并所有翻译
export const allTranslations = mergeTranslations(
  navigationTranslations,
  homeTranslations,
  activitiesTranslations,
  authTranslations,
  postTranslations,
  profileTranslations,
  adminAuthTranslations,
  adminDashboardTranslations,
  adminUsersTranslations,
  adminContentTranslations,
  adminActivitiesTranslations,
  adminContactsTranslations,
  adminSettingsTranslations,
  adminSecurityTranslations,
  adminLogsTranslations,
  trendingTranslations,
  aboutCoreTranslations,
  aboutCompanyTranslations,
  aboutTeamTranslations,
  aboutContactTranslations,
  commonTranslations
)



// 获取翻译文本
export const getTranslation = (key: string, language: Language): string => {
  // 确保翻译数据存在
  if (!allTranslations || !allTranslations[language]) {
    // 尝试回退到英文
    if (language !== 'en' && allTranslations?.en) {
      return getTranslation(key, 'en')
    }
    return key
  }
  
  const keys = key.split('.')
  let translation: Record<string, unknown> = allTranslations[language] as Record<string, unknown>

  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k] as Record<string, unknown>
    } else {
      // 如果找不到翻译，尝试英文回退
      if (language !== 'en' && allTranslations?.en) {
        return getTranslation(key, 'en')
      }
      return key
    }
  }

  return typeof translation === 'string' ? translation : key
}
