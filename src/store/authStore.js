import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAuthResolved: false,
      
      setAuth: (user, accessToken, refreshToken) => {
        // Write to localStorage FIRST to avoid race conditions
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Then update Zustand state (this triggers useEffects)
        set({ 
          user, 
          accessToken, 
          refreshToken, 
          isAuthenticated: true,
          isAuthResolved: true
        });
      },

      setAuthResolved: (isResolved) => {
        set({ isAuthResolved: isResolved });
      },
      
      updateUser: (user) => {
        set({ user });
        localStorage.setItem('user', JSON.stringify(user));
      },
      
      logout: () => {
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false,
          isAuthResolved: true
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      },
      
      checkAuth: () => {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && user) {
          set({ 
            accessToken: token,
            refreshToken: refreshToken,
            user: JSON.parse(user),
            isAuthenticated: true,
            isAuthResolved: true
          });
          return true;
        }
        // Even if no token, mark as resolved
        set({ isAuthResolved: true });
        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthResolved: state.isAuthResolved
      }),
    }
  )
);
