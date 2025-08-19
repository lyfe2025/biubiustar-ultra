/**
 * 头像生成器工具
 * 用于生成基于用户名首字母的默认SVG头像
 */

// 预定义的背景色调色板 - 符合项目紫色主题风格
const BACKGROUND_COLORS = [
  '#8B5CF6', // purple-500 - 主紫色
  '#7C3AED', // purple-600 - 深紫色
  '#6D28D9', // purple-700 - 更深紫色
  '#A855F7', // purple-500 变体
  '#9333EA', // purple-600 变体
  '#EC4899', // pink-500 - 粉紫色
  '#DB2777', // pink-600 - 深粉色
  '#BE185D', // pink-700 - 更深粉色
  '#6366F1', // indigo-500 - 蓝紫色
  '#4F46E5', // indigo-600 - 深蓝紫色
  '#4338CA', // indigo-700 - 更深蓝紫色
  '#8B5CF6', // purple-500 重复（确保足够选择）
  '#A78BFA', // purple-400 - 浅紫色
  '#C084FC', // purple-300 - 更浅紫色
  '#DDD6FE'  // purple-200 - 最浅紫色
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
 * 根据字符串生成一致的颜色索引
 * @param str 输入字符串
 * @returns 颜色索引
 */
function getColorIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash) % BACKGROUND_COLORS.length;
}

/**
 * 生成SVG格式的默认头像
 * @param username 用户名
 * @param size 头像尺寸（默认64px）
 * @returns SVG字符串
 */
export function generateDefaultAvatar(username: string, size: number = 64): string {
  const initials = getInitials(username);
  const colorIndex = getColorIndex(username);
  const backgroundColor = BACKGROUND_COLORS[colorIndex];
  
  // 计算字体大小（约为头像尺寸的40%）
  const fontSize = Math.round(size * 0.4);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
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
  return `/api/avatar/default?username=${encodeURIComponent(username)}`;
}

/**
 * 检查是否为默认头像URL
 * @param avatarUrl 头像URL
 * @returns 是否为默认头像
 */
export function isDefaultAvatar(avatarUrl: string | null | undefined): boolean {
  if (!avatarUrl) return true;
  return avatarUrl.includes('/api/avatar/default');
}