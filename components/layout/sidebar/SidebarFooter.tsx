import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { user } from '@/constants/dummy-data';
import { useLocaleUtils } from '@/hooks/use-locale-utils';
import { useSidebarStore } from '@/lib/store';
import { cn } from '@/lib/utils';

import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { fonts } from '@/constants/fonts';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SidebarFooter() {
  const { detectLocale } = useLocaleUtils();

  const { isSidebarOpen } = useSidebarStore();
  const t = useTranslations('Sidebar');

  const avatarFallback = `${user.firstName.charAt(0)}‌${user.lastName.charAt(0)}`.toUpperCase(); // there is shift + space at the between.

  const nameLocal = detectLocale(avatarFallback);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'mt-auto flex w-full cursor-pointer items-center gap-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-800',
            isSidebarOpen && 'p-2',
          )}
        >
          <Avatar className="flex size-10 items-center justify-center rounded-lg">
            <AvatarImage
              className="rounded-lg"
              src={user.avatarImage}
              alt={`${user.firstName} ${user.lastName}'s avatar`}
            />
            <AvatarFallback
              className={cn(
                'rounded-lg bg-linear-to-br text-zinc-50',
                gradientAvatarClasses[user.avatarColor],
                fonts[nameLocal],
              )}
            >
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          {isSidebarOpen && (
            <>
              <div className="flex w-full flex-col items-start">
                <span className="text-sm leading-4 font-semibold text-nowrap">{`${user.firstName} ${user.lastName}`}</span>
                <span className="text-muted-foreground text-xs font-light text-nowrap">{user.email}</span>
              </div>
              <ChevronsUpDown className="max-h-6 min-h-6 max-w-6 min-w-6 text-zinc-800 dark:text-zinc-200" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end">
        <DropdownMenuItem
          className="cursor-pointer text-red-500"
          //  onSelect={handleLogout}
        >
          <LogOut className="max-h-6 min-h-6 max-w-6 min-w-6" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
