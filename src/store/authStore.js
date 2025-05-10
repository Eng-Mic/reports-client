import { create } from 'zustand';
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
        
            setUser: (user) => set({ user, isAuthenticated: true }),
            setToken: (token) => set({ token }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
          name: 'user-storage', // key in localStorage
        }
    )
);

export default useAuthStore;
