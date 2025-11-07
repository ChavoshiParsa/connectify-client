import { logout } from '@/api/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { fonts } from '@/constants/fonts';
import { useLocaleUtils } from '@/hooks/use-locale-utils';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/ui-store';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SidebarFooter() {
  const { detectLocale } = useLocaleUtils();
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const router = useRouter();
  const t = useTranslations('Sidebar');
  const user = useAuthStore((state) => state.user);

  const avatarFallback = `${user?.firstName?.charAt(0) ?? ''}‌${user?.lastName?.charAt(0) ?? ''}`.toUpperCase(); // there is shift + space at the between.
  const nameLocal = detectLocale(avatarFallback);

  const { mutate, isPending } = useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: async () => {
      return await logout();
    },
    onSuccess: () => {
      toast.success(t('success_logout'));
      router.replace('/');
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        toast.error(typeof msg === 'string' ? t(msg) : t('error_generic'));
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error(t('error_generic'));
      }
    },
  });

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
              src={user?.avatarUrl || ''}
              alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}'s avatar`}
            />
            <AvatarFallback
              className={cn(
                'rounded-lg bg-linear-to-br text-zinc-50',
                gradientAvatarClasses[user?.avatarColor || 'RED'],
                fonts[nameLocal],
              )}
            >
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          {isSidebarOpen && (
            <>
              <div className="flex h-full w-full flex-col items-start justify-evenly overflow-auto">
                <span className="line-clamp-1 w-full text-start text-sm leading-4 font-semibold wrap-break-word">{`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}</span>
                <span className="text-muted-foreground line-clamp-1 w-full text-start text-xs font-light wrap-break-word">
                  {user?.email ?? ''}
                </span>
              </div>
              <ChevronsUpDown className="max-h-6 min-h-6 max-w-6 min-w-6 text-zinc-800 dark:text-zinc-200" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end">
        <DropdownMenuItem className="cursor-pointer text-red-500" onSelect={() => mutate()} disabled={isPending}>
          <LogOut className="max-h-6 min-h-6 max-w-6 min-w-6" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
