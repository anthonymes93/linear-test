import { NavLink } from 'react-router-dom';
import { Archive, CalendarClock, CheckCircle2, CircleDot, Clock3, Inbox, Loader2, PauseCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { TaskStatus } from '../../types/task';
import { WorkspaceSwitcher } from '../collaboration/WorkspaceSwitcher';

const navItems: Array<{ label: TaskStatus; path: string; icon: typeof Inbox }> = [
  { label: 'Inbox', path: '/inbox', icon: Inbox },
  { label: 'Today', path: '/today', icon: CircleDot },
  { label: 'Upcoming', path: '/upcoming', icon: CalendarClock },
  { label: 'In Progress', path: '/in-progress', icon: Loader2 },
  { label: 'Waiting', path: '/waiting', icon: PauseCircle },
  { label: 'Completed', path: '/completed', icon: CheckCircle2 },
  { label: 'Archived', path: '/archived', icon: Archive },
];

export function Sidebar() {
  return (
    <aside className="hidden border-r border-white/10 bg-white/[0.035] p-4 lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.12] bg-white/10 shadow-glow">
          <Clock3 className="h-5 w-5 text-ion" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">BrainFlow</p>
          <p className="text-xs text-slate-500">Realtime workspace</p>
        </div>
      </div>

      <div className="mb-6">
        <WorkspaceSwitcher />
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition',
                isActive ? 'bg-white/10 text-white shadow-glow' : 'text-slate-400 hover:bg-white/[0.07] hover:text-slate-100',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
