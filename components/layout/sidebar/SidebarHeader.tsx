import { useApp } from '@/hooks/app/use-app';
import { useSidebarStore } from '@/stores/ui-store';
import { PanelRight } from 'lucide-react';
import Image from 'next/image';

export default function SidebarHeader() {
  const { appName } = useApp();
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

  return (
    <button
      className="hover:bg-primary/10 flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg p-2 transition"
      onClick={toggleSidebar}
    >
      {isSidebarOpen && (
        <>
          <Image className="" src={'/images/app-logo.png'} alt={'App Logo'} width={24} height={24} priority />
          <div className="flex w-full items-center justify-between overflow-auto">
            <h1 className="line-clamp-1 w-full text-start font-bold wrap-break-word">{appName}</h1>
          </div>
        </>
      )}
      <PanelRight className="text-primary max-h-6 min-h-6 max-w-6 min-w-6" />
    </button>
  );
}
