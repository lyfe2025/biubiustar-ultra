import { Request, Response } from 'express';
import { CacheInstanceType, CACHE_INSTANCE_TYPES } from '../../config/cache';

/**
 * 错误处理中间件
 */
export const handleError = (error: any, res: Response) => {
  console.error('Cache Management API Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message,
      details: error.details || []
    });
  }
  
  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: error.message
    });
  }
  
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: error.message || 'An unexpected error occurred'
  });
};

/**
 * 参数验证中间件
 */
export const validateInstanceType = (req: Request, res: Response, next: any) => {
  const { instanceType } = req.params;
  
  if (instanceType && !CACHE_INSTANCE_TYPES.includes(instanceType as CacheInstanceType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid instance type',
      message: `Instance type must be one of: ${CACHE_INSTANCE_TYPES.join(', ')}`
    });
  }
  
  next();
};
