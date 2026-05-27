import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownAZ, Layers3, ListFilter, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { useParams } from 'react-router-dom';
import { routeToStatus } from '../../routes/routeMap';
import { groupTasks, selectVisibleTasks } from '../../stores/taskSelectors';
import { useTaskStore } from '../../stores/taskStore';
import type { TaskGroupKey, TaskPriority, TaskSortKey, TaskStatus } from '../../types/task';
import { Button } from '../ui/Button';
import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import { Skeleton } from '../ui/Skeleton';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export function TaskFeed() {
  const params = useParams();
  const tasks = useTaskStore((state) => state.tasks);
  const members = useTaskStore((state) => state.members);
  const selectedWorkspaceId = useTaskStore((state) => state.selectedWorkspaceId);
  const isLoading = useTaskStore((state) => state.isLoading);
  const filters = useTaskStore((state) => state.filters);
  const selectedTaskIds = useTaskStore((state) => state.selectedTaskIds);
  const setFilter = useTaskStore((state) => state.setFilter);
  const resetFilters = useTaskStore((state) => state.resetFilters);
  const bulkUpdateStatus = useTaskStore((state) => state.bulkUpdateStatus);
  const bulkDelete = useTaskStore((state) => state.bulkDelete);
  const moveTask = useTaskStore((state) => state.moveTask);
  const status = routeToStatus(params.status);
  const [search, setSearch] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(search);
  const filteredTasks = useMemo(
    () => selectVisibleTasks(tasks, selectedWorkspaceId, status, filters),
    [filters, selectedWorkspaceId, status, tasks],
  );
  const groups = useMemo(() => groupTasks(filteredTasks, filters, members), [filteredTasks, filters, members]);

  useEffect(() => {
    setFilter('search', debouncedSearch);
  }, [debouncedSearch, setFilter]);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    const taskId = event.dataTransfer.getData('text/task-id');
    const beforeTaskId = (event.target as HTMLElement).closest<HTMLElement>('[data-task-id]')?.dataset.taskId;
    if (taskId) moveTask(taskId, status as TaskStatus, beforeTaskId);
  };

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
    return (
      <div className="p-4 sm:p-6">
        <TaskToolbar
          search={search}
          setSearch={setSearch}
          filters={filters}
          selectedCount={selectedTaskIds.length}
          setFilter={setFilter}
          resetFilters={resetFilters}
          bulkUpdateStatus={bulkUpdateStatus}
          bulkDelete={bulkDelete}
        />
        <EmptyState status={status} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
      <TaskToolbar
        search={search}
        setSearch={setSearch}
        filters={filters}
        selectedCount={selectedTaskIds.length}
        setFilter={setFilter}
        resetFilters={resetFilters}
        bulkUpdateStatus={bulkUpdateStatus}
        bulkDelete={bulkDelete}
      />
      {groups.map((group) => (
        <section key={group.label} className="space-y-3">
          {filters.groupBy !== 'none' && (
            <div className="flex items-center gap-3 px-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              <span>{group.label}</span>
              <span className="h-px flex-1 bg-white/10" />
              <span>{group.tasks.length}</span>
            </div>
          )}
          <AnimatePresence initial={false}>
            {group.tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                data-task-id={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      ))}
    </div>
  );
}

function TaskToolbar({
  search,
  setSearch,
  filters,
  selectedCount,
  setFilter,
  resetFilters,
  bulkUpdateStatus,
  bulkDelete,
}: {
  search: string;
  setSearch: (value: string) => void;
  filters: ReturnType<typeof useTaskStore.getState>['filters'];
  selectedCount: number;
  setFilter: ReturnType<typeof useTaskStore.getState>['setFilter'];
  resetFilters: () => void;
  bulkUpdateStatus: (status: TaskStatus) => void;
  bulkDelete: () => void;
}) {
  const togglePriority = (priority: TaskPriority) => {
    setFilter('priorities', filters.priorities.includes(priority) ? filters.priorities.filter((item) => item !== priority) : [...filters.priorities, priority]);
  };

  return (
    <div className="sticky top-0 z-[9] -mx-1 space-y-3 rounded-xl border border-white/10 bg-obsidian/70 p-3 shadow-glass backdrop-blur-xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm text-slate-400 focus-within:border-ion/40">
          <Search className="h-4 w-4 shrink-0" />
          <input
            data-task-search
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks, tags, notes..."
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {(['Critical', 'High', 'Medium', 'Low'] as TaskPriority[]).map((priority) => (
            <button
              key={priority}
              onClick={() => togglePriority(priority)}
              className={`rounded-lg border px-3 py-2 text-xs transition ${filters.priorities.includes(priority) ? 'border-ion/40 bg-ion/10 text-white' : 'border-white/10 bg-white/[0.045] text-slate-400 hover:text-white'}`}
            >
              {priority}
            </button>
          ))}
          <select value={filters.sortBy} onChange={(event) => setFilter('sortBy', event.target.value as TaskSortKey)} className="h-9 rounded-lg border border-white/10 bg-graphite px-2 text-xs text-slate-300 outline-none">
            <option value="order">Manual</option>
            <option value="updatedAt">Updated</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
          <button onClick={() => setFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')} className="h-9 rounded-lg border border-white/10 bg-white/[0.045] px-2 text-slate-300">
            <ArrowDownAZ className="h-4 w-4" />
          </button>
          <select value={filters.groupBy} onChange={(event) => setFilter('groupBy', event.target.value as TaskGroupKey)} className="h-9 rounded-lg border border-white/10 bg-graphite px-2 text-xs text-slate-300 outline-none">
            <option value="none">No group</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due date</option>
            <option value="assignee">Assignee</option>
          </select>
          <Button className="h-9" onClick={resetFilters} icon={<ListFilter className="h-4 w-4" />}>
            Reset
          </Button>
        </div>
      </div>
      {selectedCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2 rounded-lg border border-ion/20 bg-ion/[0.08] p-2">
          <span className="mr-auto px-2 text-sm text-sky-100">{selectedCount} selected</span>
          <Button className="h-8" onClick={() => bulkUpdateStatus('Today')} icon={<Layers3 className="h-4 w-4" />}>
            Today
          </Button>
          <Button className="h-8" onClick={() => bulkUpdateStatus('Completed')} icon={<Layers3 className="h-4 w-4" />}>
            Complete
          </Button>
          <Button className="h-8 text-rose-200" onClick={bulkDelete} icon={<Trash2 className="h-4 w-4" />}>
            Delete
          </Button>
        </motion.div>
      )}
    </div>
  );
}
