'use client';

import { getSupabaseClient } from './supabaseClient';
import { UserProfile, UserRole } from '@/types';
import { PackagingStorage } from './storage';
import { DEFAULT_COMPANY, DEFAULT_ADMIN_USER } from './constants';

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Google Identity Services (GIS) ID Token Login
   * Directly verifies Google account without showing supabase.co redirect!
   */
  public async signInWithGoogleIdToken(idToken: string): Promise<{ user?: UserProfile; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: 'Cloud authentication is not connected.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Google authentication did not return a user.' };
      }

      const email = (data.user.email || '').toLowerCase().trim();

      // Check Whitelist in Supabase users table
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      if (!dbUser) {
        await supabase.auth.signOut();
        PackagingStorage.getInstance().clearCurrentUser();
        return {
          error: `Access Denied: The Google account (${email}) is not registered by the factory administrator.`,
        };
      }

      const isInactive = dbUser.preferences?.status === 'inactive' || dbUser.status === 'inactive';
      if (isInactive) {
        await supabase.auth.signOut();
        PackagingStorage.getInstance().clearCurrentUser();
        return {
          error: 'Account Suspended: This user account has been deactivated by the factory administrator.',
        };
      }

      const activeProfile: UserProfile = {
        id: dbUser.id,
        companyId: dbUser.company_id || DEFAULT_COMPANY.id,
        companyName: DEFAULT_COMPANY.name,
        fullName: dbUser.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
        designation: dbUser.designation || 'Production Personnel',
        email: dbUser.email || email,
        phone: dbUser.phone || '',
        role: (dbUser.role as UserRole) || 'supervisor',
        employeeId: dbUser.employee_id || 'EMP001',
        status: 'active',
        preferences: dbUser.preferences || { defaultShift: 'Day Shift', defaultLine: 'Line 1', weightUnit: 'g', status: 'active' },
        createdAt: dbUser.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      PackagingStorage.getInstance().setCurrentUser(activeProfile);
      return { user: activeProfile };
    } catch (err: any) {
      return { error: err.message || 'Google verification failed' };
    }
  }

  /**
   * Google OAuth 1-Click Login (Fallback Redirect Method)
   */
  public async signInWithGoogle(): Promise<{ error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: 'Cloud authentication is not connected.' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Google authentication failed' };
    }
  }

  /**
   * Email and Password Login - Strict Whitelist Verification
   * Only emails pre-registered by the administrator are permitted.
   */
  public async signInWithEmail(email: string, pass: string): Promise<{ user?: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { error: 'Please enter both email and password.' };
    }

    const supabase = getSupabaseClient();
    let dbUser: any = null;

    // 1. Check in Supabase Cloud
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (!error && data) {
          dbUser = data;
        }
      } catch (err) {
        console.warn('Supabase query error:', err);
      }
    }

    // 2. Check local IndexedDB / Storage fallback if offline
    if (!dbUser) {
      const localUsers = PackagingStorage.getInstance().getUsers();
      dbUser = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    // 3. STRICT WHITELIST: If email not found in admin-created users, DENY ACCESS!
    if (!dbUser) {
      return {
        error: `Access Denied: The email "${cleanEmail}" has not been registered by the factory administrator.`,
      };
    }

    // 4. CHECK ACCOUNT STATUS: If deactivated, reject immediately!
    const isInactive = dbUser.preferences?.status === 'inactive' || dbUser.status === 'inactive';
    if (isInactive) {
      return {
        error: 'Account Suspended: This user account has been deactivated by the factory administrator.',
      };
    }

    // 5. VERIFY PASSWORD
    let passwordMatched = false;

    // A) Check admin-assigned password in preferences / profile
    const storedPass = dbUser.preferences?.password || dbUser.password;
    if (storedPass && storedPass === cleanPass) {
      passwordMatched = true;
    }

    // B) If not matched, try Supabase Auth signInWithPassword
    if (!passwordMatched && supabase) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });
        if (!authErr && authData.user) {
          passwordMatched = true;
        }
      } catch {
        // ignore network error
      }
    }

    if (!passwordMatched) {
      return { error: 'Incorrect password. Please verify your credentials.' };
    }

    // 6. Build UserProfile & log in
    const activeProfile: UserProfile = {
      id: dbUser.id,
      companyId: dbUser.company_id || DEFAULT_COMPANY.id,
      companyName: DEFAULT_COMPANY.name,
      fullName: dbUser.full_name || cleanEmail.split('@')[0],
      designation: dbUser.designation || 'Production Personnel',
      email: dbUser.email || cleanEmail,
      phone: dbUser.phone || '',
      role: (dbUser.role as UserRole) || 'supervisor',
      employeeId: dbUser.employee_id || 'EMP001',
      status: 'active',
      preferences: dbUser.preferences || { defaultShift: 'Day Shift', defaultLine: 'Line 1', weightUnit: 'g', status: 'active' },
      createdAt: dbUser.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    PackagingStorage.getInstance().setCurrentUser(activeProfile);
    return { user: activeProfile };
  }

  /**
   * Listen to Supabase auth state change and enforce Google Whitelist
   * Only allows users whose Google email exists in the admin-created users table.
   */
  public initAuthListener(
    onUserChanged: (user: UserProfile) => void,
    onAuthError?: (error: string) => void
  ): (() => void) | undefined {
    const supabase = getSupabaseClient();
    if (!supabase) return undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const email = (u.email || '').toLowerCase().trim();

        if (!email) return;

        // Query the authorized users table in Supabase
        let authorizedUser: any = null;
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .ilike('email', email)
            .maybeSingle();
          authorizedUser = data;
        } catch (err) {
          console.warn('Error querying authorized users:', err);
        }

        // Fallback local check
        if (!authorizedUser) {
          const localUsers = PackagingStorage.getInstance().getUsers();
          authorizedUser = localUsers.find((lu) => lu.email.toLowerCase() === email);
        }

        // STRICT WHITELIST CHECK:
        if (!authorizedUser) {
          console.warn(`Unauthorized Google login attempt: ${email}`);
          await supabase.auth.signOut();
          PackagingStorage.getInstance().clearCurrentUser();
          if (onAuthError) {
            onAuthError(
              `Access Denied: The Google account (${email}) is not registered. Please contact your factory administrator to be added.`
            );
          }
          return;
        }

        // DEACTIVATION CHECK:
        const isInactive = authorizedUser.preferences?.status === 'inactive' || authorizedUser.status === 'inactive';
        if (isInactive) {
          await supabase.auth.signOut();
          PackagingStorage.getInstance().clearCurrentUser();
          if (onAuthError) {
            onAuthError(`Account Suspended: Your account (${email}) has been deactivated by the administrator.`);
          }
          return;
        }

        // User is authorized! Construct active profile
        const activeProfile: UserProfile = {
          id: authorizedUser.id,
          companyId: authorizedUser.company_id || DEFAULT_COMPANY.id,
          companyName: DEFAULT_COMPANY.name,
          fullName: authorizedUser.full_name || u.user_metadata?.full_name || email.split('@')[0],
          designation: authorizedUser.designation || 'Production Personnel',
          email: authorizedUser.email || email,
          phone: authorizedUser.phone || '',
          role: (authorizedUser.role as UserRole) || 'supervisor',
          employeeId: authorizedUser.employee_id || 'EMP001',
          status: 'active',
          preferences: authorizedUser.preferences || { defaultShift: 'Day Shift', defaultLine: 'Line 1', weightUnit: 'g', status: 'active' },
          createdAt: authorizedUser.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        PackagingStorage.getInstance().setCurrentUser(activeProfile);
        onUserChanged(activeProfile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Admin-Only: Create New Factory User
   */
  public async adminCreateUser(payload: {
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    designation: string;
    employeeId: string;
    defaultShift: string;
    defaultLine: string;
    password?: string;
  }): Promise<{ user?: UserProfile; error?: string }> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const supabase = getSupabaseClient();

    // 1. Check if email already exists
    if (supabase) {
      const { data: existing } = await supabase.from('users').select('id').ilike('email', cleanEmail).maybeSingle();
      if (existing) {
        return { error: `A user with email "${cleanEmail}" already exists.` };
      }
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProfile: UserProfile = {
      id: userId,
      companyId: DEFAULT_COMPANY.id,
      companyName: DEFAULT_COMPANY.name,
      fullName: payload.fullName.trim(),
      designation: payload.designation,
      email: cleanEmail,
      phone: payload.phone.trim(),
      role: payload.role,
      employeeId: payload.employeeId.trim(),
      status: 'active',
      password: payload.password || 'Supervisor@2026',
      preferences: {
        defaultShift: payload.defaultShift,
        defaultLine: payload.defaultLine,
        weightUnit: 'g',
        status: 'active',
        password: payload.password || 'Supervisor@2026',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Supabase
    if (supabase) {
      try {
        const { error } = await supabase.from('users').insert({
          id: newProfile.id,
          company_id: newProfile.companyId,
          full_name: newProfile.fullName,
          designation: newProfile.designation,
          email: newProfile.email,
          phone: newProfile.phone,
          role: newProfile.role,
          employee_id: newProfile.employeeId,
          preferences: newProfile.preferences,
        });

        if (error) {
          console.warn('Supabase insert user error:', error);
          return { error: error.message };
        }

        // Also create in Supabase Auth if password provided
        if (payload.password) {
          try {
            await supabase.auth.signUp({
              email: cleanEmail,
              password: payload.password,
              options: {
                data: {
                  full_name: newProfile.fullName,
                  role: newProfile.role,
                },
              },
            });
          } catch {
            // ignore if requires email confirmation
          }
        }
      } catch (err: any) {
        return { error: err.message || 'Failed to save to cloud' };
      }
    }

    // Save locally
    const currentUsers = PackagingStorage.getInstance().getUsers();
    currentUsers.unshift(newProfile);
    PackagingStorage.getInstance().setCurrentUser(PackagingStorage.getInstance().getCurrentUser() || DEFAULT_ADMIN_USER);
    localStorage.setItem('pps_users_v2', JSON.stringify(currentUsers));

    return { user: newProfile };
  }

  /**
   * Admin-Only: Update User Details & Password & Status
   */
  public async adminUpdateUser(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<{ user?: UserProfile; error?: string }> {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const rowUpdates: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.fullName !== undefined) rowUpdates.full_name = updates.fullName;
        if (updates.designation !== undefined) rowUpdates.designation = updates.designation;
        if (updates.phone !== undefined) rowUpdates.phone = updates.phone;
        if (updates.role !== undefined) rowUpdates.role = updates.role;
        if (updates.employeeId !== undefined) rowUpdates.employee_id = updates.employeeId;
        if (updates.preferences !== undefined) rowUpdates.preferences = updates.preferences;

        const { error } = await supabase.from('users').update(rowUpdates).eq('id', userId);
        if (error) return { error: error.message };
      } catch (err: any) {
        return { error: err.message || 'Failed to update user in cloud.' };
      }
    }

    // Update locally
    const updated = PackagingStorage.getInstance().updateUser(userId, updates);
    return { user: updated || undefined };
  }

  /**
   * Admin-Only: Delete User
   */
  public async adminDeleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    PackagingStorage.getInstance().deleteUser(userId);
    return { success: true };
  }

  /**
   * Password Reset Flow
   */
  public async resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true, message: 'Password reset link simulated for ' + email };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/?reset=true` : undefined,
      });

      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Password reset email sent! Please check your inbox.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send reset email.' };
    }
  }

  /**
   * Sign Out
   */
  public async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    PackagingStorage.getInstance().clearCurrentUser();
  }
}

export const authService = AuthService.getInstance();
