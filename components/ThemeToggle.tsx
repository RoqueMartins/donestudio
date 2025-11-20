import { Dispatch, SetStateAction } from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  setTheme: Dispatch<SetStateAction<'light' | 'dark'>>;
}

export function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-medium bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 transition"
    >
      <span className="text-lg" role="img" aria-label="tema">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
      <span className="hidden sm:block">{theme === 'dark' ? 'Tema escuro' : 'Tema claro'}</span>
    </button>
  );
}
