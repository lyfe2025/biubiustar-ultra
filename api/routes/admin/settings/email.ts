import { Router, Request, Response } from 'express'
import nodemailer from 'nodemailer'
import { supabaseAdmin } from '../../../lib/supabase'
import { requireAdmin } from '../../../middleware/auth'
import asyncHandler from '../../../middleware/asyncHandler.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 测试邮件发送
router.post('/test', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { to, subject, content } = req.body
    
    if (!to || !subject || !content) {
      return res.status(400).json({ error: '缺少必要的邮件参数' })
    }
    
    // 获取邮件配置
    const { data: emailSettings, error: settingsError } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_secure'])
    
    if (settingsError) {
      console.error('获取邮件配置失败:', settingsError)
      return res.status(500).json({ error: '获取邮件配置失败' })
    }
    
    // 转换配置为对象
    const config: Record<string, string> = {}
    emailSettings?.forEach(setting => {
      config[setting.setting_key] = setting.setting_value
    })
    
    // 检查必要的配置
    if (!config.smtp_host || !config.smtp_port || !config.smtp_user || !config.smtp_pass) {
      return res.status(400).json({ error: '邮件配置不完整，请先配置SMTP设置' })
    }
    
    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: parseInt(config.smtp_port),
      secure: config.smtp_secure === 'true', // true for 465, false for other ports
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass
      }
    })
    
    // 验证连接
    try {
      await transporter.verify()
    } catch (verifyError: any) {
      console.error('SMTP连接验证失败:', verifyError)
      return res.status(500).json({ 
        error: 'SMTP连接验证失败',
        details: verifyError?.message || '未知错误'
      })
    }
    
    // 发送测试邮件
    const mailOptions = {
      from: config.smtp_user,
      to: to,
      subject: subject,
      html: content
    }
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('测试邮件发送成功:', info.messageId)
    
    res.json({ 
      success: true, 
      message: '测试邮件发送成功',
      messageId: info.messageId
    })
    
  } catch (error: any) {
    console.error('Error testing email:', error);
    res.status(500).json({ 
      error: 'Failed to test email',
      details: error?.message || 'Unknown error'
    });
  }
}))

// 获取邮件配置状态
router.get('/config-status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 获取邮件配置
    const { data: emailSettings, error: settingsError } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_secure'])
    
    if (settingsError) {
      console.error('获取邮件配置失败:', settingsError)
      return res.status(500).json({ error: '获取邮件配置失败' })
    }
    
    // 转换配置为对象
    const config: Record<string, string> = {}
    emailSettings?.forEach(setting => {
      config[setting.setting_key] = setting.setting_value
    })
    
    // 检查配置完整性
    const requiredFields = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass']
    const missingFields = requiredFields.filter(field => !config[field])
    
    const status = {
      configured: missingFields.length === 0,
      missingFields: missingFields,
      hasHost: !!config.smtp_host,
      hasPort: !!config.smtp_port,
      hasUser: !!config.smtp_user,
      hasPassword: !!config.smtp_pass,
      isSecure: config.smtp_secure === 'true'
    }
    
    res.json({ 
      success: true, 
      data: status
    })
    
  } catch (error: any) {
    console.error('Error getting email config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}))

export default router