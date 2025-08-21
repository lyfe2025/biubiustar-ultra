import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { sendResponse, sendValidationError } from '../../utils/response.js'
import { authenticateToken } from '../../middleware/auth.js'
import { UploadSecurity, DEFAULT_UPLOAD_CONFIGS } from '../../utils/uploadSecurity.js'
import { VideoThumbnailGenerator } from '../../utils/videoThumbnail.js'
import asyncHandler from '../../middleware/asyncHandler.js'
import { createCacheMiddleware } from '../../middleware/cache'
import { contentCache } from '../../lib/cacheInstances'
import { invalidateContentCache } from '../../services/cacheInvalidation'
import { CACHE_TTL } from '../../config/cache'

const router = Router()

// 获取帖子上传配置
const uploadConfig = DEFAULT_UPLOAD_CONFIGS.posts

// 配置multer存储
const storage = multer.memoryStorage() // 使用内存存储，便于后续处理

// 增强的文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 使用安全工具类进行验证
  if (!UploadSecurity.isExtensionSafe(file.originalname)) {
    return cb(new Error('危险的文件扩展名'))
  }
  
  if (!UploadSecurity.isMimeTypeAllowed(file.mimetype)) {
    return cb(new Error('不支持的文件类型'))
  }
  
  cb(null, true)
}

// 配置multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize, // 50MB
    files: uploadConfig.maxFiles // 最多9个文件
  }
})

// 上传帖子媒体文件（图片和视频）
router.post('/media', authenticateToken, upload.array('files', 9), asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const files = req.files as Express.Multer.File[]
    
    if (!files || files.length === 0) {
      return sendValidationError(res, '未选择文件')
    }
    
    const uploadedFiles = []
    const errors = []
    
    // 确保上传目录安全
    const uploadDir = uploadConfig.uploadPath
    UploadSecurity.ensureSecureUploadDir(uploadDir)
    
    for (const file of files) {
      try {
        // 综合安全验证
        const validation = UploadSecurity.validateFile(file, uploadConfig.maxFileSize)
        if (!validation.isValid) {
          errors.push(`${file.originalname}: ${validation.error}`)
          continue
        }
        
        // 生成安全的文件名
        const safeFilename = UploadSecurity.generateSafeFilename(file.originalname, 'post')
        const filePath = path.join(uploadDir, safeFilename)
        
        // 确保文件路径安全（防止路径遍历）
        const resolvedPath = path.resolve(filePath)
        const resolvedUploadDir = path.resolve(uploadDir)
        if (!resolvedPath.startsWith(resolvedUploadDir)) {
          errors.push(`${file.originalname}: 非法的文件路径`)
          continue
        }
        
        // 保存文件到磁盘
        fs.writeFileSync(filePath, file.buffer)
        
        // 确定文件类型
        const isImage = file.mimetype.startsWith('image/')
        const isVideo = file.mimetype.startsWith('video/')
        
        const fileInfo: any = {
          filename: safeFilename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          type: isImage ? 'image' : isVideo ? 'video' : 'unknown',
          path: `/uploads/posts/${safeFilename}`,
          url: `/uploads/posts/${safeFilename}`
        }
        
        // 如果是视频文件，生成封面图片
        if (isVideo) {
          try {
            const thumbnailUrl = await VideoThumbnailGenerator.generateThumbnailForUpload(
              safeFilename,
              uploadDir
            )
            if (thumbnailUrl) {
              fileInfo.thumbnail = thumbnailUrl
              console.log(`[VIDEO_THUMBNAIL] 视频封面生成成功: ${thumbnailUrl}`)
            } else {
              console.warn(`[VIDEO_THUMBNAIL] 视频封面生成失败: ${safeFilename}`)
            }
          } catch (thumbnailError) {
            console.error(`[VIDEO_THUMBNAIL] 生成视频封面时发生错误: ${safeFilename}`, thumbnailError)
          }
        }
        
        uploadedFiles.push(fileInfo)
        
        // 记录安全日志
        console.log(`[UPLOAD_SECURITY] 文件上传成功: ${safeFilename}, 原始名称: ${file.originalname}, 大小: ${file.size}, 类型: ${file.mimetype}, 用户: ${(req as any).user?.id}`)
        
      } catch (fileError) {
        console.error(`[UPLOAD_SECURITY] 文件处理失败: ${file.originalname}`, fileError)
        errors.push(`${file.originalname}: 处理失败`)
      }
    }
    
    // 如果有错误但也有成功的文件，返回部分成功
    if (errors.length > 0 && uploadedFiles.length > 0) {
      return sendResponse(res, true, {
        files: uploadedFiles,
        count: uploadedFiles.length,
        warnings: errors
      }, '部分文件上传成功', 207)
    }
    
    // 如果全部失败
    if (errors.length > 0 && uploadedFiles.length === 0) {
      return sendResponse(res, false, null, '所有文件上传失败', 400)
    }
    
    // 清除内容缓存，因为新的媒体文件可能影响帖子内容
    await invalidateContentCache();

    sendResponse(res, true, {
      files: uploadedFiles,
      count: uploadedFiles.length
    }, '媒体文件上传成功', 201)
}))

