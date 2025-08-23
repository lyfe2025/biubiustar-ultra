import { useNavigate } from 'react-router-dom'
import { headingStyles } from '../../utils/cn'
import { useErrorMessage } from '../../utils/errorMessages'

interface ErrorStateProps {
  error: string | null
  t: (key: string) => string
}

const ErrorState = ({ error, t }: ErrorStateProps) => {
  const navigate = useNavigate()
  const { getErrorMessage } = useErrorMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden flex items-center justify-center">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative text-center bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md mx-4">
        <div className="text-6xl mb-4 animate-bounce">😵</div>
        <h2 className={headingStyles.h2}>{t('posts.detail.errorTitle')}</h2>
        <p className="text-red-600 mb-6">{error || getErrorMessage('posts.notFound')}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {t('posts.detail.back')}
        </button>
      </div>
    </div>
  )
}

export default ErrorState
