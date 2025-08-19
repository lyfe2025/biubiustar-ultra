-- Create admin user with password
-- This script creates an admin user directly in Supabase auth.users table

-- Insert admin user into auth.users table
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'admin@biubiustar.com',
  crypt('admin123', gen_salt('bf')), -- Password: admin123
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "admin@biubiustar.com", "email_verified": true, "phone_verified": false, "sub": "' || gen_random_uuid() || '"}',
  false,
  'authenticated'
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  updated_at = now();

-- Create or update user profile for admin
INSERT INTO public.user_profiles (
  id,
  username,
  display_name,
  bio,
  avatar_url,
  role,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'admin',
  'System Administrator',
  'System administrator account',
  null,
  'admin',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'admin@biubiustar.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = now();