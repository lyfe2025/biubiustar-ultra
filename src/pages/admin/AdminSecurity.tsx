import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/language'
import { Shield, AlertTriangle, Clock, Unlock, Ban, Eye, Filter } from 'lucide-react'
import { adminService } from '../../services/AdminService'
import { toast } from 'sonner'

interface LoginAttempt {
  id: string
  ip_address: string
  email: string | null
  success: boolean
  user_agent: string | null
  failure_reason: string | null
  created_at: string
}

interface IPBlacklist {
  id: string
  ip_address: string
  reason: string
  blocked_until: string | null
  is_permanent: boolean
  created_at: string
}

interface SecurityLog {
  id: string
  event_type: string
  ip_address: string
  user_id: string | null
  user_email: string | null
  event_data: any
  severity: 'info' | 'warning' | 'error'
  created_at: string
}

interface SecurityStats {
  totalLoginAttempts: number
  failedAttempts24h: number
  blockedIPs: number
  securityEvents7d: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const AdminSecurity: React.FC = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'attempts' | 'blacklist' | 'logs' | 'stats'>('stats')
  const [loading, setLoading] = useState(false)
  
  // 统计数据
  const [stats, setStats] = useState<SecurityStats | null>(null)
  
  // 登录尝试记录
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])
  const [attemptsPagination, setAttemptsPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  
  // IP黑名单
  const [ipBlacklist, setIpBlacklist] = useState<IPBlacklist[]>([])
  const [blacklistPagination, setBlacklistPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  
  // 安全日志
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [logsPagination, setLogsPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  
  // 过滤器
  const [logsFilter, setLogsFilter] = useState({
    eventType: '',
    severity: ''
  })
  
  // 手动添加IP表单
  const [showAddIPForm, setShowAddIPForm] = useState(false)
  const [newIPForm, setNewIPForm] = useState({
    ip_address: '',
    reason: ''
  })

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await adminService.getSecurityStats()
      setStats(response)
    } catch (error) {
      console.error('加载安全统计失败:', error)
      toast.error('加载安全统计失败')
    }
  }

  // 加载登录尝试记录
  const loadLoginAttempts = async (page = 1) => {
    setLoading(true)
    try {
      const response = await adminService.getLoginAttempts(page, 20)
      setLoginAttempts(response.data)
      setAttemptsPagination(response.pagination)
    } catch (error) {
      console.error('加载登录尝试记录失败:', error)
      toast.error('加载登录尝试记录失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载IP黑名单
  const loadIPBlacklist = async (page = 1) => {
    setLoading(true)
    try {
      const response = await adminService.getIPBlacklist(page, 20)
      setIpBlacklist(response.data)
      setBlacklistPagination(response.pagination)
    } catch (error) {
      console.error('加载IP黑名单失败:', error)
      toast.error('加载IP黑名单失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载安全日志
  const loadSecurityLogs = async (page = 1) => {
    setLoading(true)
    try {
      const response = await adminService.getSecurityLogs(
        page, 
        20, 
        logsFilter.eventType || undefined,
        logsFilter.severity || undefined
      )
      setSecurityLogs(response.data)
      setLogsPagination(response.pagination)
    } catch (error) {
      console.error('加载安全日志失败:', error)
      toast.error('加载安全日志失败')
    } finally {
      setLoading(false)
    }
  }

  // 解锁IP
  const handleUnlockIP = async (ip: string) => {
    if (!confirm(`确定要解锁IP ${ip} 吗？`)) return
    
    try {
      await adminService.unlockIP(ip)
      toast.success('IP已成功解锁')
      loadIPBlacklist(blacklistPagination.page)
      loadStats()
    } catch (error) {
      console.error('解锁IP失败:', error)
      toast.error('解锁IP失败')
    }
  }

  // 添加IP到黑名单
  const handleAddIP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newIPForm.ip_address.trim()) {
      toast.error('请输入IP地址')
      return
    }
    
    try {
      await adminService.addIPToBlacklist(newIPForm.ip_address, newIPForm.reason)
      toast.success('IP已添加到黑名单')
      setShowAddIPForm(false)
      setNewIPForm({ ip_address: '', reason: '' })
      loadIPBlacklist(blacklistPagination.page)
      loadStats()
    } catch (error) {
      console.error('添加IP到黑名单失败:', error)
      toast.error('添加IP到黑名单失败')
    }
  }

  // 格式化时间
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN')
  }

  // 获取严重程度颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // 分页组件
  const Pagination: React.FC<{ 
    pagination: PaginationInfo
    onPageChange: (page: number) => void 
  }> = ({ pagination, onPageChange }) => {
    const { page, totalPages } = pagination
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          共 {pagination.total} 条记录
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-sm text-gray-700">
            第 {page} 页，共 {totalPages} 页
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'attempts') {
      loadLoginAttempts()
    } else if (activeTab === 'blacklist') {
      loadIPBlacklist()
    } else if (activeTab === 'logs') {
      loadSecurityLogs()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'logs') {
      loadSecurityLogs(1)
    }
  }, [logsFilter])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">安全管理</h1>
        <p className="text-gray-200">管理登录安全、IP黑名单和安全日志</p>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'stats', label: '安全概览', icon: Shield },
            { key: 'attempts', label: '登录记录', icon: Eye },
            { key: 'blacklist', label: 'IP黑名单', icon: Ban },
            { key: 'logs', label: '安全日志', icon: AlertTriangle }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 安全概览 */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总登录尝试</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalLoginAttempts || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">24小时失败次数</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.failedAttempts24h || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Ban className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">被阻止IP</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.blockedIPs || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">7天安全事件</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.securityEvents7d || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 登录尝试记录 */}
      {activeTab === 'attempts' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">登录尝试记录</h3>
            
            {loading ? (
              <div className="text-center py-4">加载中...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP地址</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失败原因</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loginAttempts.map((attempt) => (
                      <tr key={attempt.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attempt.ip_address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attempt.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            attempt.success 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {attempt.success ? '成功' : '失败'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {attempt.failure_reason || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(attempt.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <Pagination 
              pagination={attemptsPagination} 
              onPageChange={(page) => loadLoginAttempts(page)} 
            />
          </div>
        </div>
      )}

      {/* IP黑名单 */}
      {activeTab === 'blacklist' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">IP黑名单</h3>
              <button
                onClick={() => setShowAddIPForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                添加IP
              </button>
            </div>
            
            {/* 添加IP表单 */}
            {showAddIPForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <form onSubmit={handleAddIP}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IP地址
                      </label>
                      <input
                        type="text"
                        value={newIPForm.ip_address}
                        onChange={(e) => setNewIPForm({ ...newIPForm, ip_address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例如: 192.168.1.1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        原因
                      </label>
                      <input
                        type="text"
                        value={newIPForm.reason}
                        onChange={(e) => setNewIPForm({ ...newIPForm, reason: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="阻止原因"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      添加到黑名单
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddIPForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-4">加载中...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP地址</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">原因</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">阻止时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">解除时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ipBlacklist.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.ip_address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(item.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.is_permanent ? (
                            <span className="text-red-600">永久</span>
                          ) : (
                            item.blocked_until ? formatTime(item.blocked_until) : '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUnlockIP(item.ip_address)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <Unlock className="w-4 h-4" />
                            <span>解锁</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <Pagination 
              pagination={blacklistPagination} 
              onPageChange={(page) => loadIPBlacklist(page)} 
            />
          </div>
        </div>
      )}

      {/* 安全日志 */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">安全日志</h3>
              
              {/* 过滤器 */}
              <div className="flex space-x-2">
                <select
                  value={logsFilter.eventType}
                  onChange={(e) => setLogsFilter({ ...logsFilter, eventType: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">所有事件类型</option>
                  <option value="admin_login_success">管理员登录成功</option>
                  <option value="unauthorized_admin_access_attempt">未授权访问尝试</option>
                  <option value="ip_auto_block">IP自动阻止</option>
                  <option value="ip_manual_unlock">IP手动解锁</option>
                  <option value="ip_manual_block">IP手动阻止</option>
                  <option value="login_system_error">登录系统错误</option>
                </select>
                
                <select
                  value={logsFilter.severity}
                  onChange={(e) => setLogsFilter({ ...logsFilter, severity: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">所有严重程度</option>
                  <option value="info">信息</option>
                  <option value="warning">警告</option>
                  <option value="error">错误</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-4">加载中...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">事件类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">严重程度</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP地址</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户邮箱</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {securityLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.event_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getSeverityColor(log.severity)
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip_address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.user_email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(log.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <Pagination 
              pagination={logsPagination} 
              onPageChange={(page) => loadSecurityLogs(page)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSecurity