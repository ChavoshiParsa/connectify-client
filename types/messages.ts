import { SafeUser } from './users';

export type DmLastMessage = {
  id: string;
  createdAt: Date;
  content: string;
  editedAt: Date | null;
  sender: {
    firstName: string;
    lastName: string | null;
  };
  receipts: {
    readAt: Date | null;
  }[];
  isError?: boolean; // client added
  isPending?: boolean; // client added
} | null;

export type DmRoomSummary = {
  dmKey: string;
  updatedAt: Date;
  lastMessage: DmLastMessage;
  members: {
    user: SafeUser;
  }[];
  recipient: SafeUser;
  unreadCount: number;
};

export type MyRoomsResponse = DmRoomSummary[];

export type RoomDetailsResponse = Omit<DmRoomSummary, 'unreadCount'>;

export type RoomMessageItem = {
  id: string;
  createdAt: Date;
  content: string;
  editedAt: Date | null;
  sender: SafeUser;
  receipts: {
    deliveredAt: Date;
    readAt: Date | null;
  }[];
  isError?: boolean; // client added
  isPending?: boolean; // client added
};

export type RoomMessagesResponse = {
  messages: RoomMessageItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type MessageDetailsResponse = RoomMessageItem & {
  room: {
    dmKey: string;
    updatedAt: Date;
  };
};

export type SendMessageResponse = {
  messageId: string;
  content: string;
  createdAt: Date;
  dmKey: string;
};

export type SetTypingResponse = {
  success: boolean;
  dmKey: string;
  recipientPublicId: string;
};

export type SeenMessageResponse = {
  success: boolean;
  messageId: string;
  alreadyRead: boolean;
};

export type SeenAllMessagesResponse = {
  success: boolean;
  dmKey: string;
  messagesMarkedRead: number;
};

export type EditMessageResponse = {
  success: boolean;
  messageId: string;
  content: string;
  editedAt: Date | null;
};

export type DeleteMessageResponse = {
  success: boolean;
  messageId: string;
  deletedAt: Date | null;
};
