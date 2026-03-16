import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

export function useAuth() {
  const { firebaseUser, mongoUser, isAdmin, loading, setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          // Set cookie for middleware
          document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Strict`;
          // Sync with MongoDB
          const response = await axios.post(
            '/api/auth/sync',
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          setUser(user, response.data.user);
        } catch (error) {
          console.error('Error syncing user:', error);
          setUser(user, null); // Still set firebase user even if sync fails
        }
      } else {
        clearUser();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, clearUser, setLoading]);

  const logout = async () => {
    try {
      await signOut(auth);
      document.cookie = `firebaseToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      clearUser();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    firebaseUser,
    mongoUser,
    isAdmin,
    loading,
    logout,
  };
}
