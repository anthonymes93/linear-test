import { AnimatePresence, motion } from 'framer-motion';
import { Command, Search, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCommandRegistry } from '../../lib/commandRegistry';
import { cn } from '../../lib/cn';
import { useCommandPaletteStore } from '../../stores/commandPaletteStore';
import { useUiStore } from '../../stores/uiStore';
import type { CommandDefinition } from '../../types/command';
import { CommandItem } from './CommandItem';

function scoreCommand(command: CommandDefinition, query: string) {
  if (!query) return command.suggested ? 2 : 1;
  const haystack = [command.title, command.subtitle, command.group, command.nestedGroup, ...command.keywords].filter(Boolean).join(' ').toLowerCase();
  const normalized = query.toLowerCase().trim();
  if (haystack.includes(normalized)) return 100 - haystack.indexOf(normalized);
  let cursor = 0;
  for (const char of normalized) {
    cursor = haystack.indexOf(char, cursor);
    if (cursor === -1) return 0;
    cursor += 1;
  }
  return 20;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const open = useUiStore((state) => state.commandOpen);
  const setOpen = useUiStore((state) => state.setCommandOpen);
  const query = useCommandPaletteStore((state) => state.query);
  const activeIndex = useCommandPaletteStore((state) => state.activeIndex);
  const recentCommandIds = useCommandPaletteStore((state) => state.recentCommandIds);
  const setQuery = useCommandPaletteStore((state) => state.setQuery);
  const setActiveIndex = useCommandPaletteStore((state) => state.setActiveIndex);
  const recordCommand = useCommandPaletteStore((state) => state.recordCommand);
  const reset = useCommandPaletteStore((state) => state.reset);
  const commands = createCommandRegistry(navigate);
  const filteredCommands = useMemo(() => {
    return commands
      .map((command) => ({ command, score: scoreCommand(command, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.command);
  }, [commands, query]);
  const recentCommands = commands.filter((command) => recentCommandIds.includes(command.id)).slice(0, 4);
  const shownCommands = query ? filteredCommands : [...recentCommands, ...filteredCommands.filter((command) => !recentCommandIds.includes(command.id))];
  const groupedCommands = shownCommands.reduce<Record<string, CommandDefinition[]>>((acc, command) => {
    acc[command.group] = [...(acc[command.group] ?? []), command];
    return acc;
  }, {});

  const close = () => {
    setOpen(false);
    reset();
  };

  const runCommand = (command: CommandDefinition) => {
    if (command.disabled) return;
    recordCommand(command.id);
    command.perform({ query, close });
  };

  return (
    <AnimatePresence>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Command palette" className="relative z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xl" />
          <div className="fixed inset-0 flex items-start justify-center px-4 pt-[11vh]" onMouseDown={close}>
            <motion.div
              onMouseDown={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: -18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.14] bg-graphite/[0.88] shadow-[0_32px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Search className="h-5 w-5 text-ion" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setActiveIndex(Math.min(shownCommands.length - 1, activeIndex + 1));
                    }
                    if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      setActiveIndex(Math.max(0, activeIndex - 1));
                    }
                    if (event.key === 'Enter' && shownCommands[activeIndex]) {
                      event.preventDefault();
                      runCommand(shownCommands[activeIndex]);
                    }
                    if (event.key === 'Escape') close();
                  }}
                  placeholder="Type a command, task, tag, destination..."
                  className="h-14 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
                <kbd className="hidden items-center gap-1 rounded-md border border-white/10 bg-black/25 px-2 py-1 text-[11px] text-slate-500 sm:flex">
                  <Command className="h-3 w-3" /> K
                </kbd>
              </div>
              <div className="max-h-[62vh] overflow-y-auto p-2">
                {!shownCommands.length ? (
                  <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] text-center">
                    <div>
                      <Sparkles className="mx-auto h-7 w-7 text-slate-600" />
                      <p className="mt-3 text-sm font-medium text-slate-300">No command matches</p>
                      <p className="mt-1 text-xs text-slate-500">Try create, focus, priority, status, or sync.</p>
                    </div>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([group, groupCommands]) => (
                    <section key={group} className="mb-2 last:mb-0">
                      <div className={cn('flex items-center gap-2 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500', group === 'Productivity' && 'text-ion/70')}>
                        {group}
                        {group === 'Create' && !query && <span className="rounded-full bg-ion/10 px-2 py-0.5 text-[10px] text-ion">Suggested</span>}
                      </div>
                      <div className="space-y-1">
                        {groupCommands.map((command) => {
                          const globalIndex = shownCommands.findIndex((item) => item.id === command.id);
                          return <CommandItem key={command.id} command={command} active={globalIndex === activeIndex} onSelect={() => runCommand(command)} />;
                        })}
                      </div>
                    </section>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
