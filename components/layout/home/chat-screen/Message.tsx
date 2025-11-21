import { fonts } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { RoomMessageItem } from '@/types/messages';
import { Check, CheckCheck, CircleAlert, Clock } from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { useEffect, useRef } from 'react';

type Props = RoomMessageItem & {
  dmKey: string;
  onVisible: (messageId: string) => void;
};

const bubbleVariants: Variants = {
  hidden: { y: 20, scale: 0.5 },
  visible: {
    y: 0,
    scale: [0.5, 1.05, 1],
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      times: [0, 0.8, 1],
    },
  },
};

export default function Message({ id, content, isPending, isError, receipts, sender, createdAt, onVisible }: Props) {
  const { detectLocale, convertToPrDigitsIfPr, formatTime } = useLocaleUtils();
  const myPublicId = useAuthStore((state) => state.user?.publicId);

  const { isRtl } = useApp();
  const messageLocal = detectLocale(content);

  let icon;
  if (myPublicId !== sender.publicId) icon = null;
  else if (isPending) icon = <Clock className="size-2.5 text-zinc-500" />;
  else if (isError) icon = <CircleAlert className="text-destructive size-2.5" />;
  else if (receipts.some((item) => item.readAt)) icon = <CheckCheck className="size-3 text-sky-500" />;
  else icon = <Check className="size-3 text-sky-500" />;

  const messageRef = useRef<HTMLDivElement>(null);
  const hasBeenSeen = useRef(false);

  useEffect(() => {
    if (hasBeenSeen.current || myPublicId === sender.publicId || receipts.some((item) => item.readAt)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenSeen.current) {
          hasBeenSeen.current = true;
          onVisible(id);
        }
      },
      {
        threshold: 1.0,
      },
    );

    const current = messageRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [id, myPublicId, sender.publicId, receipts, onVisible]);

  return (
    <motion.div
      className={cn(
        'bubble flex w-4/5 max-w-max min-w-24 flex-col gap-1 p-2',
        myPublicId === sender.publicId
          ? `right bg-sky-200 dark:bg-sky-800 ${!isRtl ? 'self-end' : 'self-start'}`
          : `left bg-zinc-200 dark:bg-zinc-800 ${isRtl ? 'self-end' : 'self-start'}`,
      )}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      ref={messageRef}
    >
      <p
        className={cn(
          'overflow-hidden text-start text-sm wrap-break-word hyphens-auto whitespace-pre-line',
          fonts[messageLocal],
        )}
        dir={rtlLocales.has(messageLocal) ? 'rtl' : 'ltr'}
      >
        {content}
      </p>
      <span className="flex items-center justify-center gap-1 self-end text-[10px] font-light text-zinc-700 dark:text-zinc-300">
        {convertToPrDigitsIfPr(formatTime(createdAt.toString()))}
        {icon}
      </span>
    </motion.div>
  );
}