// 删除帖子媒体文件
router.delete('/media', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const { filename } = req.body
    
    if (!filename) {
      return sendValidationError(res, '未提供文件名')
    }
    
    // 使用安全工具类清理文件名
    const sanitizedFilename = UploadSecurity.sanitizeFilename(filename)
    
    // 严格的路径遍历检查
    if (sanitizedFilename !== filename || 
        filename.includes('..') || 
        filename.includes('/') || 
        filename.includes('\\') ||
        path.isAbsolute(filename)) {
      console.warn(`[UPLOAD_SECURITY] 检测到可疑的文件删除请求: ${filename}, 用户: ${(req as any).user?.id}`)
      return sendValidationError(res, '无效的文件名')
    }
    
    const uploadDir = uploadConfig.uploadPath
    const filePath = path.join(uploadDir, sanitizedFilename)
    
    // 确保文件路径在允许的目录内
    const resolvedPath = path.resolve(filePath)
    const resolvedUploadDir = path.resolve(uploadDir)
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      console.warn(`[UPLOAD_SECURITY] 检测到路径遍历攻击: ${filename}, 用户: ${(req as any).user?.id}`)
      return sendValidationError(res, '非法的文件路径')
    }
    
    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`[UPLOAD_SECURITY] 文件删除成功: ${sanitizedFilename}, 用户: ${(req as any).user?.id}`)
      
      // 清除内容缓存，因为媒体文件删除可能影响帖子内容
      await invalidateContentCache();
      
      sendResponse(res, true, null, '文件删除成功')
    } else {
      sendResponse(res, false, null, '文件不存在', 404)
    }
}))

// 获取帖子媒体文件列表
router.get('/media', 
  createCacheMiddleware({
    cacheService: contentCache,
    keyGenerator: (req) => `post:${req.params.id}:media`
  }),
  asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'posts')
    
    if (!fs.existsSync(uploadsDir)) {
      return sendResponse(res, true, { files: [] })
    }
    
    const files = fs.readdirSync(uploadsDir)
      .filter(file => {
        const filePath = path.join(uploadsDir, file)
        return fs.statSync(filePath).isFile()
      })
      .map(file => {
        const filePath = path.join(uploadsDir, file)
        const stats = fs.statSync(filePath)
        const ext = path.extname(file).toLowerCase()
        
        // 根据扩展名判断文件类型
        let type = 'unknown'
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        const videoExts = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv']
        
        if (imageExts.includes(ext)) {
          type = 'image'
        } else if (videoExts.includes(ext)) {
          type = 'video'
        }
        
        return {
          filename: file,
          size: stats.size,
          type,
          created: stats.birthtime,
          modified: stats.mtime,
          path: `/uploads/posts/${file}`,
          url: `/uploads/posts/${file}`
        }
      })
      .sort((a, b) => b.modified.getTime() - a.modified.getTime()) // 按修改时间排序
    
    sendResponse(res, true, { files })
}))

export default router