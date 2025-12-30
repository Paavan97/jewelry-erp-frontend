import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import type { LoginCredentials, User } from '../api/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: !!localStorage.getItem('token'),
    retry: false,
    onError: () => {
      // If API call fails, token is invalid - clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      queryClient.setQueryData(['auth', 'me'], data.user);
      navigate('/dashboard');
    },
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.clear();
    navigate('/login');
  };

  const isAuthenticated = !!localStorage.getItem('token');

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout,
    isAuthenticated,
  };
};

