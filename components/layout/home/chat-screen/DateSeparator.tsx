import { useLocaleUtils } from '@/hooks/app/use-locale-utils';

type Props = {
  date: Date;
};

export default function DateSeparator({ date }: Props) {
  const { formatChatDate } = useLocaleUtils();

  return (
    <div className="my-2 flex w-full justify-center" role="separator">
      <time
        className="border-border/70 bg-background/90 text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur"
        dateTime={date.toISOString()}
      >
        {formatChatDate(date.toISOString())}
      </time>
    </div>
  );
}
