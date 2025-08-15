/**
 * API测试脚本：验证联系邮箱和站点域名的保存功能
 * 目标：确保API能正确保存和获取contact_email和site_domain设置
 */
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5173';

// 模拟管理员认证令牌（需要从浏览器开发者工具获取）
const getAuthToken = () => {
  // 这里需要从浏览器localStorage或sessionStorage获取真实的认证令牌
  console.log('⚠️  请从浏览器开发者工具获取认证令牌并替换此处的空字符串');
  return ''; // 需要替换为真实的JWT令牌
};

// 测试获取系统设置
async function testGetSettings() {
  console.log('\n🔍 测试获取系统设置...');
  try {
    const response = await fetch(`${baseUrl}/api/admin/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('✅ 获取设置响应状态:', response.status);
    console.log('📄 响应数据:', JSON.stringify(data, null, 2));
    
    if (data.basic) {
      console.log('📧 当前联系邮箱:', data.basic.contactEmail);
      console.log('🌐 当前站点域名:', data.basic.siteDomain);
    }
    
    return data;
  } catch (error) {
    console.error('❌ 获取设置失败:', error.message);
    return null;
  }
}

// 测试保存系统设置
async function testSaveSettings() {
  console.log('\n💾 测试保存系统设置...');
  
  const testData = {
    basic: {
      siteName: 'BiuBiuStar',
      siteDescription: '一个现代化的社交平台',
      contactEmail: 'test-save@biubiustar.com',
      siteDomain: 'test-save.biubiustar.com'
    }
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    console.log('✅ 保存设置响应状态:', response.status);
    console.log('📄 保存响应数据:', JSON.stringify(data, null, 2));
    
    return response.status === 200;
  } catch (error) {
    console.error('❌ 保存设置失败:', error.message);
    return false;
  }
}

// 验证保存后的数据
async function verifyAfterSave() {
  console.log('\n🔍 验证保存后的数据...');
  
  // 等待一秒确保数据已保存
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const data = await testGetSettings();
  
  if (data && data.basic) {
    const { contactEmail, siteDomain } = data.basic;
    
    console.log('\n📊 验证结果:');
    console.log('📧 联系邮箱是否更新:', contactEmail === 'test-save@biubiustar.com' ? '✅ 是' : '❌ 否');
    console.log('🌐 站点域名是否更新:', siteDomain === 'test-save.biubiustar.com' ? '✅ 是' : '❌ 否');
    
    return contactEmail === 'test-save@biubiustar.com' && siteDomain === 'test-save.biubiustar.com';
  }
  
  return false;
}

// 恢复默认设置
async function restoreDefaults() {
  console.log('\n🔄 恢复默认设置...');
  
  const defaultData = {
    basic: {
      siteName: 'BiuBiuStar',
      siteDescription: '一个现代化的社交平台',
      contactEmail: 'admin@biubiustar.com',
      siteDomain: 'biubiustar.com'
    }
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(defaultData)
    });
    
    console.log('✅ 恢复默认设置状态:', response.status);
    return response.status === 200;
  } catch (error) {
    console.error('❌ 恢复默认设置失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始API测试...');
  console.log('=' .repeat(50));
  
  const authToken = getAuthToken();
  if (!authToken) {
    console.log('\n❌ 测试终止：需要认证令牌');
    console.log('请按以下步骤获取认证令牌:');
    console.log('1. 在浏览器中打开管理后台并登录');
    console.log('2. 打开开发者工具 (F12)');
    console.log('3. 在Console中执行: localStorage.getItem("supabase.auth.token")');
    console.log('4. 复制返回的JWT令牌并替换脚本中的空字符串');
    return;
  }
  
  // 1. 获取当前设置
  const initialData = await testGetSettings();
  
  // 2. 测试保存功能
  const saveSuccess = await testSaveSettings();
  
  if (saveSuccess) {
    // 3. 验证保存结果
    const verifySuccess = await verifyAfterSave();
    
    // 4. 恢复默认设置
    await restoreDefaults();
    
    // 5. 最终验证
    await testGetSettings();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 测试总结:');
    console.log('💾 保存功能:', saveSuccess ? '✅ 正常' : '❌ 异常');
    console.log('🔍 数据验证:', verifySuccess ? '✅ 正常' : '❌ 异常');
    
    if (saveSuccess && verifySuccess) {
      console.log('\n🎉 所有测试通过！联系邮箱和站点域名保存功能正常。');
    } else {
      console.log('\n⚠️  测试发现问题，需要进一步调试。');
    }
  }
}

// 运行测试
runTests().catch(console.error);