import { useTranslations } from 'next-intl';

export default function NewMessagesSeparator() {
  const t = useTranslations('ChatScreen');

  return (
    <div className="my-2 flex w-full items-center gap-3" role="separator" aria-label={t('new_messages')}>
      <span className="bg-primary/40 h-px flex-1" />
      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
        {t('new_messages')}
      </span>
      <span className="bg-primary/40 h-px flex-1" />
    </div>
  );
}
