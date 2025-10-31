import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarMenuItemProps = {
  title: string;
  href: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
};

export default function SidebarMenuItem({ title, href, icon: Icon }: SidebarMenuItemProps) {
  const { isSidebarOpen } = useSidebarStore();

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
            <span className={cn('font-medium text-nowrap', isActive && 'text-sky-500')}>{t(title)}</span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className={cn(!isSidebarOpen ? 'block' : 'hidden')}>
        <p>{t(title)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
