import { FolderKanban, Radio, UsersRound } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { AvatarStack } from './MemberAvatar';

export function SharedProjectDashboard() {
  const selectedWorkspaceId = useTaskStore((state) => state.selectedWorkspaceId);
  const projects = useTaskStore((state) => state.projects.filter((project) => project.workspaceId === selectedWorkspaceId));
  const tasks = useTaskStore((state) => state.tasks.filter((task) => task.workspaceId === selectedWorkspaceId));
  const members = useTaskStore((state) => state.members.filter((member) => member.workspaceId === selectedWorkspaceId));
  const comments = useTaskStore((state) => state.comments.filter((comment) => comment.workspaceId === selectedWorkspaceId));

  return (
    <div className="border-b border-white/10 bg-white/[0.025] px-4 py-4 sm:px-6">
      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
            <FolderKanban className="mb-3 h-4 w-4 text-ion" />
            <p className="text-2xl font-semibold text-white">{projects.length}</p>
            <p className="text-xs text-slate-500">Shared projects</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
            <UsersRound className="mb-3 h-4 w-4 text-emerald-300" />
            <p className="text-2xl font-semibold text-white">{members.length}</p>
            <p className="text-xs text-slate-500">Workspace members</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
            <Radio className="mb-3 h-4 w-4 text-amber-300" />
            <p className="text-2xl font-semibold text-white">{comments.length}</p>
            <p className="text-xs text-slate-500">Open threads</p>
          </div>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Project followers</p>
          <div className="space-y-3">
            {projects.map((project) => {
              const followers = members.filter((member) => project.followerIds.includes(member.userId));
              const projectTasks = tasks.filter((task) => task.projectId === project.id);
              return (
                <div key={project.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{project.name}</p>
                    <p className="text-xs text-slate-500">{projectTasks.length} tasks</p>
                  </div>
                  <AvatarStack members={followers} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
