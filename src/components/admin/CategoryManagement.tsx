import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/language';
import { adminService } from '../../services/AdminService';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface CategoryManagementProps {
  categories: Category[];
  onCategoriesUpdated: () => void;
  onCategoryChange?: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onCategoriesUpdated, onCategoryChange }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: ''
  });
  const [editCategoryData, setEditCategoryData] = useState({
    name: '',
    description: ''
  });





  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast.error(t('admin.activities.categoryNameRequired'));
      return;
    }

    try {
      await adminService.createCategory(newCategoryData);
      toast.success(t('admin.activities.categoryCreated'));
      setShowCreateModal(false);
      setNewCategoryData({ name: '', description: '' });
      onCategoriesUpdated();
      onCategoryChange?.();
    } catch (error: any) {
      console.error('创建分类失败:', error);
      if (error.name === 'AuthenticationError') {
        toast.error(t('common.authenticationFailed'));
      } else {
        const errorMessage = error.message || t('admin.activities.createCategoryFailed');
        toast.error(errorMessage);
      }
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !editCategoryData.name.trim()) {
      toast.error(t('admin.activities.categoryNameRequired'));
      return;
    }

    try {
      await adminService.updateCategory(selectedCategory.id, editCategoryData);
      toast.success(t('admin.activities.categoryUpdated'));
      setShowEditModal(false);
      setSelectedCategory(null);
      setEditCategoryData({ name: '', description: '' });
      onCategoriesUpdated();
      onCategoryChange?.();
    } catch (error: any) {
      console.error('更新分类失败:', error);
      if (error.name === 'AuthenticationError') {
        toast.error(t('common.authenticationFailed'));
      } else {
        const errorMessage = error.message || t('admin.activities.updateCategoryFailed');
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
      if (error.name === 'AuthenticationError') {
        toast.error(t('common.authenticationFailed'));
      } else {
        const errorMessage = error.message || t('admin.activities.deleteCategoryFailed');
        toast.error(errorMessage);
      }
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryData({
      name: category.name,
      description: category.description || ''
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 分类列表 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                  {t('admin.activities.actions')}
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
                        className="text-blue-600 hover:text-blue-900 p-1"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.activities.categoryName')} *
                </label>
                <input
                  type="text"
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('admin.activities.enterCategoryName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.activities.description')}
                </label>
                <textarea
                  value={newCategoryData.description}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={t('admin.activities.enterDescription')}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCategoryData({ name: '', description: '' });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.activities.categoryName')} *
                </label>
                <input
                  type="text"
                  value={editCategoryData.name}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('admin.activities.enterCategoryName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.activities.description')}
                </label>
                <textarea
                  value={editCategoryData.description}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={t('admin.activities.enterDescription')}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                  setEditCategoryData({ name: '', description: '' });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleEditCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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