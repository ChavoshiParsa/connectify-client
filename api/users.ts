import { api } from '@/api/api-client';
import { useAuthStore } from '@/stores/auth-store';

export const getMe = async () => {
  const { setAuth } = useAuthStore.getState();
  const response = await api.get('/users/me');
  setAuth({ user: response.data });
  return response;
};
