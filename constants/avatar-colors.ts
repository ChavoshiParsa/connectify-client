
import { AvatarColorType } from "@/types/users";

export const AvatarColor = {
  RED: 'RED',
  ORANGE: 'ORANGE',
  AMBER: 'AMBER',
  YELLOW: 'YELLOW',
  LIME: 'LIME',
  GREEN: 'GREEN',
  EMERALD: 'EMERALD',
  TEAL: 'TEAL',
  CYAN: 'CYAN',
  SKY: 'SKY',
  BLUE: 'BLUE',
  INDIGO: 'INDIGO',
  VIOLET: 'VIOLET',
  PURPLE: 'PURPLE',
  FUCHSIA: 'FUCHSIA',
  PINK: 'PINK',
  ROSE: 'ROSE',
} as const;

export const gradientAvatarClasses: Record<AvatarColorType, string> = {
  RED: 'from-red-400 to-red-600',
  ORANGE: 'from-orange-400 to-orange-600',
  AMBER: 'from-amber-400 to-amber-600',
  YELLOW: 'from-yellow-400 to-yellow-600',
  LIME: 'from-lime-400 to-lime-600',
  GREEN: 'from-green-400 to-green-600',
  EMERALD: 'from-emerald-400 to-emerald-600',
  TEAL: 'from-teal-400 to-teal-600',
  CYAN: 'from-cyan-400 to-cyan-600',
  SKY: 'from-sky-400 to-sky-600',
  BLUE: 'from-blue-400 to-blue-600',
  INDIGO: 'from-indigo-400 to-indigo-600',
  VIOLET: 'from-violet-400 to-violet-600',
  PURPLE: 'from-purple-400 to-purple-600',
  FUCHSIA: 'from-fuchsia-400 to-fuchsia-600',
  PINK: 'from-pink-400 to-pink-600',
  ROSE: 'from-rose-400 to-rose-600',
};
