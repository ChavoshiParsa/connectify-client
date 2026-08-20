import { disconnectSocket } from '@/lib/socket';
import { unsubscribePushLocally } from '@/lib/push-subscription';
import { PUBLIC_API_V1_URL } from '@/lib/public-api';
import { useAuthStore } from '@/stores/auth-store';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from './auth';

type Cfg = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

export const BACKEND_URL = PUBLIC_API_V1_URL;

export const authApi = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: BACKEND_URL,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  failedQueue = [];
};

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/validate', '/auth/refresh', '/auth/logout'];

api.interceptors.request.use((config: Cfg) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => {
    const error = err as AxiosError & { config: Cfg };
    const originalRequest = error.config;

    const status = error.response?.status;
    const url = originalRequest?.url || '';

    const isAuthEndpoint = AUTH_PATHS.some((p) => url.includes(p));
    if (status !== 401 || originalRequest._retry || isAuthEndpoint || originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(api(originalRequest)),
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const data = await authService.refresh();
      const { accessToken } = data;
      if (accessToken) {
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      processQueue();
      return api(originalRequest);
    } catch (refreshError) {
      const { reset } = useAuthStore.getState();

      processQueue(refreshError);
      disconnectSocket();
      void unsubscribePushLocally();
      reset();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
