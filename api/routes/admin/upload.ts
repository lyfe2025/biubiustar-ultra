import { Router, Request, Response } from 'express'
import multer from 'multer'

import { requireAdmin } from './auth.js'
import path from 'path'
import fs from 'fs'
import { UploadSecurity, DEFAULT_UPLOAD_CONFIGS } from '../../utils/uploadSecurity'


const router = Router()

// 应用管理员权限验证
router.use(requireAdmin)

// 配置multer存储（使用内存存储以便安全验证）
const storage = multer.memoryStorage()

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
    fileSize: DEFAULT_UPLOAD_CONFIGS.avatar.maxFileSize, // 5MB限制
    files: DEFAULT_UPLOAD_CONFIGS.avatar.maxFiles // 一次只能上传一个文件
  }
})

// 图片上传
router.post('/image', (req: Request, res: Response): void => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('图片上传失败:', err)
      return res.status(500).json({
        error: '上传失败',
        details: err.message
      })
    }

    if (!req.file) {
      return res.status(400).json({ error: '未选择文件' })
    }

    try {
      // 确保上传目录安全
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      UploadSecurity.ensureSecureUploadDir(uploadDir)
      
      // 安全验证文件
      const validationResult = UploadSecurity.validateFile({
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer
      }, DEFAULT_UPLOAD_CONFIGS.avatar.maxFileSize)
      if (!validationResult.isValid) {
        console.error('文件安全验证失败:', validationResult.error)
        return res.status(400).json({
          error: '文件安全验证失败',
          details: validationResult.error
        })
      }
      
      // 生成安全的文件名
      const safeFilename = UploadSecurity.generateSafeFilename(req.file.originalname)
      const filePath = path.join(uploadDir, safeFilename)
      
      // 保存文件
      fs.writeFileSync(filePath, req.file.buffer)
      
      const relativePath = `/uploads/${safeFilename}`
      
      console.log(`图片上传成功: ${safeFilename}, 大小: ${req.file.size} bytes`)
      console.log('安全验证通过: 文件格式和内容验证成功')
      
      res.json({
        success: true,
        message: '图片上传成功',
        data: {
          filename: safeFilename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: relativePath,
          url: `${req.protocol}://${req.get('host')}${relativePath}`
        }
      })
      
    } catch (error) {
      console.error('文件处理失败:', error)
      res.status(500).json({
        error: '文件处理失败',
        details: error instanceof Error ? error.message : '未知错误'
      })
    }
  })
})

// 活动图片专用上传端点
router.post('/activity-image', (req: Request, res: Response): void => {
  // 配置活动图片专用存储（使用内存存储）
  const activityUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
      fileSize: DEFAULT_UPLOAD_CONFIGS.avatar.maxFileSize,
      files: DEFAULT_UPLOAD_CONFIGS.avatar.maxFiles
    }
  })

  activityUpload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('活动图片上传失败:', err)
      return res.status(500).json({
        error: '上传失败',
        details: err.message
      })
    }

    if (!req.file) {
      return res.status(400).json({ error: '未选择文件' })
    }

    try {
      // 确保活动图片上传目录安全
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'activities')
      UploadSecurity.ensureSecureUploadDir(uploadDir)
      
      // 安全验证文件
      const validationResult = UploadSecurity.validateFile({
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer
      }, DEFAULT_UPLOAD_CONFIGS.avatar.maxFileSize)
      if (!validationResult.isValid) {
        console.error('活动图片安全验证失败:', validationResult.error)
        return res.status(400).json({
          error: '文件安全验证失败',
          details: validationResult.error
        })
      }
      
      // 生成安全的活动图片文件名
      const safeFilename = `activity-${UploadSecurity.generateSafeFilename(req.file.originalname)}`
      const filePath = path.join(uploadDir, safeFilename)
      
      // 保存文件
      fs.writeFileSync(filePath, req.file.buffer)
      
      const relativePath = `/uploads/activities/${safeFilename}`
      
      console.log(`活动图片上传成功: ${safeFilename}, 大小: ${req.file.size} bytes`)
      console.log('安全验证通过: 文件格式和内容验证成功')
      
      res.json({
        success: true,
        message: '活动图片上传成功',
        data: {
          filename: safeFilename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: relativePath,
          url: `${req.protocol}://${req.get('host')}${relativePath}`,
          type: 'activity'
        }
      })
      
    } catch (error) {
      console.error('活动图片处理失败:', error)
      res.status(500).json({
        error: '文件处理失败',
        details: error instanceof Error ? error.message : '未知错误'
      })
    }
  })
})

