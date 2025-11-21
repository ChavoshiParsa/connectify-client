type ISODateString = string;

export type MessageNewData = {
  messageId: string;
  dmKey: string;
  senderPublicId: string;
  createdAt: ISODateString;
};

export type MessageEditedData = {
  messageId: string;
  dmKey: string;
  editorPublicId: string;
  editedAt: ISODateString;
};

export type MessageDeletedData = {
  messageId: string;
  dmKey: string;
  deletedByPublicId: string;
  deletedAt: ISODateString;
};

export type MessagesSeenData = {
  messageId: string[];
  dmKey: string;
  seenByPublicId: string;
  readAt: ISODateString;
};

export type MessageSeenAllData = {
  dmKey: string;
  seenAllByPublicId: string;
  readAt: ISODateString;
};

// export type TypingStartData = {
//   dmKey: string;
//   userPublicId: string;
// };

// export type UserStatusData = {
//   publicId: string;
//   status: 'ONLINE' | 'OFFLINE';
//   lastActiveAt: ISODateString;
// };

// export type UserProfileUpdatedData = {
//   publicId: string;
//   updatedFields: string[];
// };

export type ServerToClientEvents = {
  'message:new': (payload: MessageNewData) => void;
  'message:edited': (payload: MessageEditedData) => void;
  'message:deleted': (payload: MessageDeletedData) => void;
  'messages:seen': (payload: MessagesSeenData) => void;
  'message:seen-all': (payload: MessageSeenAllData) => void;
  // 'typing:start': (payload: TypingStartData) => void;
  // 'user:status': (payload: UserStatusData) => void;
  // 'user:profile-updated': (payload: UserProfileUpdatedData) => void;
};

// export type ClientToServerEvents = object;
