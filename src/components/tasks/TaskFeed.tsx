import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { routeToStatus } from '../../routes/routeMap';
import { useTaskStore } from '../../stores/taskStore';
import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';

export function TaskFeed() {
  const params = useParams();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const status = routeToStatus(params.status);
  const filteredTasks = useMemo(() => tasks.filter((task) => task.status === status), [status, tasks]);

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Loading task stream...</div>;
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
