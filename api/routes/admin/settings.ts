import { Router } from 'express'
import { supabaseAdmin } from '../../lib/supabase'
import { requireAdmin } from './auth'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 获取系统设置
router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    
    let query = supabaseAdmin
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data: settings, error } = await query
    
    if (error) {
      console.error('获取系统设置失败:', error)
      return res.status(500).json({ error: '获取系统设置失败' })
    }
    
    // 按分类组织设置
    const settingsByCategory = settings?.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      
      let value = setting.setting_value
      // 根据类型转换值
      if (setting.setting_type === 'boolean') {
        value = value === 'true'
      } else if (setting.setting_type === 'number') {
        value = parseInt(value) || 0
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value)
        } catch (e) {
          value = null
        }
      }
      
      acc[setting.category][setting.setting_key] = {
        value,
        type: setting.setting_type,
        description: setting.description,
        is_public: setting.is_public
      }
      
      return acc
    }, {} as any) || {}
    
    res.json(settingsByCategory)
  } catch (error) {
    console.error('获取系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 保存系统设置
router.put('/', async (req, res) => {
  try {
    const { settings } = req.body
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: '设置数据格式不正确' })
    }
    
    const updates = []
    
    // 遍历所有分类的设置
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (typeof categorySettings === 'object' && categorySettings !== null) {
        for (const [key, value] of Object.entries(categorySettings as any)) {
          let stringValue = String(value)
          
          // 如果是对象或数组，转换为JSON字符串
          if (typeof value === 'object' && value !== null) {
            stringValue = JSON.stringify(value)
          }
          
          updates.push({
            setting_key: key,
            setting_value: stringValue,
            updated_at: new Date().toISOString()
          })
        }
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有要更新的设置' })
    }
    
    // 批量更新设置
    const updatePromises = updates.map(update => 
      supabaseAdmin
        .from('system_settings')
        .update({
          setting_value: update.setting_value,
          updated_at: update.updated_at
        })
        .eq('setting_key', update.setting_key)
    )
    
    const results = await Promise.all(updatePromises)
    
    // 检查是否有错误
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('更新系统设置失败:', errors)
      return res.status(500).json({ error: '更新系统设置失败' })
    }
    
    res.json({ success: true, message: '系统设置保存成功' })
  } catch (error) {
    console.error('保存系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 测试邮件发送
router.post('/test-email', async (req, res) => {
  try {
    const { testEmail } = req.body
    
    if (!testEmail) {
      return res.status(400).json({ error: '请提供测试邮箱地址' })
    }
    
    // 获取邮件设置
    const { data: emailSettings, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value')
      .eq('category', 'email')
    
    if (error) {
      console.error('获取邮件设置失败:', error)
      return res.status(500).json({ error: '获取邮件设置失败' })
    }
    
    const settings = emailSettings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as any) || {}
    
    // 验证邮件配置
    if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_password) {
      return res.status(400).json({ error: 'SMTP配置不完整，请先配置邮件设置' })
    }
    
    // 这里应该使用实际的邮件发送库（如nodemailer）
    // 为了演示，我们模拟发送过程
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransporter({
      host: settings.smtp_host,
      port: parseInt(settings.smtp_port) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password
      },
      tls: {
        rejectUnauthorized: settings.smtp_use_tls === 'true'
      }
    })
    
    const mailOptions = {
      from: `"${settings.smtp_from_name || 'BiuBiuStar'}" <${settings.smtp_from_email || settings.smtp_username}>`,
      to: testEmail,
      subject: '邮件配置测试',
      html: `
        <h2>邮件配置测试成功</h2>
        <p>恭喜！您的邮件配置已正确设置。</p>
        <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
        <p>来自: BiuBiuStar 管理后台</p>
      `
    }
    
    await transporter.sendMail(mailOptions)
    
    res.json({ success: true, message: '测试邮件发送成功' })
  } catch (error) {
    console.error('发送测试邮件失败:', error)
    res.status(500).json({ 
      error: '发送测试邮件失败', 
      details: error.message 
    })
  }
})

// 获取公开的系统设置（供前台使用）
router.get('/public', async (req, res) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value, setting_type, category')
      .eq('is_public', true)
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true })
    
    if (error) {
      console.error('获取公开系统设置失败:', error)
      return res.status(500).json({ error: '获取公开系统设置失败' })
    }
    
    // 按分类组织设置
    const settingsByCategory = settings?.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      
      let value = setting.setting_value
      // 根据类型转换值
      if (setting.setting_type === 'boolean') {
        value = value === 'true'
      } else if (setting.setting_type === 'number') {
        value = parseInt(value) || 0
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value)
        } catch (e) {
          value = null
        }
      }
      
      acc[setting.category][setting.setting_key] = value
      
      return acc
    }, {} as any) || {}
    
    res.json(settingsByCategory)
  } catch (error) {
    console.error('获取公开系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
