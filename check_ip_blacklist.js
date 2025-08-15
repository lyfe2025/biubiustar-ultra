import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://powzuwgzbmpnqamchdma.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5MjQwOCwiZXhwIjoyMDcwNjY4NDA4fQ.CJiTdPp8Afrv9C0eewo4YIwik54i75SEpSgZEp09o38'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkIPBlacklist() {
  try {
    console.log('正在查询IP黑名单...')
    
    // 查询IP黑名单
    const { data: blacklist, error } = await supabase
      .from('ip_blacklist')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('查询失败:', error)
      return
    }
    
    console.log('\n当前IP黑名单:')
    console.log('='.repeat(80))
    
    if (!blacklist || blacklist.length === 0) {
      console.log('没有找到被封禁的IP地址')
    } else {
      blacklist.forEach((item, index) => {
        console.log(`${index + 1}. IP地址: ${item.ip_address}`)
        console.log(`   封禁原因: ${item.reason}`)
        console.log(`   是否永久: ${item.is_permanent ? '是' : '否'}`)
        console.log(`   封禁到期: ${item.blocked_until || '永久'}`)
        console.log(`   创建时间: ${item.created_at}`)
        console.log('-'.repeat(60))
      })
    }
    
    // 同时查询最近的登录尝试记录，看看wwx@biubiustar.com的IP
    console.log('\n查询wwx@biubiustar.com的最近登录记录...')
    const { data: attempts, error: attemptsError } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('email', 'wwx@biubiustar.com')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (attemptsError) {
      console.error('查询登录记录失败:', attemptsError)
    } else if (attempts && attempts.length > 0) {
      console.log('\nwwx@biubiustar.com 最近的登录记录:')
      console.log('='.repeat(80))
      attempts.forEach((attempt, index) => {
        console.log(`${index + 1}. IP地址: ${attempt.ip_address}`)
        console.log(`   邮箱: ${attempt.email}`)
        console.log(`   成功: ${attempt.success ? '是' : '否'}`)
        console.log(`   时间: ${attempt.created_at}`)
        console.log('-'.repeat(60))
      })
    } else {
      console.log('没有找到wwx@biubiustar.com的登录记录')
    }
    
  } catch (error) {
    console.error('执行失败:', error)
  }
}

checkIPBlacklist()