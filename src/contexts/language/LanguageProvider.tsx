import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Language, LanguageContextType } from './types'
import { getTranslation } from './translationLoader'
import { settingsService } from '../../services/SettingsService'

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
    // 使用浏览器语言作为临时默认值
    // 实际的语言优先级将在useEffect中处理：用户手动设置 > 系统默认语言 > 浏览器语言
    const browserLanguage = navigator.language.toLowerCase()
    let tempLanguage: Language
    if (browserLanguage.startsWith('zh')) {
      tempLanguage = browserLanguage.includes('tw') || browserLanguage.includes('hk') ? 'zh-TW' : 'zh'
    } else if (browserLanguage.startsWith('vi')) {
      tempLanguage = 'vi'
    } else {
      tempLanguage = 'en'
    }
    console.log('[LanguageProvider] 初始化：使用浏览器检测的临时语言:', tempLanguage, '浏览器语言:', browserLanguage)
    return tempLanguage
  })
  
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化语言设置：按优先级处理语言选择
  useEffect(() => {
    const initializeLanguage = async () => {
      console.log('[LanguageProvider] 开始初始化语言设置')
      
      // 检查用户是否已手动设置过语言（通过userLanguageChoice标记区分）
      const savedLanguage = localStorage.getItem('language')
      const isUserChoice = localStorage.getItem('userLanguageChoice') === 'true'
      console.log('[LanguageProvider] localStorage中的语言设置:', savedLanguage)
      console.log('[LanguageProvider] 是否为用户手动选择:', isUserChoice)
      
      if (savedLanguage && ['zh', 'zh-TW', 'en', 'vi'].includes(savedLanguage) && isUserChoice) {
        // 用户已手动设置，优先级最高
        console.log('[LanguageProvider] 用户已手动设置语言，使用:', savedLanguage)
        setLanguage(savedLanguage as Language)
        setIsInitialized(true)
        return
      }
      
      console.log('[LanguageProvider] 用户未手动设置语言，尝试从系统设置获取默认语言')
      console.log('[LanguageProvider] 当前临时语言（浏览器检测）:', language)
      
      try {
        // 尝试从系统设置获取默认语言
        const defaultLanguage = await settingsService.getSetting<string>('basic.defaultLanguage')
        console.log('[LanguageProvider] 从系统设置获取到的默认语言:', defaultLanguage)
        
        if (defaultLanguage) {
          // 转换语言代码格式（系统设置可能是'zh-CN'格式，需要转换为'zh'格式）
          let normalizedLanguage: Language
          switch (defaultLanguage.toLowerCase()) {
            case 'zh-cn':
            case 'zh':
              normalizedLanguage = 'zh'
              break
            case 'zh-tw':
            case 'zh-hk':
              normalizedLanguage = 'zh-TW'
              break
            case 'en':
            case 'en-us':
            case 'en-gb':
              normalizedLanguage = 'en'
              break
            case 'vi':
            case 'vi-vn':
              normalizedLanguage = 'vi'
              break
            default:
              // 如果系统设置的语言不支持，回退到浏览器语言检测
              console.log('[LanguageProvider] 系统设置的语言不支持，回退到浏览器语言:', language)
              normalizedLanguage = language
          }
          
          console.log('[LanguageProvider] 转换后的语言代码:', normalizedLanguage, '当前语言:', language)
          console.log('[LanguageProvider] 应用系统默认语言:', normalizedLanguage)
          setLanguage(normalizedLanguage)
        } else {
          console.log('[LanguageProvider] 系统设置中未找到默认语言，保持当前语言:', language)
        }
      } catch (error) {
        console.warn('[LanguageProvider] Failed to get default language from system settings:', error)
        // 获取系统设置失败，保持当前的浏览器语言检测结果
      }
      
      console.log('[LanguageProvider] 语言初始化完成')
      setIsInitialized(true)
    }
    
    initializeLanguage()
  }, [])
  
  // 保存语言设置到localStorage（仅在初始化完成后）
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('language', language)
      document.documentElement.lang = language === 'zh-TW' ? 'zh-TW' : language
      console.log('[LanguageProvider] 保存语言设置到localStorage:', language)
    }
  }, [language, isInitialized])

  // 翻译函数
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return getTranslation(key, language, params)
  }, [language])

  // 包装setLanguage函数，标记为用户手动选择
  const handleSetLanguage = useCallback((newLanguage: Language) => {
    console.log('[LanguageProvider] 用户手动设置语言:', newLanguage)
    setLanguage(newLanguage)
    // 标记为用户手动选择
    localStorage.setItem('userLanguageChoice', 'true')
  }, [])

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageContext
