/**
 * 数据获取器统一导出
 * 保持原有DataFetchers类的接口，内部使用分离后的专门获取器
 */

import { 
  BatchRequest, 
  BatchResponse, 
  HomePageDataResult, 
  PostDetailDataResult, 
  ActivitiesPageDataResult,
  HomePageData,
  PostDetailData,
  ActivitiesPageData
} from '../types';
import { CacheManager } from '../CacheManager';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { FallbackHandler } from '../FallbackHandler';
import { HomePageDataFetcher } from './HomePageDataFetcher';
import { PostDetailDataFetcher } from './PostDetailDataFetcher';
import { ActivitiesDataFetcher } from './ActivitiesDataFetcher';
import { BaseDataFetcher } from './BaseDataFetcher';

export class DataFetchers {
  private homePageDataFetcher: HomePageDataFetcher;
  private postDetailDataFetcher: PostDetailDataFetcher;
  private activitiesDataFetcher: ActivitiesDataFetcher;
  private baseDataFetcher: BaseDataFetcher;

  // 方法引用，在构造函数中初始化
  public getHomePageData: HomePageDataFetcher['getHomePageData'];
  public getHomePageDataLegacy: HomePageDataFetcher['getHomePageDataLegacy'];
  public getPostDetailData: PostDetailDataFetcher['getPostDetailData'];
  public getPostDetailDataLegacy: PostDetailDataFetcher['getPostDetailDataLegacy'];
  public getActivitiesPageData: ActivitiesDataFetcher['getActivitiesPageData'];
  public getActivitiesPageDataLegacy: ActivitiesDataFetcher['getActivitiesPageDataLegacy'];
  public fetchData: BaseDataFetcher['fetchData'];
  public batchFetchData: BaseDataFetcher['batchFetchData'];

  constructor(
    cacheManager: CacheManager,
    performanceMonitor: PerformanceMonitor,
    fallbackHandler: FallbackHandler
  ) {
    this.homePageDataFetcher = new HomePageDataFetcher();
    this.postDetailDataFetcher = new PostDetailDataFetcher();
    this.activitiesDataFetcher = new ActivitiesDataFetcher();
    this.baseDataFetcher = new BaseDataFetcher(cacheManager);

    // 在构造函数中绑定方法
    this.getHomePageData = this.homePageDataFetcher.getHomePageData.bind(this.homePageDataFetcher);
    this.getHomePageDataLegacy = this.homePageDataFetcher.getHomePageDataLegacy.bind(this.homePageDataFetcher);
    this.getPostDetailData = this.postDetailDataFetcher.getPostDetailData.bind(this.postDetailDataFetcher);
    this.getPostDetailDataLegacy = this.postDetailDataFetcher.getPostDetailDataLegacy.bind(this.postDetailDataFetcher);
    this.getActivitiesPageData = this.activitiesDataFetcher.getActivitiesPageData.bind(this.activitiesDataFetcher);
    this.getActivitiesPageDataLegacy = this.activitiesDataFetcher.getActivitiesPageDataLegacy.bind(this.activitiesDataFetcher);
    this.fetchData = this.baseDataFetcher.fetchData.bind(this.baseDataFetcher);
    this.batchFetchData = this.baseDataFetcher.batchFetchData.bind(this.baseDataFetcher);
  }
}

// 导出专门的数据获取器，供其他模块直接使用
export { HomePageDataFetcher } from './HomePageDataFetcher';
export { PostDetailDataFetcher } from './PostDetailDataFetcher';
export { ActivitiesDataFetcher } from './ActivitiesDataFetcher';
export { BaseDataFetcher } from './BaseDataFetcher';
