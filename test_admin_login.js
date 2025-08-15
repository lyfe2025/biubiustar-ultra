import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://powzuwgzbmpnqamchdma.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTI0MDgsImV4cCI6MjA3MDY2ODQwOH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAdminLogin() {
  try {
    const testEmail = 'wwx@biubiustar.com'
    console.log(`正在测试管理员账号 ${testEmail} 的登录功能...`)
    
    // 注意：这里不能直接测试登录，因为我们没有密码
    // 但我们可以测试管理后台的登录API是否正常响应
    
    console.log('测试管理后台登录API的可访问性...')
    
    // 发送一个测试请求到管理后台登录API
    const response = await fetch('http://localhost:3001/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test Script'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'test_password' // 这会失败，但能测试IP是否被封禁
      })
    })
    
    const result = await response.json()
    
    console.log('API响应状态:', response.status)
    console.log('API响应内容:', result)
    
    if (response.status === 401 && result.error === '用户名或密码错误') {
      console.log('✅ 测试成功：API正常响应，IP封禁已解除')
      console.log('✅ 管理员账号现在可以正常尝试登录（密码错误是正常的）')
    } else if (response.status === 403 && result.error && result.error.includes('IP地址已被限制')) {
      console.log('❌ 测试失败：IP地址仍然被限制')
    } else {
      console.log('⚠️  收到意外响应，请检查API状态')
    }
    
    // 检查当前IP黑名单状态
    console.log('\n检查当前IP黑名单状态...')
    const supabaseAdmin = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5MjQwOCwiZXhwIjoyMDcwNjY4NDA4fQ.CJiTdPp8Afrv9C0eewo4YIwik54i75SEpSgZEp09o38')
    
    const { data: blacklistData, error: blacklistError } = await supabaseAdmin
      .from('ip_blacklist')
      .select('*')
      .eq('ip_address', '::1')
    
    if (blacklistError) {
      console.error('查询IP黑名单失败:', blacklistError)
    } else if (blacklistData && blacklistData.length === 0) {
      console.log('✅ 确认：IP地址::1已从黑名单中移除')
    } else {
      console.log('❌ 警告：IP地址::1仍在黑名单中')
      console.log('黑名单记录:', blacklistData)
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testAdminLogin()