import { useParams } from 'react-router-dom';
import { routeToStatus } from './routeMap';
import { TaskFeed } from '../components/tasks/TaskFeed';
import { Skeleton } from '../components/ui/Skeleton';
import { useTaskStore } from '../stores/taskStore';

export function Dashboard() {
  const params = useParams();
  const status = routeToStatus(params.status);
  const isLoading = useTaskStore((state) => state.isLoading);

  return (
    <section className="min-h-0 flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-obsidian/70 px-4 py-5 backdrop-blur-xl sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Task lane</p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{status}</h1>
          </div>
          <div className="hidden gap-2 sm:flex">
            {isLoading ? <Skeleton className="h-8 w-24" /> : <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-slate-400">Live-ready</span>}
          </div>
        </div>
      </div>
      <TaskFeed />
    </section>
  );
}
