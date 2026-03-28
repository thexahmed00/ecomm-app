import { useEffect, useRef } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

export function useAuth() {
  const { firebaseUser, mongoUser, isAdmin, loading, setUser, clearUser, setLoading } = useAuthStore();
  const lastSyncedUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax${secure}`;

          if (lastSyncedUidRef.current !== user.uid) {
            const response = await axios.post(
              '/api/auth/sync',
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            lastSyncedUidRef.current = user.uid;
            setUser(user, response.data.user);
          } else {
            setUser(user, mongoUser);
          }
        } catch (error) {
          console.error('Error syncing user:', error);
          lastSyncedUidRef.current = user.uid;
          setUser(user, null); // Still set firebase user even if sync fails
        }
      } else {
        lastSyncedUidRef.current = null;
        clearUser();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, clearUser, setLoading, mongoUser]);

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
