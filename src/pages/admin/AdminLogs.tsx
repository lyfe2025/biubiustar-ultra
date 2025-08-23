import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/language';
import { Activity, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Trash } from 'lucide-react';
import { adminService } from '../../services/admin';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  type: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user_email?: string;
}

interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

const AdminLogs: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterResourceType, setFilterResourceType] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // 刷新数据
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await loadLogs(pagination.page);
      toast.success(t('admin.logs.messages.refreshed') || '数据已刷新');
    } catch (error) {
      toast.error(t('admin.logs.messages.refreshFailed') || '刷新数据失败');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 清除活动日志
  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const response = await adminService.clearActivityLogs(30); // 清除30天前的日志
      const count = response.data?.deletedCount || 0;
      toast.success(t('admin.logs.clearLogs.successMessage', { count }) || `成功清除 ${count} 条日志记录`);
      setShowClearConfirm(false);
      // 重新加载日志列表
      await loadLogs(1);
    } catch (error) {
      console.error('清除活动日志失败:', error);
      toast.error(t('admin.logs.clearLogs.errorMessage') || '清除活动日志失败');
    } finally {
      setIsClearing(false);
    }
  };

  // 加载活动日志
  const loadLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        action: filterAction || undefined,
        resource_type: filterResourceType || undefined,
        start_date: dateRange.start || undefined,
        end_date: dateRange.end || undefined
      };
      
      const response = await adminService.getActivityLogs(
        params.page,
        params.limit,
        params.search || undefined,
        params.action || undefined
      );
      setLogs(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('加载活动日志失败:', error);
      toast.error('加载活动日志失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [searchTerm, filterAction, filterResourceType, dateRange]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
      loadLogs(page);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'text-green-600 bg-green-50';
      case 'update':
        return 'text-blue-600 bg-blue-50';
      case 'delete':
        return 'text-red-600 bg-red-50';
      case 'login':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('');
    setFilterResourceType('');
    setDateRange({ start: '', end: '' });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {t('admin.logs.title') || '活动日志'}
              </h1>
            </div>
                          <p className="text-gray-600">
                {t('admin.logs.description') || '查看系统中所有用户活动和操作记录'}
              </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isClearing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash className="w-4 h-4" />
              {isClearing ? (t('admin.logs.clearLogs.clearing') || '清除中...') : (t('admin.logs.clearLogs.button') || '清除日志')}
            </button>
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? (t('common.actions.loading') || '刷新中...') : (t('common.actions.refresh') || '刷新')}
            </button>
          </div>
        </div>



        {/* 活动日志列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 表格头部 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('admin.logs.title') || '活动日志'}
                </h3>
              </div>
              <div className="text-sm text-gray-500">
                共 {pagination.total} 条记录
              </div>
            </div>
            
            {/* 筛选器 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('admin.logs.search.placeholder') || '搜索活动...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* 操作类型 */}
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">{t('admin.logs.filter.allActions') || '所有操作'}</option>
                <option value="create">{t('admin.logs.actions.create') || '创建'}</option>
                <option value="update">{t('admin.logs.actions.update') || '更新'}</option>
                <option value="delete">{t('admin.logs.actions.delete') || '删除'}</option>
                <option value="login">{t('admin.logs.actions.login') || '登录'}</option>
                <option value="logout">{t('admin.logs.actions.logout') || '登出'}</option>
              </select>

              {/* 资源类型 */}
              <select
                value={filterResourceType}
                onChange={(e) => setFilterResourceType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">{t('admin.logs.filter.allResources') || '所有资源类型'}</option>
                <option value="user">{t('admin.logs.resources.user') || '用户'}</option>
                <option value="activity">{t('admin.logs.resources.activity') || '活动'}</option>
                <option value="category">{t('admin.logs.resources.category') || '分类'}</option>
                <option value="system">{t('admin.logs.resources.system') || '系统'}</option>
              </select>

              {/* 操作按钮 */}
              <div className="flex">
                <button
                  onClick={() => loadLogs(1)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {t('admin.logs.filter.apply') || '应用'}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">{t('admin.logs.loading')}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('admin.logs.noData')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.logs.table.user') || '用户'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.logs.table.action') || '操作'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.logs.table.resource') || '资源类型'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.logs.table.details') || '详情'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.logs.table.time') || '时间'}
                    </th>
                  </tr>
                </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {logs.map((log) => (
                     <tr key={log.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {log.user_email || t('admin.logs.system') || 'System'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           getActionColor(log.action)
                         }`}>
                           {log.action}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {log.type}
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-900">
                         {log.details || '-'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {formatDate(log.created_at)}
                       </td>
                     </tr>
                   ))}
                 </tbody>
            </table>
          </div>
        )}

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示第 {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条记录
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadLogs(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一页
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    第 {pagination.page} 页，共 {pagination.totalPages} 页
                  </span>
                  <button
                    onClick={() => loadLogs(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
      </div>

      {/* 清除确认对话框 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('admin.logs.clearLogs.confirmTitle') || '确认清除日志'}
                </h3>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              {t('admin.logs.clearLogs.confirmMessage') || '此操作将清除30天前的所有活动日志，近期重要记录将被保留。此操作不可撤销，您确定要继续吗？'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('admin.logs.clearLogs.cancelButton') || '取消'}
              </button>
              <button
                onClick={handleClearLogs}
                disabled={isClearing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isClearing ? (t('admin.logs.clearLogs.clearing') || '清除中...') : (t('admin.logs.clearLogs.confirmButton') || '确认清除')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminLogs;