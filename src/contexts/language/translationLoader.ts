// 翻译加载器 - 动态合并所有翻译模块
import type { Language, Translations } from './types'
import {
  navigationTranslations,
  homeTranslations,
  activitiesTranslations,
  authTranslations,
  postTranslations,
  profileTranslations,
  adminTranslations,
  trendingTranslations,
  aboutTranslations,
  commonTranslations
} from './translations'

// 合并所有翻译模块
const mergeTranslations = (...translationModules: any[]): Translations => {
  const languages: Language[] = ['zh', 'zh-TW', 'en', 'vi']
  const result: any = {}

  languages.forEach(lang => {
    result[lang] = {}
    translationModules.forEach(module => {
      if (module[lang]) {
        result[lang] = { ...result[lang], ...module[lang] }
      }
    })
  })

  return result as Translations
}

// 合并所有翻译
export const allTranslations = mergeTranslations(
  navigationTranslations,
  homeTranslations,
  activitiesTranslations,
  authTranslations,
  postTranslations,
  profileTranslations,
  adminTranslations,
  trendingTranslations,
  aboutTranslations,
  commonTranslations
)

// 获取翻译文本
export const getTranslation = (key: string, language: Language): string => {
  const keys = key.split('.')
  let translation: any = allTranslations[language]

  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k]
    } else {
      // 如果找不到翻译，返回key或英文翻译
      const fallback = language !== 'en' ? getTranslation(key, 'en') : key
      return fallback
    }
  }

  return typeof translation === 'string' ? translation : key
}
