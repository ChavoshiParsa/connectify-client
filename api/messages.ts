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

  sendMessage: async (recipientPublicId: string, content: string) => {
    const { data } = await api.post<SendMessageResponse>(`dm/send-message/${recipientPublicId}`, { content });
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
