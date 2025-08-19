import { useLanguage } from './LanguageProvider'
import { getTranslation } from './translationLoader'

export const useTranslation = () => {
  const { language } = useLanguage()
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    return getTranslation(key, language, params)
  }
  
  return { t }
}