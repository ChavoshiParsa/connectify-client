import { useLocaleUtils } from '@/hooks/use-locale-utils';

type Props = {
  newMessageCount: number;
};

export default function NewMessageBadge({ newMessageCount }: Props) {
  const { convertToPrDigitsIfPr } = useLocaleUtils();

  if (newMessageCount > 0)
    return (
      <div className="flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-linear-to-br from-sky-400 to-sky-500 text-xs leading-none text-zinc-50">
        <span>{convertToPrDigitsIfPr(String(newMessageCount))}</span>
      </div>
    );
}
