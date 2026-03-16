import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import type { MongoUser } from '@/types';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  mongoUser: MongoUser | null;
  isAdmin: boolean;
  loading: boolean;
  setUser: (firebaseUser: FirebaseUser | null, mongoUser: MongoUser | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  mongoUser: null,
  isAdmin: false,
  loading: true,
  setUser: (firebaseUser, mongoUser) => 
    set({ 
      firebaseUser, 
      mongoUser, 
      isAdmin: mongoUser?.role === 'admin' 
    }),
  clearUser: () => set({ firebaseUser: null, mongoUser: null, isAdmin: false }),
  setLoading: (loading) => set({ loading }),
}));
