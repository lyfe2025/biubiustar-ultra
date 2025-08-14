import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../lib/supabase';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot-password';
  type?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', type }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);

  // 监听type属性变化，同步更新mode状态
  useEffect(() => {
    if (type && isOpen) {
      setMode(type);
      resetForm();
    }
  }, [type, isOpen]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    account: '', // New field for login (email or username)
    password: '',
    confirmPassword: '',
    username: '',
    fullName: ''
  });

  const { signIn, signUp, resetPassword } = useAuth();
  
  // 字段验证状态
  const [fieldValidation, setFieldValidation] = useState({
    email: { isValid: false, message: '', isChecking: false },
    account: { isValid: false, message: '', isChecking: false }, // New field for login validation
    username: { isValid: false, message: '', isChecking: false },
    password: { isValid: false, message: '', isChecking: false },
    confirmPassword: { isValid: false, message: '', isChecking: false },
    fullName: { isValid: false, message: '', isChecking: false }
  });
  
  // 密码强度
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    requirements: {
      length: false,
      letter: false,
      number: false,
      special: false
    }
  });

  const resetForm = () => {
    setFormData({
      email: '',
      account: '',
      password: '',
      confirmPassword: '',
      username: '',
      fullName: ''
    });
    setError('');
    setSuccess('');
    setFieldValidation({
      email: { isValid: false, message: '', isChecking: false },
      account: { isValid: false, message: '', isChecking: false },
      username: { isValid: false, message: '', isChecking: false },
      password: { isValid: false, message: '', isChecking: false },
      confirmPassword: { isValid: false, message: '', isChecking: false },
      fullName: { isValid: false, message: '', isChecking: false }
    });
    setPasswordStrength({
      score: 0,
      label: '',
      requirements: {
        length: false,
        letter: false,
        number: false,
        special: false
      }
    });
  };
  
  // 计算密码强度
  const calculatePasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      letter: /[a-zA-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    let label = '';
    
    if (score === 0) label = '';
    else if (score === 1) label = t('auth.password.strength.weak');
    else if (score === 2) label = t('auth.password.strength.medium');
    else if (score === 3) label = t('auth.password.strength.strong');
    else label = t('auth.password.strength.veryStrong');
    
    return { score, label, requirements };
  };
  
  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // 验证用户名格式
  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };
  

  
  // 实时验证字段
  const validateField = (field: string, value: string) => {
    let isValid = false;
    let message = '';
    
    switch (field) {
      case 'email':
        if (!value) {
          message = t('auth.validation.required');
        } else if (validateEmail(value)) {
          isValid = true;
          message = t('auth.validation.emailValid');
        } else {
          message = t('auth.validation.emailInvalid');
        }
        break;
        
      case 'username':
        if (!value) {
          message = t('auth.validation.required');
        } else if (validateUsername(value)) {
          isValid = true;
          message = t('auth.validation.usernameValid');
        } else {
          message = t('auth.validation.usernameInvalid');
        }
        break;
        
      case 'account':
        if (!value) {
          message = t('auth.validation.required');
        } else {
          // 检查是否为有效的邮箱格式
          if (validateEmail(value)) {
            isValid = true;
            message = t('auth.validation.accountValid');
          } else if (validateUsername(value)) {
            // 检查是否为有效的用户名格式
            isValid = true;
            message = t('auth.validation.accountValid');
          } else {
            message = t('auth.validation.accountInvalid');
          }
        }
        break;
        
      case 'password':
        if (!value) {
          message = t('auth.validation.required');
        } else {
          const strength = calculatePasswordStrength(value);
          setPasswordStrength(strength);
          
          if (strength.requirements.length && strength.requirements.letter && strength.requirements.number) {
            isValid = true;
            message = t('auth.validation.passwordValid');
          } else {
            message = t('auth.validation.passwordWeak');
          }
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          message = t('auth.validation.required');
        } else if (value === formData.password) {
          isValid = true;
          message = t('auth.validation.passwordsMatch');
        } else {
          message = t('auth.validation.passwordsMismatch');
        }
        break;
    }
    
    setFieldValidation(prev => ({
      ...prev,
      [field]: { isValid, message, isChecking: false }
    }));
  };

  const handleModeChange = (newMode: 'login' | 'register' | 'forgot-password') => {
    setMode(newMode);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    // 登录模式验证账号字段（支持邮箱或用户名）
    if (mode === 'login') {
      if (!formData.account) {
        setError(t('auth.validation.accountRequired'));
        return false;
      }
    } else {
      // 注册和忘记密码模式验证邮箱字段
      if (!formData.email) {
        setError(t('auth.validation.emailRequired'));
        return false;
      }

      // 使用更严格的邮箱格式验证，与后端保持一致
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError(t('auth.validation.emailInvalid'));
        return false;
      }
    }

    if (mode !== 'forgot-password') {
      if (!formData.password) {
        setError(t('auth.validation.passwordRequired'));
        return false;
      }

      if (formData.password.length < 6) {
        setError(t('auth.validation.passwordTooShort'));
        return false;
      }
    }

    if (mode === 'register') {
      if (!formData.username) {
        setError(t('auth.validation.usernameRequired'));
        return false;
      }

      if (formData.username.length < 2) {
        setError(t('auth.validation.usernameTooShort'));
        return false;
      }

      if (!formData.confirmPassword) {
        setError(t('auth.validation.confirmPasswordRequired'));
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError(t('auth.validation.passwordMismatch'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
          await signIn(formData.account, formData.password);
        setSuccess(t('auth.success.loginSuccess'));
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else if (mode === 'register') {
        await signUp(formData.email, formData.password, formData.username);
        setSuccess(t('auth.success.registerSuccess'));
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else if (mode === 'forgot-password') {
          await resetPassword(formData.email);
        setSuccess(t('auth.success.resetPasswordSent'));
        setTimeout(() => {
          handleModeChange('login');
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.error.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: field, value } = e.target;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
    
    // 实时验证
    if (value.trim()) {
      validateField(field, value);
    } else {
      setFieldValidation(prev => ({
        ...prev,
        [field]: { isValid: false, message: '', isChecking: false }
      }));
    }
    
    // 如果是确认密码字段，且密码已填写，需要重新验证确认密码
    if (field === 'password' && formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return t('auth.login');
      case 'register':
        return t('auth.register');
      case 'forgot-password':
        return t('auth.resetPassword');
      default:
        return t('auth.login');
    }
  };

  const getSubmitText = () => {
    if (loading) {
      switch (mode) {
        case 'login':
          return t('auth.loggingIn');
        case 'register':
          return t('auth.registering');
        case 'forgot-password':
          return t('auth.sending');
        default:
          return t('auth.processing');
      }
    }
    
    switch (mode) {
      case 'login':
        return t('auth.login');
      case 'register':
        return t('auth.register');
      case 'forgot-password':
        return t('auth.sendResetEmail');
      default:
        return t('auth.confirm');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30">
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 头部 */}
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center">{getTitle()}</h2>
          <p className="text-gray-600 text-center mt-2">
            {mode === 'login' && t('auth.welcomeBack')}
            {mode === 'register' && t('auth.joinCommunity')}
            {mode === 'forgot-password' && t('auth.resetPassword')}
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="space-y-4">
            {/* 用户名字段 (仅注册时显示) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.username')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      formData.username && fieldValidation.username.message
                        ? fieldValidation.username.isValid
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder={t('auth.usernamePlaceholder')}
                    disabled={loading}
                  />
                  {/* 验证状态图标 */}
                  {formData.username && fieldValidation.username.message && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {fieldValidation.username.isValid ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {/* 字段级错误提示 */}
                {formData.username && fieldValidation.username.message && (
                  <div className={`mt-1 text-sm ${
                    fieldValidation.username.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {fieldValidation.username.message}
                  </div>
                )}
              </div>
            )}

            {/* 邮箱字段 (注册和忘记密码时显示) */}
            {(mode === 'register' || mode === 'forgot-password') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      formData.email && fieldValidation.email.message
                        ? fieldValidation.email.isValid
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder={t('auth.emailPlaceholder')}
                    disabled={loading}
                  />
                  {/* 验证状态图标 */}
                  {formData.email && fieldValidation.email.message && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {fieldValidation.email.isValid ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {/* 字段级错误提示 */}
                {formData.email && fieldValidation.email.message && (
                  <div className={`mt-1 text-sm ${
                    fieldValidation.email.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {fieldValidation.email.message}
                  </div>
                )}
              </div>
            )}

            {/* 账号字段 (登录时显示) */}
            {mode === 'login' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.account')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="account"
                    value={formData.account}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      formData.account && fieldValidation.account.message
                        ? fieldValidation.account.isValid
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder={t('auth.accountPlaceholder')}
                    disabled={loading}
                  />
                  {/* 验证状态图标 */}
                  {formData.account && fieldValidation.account.message && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {fieldValidation.account.isValid ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {/* 字段级错误提示 */}
                {formData.account && fieldValidation.account.message && (
                  <div className={`mt-1 text-sm ${
                    fieldValidation.account.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {fieldValidation.account.message}
                  </div>
                )}
              </div>
            )}

            {/* 密码字段 (忘记密码时不显示) */}
            {mode !== 'forgot-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      formData.password && fieldValidation.password.message
                        ? fieldValidation.password.isValid
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder={t('auth.passwordPlaceholder')}
                    disabled={loading}
                  />
                  {/* 验证状态图标 */}
                  {formData.password && fieldValidation.password.message && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      {fieldValidation.password.isValid ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* 字段级错误提示 */}
                {formData.password && fieldValidation.password.message && (
                  <div className={`mt-1 text-sm ${
                    fieldValidation.password.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {fieldValidation.password.message}
                  </div>
                )}
                {/* 密码强度指示器 (仅注册时显示) */}
                {mode === 'register' && formData.password && (
                  <div className="mt-2">
                    <PasswordStrengthIndicator
                      password={formData.password}
                      strength={passwordStrength}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 确认密码字段 (仅注册时显示) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      formData.confirmPassword && fieldValidation.confirmPassword.message
                        ? fieldValidation.confirmPassword.isValid
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    disabled={loading}
                  />
                  {/* 验证状态图标 */}
                  {formData.confirmPassword && fieldValidation.confirmPassword.message && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      {fieldValidation.confirmPassword.isValid ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* 字段级错误提示 */}
                {formData.confirmPassword && fieldValidation.confirmPassword.message && (
                  <div className={`mt-1 text-sm ${
                    fieldValidation.confirmPassword.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {fieldValidation.confirmPassword.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* 成功信息 */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors',
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            )}
          >
            {getSubmitText()}
          </button>

          {/* 模式切换链接 */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => handleModeChange('forgot-password')}
                  className="text-purple-600 hover:text-purple-700 text-sm transition-colors"
                  disabled={loading}
                >
                  {t('auth.forgotPassword')}
                </button>
                <div className="text-gray-600 text-sm">
                  {t('auth.noAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('register')}
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    disabled={loading}
                  >
                    {t('auth.signUp')}
                  </button>
                </div>
              </>
            )}

            {mode === 'register' && (
              <div className="text-gray-600 text-sm">
                {t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  disabled={loading}
                >
                  {t('auth.signIn')}
                </button>
              </div>
            )}

            {mode === 'forgot-password' && (
              <div className="text-gray-600 text-sm">
                {t('auth.rememberedPassword')}{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  disabled={loading}
                >
                  {t('auth.backToLogin')}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;