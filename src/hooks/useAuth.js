import useAuthStore from '@/store/authStore';
import {  useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const Auth_API = '/api/auth';

// Register a new user
export const useRegisterUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (userData) => axios.post(`${Auth_API}/register`, userData),
      onSuccess: (res) => {
        const data = res.data;
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    });
  };
  
  // Login user
  export const useLoginUser = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const setToken = useAuthStore((state) => state.setToken);
    
    return useMutation({
      mutationFn: (userData) => axios.post(`${Auth_API}/login`, userData),
      onSuccess: (res) => {
        const data = res.data;
        // console.log("Login res data:", data);
        // console.log("Login res data user:", data.user);
        // console.log("Login res data token:", data.token);
        setUser(data.user);
        setToken(data.token);
      }
    });
  };
  
  // Logout user
  export const useLogoutUser = () => {
    const logout = useAuthStore((state) => state.logout);
    const token = useAuthStore((state) => state.token);

    return useMutation({
      mutationFn: () =>
        axios.post(
          `${Auth_API}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      onSuccess: () => {
        logout();
      },
    });
  };