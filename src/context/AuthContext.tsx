import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, AuthContextType, RegisterData } from '../types/auth';
import { UserRole } from '../types/database';
import { authService } from '../services/supabase/authService';
import { MOCK_PROFILES } from '../services/supabase/mockData';
import { isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setRole(currentUser.profile.role);
          setIsGuest(false);
        } else {
          const savedRole = (localStorage.getItem('campusvoice_demo_role') as UserRole) || 'student';
          const isSavedGuest = localStorage.getItem('campusvoice_is_guest') === 'true';
          const defaultProfile = MOCK_PROFILES[savedRole] || MOCK_PROFILES.student;

          setUser({
            id: isSavedGuest ? 'guest-anon' : defaultProfile.id,
            email: isSavedGuest ? 'guest@anonymous.local' : defaultProfile.email,
            profile: isSavedGuest ? MOCK_PROFILES.guest_student : defaultProfile,
            isGuest: isSavedGuest,
          });
          setRole(isSavedGuest ? 'student' : defaultProfile.role);
          setIsGuest(isSavedGuest);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string, preferredRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (preferredRole && MOCK_PROFILES[preferredRole]) {
        const p = MOCK_PROFILES[preferredRole];
        setUser({
          id: p.id,
          email: p.email,
          profile: p,
          isGuest: false,
        });
        setRole(p.role);
        setIsGuest(false);
        localStorage.setItem('campusvoice_demo_role', p.role);
        localStorage.removeItem('campusvoice_is_guest');
        showToast('Login Successful', 'Welcome, ' + p.name + '!', 'success');
        return true;
      }

      const res = await authService.login(email, password);
      if (res.user) {
        setUser(res.user);
        setRole(res.user.profile.role);
        setIsGuest(false);
        localStorage.setItem('campusvoice_demo_role', res.user.profile.role);
        localStorage.removeItem('campusvoice_is_guest');
        showToast('Logged in successfully', 'Welcome back, ' + res.user.profile.name + '!', 'success');
        return true;
      } else {
        const matched = Object.values(MOCK_PROFILES).find((p) => p.email.toLowerCase() === email.toLowerCase());
        if (matched) {
          setUser({
            id: matched.id,
            email: matched.email,
            profile: matched,
            isGuest: false,
          });
          setRole(matched.role);
          setIsGuest(false);
          localStorage.setItem('campusvoice_demo_role', matched.role);
          localStorage.removeItem('campusvoice_is_guest');
          showToast('Logged in successfully', 'Welcome, ' + matched.name + '!', 'success');
          return true;
        }

        showToast('Authentication failed', res.error || 'Please check your credentials', 'error');
        return false;
      }
    } catch {
      showToast('Error', 'An unexpected error occurred during login', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = () => {
    const guestProfile = MOCK_PROFILES.guest_student;
    setUser({
      id: 'u-guest-anon',
      email: guestProfile.email,
      profile: guestProfile,
      isGuest: true,
    });
    setRole('student');
    setIsGuest(true);
    localStorage.setItem('campusvoice_is_guest', 'true');
    localStorage.setItem('campusvoice_demo_role', 'student');
    showToast('Anonymous Student Mode', 'You are browsing anonymously with zero login requirement.', 'info');
  };

  const signup = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.signup(data);
      if (res.success) {
        showToast('Registration complete', 'Your student account is ready. Please log in.', 'success');
        return true;
      } else {
        showToast('Registration failed', res.error || 'Could not complete registration', 'error');
        return false;
      }
    } catch {
      showToast('Error', 'An unexpected error occurred during registration', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    const studentProfile = MOCK_PROFILES.student;
    setUser({
      id: studentProfile.id,
      email: studentProfile.email,
      profile: studentProfile,
      isGuest: false,
    });
    setRole('student');
    setIsGuest(false);
    localStorage.removeItem('campusvoice_is_guest');
    localStorage.setItem('campusvoice_demo_role', 'student');
    showToast('Signed out', 'You have been safely signed out.', 'info');
  };

  const switchDemoRole = (newRole: UserRole) => {
    const p = MOCK_PROFILES[newRole] || MOCK_PROFILES.student;
    localStorage.setItem('campusvoice_demo_role', newRole);
    localStorage.removeItem('campusvoice_is_guest');
    setIsGuest(false);
    setRole(newRole === 'guest_student' ? 'student' : newRole);
    if (newRole === 'guest_student') {
      setIsGuest(true);
      localStorage.setItem('campusvoice_is_guest', 'true');
    }
    setUser({
      id: p.id,
      email: p.email,
      profile: p,
      isGuest: newRole === 'guest_student',
    });
    showToast('Switched Role: ' + newRole.toUpperCase(), 'Now previewing as ' + p.name + ' (' + p.role + ')', 'info');
  };

  const toggleDemoMode = (enable?: boolean) => {
    const next = enable !== undefined ? enable : !isDemoMode;
    setIsDemoMode(next);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        isDemoMode,
        login,
        signup,
        continueAsGuest,
        logout,
        switchDemoRole,
        toggleDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
