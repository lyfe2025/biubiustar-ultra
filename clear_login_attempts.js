import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://powzuwgzbmpnqamchdma.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5MjQwOCwiZXhwIjoyMDcwNjY4NDA4fQ.CJiTdPp8Afrv9C0eewo4YIwik54i75SEpSgZEp09o38'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearLoginAttempts() {
  try {
    const ipToClear = '::1'
    const emailToClear = 'wwx@biubiustar.com'
    
    console.log(`正在清理IP地址 ${ipToClear} 和邮箱 ${emailToClear} 的登录尝试记录...`)
    
    // 查询当前的登录尝试记录
    const { data: beforeData, error: beforeError } = await supabase
      .from('login_attempts')
      .select('*')
      .or(`ip_address.eq.${ipToClear},email.eq.${emailToClear}`)
      .order('attempt_time', { ascending: false })
    
    if (beforeError) {
      console.error('查询登录尝试记录失败:', beforeError)
      return
    }
    
    console.log(`找到 ${beforeData?.length || 0} 条相关登录尝试记录`)
    
    if (beforeData && beforeData.length > 0) {
      console.log('最近的几条记录:')
      beforeData.slice(0, 5).forEach((record, index) => {
        console.log(`${index + 1}. IP: ${record.ip_address}, 邮箱: ${record.email}, 成功: ${record.success}, 时间: ${record.attempt_time}`)
      })
    }
    
    // 删除相关的登录尝试记录
    const { data: deletedData, error: deleteError } = await supabase
      .from('login_attempts')
      .delete()
      .or(`ip_address.eq.${ipToClear},email.eq.${emailToClear}`)
      .select()
    
    if (deleteError) {
      console.error('清理登录尝试记录失败:', deleteError)
      return
    }
    
    console.log(`✅ 成功清理了 ${deletedData?.length || 0} 条登录尝试记录`)
    
    // 验证清理结果
    const { data: afterData, error: afterError } = await supabase
      .from('login_attempts')
      .select('*')
      .or(`ip_address.eq.${ipToClear},email.eq.${emailToClear}`)
    
    if (afterError) {
      console.error('验证清理结果失败:', afterError)
    } else {
      console.log(`✅ 验证成功：剩余相关记录数量: ${afterData?.length || 0}`)
    }
    
    // 记录活动日志
    const { error: activityError } = await supabase
      .from('activity_logs')
      .insert({
        type: 'system_maintenance',
        action: 'login_attempts_cleanup',
        details: {
          cleanedIP: ipToClear,
          cleanedEmail: emailToClear,
          recordsDeleted: deletedData?.length || 0,
          reason: 'Manual cleanup after IP unblock for admin access'
        },
        user_id: null,
        user_email: 'system_admin',
        ip_address: ipToClear,
        user_agent: 'System Admin Script'
      })
    
    if (activityError) {
      console.warn('记录活动日志失败:', activityError)
    } else {
      console.log('✅ 已记录活动日志')
    }
    
  } catch (error) {
    console.error('执行失败:', error)
  }
}

clearLoginAttempts()