import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Inbox, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../stores/taskStore';
import { useUiStore } from '../../stores/uiStore';

const destinations = [
  { label: 'Inbox', path: '/inbox' },
  { label: 'Today', path: '/today' },
  { label: 'Upcoming', path: '/upcoming' },
  { label: 'In Progress', path: '/in-progress' },
];

export function CommandPalette() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const open = useUiStore((state) => state.commandOpen);
  const setOpen = useUiStore((state) => state.setCommandOpen);
  const addTask = useTaskStore((state) => state.addTask);
  const selectedCount = useTaskStore((state) => state.selectedTaskIds.length);
  const bulkUpdateStatus = useTaskStore((state) => state.bulkUpdateStatus);
  const bulkDelete = useTaskStore((state) => state.bulkDelete);

  const createTask = () => {
    const title = query.trim() || 'New task';
    const task = addTask(title);
    toast.success(`Created ${task.title}`);
    setQuery('');
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Command palette" className="relative z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/55 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-start justify-center px-4 pt-[14vh]" onMouseDown={() => setOpen(false)}>
            <motion.div
              onMouseDown={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.12] bg-graphite/[0.92] shadow-glass backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-4">
                <Search className="h-5 w-5 text-slate-500" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') createTask();
                  }}
                  placeholder="Create task or jump to a workspace..."
                  className="h-14 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="p-2">
                <button onClick={createTask} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-200 transition hover:bg-white/[0.08]">
                  <Plus className="h-4 w-4 text-ion" />
                  Create task {query && <span className="truncate text-slate-500">"{query}"</span>}
                </button>
                {destinations.map((destination) => (
                  <button
                    key={destination.path}
                    onClick={() => {
                      navigate(destination.path);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.08]"
                  >
                    <Inbox className="h-4 w-4 text-slate-500" />
                    Jump to {destination.label}
                  </button>
                ))}
                {selectedCount > 0 && (
                  <>
                    <button
                      onClick={() => {
                        bulkUpdateStatus('Completed');
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.08]"
                    >
                      <CheckCircle2 className="h-4 w-4 text-ion" />
                      Complete {selectedCount} selected
                    </button>
                    <button
                      onClick={() => {
                        bulkDelete();
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-rose-200 transition hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete {selectedCount} selected
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
