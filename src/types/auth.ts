import { Profile, UserRole } from './database';

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
  isGuest?: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  department?: string;
  year?: string;
  hostel_resident: boolean;
  hostel_block?: string;
  room_number?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string, preferredRole?: UserRole) => Promise<boolean>;
  signup: (data: RegisterData) => Promise<boolean>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  toggleDemoMode: (enable?: boolean) => void;
}
