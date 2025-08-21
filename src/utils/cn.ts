import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 统一的标题样式系统
export const headingStyles = {
  // 主要标题样式 - 用于页面主标题
  h1: "text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6",
  
  // 二级标题样式 - 用于页面主要分区标题
  h2: "text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4",
  
  // 三级标题样式 - 用于子分区标题
  h3: "text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3",
  
  // 四级标题样式 - 用于小标题
  h4: "text-lg md:text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2",
  
  // 白色渐变样式 - 用于深色背景上的标题
  h2White: "text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent mb-4",
  h3White: "text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent mb-3",
  
  // 简单样式 - 用于不需要渐变的标题
  h2Simple: "text-2xl md:text-3xl font-bold text-gray-900 mb-4",
  h3Simple: "text-lg md:text-xl font-semibold text-gray-900 mb-3",
  
  // 响应式文本大小
  responsive: {
    h2: "text-2xl md:text-3xl lg:text-4xl",
    h3: "text-lg md:text-xl lg:text-2xl"
  }
}