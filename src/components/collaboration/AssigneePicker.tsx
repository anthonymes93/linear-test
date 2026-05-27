import { AtSign, Check } from 'lucide-react';
import type { Task } from '../../types/task';
import type { WorkspaceMember } from '../../types/collaboration';
import { MemberAvatar } from './MemberAvatar';

export function AssigneePicker({ task, members }: { task: Task; members: WorkspaceMember[] }) {
  const assignees = members.filter((member) => task.assigneeIds.includes(member.userId));
  const mentionOptions = members.filter((member) => member.status !== 'Invited').slice(0, 3);

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Assignees</p>
        <div className="space-y-2">
          {assignees.map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.04] p-2">
              <MemberAvatar member={member} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{member.name}</p>
                <p className="text-xs text-slate-500">{member.role}</p>
              </div>
              <Check className="h-4 w-4 text-emerald-300" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Mention autocomplete</p>
        <div className="flex flex-wrap gap-2">
          {mentionOptions.map((member) => (
            <span key={member.id} className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-1 text-xs text-slate-300">
              <AtSign className="h-3 w-3 text-ion" />
              {member.name.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
