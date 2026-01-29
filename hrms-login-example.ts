// ============================================
// HRMS Login Handler Example
// ============================================
// Use this code in your HRMS login page/API
// ============================================

import { createClient } from '@supabase/supabase-js';

// HRMS Supabase client
const hrmsSupabase = createClient(
  'https://snjtkvvmjqizdfyqbyzd.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // HRMS anon key
);

/**
 * Handle user login in HRMS
 * @param email - User email
 * @param password - User password (plain text)
 * @returns User data if successful, error if failed
 */
export async function handleHRMSLogin(email: string, password: string) {
  try {
    // Step 1: Find user in user_profiles table (synced from SSO dashboard)
    const { data: user, error: userError } = await hrmsSupabase
      .from('user_profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Step 2: Verify password
    // Currently using plain text comparison
    // TODO: In production, use bcrypt.compare(password, user.password_hash)
    if (!user.password_hash || user.password_hash !== password) {
      console.error('Password mismatch');
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Step 3: Login successful!
    // Get employee data if exists
    const { data: employee } = await hrmsSupabase
      .from('employees')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name || employee?.full_name,
        role: user.role,
        department: user.department || employee?.department,
        employee_id: employee?.id,
      }
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Login failed'
    };
  }
}

// ============================================
// Usage in your HRMS login page:
// ============================================
/*
async function onSubmit(e: FormEvent) {
  e.preventDefault();
  
  const result = await handleHRMSLogin(email, password);
  
  if (result.success) {
    // Store user in session/localStorage
    localStorage.setItem('user', JSON.stringify(result.user));
    // Redirect to dashboard
    router.push('/dashboard');
  } else {
    // Show error
    setError(result.error);
  }
}
*/
