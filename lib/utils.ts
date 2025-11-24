import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeDmKey(a: string, b: string): string {
  return [a, b].sort().join('~');
}

export function getPartnerPublicKey(publicId: string, dmKey: string): string | null {
  const [a, b] = dmKey.split('~') as [string, string];
  return publicId === a ? b : publicId === b ? a : null;
}
