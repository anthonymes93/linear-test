import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTaskStore } from '../../stores/taskStore';
import type { TaskStatus } from '../../types/task';
import { Button } from '../ui/Button';

export function EmptyState({ status }: { status: TaskStatus }) {
  const addTask = useTaskStore((state) => state.addTask);

  return (
    <div className="grid h-full min-h-[420px] place-items-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.08] shadow-glow">
          <Sparkles className="h-5 w-5 text-ion" />
        </div>
        <h2 className="text-lg font-semibold text-white">No {status.toLowerCase()} tasks</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Your workflow is clear here. Create a focused task when this lane needs attention.</p>
        <Button
          className="mt-5"
          variant="primary"
          onClick={() => {
            const task = addTask('New focused task', status);
            toast.success(`Created ${task.title}`);
          }}
        >
          Add task
        </Button>
      </div>
    </div>
  );
}
