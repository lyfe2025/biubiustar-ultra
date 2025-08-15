import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://powzuwgzbmpnqamchdma.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5MjQwOCwiZXhwIjoyMDcwNjY4NDA4fQ.CJiTdPp8Afrv9C0eewo4YIwik54i75SEpSgZEp09o38'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function unblockIP() {
  try {
    const ipToUnblock = '::1'
    
    console.log(`正在解除IP地址 ${ipToUnblock} 的封禁...`)
    
    // 从IP黑名单中删除记录
    const { data, error } = await supabase
      .from('ip_blacklist')
      .delete()
      .eq('ip_address', ipToUnblock)
      .select()
    
    if (error) {
      console.error('解除封禁失败:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ 成功解除IP封禁!')
      console.log('已删除的记录:', data[0])
      
      // 记录安全事件到security_logs表
      const { error: logError } = await supabase
        .from('security_logs')
        .insert({
          event_type: 'ip_manual_unlock',
          ip_address: ipToUnblock,
          user_id: null,
          user_email: 'system_admin',
          details: {
            unlockedIP: ipToUnblock,
            adminAction: true,
            reason: 'Manual unlock for wwx@biubiustar.com admin access'
          },
          severity: 'info'
        })
      
      if (logError) {
        console.warn('记录安全日志失败:', logError)
      } else {
        console.log('✅ 已记录安全日志')
      }
      
      // 记录活动日志到activity_logs表
      const { error: activityError } = await supabase
        .from('activity_logs')
        .insert({
          type: 'ip_security',
          action: 'ip_manual_unlock',
          details: {
            unlockedIP: ipToUnblock,
            adminAction: true,
            reason: 'Manual unlock for wwx@biubiustar.com admin access'
          },
          user_id: null,
          user_email: 'system_admin',
          ip_address: ipToUnblock,
          user_agent: 'System Admin Script'
        })
      
      if (activityError) {
        console.warn('记录活动日志失败:', activityError)
      } else {
        console.log('✅ 已记录活动日志')
      }
      
    } else {
      console.log('⚠️  没有找到需要删除的IP记录，可能已经被解除封禁')
    }
    
    // 验证IP是否已从黑名单中移除
    const { data: checkData, error: checkError } = await supabase
      .from('ip_blacklist')
      .select('*')
      .eq('ip_address', ipToUnblock)
    
    if (checkError) {
      console.error('验证失败:', checkError)
    } else if (checkData && checkData.length === 0) {
      console.log('✅ 验证成功：IP地址已从黑名单中移除')
    } else {
      console.log('❌ 验证失败：IP地址仍在黑名单中')
    }
    
  } catch (error) {
    console.error('执行失败:', error)
  }
}

unblockIP()