import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

/**
 * 上传安全工具类
 * 提供文件上传的安全验证和处理功能
 */
export class UploadSecurity {
  
  // 危险文件扩展名黑名单
  private static readonly DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.bash',
    '.ps1', '.msi', '.deb', '.rpm', '.dmg', '.app', '.ipa', '.apk'
  ]
  
  // 允许的图片MIME类型
  private static readonly ALLOWED_IMAGE_MIMES = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp'
  ]
  
  // 允许的视频MIME类型
  private static readonly ALLOWED_VIDEO_MIMES = [
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]
  
  // 图片文件魔数（文件头）
  private static readonly IMAGE_SIGNATURES = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': [0x52, 0x49, 0x46, 0x46] // RIFF header
  }
  
  /**
   * 验证文件扩展名是否安全
   */
  static isExtensionSafe(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase()
    return !this.DANGEROUS_EXTENSIONS.includes(ext)
  }
  
  /**
   * 验证MIME类型是否允许
   */
  static isMimeTypeAllowed(mimetype: string): boolean {
    return this.ALLOWED_IMAGE_MIMES.includes(mimetype) || 
           this.ALLOWED_VIDEO_MIMES.includes(mimetype)
  }
  
  /**
   * 验证文件内容是否与声明的MIME类型匹配
   */
  static validateFileSignature(buffer: Buffer, declaredMimeType: string): boolean {
    // 只验证图片文件的魔数，视频文件结构复杂暂不验证
    if (!declaredMimeType.startsWith('image/')) {
      return true
    }
    
    const signature = this.IMAGE_SIGNATURES[declaredMimeType as keyof typeof this.IMAGE_SIGNATURES]
    if (!signature) {
      return false
    }
    
    // 检查文件头是否匹配
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * 生成安全的文件名
   */
  static generateSafeFilename(originalName: string, prefix: string = 'file'): string {
    // 获取文件扩展名
    const ext = path.extname(originalName).toLowerCase()
    
    // 生成随机文件名
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(8).toString('hex')
    
    return `${prefix}-${timestamp}-${randomBytes}${ext}`
  }
  
  /**
   * 清理文件名，移除危险字符
   */
  static sanitizeFilename(filename: string): string {
    // 移除路径遍历字符和其他危险字符
    return filename
      .replace(/[\\/:*?"<>|]/g, '') // 移除Windows文件名禁用字符
      .replace(/\.\.+/g, '.') // 移除多个连续的点
      .replace(/^\.|\.$/, '') // 移除开头和结尾的点
      .substring(0, 255) // 限制文件名长度
  }
  
  /**
   * 验证文件大小
   */
  static validateFileSize(size: number, maxSize: number): boolean {
    return size > 0 && size <= maxSize
  }
  
  /**
   * 检查文件是否包含恶意内容（简单检查）
   */
  static scanForMaliciousContent(buffer: Buffer): boolean {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024))
    
    // 检查是否包含脚本标签或其他可疑内容
    const maliciousPatterns = [
      /<script[^>]*>/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /data:text\/html/i
    ]
    
    return maliciousPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * 综合安全验证
   */
  static validateFile(file: {
    originalname: string
    mimetype: string
    size: number
    buffer: Buffer
  }, maxSize: number): { isValid: boolean; error?: string } {
    
    // 1. 验证文件扩展名
    if (!this.isExtensionSafe(file.originalname)) {
      return { isValid: false, error: '不允许的文件类型' }
    }
    
    // 2. 验证MIME类型
    if (!this.isMimeTypeAllowed(file.mimetype)) {
      return { isValid: false, error: '不支持的文件格式' }
    }
    
    // 3. 验证文件大小
    if (!this.validateFileSize(file.size, maxSize)) {
      return { isValid: false, error: `文件大小超出限制（最大${Math.round(maxSize / 1024 / 1024)}MB）` }
    }
    
    // 4. 验证文件签名
    if (!this.validateFileSignature(file.buffer, file.mimetype)) {
      return { isValid: false, error: '文件内容与格式不匹配' }
    }
    
    // 5. 扫描恶意内容
    if (this.scanForMaliciousContent(file.buffer)) {
      return { isValid: false, error: '文件包含可疑内容' }
    }
    
    return { isValid: true }
  }
  
  /**
   * 创建安全的上传目录
   */
  static ensureSecureUploadDir(uploadPath: string): void {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 })
    }
    
    // 创建.htaccess文件禁止执行脚本（Apache服务器）
    const htaccessPath = path.join(uploadPath, '.htaccess')
    if (!fs.existsSync(htaccessPath)) {
      const htaccessContent = `# 禁止执行脚本文件\nOptions -ExecCGI\nAddHandler cgi-script .php .pl .py .jsp .asp .sh\n`
      fs.writeFileSync(htaccessPath, htaccessContent)
    }
    
    // 创建index.html防止目录浏览
    const indexPath = path.join(uploadPath, 'index.html')
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, '<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body><h1>Directory access is forbidden.</h1></body></html>')
    }
  }
}

/**
 * 文件上传配置
 */
export interface UploadConfig {
  maxFileSize: number
  maxFiles: number
  allowedTypes: 'image' | 'video' | 'both'
  uploadPath: string
}

/**
 * 默认上传配置
 */
export const DEFAULT_UPLOAD_CONFIGS = {
  posts: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5,
    allowedTypes: 'both' as const,
    uploadPath: 'public/uploads/posts'
  },
  avatar: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    allowedTypes: 'image' as const,
    uploadPath: 'public/uploads/avatars'
  },
  activities: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3,
    allowedTypes: 'image' as const,
    uploadPath: 'public/uploads/activities'
  }
}