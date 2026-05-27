import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CheckCircle2, FileText, Link2, MessageSquare, Paperclip, Plus, StickyNote, Tag, Trash2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import type { TaskPriority, TaskStatus } from '../../types/task';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useUiStore } from '../../stores/uiStore';

const statuses: TaskStatus[] = ['Inbox', 'Today', 'Upcoming', 'In Progress', 'Waiting', 'Completed', 'Archived'];
const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export function DetailsPanel() {
  const task = useTaskStore((state) => state.tasks.find((item) => item.id === state.selectedTaskId));
  const members = useTaskStore((state) => state.members);
  const comments = useTaskStore((state) => state.taskComments.filter((comment) => comment.taskId === state.selectedTaskId));
  const activity = useTaskStore((state) => state.taskActivity.filter((item) => item.taskId === state.selectedTaskId));
  const updateTask = useTaskStore((state) => state.updateTask);
  const addSubtask = useTaskStore((state) => state.addSubtask);
  const toggleSubtask = useTaskStore((state) => state.toggleSubtask);
  const removeSubtask = useTaskStore((state) => state.removeSubtask);
  const addNote = useTaskStore((state) => state.addNote);
  const addAttachment = useTaskStore((state) => state.addAttachment);
  const addComment = useTaskStore((state) => state.addComment);
  const detailsOpen = useUiStore((state) => state.detailsOpen);
  const setDetailsOpen = useUiStore((state) => state.setDetailsOpen);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [note, setNote] = useState('');
  const [comment, setComment] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const assignees = useMemo(() => (task ? members.filter((member) => task.assigneeIds.includes(member.userId)) : []), [members, task]);
  const markdown = useMemo(() => renderMarkdown(task?.description ?? ''), [task?.description]);

  return (
    <AnimatePresence>
      {detailsOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="hidden min-h-0 border-l border-white/10 bg-white/[0.035] xl:block"
        >
          {task ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Badge label={task.priority} />
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs text-slate-400">{task.status}</span>
                </div>
                <button onClick={() => setDetailsOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-white" aria-label="Close details">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
                <textarea
                  value={task.title}
                  onChange={(event) => updateTask(task.id, { title: event.target.value }, 'Edited title')}
                  className="min-h-[76px] w-full resize-none bg-transparent text-2xl font-semibold leading-tight text-white outline-none placeholder:text-slate-600"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field icon={<Calendar className="h-4 w-4 text-ion" />} label="Due">
                    <input type="date" value={task.dueDate ?? ''} onChange={(event) => updateTask(task.id, { dueDate: event.target.value || null }, 'Changed due date')} className="w-full bg-transparent text-sm text-white outline-none" />
                  </Field>
                  <Field icon={<CheckCircle2 className="h-4 w-4 text-plasma" />} label="Status">
                    <select value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus }, 'Changed status')} className="w-full bg-graphite text-sm text-white outline-none">
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </Field>
                  <Field icon={<Tag className="h-4 w-4 text-ember" />} label="Priority">
                    <select value={task.priority} onChange={(event) => updateTask(task.id, { priority: event.target.value as TaskPriority }, 'Changed priority')} className="w-full bg-graphite text-sm text-white outline-none">
                      {priorities.map((priority) => (
                        <option key={priority}>{priority}</option>
                      ))}
                    </select>
                  </Field>
                  <Field icon={<MessageSquare className="h-4 w-4 text-slate-400" />} label="Assignees">
                    <div className="truncate text-sm text-white">{assignees.map((member) => member.displayName).join(', ') || 'Unassigned'}</div>
                  </Field>
                </div>

                <PanelSection title="Description" icon={<FileText className="h-4 w-4" />}>
                  <textarea
                    value={task.description}
                    onChange={(event) => updateTask(task.id, { description: event.target.value }, 'Edited description')}
                    placeholder="Write markdown notes, decisions, links, and context..."
                    className="min-h-[130px] w-full resize-none rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-6 text-slate-200 outline-none focus:border-ion/40"
                  />
                  {task.description && <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-slate-300" dangerouslySetInnerHTML={{ __html: markdown }} />}
                </PanelSection>

                <PanelSection title="Tags" icon={<Tag className="h-4 w-4" />}>
                  <input
                    value={task.tags.join(', ')}
                    onChange={(event) =>
                      updateTask(
                        task.id,
                        { tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) },
                        'Edited tags',
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-ion/40"
                    placeholder="firebase, ux, launch"
                  />
                </PanelSection>

                <PanelSection title="Subtasks" icon={<CheckCircle2 className="h-4 w-4" />}>
                  <div className="space-y-2">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-sm text-slate-300">
                        <button onClick={() => toggleSubtask(task.id, subtask.id)} className="text-ion">
                          <CheckCircle2 className={`h-4 w-4 ${subtask.completed ? 'opacity-100' : 'opacity-30'}`} />
                        </button>
                        <span className={subtask.completed ? 'flex-1 line-through text-slate-500' : 'flex-1'}>{subtask.title}</span>
                        <button onClick={() => removeSubtask(task.id, subtask.id)} className="text-slate-500 hover:text-rose-200">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <InlineAdd value={subtaskTitle} setValue={setSubtaskTitle} placeholder="Add subtask" onAdd={() => { addSubtask(task.id, subtaskTitle); setSubtaskTitle(''); }} />
                </PanelSection>

                <PanelSection title="Notes" icon={<StickyNote className="h-4 w-4" />}>
                  <div className="space-y-2">
                    {task.notes.map((item, index) => (
                      <div key={`${item}-${index}`} className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3 text-sm leading-6 text-slate-300">{item}</div>
                    ))}
                  </div>
                  <InlineAdd value={note} setValue={setNote} placeholder="Capture note" onAdd={() => { addNote(task.id, note); setNote(''); }} />
                </PanelSection>

                <PanelSection title="Attachments" icon={<Paperclip className="h-4 w-4" />}>
                  <div className="space-y-2">
                    {task.attachments.map((attachment) => (
                      <a key={attachment.id} href={attachment.url} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-slate-300 hover:text-white">
                        <Link2 className="h-4 w-4 text-ion" /> {attachment.name}
                      </a>
                    ))}
                  </div>
                  <InlineAdd value={attachmentUrl} setValue={setAttachmentUrl} placeholder="Paste attachment URL" onAdd={() => { addAttachment(task.id, { name: attachmentUrl.replace(/^https?:\/\//, '') || 'Attachment', url: attachmentUrl, type: 'link' }); setAttachmentUrl(''); }} />
                </PanelSection>

                <PanelSection title="Activity" icon={<MessageSquare className="h-4 w-4" />}>
                  <div className="space-y-2">
                    {comments.map((item) => (
                      <div key={item.id} className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-slate-300">{item.body}</div>
                    ))}
                    {activity.map((item) => (
                      <div key={item.id} className="text-xs text-slate-500">{item.detail}</div>
                    ))}
                  </div>
                  <InlineAdd value={comment} setValue={setComment} placeholder="Add comment" onAdd={() => { addComment(task.id, comment); setComment(''); }} />
                </PanelSection>
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-slate-500">Select a task to inspect details, activity, notes, and edits.</div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <label className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
      <span className="mb-2 flex items-center gap-2 text-xs text-slate-500">{icon}{label}</span>
      {children}
    </label>
  );
}

function PanelSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{icon}{title}</div>
      {children}
    </section>
  );
}

function InlineAdd({ value, setValue, placeholder, onAdd }: { value: string; setValue: (value: string) => void; placeholder: string; onAdd: () => void }) {
  return (
    <div className="mt-2 flex gap-2">
      <input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onAdd()} placeholder={placeholder} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-ion/40" />
      <Button className="h-9 w-9 px-0" onClick={onAdd} icon={<Plus className="h-4 w-4" />} aria-label={placeholder} />
    </div>
  );
}

function renderMarkdown(markdown: string) {
  return markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-black/30 px-1 py-0.5 text-ion">$1</code>')
    .replace(/\n/g, '<br />');
}
