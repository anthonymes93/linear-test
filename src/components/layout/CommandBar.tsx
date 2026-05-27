import { Command, Moon, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUiStore } from '../../stores/uiStore';

export function CommandBar() {
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-left text-sm text-slate-400 transition hover:bg-white/10 sm:max-w-xl"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search tasks, jump anywhere, create instantly</span>
        <span className="ml-auto hidden items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-slate-500 sm:flex">
          <Command className="h-3 w-3" /> K
        </span>
      </button>
      <Button className="ml-3 h-10 w-10 px-0" onClick={toggleTheme} aria-label="Toggle theme" icon={<Moon className="h-4 w-4" />} />
    </header>
  );
}
