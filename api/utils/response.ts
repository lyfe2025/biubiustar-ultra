/**
 * Response formatting utility functions
 * Extracted from app.ts for better code organization
 */
import { Response } from 'express';

// Standard API response format
export const sendResponse = (res: Response, success: boolean, data?: unknown, message?: string, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

// Error response helpers
export const sendError = (res: Response, message: string, statusCode = 500, data?: unknown) => {
  sendResponse(res, false, data, message, statusCode);
};

export const sendSuccess = (res: Response, data?: unknown, message?: string, statusCode = 200) => {
  sendResponse(res, true, data, message, statusCode);
};

// Common error responses
export const sendValidationError = (res: Response, message: string) => {
  sendError(res, message, 400);
};

export const sendUnauthorizedError = (res: Response, message = '未授权访问') => {
  sendError(res, message, 401);
};

export const sendForbiddenError = (res: Response, message = '禁止访问') => {
  sendError(res, message, 403);
};

export const sendNotFoundError = (res: Response, message = '资源未找到') => {
  sendError(res, message, 404);
};

export const sendInternalError = (res: Response, message = '服务器内部错误') => {
  sendError(res, message, 500);
};

// Service unavailable response (for maintenance)
export const sendServiceUnavailable = (res: Response, message = 'Service temporarily unavailable - under maintenance') => {
  res.status(503).json({ error: message });
};