import { Request, Response } from 'express';
import { User } from '@supabase/supabase-js';

// 登录尝试信息接口
interface LoginAttemptsInfo {
  totalAttempts: number;
  failedAttempts: number;
  recentFailedAttempts: number;
  lastAttempt?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      clientIP?: string;
      loginAttempts?: LoginAttemptsInfo;
    }
  }
}

// 直接使用Express原生类型
export type CustomRequest = Request;
export type CustomResponse = Response;

// 中间件类型定义
export type AuthMiddleware = (req: Request, res: Response, next: () => void) => void | Promise<void>;
export type AdminMiddleware = (req: Request, res: Response, next: () => void) => void | Promise<void>;