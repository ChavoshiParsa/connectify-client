import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRecipientPublicId(dmKey: string, myPublicId?: string) {
  const parts = dmKey.split('~');
  return parts[0] === myPublicId ? parts[1] : parts[1] === myPublicId ? parts[0] : '';
}
