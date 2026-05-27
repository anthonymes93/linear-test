import { MessageSquare, Radio } from 'lucide-react';
import type { ActivityLog, CollaborationComment, WorkspaceMember } from '../../types/collaboration';
import { MemberAvatar } from './MemberAvatar';

function findMember(members: WorkspaceMember[], userId: string) {
  return members.find((member) => member.userId === userId);
}

export function CommentThread({
  comments,
  activityLogs,
  members,
}: {
  comments: CollaborationComment[];
  activityLogs: ActivityLog[];
  members: WorkspaceMember[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Comments</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-200">
            <Radio className="h-3 w-3" />
            Typing-ready
          </span>
        </div>
        <div className="space-y-3">
          {comments.length ? (
            comments.map((comment) => {
              const author = findMember(members, comment.authorId);
              return (
                <article key={comment.id} className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    {author && <MemberAvatar member={author} size="sm" />}
                    <div>
                      <p className="text-sm font-medium text-white">{author?.name ?? 'Unknown member'}</p>
                      <p className="text-[11px] text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{comment.body}</p>
                </article>
              );
            })
          ) : (
            <p className="rounded-lg border border-dashed border-white/[0.08] p-3 text-sm text-slate-500">No comments yet.</p>
          )}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Activity</p>
        <div className="space-y-3">
          {activityLogs.map((activity) => {
            const actor = findMember(members, activity.actorId);
            return (
              <div key={activity.id} className="flex gap-3 text-sm">
                <span className="mt-1 grid h-6 w-6 place-items-center rounded-full bg-white/[0.06]">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-300" />
                </span>
                <p className="min-w-0 flex-1 leading-6 text-slate-400">
                  <span className="font-medium text-slate-200">{actor?.name ?? 'System'}</span> {activity.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
