// 语言相关类型定义
export type Language = 'zh' | 'zh-TW' | 'en' | 'vi'

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export interface TranslationModule {
  [key: string]: string | TranslationModule
}

export interface Translations {
  zh: TranslationModule
  'zh-TW': TranslationModule
  en: TranslationModule
  vi: TranslationModule
}
