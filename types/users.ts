import { AvatarColor } from "@/constants/avatar-colors";

export type AvatarColorType = keyof typeof AvatarColor;
export type UserStatus = 'ONLINE' | 'OFFLINE';

export type User = {
  email: string;
  publicId: string;
  username: string;
  firstName: string;
  lastName: string | null;
  biography: string | null;
  avatarUrl: string | null;
  avatarColor: AvatarColorType;
  lastLoginAt: Date | null;
  lastActiveAt: Date | null;
  status: UserStatus;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type SafeUser = Omit<User, 'lastLoginAt' | 'roles' | 'biography' | 'createdAt' | 'updatedAt'>;

export type UsersSearchResponse = SafeUser[];
