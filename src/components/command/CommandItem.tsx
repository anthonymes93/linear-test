import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import type { CommandDefinition } from '../../types/command';

export function CommandItem({
  command,
  active,
  onSelect,
}: {
  command: CommandDefinition;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = command.icon;

  return (
    <motion.button
      layout
      disabled={command.disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={cn(
        'group flex h-[58px] w-full items-center gap-3 rounded-lg px-3 text-left transition duration-150',
        active && 'bg-white/[0.095] shadow-[0_0_34px_rgba(125,211,252,0.12)]',
        !active && 'hover:bg-white/[0.06]',
        command.disabled && 'cursor-not-allowed opacity-45',
      )}
    >
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.055] text-slate-400',
          active && 'border-ion/30 bg-ion/10 text-ion',
          command.tone === 'danger' && 'text-rose-300',
          command.tone === 'success' && 'text-emerald-300',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-slate-100">{command.title}</span>
          {command.nestedGroup && <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-500">{command.nestedGroup}</span>}
        </span>
        {command.subtitle && <span className="mt-0.5 block truncate text-xs text-slate-500">{command.subtitle}</span>}
      </span>
      {command.shortcut && <kbd className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-slate-500">{command.shortcut}</kbd>}
    </motion.button>
  );
}
