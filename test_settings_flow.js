/**
 * 测试修复后的设置保存和读取流程
 * 验证联系邮箱和站点域名的完整数据同步
 */
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Supabase配置
const supabaseUrl = 'https://powzuwgzbmpnqamchdma.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5MjQwOCwiZXhwIjoyMDcwNjY4NDA4fQ.CJiTdPp8Afrv9C0eewo4YIwik54i75SEpSgZEp09o38'

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 测试配置
const API_BASE_URL = 'http://localhost:3001'
const TEST_DATA = {
  contactEmail: 'test@example.com',
  siteDomain: 'test.example.com'
}

// 使用用户提供的token直接测试
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkltV1RwL2pyV0lBT0FhVHAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3Bvd3p1d2d6Ym1wbnFhbWNoZG1hLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJhOGE1MTcyZC02YWExLTQ5YTEtOGQ5Zi05ZGQ1ZGIxMTEwOTQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU1Mjk3MDc5LCJpYXQiOjE3NTUyOTM0NzksImVtYWlsIjoid3d4QGJpdWJpdXN0YXIuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTUyOTM0Nzl9XSwic2Vzc2lvbl9pZCI6ImZhY2NhMmFjLTdkN2UtNGRmOS05OGRhLTI0OTVjMTc0M2ZjOSIsImlzX2Fub255bW91cyI6ZmFsc2V9.PJwKgGISGXN3nMRZHSmkyJNSfCz8aYVCAdnE5er8igY'; // 用户提供的真实管理员token

// 测试结果记录
const testResults = []

/**
 * 记录测试结果
 */
function logTest(testName, success, message, data = null) {
  const result = {
    test: testName,
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  }
  testResults.push(result)
  console.log(`[${success ? 'PASS' : 'FAIL'}] ${testName}: ${message}`)
  if (data) {
    console.log('  Data:', JSON.stringify(data, null, 2))
  }
}



// 直接使用提供的管理员token
function getAdminToken() {
  console.log('✅ 使用提供的管理员token')
  return Promise.resolve(ADMIN_TOKEN)
}

/**
 * 测试管理后台API的GET请求
 */
async function testGetSettings(token) {
  try {
    console.log('\n=== 测试GET /api/admin/settings ===')
    
    const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // 检查返回的数据结构
    logTest('GET Settings API', true, 'API调用成功', {
      hasBasicCategory: !!data.basic,
      contactEmail: data.basic?.contactEmail,
      siteDomain: data.basic?.siteDomain,
      dataStructure: Object.keys(data)
    })
    
    // 检查关键字段是否存在
    const hasContactEmail = data.basic && 'contactEmail' in data.basic
    const hasSiteDomain = data.basic && 'siteDomain' in data.basic
    
    logTest('ContactEmail字段存在', hasContactEmail, 
      hasContactEmail ? '字段存在' : '字段缺失', 
      { value: data.basic?.contactEmail })
    
    logTest('SiteDomain字段存在', hasSiteDomain, 
      hasSiteDomain ? '字段存在' : '字段缺失', 
      { value: data.basic?.siteDomain })
    
    return data
  } catch (error) {
    logTest('GET Settings API', false, `请求失败: ${error.message}`)
    throw error
  }
}

/**
 * 测试管理后台API的PUT请求
 */
async function testPutSettings(token, settingsData) {
  try {
    console.log('\n=== 测试PUT /api/admin/settings ===')
    
    const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settingsData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    
    logTest('PUT Settings API', true, 'API调用成功', data)
    
    return data
  } catch (error) {
    logTest('PUT Settings API', false, `请求失败: ${error.message}`)
    throw error
  }
}

/**
 * 直接查询数据库验证数据
 */
async function verifyDatabaseData() {
  try {
    console.log('\n=== 验证数据库数据 ===')
    
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .in('setting_key', ['contact_email', 'site_domain'])
    
    if (error) {
      throw error
    }
    
    const contactEmailRecord = data.find(item => item.setting_key === 'contact_email')
    const siteDomainRecord = data.find(item => item.setting_key === 'site_domain')
    
    logTest('数据库contact_email记录', !!contactEmailRecord, 
      contactEmailRecord ? '记录存在' : '记录不存在', 
      contactEmailRecord)
    
    logTest('数据库site_domain记录', !!siteDomainRecord, 
      siteDomainRecord ? '记录存在' : '记录不存在', 
      siteDomainRecord)
    
    return {
      contactEmail: contactEmailRecord,
      siteDomain: siteDomainRecord
    }
  } catch (error) {
    logTest('数据库验证', false, `查询失败: ${error.message}`)
    throw error
  }
}

/**
 * 测试完整的保存和读取流程
 */
