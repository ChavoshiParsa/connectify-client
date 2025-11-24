import IconInput from '@/components/common/IconInput';
import MobileDrawer from '@/components/layout/drawer/MobileDrawer';
import { Spinner } from '@/components/ui/spinner';
import { fonts } from '@/constants/fonts';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { useWindowWidth } from '@/hooks/app/use-window-width';
import { useMyRooms } from '@/hooks/data/use-messages';
import { useSearchUsers } from '@/hooks/data/use-users';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import ChatItem from './ChatItem';
import SearchResultItem from './SearchResultItem';

export default function ChatList() {
  const t = useTranslations('ChatList');
  const { isXs } = useWindowWidth();
  const { locale } = useApp();

  const [searchInputValue, setSearchInputValue] = useState('');

  const searchValue = searchInputValue.toLocaleLowerCase();
  const isSearchMode = searchInputValue.trim() !== '';

  const { detectLocale } = useLocaleUtils();
  const searchInputValueLocal = detectLocale(searchInputValue);

  const rooms = useMyRooms();
  const search = useSearchUsers(searchInputValue, isSearchMode);

  const users = search?.data || [];

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
        {isSearchMode ? (
          search.isPending ? (
            <Spinner />
          ) : search.isError ? (
            <div>{search.error?.message}</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500">{t('no_results')}</div>
          ) : (
            users.map((user) => <SearchResultItem key={user.publicId} {...user} />)
          )
        ) : (
          <>
            {rooms.isPending ? (
              <Spinner />
            ) : rooms.isError ? (
              <div>{rooms.error?.message}</div>
            ) : (
              rooms.data
                ?.filter((item) => {
                  if (searchInputValue === '') return true;
                  if (
                    (item.recipient.firstName + ' ' + item.recipient.lastName)
                      .toLocaleLowerCase()
                      .includes(searchValue) ||
                    item.lastMessage?.content.toLocaleLowerCase().includes(searchValue)
                  ) {
                    return true;
                  }
                  return false;
                })
                .sort(
                  (a, b) =>
                    new Date(b.lastMessage?.createdAt as Date).getTime() -
                    new Date(a.lastMessage?.createdAt as Date).getTime(),
                )
                .map((item) => <ChatItem key={item.dmKey} {...item} />)
            )}
          </>
        )}
      </div>
    </div>
  );
}
