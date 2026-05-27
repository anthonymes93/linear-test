import { CalendarDays, CheckCircle2, Circle, Eye, MessageSquare } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { Task } from '../../types/task';
import { Badge } from '../ui/Badge';
import { GlassPanel } from '../ui/GlassPanel';
import { cn } from '../../lib/cn';
import { AvatarStack } from '../collaboration/MemberAvatar';

export function TaskCard({ task }: { task: Task }) {
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);
  const selectTask = useTaskStore((state) => state.selectTask);
  const members = useTaskStore((state) => state.members.filter((member) => member.workspaceId === task.workspaceId));
  const comments = useTaskStore((state) => state.comments.filter((comment) => comment.entityType === 'task' && comment.entityId === task.id));
  const isSelected = selectedTaskId === task.id;
  const assignees = members.filter((member) => task.assigneeIds.includes(member.userId));

  return (
    <GlassPanel
      role="button"
      tabIndex={0}
      onClick={() => selectTask(task.id)}
      onKeyDown={(event) => event.key === 'Enter' && selectTask(task.id)}
      className={cn(
        'group rounded-xl p-4 transition duration-150 hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-white/[0.075]',
        isSelected && 'border-ion/40 bg-ion/[0.08] shadow-glow',
      )}
    >
      <div className="flex items-start gap-3">
        <button className="mt-0.5 text-slate-500 transition group-hover:text-ion" aria-label="Complete task">
          {task.status === 'Completed' ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{task.title}</h3>
            <AvatarStack members={assignees} />
            <Badge label={task.priority} />
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{task.description || 'Ready for details.'}</p>
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
            <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1">
              <Eye className="h-3.5 w-3.5" />
              {task.watcherIds.length}
            </span>
            <span className="rounded-md bg-white/[0.06] px-2 py-1">{task.spaceType}</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
