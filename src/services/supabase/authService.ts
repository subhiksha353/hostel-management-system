import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AuthUser, RegisterData } from '../../types/auth';
import { Profile, UserRole } from '../../types/database';
import { MOCK_PROFILES } from './mockData';

class AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) {
      // Local fallback state
      const savedRole = (localStorage.getItem('campusvoice_demo_role') as UserRole) || 'student';
      const profile = MOCK_PROFILES[savedRole] || MOCK_PROFILES.student;
      return {
        id: profile.id,
        email: profile.email,
        profile,
      };
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const userProfile: Profile = profile || {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'Campus Student',
        role: (user.user_metadata?.role as UserRole) || 'student',
        hostel_resident: true,
        created_at: new Date().toISOString(),
      };

      return {
        id: user.id,
        email: user.email || '',
        profile: userProfile,
      };
    } catch {
      return null;
    }
  }

  async login(email: string, password?: string): Promise<{ user: AuthUser | null; error?: string }> {
    if (!isSupabaseConfigured) {
      let role: UserRole = 'student';
      if (email.includes('warden')) role = 'warden';
      else if (email.includes('it') || email.includes('maintenance') || email.includes('staff')) role = 'department_staff';
      else if (email.includes('admin')) role = 'admin';
      else if (email.includes('super') || email.includes('dean')) role = 'super_admin';

      localStorage.setItem('campusvoice_demo_role', role);
      const profile = MOCK_PROFILES[role];
      return {
        user: {
          id: profile.id,
          email,
          profile,
        },
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'CampusVoice@2026',
      });
      if (error) return { user: null, error: error.message };

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        user: {
          id: data.user.id,
          email: data.user.email || email,
          profile: profile || {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || 'Student',
            role: 'student',
            hostel_resident: true,
            created_at: new Date().toISOString(),
          },
        },
      };
    } catch (err: any) {
      return { user: null, error: err.message || 'Login failed' };
    }
  }

  async signup(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      localStorage.setItem('campusvoice_demo_role', 'student');
      return { success: true };
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password || 'CampusVoice@2026',
        options: {
          data: {
            name: data.name,
            role: 'student',
            department: data.department,
            year: data.year,
            hostel_block: data.hostel_block,
          },
        },
      });
      if (error) return { success: false, error: error.message };

      if (authData.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: 'student',
          year: data.year,
          hostel_resident: data.hostel_resident,
          hostel_block: data.hostel_block,
          room_number: data.room_number,
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  }

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    localStorage.removeItem('campusvoice_demo_role');
  }
}

export const authService = new AuthService();
export default authService;
