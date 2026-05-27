import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import type { TaskStatus } from '../../types/task';

const items: Array<{ label: TaskStatus; path: string }> = [
  { label: 'Inbox', path: '/inbox' },
  { label: 'Today', path: '/today' },
  { label: 'Upcoming', path: '/upcoming' },
  { label: 'In Progress', path: '/in-progress' },
  { label: 'Waiting', path: '/waiting' },
  { label: 'Completed', path: '/completed' },
];

export function MobileNav() {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 lg:hidden" aria-label="Task status">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs transition',
              isActive ? 'border-ion/40 bg-ion/10 text-sky-100' : 'border-white/10 bg-white/[0.04] text-slate-400',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
