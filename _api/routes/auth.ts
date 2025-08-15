/**
 * User authentication API routes
 * Handle user registration, login, logout, password reset, etc.
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Input validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: '密码长度至少6位' };
  }
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: '密码必须包含字母和数字' };
  }
  return { valid: true };
};

// Standard API response format
const sendResponse = (res: Response, success: boolean, data?: any, message?: string, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username, full_name } = req.body;

    // Input validation
    if (!email || !password) {
      sendResponse(res, false, null, '邮箱和密码不能为空', 400);
      return;
    }

    if (!validateEmail(email)) {
      sendResponse(res, false, null, '邮箱格式不正确', 400);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      sendResponse(res, false, null, passwordValidation.message, 400);
      return;
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users?.find((user: any) => user.email === email);
    if (userExists) {
      sendResponse(res, false, null, '该邮箱已被注册', 409);
      return;
    }

    // Check if username already exists (if username is provided)
    if (username) {
      const { data: existingProfile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existingProfile && !profileError) {
        sendResponse(res, false, null, '该用户名已被使用', 409);
        return;
      }
      
      // If there's an error other than "no rows returned", log it but continue
      if (profileError && !profileError.message.includes('No rows')) {
        console.error('Error checking username uniqueness:', profileError);
      }
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for demo purposes
      user_metadata: {
        username: username || email.split('@')[0],
        full_name: full_name || ''
      }
    });

    if (authError) {
      console.error('Registration error:', authError);
      sendResponse(res, false, null, '注册失败: ' + authError.message, 500);
      return;
    }

    // Return success response (exclude sensitive data)
    sendResponse(res, true, {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: authData.user.user_metadata?.username,
        full_name: authData.user.user_metadata?.full_name,
        created_at: authData.user.created_at
      }
    }, '注册成功', 201);

  } catch (error) {
    console.error('Registration error:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { account, password } = req.body; // Changed from 'email' to 'account' to support both email and username

    // Input validation
    if (!account || !password) {
      sendResponse(res, false, null, '账号和密码不能为空', 400);
      return;
    }

    let loginEmail = account;
    
    // Check if account is email or username
    if (!validateEmail(account)) {
      // If not email format, treat as username and find corresponding email
      try {
        const { data: userProfile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('username', account)
          .single();
        
        if (profileError || !userProfile) {
          sendResponse(res, false, null, '用户名或密码错误', 401);
          return;
        }
        
        // Get email from auth.users table using the user ID
        const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userProfile.id);
        
        if (authUserError || !authUser.user) {
          sendResponse(res, false, null, '用户名或密码错误', 401);
          return;
        }
        
        loginEmail = authUser.user.email;
      } catch (error) {
        console.error('Error finding user by username:', error);
        sendResponse(res, false, null, '用户名或密码错误', 401);
        return;
      }
    }

    // Authenticate user with Supabase using email
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (authError) {
      console.error('Login error:', authError);
      if (authError.message.includes('Invalid login credentials')) {
        sendResponse(res, false, null, '邮箱或密码错误', 401);
      } else {
        sendResponse(res, false, null, '登录失败: ' + authError.message, 500);
      }
      return;
    }

    if (!authData.user || !authData.session) {
      sendResponse(res, false, null, '登录失败', 401);
      return;
    }

    // Update last_login timestamp in user_profiles
    try {
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error('Failed to update last_login:', updateError);
        // Don't fail the login if last_login update fails
      }
    } catch (updateErr) {
      console.error('Error updating last_login:', updateErr);
      // Don't fail the login if last_login update fails
    }

    // Return success response with user data and session
    sendResponse(res, true, {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: authData.user.user_metadata?.username,
        full_name: authData.user.user_metadata?.full_name,
        last_sign_in_at: authData.user.last_sign_in_at
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        token_type: authData.session.token_type
      }
    }, '登录成功');

  } catch (error) {
    console.error('Login error:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendResponse(res, false, null, '未提供有效的访问令牌', 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Sign out user session
    const { error } = await supabaseAdmin.auth.admin.signOut(token);

    if (error) {
      console.error('Logout error:', error);
      // Even if logout fails, we still return success for security
      // The client should clear local tokens regardless
    }

    sendResponse(res, true, null, '登出成功');

  } catch (error) {
    console.error('Logout error:', error);
    // Return success even on error for security reasons
    sendResponse(res, true, null, '登出成功');
  }
});

/**
 * Password Reset Request
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      sendResponse(res, false, null, '邮箱不能为空', 400);
      return;
    }

    if (!validateEmail(email)) {
      sendResponse(res, false, null, '邮箱格式不正确', 400);
      return;
    }

    // Send password reset email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      sendResponse(res, false, null, '发送重置邮件失败', 500);
      return;
    }

    // Always return success for security (don't reveal if email exists)
    sendResponse(res, true, null, '如果该邮箱已注册，您将收到密码重置邮件');

  } catch (error) {
    console.error('Password reset error:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * Update Password
 * POST /api/auth/update-password
 */
router.post('/update-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { access_token, new_password } = req.body;

    if (!access_token || !new_password) {
      sendResponse(res, false, null, '访问令牌和新密码不能为空', 400);
      return;
    }

    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      sendResponse(res, false, null, passwordValidation.message, 400);
      return;
    }

    // Update user password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      access_token, // This should be user ID, need to get from token
      { password: new_password }
    );

    if (error) {
      console.error('Password update error:', error);
      sendResponse(res, false, null, '密码更新失败', 500);
      return;
    }

    sendResponse(res, true, null, '密码更新成功');

  } catch (error) {
    console.error('Password update error:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * Get Current User
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendResponse(res, false, null, '未提供有效的访问令牌', 401);
      return;
    }

    const token = authHeader.substring(7);

    // Get user from token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      sendResponse(res, false, null, '无效的访问令牌', 401);
      return;
    }

    sendResponse(res, true, {
      user: {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username,
        full_name: user.user_metadata?.full_name,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

export default router;