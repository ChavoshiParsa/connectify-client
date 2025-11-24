import { usersService } from '@/api/users';
import { USERS } from '@/constants/query-keys';
import { useQuery } from '@tanstack/react-query';

export function useMe() {
  return useQuery({
    queryKey: [USERS.ME],
    queryFn: () => usersService.getMe(),
  });
}

export function useTotalUnreadCount() {
  return useQuery({
    queryKey: [USERS.TOTAL_UNREAD_COUNT],
    queryFn: () => usersService.getTotalUnreadCount(),
  });
}

export function useSearchUsers(q: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [USERS.SEARCH_USERS, q],
    queryFn: () => usersService.searchUsers(q),
    enabled: !!q && enabled,
  });
}
