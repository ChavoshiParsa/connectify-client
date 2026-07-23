import {
  DeleteMessageResponse,
  EditMessageResponse,
  MessageDetailsResponse,
  MyRoomsResponse,
  RoomDetailsResponse,
  RoomMessagesResponse,
  SeenAllMessagesResponse,
  SeenMessageResponse,
  SendMessageResponse,
  SetTypingResponse,
} from '@/types/messages';
import { api } from './api-client';

export const messagesService = {
  getMyRooms: async () => {
    const { data } = await api.get<MyRoomsResponse>('dm/my-rooms');
    return data;
  },

  getRoomDetails: async (dmKey: string) => {
    const { data } = await api.get<RoomDetailsResponse>(`dm/room-details/${dmKey}`);
    return data;
  },

  getRoomMessages: async (dmKey: string, cursor?: string) => {
    const { data } = await api.get<RoomMessagesResponse>(`dm/room-messages/${dmKey}`, {
      params: { cursor, limit: 50 },
    });
    return data;
  },

  getMessageDetails: async (messageId: string) => {
    const { data } = await api.get<MessageDetailsResponse>(`dm/message-details/${messageId}`);
    return data;
  },

  sendMessage: async (recipientPublicId: string, content: string, replyToId?: string) => {
    const { data } = await api.post<SendMessageResponse>(`dm/send-message/${recipientPublicId}`, {
      content,
      replyToId,
    });
    return data;
  },

  sendImage: async (recipientPublicId: string, image: File, content: string, replyToId?: string) => {
    const formData = new FormData();
    formData.append('content', content);
    if (replyToId) formData.append('replyToId', replyToId);
    formData.append('image', image);

    const { data } = await api.post<SendMessageResponse>(`dm/send-image/${recipientPublicId}`, formData);
    return data;
  },

  getMessageImage: async (messageId: string, fileId: string, signal?: AbortSignal) => {
    const { data } = await api.get<Blob>(`dm/message-image/${messageId}/${fileId}`, {
      responseType: 'blob',
      signal,
    });
    return data;
  },

  sendVoice: async (recipientPublicId: string, voice: File, durationMs: number, replyToId?: string) => {
    const formData = new FormData();
    formData.append('durationMs', String(durationMs));
    if (replyToId) formData.append('replyToId', replyToId);
    formData.append('voice', voice);

    const { data } = await api.post<SendMessageResponse>(`dm/send-voice/${recipientPublicId}`, formData);
    return data;
  },

  sendVideo: async (recipientPublicId: string, video: File, durationMs?: number, replyToId?: string) => {
    const formData = new FormData();
    if (durationMs) formData.append('durationMs', String(durationMs));
    if (replyToId) formData.append('replyToId', replyToId);
    formData.append('video', video);
    const { data } = await api.post<SendMessageResponse>(`dm/send-video/${recipientPublicId}`, formData);
    return data;
  },

  sendFile: async (recipientPublicId: string, file: File, replyToId?: string) => {
    const formData = new FormData();
    if (replyToId) formData.append('replyToId', replyToId);
    formData.append('file', file);
    const { data } = await api.post<SendMessageResponse>(`dm/send-file/${recipientPublicId}`, formData);
    return data;
  },

  getMessageMedia: async (messageId: string, fileId: string, signal?: AbortSignal) => {
    const { data } = await api.get<Blob>(`dm/message-media/${messageId}/${fileId}`, {
      responseType: 'blob',
      signal,
    });
    return data;
  },

  setTyping: async (recipientPublicId: string) => {
    const { data } = await api.post<SetTypingResponse>(`dm/set-typing/${recipientPublicId}`);
    return data;
  },

  seenMessage: async (messageId: string) => {
    const { data } = await api.post<SeenMessageResponse>(`dm/seen-message/${messageId}`);
    return data;
  },

  seenMessages: async (messageIds: string[]) => {
    const { data } = await api.post<SeenMessageResponse>('dm/seen-messages', {
      messageIds,
    });
    return data;
  },

  seenAllMessages: async (dmKey: string) => {
    const { data } = await api.post<SeenAllMessagesResponse>(`dm/seen-all-messages/${dmKey}`);
    return data;
  },

  editMessage: async (messageId: string, content: string) => {
    const { data } = await api.patch<EditMessageResponse>(`dm/edit-message/${messageId}`, { content });
    return data;
  },

  deleteMessage: async (messageId: string) => {
    const { data } = await api.delete<DeleteMessageResponse>(`dm/delete-message/${messageId}`);
    return data;
  },
};
