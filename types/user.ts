import { AvatarColorType } from './avatar-colors';

export type UserStatus = 'ONLINE' | 'OFFLINE';

export type User = {
  email: string;
  publicId: string;
  firstName: string;
  username: string | null;
  lastName: string | null;
  biography: string | null;
  avatarUrl: string | null;
  roles: string[];
  avatarColor: AvatarColorType;
  lastLoginAt: Date | null;
  lastActiveAt: Date | null;
  status: UserStatus;
};
