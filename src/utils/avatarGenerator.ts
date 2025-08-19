/**
 * 头像生成器工具
 * 用于生成基于用户名首字母的默认SVG头像
 */

// 预定义的渐变色调色板 - 符合项目紫色主题风格，参考PostCard.tsx的渐变样式
const GRADIENT_COLORS = [
  { from: '#8B5CF6', to: '#EC4899' }, // purple-500 to pink-500 - 主渐变
  { from: '#7C3AED', to: '#DB2777' }, // purple-600 to pink-600 - 深色渐变
  { from: '#6D28D9', to: '#BE185D' }, // purple-700 to pink-700 - 更深渐变
  { from: '#A855F7', to: '#F472B6' }, // purple-500变体 to pink-400
  { from: '#9333EA', to: '#E879F9' }, // purple-600变体 to fuchsia-400
  { from: '#8B5CF6', to: '#6366F1' }, // purple-500 to indigo-500 - 蓝紫渐变
  { from: '#7C3AED', to: '#4F46E5' }, // purple-600 to indigo-600
  { from: '#6D28D9', to: '#4338CA' }, // purple-700 to indigo-700
  { from: '#A78BFA', to: '#C084FC' }, // purple-400 to purple-300 - 浅色渐变
  { from: '#8B5CF6', to: '#A78BFA' }, // purple-500 to purple-400
  { from: '#EC4899', to: '#F472B6' }, // pink-500 to pink-400
  { from: '#6366F1', to: '#8B5CF6' }, // indigo-500 to purple-500
  { from: '#C084FC', to: '#DDD6FE' }, // purple-300 to purple-200 - 最浅渐变
  { from: '#9333EA', to: '#8B5CF6' }, // purple-600变体 to purple-500
  { from: '#EC4899', to: '#8B5CF6' }  // pink-500 to purple-500 - 反向渐变
];

/**
 * 获取字符串的首字母
 * 支持中文和英文用户名
 * @param name 用户名
 * @returns 首字母（大写）
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') {
    return 'U'; // 默认返回 'U' (User)
  }

  const trimmedName = name.trim();
  
  // 处理中文字符
  const chineseMatch = trimmedName.match(/[\u4e00-\u9fff]/);
  if (chineseMatch) {
    return chineseMatch[0].toUpperCase();
  }
  
  // 处理英文字符
  const englishMatch = trimmedName.match(/[a-zA-Z]/);
  if (englishMatch) {
    return englishMatch[0].toUpperCase();
  }
  
  // 如果都没有匹配到，返回第一个字符的大写
  return trimmedName.charAt(0).toUpperCase();
}

/**
 * 根据字符串生成一致的渐变色索引
 * @param str 输入字符串
 * @returns 渐变色索引
 */
function getGradientIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash) % GRADIENT_COLORS.length;
}

/**
 * 生成SVG格式的默认头像（渐变背景）
 * @param username 用户名
 * @param size 头像尺寸（默认64px）
 * @returns SVG字符串
 */
export function generateDefaultAvatar(username: string, size: number = 64): string {
  const initials = getInitials(username);
  const gradientIndex = getGradientIndex(username);
  const gradient = GRADIENT_COLORS[gradientIndex];
  
  // 计算字体大小（约为头像尺寸的40%）
  const fontSize = Math.round(size * 0.4);
  
  // 生成唯一的渐变ID，包含用户名和尺寸，避免多个头像之间的冲突
  const gradientId = `gradient-${username.replace(/[^a-zA-Z0-9]/g, '')}-${gradientIndex}-${size}`;
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#${gradientId})"/>
      <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
        ${initials}
      </text>
    </svg>
  `.trim();
  
  return svg;
}

/**
 * 生成默认头像的Data URL
 * @param username 用户名
 * @param size 头像尺寸（默认64px）
 * @returns Data URL格式的SVG
 */
export function generateDefaultAvatarDataUrl(username: string, size: number = 64): string {
  const svg = generateDefaultAvatar(username, size);
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml,${encodedSvg}`;
}

/**
 * 生成默认头像的URL路径（用于数据库存储）
 * 这个函数生成一个可以被前端识别的特殊URL格式
 * @param username 用户名
 * @returns 默认头像的URL路径
 */
export function generateDefaultAvatarUrl(username: string): string {
  // 使用Data URL格式，避免浏览器缓存问题，确保每个用户的头像都是唯一的
  return generateDefaultAvatarDataUrl(username);
}

/**
 * 从旧格式的默认头像URL中提取用户名
 * @param avatarUrl 头像URL
 * @returns 用户名或null
 */
export function extractUsernameFromDefaultAvatarUrl(avatarUrl: string): string | null {
  if (!avatarUrl) return null;
  
  // 匹配旧格式：/api/avatar/default?username=用户名
  const match = avatarUrl.match(/\/api\/avatar\/default\?username=([^&]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  
  return null;
}

/**
 * 检查是否为默认头像URL（兼容新旧格式）
 * @param avatarUrl 头像URL
 * @returns 是否为默认头像
 */
export function isDefaultAvatar(avatarUrl: string | null | undefined): boolean {
  if (!avatarUrl) return true;
  
  // 检查是否为Data URL格式的默认头像
  if (avatarUrl.startsWith('data:image/svg+xml')) {
    return true;
  }
  
  // 检查是否为旧格式的API URL
  if (avatarUrl.includes('/api/avatar/default')) {
    return true;
  }
  
  return false;
}

/**
 * 获取用户的默认头像URL（兼容新旧格式）
 * @param username 用户名
 * @param avatarUrl 数据库中存储的头像URL
 * @returns 默认头像URL
 */
export function getUserDefaultAvatarUrl(username: string, avatarUrl?: string | null): string {
  // 如果数据库中有旧格式的默认头像URL，从中提取用户名
  if (avatarUrl && avatarUrl.includes('/api/avatar/default')) {
    const extractedUsername = extractUsernameFromDefaultAvatarUrl(avatarUrl);
    if (extractedUsername) {
      username = extractedUsername;
    }
  }
  
  // 生成新的Data URL格式头像
  return generateDefaultAvatarDataUrl(username);
}