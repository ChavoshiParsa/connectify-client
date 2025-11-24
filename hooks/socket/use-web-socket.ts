import { MESSAGES } from '@/constants/query-keys';
import { getSocket } from '@/lib/socket';
import { makeDmKey } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useTypingStore } from '@/stores/typing-store';
import {
  MessageDeletedData,
  MessageEditedData,
  MessageNewData,
  MessageSeenAllData,
  MessagesSeenData,
  TypingStartData,
  UserProfileUpdatedData,
  UserStatusData,
} from '@/types/socket-events';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useWebSocketEvents() {
  const queryClient = useQueryClient();
  const myPublicId = useAuthStore((state) => state.user?.publicId) as string;

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = async (data: MessageNewData) => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_MESSAGES, data.dmKey] });
    };

    const handleMessageEdited = async (data: MessageEditedData) => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_MESSAGES, data.dmKey] });
    };

    const handleMessageDeleted = (data: MessageDeletedData) => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_MESSAGES, data.dmKey] });
    };

    const handleMessagesSeen = (data: MessagesSeenData) => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_MESSAGES, data.dmKey] });
    };

    const handleMessageSeenAll = (data: MessageSeenAllData) => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_MESSAGES, data.dmKey] });
    };

    const handleSocketConnect = () => {
      console.log('✅ socket connected:', socket?.id);
    };

    const handleSocketError = (err: Error) => {
      console.error('❌ socket connect_error:', err.message, err);
    };

    const handleTypingStart = (data: TypingStartData) => {
      const dmKey = makeDmKey(myPublicId, data.userPublicId);
      useTypingStore.getState().startTyping(dmKey, data.userPublicId);
    };

    const handleUserStatus = (data: UserStatusData) => {
      const dmKey = makeDmKey(myPublicId, data.publicId);
      queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_DETAILS, dmKey] });
    };

    const handleUserProfileUpdated = (data: UserProfileUpdatedData) => {
      const dmKey = makeDmKey(myPublicId, data.publicId);
      queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_DETAILS, dmKey] });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleMessageEdited);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('messages:seen', handleMessagesSeen);
    socket.on('message:seen-all', handleMessageSeenAll);
    socket.on('typing:start', handleTypingStart);
    socket.on('user:status', handleUserStatus);
    socket.on('user:profile-updated', handleUserProfileUpdated);
    socket.on('connect', handleSocketConnect);
    socket.on('connect_error', handleSocketError);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleMessageEdited);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('messages:seen', handleMessagesSeen);
      socket.off('message:seen-all', handleMessageSeenAll);
      socket.off('typing:start', handleTypingStart);
      socket.off('user:status', handleUserStatus);
      socket.off('user:profile-updated', handleUserProfileUpdated);
      socket.off('connect', handleSocketConnect);
      socket.off('connect_error', handleSocketError);
    };
  }, [myPublicId, queryClient]);
}
