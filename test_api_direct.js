// 使用内置的fetch API (Node.js 18+)
// const fetch = require('node-fetch');

async function testAPI() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbkBiaXViaXVzdGFyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzM1NzI5NCwiZXhwIjoxNzM3MzYwODk0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
  
  try {
    console.log('Testing API call to /api/admin/settings...');
    
    const response = await fetch('http://localhost:3001/api/admin/settings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // 检查数据结构
    if (data.basic) {
      console.log('\n=== Basic Settings ===');
      console.log('Contact Email:', data.basic.contactEmail);
      console.log('Site Domain:', data.basic.siteDomain);
      console.log('Site Name:', data.basic.siteName);
    } else {
      console.log('\n❌ Missing basic settings in response');
    }
    
  } catch (error) {
    console.error('API call failed:', error.message);
  }
}

testAPI();