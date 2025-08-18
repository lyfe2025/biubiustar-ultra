import { Request, Response } from 'express';
import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      clientIP?: string;
      loginAttempts?: number;
    }
  }
}

// 直接使用Express原生类型
export type CustomRequest = Request;
export type CustomResponse = Response;

// 中间件类型定义
export type AuthMiddleware = (req: Request, res: Response, next: () => void) => void | Promise<void>;
export type AdminMiddleware = (req: Request, res: Response, next: () => void) => void | Promise<void>;