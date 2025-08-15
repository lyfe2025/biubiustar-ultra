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
    
    // 按分类组织设置 - 使用category.key格式
    const settingsByCategory = settings?.reduce((acc, setting) => {
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

      // 转换数据库字段名为前端使用的格式
      let frontendKey = setting.setting_key
      if (setting.category === 'basic') {
        // 将下划线命名转换为驼峰命名
        if (setting.setting_key === 'site_name') frontendKey = 'siteName'
        else if (setting.setting_key === 'site_description') frontendKey = 'siteDescription'
        else if (setting.setting_key === 'site_logo') frontendKey = 'siteLogo'
        else if (setting.setting_key === 'site_favicon') frontendKey = 'siteFavicon'
        else if (setting.setting_key === 'site_keywords') frontendKey = 'siteKeywords'
      }
      
      // 使用category.key格式作为键名
      const categoryKey = `${setting.category}.${frontendKey}`
      acc[categoryKey] = {
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
    const settings = req.body
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: '设置数据格式不正确' })
    }
    
    const updates = []
    
    // 遍历所有的设置项（支持category.key格式）
    for (const [fullKey, value] of Object.entries(settings)) {
      if (fullKey.includes('.')) {
        // category.key格式
        const [category, frontendKey] = fullKey.split('.')
        
        // 将前端格式转换为数据库字段名
        let dbKey = frontendKey
        if (category === 'basic') {
          if (frontendKey === 'siteName') dbKey = 'site_name'
          else if (frontendKey === 'siteDescription') dbKey = 'site_description'
          else if (frontendKey === 'siteLogo') dbKey = 'site_logo'
          else if (frontendKey === 'siteFavicon') dbKey = 'site_favicon'
          else if (frontendKey === 'siteKeywords') dbKey = 'site_keywords'
        }
        
        let stringValue = String(value)
        
        // 如果是对象或数组，转换为JSON字符串
        if (typeof value === 'object' && value !== null) {
          stringValue = JSON.stringify(value)
        }
        
        updates.push({
          setting_key: dbKey,
          setting_value: stringValue,
          updated_at: new Date().toISOString()
        })
      } else {
        // 兼容旧格式 - 直接使用字段名
        let stringValue = String(value)
        
        if (typeof value === 'object' && value !== null) {
          stringValue = JSON.stringify(value)
        }
        
        updates.push({
          setting_key: fullKey,
          setting_value: stringValue,
          updated_at: new Date().toISOString()
        })
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有要更新的设置' })
    }
    
    // 批量更新设置
    console.log('准备保存的设置:', updates)
    
    try {
      const updatePromises = updates.map(async (update) => {
        // 首先尝试更新
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('system_settings')
          .update({
            setting_value: update.setting_value,
            updated_at: update.updated_at
          })
          .eq('setting_key', update.setting_key)
          .select()
        
        // 如果更新失败或没有影响行数，尝试插入
        if (updateError || !updateData || updateData.length === 0) {
          console.log(`设置 ${update.setting_key} 不存在，尝试插入`)
          
          const { data: insertData, error: insertError } = await supabaseAdmin
            .from('system_settings')
            .insert({
              setting_key: update.setting_key,
              setting_value: update.setting_value,
              setting_type: 'string',
              category: 'basic',
              description: `Setting: ${update.setting_key}`,
              is_public: true,
              created_at: update.updated_at,
              updated_at: update.updated_at
            })
            .select()
          
          if (insertError) {
            console.error(`插入设置 ${update.setting_key} 失败:`, insertError)
            throw new Error(`插入设置失败: ${insertError.message}`)
          }
          
          console.log(`成功插入设置 ${update.setting_key}:`, update.setting_value)
          return insertData
        } else {
          console.log(`成功更新设置 ${update.setting_key}:`, update.setting_value)
          return updateData
        }
      })
      
      await Promise.all(updatePromises)
      
    } catch (error) {
      console.error('保存系统设置时发生异常:', error)
      return res.status(500).json({ 
        error: '保存系统设置失败',
        details: error.message
      })
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
    
    // 按分类组织设置 - 使用category.key格式
    const settingsByCategory = settings?.reduce((acc, setting) => {
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

      // 转换数据库字段名为前端使用的格式
      let frontendKey = setting.setting_key
      if (setting.category === 'basic') {
        // 将下划线命名转换为驼峰命名
        if (setting.setting_key === 'site_name') frontendKey = 'siteName'
        else if (setting.setting_key === 'site_description') frontendKey = 'siteDescription'
        else if (setting.setting_key === 'site_logo') frontendKey = 'siteLogo'
        else if (setting.setting_key === 'site_favicon') frontendKey = 'siteFavicon'
        else if (setting.setting_key === 'site_keywords') frontendKey = 'siteKeywords'
      }
      
      // 使用category.key格式作为键名
      const categoryKey = `${setting.category}.${frontendKey}`
      acc[categoryKey] = value
      
      return acc
    }, {} as any) || {}
    
    res.json(settingsByCategory)
  } catch (error) {
    console.error('获取公开系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 调试端点：测试数据库连接和查看设置状态
router.get('/debug', async (req, res) => {
  try {
    console.log('调试端点被访问')
    
    // 测试数据库连接
    const { data: testData, error: testError } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .limit(5)
    
    if (testError) {
      console.error('数据库连接测试失败:', testError)
      return res.status(500).json({
        success: false,
        error: '数据库连接失败',
        details: testError
      })
    }
    
    // 检查基础设置项是否存在
    const { data: basicSettings, error: basicError } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .eq('category', 'basic')
    
    if (basicError) {
      console.error('查询基础设置失败:', basicError)
      return res.status(500).json({
        success: false,
        error: '查询基础设置失败',
        details: basicError
      })
    }
    
    res.json({
      success: true,
      message: '调试信息',
      database_connection: '正常',
      sample_settings: testData,
      basic_settings: basicSettings,
      basic_settings_count: basicSettings?.length || 0
    })
  } catch (error) {
    console.error('调试端点异常:', error)
    res.status(500).json({
      success: false,
      error: '调试端点异常',
      details: error.message
    })
  }
})

export default router
