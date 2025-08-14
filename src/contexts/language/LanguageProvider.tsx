import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Language, LanguageContextType } from './types'
import { getTranslation } from './translationLoader'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // 从localStorage获取保存的语言设置
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['zh', 'zh-TW', 'en', 'vi'].includes(savedLanguage)) {
      return savedLanguage
    }
    
    // 根据浏览器语言自动选择
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.startsWith('zh')) {
      return browserLanguage.includes('tw') || browserLanguage.includes('hk') ? 'zh-TW' : 'zh'
    } else if (browserLanguage.startsWith('vi')) {
      return 'vi'
    } else {
      return 'en'
    }
  })

  // 保存语言设置到localStorage
  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language === 'zh-TW' ? 'zh-TW' : language
  }, [language])

  // 翻译函数
  const t = useCallback((key: string) => {
    return getTranslation(key, language)
  }, [language])

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageContext
