export type TabType = 'overview' | 'inspector' | 'hotkeys' | 'benchmark' | 'health'
// 已移除 'config' 类型选项

export interface InspectorData {
  stats?: {
    size: number
    maxSize: number
    hitRate: number
    memoryUsage: number
  }
  entries?: Array<{
    key: string
    data: any
    accessCount: number
    timestamp: string
    lastAccess: string
  }>
}

export interface HotKeysData {
  hotKeys?: Array<{
    key: string
    accessCount: number
    lastAccess: string
  }>
}

export interface BenchmarkData {
  testConfig?: {
    cacheType: string
    testSize: number
    iterations: number
    dataSize: string
  }
  averages?: {
    avgWriteTime: number
    avgReadTime: number
    avgOpsPerSecond: number
    avgHitRate: number
  }
  results?: Array<{
    iteration: number
    writeTime: number
    readTime: number
    deleteTime: number
    totalTime: number
    opsPerSecond: number
    hitRate: number
  }>
}
