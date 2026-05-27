import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, Forward, Moon, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useOverlayStore } from '../../stores/overlayStore';
import { useTaskStore } from '../../stores/taskStore';
import { Button } from '../ui/Button';

export function FocusMode() {
  const open = useOverlayStore((state) => state.focusModeOpen);
  const setOpen = useOverlayStore((state) => state.setFocusModeOpen);
  const tasks = useTaskStore((state) => state.tasks);
  const focusedTaskId = useTaskStore((state) => state.focusedTaskId);
  const updateTask = useTaskStore((state) => state.updateTask);
  const addNote = useTaskStore((state) => state.addNote);
  const focusTask = useTaskStore((state) => state.focusTask);
  const [note, setNote] = useState('');
  const task = useMemo(() => tasks.find((item) => item.id === focusedTaskId) ?? tasks.find((item) => item.status !== 'Completed'), [focusedTaskId, tasks]);

  const nextTask = () => {
    if (!task) return;
    const openTasks = tasks.filter((item) => item.status !== 'Completed' && item.id !== task.id);
    focusTask(openTasks[0]?.id ?? null);
  };

  const saveNote = () => {
    if (task && note.trim()) {
      addNote(task.id, note);
      setNote('');
    }
  };

  return (
    <AnimatePresence>
      {open && task && (
        <div className="fixed inset-0 z-[60] overflow-hidden bg-obsidian/95 backdrop-blur-xl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(125,211,252,0.16),transparent_34rem)]" />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-5 sm:px-8"
          >
            <header className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em]">
                <Moon className="h-4 w-4 text-ion" /> Focus Mode
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close focus mode">
                <X className="h-5 w-5" />
              </button>
            </header>
            <main className="grid flex-1 place-items-center py-8">
              <section className="w-full max-w-4xl text-center">
                <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-400">
                  <Clock3 className="h-4 w-4 text-ion" /> Timer ready
                </div>
                <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl">{task.title}</h1>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">{task.description || 'One task, one clear next move.'}</p>
                <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                  <Button
                    onClick={() => {
                      updateTask(task.id, { status: 'Completed' }, 'Completed in focus mode');
                      toast.success('Task completed');
                      nextTask();
                    }}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Complete
                  </Button>
                  <Button onClick={nextTask} icon={<Forward className="h-4 w-4" />}>
                    Skip
                  </Button>
                  <Button
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      updateTask(task.id, { status: 'Upcoming', dueDate: tomorrow.toISOString().slice(0, 10) }, 'Snoozed from focus mode');
                      nextTask();
                    }}
                    icon={<Clock3 className="h-4 w-4" />}
                  >
                    Snooze
                  </Button>
                </div>
                <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-white/10 bg-white/[0.045] p-3 text-left">
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    onBlur={saveNote}
                    placeholder="Notes for this task..."
                    className="min-h-32 w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </section>
            </main>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
