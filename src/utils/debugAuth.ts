// 认证调试工具
export const debugAuth = {
  // 清理所有认证相关的本地存储
  clearAllAuth() {
    const authKeys = [
      'adminToken',
      'adminUser', 
      'supabase.auth.token',
      'sb-' // Supabase相关的键通常以sb-开头
    ];
    
    // 清理localStorage
    Object.keys(localStorage).forEach(key => {
      if (authKeys.some(authKey => key.includes(authKey))) {
        console.log(`清理localStorage: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // 清理sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (authKeys.some(authKey => key.includes(authKey))) {
        console.log(`清理sessionStorage: ${key}`);
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('✅ 认证缓存已清理');
  },

  // 检查当前认证状态
  checkCurrentAuth() {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    const supabaseToken = localStorage.getItem('supabase.auth.token');
    
    console.log('🔍 当前认证状态:');
    console.log('adminToken:', adminToken ? '存在' : '不存在');
    console.log('adminUser:', adminUser ? '存在' : '不存在');
    console.log('supabaseToken:', supabaseToken ? '存在' : '不存在');
    
    if (adminToken) {
      console.log('adminToken长度:', adminToken.length);
    }
    
    return {
      hasAdminToken: !!adminToken,
      hasAdminUser: !!adminUser,
      hasSupabaseToken: !!supabaseToken
    };
  },

  // 重置页面（强制刷新）
  resetPage() {
    console.log('🔄 重置页面...');
    this.clearAllAuth();
    setTimeout(() => {
      window.location.href = '/admin';
    }, 500);
  }
};

// 在全局暴露调试工具（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  (window as any).debugAuth = debugAuth;
  console.log('🛠️ 调试工具已加载，使用 window.debugAuth 进行调试');
  console.log('可用方法:');
  console.log('- debugAuth.clearAllAuth() - 清理所有认证缓存');
  console.log('- debugAuth.checkCurrentAuth() - 检查当前认证状态');
  console.log('- debugAuth.resetPage() - 重置页面');
}
