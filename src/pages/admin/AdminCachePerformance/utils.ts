export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`
}

export const formatDurationFromMs = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60 * 1000) return `${Math.round(ms / 1000)}s`
  if (ms < 60 * 60 * 1000) return `${Math.round(ms / (60 * 1000))}min`
  return `${Math.round(ms / (60 * 60 * 1000))}h`
}

export const getHealthStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'text-green-600 bg-green-50'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50'
    case 'error':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}
