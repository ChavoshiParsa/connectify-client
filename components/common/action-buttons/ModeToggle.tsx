'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
      <Sun className="max-h-4 min-h-4 max-w-4 min-w-4 scale-100 rotate-0 text-zinc-800 transition-all dark:scale-0 dark:-rotate-90 dark:text-zinc-200" />
      <Moon className="absolute max-h-4 min-h-4 max-w-4 min-w-4 scale-0 rotate-90 text-zinc-800 transition-all dark:scale-100 dark:rotate-0 dark:text-zinc-200" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
