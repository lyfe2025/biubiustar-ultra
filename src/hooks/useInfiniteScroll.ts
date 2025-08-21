import { useState, useEffect, useCallback, useRef } from 'react';

// Hook配置选项
interface UseInfiniteScrollOptions {
  threshold?: number; // 触发加载的阈值，默认0.1
  rootMargin?: string; // 根边距，默认'0px'
  enabled?: boolean; // 是否启用无限滚动，默认true
  onLoadMore?: () => Promise<void>; // 加载更多数据的回调
  onError?: (error: string) => void; // 错误处理回调
}

// Hook返回值类型
interface UseInfiniteScrollReturn {
  targetRef: React.RefObject<HTMLDivElement>; // 目标元素引用
  isIntersecting: boolean; // 是否正在相交
  loadMore: () => Promise<void>; // 手动触发加载更多
}

/**
 * 无限滚动Hook
 * 使用Intersection Observer API实现滚动检测
 * 支持自动加载和手动加载模式
 */
export function useInfiniteScroll(
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    enabled = true,
    onLoadMore,
    onError
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef(false);
  const onLoadMoreRef = useRef(onLoadMore);
  const onErrorRef = useRef(onError);

  // 更新回调引用
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    onErrorRef.current = onError;
  }, [onLoadMore, onError]);

  /**
   * 手动触发加载更多
   */
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !onLoadMoreRef.current) {
      return;
    }

    isLoadingRef.current = true;
    try {
      await onLoadMoreRef.current();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('加载更多数据失败:', errorMessage);
      onErrorRef.current?.(errorMessage);
    } finally {
      isLoadingRef.current = false;
    }
  }, []); // 移除依赖，使用ref引用

  /**
   * 创建Intersection Observer
   */
  const createObserver = useCallback(() => {
    if (!targetRef.current || !enabled) {
      return;
    }

    // 清理现有的observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);

        // 当元素进入视口且启用自动加载时，触发加载更多
        if (entry.isIntersecting && enabled && !isLoadingRef.current) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(targetRef.current);
  }, [enabled, threshold, rootMargin, loadMore]); // loadMore现在是稳定的引用

  /**
   * 初始化和清理Observer
   */
  useEffect(() => {
    createObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [createObserver]);

  /**
   * 当目标元素变化时重新创建Observer
   */
  useEffect(() => {
    if (targetRef.current) {
      createObserver();
    }
  }, [createObserver]);

  return {
    targetRef,
    isIntersecting,
    loadMore
  };
}

/**
 * 分页数据管理Hook
 * 配合useInfiniteScroll使用，管理分页数据状态
 */
interface UsePaginatedDataOptions<T> {
  initialData?: T[];
  pageSize?: number;
  onFetchPage?: (page: number, limit: number) => Promise<T[]>;
  onError?: (error: string) => void;
}

interface UsePaginatedDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  loadNextPage: () => Promise<void>;
  reset: () => void;
  setData: (data: T[]) => void;
}

export function usePaginatedData<T = any>(
  options: UsePaginatedDataOptions<T> = {}
): UsePaginatedDataReturn<T> {
  const {
    initialData = [],
    pageSize = 20,
    onFetchPage,
    onError
  } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true); // 标记是否为重置后的第一次加载
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false); // 用于跟踪loading状态，避免依赖循环

  /**
   * 加载下一页数据
   */
  const loadNextPage = useCallback(async () => {
    // 使用ref来获取最新的loading状态，避免依赖数组包含loading
    if (loadingRef.current || !hasMore || !onFetchPage) {
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // 获取当前页码进行加载
      const pageToLoad = currentPage;
      
      const newData = await onFetchPage(pageToLoad, pageSize);
      
      // 检查请求是否被取消
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        // 如果是重置后的第一次加载，替换数据；否则追加数据
        if (isFirstLoad) {
          setData(newData);
          setIsFirstLoad(false);
        } else {
          setData(prevData => [...prevData, ...newData]);
        }
        
        setCurrentPage(prev => prev + 1);
        
        // 如果返回的数据少于页面大小，说明没有更多数据了
        if (newData.length < pageSize) {
          setHasMore(false);
        }
      }
    } catch (err) {
      // 忽略取消的请求错误
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, onFetchPage, pageSize, onError, currentPage, isFirstLoad]); // 移除loading依赖

  /**
   * 重置数据状态
   */
  const reset = useCallback(() => {
    // 取消正在进行的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setData(initialData);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    loadingRef.current = false;
    setLoading(false);
    setInitialized(false);
    setIsFirstLoad(true); // 重置后标记为第一次加载
  }, [initialData]);

  // 初始化时自动加载第一页数据
  useEffect(() => {
    if (!initialized && onFetchPage) {
      setInitialized(true);
      
      // 直接在这里执行初始化加载逻辑，避免调用loadNextPage
      const initializeData = async () => {
        // 检查是否已经在加载中，避免重复执行
        if (loadingRef.current) return;
        
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        try {
          const newData = await onFetchPage(1, pageSize);
          
          if (newData.length === 0) {
            setHasMore(false);
          } else {
            setData(newData);
            setCurrentPage(2); // 下次加载第2页
            setIsFirstLoad(false);
            
            if (newData.length < pageSize) {
              setHasMore(false);
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          loadingRef.current = false;
          setLoading(false);
        }
      };
      
      initializeData();
    }
  }, [initialized, onFetchPage, pageSize, onError]); // 移除loading依赖，避免无限循环

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    currentPage,
    loadNextPage,
    reset,
    setData
  };
}