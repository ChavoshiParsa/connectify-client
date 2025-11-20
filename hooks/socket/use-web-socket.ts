import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { messagesService } from '@/api/messages';
import { QUERY_KEYS } from '@/constants/query-keys';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth-store';
import { MyRoomsResponse, RoomMessageItem, RoomMessagesResponse } from '@/types/messages';
import {
  MessageDeletedData,
  MessageEditedData,
  MessageNewData,
  MessageSeenAllData,
  MessageSeenData,
} from '@/types/socket-events';

export function useWebSocketEvents() {
  const queryClient = useQueryClient();
  const myPublicId = useAuthStore((state) => state.user?.publicId);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = async (data: MessageNewData) => {
      const { messageId, dmKey, senderPublicId } = data;
      const createdAt = new Date(data.createdAt);
      const isFromMe = myPublicId != null && senderPublicId === myPublicId;

      if (isFromMe) {
        const existingMessages = queryClient.getQueryData<InfiniteData<RoomMessagesResponse>>([
          QUERY_KEYS.ROOM_MESSAGES,
          dmKey,
        ]);

        const alreadyExists =
          existingMessages?.pages.some((page) => page.messages.some((msg) => msg.id === messageId)) ?? false;

        if (alreadyExists) {
          return;
        }
      }

      const newMessage = await messagesService.getMessageDetails(messageId);

      const newMessageWithReceipts: RoomMessageItem = {
        id: newMessage.id,
        createdAt: newMessage.createdAt,
        content: newMessage.content,
        editedAt: newMessage.editedAt ?? null,
        sender: newMessage.sender,
        receipts: [
          {
            deliveredAt: createdAt,
            readAt: null,
          },
        ],
      };

      queryClient.setQueryData<InfiniteData<RoomMessagesResponse>>([QUERY_KEYS.ROOM_MESSAGES, dmKey], (oldData) => {
        if (!oldData) return oldData;

        const alreadyExists = oldData.pages.some((page) => page.messages.some((msg) => msg.id === messageId));
        if (alreadyExists) return oldData;

        const newPages = oldData.pages.map((page, index) =>
          index === 0
            ? {
                ...page,
                messages: [newMessageWithReceipts, ...page.messages],
              }
            : page,
        );

        return { ...oldData, pages: newPages };
      });

      let shouldRefetchMyRooms = false;

      queryClient.setQueryData<MyRoomsResponse>([QUERY_KEYS.MY_ROOMS], (oldData) => {
        if (!oldData) return oldData;

        const roomExists = oldData.some((room) => room.dmKey === dmKey);
        if (!roomExists) {
          shouldRefetchMyRooms = true;
          return oldData;
        }

        return oldData.map((room) => {
          if (room.dmKey !== dmKey) return room;

          return {
            ...room,
            lastMessage: {
              id: newMessage.id,
              createdAt: newMessage.createdAt,
              content: newMessage.content,
              editedAt: newMessage.editedAt ?? null,
              sender: {
                firstName: newMessage.sender.firstName,
                lastName: newMessage.sender.lastName ?? null,
              },
              receipts: [{ readAt: null }],
            },
            unreadCount: isFromMe ? room.unreadCount : room.unreadCount + 1,
            updatedAt: new Date(),
          };
        });
      });

      if (shouldRefetchMyRooms) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_ROOMS] });
      }
    };

    const handleMessageEdited = async (data: MessageEditedData) => {
      const { messageId, dmKey } = data;
      const editedAt = new Date(data.editedAt);

      const updatedMessage = await messagesService.getMessageDetails(messageId);

      queryClient.setQueryData<InfiniteData<RoomMessagesResponse>>([QUERY_KEYS.ROOM_MESSAGES, dmKey], (oldData) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content: updatedMessage.content, editedAt } : msg,
          ),
        }));

        return { ...oldData, pages: newPages };
      });

      queryClient.setQueryData<MyRoomsResponse>([QUERY_KEYS.MY_ROOMS], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((room) => {
          if (room.dmKey === dmKey && room.lastMessage?.id === messageId) {
            return {
              ...room,
              lastMessage: {
                ...room.lastMessage,
                content: updatedMessage.content,
                editedAt,
              },
              updatedAt: new Date(),
            };
          }
          return room;
        });
      });
    };

    const handleMessageDeleted = (data: MessageDeletedData) => {
      const { messageId, dmKey } = data;

      queryClient.setQueryData<InfiniteData<RoomMessagesResponse>>([QUERY_KEYS.ROOM_MESSAGES, dmKey], (oldData) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.filter((msg) => msg.id !== messageId),
        }));

        return { ...oldData, pages: newPages };
      });

      const myRooms = queryClient.getQueryData<MyRoomsResponse>([QUERY_KEYS.MY_ROOMS]);

      if (myRooms?.some((room) => room.dmKey === dmKey && room.lastMessage?.id === messageId)) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_ROOMS] });
      }
    };

    const handleMessageSeen = (data: MessageSeenData) => {
      const { messageId, dmKey, readAt: readAtStr } = data;
      const readAt = new Date(readAtStr);

      queryClient.setQueryData<InfiniteData<RoomMessagesResponse>>([QUERY_KEYS.ROOM_MESSAGES, dmKey], (oldData) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  receipts: msg.receipts.map((receipt) => ({
                    ...receipt,
                    readAt,
                  })),
                }
              : msg,
          ),
        }));

        return { ...oldData, pages: newPages };
      });

      const myRooms = queryClient.getQueryData<MyRoomsResponse>([QUERY_KEYS.MY_ROOMS]);

      if (myRooms?.some((room) => room.dmKey === dmKey && room.lastMessage?.id === messageId)) {
        queryClient.setQueryData<MyRoomsResponse>([QUERY_KEYS.MY_ROOMS], (old) => {
          if (!old) return old;

          return old.map((room) => {
            if (room.dmKey === dmKey && room.lastMessage?.id === messageId) {
              return {
                ...room,
                lastMessage: room.lastMessage && {
                  ...room.lastMessage,
                  receipts: room.lastMessage.receipts.map((r) => ({
                    ...r,
                    readAt,
                  })),
                },
                updatedAt: new Date(),
              };
            }
            return room;
          });
        });
      }
    };

    const handleMessageSeenAll = (data: MessageSeenAllData) => {
      const { dmKey, readAt: readAtStr, seenAllByPublicId } = data;
      const readAt = new Date(readAtStr);
      const isMe = myPublicId != null && myPublicId === seenAllByPublicId;

      queryClient.setQueryData<InfiniteData<RoomMessagesResponse>>([QUERY_KEYS.ROOM_MESSAGES, dmKey], (oldData) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.map((msg) => ({
            ...msg,
            receipts: msg.receipts.map((receipt) => ({
              ...receipt,
              readAt: receipt.readAt || readAt,
            })),
          })),
        }));

        return { ...oldData, pages: newPages };
      });

      queryClient.setQueryData<MyRoomsResponse>([QUERY_KEYS.MY_ROOMS], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((room) =>
          room.dmKey === dmKey
            ? {
                ...room,
                unreadCount: isMe ? 0 : room.unreadCount,
                lastMessage: room.lastMessage && {
                  ...room.lastMessage,
                  receipts: room.lastMessage.receipts.map((r) => ({
                    ...r,
                    readAt,
                  })),
                },
                updatedAt: new Date(),
              }
            : room,
        );
      });
    };

    // const handleTypingStart = (data: TypingStartData) => { ... };
    // const handleUserStatus = (data: UserStatusData) => { ... };
    // const handleUserProfileUpdated = (data: UserProfileUpdatedData) => { ... };

    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleMessageEdited);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('message:seen', handleMessageSeen);
    socket.on('message:seen-all', handleMessageSeenAll);
    // socket.on('typing:start', handleTypingStart);
    // socket.on('user:status', handleUserStatus);
    // socket.on('user:profile-updated', handleUserProfileUpdated);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleMessageEdited);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('message:seen', handleMessageSeen);
      socket.off('message:seen-all', handleMessageSeenAll);
      // socket.off('typing:start', handleTypingStart);
      // socket.off('user:status', handleUserStatus);
      // socket.off('user:profile-updated', handleUserProfileUpdated);
    };
  }, [queryClient, myPublicId]);
}
