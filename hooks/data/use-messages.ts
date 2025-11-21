import { messagesService } from '@/api/messages';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  DeleteMessageResponse,
  EditMessageResponse,
  SeenAllMessagesResponse,
  SeenMessageResponse,
  SendMessageResponse,
  SetTypingResponse,
} from '@/types/messages';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

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

export function useSendMessage() {
  return useMutation<SendMessageResponse, unknown, { recipientPublicId: string; content: string }>({
    mutationFn: ({ recipientPublicId, content }) => messagesService.sendMessage(recipientPublicId, content),
  });
}

export function useSetTyping() {
  return useMutation<SetTypingResponse, unknown, { recipientPublicId: string }>({
    mutationFn: ({ recipientPublicId }) => messagesService.setTyping(recipientPublicId),
  });
}

export function useSeenMessage() {
  return useMutation<SeenMessageResponse, unknown, { messageId: string }>({
    mutationFn: ({ messageId }) => messagesService.seenMessage(messageId),
  });
}

export function useSeenMessages() {
  return useMutation<SeenMessageResponse, unknown, { messageIds: string[] }>({
    mutationFn: ({ messageIds }) => messagesService.seenMessages(messageIds),
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
