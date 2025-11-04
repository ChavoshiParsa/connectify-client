import { User } from '@/types/user';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type State = {
  accessToken: string | null;
  user: User | null;
  deviceId: string | null;
  isAuthenticated: boolean;
};

type Actions = {
  setAuth: (patch: Partial<Pick<State, 'accessToken' | 'user'>>) => void;
  setDeviceIdOnce: (deviceId: string) => void;
  reset: () => void;
};

const initialState: State = {
  accessToken: null,
  user: null,
  deviceId: null,
  isAuthenticated: false,
};

export const useAuthStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (patch) =>
        set((s) => {
          const next = { ...s, ...patch };
          return { ...next, isAuthenticated: Boolean(next.accessToken && next.user) };
        }),
      setDeviceIdOnce: (deviceId) => set((s) => (s.deviceId ? s : { ...s, deviceId })),
      reset: () =>
        set((s) => ({
          ...s,
          accessToken: null,
          user: null,
          isAuthenticated: false,
        })),
    }),
    {
      name: 'device-id',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ deviceId: s.deviceId }),
    },
  ),
);
