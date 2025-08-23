/**
 * 批量数据服务的类型定义文件
 * 包含所有接口、类型和枚举定义
 */

// 批量数据获取的请求类型定义
export interface BatchRequest {
  id: string;
  type: 'posts' | 'activities' | 'categories' | 'post_details' | 'comments';
  endpoint: string;
  params?: Record<string, any>;
}

// 批量数据获取的响应类型定义
export interface BatchResponse {
  id?: string;
  type: string;
  data: any;
  error?: string;
  cached?: boolean;
}

// 返回类型接口
export interface HomePageDataResult {
  posts: any[];
  activities: any[];
  errors?: {
    posts?: string;
    activities?: string;
  };
}

export interface PostDetailDataResult {
  post: any;
  comments: any[];
  likesCount: number;
  isLiked: boolean;
  categories: any[];
  errors?: {
    post?: string;
    comments?: string;
    likes?: string;
    categories?: string;
  };
}

export interface ActivitiesPageDataResult {
  activities: any[];
  categories: any[];
  errors?: {
    activities?: string;
    categories?: string;
  };
}

// 缓存配置
export interface CacheConfig {
  ttl: number; // 缓存时间（毫秒）
  maxSize: number; // 最大缓存条目数
}

// 缓存条目
export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// 性能监控数据
export interface PerformanceMetrics {
  requestId: string;
  requestType?: string;
  timestamp?: number;
  operation?: string;
  method?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  cacheHit: boolean;
  batchSize: number;
  success?: boolean;
  error?: string;
  errors?: string[];
}

// 数据类型定义
export interface HomePageData {
  posts: any[];
  activities: any[];
}

export interface PostDetailData {
  post: any;
  comments: any[];
  categories: any[];
  isLiked: boolean;
  likesCount: number;
}

export interface ActivitiesPageData {
  activities: any[];
  categories: any[];
}

// 批量请求选项
export interface BatchRequestOptions {
  useCache?: boolean;
  fallbackToIndividual?: boolean;
  timeout?: number;
}

// 分组请求类型
export interface GroupedRequests {
  [key: string]: BatchRequest[];
}

// 性能统计数据
export interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  recentMetrics: PerformanceMetrics[];
}