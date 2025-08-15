// 认证相关翻译
export const authTranslations = {
  zh: {
    auth: {
      // 核心翻译键 - 直接对应截图中的键
      register: '注册',
      login: '登录',
      username: '用户名',
      email: '邮箱',
      passwordLabel: '密码',
      confirmPassword: '确认密码',
      account: '账户',
      welcomeBack: '欢迎回来',
      joinCommunity: '加入我们的社区',
      forgotPassword: '忘记密码？',
      noAccount: '还没有账户？',
      hasAccount: '已有账户？',
      signUp: '注册',
      signIn: '登录',
      resetPassword: '重置密码',
      sendResetEmail: '发送重置邮件',
      rememberedPassword: '想起密码了？',
      backToLogin: '返回登录',
      usernamePlaceholder: '请输入用户名',
      
      // Placeholder文本
      emailPlaceholder: '请输入邮箱地址',
      passwordPlaceholder: '请输入密码',
      confirmPasswordPlaceholder: '请再次输入密码',
      accountPlaceholder: '邮箱或用户名',

      // 登录表单
      loginForm: {
        title: '登录',
        email: '邮箱',
        password: '密码',
        submit: '登录',
        forgotPassword: '忘记密码？',
        noAccount: '还没有账户？',
        createAccount: '创建账户'
      },

      // 注册表单
      registerForm: {
        title: '注册',
        email: '邮箱',
        password: '密码',
        confirmPassword: '确认密码',
        username: '用户名',
        submit: '注册',
        hasAccount: '已有账户？',
        signIn: '立即登录',
        agreeTerms: '我同意',
        termsOfService: '服务条款',
        and: '和',
        privacyPolicy: '隐私政策'
      },

      // 密码验证
      password: {
        requirements: '密码要求：',
        minLength: '至少8个字符',
        hasUppercase: '包含大写字母',
        hasLowercase: '包含小写字母',
        hasNumber: '包含数字',
        hasSpecial: '包含特殊字符',
        strength: {
          weak: '弱',
          medium: '中等',
          strong: '强'
        },
        requirement: {
          length: '至少8个字符',
          letter: '包含字母',
          number: '包含数字',
          special: '包含特殊字符'
        }
      },

      // 表单验证
      validation: {
        required: '此字段必填',
        accountRequired: '请输入账户',
        accountValid: '账户格式正确',
        accountInvalid: '账户格式不正确（请输入有效邮箱或用户名）',
        emailRequired: '请输入邮箱',
        emailValid: '邮箱格式正确',
        emailInvalid: '邮箱格式不正确',
        passwordRequired: '请输入密码',
        passwordTooShort: '密码至少8个字符',
        passwordWeak: '密码强度太弱（需包含字母和数字）',
        passwordValid: '密码格式正确',
        passwordMismatch: '两次密码不一致',
        passwordsMatch: '密码匹配',
        passwordsMismatch: '两次输入的密码不一致',
        confirmPasswordRequired: '请确认密码',
        usernameRequired: '请输入用户名',
        usernameValid: '用户名格式正确',
        usernameTooShort: '用户名至少3个字符',
        usernameInvalid: '用户名格式不正确'
      },

      // 消息提示
      messages: {
        loginSuccess: '登录成功！',
        loginFailed: '登录失败，请检查邮箱和密码',
        registerSuccess: '注册成功！',
        registerFailed: '注册失败，请重试',
        logoutSuccess: '退出成功',
        emailExists: '该邮箱已被注册',
        usernameExists: '该用户名已被使用'
      }
    }
  },
  'zh-TW': {
    auth: {
      register: '註冊',
      login: '登入',
      username: '用戶名',
      email: '郵箱',
      passwordLabel: '密碼',
      confirmPassword: '確認密碼',
      account: '帳戶',
      welcomeBack: '歡迎回來',
      joinCommunity: '加入我們的社區',
      forgotPassword: '忘記密碼？',
      noAccount: '還沒有帳戶？',
      hasAccount: '已有帳戶？',
      signUp: '註冊',
      signIn: '登入',
      resetPassword: '重置密碼',
      sendResetEmail: '發送重置郵件',
      rememberedPassword: '想起密碼了？',
      backToLogin: '返回登入',
      usernamePlaceholder: '請輸入用戶名',
      
      emailPlaceholder: '請輸入郵箱地址',
      passwordPlaceholder: '請輸入密碼',
      confirmPasswordPlaceholder: '請再次輸入密碼',
      accountPlaceholder: '郵箱或用戶名',

      loginForm: {
        title: '登入',
        email: '郵箱',
        password: '密碼',
        submit: '登入',
        forgotPassword: '忘記密碼？',
        noAccount: '還沒有帳戶？',
        createAccount: '創建帳戶'
      },

      registerForm: {
        title: '註冊',
        email: '郵箱',
        password: '密碼',
        confirmPassword: '確認密碼',
        username: '用戶名',
        submit: '註冊',
        hasAccount: '已有帳戶？',
        signIn: '立即登入',
        agreeTerms: '我同意',
        termsOfService: '服務條款',
        and: '和',
        privacyPolicy: '隱私政策'
      },

      password: {
        requirements: '密碼要求：',
        minLength: '至少8個字符',
        hasUppercase: '包含大寫字母',
        hasLowercase: '包含小寫字母',
        hasNumber: '包含數字',
        hasSpecial: '包含特殊字符',
        strength: {
          weak: '弱',
          medium: '中等',
          strong: '強'
        },
        requirement: {
          length: '至少8個字符',
          letter: '包含字母',
          number: '包含數字',
          special: '包含特殊字符'
        }
      },

      validation: {
        required: '此字段必填',
        accountRequired: '請輸入帳戶',
        accountValid: '帳戶格式正確',
        accountInvalid: '帳戶格式不正確（請輸入有效郵箱或用戶名）',
        emailRequired: '請輸入郵箱',
        emailValid: '郵箱格式正確',
        emailInvalid: '郵箱格式不正確',
        passwordRequired: '請輸入密碼',
        passwordTooShort: '密碼至少8個字符',
        passwordWeak: '密碼強度太弱（需包含字母和數字）',
        passwordValid: '密碼格式正確',
        passwordMismatch: '兩次密碼不一致',
        passwordsMatch: '密碼匹配',
        passwordsMismatch: '兩次輸入的密碼不一致',
        confirmPasswordRequired: '請確認密碼',
        usernameRequired: '請輸入用戶名',
        usernameValid: '用戶名格式正確',
        usernameTooShort: '用戶名至少3個字符',
        usernameInvalid: '用戶名格式不正確'
      },

      messages: {
        loginSuccess: '登入成功！',
        loginFailed: '登入失敗，請檢查郵箱和密碼',
        registerSuccess: '註冊成功！',
        registerFailed: '註冊失敗，請重試',
        logoutSuccess: '退出成功',
        emailExists: '該郵箱已被註冊',
        usernameExists: '該用戶名已被使用'
      }
    }
  },
  en: {
    auth: {
      register: 'Register',
      login: 'Login',
      username: 'Username',
      email: 'Email',
      passwordLabel: 'Password',
      confirmPassword: 'Confirm Password',
      account: 'Account',
      welcomeBack: 'Welcome Back',
      joinCommunity: 'Join Our Community',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In',
      resetPassword: 'Reset Password',
      sendResetEmail: 'Send Reset Email',
      rememberedPassword: 'Remembered password?',
      backToLogin: 'Back to Login',
      usernamePlaceholder: 'Enter username',
      
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      confirmPasswordPlaceholder: 'Confirm your password',
      accountPlaceholder: 'Email or username',

      loginForm: {
        title: 'Login',
        email: 'Email',
        password: 'Password',
        submit: 'Login',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        createAccount: 'Create account'
      },

      registerForm: {
        title: 'Register',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        username: 'Username',
        submit: 'Register',
        hasAccount: 'Already have an account?',
        signIn: 'Sign in',
        agreeTerms: 'I agree to the',
        termsOfService: 'Terms of Service',
        and: 'and',
        privacyPolicy: 'Privacy Policy'
      },

      password: {
        requirements: 'Password requirements:',
        minLength: 'At least 8 characters',
        hasUppercase: 'Contains uppercase letter',
        hasLowercase: 'Contains lowercase letter',
        hasNumber: 'Contains number',
        hasSpecial: 'Contains special character',
        strength: {
          weak: 'Weak',
          medium: 'Medium',
          strong: 'Strong'
        },
        requirement: {
          length: 'At least 8 characters',
          letter: 'Contains letter',
          number: 'Contains number',
          special: 'Contains special character'
        }
      },

      validation: {
        required: 'This field is required',
        accountRequired: 'Please enter your account',
        accountValid: 'Account format is valid',
        accountInvalid: 'Invalid account format (please enter a valid email or username)',
        emailRequired: 'Email is required',
        emailValid: 'Email format is valid',
        emailInvalid: 'Invalid email format',
        passwordRequired: 'Password is required',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordWeak: 'Password is too weak (must contain letters and numbers)',
        passwordValid: 'Password is valid',
        passwordMismatch: 'Passwords do not match',
        passwordsMatch: 'Passwords match',
        passwordsMismatch: 'The two passwords entered do not match',
        confirmPasswordRequired: 'Please confirm your password',
        usernameRequired: 'Username is required',
        usernameValid: 'Username format is valid',
        usernameTooShort: 'Username must be at least 3 characters',
        usernameInvalid: 'Invalid username format'
      },

      messages: {
        loginSuccess: 'Login successful!',
        loginFailed: 'Login failed, please check your email and password',
        registerSuccess: 'Registration successful!',
        registerFailed: 'Registration failed, please try again',
        logoutSuccess: 'Logout successful',
        emailExists: 'This email is already registered',
        usernameExists: 'This username is already taken'
      }
    }
  },
  vi: {
    auth: {
      register: 'Đăng ký',
      login: 'Đăng nhập',
      username: 'Tên người dùng',
      email: 'Email',
      passwordLabel: 'Mật khẩu',
      confirmPassword: 'Xác nhận mật khẩu',
      account: 'Tài khoản',
      welcomeBack: 'Chào mừng trở lại',
      joinCommunity: 'Tham gia cộng đồng',
      forgotPassword: 'Quên mật khẩu?',
      noAccount: 'Chưa có tài khoản?',
      hasAccount: 'Đã có tài khoản?',
      signUp: 'Đăng ký',
      signIn: 'Đăng nhập',
      resetPassword: 'Đặt lại mật khẩu',
      sendResetEmail: 'Gửi email đặt lại',
      rememberedPassword: 'Đã nhớ mật khẩu?',
      backToLogin: 'Quay lại đăng nhập',
      usernamePlaceholder: 'Nhập tên người dùng',
      
      emailPlaceholder: 'Nhập email của bạn',
      passwordPlaceholder: 'Nhập mật khẩu',
      confirmPasswordPlaceholder: 'Xác nhận mật khẩu',
      accountPlaceholder: 'Email hoặc tên người dùng',

      loginForm: {
        title: 'Đăng nhập',
        email: 'Email',
        password: 'Mật khẩu',
        submit: 'Đăng nhập',
        forgotPassword: 'Quên mật khẩu?',
        noAccount: 'Chưa có tài khoản?',
        createAccount: 'Tạo tài khoản'
      },

      registerForm: {
        title: 'Đăng ký',
        email: 'Email',
        password: 'Mật khẩu',
        confirmPassword: 'Xác nhận mật khẩu',
        username: 'Tên người dùng',
        submit: 'Đăng ký',
        hasAccount: 'Đã có tài khoản?',
        signIn: 'Đăng nhập ngay',
        agreeTerms: 'Tôi đồng ý với',
        termsOfService: 'Điều khoản dịch vụ',
        and: 'và',
        privacyPolicy: 'Chính sách bảo mật'
      },

      password: {
        requirements: 'Yêu cầu mật khẩu:',
        minLength: 'Ít nhất 8 ký tự',
        hasUppercase: 'Chứa chữ cái viết hoa',
        hasLowercase: 'Chứa chữ cái viết thường',
        hasNumber: 'Chứa số',
        hasSpecial: 'Chứa ký tự đặc biệt',
        strength: {
          weak: 'Yếu',
          medium: 'Trung bình',
          strong: 'Mạnh'
        },
        requirement: {
          length: 'Ít nhất 8 ký tự',
          letter: 'Chứa chữ cái',
          number: 'Chứa số',
          special: 'Chứa ký tự đặc biệt'
        }
      },

      validation: {
        required: 'Trường này là bắt buộc',
        accountRequired: 'Vui lòng nhập tài khoản',
        accountValid: 'Định dạng tài khoản hợp lệ',
        accountInvalid: 'Định dạng tài khoản không hợp lệ (vui lòng nhập email hoặc tên người dùng hợp lệ)',
        emailRequired: 'Vui lòng nhập email',
        emailValid: 'Định dạng email hợp lệ',
        emailInvalid: 'Định dạng email không hợp lệ',
        passwordRequired: 'Vui lòng nhập mật khẩu',
        passwordTooShort: 'Mật khẩu phải có ít nhất 8 ký tự',
        passwordWeak: 'Mật khẩu quá yếu (phải chứa chữ cái và số)',
        passwordValid: 'Mật khẩu hợp lệ',
        passwordMismatch: 'Mật khẩu không khớp',
        passwordsMatch: 'Mật khẩu khớp',
        passwordsMismatch: 'Hai mật khẩu nhập vào không khớp nhau',
        confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu',
        usernameRequired: 'Vui lòng nhập tên người dùng',
        usernameValid: 'Định dạng tên người dùng hợp lệ',
        usernameTooShort: 'Tên người dùng phải có ít nhất 3 ký tự',
        usernameInvalid: 'Định dạng tên người dùng không hợp lệ'
      },

      messages: {
        loginSuccess: 'Đăng nhập thành công!',
        loginFailed: 'Đăng nhập thất bại, vui lòng kiểm tra email và mật khẩu',
        registerSuccess: 'Đăng ký thành công!',
        registerFailed: 'Đăng ký thất bại, vui lòng thử lại',
        logoutSuccess: 'Đăng xuất thành công',
        emailExists: 'Email này đã được đăng ký',
        usernameExists: 'Tên người dùng này đã được sử dụng'
      }
    }
  }
}