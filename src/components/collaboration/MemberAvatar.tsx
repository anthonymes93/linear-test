import type { WorkspaceMember } from '../../types/collaboration';

export function MemberAvatar({ member, size = 'md' }: { member: WorkspaceMember; size?: 'sm' | 'md' }) {
  const initials = member.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <span
      title={`${member.name} - ${member.role}`}
      className={size === 'sm' ? 'grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-obsidian' : 'grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-obsidian'}
      style={{ backgroundColor: member.avatarColor }}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ members }: { members: WorkspaceMember[] }) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 4).map((member) => (
        <span key={member.id} className="rounded-full border-2 border-graphite">
          <MemberAvatar member={member} size="sm" />
        </span>
      ))}
      {members.length > 4 && <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-graphite bg-white/10 text-[10px] text-slate-300">+{members.length - 4}</span>}
    </div>
  );
}
