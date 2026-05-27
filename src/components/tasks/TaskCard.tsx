import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Circle, GripVertical, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import type { Task } from '../../types/task';
import { Badge } from '../ui/Badge';
import { GlassPanel } from '../ui/GlassPanel';
import { cn } from '../../lib/cn';
import { AvatarStack } from '../collaboration/MemberAvatar';
import { useUiStore } from '../../stores/uiStore';

export function TaskCard({ task }: { task: Task }) {
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);
  const focusedTaskId = useTaskStore((state) => state.focusedTaskId);
  const selectedTaskIds = useTaskStore((state) => state.selectedTaskIds);
  const selectTask = useTaskStore((state) => state.selectTask);
  const focusTask = useTaskStore((state) => state.focusTask);
  const toggleSelectedTask = useTaskStore((state) => state.toggleSelectedTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const members = useTaskStore((state) => state.members.filter((member) => member.workspaceId === task.workspaceId));
  const comments = useTaskStore((state) => state.comments.filter((comment) => comment.entityType === 'task' && comment.entityId === task.id));
  const setDetailsOpen = useUiStore((state) => state.setDetailsOpen);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const isSelected = selectedTaskId === task.id;
  const isFocused = focusedTaskId === task.id;
  const isMultiSelected = selectedTaskIds.includes(task.id);
  const assignees = members.filter((member) => task.assigneeIds.includes(member.userId));
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
  const progress = task.subtasks.length ? Math.round((completedSubtasks / task.subtasks.length) * 100) : 0;
  const priorityTone = useMemo(
    () =>
      ({
        Critical: 'from-rose-400 via-rose-300 to-orange-300',
        High: 'from-purple-400 via-fuchsia-300 to-sky-300',
        Medium: 'from-sky-300 via-cyan-300 to-teal-300',
        Low: 'from-slate-400 via-slate-300 to-slate-200',
      })[task.priority],
    [task.priority],
  );

  const openTask = () => {
    selectTask(task.id);
    setDetailsOpen(true);
  };

  const saveTitle = () => {
    const title = draftTitle.trim();
    if (title && title !== task.title) updateTask(task.id, { title }, 'Renamed task');
    setEditing(false);
  };

  return (
    <GlassPanel
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/task-id', task.id)}
      onFocus={() => focusTask(task.id)}
      onMouseEnter={() => focusTask(task.id)}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          toggleSelectedTask(task.id, true);
          return;
        }
        openTask();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') openTask();
        if (event.key === ' ') {
          event.preventDefault();
          toggleSelectedTask(task.id, true);
        }
      }}
      className={cn(
        'group relative overflow-hidden rounded-xl p-4 transition duration-200 hover:-translate-y-1 hover:border-white/[0.18] hover:bg-white/[0.075] hover:shadow-[0_24px_70px_rgba(0,0,0,0.32)]',
        isSelected && 'border-ion/40 bg-ion/[0.08] shadow-glow',
        isFocused && 'ring-2 ring-ion/25',
        isMultiSelected && 'border-ion/50 bg-ion/[0.12]',
        task.status === 'Completed' && 'opacity-75',
      )}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${priorityTone}`} />
      <div className="flex items-start gap-3">
        <GripVertical className="mt-1 h-4 w-4 shrink-0 text-slate-600 opacity-0 transition group-hover:opacity-100" />
        <button
          onClick={(event) => {
            event.stopPropagation();
            updateTask(task.id, { status: task.status === 'Completed' ? 'Inbox' : 'Completed' }, task.status === 'Completed' ? 'Reopened task' : 'Completed task');
          }}
          className="mt-0.5 text-slate-500 transition group-hover:text-ion focus:outline-none focus:ring-2 focus:ring-ion/40"
          aria-label="Complete task"
        >
          <motion.span animate={{ scale: task.status === 'Completed' ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.24 }} className="block">
            {task.status === 'Completed' ? <CheckCircle2 className="h-5 w-5 text-ion" /> : <Circle className="h-5 w-5" />}
          </motion.span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <input
                autoFocus
                value={draftTitle}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setDraftTitle(event.target.value)}
                onBlur={saveTitle}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveTitle();
                  if (event.key === 'Escape') {
                    setDraftTitle(task.title);
                    setEditing(false);
                  }
                }}
                className="min-w-0 flex-1 rounded-md border border-ion/30 bg-black/30 px-2 py-1 text-sm font-semibold text-white outline-none"
              />
            ) : (
              <h3 className={cn('min-w-0 flex-1 truncate text-sm font-semibold text-white', task.status === 'Completed' && 'line-through decoration-ion/50')}>{task.title}</h3>
            )}
            <AvatarStack members={assignees} />
            <Badge label={task.priority} />
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{task.description || 'Ready for details.'}</p>
          {task.subtasks.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                <motion.div className="h-full rounded-full bg-ion" initial={false} animate={{ width: `${progress}%` }} />
              </div>
              <span className="text-[11px] text-slate-500">
                {completedSubtasks}/{task.subtasks.length}
              </span>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {task.dueDate}
              </span>
            )}
            {task.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-white/[0.06] px-2 py-1">
                {tag}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {comments.length}
            </span>
            <span className="rounded-md bg-white/[0.06] px-2 py-1">{task.spaceType}</span>
          </div>
        </div>
        <div className="flex shrink-0 translate-x-2 flex-col gap-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setEditing(true);
            }}
            className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Edit task title"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              deleteTask(task.id);
            }}
            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-200"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
