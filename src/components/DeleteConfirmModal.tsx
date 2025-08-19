import React from 'react'
import { Trash2, X } from 'lucide-react'
import { useLanguage } from '../contexts/language'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName?: string
  itemIcon?: React.ReactNode
  loading?: boolean
  confirmText?: string
  cancelText?: string
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemIcon,
  loading = false,
  confirmText,
  cancelText
}) => {
  const { t } = useLanguage()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {itemName && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                {itemIcon || <Trash2 className="w-5 h-5 text-red-600" />}
              </div>
              <div>
                <p className="text-gray-900 font-medium">删除确认</p>
                <p className="text-sm text-gray-500">此操作无法撤销</p>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          
          {itemName && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                {itemIcon || <Trash2 className="w-4 h-4 text-red-600" />}
                <div>
                  <p className="text-sm font-medium text-gray-900">{itemName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {cancelText || t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>删除中...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText || t('common.delete')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
