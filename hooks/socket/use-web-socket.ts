import { MESSAGES } from '@/constants/query-keys';
import { connectSocket, disconnectSocket } from '@/lib/socket';
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

function isDev() {
  return process.env.NODE_ENV !== 'production';
}

export function useWebSocketEvents() {
  const queryClient = useQueryClient();

  const accessToken = useAuthStore((state) => state.accessToken);
  const myPublicId = useAuthStore((state) => state.user?.publicId);

  useEffect(() => {
    if (!accessToken || !myPublicId) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(accessToken);

    const invalidateRoom = (dmKey: string) => {
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_MESSAGES, dmKey] });
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_DETAILS, dmKey] });
    };

    const handleNewMessage = (data: MessageNewData) => {
      invalidateRoom(data.dmKey);
    };

    const handleMessageEdited = (data: MessageEditedData) => {
      invalidateRoom(data.dmKey);
    };

    const handleMessageDeleted = (data: MessageDeletedData) => {
      invalidateRoom(data.dmKey);
    };

    const handleMessagesSeen = (data: MessagesSeenData) => {
      invalidateRoom(data.dmKey);
    };

    const handleMessageSeenAll = (data: MessageSeenAllData) => {
      invalidateRoom(data.dmKey);
    };

    const handleTypingStart = (data: TypingStartData) => {
      if (data.userPublicId === myPublicId) {
        return;
      }

      const dmKey = data.dmKey || makeDmKey(myPublicId, data.userPublicId);
      useTypingStore.getState().startTyping(dmKey, data.userPublicId);
    };

    const handleUserStatus = (data: UserStatusData) => {
      if (data.publicId === myPublicId) {
        return;
      }

      const dmKey = makeDmKey(myPublicId, data.publicId);

      void queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_DETAILS, dmKey] });
    };

    const handleUserProfileUpdated = (data: UserProfileUpdatedData) => {
      if (data.publicId === myPublicId) {
        return;
      }

      const dmKey = makeDmKey(myPublicId, data.publicId);

      void queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_DETAILS, dmKey] });
    };

    const handleSocketConnect = () => {
      if (isDev()) {
        console.info('socket connected:', socket.id);
      }
    };

    const handleSocketError = (err: Error) => {
      if (isDev()) {
        console.error('socket connect_error:', err.message, err);
      }
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
  }, [accessToken, myPublicId, queryClient]);
}
