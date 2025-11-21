import { QUERY_KEYS } from '@/constants/query-keys';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth-store';
import {
  MessageDeletedData,
  MessageEditedData,
  MessageNewData,
  MessageSeenAllData,
  MessagesSeenData,
} from '@/types/socket-events';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useWebSocketEvents() {
  const queryClient = useQueryClient();
  const myPublicId = useAuthStore((state) => state.user?.publicId);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = async (data: MessageNewData) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOM_MESSAGES, data.dmKey] });
    };

    const handleMessageEdited = async (data: MessageEditedData) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOM_MESSAGES, data.dmKey] });
    };

    const handleMessageDeleted = (data: MessageDeletedData) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOM_MESSAGES, data.dmKey] });
    };

    const handleMessagesSeen = (data: MessagesSeenData) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOM_MESSAGES, data.dmKey] });
    };

    const handleMessageSeenAll = (data: MessageSeenAllData) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOM_MESSAGES, data.dmKey] });
    };

    const handleSocketConnect = () => {
      console.log('✅ socket connected:', socket?.id);
    };

    const handleSocketError = (err: Error) => {
      console.error('❌ socket connect_error:', err.message, err);
    };

    // const handleTypingStart = (data: TypingStartData) => { ... };
    // const handleUserStatus = (data: UserStatusData) => { ... };
    // const handleUserProfileUpdated = (data: UserProfileUpdatedData) => { ... };

    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleMessageEdited);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('messages:seen', handleMessagesSeen);
    socket.on('message:seen-all', handleMessageSeenAll);
    // socket.on('typing:start', handleTypingStart);
    // socket.on('user:status', handleUserStatus);
    // socket.on('user:profile-updated', handleUserProfileUpdated);
    socket.on('connect', handleSocketConnect);
    socket.on('connect_error', handleSocketError);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleMessageEdited);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('messages:seen', handleMessagesSeen);
      socket.off('message:seen-all', handleMessageSeenAll);
      // socket.off('typing:start', handleTypingStart);
      // socket.off('user:status', handleUserStatus);
      // socket.off('user:profile-updated', handleUserProfileUpdated);
      socket.off('connect', handleSocketConnect);
      socket.off('connect_error', handleSocketError);
    };
  }, [myPublicId, queryClient]);

  // return { loading, error };
}
