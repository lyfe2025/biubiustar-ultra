/**
 * 联系邮箱和站点域名保存问题调试脚本
 * 用于测试完整的数据流：数据库 -> API -> 前端
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Supabase配置
const supabaseUrl = 'https://powzuwgzbmpnqamchdma.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5MjQwOCwiZXhwIjoyMDcwNjY4NDA4fQ.CJiTdPp8Afrv9C0eewo4YIwik54i75SEpSgZEp09o38'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugSettingsFlow() {
  console.log('=== 联系邮箱和站点域名保存问题调试 ===')
  console.log()

  try {
    // 1. 直接查询数据库中的设置
    console.log('1. 查询数据库中的基本设置...')
    const { data: dbSettings, error: dbError } = await supabase
      .from('system_settings')
      .select('*')
      .in('setting_key', ['contact_email', 'site_domain'])
      .order('setting_key')

    if (dbError) {
      console.error('数据库查询失败:', dbError)
      return
    }

    console.log('数据库中的设置:')
    dbSettings.forEach(setting => {
      console.log(`  ${setting.setting_key}: ${setting.setting_value}`)
    })
    console.log()

    // 2. 测试API获取设置
    console.log('2. 测试API获取设置...')
    try {
      const apiResponse = await fetch('http://localhost:3001/api/admin/settings', {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE', // 需要手动替换
          'Content-Type': 'application/json'
        }
      })

      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log('API返回的设置:')
        console.log(`  basic.contactEmail: ${apiData['basic.contactEmail']?.value || '未找到'}`)
        console.log(`  basic.siteDomain: ${apiData['basic.siteDomain']?.value || '未找到'}`)
      } else {
        console.log(`API调用失败: ${apiResponse.status} ${apiResponse.statusText}`)
        console.log('请确保:')
        console.log('1. 后端服务正在运行 (npm run dev)')
        console.log('2. 替换脚本中的认证令牌')
      }
    } catch (apiError) {
      console.log('API调用异常:', apiError.message)
      console.log('请确保后端服务正在运行')
    }
    console.log()

    // 3. 检查是否缺少记录
    console.log('3. 检查缺失的设置记录...')
    const requiredSettings = ['contact_email', 'site_domain']
    const existingKeys = dbSettings.map(s => s.setting_key)
    const missingKeys = requiredSettings.filter(key => !existingKeys.includes(key))

    if (missingKeys.length > 0) {
      console.log('缺失的设置记录:', missingKeys)
      console.log('正在插入默认记录...')

      for (const key of missingKeys) {
        const defaultValue = key === 'contact_email' ? 'contact@biubiustar.com' : 'biubiustar.com'
        
        const { error: insertError } = await supabase
          .from('system_settings')
          .insert({
            setting_key: key,
            setting_value: defaultValue,
            setting_type: 'string',
            category: 'basic',
            description: key === 'contact_email' ? '联系邮箱' : '站点域名',
            is_public: true
          })

        if (insertError) {
          console.error(`插入 ${key} 失败:`, insertError)
        } else {
          console.log(`✓ 已插入 ${key}: ${defaultValue}`)
        }
      }
    } else {
      console.log('✓ 所有必需的设置记录都存在')
    }
    console.log()

    // 4. 测试更新功能
    console.log('4. 测试设置更新功能...')
    const testEmail = 'test@example.com'
    const testDomain = 'test.example.com'
    const timestamp = Date.now()

    // 更新联系邮箱
    const { error: updateEmailError } = await supabase
      .from('system_settings')
      .update({ setting_value: `${testEmail}_${timestamp}` })
      .eq('setting_key', 'contact_email')

    if (updateEmailError) {
      console.error('更新联系邮箱失败:', updateEmailError)
    } else {
      console.log('✓ 联系邮箱更新成功')
    }

    // 更新站点域名
    const { error: updateDomainError } = await supabase
      .from('system_settings')
      .update({ setting_value: `${testDomain}_${timestamp}` })
      .eq('setting_key', 'site_domain')

    if (updateDomainError) {
      console.error('更新站点域名失败:', updateDomainError)
    } else {
      console.log('✓ 站点域名更新成功')
    }

    // 验证更新结果
    const { data: updatedSettings } = await supabase
      .from('system_settings')
      .select('*')
      .in('setting_key', ['contact_email', 'site_domain'])
      .order('setting_key')

    console.log('更新后的设置:')
    updatedSettings.forEach(setting => {
      console.log(`  ${setting.setting_key}: ${setting.setting_value}`)
    })
    console.log()

    // 5. 恢复默认值
    console.log('5. 恢复默认值...')
    await supabase
      .from('system_settings')
      .update({ setting_value: 'contact@biubiustar.com' })
      .eq('setting_key', 'contact_email')

    await supabase
      .from('system_settings')
      .update({ setting_value: 'biubiustar.com' })
      .eq('setting_key', 'site_domain')

    console.log('✓ 已恢复默认值')
    console.log()

    // 6. 检查权限
    console.log('6. 检查表权限...')
    const { data: permissions, error: permError } = await supabase
      .rpc('check_table_permissions', { table_name: 'system_settings' })
      .single()

    if (permError) {
      console.log('权限检查失败，使用SQL查询:')
      const { data: permData } = await supabase
        .from('information_schema.role_table_grants')
        .select('grantee, table_name, privilege_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'system_settings')
        .in('grantee', ['anon', 'authenticated'])

      console.log('system_settings表权限:')
      permData?.forEach(perm => {
        console.log(`  ${perm.grantee}: ${perm.privilege_type}`)
      })
    }

    console.log()
    console.log('=== 调试完成 ===')
    console.log()
    console.log('问题排查建议:')
    console.log('1. 如果数据库中的数据正确，但API返回错误，检查后端API逻辑')
    console.log('2. 如果API返回正确，但前端显示错误，检查前端缓存和默认值逻辑')
    console.log('3. 如果更新失败，检查数据库权限和RLS策略')
    console.log('4. 检查BasicSettings组件中的硬编码默认值是否覆盖了数据库数据')

  } catch (error) {
    console.error('调试过程中发生错误:', error)
  }
}

// 运行主函数
debugSettingsFlow().catch(console.error)