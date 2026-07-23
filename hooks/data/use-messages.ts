import { messagesService } from '@/api/messages';
import { MESSAGES } from '@/constants/query-keys';
import {
  DeleteMessageResponse,
  EditMessageResponse,
  SeenAllMessagesResponse,
  SeenMessageResponse,
  SendMessageResponse,
  SetTypingResponse,
} from '@/types/messages';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMyRooms() {
  return useQuery({
    queryKey: [MESSAGES.MY_ROOMS],
    queryFn: () => messagesService.getMyRooms(),
  });
}

export function useRoomDetails(dmKey: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [MESSAGES.ROOM_DETAILS, dmKey],
    queryFn: () => messagesService.getRoomDetails(dmKey),
    enabled: !!dmKey && enabled,
  });
}

export function useRoomMessages(dmKey?: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: [MESSAGES.ROOM_MESSAGES, dmKey],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      messagesService.getRoomMessages(dmKey as string, pageParam),
    enabled: !!dmKey && enabled,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useMessageDetails(messageId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [MESSAGES.MESSAGE_DETAILS, messageId],
    queryFn: () => messagesService.getMessageDetails(messageId),
    enabled: !!messageId && enabled,
  });
}

export function useSendMessage(
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
) {
  return useMutation<
    SendMessageResponse,
    unknown,
    { recipientPublicId: string; content: string; replyToId?: string }
  >({
    mutationFn: ({ recipientPublicId, content, replyToId }) =>
      messagesService.sendMessage(recipientPublicId, content, replyToId),
    onSuccess: () => {
      setMessage('');
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 1);
    },
  });
}

export function useSendImage() {
  return useMutation<
    SendMessageResponse,
    unknown,
    { recipientPublicId: string; image: File; content: string; replyToId?: string }
  >({
    mutationFn: ({ recipientPublicId, image, content, replyToId }) =>
      messagesService.sendImage(recipientPublicId, image, content, replyToId),
  });
}

export function useSendVoice() {
  return useMutation<
    SendMessageResponse,
    unknown,
    { recipientPublicId: string; voice: File; durationMs: number; replyToId?: string }
  >({
    mutationFn: ({ recipientPublicId, voice, durationMs, replyToId }) =>
      messagesService.sendVoice(recipientPublicId, voice, durationMs, replyToId),
  });
}

export function useSendVideo() {
  return useMutation<
    SendMessageResponse,
    unknown,
    { recipientPublicId: string; video: File; durationMs?: number; replyToId?: string }
  >({
    mutationFn: ({ recipientPublicId, video, durationMs, replyToId }) =>
      messagesService.sendVideo(recipientPublicId, video, durationMs, replyToId),
  });
}

export function useSendFile() {
  return useMutation<SendMessageResponse, unknown, { recipientPublicId: string; file: File; replyToId?: string }>({
    mutationFn: ({ recipientPublicId, file, replyToId }) =>
      messagesService.sendFile(recipientPublicId, file, replyToId),
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
  const queryClient = useQueryClient();

  return useMutation<EditMessageResponse, unknown, { messageId: string; content: string; dmKey: string }>({
    mutationFn: ({ messageId, content }) => messagesService.editMessage(messageId, content),
    onSuccess: (_data, { dmKey }) => {
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_MESSAGES, dmKey] });
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_DETAILS, dmKey] });
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation<DeleteMessageResponse, unknown, { messageId: string; dmKey: string }>({
    mutationFn: ({ messageId }) => messagesService.deleteMessage(messageId),
    onSuccess: (_data, { dmKey }) => {
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_MESSAGES, dmKey] });
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.ROOM_DETAILS, dmKey] });
      void queryClient.invalidateQueries({ queryKey: [MESSAGES.MY_ROOMS] });
    },
  });
}
