import IconInput from '@/components/common/IconInput';
import MobileDrawer from '@/components/layout/drawer/MobileDrawer';
import { chatItems } from '@/constants/dummy-data';
import { fonts } from '@/constants/fonts';
import { useApp } from '@/hooks/use-app';
import { useLocaleUtils } from '@/hooks/use-locale-utils';
import { useWindowWidth } from '@/hooks/use-window-width';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import ChatItem from './ChatItem';

export default function ChatList() {
  const t = useTranslations('ChatList');
  const { isXs } = useWindowWidth();
  const { locale } = useApp();

  const [searchInputValue, setSearchInputValue] = useState('');

  const searchValue = searchInputValue.toLocaleLowerCase();

  const { detectLocale } = useLocaleUtils();
  const searchInputValueLocal = detectLocale(searchInputValue);

  return (
    <div className="flex h-full w-full flex-col items-center justify-start gap-2 bg-zinc-100 pt-3 dark:bg-zinc-950">
      <div className="flex w-full items-center justify-center gap-2 px-3">
        {!isXs && <MobileDrawer />}
        <IconInput
          inputClassname={fonts[searchInputValue !== '' ? searchInputValueLocal : locale]}
          icon={Search}
          type="text"
          placeholder={t('search')}
          value={searchInputValue}
          onChange={(e) => setSearchInputValue(e.target.value)}
        />
      </div>
      <div className="no-scrollbar flex h-full w-full flex-col divide-y overflow-y-auto">
        {chatItems
          .filter((item) => {
            if (searchInputValue === '') return item;
            if (
              (item.firstName + ' ' + item.lastName).toLocaleLowerCase().includes(searchValue) ||
              item.lastMessage.includes(searchValue)
            )
              return item;
          })
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .map((item) => (
            <ChatItem key={item.connectId} {...item} />
          ))}
      </div>
    </div>
  );
}
