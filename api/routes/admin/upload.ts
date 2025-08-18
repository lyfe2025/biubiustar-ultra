import { Router, Request, Response } from 'express'
import multer from 'multer'

import { requireAdmin } from './auth.js'
import path from 'path'
import fs from 'fs'


const router = Router()

// 应用管理员权限验证
router.use(requireAdmin)

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // 确保uploads目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
    const timestamp = Date.now()
    const random = Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname).toLowerCase()
    const filename = `${timestamp}-${random}${ext}`
    
    cb(null, filename)
  }
})

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 检查文件类型
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp'
  ]
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`))
  }
}

// 配置multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
    files: 1 // 一次只能上传一个文件
  }
})

// 上传图片
router.post('/image', upload.single('image'), async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未选择文件' })
    }
    
    // 返回文件的相对路径
    const relativePath = `/uploads/${req.file.filename}`
    
    console.log(`文件上传成功: ${req.file.filename}, 大小: ${req.file.size} bytes`)
    
    res.json({
      success: true,
      message: '文件上传成功',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: relativePath,
        url: `${req.protocol}://${req.get('host')}${relativePath}`
      }
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    res.status(500).json({ 
      error: '文件上传失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 专门用于站点Logo和Favicon上传的端点
router.post('/site-asset', (req, res) => {
  
  // 先用临时文件名上传，然后根据type重命名
  const tempStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      // 使用临时文件名
      const ext = path.extname(file.originalname).toLowerCase()
      const tempName = `temp-${Date.now()}${ext}`
      cb(null, tempName)
    }
  })

  const tempUpload = multer({
    storage: tempStorage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1
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
      const finalPath = path.join(req.file.destination, finalFilename)
      
      // 将临时文件重命名为最终文件名
      fs.renameSync(req.file.path, finalPath)
      
      const relativePath = `/uploads/${finalFilename}`
      
      console.log(`站点${finalType}上传成功: ${finalFilename}, 大小: ${req.file.size} bytes`)
      console.log(`类型检测结果: ${finalType} (原文件名: ${req.file.originalname})`)
      
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
      // 如果重命名失败，删除临时文件
      try {
        fs.unlinkSync(req.file.path)
      } catch (cleanupError) {
        console.error('清理临时文件失败:', cleanupError)
      }
      
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
    
    // 安全检查：确保文件名不包含路径遍历字符
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: '无效的文件名' })
    }
    
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
    
    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`文件删除成功: ${filename}`)
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
