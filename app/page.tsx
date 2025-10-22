import LocaleSelector from '@/components/action-buttons/LocaleSelector';
import ModeToggle from '@/components/action-buttons/ModeToggle';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between bg-white px-16 py-32 sm:items-start dark:bg-black">
        <LocaleSelector />
        <ModeToggle />
      </main>
    </div>
  );
}
