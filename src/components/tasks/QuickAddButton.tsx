import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { routeToStatus } from '../../routes/routeMap';
import { useTaskStore } from '../../stores/taskStore';

export function QuickAddButton() {
  const params = useParams();
  const addTask = useTaskStore((state) => state.addTask);

  return (
    <button
      className="fixed bottom-5 right-5 grid h-14 w-14 place-items-center rounded-2xl bg-white text-obsidian shadow-glow transition hover:-translate-y-0.5 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-ion/50"
      aria-label="Quick add task"
      onClick={() => {
        const task = addTask('New task', routeToStatus(params.status));
        toast.success(`Created ${task.title}`);
      }}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
