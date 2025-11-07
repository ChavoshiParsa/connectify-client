import { fonts } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { useApp } from '@/hooks/use-app';
import { useLocaleUtils } from '@/hooks/use-locale-utils';
import { cn } from '@/lib/utils';
import { MessageType } from '@/types/chat';
import { Check, CheckCheck, CircleAlert, Clock } from 'lucide-react';

export default function Message({ messageText, status, time, type }: MessageType) {
  const { detectLocale, convertToPrDigitsIfPr, formatTime } = useLocaleUtils();

  const { isRtl } = useApp();
  const messageLocal = detectLocale(messageText);

  let icon;
  if (status === 'sent') icon = <Check className="size-3.5 text-sky-600 dark:text-sky-300" />;
  else if (status === 'seen') icon = <CheckCheck className="size-3.5 text-sky-600 dark:text-sky-300" />;
  else if (status === 'sending') icon = <Clock className="size-3 text-zinc-700 dark:text-zinc-300" />;
  else if (status === 'error') icon = <CircleAlert className="size-3 text-rose-600 dark:text-rose-500" />;

  return (
    <div
      className={cn(
        'bubble flex w-4/5 max-w-max flex-col gap-1 p-2',
        type === 'sent'
          ? `right bg-sky-200 dark:bg-sky-800 ${!isRtl ? 'self-end' : 'self-start'}`
          : `left bg-zinc-200 dark:bg-zinc-800 ${isRtl ? 'self-end' : 'self-start'}`,
      )}
    >
      <p
        className={cn(
          'overflow-hidden text-start text-sm wrap-break-word hyphens-auto whitespace-pre-line',
          fonts[messageLocal],
        )}
        dir={rtlLocales.has(messageLocal) ? 'rtl' : 'ltr'}
      >
        {messageText}
      </p>
      <span className="flex items-center justify-center gap-1 self-end text-xs font-light text-zinc-700 dark:text-zinc-300">
        {convertToPrDigitsIfPr(formatTime(time))}
        {icon}
      </span>
    </div>
  );
}
