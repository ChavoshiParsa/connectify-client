import { api } from '@/api/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { User, UsersSearchResponse } from '@/types/users';

export const usersService = {
  getMe: async () => {
    const { setAuth } = useAuthStore.getState();
    const { data, statusText } = await api.get<User>('/users/me');
    setAuth({ user: data });
    return { data, statusText };
  },

  getTotalUnreadCount: async () => {
    const { data } = await api.get<{ unreadCount: number }>('/users/me/unread-count');
    return data;
  },

  searchUsers: async (q: string) => {
    const { data } = await api.get<UsersSearchResponse>('/users/search', { params: { q } });
    return data;
  },

  updateAvatar: async (avatar: File) => {
    const formData = new FormData();
    formData.append('avatar', avatar);

    const { data } = await api.patch<{ result: User }>('/profile/update-avatar', formData);
    useAuthStore.getState().setAuth({ user: data.result });
    return data.result;
  },

  updateProfile: async (profile: {
    firstName: string;
    lastName: string | null;
    username: string;
    biography: string | null;
  }) => {
    const { data } = await api.patch<{ result: User }>('/profile/update-profile', profile);
    useAuthStore.getState().setAuth({ user: data.result });
    return data.result;
  },

  checkUsername: async (username: string) => {
    const { data } = await api.get<{ isAvailable: boolean }>('/profile/check-username', { params: { username } });
    return data.isAvailable;
  },
};
