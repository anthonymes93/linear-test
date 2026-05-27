import { ChevronDown, Settings, UserPlus } from 'lucide-react';
import { can } from '../../lib/permissions';
import { useTaskStore } from '../../stores/taskStore';
import { Button } from '../ui/Button';
import { AvatarStack } from './MemberAvatar';

export function WorkspaceSwitcher() {
  const workspaces = useTaskStore((state) => state.workspaces);
  const members = useTaskStore((state) => state.members);
  const selectedWorkspaceId = useTaskStore((state) => state.selectedWorkspaceId);
  const selectWorkspace = useTaskStore((state) => state.selectWorkspace);
  const currentUserId = useTaskStore((state) => state.currentUserId);
  const workspace = workspaces.find((item) => item.id === selectedWorkspaceId) ?? workspaces[0];
  const workspaceMembers = members.filter((member) => member.workspaceId === workspace.id);
  const currentMember = workspaceMembers.find((member) => member.userId === currentUserId);

  return (
    <section className="rounded-xl border border-white/10 bg-black/20 p-3">
      <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500" htmlFor="workspace">
        Workspace
      </label>
      <div className="mt-2 flex items-center gap-2">
        <select
          id="workspace"
          value={workspace.id}
          onChange={(event) => selectWorkspace(event.target.value)}
          className="min-w-0 flex-1 appearance-none rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none"
        >
          {workspaces.map((item) => (
            <option key={item.id} value={item.id} className="bg-graphite">
              {item.name}
            </option>
          ))}
        </select>
        <ChevronDown className="-ml-8 h-4 w-4 pointer-events-none text-slate-500" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">{workspace.plan === 'Team' ? 'Team space' : 'Personal space'}</p>
          <p className="text-[11px] text-slate-500">{currentMember?.role ?? 'No role'}</p>
        </div>
        <AvatarStack members={workspaceMembers} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="panel" className="h-8 text-xs" disabled={!can(currentMember?.role, 'invite')} icon={<UserPlus className="h-3.5 w-3.5" />}>
          Invite
        </Button>
        <Button variant="panel" className="h-8 text-xs" disabled={!can(currentMember?.role, 'manageWorkspaceSettings')} icon={<Settings className="h-3.5 w-3.5" />}>
          Settings
        </Button>
      </div>
    </section>
  );
}
