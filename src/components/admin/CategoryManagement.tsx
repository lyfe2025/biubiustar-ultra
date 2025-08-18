import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/language';
import { adminService } from '../../services/AdminService';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description?: string;
  name_zh: string;
  name_zh_tw: string;
  name_en: string;
  name_vi: string;
  description_zh?: string;
  description_zh_tw?: string;
  description_en?: string;
  description_vi?: string;
  created_at: string;
}

interface CategoryManagementProps {
  categories: Category[];
  onCategoriesUpdated: () => void;
  onCategoryChange?: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onCategoriesUpdated, onCategoryChange }) => {
  const { t } = useLanguage();
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    name_zh: '',
    name_zh_tw: '',
    name_en: '',
    name_vi: '',
    description_zh: '',
    description_zh_tw: '',
    description_en: '',
    description_vi: ''
  });
  const [editCategoryData, setEditCategoryData] = useState({
    name: '',
    description: '',
    name_zh: '',
    name_zh_tw: '',
    name_en: '',
    name_vi: '',
    description_zh: '',
    description_zh_tw: '',
    description_en: '',
    description_vi: ''
  });





  const handleCreateCategory = async () => {
    // 验证所有语言的名称都已填写
    if (!newCategoryData.name_zh.trim() || !newCategoryData.name_zh_tw.trim() || 
        !newCategoryData.name_en.trim() || !newCategoryData.name_vi.trim()) {
      toast.error('请填写所有语言的分类名称');
      return;
    }

    try {
      // 准备提交数据，包含多语言字段
      const categoryData = {
        ...newCategoryData,
        name: newCategoryData.name_zh, // 使用中文作为默认名称
        description: newCategoryData.description_zh || '' // 使用中文作为默认描述
      };
      
      await adminService.createCategory(categoryData);
      toast.success(t('admin.activities.categoryCreated'));
      setShowCreateModal(false);
      setNewCategoryData({ 
        name: '', description: '',
        name_zh: '', name_zh_tw: '', name_en: '', name_vi: '',
        description_zh: '', description_zh_tw: '', description_en: '', description_vi: ''
      });
      onCategoriesUpdated();
      onCategoryChange?.();
    } catch (error: any) {
      console.error('创建分类失败:', error);
      if (error?.name === 'AuthenticationError') {
        toast.error(t('common.authenticationFailed'));
      } else {
        const errorMessage = error?.message || t('admin.activities.createCategoryFailed');
        toast.error(errorMessage);
      }
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;
    
    // 验证所有语言的名称都已填写
    if (!editCategoryData.name_zh.trim() || !editCategoryData.name_zh_tw.trim() || 
        !editCategoryData.name_en.trim() || !editCategoryData.name_vi.trim()) {
      toast.error('请填写所有语言的分类名称');
      return;
    }

    try {
      // 准备提交数据，包含多语言字段
      const categoryData = {
        ...editCategoryData,
        name: editCategoryData.name_zh, // 使用中文作为默认名称
        description: editCategoryData.description_zh || '' // 使用中文作为默认描述
      };
      
      await adminService.updateCategory(selectedCategory.id, categoryData);
      toast.success(t('admin.activities.categoryUpdated'));
      setShowEditModal(false);
      setSelectedCategory(null);
      setEditCategoryData({ 
        name: '', description: '',
        name_zh: '', name_zh_tw: '', name_en: '', name_vi: '',
        description_zh: '', description_zh_tw: '', description_en: '', description_vi: ''
      });
      onCategoriesUpdated();
      onCategoryChange?.();
    } catch (error: any) {
      console.error('更新分类失败:', error);
      if (error?.name === 'AuthenticationError') {
        toast.error(t('common.authenticationFailed'));
      } else {
        const errorMessage = error?.message || t('admin.activities.updateCategoryFailed');
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await adminService.deleteCategory(selectedCategory.id);
      toast.success(t('admin.activities.categoryDeleted'));
      setShowDeleteModal(false);
      setSelectedCategory(null);
      onCategoriesUpdated();
      onCategoryChange?.();
    } catch (error: any) {
      console.error('删除分类失败:', error);
      if (error?.name === 'AuthenticationError') {
        toast.error(t('common.authenticationFailed'));
      } else {
        const errorMessage = error?.message || t('admin.activities.deleteCategoryFailed');
        toast.error(errorMessage);
      }
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryData({
      name: category.name,
      description: category.description || '',
      name_zh: category.name_zh || category.name,
      name_zh_tw: category.name_zh_tw || category.name,
      name_en: category.name_en || category.name,
      name_vi: category.name_vi || category.name,
      description_zh: category.description_zh || category.description || '',
      description_zh_tw: category.description_zh_tw || category.description || '',
      description_en: category.description_en || category.description || '',
      description_vi: category.description_vi || category.description || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('admin.activities.createCategory')}
        </button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('admin.activities.searchCategories')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 分类列表 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.categoryName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.createdAt')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {category.description || t('admin.activities.noDescription')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-purple-600 hover:text-purple-900 p-1"
                        title={t('admin.activities.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(category)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title={t('admin.activities.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('admin.activities.noCategories')}</p>
            </div>
          )}
        </div>
      )}

      {/* 创建分类弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t('admin.activities.createCategory')}</h3>
            
            <div className="space-y-4">
              {/* 中文 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类名称 (中文) *
                </label>
                <input
                  type="text"
                  value={newCategoryData.name_zh}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name_zh: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入中文分类名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类描述 (中文)
                </label>
                <textarea
                  value={newCategoryData.description_zh}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, description_zh: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入中文分类描述"
                  rows={2}
                />
              </div>
              
              {/* 繁体中文 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分類名稱 (繁體中文) *
                </label>
                <input
                  type="text"
                  value={newCategoryData.name_zh_tw}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name_zh_tw: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入繁體中文分類名稱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分類描述 (繁體中文)
                </label>
                <textarea
                  value={newCategoryData.description_zh_tw}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, description_zh_tw: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入繁體中文分類描述"
                  rows={2}
                />
              </div>
              
              {/* 英文 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  value={newCategoryData.name_en}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter English category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Description (English)
                </label>
                <textarea
                  value={newCategoryData.description_en}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, description_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter English category description"
                  rows={2}
                />
              </div>
              
              {/* 越南语 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục (Tiếng Việt) *
                </label>
                <input
                  type="text"
                  value={newCategoryData.name_vi}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name_vi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên danh mục tiếng Việt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả danh mục (Tiếng Việt)
                </label>
                <textarea
                  value={newCategoryData.description_vi}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, description_vi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mô tả danh mục tiếng Việt"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCategoryData({ 
                  name: '', 
                  description: '', 
                  name_zh: '', 
                  name_zh_tw: '', 
                  name_en: '', 
                  name_vi: '', 
                  description_zh: '', 
                  description_zh_tw: '', 
                  description_en: '', 
                  description_vi: '' 
                });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryData.name_zh.trim() || !newCategoryData.name_zh_tw.trim() || !newCategoryData.name_en.trim() || !newCategoryData.name_vi.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑分类弹窗 */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t('admin.activities.editCategory')}</h3>
            
            <div className="space-y-4">
              {/* 中文 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类名称 (中文) *
                </label>
                <input
                  type="text"
                  value={editCategoryData.name_zh}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, name_zh: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入中文分类名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类描述 (中文)
                </label>
                <textarea
                  value={editCategoryData.description_zh}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, description_zh: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入中文分类描述"
                  rows={2}
                />
              </div>
              
              {/* 繁体中文 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分類名稱 (繁體中文) *
                </label>
                <input
                  type="text"
                  value={editCategoryData.name_zh_tw}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, name_zh_tw: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入繁體中文分類名稱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分類描述 (繁體中文)
                </label>
                <textarea
                  value={editCategoryData.description_zh_tw}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, description_zh_tw: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入繁體中文分類描述"
                  rows={2}
                />
              </div>
              
              {/* 英文 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  value={editCategoryData.name_en}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, name_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter English category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Description (English)
                </label>
                <textarea
                  value={editCategoryData.description_en}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, description_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter English category description"
                  rows={2}
                />
              </div>
              
              {/* 越南语 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục (Tiếng Việt) *
                </label>
                <input
                  type="text"
                  value={editCategoryData.name_vi}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, name_vi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên danh mục tiếng Việt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả danh mục (Tiếng Việt)
                </label>
                <textarea
                  value={editCategoryData.description_vi}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, description_vi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mô tả danh mục tiếng Việt"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                  setEditCategoryData({ 
                    name: '', 
                    description: '', 
                    name_zh: '', 
                    name_zh_tw: '', 
                    name_en: '', 
                    name_vi: '', 
                    description_zh: '', 
                    description_zh_tw: '', 
                    description_en: '', 
                    description_vi: '' 
                  });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleEditCategory}
                disabled={!editCategoryData.name_zh.trim() || !editCategoryData.name_zh_tw.trim() || !editCategoryData.name_en.trim() || !editCategoryData.name_vi.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t('admin.activities.deleteCategory')}</h3>
            <p className="text-gray-600 mb-6">
              {t('admin.activities.deleteCategoryConfirm')}
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;