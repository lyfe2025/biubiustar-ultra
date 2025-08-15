import { useLanguage } from './LanguageProvider'
import { getTranslation } from './translationLoader'

export const useTranslation = () => {
  const { language } = useLanguage()
  
  const t = (key: string): string => {
    return getTranslation(key, language)
  }
  
  return { t }
}