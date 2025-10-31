'use client';

import { useClickOutside } from '@/hooks/use-click-outside';
import { useWindowWidth } from '@/hooks/use-window-width';
import { useSidebarStore } from '@/lib/store';
import { motion, Variants } from 'motion/react';
import { useEffect, useRef } from 'react';
import SidebarFooter from './SidebarFooter';
import SidebarHeader from './SidebarHeader';
import SidebarMenu from './SidebarMenu';

const variants: Variants = {
  open: {
    minWidth: '16rem',
    maxWidth: '16rem',
    transition: { type: 'spring', stiffness: 500, damping: 50 },
  },
  closed: {
    minWidth: '3.5rem',
    maxWidth: '3.5rem',
    transition: { type: 'spring', stiffness: 500, damping: 50 },
  },
};

export default function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useSidebarStore();
  const { isLg, isMd } = useWindowWidth();

  const sidebarRef = useRef<HTMLDivElement>(null);
  useClickOutside(sidebarRef, () => !isMd && setSidebarOpen(false));

  useEffect(() => {
    setSidebarOpen(isLg);
  }, [isLg, setSidebarOpen]);

  return (
    <motion.div
      className="xs:flex absolute z-20 hidden h-full flex-col items-center justify-center gap-2 bg-zinc-200 p-2 md:relative dark:bg-zinc-900"
      variants={variants}
      initial={false}
      animate={isSidebarOpen ? 'open' : 'closed'}
      ref={sidebarRef}
    >
      <SidebarHeader />
      <SidebarMenu />
      <SidebarFooter />
    </motion.div>
  );
}
