import { authApi } from '@/api/api-client';
import { disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth-store';
import { LoginResponse, RefreshResponse, RegisterResponse, ValidateResponse } from '@/types/auth';
import { unsubscribeCurrentPushSubscription } from './push-notifications';

export const authService = {
  validateEmailPass: async (email: string, password: string) => {
    const { data } = await authApi.post<ValidateResponse>('/auth/validate', { email, password });
    return data;
  },

  register: async (email: string, password: string, firstName: string, lastName?: string, avatarBase64?: string) => {
    const { deviceId, setDeviceIdOnce, setAuth } = useAuthStore.getState();
    const { data } = await authApi.post<RegisterResponse>('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      deviceId,
      avatarBase64,
    });
    const { accessToken, user, deviceId: newDeviceId } = data;
    setDeviceIdOnce(newDeviceId);
    setAuth({ accessToken, user });
    return data;
  },

  login: async (email: string, password: string) => {
    const { deviceId, setDeviceIdOnce, setAuth } = useAuthStore.getState();
    const { data } = await authApi.post<LoginResponse>('/auth/login', { email, password, deviceId });
    const { accessToken, user, deviceId: newDeviceId } = data;
    setDeviceIdOnce(newDeviceId);
    setAuth({ accessToken, user });
    return data;
  },

  refresh: async () => {
    const { setAuth, setDeviceIdOnce } = useAuthStore.getState();
    const { data } = await authApi.post<RefreshResponse>('/auth/refresh');
    const { accessToken, deviceId } = data;
    setAuth({ accessToken });
    setDeviceIdOnce(deviceId);
    return data;
  },

  logout: async () => {
    const { reset } = useAuthStore.getState();

    try {
      try {
        await unsubscribeCurrentPushSubscription();
      } catch {
        // Logging out must still succeed if the browser cannot remove its push subscription.
      }
      const { data } = await authApi.post<{ message: string }>('/auth/logout');
      return data;
    } finally {
      disconnectSocket();
      reset();
    }
  },
};
