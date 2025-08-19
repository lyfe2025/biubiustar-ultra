import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../../contexts/language';
import { ContentCategory, NewCategoryData } from './types';
import { toast } from 'sonner';

interface EditContentCategoryFormProps {
  category: ContentCategory;
  onSubmit: (data: NewCategoryData) => Promise<void>;
  onCancel: () => void;
}

const EditContentCategoryForm: React.FC<EditContentCategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewCategoryData>({
    name: '',
    description: '',
    name_zh: '',
    name_zh_tw: '',
    name_en: '',
    name_vi: '',
    description_zh: '',
    description_zh_tw: '',
    description_en: '',
    description_vi: '',
    color: '#3B82F6',
    icon: '',
    sort_order: 0,
  });

  // 初始化表单数据
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        name_zh: category.name_zh || '',
        name_zh_tw: category.name_zh_tw || '',
        name_en: category.name_en || '',
        name_vi: category.name_vi || '',
        description_zh: category.description_zh || '',
        description_zh_tw: category.description_zh_tw || '',
        description_en: category.description_en || '',
        description_vi: category.description_vi || '',
        color: category.color || '#3B82F6',
        icon: category.icon || '',
        sort_order: category.sort_order || 0,
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证所有必填的多语言名称字段
    const requiredFields = [
      { field: 'name_zh', label: '中文' },
      { field: 'name_zh_tw', label: '繁體中文' },
      { field: 'name_en', label: 'English' },
      { field: 'name_vi', label: 'Tiếng Việt' }
    ];
    
    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof NewCategoryData] || 
          String(formData[field as keyof NewCategoryData]).trim() === '') {
        toast.error(`${label}分类名称为必填项`);
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onCancel(); // 关闭模态框
    } catch (error) {
      console.error('更新内容分类失败:', error);
      // 显示具体的错误信息
      if (error instanceof Error) {
        toast.error(`更新分类失败: ${error.message}`);
      } else {
        toast.error('更新分类失败，请检查输入信息');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewCategoryData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 多语言名称字段 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.name')} (中文) *
          </label>
          <input
            type="text"
            value={formData.name_zh}
            onChange={(e) => handleInputChange('name_zh', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.name')} (繁體中文) *
          </label>
          <input
            type="text"
            value={formData.name_zh_tw}
            onChange={(e) => handleInputChange('name_zh_tw', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.name')} (English) *
          </label>
          <input
            type="text"
            value={formData.name_en}
            onChange={(e) => handleInputChange('name_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.name')} (Tiếng Việt) *
          </label>
          <input
            type="text"
            value={formData.name_vi}
            onChange={(e) => handleInputChange('name_vi', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 多语言描述字段 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.description')} (中文)
          </label>
          <textarea
            value={formData.description_zh}
            onChange={(e) => handleInputChange('description_zh', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.description')} (繁體中文)
          </label>
          <textarea
            value={formData.description_zh_tw}
            onChange={(e) => handleInputChange('description_zh_tw', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.description')} (English)
          </label>
          <textarea
            value={formData.description_en}
            onChange={(e) => handleInputChange('description_en', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.description')} (Tiếng Việt)
          </label>
          <textarea
            value={formData.description_vi}
            onChange={(e) => handleInputChange('description_vi', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 其他字段 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.color')}
          </label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.icon')}
          </label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => handleInputChange('icon', e.target.value)}
            placeholder="例如: folder, tag, star"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.categories.sortOrder')}
          </label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 按钮 */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          disabled={loading}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? t('common.updating') : t('common.update')}
        </button>
      </div>
    </form>
  );
};

export default EditContentCategoryForm;