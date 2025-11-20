import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/ui-store';
import { LucideProps } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppRoutes } from '@/.next/dev/types/routes';

type SidebarMenuItemProps = {
  title: string;
  href: AppRoutes;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
};

export default function SidebarMenuItem({ title, href, icon: Icon }: SidebarMenuItemProps) {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);

  const t = useTranslations('Sidebar');
  const pathname = usePathname();

  const isActive = pathname.startsWith(href);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            'flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg p-2 transition hover:bg-zinc-300 dark:hover:bg-zinc-800',
            isActive && 'bg-zinc-300 dark:bg-zinc-800',
          )}
        >
          <Icon className={cn('max-h-6 min-h-6 max-w-6 min-w-6', isActive && 'text-sky-500')} />
          {isSidebarOpen && (
            <span
              className={cn('line-clamp-1 w-full text-start font-medium wrap-break-word', isActive && 'text-sky-500')}
            >
              {t(title)}
            </span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className={cn(!isSidebarOpen ? 'block' : 'hidden')}>
        <p>{t(title)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
