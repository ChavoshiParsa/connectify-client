import { fonts } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { RoomMessageItem } from '@/types/messages';
import { Check, CheckCheck, CircleAlert, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Message({ content, isPending, isError, receipts, sender, createdAt }: RoomMessageItem) {
  const { detectLocale, convertToPrDigitsIfPr, formatTime } = useLocaleUtils();
  const myPublicId = useAuthStore((state) => state.user?.publicId);

  const { isRtl } = useApp();
  const messageLocal = detectLocale(content);

  let icon;
  if (isPending) icon = <Clock className="size-2.5 text-zinc-500" />;
  else if (isError) icon = <CircleAlert className="text-destructive size-2.5" />;
  else if (receipts.some((item) => item.readAt)) icon = <CheckCheck className="size-3 text-sky-500" />;
  else icon = <Check className="size-3 text-sky-500" />;

  return (
    <motion.div
      className={cn(
        'bubble flex w-4/5 max-w-max flex-col gap-1 p-2',
        myPublicId === sender.publicId
          ? `right bg-sky-200 dark:bg-sky-800 ${!isRtl ? 'self-end' : 'self-start'}`
          : `left bg-zinc-200 dark:bg-zinc-800 ${isRtl ? 'self-end' : 'self-start'}`,
      )}
      initial={{ opacity: 0.2, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'anticipate' }}
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
      <span className="flex items-center justify-center gap-1 self-end text-xs font-light text-zinc-700 dark:text-zinc-300">
        {convertToPrDigitsIfPr(formatTime(createdAt.toString()))}
        {icon}
      </span>
    </motion.div>
  );
}
