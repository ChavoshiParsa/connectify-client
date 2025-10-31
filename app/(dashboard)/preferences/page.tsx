'use client';

import MobileDrawer from '@/components/layout/drawer/MobileDrawer';
import { useWindowWidth } from '@/hooks/use-window-width';

export default function PreferencesPage() {
  const { isXs } = useWindowWidth();

  return (
    <div className="xs:ms-14 xs:w-[calc(100%-3.5rem)] flex h-full w-full items-center gap-2 bg-zinc-100 p-2 md:m-0 md:w-full dark:bg-zinc-950">
      {!isXs && <MobileDrawer />}
      <h1>Preferences page</h1>
    </div>
  );
}