// 专门用于站点Logo和Favicon上传的端点
router.post('/site-asset', (req: Request, res: Response): void => {
  // 使用内存存储进行安全验证
  const tempUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
      fileSize: DEFAULT_UPLOAD_CONFIGS.avatar.maxFileSize,
      files: DEFAULT_UPLOAD_CONFIGS.avatar.maxFiles
    }
  })

  tempUpload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('站点资源上传失败:', err)
      return res.status(500).json({
        error: '上传失败',
        details: err.message
      })
    }

    if (!req.file) {
      return res.status(400).json({ error: '未选择文件' })
    }

    try {
      // 确保上传目录安全
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      UploadSecurity.ensureSecureUploadDir(uploadDir)
      
      // 安全验证文件
      const validationResult = UploadSecurity.validateFile({
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer
      }, DEFAULT_UPLOAD_CONFIGS.avatar.maxFileSize)
      if (!validationResult.isValid) {
        console.error('站点资源安全验证失败:', validationResult.error)
        return res.status(400).json({
          error: '文件安全验证失败',
          details: validationResult.error
        })
      }
      
      // 现在可以安全地读取req.body.type
      const providedType = req.body.type
      console.log(`前端指定的类型: ${providedType}`)
      
      // 判断最终的文件类型
      let finalType = 'logo' // 默认为logo
      
      // 严格优先使用前端提供的类型
      if (providedType && ['logo', 'favicon'].includes(providedType)) {
        finalType = providedType
        console.log(`使用前端指定的类型: ${finalType}`)
      } else {
        // 只有在前端未指定时才进行自动判断
        const originalName = req.file.originalname.toLowerCase()
        
        if (originalName.includes('favicon') || originalName.includes('icon')) {
          finalType = 'favicon'
        } else if (originalName.includes('logo')) {
          finalType = 'logo'
        } else if (originalName.match(/\b(16|32|48)\b/)) {
          finalType = 'favicon'
        } else if (originalName.match(/\b(100|128|200|256|512)\b/)) {
          finalType = 'logo'
        }
        console.log(`自动检测文件类型: ${originalName} → ${finalType}`)
      }
      
      // 根据最终类型确定目标文件名
      const ext = path.extname(req.file.originalname).toLowerCase()
      const finalFilename = finalType === 'logo' ? `site-logo${ext}` : `site-favicon${ext}`
      const finalPath = path.join(uploadDir, finalFilename)
      
      // 保存文件
      fs.writeFileSync(finalPath, req.file.buffer)
      
      const relativePath = `/uploads/${finalFilename}`
      
      console.log(`站点${finalType}上传成功: ${finalFilename}, 大小: ${req.file.size} bytes`)
      console.log(`类型检测结果: ${finalType} (原文件名: ${req.file.originalname})`)
      console.log('安全验证通过: 文件格式和内容验证成功')
      
      res.json({
        success: true,
        message: `站点${finalType}上传成功`,
        data: {
          filename: finalFilename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: relativePath,
          url: `${req.protocol}://${req.get('host')}${relativePath}`,
          type: finalType
        }
      })
      
    } catch (error) {
      console.error('站点资源处理失败:', error)
      res.status(500).json({
        error: '文件处理失败',
        details: error instanceof Error ? error.message : '未知错误'
      })
    }
  })
})

// 删除图片
router.delete('/image', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { filename } = req.body
    
    if (!filename) {
      return res.status(400).json({ error: '未提供文件名' })
    }
    
    // 使用安全工具类进行文件名验证
    const sanitizedFilename = UploadSecurity.sanitizeFilename(filename)
    if (sanitizedFilename !== filename) {
      console.error(`危险的文件名被拒绝: ${filename}`)
      return res.status(400).json({ error: '无效的文件名' })
    }
    
    // 检查多个可能的上传目录
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'uploads', filename),
      path.join(process.cwd(), 'public', 'uploads', 'activities', filename)
    ]
    
    let deletedPath = null
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        deletedPath = filePath
        break
      }
    }
    
    if (deletedPath) {
      console.log(`文件删除成功: ${filename} (路径: ${deletedPath})`)
      res.json({ success: true, message: '文件删除成功' })
    } else {
      res.status(404).json({ error: '文件不存在' })
    }
  } catch (error) {
    console.error('文件删除失败:', error)
    res.status(500).json({ 
      error: '文件删除失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 获取文件列表
router.get('/files', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, files: [] })
    }
    
    const files = fs.readdirSync(uploadsDir)
      .filter(file => {
        const filePath = path.join(uploadsDir, file)
        return fs.statSync(filePath).isFile()
      })
      .map(file => {
        const filePath = path.join(uploadsDir, file)
        const stats = fs.statSync(filePath)
        
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: `/uploads/${file}`,
          url: `${req.protocol}://${req.get('host')}/uploads/${file}`
        }
      })
      .sort((a, b) => b.modified.getTime() - a.modified.getTime()) // 按修改时间排序
    
    res.json({ success: true, files })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    res.status(500).json({ 
      error: '获取文件列表失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 清理未使用的文件
router.post('/cleanup', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, message: '上传目录不存在', deletedCount: 0 })
    }
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const files = fs.readdirSync(uploadsDir)
    let deletedCount = 0
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file)
      const stats = fs.statSync(filePath)
      
      if (stats.isFile() && stats.mtime < thirtyDaysAgo) {
        fs.unlinkSync(filePath)
        deletedCount++
        console.log(`清理旧文件: ${file}`)
      }
    }
    
    res.json({ 
      success: true, 
      message: `清理完成，删除了 ${deletedCount} 个文件`,
      deletedCount 
    })
  } catch (error) {
    console.error('清理文件失败:', error)
    res.status(500).json({ 
      error: '清理文件失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
})

export default router