async function testCompleteFlow(token) {
  try {
    console.log('\n=== 测试完整保存和读取流程 ===')
    
    // 1. 获取初始数据
    const initialData = await testGetSettings(token)
    
    // 测试配置
    const testSettings = {
      'basic.contactEmail': TEST_DATA.contactEmail,
      'basic.siteDomain': TEST_DATA.siteDomain
    }
    
    await testPutSettings(token, testSettings)
    
    // 3. 等待一秒确保数据已保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 4. 重新读取数据
    const updatedData = await testGetSettings(token)
    
    // 5. 验证数据一致性
    const contactEmailMatch = updatedData.basic?.contactEmail === TEST_DATA.contactEmail
    const siteDomainMatch = updatedData.basic?.siteDomain === TEST_DATA.siteDomain
    
    logTest('ContactEmail数据一致性', contactEmailMatch, 
      contactEmailMatch ? '数据一致' : '数据不一致', {
        expected: TEST_DATA.contactEmail,
        actual: updatedData.basic?.contactEmail
      })
    
    logTest('SiteDomain数据一致性', siteDomainMatch, 
      siteDomainMatch ? '数据一致' : '数据不一致', {
        expected: TEST_DATA.siteDomain,
        actual: updatedData.basic?.siteDomain
      })
    
    // 6. 验证数据库数据
    const dbData = await verifyDatabaseData()
    
    const dbContactEmailMatch = dbData.contactEmail?.setting_value === TEST_DATA.contactEmail
    const dbSiteDomainMatch = dbData.siteDomain?.setting_value === TEST_DATA.siteDomain
    
    logTest('数据库ContactEmail一致性', dbContactEmailMatch, 
      dbContactEmailMatch ? '数据库数据一致' : '数据库数据不一致', {
        expected: TEST_DATA.contactEmail,
        actual: dbData.contactEmail?.setting_value
      })
    
    logTest('数据库SiteDomain一致性', dbSiteDomainMatch, 
      dbSiteDomainMatch ? '数据库数据一致' : '数据库数据不一致', {
        expected: TEST_DATA.siteDomain,
        actual: dbData.siteDomain?.setting_value
      })
    
    return {
      apiConsistent: contactEmailMatch && siteDomainMatch,
      dbConsistent: dbContactEmailMatch && dbSiteDomainMatch
    }
  } catch (error) {
    logTest('完整流程测试', false, `测试失败: ${error.message}`)
    throw error
  }
}

/**
 * 测试空值处理
 */
async function testEmptyValues(token) {
  try {
    console.log('\n=== 测试空值处理 ===')
    
    // 测试空字符串
    const emptySettings = {
      'basic.contactEmail': '',
      'basic.siteDomain': ''
    }
    
    await testPutSettings(token, emptySettings)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const emptyData = await testGetSettings(token)
    
    logTest('空值ContactEmail处理', emptyData.basic?.contactEmail === '', 
      '空值处理正确', {
        expected: '',
        actual: emptyData.basic?.contactEmail
      })
    
    logTest('空值SiteDomain处理', emptyData.basic?.siteDomain === '', 
      '空值处理正确', {
        expected: '',
        actual: emptyData.basic?.siteDomain
      })
    
  } catch (error) {
    logTest('空值处理测试', false, `测试失败: ${error.message}`)
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('开始测试设置保存和读取流程...')
  console.log('测试时间:', new Date().toISOString())
  
  try {
    // 1. 使用提供的管理员token
    console.log('\n=== 管理员认证 ===')
    const token = await getAdminToken()
    
    // 测试基本API功能
    await testGetSettings(token)
    
    // 测试完整流程
    await testCompleteFlow(token)
    
    // 测试空值处理
    await testEmptyValues(token)
    
    // 输出测试总结
    console.log('\n=== 测试总结 ===')
    const totalTests = testResults.length
    const passedTests = testResults.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    
    console.log(`总测试数: ${totalTests}`)
    console.log(`通过: ${passedTests}`)
    console.log(`失败: ${failedTests}`)
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`)
    
    if (failedTests > 0) {
      console.log('\n失败的测试:')
      testResults.filter(r => !r.success).forEach(result => {
        console.log(`- ${result.test}: ${result.message}`)
      })
    }
    
    // 保存测试结果到文件
    const fs = await import('fs')
    const testReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(2) + '%'
      },
      results: testResults
    }
    
    fs.writeFileSync('test_settings_report.json', JSON.stringify(testReport, null, 2))
    console.log('\n测试报告已保存到: test_settings_report.json')
    
  } catch (error) {
    console.error('测试执行失败:', error)
    process.exit(1)
  }
}

// 运行测试
runTests().catch(console.error)