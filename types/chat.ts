import { AvatarColorType } from './avatar-colors';

export type MessageStatus = 'sending' | 'sent' | 'seen' | 'error' | 'none';

export type ChatItemType = {
  connectId: string;
  avatarColor: AvatarColorType;
  avatarImageSrc: string;
  firstName: string;
  lastName: string;
  lastMessage: string;
  newMessageCount: number;
  isOnline: boolean;
  time: string;
  status: MessageStatus;
};

export type ReceivedMessage = {
  messageId: string;
  type: 'received';
  messageText: string;
  time: string;
  status: 'none';
};

export type SentMessage = {
  messageId: string;
  type: 'sent';
  messageText: string;
  time: string;
  status: Omit<MessageStatus, 'none'>;
};

export type MessageType = SentMessage | ReceivedMessage;
