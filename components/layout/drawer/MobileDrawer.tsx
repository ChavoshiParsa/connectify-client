'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useApp } from '@/hooks/app/use-app';
import { PanelRight } from 'lucide-react';
import SidebarMenu from '../sidebar/SidebarMenu';

export default function MobileDrawer() {
  const { appName } = useApp();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className="max-h-12.5 min-h-12.5 max-w-12.5 min-w-12.5 border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
          variant="outline"
          size="icon"
        >
          <PanelRight className="max-h-6 min-h-6 max-w-6 min-w-6 text-zinc-800 dark:text-zinc-200" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm p-1">
          <DrawerHeader>
            <DrawerTitle>{appName}</DrawerTitle>
            <DrawerDescription>
              {appName} is a platform for developers to share their knowledge and insights with the community.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex w-full items-center justify-center p-2">
            <SidebarMenu isDrawerMobile />
          </div>
        </div>
        {/* <DrawerFooter>
          <SidebarFooter />
        </DrawerFooter> */}
      </DrawerContent>
    </Drawer>
  );
}
