// 合并翻译工具函数
export function mergeTranslations(...translations: any[]) {
  const merged: any = {}
  
  for (const translation of translations) {
    for (const [lang, content] of Object.entries(translation)) {
      if (!merged[lang]) {
        merged[lang] = {}
      }
      
      // 深度合并翻译内容
      merged[lang] = deepMerge(merged[lang], content)
    }
  }
  
  return merged
}

function deepMerge(target: any, source: any) {
  const result = { ...target }
  
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(result[key] || {}, value)
    } else {
      result[key] = value
    }
  }
  
  return result
}
