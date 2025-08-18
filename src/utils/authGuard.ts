// 全局认证守卫状态管理
class AuthGuardState {
  private static isChecking = false
  private static isAuthError = false
  private static lastCheckTime = 0
  private static readonly CHECK_INTERVAL = 5000 // 5秒内不重复检查

  // 检查是否可以进行认证检查
  static canCheckAuth(): boolean {
    const now = Date.now()
    
    // 如果正在检查或已经有认证错误，不允许重复检查
    if (this.isChecking || this.isAuthError) {
      return false
    }
    
    // 如果距离上次检查时间太短，不允许重复检查
    if (now - this.lastCheckTime < this.CHECK_INTERVAL) {
      return false
    }
    
    return true
  }

  // 开始认证检查
  static startChecking(): void {
    this.isChecking = true
    this.lastCheckTime = Date.now()
  }

  // 认证检查成功
  static checkSuccess(): void {
    this.isChecking = false
    this.isAuthError = false
  }

  // 认证检查失败
  static checkFailed(): void {
    this.isChecking = false
    this.isAuthError = true
  }

  // 重置状态（用于重新登录后）
  static reset(): void {
    this.isChecking = false
    this.isAuthError = false
    this.lastCheckTime = 0
  }

  // 获取当前状态
  static getState() {
    return {
      isChecking: this.isChecking,
      isAuthError: this.isAuthError,
      lastCheckTime: this.lastCheckTime
    }
  }
}

export default AuthGuardState
