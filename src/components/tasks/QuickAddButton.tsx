import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { routeToStatus } from '../../routes/routeMap';
import { parseNaturalLanguageTask } from '../../lib/naturalLanguageParser';
import { useTaskStore } from '../../stores/taskStore';
import { useUiStore } from '../../stores/uiStore';

export function QuickAddButton() {
  const params = useParams();
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const quickAddOpen = useUiStore((state) => state.quickAddOpen);
  const setQuickAddOpen = useUiStore((state) => state.setQuickAddOpen);
  const [title, setTitle] = useState('');
  const status = routeToStatus(params.status);

  const create = () => {
    const parsed = parseNaturalLanguageTask(title.trim() || 'New task', status);
    const task = addTask(parsed.title, parsed.status);
    updateTask(
      task.id,
      {
        dueDate: parsed.dueDate,
        priority: parsed.priority,
        tags: parsed.tags,
        description: parsed.dueTime ? `Due at ${parsed.dueTime}` : task.description,
      },
      'Created with natural language quick add',
    );
    toast.success(`Created ${task.title}`);
    setTitle('');
    setQuickAddOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {quickAddOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="fixed bottom-24 right-5 z-40 w-[min(420px,calc(100vw-40px))] rounded-2xl border border-white/10 bg-graphite/95 p-3 shadow-glass backdrop-blur-xl"
          >
            <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-ion" /> Quick add to {status}
            </div>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') create();
                if (event.key === 'Escape') setQuickAddOpen(false);
              }}
              placeholder="Call Mike tomorrow at 3pm high priority #client"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-ion/40"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-white text-obsidian shadow-glow transition hover:-translate-y-0.5 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-ion/50"
        aria-label="Quick add task"
        onClick={() => setQuickAddOpen(!quickAddOpen)}
      >
        <Plus className="h-6 w-6" />
      </button>
    </>
  );
}
