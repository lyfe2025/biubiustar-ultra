// 合并翻译工具函数
export function mergeTranslations(...translations: Record<string, unknown>[]) {
  const merged: Record<string, Record<string, unknown>> = {}
  
  for (const translation of translations) {
    for (const [lang, content] of Object.entries(translation)) {
      if (!merged[lang]) {
        merged[lang] = {}
      }
      
      // 深度合并翻译内容
      merged[lang] = deepMerge(merged[lang] as Record<string, unknown>, content as Record<string, unknown>)
    }
  }
  
  return merged
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
  const result = { ...target }
  
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge((result[key] || {}) as Record<string, unknown>, value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  
  return result
}
