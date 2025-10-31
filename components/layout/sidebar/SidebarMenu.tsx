import { Bookmark, Contact, Home, Settings2, UserPen } from 'lucide-react';
import SidebarMenuItem from './SidebarMenuItem';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const menuItems = [
  { title: 'home', href: '/home', icon: Home },
  { title: 'profile', href: '/profile', icon: UserPen },
  { title: 'preferences', href: '/preferences', icon: Settings2 },
  { title: 'saved_messages', href: '/saved-messages', icon: Bookmark },
  { title: 'contacts', href: '/contacts', icon: Contact },
];

type Props = { isDrawerMobile?: boolean };

export default function SidebarMenu({ isDrawerMobile = false }: Props) {
  return (
    <TooltipProvider>
      <div
        className={cn('flex w-full flex-col items-center justify-center gap-2', isDrawerMobile && 'max-w-fit flex-row')}
      >
        {menuItems.map(({ title, href, icon }) => (
          <SidebarMenuItem key={title} title={title} href={href} icon={icon} />
        ))}
      </div>
    </TooltipProvider>
  );
}
