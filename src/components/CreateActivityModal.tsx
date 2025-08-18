import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Tag, Image, FileText } from 'lucide-react';
import { ActivityService } from '../lib/activityService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityCreated?: () => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  onActivityCreated
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: 10,
    category: ''
  });

  const categories = [
    '文化交流',
    '技术分享',
    '户外运动',
    '美食聚会',
    '学习交流',
    '娱乐活动',
    '志愿服务',
    '商务网络',
    '艺术创作',
    '其他'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('请先登录');
      return;
    }

    // 表单验证
    if (!formData.title.trim()) {
      toast.error('请输入活动标题');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('请输入活动描述');
      return;
    }
    
    if (!formData.start_date) {
      toast.error('请选择开始时间');
      return;
    }
    
    if (!formData.end_date) {
      toast.error('请选择结束时间');
      return;
    }
    
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('结束时间必须晚于开始时间');
      return;
    }
    
    if (!formData.location.trim()) {
      toast.error('请输入活动地点');
      return;
    }
    
    if (!formData.category) {
      toast.error('请选择活动分类');
      return;
    }
    
    if (formData.max_participants < 1) {
      toast.error('参与人数至少为1人');
      return;
    }

    setIsSubmitting(true);
    try {
      await ActivityService.createActivity({
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location,
        max_participants: formData.max_participants,
        category: formData.category,
        user_id: '' // 后端会自动使用认证用户的ID，这里传空字符串
      });
      
      toast.success('活动创建成功！');
      onActivityCreated?.();
      onClose();
      
      // 重置表单
      setFormData({
        title: '',
        description: '',
        image_url: '',
        start_date: '',
        end_date: '',
        location: '',
        max_participants: 10,
        category: ''
      });
    } catch (error: any) {
      console.error('Error creating activity:', error);
      
      // 根据错误类型提供具体的用户反馈
      let errorMessage = '创建活动失败，请重试';
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.status === 401) {
        errorMessage = '登录已过期，请重新登录';
        // 可以在这里添加跳转到登录页面的逻辑
      } else if (error?.response?.status === 400) {
        errorMessage = '输入信息有误，请检查后重试';
      } else if (error?.response?.status === 500) {
        errorMessage = '服务器错误，请稍后重试';
      } else if (error?.message) {
        errorMessage = `创建失败: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">创建活动</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 活动标题 */}
          <div>
            <label className="block text-white font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              活动标题 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="输入活动标题"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
              required
            />
          </div>

          {/* 活动描述 */}
          <div>
            <label className="block text-white font-medium mb-2">
              活动描述 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="详细描述活动内容、目的和注意事项"
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors resize-none"
              required
            />
          </div>

          {/* 活动图片 */}
          <div>
            <label className="block text-white font-medium mb-2">
              <Image className="w-4 h-4 inline mr-2" />
              活动图片链接
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              placeholder="输入图片链接（可选）"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          {/* 时间设置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                开始时间 *
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                结束时间 *
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                required
              />
            </div>
          </div>

          {/* 地点和人数 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                活动地点 *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="输入活动地点"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                最大参与人数 *
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleInputChange}
                min="1"
                max="1000"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                required
              />
            </div>
          </div>

          {/* 活动分类 */}
          <div>
            <label className="block text-white font-medium mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              活动分类 *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
              required
            >
              <option value="" className="bg-gray-800">选择活动分类</option>
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '创建中...' : '创建活动'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};