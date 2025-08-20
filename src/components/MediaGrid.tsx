import React, { useState } from 'react'
import { Play, X, ZoomIn } from 'lucide-react'
import { MediaFile } from '../types'
import { cn } from '../lib/utils'

interface MediaGridProps {
  mediaFiles: MediaFile[]
  className?: string
  itemClassName?: string
  showPreview?: boolean
  maxItems?: number
}

interface MediaPreviewModalProps {
  mediaFile: MediaFile
  isOpen: boolean
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  showNavigation?: boolean
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  mediaFile,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  showNavigation = false
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* 导航按钮 */}
        {showNavigation && onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <span className="text-lg sm:text-xl">←</span>
          </button>
        )}
        {showNavigation && onNext && (
          <button
            onClick={onNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <span className="text-lg sm:text-xl">→</span>
          </button>
        )}

        {/* 媒体内容 */}
        <div className="w-full h-full flex items-center justify-center">
          {mediaFile.file_type === 'image' ? (
            <img
              src={mediaFile.file_url}
              alt="预览"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={mediaFile.file_url}
              controls
              autoPlay
              className="max-w-full max-h-full"
              poster={mediaFile.thumbnail_url || undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const MediaGrid: React.FC<MediaGridProps> = ({
  mediaFiles,
  className,
  itemClassName,
  showPreview = true,
  maxItems = 9
}) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  
  if (!mediaFiles || mediaFiles.length === 0) {
    return null
  }

  // 限制显示的媒体文件数量
  const displayFiles = mediaFiles.slice(0, maxItems)
  const hasMore = mediaFiles.length > maxItems

  // 根据文件数量确定响应式网格布局
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
    if (count <= 4) return 'grid-cols-2 sm:grid-cols-2'
    if (count <= 6) return 'grid-cols-2 sm:grid-cols-3'
    return 'grid-cols-2 sm:grid-cols-3'
  }

  // 根据文件数量确定响应式高度
  const getHeightClass = (count: number) => {
    if (count === 1) return 'aspect-video max-h-80'
    if (count === 2) return 'aspect-square'
    if (count <= 4) return 'aspect-square'
    return 'aspect-square'
  }

  const handleMediaClick = (index: number) => {
    if (showPreview) {
      setPreviewIndex(index)
    }
  }

  const handlePrevious = () => {
    if (previewIndex !== null && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1)
    }
  }

  const handleNext = () => {
    if (previewIndex !== null && previewIndex < displayFiles.length - 1) {
      setPreviewIndex(previewIndex + 1)
    }
  }

  return (
    <>      <div className={cn(
        'grid gap-1 sm:gap-2 rounded-lg overflow-hidden',
        getGridClass(displayFiles.length),
        className
      )}>
        {displayFiles.map((mediaFile, index) => (
          <div
            key={mediaFile.id || index}
            className={cn(
              'relative overflow-hidden bg-gray-100 cursor-pointer group rounded-md',
              getHeightClass(displayFiles.length),
              showPreview && 'hover:opacity-90 transition-opacity',
              itemClassName
            )}
            onClick={() => handleMediaClick(index)}
          >
            {mediaFile.file_type === 'image' ? (
              <>
                <img
                  src={mediaFile.file_url}
                  alt={`媒体文件 ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {showPreview && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-full h-full relative">
                  {mediaFile.thumbnail_url ? (
                    <img
                      src={mediaFile.thumbnail_url}
                      alt={`视频缩略图 ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={mediaFile.file_url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  )}
                  
                  {/* 播放按钮覆盖层 */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-black/60 rounded-full p-3 group-hover:bg-black/80 transition-colors">
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 显示更多指示器 */}
            {index === displayFiles.length - 1 && hasMore && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
                <div className="text-white text-sm sm:text-lg font-semibold">
                  +{mediaFiles.length - maxItems}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 预览模态框 */}
      {showPreview && previewIndex !== null && (
        <MediaPreviewModal
          mediaFile={displayFiles[previewIndex]}
          isOpen={true}
          onClose={() => setPreviewIndex(null)}
          onPrevious={previewIndex > 0 ? handlePrevious : undefined}
          onNext={previewIndex < displayFiles.length - 1 ? handleNext : undefined}
          showNavigation={displayFiles.length > 1}
        />
      )}
    </>
  )
}

export default MediaGrid
export { MediaPreviewModal }
export type { MediaGridProps, MediaPreviewModalProps }