import { useAuthStore } from '@/stores/auth-store';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refresh } from './auth';

type Cfg = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  failedQueue = [];
};

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/validate', '/auth/refresh'];

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
      await refresh();
      processQueue();
      return api(originalRequest);
    } catch (refreshError) {
      const { reset } = useAuthStore.getState();

      processQueue(refreshError);
      reset();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
