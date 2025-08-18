/**
 * Input validation utility functions
 * Extracted from app.ts for better code organization
 */

// Email validation helper
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation helper
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: '密码长度至少6位' };
  }
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: '密码必须包含字母和数字' };
  }
  return { valid: true };
};

// General input validation helpers
export const validateRequired = (value: unknown, fieldName: string): { valid: boolean; message?: string } => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName}不能为空` };
  }
  return { valid: true };
};

export const validateLength = (value: string, min: number, max: number, fieldName: string): { valid: boolean; message?: string } => {
  if (value.length < min) {
    return { valid: false, message: `${fieldName}长度至少${min}位` };
  }
  if (value.length > max) {
    return { valid: false, message: `${fieldName}长度不能超过${max}位` };
  }
  return { valid: true };
};

// Post status validation
export const validatePostStatus = (status: string): boolean => {
  return ['pending', 'approved', 'rejected', 'draft'].includes(status);
};