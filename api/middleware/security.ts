import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

// 安全配置常量
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 3, // 最大登录尝试次数
  LOCKOUT_DURATION: 30 * 60 * 1000, // 锁定时长：30分钟（毫秒）
  ATTEMPT_WINDOW: 15 * 60 * 1000, // 尝试窗口：15分钟内的尝试次数
};

// 获取客户端真实IP地址
export function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return remoteAddress || 'unknown';
}

// 记录登录尝试
export async function logLoginAttempt(
  ipAddress: string,
  email: string | null,
  success: boolean,
  userAgent: string | null = null,
  failureReason: string | null = null
): Promise<void> {
  try {
    await supabaseAdmin
      .from('login_attempts')
      .insert({
        ip_address: ipAddress,
        email,
        success,
        user_agent: userAgent,
        failure_reason: failureReason,
      });
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

// 记录安全日志
export async function logSecurityEvent(
  eventType: string,
  ipAddress: string | null = null,
  userId: string | null = null,
  email: string | null = null,
  details: Record<string, unknown> = {},
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
): Promise<void> {
  try {
    await supabaseAdmin
      .from('security_logs')
      .insert({
        event_type: eventType,
        ip_address: ipAddress,
        user_id: userId,
        email,
        details,
        severity,
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// 记录活动日志到activity_logs表
export async function logActivityEvent(
  type: string,
  action: string,
  details: Record<string, unknown> = {},
  userId: string | null = null,
  userEmail: string | null = null,
  ipAddress: string | null = null,
  userAgent: string | null = null
): Promise<void> {
  try {
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        type,
        action,
        details: typeof details === 'object' ? details : { message: details },
        user_id: userId,
        user_email: userEmail,
        ip_address: ipAddress,
        user_agent: userAgent,
      });
  } catch (error) {
    console.error('Failed to log activity event:', error);
  }
}

// 检查IP是否在黑名单中
export async function checkIPBlacklist(ipAddress: string): Promise<{
  isBlocked: boolean;
  reason?: string;
  blockedUntil?: string;
  isPermanent?: boolean;
}> {
  try {
    const { data: blacklistEntry } = await supabaseAdmin
      .from('ip_blacklist')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();

    if (!blacklistEntry) {
      return { isBlocked: false };
    }

    // 检查是否为永久封禁
    if (blacklistEntry.is_permanent) {
      return {
        isBlocked: true,
        reason: blacklistEntry.reason,
        isPermanent: true,
      };
    }

    // 检查临时封禁是否过期
    if (blacklistEntry.blocked_until) {
      const blockedUntil = new Date(blacklistEntry.blocked_until);
      const now = new Date();
      
      if (now > blockedUntil) {
        // 封禁已过期，自动解锁
        await supabaseAdmin
          .from('ip_blacklist')
          .delete()
          .eq('ip_address', ipAddress);
        
        await logSecurityEvent(
          'ip_auto_unblocked',
          ipAddress,
          null,
          null,
          { reason: 'Lockout period expired' },
          'info'
        );
        
        await logActivityEvent(
          'ip_security',
          'ip_auto_unblocked',
          { reason: 'Lockout period expired' },
          null,
          null,
          ipAddress,
          null
        );
        
        return { isBlocked: false };
      }
      
      return {
        isBlocked: true,
        reason: blacklistEntry.reason,
        blockedUntil: blacklistEntry.blocked_until,
      };
    }

    return {
      isBlocked: true,
      reason: blacklistEntry.reason,
    };
  } catch (error) {
    console.error('Failed to check IP blacklist:', error);
    return { isBlocked: false };
  }
}

// 获取IP的登录尝试次数
export async function getLoginAttempts(ipAddress: string): Promise<{
  totalAttempts: number;
  failedAttempts: number;
  recentFailedAttempts: number;
  lastAttempt?: string;
}> {
  try {
    const windowStart = new Date(Date.now() - SECURITY_CONFIG.ATTEMPT_WINDOW);
    
    // 获取时间窗口内的所有尝试
    const { data: attempts } = await supabaseAdmin
      .from('login_attempts')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('attempt_time', windowStart.toISOString())
      .order('attempt_time', { ascending: false });

    if (!attempts || attempts.length === 0) {
      return {
        totalAttempts: 0,
        failedAttempts: 0,
        recentFailedAttempts: 0,
      };
    }

    const totalAttempts = attempts.length;
    const failedAttempts = attempts.filter(attempt => !attempt.success).length;
    const recentFailedAttempts = failedAttempts;
    const lastAttempt = attempts[0]?.attempt_time;

    return {
      totalAttempts,
      failedAttempts,
      recentFailedAttempts,
      lastAttempt,
    };
  } catch (error) {
    console.error('Failed to get login attempts:', error);
    return {
      totalAttempts: 0,
      failedAttempts: 0,
      recentFailedAttempts: 0,
    };
  }
}

// 将IP添加到黑名单
export async function addToBlacklist(
  ipAddress: string,
  reason: string = 'Too many failed login attempts',
  isPermanent: boolean = false,
  blockedBy: string | null = null
): Promise<void> {
  try {
    const blockedUntil = isPermanent 
      ? null 
      : new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION).toISOString();

    // 获取失败尝试次数
    const { failedAttempts } = await getLoginAttempts(ipAddress);

    await supabaseAdmin
      .from('ip_blacklist')
      .upsert({
        ip_address: ipAddress,
        reason,
        blocked_until: blockedUntil,
        failed_attempts_count: failedAttempts,
        is_permanent: isPermanent,
        blocked_by: blockedBy,
      });

    await logSecurityEvent(
      isPermanent ? 'ip_permanently_blocked' : 'ip_blocked',
      ipAddress,
      null,
      null,
      { 
        reason, 
        failed_attempts: failedAttempts,
        blocked_until: blockedUntil,
        blocked_by: blockedBy 
      },
      'warning'
    );
    
    await logActivityEvent(
      'ip_security',
      isPermanent ? 'ip_permanently_blocked' : 'ip_blocked',
      { 
        reason, 
        failed_attempts: failedAttempts,
        blocked_until: blockedUntil,
        blocked_by: blockedBy 
      },
      null,
      null,
      ipAddress,
      null
    );
  } catch (error) {
    console.error('Failed to add IP to blacklist:', error);
  }
}

// IP安全检查中间件
export async function ipSecurityCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  try {
    const ipAddress = getClientIP(req);
    
    // 检查IP黑名单
    const blacklistCheck = await checkIPBlacklist(ipAddress);
    
    if (blacklistCheck.isBlocked) {
      return res.status(429).json({
        error: 'IP_BLOCKED',
        message: 'IP_ADDRESS_RESTRICTED',
        reason: blacklistCheck.reason,
        blockedUntil: blacklistCheck.blockedUntil,
        isPermanent: blacklistCheck.isPermanent,
      });
    }

    // 检查登录尝试次数
    const attempts = await getLoginAttempts(ipAddress);
    
    if (attempts.recentFailedAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      // 达到最大尝试次数，添加到黑名单
      await addToBlacklist(ipAddress);
      
      return res.status(429).json({
        error: 'TOO_MANY_ATTEMPTS',
        message: 'TOO_MANY_LOGIN_ATTEMPTS',
        maxAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
        attemptsRemaining: 0,
        lockoutDuration: SECURITY_CONFIG.LOCKOUT_DURATION,
      });
    }

    // 将IP和尝试信息添加到请求对象中，供后续使用
    req.clientIP = ipAddress;
    req.loginAttempts = attempts;
    
    next();
  } catch (error) {
    console.error('IP security check failed:', error);
    // 安全检查失败时，为了安全起见，拒绝请求
    res.status(500).json({
      error: 'SECURITY_CHECK_FAILED',
      message: 'Security check failed. Please try again later.',
    });
  }
}

// 清理过期的IP黑名单记录
export async function cleanupExpiredBlacklist(): Promise<{
  cleaned: number;
  errors: number;
}> {
  let cleaned = 0;
  let errors = 0;
  
  try {
    const now = new Date().toISOString();
    
    // 删除已过期的临时封禁记录
    const { data: expiredEntries } = await supabaseAdmin
      .from('ip_blacklist')
      .select('ip_address')
      .not('blocked_until', 'is', null)
      .lt('blocked_until', now);
    
    if (expiredEntries && expiredEntries.length > 0) {
      const { error } = await supabaseAdmin
        .from('ip_blacklist')
        .delete()
        .not('blocked_until', 'is', null)
        .lt('blocked_until', now);
      
      if (error) {
        console.error('Failed to cleanup expired blacklist entries:', error);
        errors++;
      } else {
        cleaned = expiredEntries.length;
        
        // 记录清理操作
        await logSecurityEvent(
          'blacklist_cleanup',
          null,
          null,
          null,
          { 
            cleaned_count: cleaned,
            cleanup_time: now
          },
          'info'
        );
        
        await logActivityEvent(
          'system_maintenance',
          'blacklist_cleanup',
          { 
            cleaned_count: cleaned,
            cleanup_time: now
          },
          null,
          null,
          null,
          null
        );
      }
    }
  } catch (error) {
    console.error('Error during blacklist cleanup:', error);
    errors++;
  }
  
  return { cleaned, errors };
}

// 清理超过24小时的登录尝试记录
export async function cleanupOldLoginAttempts(): Promise<{
  cleaned: number;
  errors: number;
}> {
  let cleaned = 0;
  let errors = 0;
  
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24小时前
    
    // 获取要删除的记录数量
    const { count } = await supabaseAdmin
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .lt('attempt_time', cutoffTime);
    
    if (count && count > 0) {
      // 删除超过24小时的登录尝试记录
      const { error } = await supabaseAdmin
        .from('login_attempts')
        .delete()
        .lt('attempt_time', cutoffTime);
      
      if (error) {
        console.error('Failed to cleanup old login attempts:', error);
        errors++;
      } else {
        cleaned = count;
        
        // 记录清理操作
        await logSecurityEvent(
          'login_attempts_cleanup',
          null,
          null,
          null,
          { 
            cleaned_count: cleaned,
            cutoff_time: cutoffTime,
            cleanup_time: new Date().toISOString()
          },
          'info'
        );
        
        await logActivityEvent(
          'system_maintenance',
          'login_attempts_cleanup',
          { 
            cleaned_count: cleaned,
            cutoff_time: cutoffTime,
            cleanup_time: new Date().toISOString()
          },
          null,
          null,
          null,
          null
        );
      }
    }
  } catch (error) {
    console.error('Error during login attempts cleanup:', error);
    errors++;
  }
  
  return { cleaned, errors };
}

// 执行完整的安全数据清理
export async function performSecurityCleanup(): Promise<{
  blacklistCleaned: number;
  loginAttemptsCleaned: number;
  totalErrors: number;
}> {
  console.log('Starting security data cleanup...');
  
  const blacklistResult = await cleanupExpiredBlacklist();
  const loginAttemptsResult = await cleanupOldLoginAttempts();
  
  const totalErrors = blacklistResult.errors + loginAttemptsResult.errors;
  
  // 记录清理汇总
  await logSecurityEvent(
    'security_cleanup_summary',
    null,
    null,
    null,
    {
      blacklist_cleaned: blacklistResult.cleaned,
      login_attempts_cleaned: loginAttemptsResult.cleaned,
      total_errors: totalErrors,
      cleanup_time: new Date().toISOString()
    },
    totalErrors > 0 ? 'warning' : 'info'
  );
  
  await logActivityEvent(
    'system_maintenance',
    'security_cleanup_summary',
    {
      blacklist_cleaned: blacklistResult.cleaned,
      login_attempts_cleaned: loginAttemptsResult.cleaned,
      total_errors: totalErrors,
      cleanup_time: new Date().toISOString()
    },
    null,
    null,
    null,
    null
  );
  
  console.log(`Security cleanup completed: ${blacklistResult.cleaned} blacklist entries, ${loginAttemptsResult.cleaned} login attempts cleaned, ${totalErrors} errors`);
  
  return {
    blacklistCleaned: blacklistResult.cleaned,
    loginAttemptsCleaned: loginAttemptsResult.cleaned,
    totalErrors
  };
}

// 启动定期清理任务
export function startSecurityCleanupScheduler(): NodeJS.Timeout {
  console.log('Starting security cleanup scheduler (runs every hour)...');
  
  // 立即执行一次清理
  performSecurityCleanup().catch(error => {
    console.error('Initial security cleanup failed:', error);
  });
  
  // 每小时执行一次清理
  const intervalId = setInterval(async () => {
    try {
      await performSecurityCleanup();
    } catch (error) {
      console.error('Scheduled security cleanup failed:', error);
      
      // 记录清理失败事件
      await logSecurityEvent(
        'security_cleanup_failed',
        null,
        null,
        null,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'error'
      ).catch(logError => {
        console.error('Failed to log cleanup failure:', logError);
      });
      
      await logActivityEvent(
        'system_maintenance',
        'security_cleanup_failed',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        null,
        null,
        null,
        null
      ).catch(logError => {
        console.error('Failed to log activity event for cleanup failure:', logError);
      });
    }
  }, 60 * 60 * 1000); // 每小时执行一次
  
  return intervalId;
}