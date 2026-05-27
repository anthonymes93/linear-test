import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { routeToStatus } from '../../routes/routeMap';
import { useTaskStore } from '../../stores/taskStore';
import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import { Skeleton } from '../ui/Skeleton';

export function TaskFeed() {
  const params = useParams();
  const tasks = useTaskStore((state) => state.tasks);
  const selectedWorkspaceId = useTaskStore((state) => state.selectedWorkspaceId);
  const isLoading = useTaskStore((state) => state.isLoading);
  const status = routeToStatus(params.status);
  const filteredTasks = useMemo(() => tasks.filter((task) => task.status === status && task.workspaceId === selectedWorkspaceId), [selectedWorkspaceId, status, tasks]);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4 sm:p-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
            <div className="mt-5 flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!filteredTasks.length) {
    return <EmptyState status={status} />;
  }

  return (
    <div className="space-y-3 p-4 sm:p-6">
      <AnimatePresence initial={false}>
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <TaskCard task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
