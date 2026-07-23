import { SafeUser } from './users';

export type ImageMessageAttachment = {
  type: 'IMAGE';
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export type VoiceMessageAttachment = {
  type: 'VOICE';
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  durationMs: number;
};

export type VideoMessageAttachment = {
  type: 'VIDEO';
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  durationMs?: number;
};

export type FileMessageAttachment = {
  type: 'FILE';
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export type MessageAttachment =
  | ImageMessageAttachment
  | VoiceMessageAttachment
  | VideoMessageAttachment
  | FileMessageAttachment;

export type DmLastMessage = {
  clientId?: string; // client added
  id: string;
  createdAt: Date;
  content: string;
  attachments: MessageAttachment[] | null;
  editedAt: Date | null;
  sender: {
    firstName: string;
    lastName: string | null;
    publicId: string;
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
  clientId?: string; // client added
  id: string;
  createdAt: Date;
  content: string;
  attachments: MessageAttachment[] | null;
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
  attachments: MessageAttachment[] | null;
  createdAt: Date;
  dmKey: string;
};

export type SetTypingResponse = {
  success: boolean;
  dmKey: string;
  recipientPublicId: string;
};

export type SeenMessageResponse =
  | {
      success: boolean;
      updated: never[];
      count?: undefined;
    }
  | {
      success: boolean;
      updated: string[];
      count: number;
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
