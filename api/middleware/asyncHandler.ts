import { Request, Response, NextFunction } from 'express';

/**
 * 异步错误处理包装器
 * 自动捕获异步路由处理器中的错误并传递给错误处理中间件
 * 
 * @param fn 异步路由处理函数
 * @returns 包装后的路由处理函数
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 执行异步函数并捕获任何Promise rejection
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 异步中间件包装器
 * 专门用于包装中间件函数
 * 
 * @param fn 异步中间件函数
 * @returns 包装后的中间件函数
 */
export const asyncMiddleware = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 批量包装路由对象中的异步处理器
 * 
 * @param routes 路由对象，键为HTTP方法，值为处理函数
 * @returns 包装后的路由对象
 */
export const wrapAsyncRoutes = (routes: Record<string, Function>) => {
  const wrappedRoutes: Record<string, Function> = {};
  
  for (const [method, handler] of Object.entries(routes)) {
    if (typeof handler === 'function') {
      wrappedRoutes[method] = asyncHandler(handler as any);
    } else {
      wrappedRoutes[method] = handler;
    }
  }
  
  return wrappedRoutes;
};

export default asyncHandler;