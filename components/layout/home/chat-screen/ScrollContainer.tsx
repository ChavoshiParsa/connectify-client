import { useEffect, useRef } from 'react';

export default function ScrollContainer({ children }: { children: React.ReactNode }) {
  const outerDiv = useRef<HTMLDivElement>(null);
  const innerDiv = useRef<HTMLDivElement>(null);

  const prevInnerDivHeight = useRef<number>(null);

  useEffect(() => {
    const outerDivHeight = outerDiv.current!.clientHeight;
    const innerDivHeight = innerDiv.current!.clientHeight;
    const outerDivScrollTop = outerDiv.current!.scrollTop;

    if (!prevInnerDivHeight.current || outerDivScrollTop === prevInnerDivHeight.current - outerDivHeight) {
      outerDiv.current!.scrollTo({
        top: innerDivHeight! - outerDivHeight!,
        left: 0,
        behavior: prevInnerDivHeight.current ? 'smooth' : 'auto',
      });
    }

    prevInnerDivHeight.current = innerDivHeight;
  }, [children]);

  return (
    <div
      className="no-scrollbar relative mt-auto -mb-1.5 flex h-full w-full overflow-scroll overflow-y-auto p-2"
      ref={outerDiv}
    >
      <div className="relative flex h-fit w-full flex-col items-center justify-end gap-1.5" ref={innerDiv}>
        {children}
      </div>
    </div>
  );
}
