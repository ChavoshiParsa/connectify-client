import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { fonts } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { useRoomDetails, useSearchRoomMessages } from '@/hooks/data/use-messages';
import { cn } from '@/lib/utils';
import { useTypingStore } from '@/stores/typing-store';
import { ChevronDown, ChevronLeft, ChevronUp, CircleAlert, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  dmKey?: string;
  onNavigateToMessage: (messageId: string) => void;
};

export default function ChatHeader({ dmKey, onNavigateToMessage }: Props) {
  const { detectLocale, convertToPrDigitsIfPr, formatChatTime } = useLocaleUtils();
  const { isRtl } = useApp();
  const router = useRouter();
  const t = useTranslations('ChatScreen');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeResultId, setActiveResultId] = useState<string>();

  const { data, isPending, isError, error } = useRoomDetails(dmKey as string);
  const search = useSearchRoomMessages(dmKey ?? '', debouncedSearch, isSearchOpen);
  const searchResults = useMemo(() => search.data?.pages.flatMap((page) => page.results) ?? [], [search.data]);
  const totalSearchResults = search.data?.pages[0]?.total ?? 0;
  const activeResultIndex = activeResultId ? searchResults.findIndex((result) => result.id === activeResultId) : -1;
  const searchLocale = detectLocale(searchInput);
  const isSomeoneTyping = useTypingStore((state) => state.typingUsers.some((user) => user.dmKey === dmKey));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setIsSearchOpen(false);
    setSearchInput('');
    setDebouncedSearch('');
    setActiveResultId(undefined);
  }, [dmKey]);

  useEffect(() => {
    setActiveResultId(undefined);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!isSearchOpen || !debouncedSearch || activeResultIndex >= 0 || !searchResults[0]) return;

    setActiveResultId(searchResults[0].id);
    onNavigateToMessage(searchResults[0].id);
  }, [activeResultIndex, debouncedSearch, isSearchOpen, onNavigateToMessage, searchResults]);

  if (isPending) return <Spinner />;
  if (isError) return <div>{error?.message}</div>;

  const user = data?.recipient;
  const avatarFallback = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase();
  const nameLocal = detectLocale(avatarFallback);

  function openSearch() {
    setIsSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchInput('');
    setDebouncedSearch('');
    setActiveResultId(undefined);
  }

  function selectSearchResult(messageId: string) {
    setActiveResultId(messageId);
    onNavigateToMessage(messageId);
  }

  async function goToOlderResult() {
    const nextIndex = Math.max(activeResultIndex, -1) + 1;
    let nextResult = searchResults[nextIndex];

    if (!nextResult && search.hasNextPage && !search.isFetchingNextPage) {
      const nextPage = await search.fetchNextPage();
      const updatedResults = nextPage.data?.pages.flatMap((page) => page.results) ?? searchResults;
      nextResult = updatedResults[nextIndex];
    }

    if (nextResult) selectSearchResult(nextResult.id);
  }

  function goToNewerResult() {
    if (activeResultIndex <= 0) return;
    const previousResult = searchResults[activeResultIndex - 1];
    if (previousResult) selectSearchResult(previousResult.id);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeResult = searchResults[Math.max(activeResultIndex, 0)];
    if (activeResult) selectSearchResult(activeResult.id);
  }

  const canGoToOlderResult =
    activeResultIndex >= 0 && (activeResultIndex < searchResults.length - 1 || Boolean(search.hasNextPage));
  const canGoToNewerResult = activeResultIndex > 0;
  const currentSearchResult = activeResultIndex >= 0 ? activeResultIndex + 1 : 0;
  const localizedCurrentResult = convertToPrDigitsIfPr(String(currentSearchResult));
  const localizedTotalResults = convertToPrDigitsIfPr(String(totalSearchResults));

  return (
    <div className="flex w-full items-center justify-center gap-2 border-b border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-950">
      <Button
        className="min-h-10 min-w-10 cursor-pointer border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        variant="ghost"
        size="icon"
        onClick={() => router.push('/home')}
      >
        <ChevronLeft className={cn(isRtl ? 'rotate-180' : 'rotate-0')} />
      </Button>

      {isSearchOpen ? (
        <form className="flex min-w-0 flex-1 items-center gap-1" onSubmit={submitSearch}>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <Input
              ref={searchInputRef}
              className={cn('h-10 ps-9 pe-20', fonts[searchLocale])}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t('search_messages')}
              dir={rtlLocales.has(searchLocale) ? 'rtl' : 'ltr'}
              maxLength={200}
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.key === 'Escape') closeSearch();
              }}
            />
            <span
              className="absolute end-2 top-1/2 flex -translate-y-1/2 items-center text-xs whitespace-nowrap text-zinc-500"
              aria-live="polite"
              aria-label={t('search_result_count', {
                current: localizedCurrentResult,
                total: localizedTotalResults,
              })}
            >
              {debouncedSearch && search.isPending ? (
                <Spinner className="size-4" />
              ) : debouncedSearch && search.isError ? (
                <CircleAlert className="text-destructive size-4" aria-label={t('search_messages_failed')} />
              ) : (
                `${localizedCurrentResult} / ${localizedTotalResults}`
              )}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0"
            onClick={() => void goToOlderResult()}
            disabled={!canGoToOlderResult || search.isFetchingNextPage}
            aria-label={t('older_search_result')}
          >
            {search.isFetchingNextPage ? <Spinner className="size-4" /> : <ChevronUp />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0"
            onClick={goToNewerResult}
            disabled={!canGoToNewerResult}
            aria-label={t('newer_search_result')}
          >
            <ChevronDown />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0"
            onClick={closeSearch}
            aria-label={t('close_message_search')}
          >
            <X />
          </Button>
        </form>
      ) : (
        <>
          <div className="flex h-full min-w-0 flex-1 items-center justify-center gap-3 rounded-lg">
            <Avatar className="relative size-12 min-h-12 min-w-12 flex-none basis-12 overflow-visible rounded-xl">
              <AvatarImage
                className="rounded-xl"
                src={user.avatarUrl ?? ''}
                alt={`${user?.firstName} ${user?.lastName}'s avatar`}
              />
              <AvatarFallback
                className={cn(
                  'rounded-xl bg-linear-to-br text-zinc-50',
                  gradientAvatarClasses[user.avatarColor],
                  fonts[nameLocal],
                )}
              >
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
              <span className={cn('truncate font-medium', fonts[nameLocal])}>
                {user?.firstName} {user?.lastName}
              </span>
              <span
                className={cn(
                  'truncate text-sm font-light',
                  user.status === 'ONLINE' ? 'text-sky-500 dark:text-sky-400' : 'text-zinc-500 dark:text-zinc-400',
                )}
              >
                {isSomeoneTyping
                  ? t('typing')
                  : user.status === 'ONLINE'
                    ? t('online')
                    : `${t('last_seen_at')} ${convertToPrDigitsIfPr(
                        formatChatTime((user.lastActiveAt as Date).toString()),
                      )}`}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0"
            onClick={openSearch}
            aria-label={t('search_messages')}
          >
            <Search />
          </Button>
        </>
      )}
    </div>
  );
}
