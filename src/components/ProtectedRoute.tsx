import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRequireAuth: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onRequireAuth }) => {
  const { user, loading } = useAuth();
  const [hasShownAuthModal, setHasShownAuthModal] = useState(false);

  useEffect(() => {
    // 如果不在加载状态且用户未登录，且还没有显示过登录弹窗，则触发登录弹窗
    if (!loading && !user && !hasShownAuthModal) {
      setHasShownAuthModal(true);
      onRequireAuth();
    }
  }, [user, loading, onRequireAuth, hasShownAuthModal]);

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果用户已登录，显示受保护的内容
  if (user) {
    return <>{children}</>;
  }

  // 如果用户未登录，显示提示信息
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登录</h2>
        <p className="text-gray-500 mb-6">请先登录以访问此页面</p>
        <button
          onClick={() => {
            setHasShownAuthModal(true);
            onRequireAuth();
          }}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          重新登录
        </button>
      </div>
    </div>
  );
};

export default ProtectedRoute;
