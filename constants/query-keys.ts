export const AUTH = {} as const;

export const USERS = {
  ME: 'me',
  TOTAL_UNREAD_COUNT: 'total-unread-count',
  SEARCH_USERS: 'search-users',
} as const;

export const MESSAGES = {
  MY_ROOMS: 'my-rooms',
  ROOM_MESSAGES: 'room-messages',
  SEARCH_ROOM_MESSAGES: 'search-room-messages',
  ROOM_DETAILS: 'room-details',

  MESSAGE_DETAILS: 'message-details',

  USER_STATUS: 'user-status',
  USER_PROFILE: 'user-profile',

  TYPING: 'typing',
} as const;
