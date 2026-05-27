import { motion } from 'framer-motion';
import { Calendar, FileText, Paperclip } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { Badge } from '../ui/Badge';

export function DetailsPanel() {
  const task = useTaskStore((state) => state.tasks.find((item) => item.id === state.selectedTaskId));

  return (
    <aside className="hidden border-l border-white/10 bg-white/[0.035] p-5 xl:block">
      {task ? (
        <motion.div key={task.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <Badge label={task.priority} />
              <span className="text-xs text-slate-500">{task.status}</span>
            </div>
            <h2 className="text-xl font-semibold leading-tight text-white">{task.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{task.description || 'No description yet.'}</p>
          </div>

          <div className="grid gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
              <Calendar className="h-4 w-4 text-ion" />
              {task.dueDate ?? 'No due date'}
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
              <FileText className="h-4 w-4 text-plasma" />
              {task.notes.length} notes
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
              <Paperclip className="h-4 w-4 text-ember" />
              {task.attachments.length} attachments
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Subtasks</p>
            <div className="space-y-2">
              {task.subtasks.length ? (
                task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-slate-300">
                    {subtask.title}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No subtasks yet.</p>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid h-full place-items-center text-sm text-slate-500">Select a task</div>
      )}
    </aside>
  );
}
