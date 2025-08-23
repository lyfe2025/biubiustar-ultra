interface LoadingStateProps {
  t: (key: string) => string
}

const LoadingState = ({ t }: LoadingStateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden flex items-center justify-center">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative flex flex-col justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-6 text-lg text-gray-600 font-medium">{t('posts.detail.loading')}</p>
      </div>
    </div>
  )
}

export default LoadingState
