import { messagesService } from '@/api/messages';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import {
  DeleteMessageResponse,
  EditMessageResponse,
  MyRoomsResponse,
  RoomMessageItem,
  RoomMessagesResponse,
  SeenAllMessagesResponse,
  SeenMessageResponse,
  SendMessageResponse,
  SetTypingResponse,
} from '@/types/messages';
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMyRooms() {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_ROOMS],
    queryFn: () => messagesService.getMyRooms(),
  });
}

export function useRoomDetails(dmKey: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.ROOM_DETAILS, dmKey],
    queryFn: () => messagesService.getRoomDetails(dmKey),
    enabled: !!dmKey && enabled,
  });
}

export function useRoomMessages(dmKey?: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.ROOM_MESSAGES, dmKey],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      messagesService.getRoomMessages(dmKey as string, pageParam),
    enabled: !!dmKey && enabled,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useMessageDetails(messageId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.MESSAGE_DETAILS, messageId],
    queryFn: () => messagesService.getMessageDetails(messageId),
    enabled: !!messageId && enabled,
  });
}

type SendMessageVariables = {
  dmKey: string;
  recipientPublicId: string;
  content: string;
};

type SendMessageContext = {
  tempId: string;
};

export function useSendMessage() {
  const queryClient = useQueryClient();
  const me = useAuthStore((state) => state.user);

  return useMutation<SendMessageResponse, unknown, SendMessageVariables, SendMessageContext>({
    mutationFn: ({ recipientPublicId, content }) => messagesService.sendMessage(recipientPublicId, content),

    async onMutate(variables) {
      const { dmKey, content } = variables;

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const now = new Date();

      const optimisticMessage: RoomMessageItem = {
        id: tempId,
        createdAt: now,
        content,
        editedAt: null,
        sender: me!,
        receipts: [
          {
            deliveredAt: now,
            readAt: null,
          },
        ],
        isPending: true,
        isError: false,
      };

      queryClient.setQueryData<InfiniteData<RoomMessagesResponse>>([QUERY_KEYS.ROOM_MESSAGES, dmKey], (old) => {
        if (!old) return old;

        const newPages = old.pages.map((page, index) =>
          index === 0
            ? {
                ...page,
                messages: [optimisticMessage, ...page.messages],
              }
            : page,
        );

        return { ...old, pages: newPages };
      });

      return { tempId };
    },

    async onSuccess(data, variables, context) {
      const { dmKey } = variables;
      const tempId = context?.tempId;

      const me = useAuthStore.getState().user;

      const { ...sender } = me!;

      const { messageId, createdAt: createdAtStr, content } = data;
      const createdAt = new Date(createdAtStr);

      const newMessageWithReceipts: RoomMessageItem = {
        id: messageId,
        createdAt,
        content: content,
        editedAt: null,
        sender: sender,
        receipts: [
          {
            deliveredAt: createdAt,
            readAt: null,
          },
        ],
      };

      queryClient.setQueryData<InfiniteData<RoomMessagesResponse>>([QUERY_KEYS.ROOM_MESSAGES, dmKey], (old) => {
        if (!old) return old;

        const newPages = old.pages.map((page, index) => {
          if (index !== 0) return page;

          const withoutTemp = page.messages.filter((msg) => msg.id !== tempId);

          return {
            ...page,
            messages: [newMessageWithReceipts, ...withoutTemp],
          };
        });

        return { ...old, pages: newPages };
      });

      queryClient.setQueryData<MyRoomsResponse>([QUERY_KEYS.MY_ROOMS], (oldRooms) => {
        if (!oldRooms) return oldRooms;

        let roomExists = false;

        const updatedRooms = oldRooms.map((room) => {
          if (room.dmKey !== dmKey) return room;
          roomExists = true;

          return {
            ...room,
            lastMessage: {
              id: messageId,
              createdAt,
              content,
              editedAt: null,
              sender: {
                firstName: sender.firstName,
                lastName: sender.lastName ?? null,
              },
              receipts: [{ readAt: null }],
            },
            updatedAt: new Date(),
          };
        });

        if (!roomExists) {
          return oldRooms;
        }

        return updatedRooms;
      });
    },

    onError(error, variables, context) {
      const { dmKey } = variables;
      const tempId = context?.tempId;

      if (!tempId) return;

      queryClient.setQueryData<InfiniteData<RoomMessagesResponse>>([QUERY_KEYS.ROOM_MESSAGES, dmKey], (old) => {
        if (!old) return old;

        const newPages = old.pages.map((page) => ({
          ...page,
          messages: page.messages.map((msg) => (msg.id === tempId ? { ...msg, isPending: false, isError: true } : msg)),
        }));

        return { ...old, pages: newPages };
      });
    },
  });
}

export function useSetTyping() {
  return useMutation<SetTypingResponse, unknown, { recipientPublicId: string }>({
    mutationFn: ({ recipientPublicId }) => messagesService.setTyping(recipientPublicId),
  });
}

export function useSeenMessage() {
  return useMutation<SeenMessageResponse, unknown, { messageId: string; dmKey: string }>({
    mutationFn: ({ messageId }) => messagesService.seenMessage(messageId),
  });
}

export function useSeenAllMessages() {
  return useMutation<SeenAllMessagesResponse, unknown, { dmKey: string }>({
    mutationFn: ({ dmKey }) => messagesService.seenAllMessages(dmKey),
  });
}

export function useEditMessage() {
  return useMutation<EditMessageResponse, unknown, { messageId: string; content: string; dmKey: string }>({
    mutationFn: ({ messageId, content }) => messagesService.editMessage(messageId, content),
  });
}

export function useDeleteMessage() {
  return useMutation<DeleteMessageResponse, unknown, { messageId: string; dmKey: string }>({
    mutationFn: ({ messageId }) => messagesService.deleteMessage(messageId),
  });
}
