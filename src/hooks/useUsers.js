import useAuthStore from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';


const User_API = '/api/users';

// ✅ Fetch all users
export const useGetUsers = () => {
  const token = useAuthStore((state) => state.token);
  const { role } = useAuthStore((state) => state.user || {});
  
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axios.get(`${User_API}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    enabled: !!token && (role === 'admin' || role === 'manager'),
  });
};



// ✅ Get user profile
export const useGetUserProfile = (id, token) => 
  useQuery({
    queryKey: ['user', id],
    queryFn: async () => 
      (await axios.get(`${User_API}/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })).data
  });
  

// ✅ Update user
export const useUpdateUser = (id) => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (data) =>
      axios.put(`${User_API}/update/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    }
  });
};

// ✅ Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (id) =>
      axios.delete(`${User_API}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};