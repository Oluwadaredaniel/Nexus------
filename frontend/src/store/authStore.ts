
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User { _id: string; regNo: string; name: string; role: string; department?: string; isPasswordChanged?: boolean; }
interface AuthState {
  user: User | null; token: string | null;
  setCredentials: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null, token: null,
    setCredentials: (user, token) => set({ user, token }),
    logout: () => set({ user: null, token: null }),
    updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  }),
  { name: 'nexus-auth' }
));
