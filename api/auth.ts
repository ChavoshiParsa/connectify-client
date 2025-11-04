import { api, authApi } from '@/api/api-client';
import { useAuthStore } from '@/stores/auth-store';

export const validateEmailPass = async (email: string, password: string) => {
  const response = await authApi.post('/auth/validate', { email, password });
  return response;
};

export const register = async (email: string, password: string, firstName: string, lastName?: string) => {
  const { deviceId, setDeviceIdOnce, setAuth } = useAuthStore.getState();
  const response = await authApi.post('/auth/register', { firstName, lastName, email, password, deviceId });
  const { accessToken, user, deviceId: newDeviceId } = response.data;
  setDeviceIdOnce(newDeviceId);
  setAuth({ accessToken, user });
  return response;
};

export const login = async (email: string, password: string) => {
  const { deviceId, setDeviceIdOnce, setAuth } = useAuthStore.getState();
  const response = await authApi.post('/auth/login', { email, password, deviceId });
  const { accessToken, user, deviceId: newDeviceId } = response.data;
  setDeviceIdOnce(newDeviceId);
  setAuth({ accessToken, user });
  return response;
};

export const refresh = async () => {
  const { setAuth, setDeviceIdOnce } = useAuthStore.getState();
  const response = await authApi.post('/auth/refresh');
  const { accessToken, deviceId } = response.data;

  setAuth({ accessToken });
  setDeviceIdOnce(deviceId);

  return response;
};

export const logout = async () => {
  const { reset } = useAuthStore.getState();
  const response = await api.post('/auth/logout');
  reset();
  return response;
};
