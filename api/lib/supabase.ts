/**
 * Supabase client configuration for backend API
 * Provides both admin and regular client instances
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

/**
 * Admin Supabase client with service role key
 * Use for server-side operations that require elevated privileges
 * - User management (create, delete, list users)
 * - Bypassing RLS policies
 * - Administrative operations
 */
export const supabaseAdmin: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Regular Supabase client with anon key
 * Use for operations that should respect RLS policies
 * - Regular database queries
 * - File uploads/downloads
 * - Real-time subscriptions
 */
export const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Create a Supabase client with a specific user's JWT token
 * Use for operations that need to be performed as a specific user
 * @param accessToken - User's JWT access token
 * @returns Supabase client configured with user's token
 */
export const createUserClient = (accessToken: string): SupabaseClient => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

/**
 * Helper function to extract user ID from JWT token
 * @param accessToken - User's JWT access token
 * @returns User ID or null if invalid
 */
export const getUserIdFromToken = async (accessToken: string): Promise<string | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return null;
    }
    return user.id;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

/**
 * Middleware helper to verify JWT token and extract user info
 * @param authHeader - Authorization header value
 * @returns User data or null if invalid
 */
export const verifyAuthToken = async (authHeader: string | undefined) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
};

export default {
  supabaseAdmin,
  supabase,
  createUserClient,
  getUserIdFromToken,
  verifyAuthToken
};