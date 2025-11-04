import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Bookmark, Contact, Home, Settings2, UserPen } from 'lucide-react';
import SidebarMenuItem from './SidebarMenuItem';

const menuItems = [
  { title: 'home', route: '/home', icon: Home },
  { title: 'profile', route: '/profile', icon: UserPen },
  { title: 'preferences', route: '/preferences', icon: Settings2 },
  { title: 'saved_messages', route: '/saved-messages', icon: Bookmark },
  { title: 'contacts', route: '/contacts', icon: Contact },
];

type Props = { isDrawerMobile?: boolean };

export default function SidebarMenu({ isDrawerMobile = false }: Props) {
  return (
    <TooltipProvider>
      <div
        className={cn('flex w-full flex-col items-center justify-center gap-2', isDrawerMobile && 'max-w-fit flex-row')}
      >
        {menuItems.map(({ title, route, icon }) => (
          <SidebarMenuItem key={title} title={title} href={route} icon={icon} />
        ))}
      </div>
    </TooltipProvider>
  );
}
