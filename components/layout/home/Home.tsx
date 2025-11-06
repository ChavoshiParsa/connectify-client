'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { MD } from '@/constants/screen-breakpoints';
import { useElementWidth } from '@/hooks/use-element-width';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/ui-store';
import ChatList from './chat-list/ChatList';
import ChatScreen from './chat-screen/ChatScreen';

type Props = {
  userId?: string;
};

export default function Home({ userId }: Props) {
  const [mainRef, divWidth] = useElementWidth<HTMLDivElement>();
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);

  const isDivUnderMd = divWidth < MD && isSidebarOpen;

  return (
    <main className="xs:ms-14 xs:w-[calc(100%-3.5rem)] flex h-full w-full md:m-0 md:w-full" ref={mainRef}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          className={cn(isDivUnderMd ? (userId ? 'hidden' : 'block') : userId ? 'hidden md:block' : 'block')}
          minSize={40}
          defaultSize={40}
        >
          <ChatList />
        </ResizablePanel>
        <ResizableHandle className={cn(isDivUnderMd ? 'hidden' : 'hidden md:flex')} withHandle />
        <ResizablePanel
          className={cn(isDivUnderMd ? (userId ? 'block' : 'hidden') : userId ? 'block' : 'hidden md:block')}
          minSize={40}
          defaultSize={60}
        >
          <ChatScreen userId={userId} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
