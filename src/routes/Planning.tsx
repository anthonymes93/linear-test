import { motion } from 'framer-motion';
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Flag,
  Handshake,
  KanbanSquare,
  Layers3,
  List,
  NotebookPen,
  Plus,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/cn';
import { projectStatuses, usePlanningStore } from '../stores/planningStore';
import { useTaskStore } from '../stores/taskStore';
import type { Project, ProjectStatus, Space } from '../types/planning';
import type { Task } from '../types/task';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { GlassPanel } from '../components/ui/GlassPanel';

const spaceIcons = {
  user: UserRound,
  briefcase: BriefcaseBusiness,
  handshake: Handshake,
  sparkles: Sparkles,
  book: BookOpen,
};

const tabs = [
  { id: 'dashboard', label: 'Overview', icon: Layers3 },
  { id: 'projects', label: 'Projects', icon: KanbanSquare },
  { id: 'week', label: 'Week', icon: CalendarDays },
] as const;

type PlanningTab = (typeof tabs)[number]['id'];

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function shortDate(value: string | null) {
  if (!value) return 'No date';
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function enrichSpaces(spaces: Space[], projects: Project[], tasks: Task[]) {
  return spaces
    .map((space) => {
      const spaceProjects = projects.filter((project) => project.spaceId === space.id);
      const taskIds = new Set(spaceProjects.flatMap((project) => project.linkedTaskIds));
      return { ...space, projectCount: spaceProjects.length, taskCount: tasks.filter((task) => taskIds.has(task.id) || task.spaceType === space.name).length };
    })
    .sort((a, b) => a.order - b.order);
}

function projectProgress(project: Project, tasks: Task[]) {
  const linked = tasks.filter((task) => project.linkedTaskIds.includes(task.id) || task.projectId === project.id);
  if (!linked.length) return project.progress;
  return Math.round((linked.filter((task) => task.status === 'Completed').length / linked.length) * 100);
}

export function Planning() {
  const params = useParams();
  const navigate = useNavigate();
  const tab = (params.tab as PlanningTab | undefined) ?? 'dashboard';
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const selectedWorkspaceId = useTaskStore((state) => state.selectedWorkspaceId);
  const spaces = usePlanningStore((state) => state.spaces);
  const projects = usePlanningStore((state) => state.projects);
  const sessions = usePlanningStore((state) => state.planningSessions);
  const addProject = usePlanningStore((state) => state.addProject);
  const selectProject = usePlanningStore((state) => state.selectProject);
  const selectedProjectId = usePlanningStore((state) => state.selectedProjectId);
  const updateProject = usePlanningStore((state) => state.updateProject);
  const addProjectNote = usePlanningStore((state) => state.addProjectNote);
  const linkTaskToProject = usePlanningStore((state) => state.linkTaskToProject);
  const assignTaskToDay = usePlanningStore((state) => state.assignTaskToDay);
  const enrichedSpaces = useMemo(() => enrichSpaces(spaces, projects, tasks), [spaces, projects, tasks]);
  const selectedProject = projects.find((project) => project.id === (params.projectId ?? selectedProjectId)) ?? projects[0];
  const activeProjects = projects.filter((project) => project.status === 'Active');
  const today = dateOnly(new Date());
  const overdue = tasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== 'Completed');
  const upcoming = tasks.filter((task) => task.dueDate && task.dueDate >= today && task.status !== 'Completed').sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
  const waiting = [...tasks.filter((task) => task.status === 'Waiting'), ...projects.filter((project) => project.status === 'Waiting')];
  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const session = sessions[0];

  const assign = (taskId: string, date: string) => {
    assignTaskToDay(taskId, date, selectedWorkspaceId);
    updateTask(taskId, { dueDate: date, status: date === today ? 'Today' : 'Upcoming' }, `Planned for ${date}`);
  };

  return (
    <section className="min-h-0 flex-1 overflow-y-auto">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-obsidian/75 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Strategic planning</p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Spaces, projects, and weekly flow</h1>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/planning/${item.id}`)}
                className={cn(
                  'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm transition',
                  tab === item.id ? 'border-ion/40 bg-ion/10 text-sky-100 shadow-glow' : 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-white',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        {tab === 'dashboard' && (
          <PlanningDashboard
            spaces={enrichedSpaces}
            projects={projects}
            activeProjects={activeProjects}
            overdue={overdue}
            upcoming={upcoming}
            waitingCount={waiting.length}
            focus={session?.focus}
            onNewProject={() =>
              addProject({
                workspaceId: selectedWorkspaceId,
                spaceId: enrichedSpaces[0]?.id ?? 'space-personal',
                title: 'New planning project',
              })
            }
          />
        )}
        {tab === 'projects' && selectedProject && (
          <ProjectsWorkspace
            spaces={enrichedSpaces}
            projects={projects}
            tasks={tasks}
            selectedProject={selectedProject}
            onSelectProject={(projectId) => {
              selectProject(projectId);
              navigate(`/planning/projects/${projectId}`);
            }}
            onUpdateProject={updateProject}
            onAddNote={addProjectNote}
            onLinkTask={(projectId, taskId) => {
              linkTaskToProject(projectId, taskId, selectedWorkspaceId);
              updateTask(taskId, { projectId }, 'Linked to project');
            }}
          />
        )}
        {tab === 'week' && (
          <WeeklyPlanner
            days={weekDays}
            tasks={tasks}
            projects={projects}
            taskDayMap={session?.taskDayMap ?? {}}
            onAssignTask={assign}
          />
        )}
      </div>
    </section>
  );
}

function PlanningDashboard({
  spaces,
  projects,
  activeProjects,
  overdue,
  upcoming,
  waitingCount,
  focus,
  onNewProject,
}: {
  spaces: Space[];
  projects: Project[];
  activeProjects: Project[];
  overdue: Task[];
  upcoming: Task[];
  waitingCount: number;
  focus?: string;
  onNewProject: () => void;
}) {
  const completed = projects.filter((project) => project.status === 'Completed').length;
  const weeklyProgress = projects.length ? Math.round((completed / projects.length) * 100) : 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden rounded-xl p-0">
          <div className="grid gap-px bg-white/10 md:grid-cols-4">
            <Metric label="Today focus" value={focus || 'Plan active work'} icon={CircleDot} accent="text-ion" />
            <Metric label="Overdue" value={String(overdue.length)} icon={Flag} accent="text-rose-300" />
            <Metric label="Active projects" value={String(activeProjects.length)} icon={KanbanSquare} accent="text-lime-300" />
            <Metric label="Weekly progress" value={`${weeklyProgress}%`} icon={TrendingUp} accent="text-amber-300" />
          </div>
        </GlassPanel>

        <div className="grid gap-4 md:grid-cols-5">
          {spaces.map((space) => {
            const Icon = spaceIcons[space.icon];
            return (
              <motion.div key={space.id} whileHover={{ y: -4 }} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10" style={{ color: space.color, backgroundColor: `${space.color}18` }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs text-slate-500">#{space.order}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{space.name}</h3>
                <p className="mt-2 min-h-12 text-xs leading-5 text-slate-400">{space.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <span>{space.projectCount} projects</span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span>{space.taskCount} tasks</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <GlassPanel className="rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Upcoming deadlines</h2>
            <Button variant="ghost" onClick={onNewProject}>
              <Plus className="h-4 w-4" />
              Project
            </Button>
          </div>
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/15 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.projectId ? projects.find((project) => project.id === task.projectId)?.title ?? 'Project' : 'Unlinked task'}</p>
                </div>
                <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs text-slate-300">{shortDate(task.dueDate)}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <div className="space-y-5">
        <GlassPanel className="rounded-xl p-5">
          <h2 className="text-base font-semibold text-white">Blocked and waiting</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{waitingCount} item{waitingCount === 1 ? '' : 's'} need a decision, dependency, or follow-up.</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-300 via-amber-300 to-lime-300" style={{ width: `${Math.min(waitingCount * 18, 100)}%` }} />
          </div>
        </GlassPanel>
        <GlassPanel className="rounded-xl p-5">
          <h2 className="text-base font-semibold text-white">Quick planning actions</h2>
          <div className="mt-4 grid gap-2">
            {['Review overdue', 'Promote ideas', 'Plan this week', 'Check waiting'].map((action) => (
              <button key={action} className="flex h-11 items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white">
                {action}
                <CheckCircle2 className="h-4 w-4 text-slate-500" />
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, accent }: { label: string; value: string; icon: typeof CircleDot; accent: string }) {
  return (
    <div className="bg-obsidian/40 p-4">
      <Icon className={cn('mb-4 h-5 w-5', accent)} />
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 line-clamp-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ProjectsWorkspace({
  spaces,
  projects,
  tasks,
  selectedProject,
  onSelectProject,
  onUpdateProject,
  onAddNote,
  onLinkTask,
}: {
  spaces: Space[];
  projects: Project[];
  tasks: Task[];
  selectedProject: Project;
  onSelectProject: (projectId: string) => void;
  onUpdateProject: (projectId: string, patch: Partial<Project>) => void;
  onAddNote: (projectId: string, body: string) => void;
  onLinkTask: (projectId: string, taskId: string) => void;
}) {
  const [view, setView] = useState<'list' | 'board' | 'timeline' | 'progress'>('list');
  const linkedTasks = tasks.filter((task) => selectedProject.linkedTaskIds.includes(task.id) || task.projectId === selectedProject.id);
  const unlinkedTasks = tasks.filter((task) => !selectedProject.linkedTaskIds.includes(task.id) && task.projectId !== selectedProject.id);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {(['list', 'board', 'timeline', 'progress'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={cn('inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm capitalize transition', view === item ? 'border-ion/40 bg-ion/10 text-sky-100' : 'border-white/10 bg-white/[0.04] text-slate-400')}
            >
              {item === 'list' ? <List className="h-4 w-4" /> : item === 'board' ? <KanbanSquare className="h-4 w-4" /> : item === 'timeline' ? <CalendarDays className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              {item}
            </button>
          ))}
        </div>
        {view === 'list' && <ProjectList projects={projects} tasks={tasks} onSelect={onSelectProject} />}
        {view === 'board' && <ProjectBoard projects={projects} tasks={tasks} onUpdateProject={onUpdateProject} />}
        {view === 'timeline' && <ProjectTimeline projects={projects} />}
        {view === 'progress' && <ProjectProgress projects={projects} tasks={tasks} />}
      </div>

      <ProjectDetail
        spaces={spaces}
        project={selectedProject}
        linkedTasks={linkedTasks}
        unlinkedTasks={unlinkedTasks}
        onUpdateProject={onUpdateProject}
        onAddNote={onAddNote}
        onLinkTask={onLinkTask}
      />
    </div>
  );
}

function ProjectList({ projects, tasks, onSelect }: { projects: Project[]; tasks: Task[]; onSelect: (projectId: string) => void }) {
  return (
    <GlassPanel className="rounded-xl p-3">
      <div className="space-y-2">
        {projects.map((project) => (
          <button key={project.id} onClick={() => onSelect(project.id)} className="grid w-full gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left transition hover:bg-white/[0.07] md:grid-cols-[1fr_120px_90px]">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{project.title}</p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{project.description || 'No description yet.'}</p>
            </div>
            <Badge label={project.status} />
            <span className="text-xs text-slate-400">{projectProgress(project, tasks)}%</span>
          </button>
        ))}
      </div>
    </GlassPanel>
  );
}

function ProjectBoard({ projects, tasks, onUpdateProject }: { projects: Project[]; tasks: Task[]; onUpdateProject: (projectId: string, patch: Partial<Project>) => void }) {
  return (
    <div className="grid gap-3 xl:grid-cols-3 2xl:grid-cols-6">
      {projectStatuses.map((status) => (
        <div
          key={status}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const projectId = event.dataTransfer.getData('text/project-id');
            if (projectId) onUpdateProject(projectId, { status });
          }}
          className="min-h-64 rounded-xl border border-white/10 bg-white/[0.035] p-3"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{status}</p>
          <div className="space-y-2">
            {projects
              .filter((project) => project.status === status)
              .map((project) => (
                <motion.div key={project.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/project-id', project.id)} whileHover={{ y: -3 }} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-semibold text-white">{project.title}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-ion" style={{ width: `${projectProgress(project, tasks)}%` }} />
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectTimeline({ projects }: { projects: Project[] }) {
  return (
    <GlassPanel className="rounded-xl p-5">
      <div className="space-y-4">
        {projects
          .filter((project) => project.dueDate)
          .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
          .map((project) => (
            <div key={project.id} className="grid gap-3 md:grid-cols-[110px_1fr]">
              <span className="text-xs text-slate-500">{shortDate(project.dueDate)}</span>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">{project.title}</p>
                <p className="mt-1 text-xs text-slate-500">{project.status}</p>
              </div>
            </div>
          ))}
      </div>
    </GlassPanel>
  );
}

function ProjectProgress({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  return (
    <GlassPanel className="rounded-xl p-5">
      <div className="space-y-4">
        {projects.map((project) => {
          const progress = projectProgress(project, tasks);
          return (
            <div key={project.id}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-white">{project.title}</span>
                <span className="text-slate-400">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-gradient-to-r from-ion via-lime-300 to-amber-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}

function ProjectDetail({
  spaces,
  project,
  linkedTasks,
  unlinkedTasks,
  onUpdateProject,
  onAddNote,
  onLinkTask,
}: {
  spaces: Space[];
  project: Project;
  linkedTasks: Task[];
  unlinkedTasks: Task[];
  onUpdateProject: (projectId: string, patch: Partial<Project>) => void;
  onAddNote: (projectId: string, body: string) => void;
  onLinkTask: (projectId: string, taskId: string) => void;
}) {
  const [note, setNote] = useState('');
  const progress = projectProgress(project, linkedTasks);

  return (
    <GlassPanel className="rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <input value={project.title} onChange={(event) => onUpdateProject(project.id, { title: event.target.value })} className="w-full bg-transparent text-xl font-semibold text-white outline-none" />
          <textarea
            value={project.description}
            onChange={(event) => onUpdateProject(project.id, { description: event.target.value })}
            rows={3}
            className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-slate-300 outline-none focus:border-ion/40"
            placeholder="Project description"
          />
        </div>
        <Badge label={project.priority} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-400">
        <select value={project.status} onChange={(event) => onUpdateProject(project.id, { status: event.target.value as ProjectStatus })} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none">
          {projectStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select value={project.spaceId} onChange={(event) => onUpdateProject(project.id, { spaceId: event.target.value })} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none">
          {spaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.name}
            </option>
          ))}
        </select>
        <input type="date" value={project.dueDate ?? ''} onChange={(event) => onUpdateProject(project.id, { dueDate: event.target.value || null })} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none" />
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white">{progress}% complete</div>
      </div>

      <div className="mt-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Linked tasks</h3>
        <div className="space-y-2">
          {linkedTasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
              <p className="text-sm text-white">{task.title}</p>
              <p className="text-xs text-slate-500">{task.status} / {shortDate(task.dueDate)}</p>
            </div>
          ))}
          {unlinkedTasks[0] && (
            <button onClick={() => onLinkTask(project.id, unlinkedTasks[0].id)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-300 hover:text-white">
              <Plus className="h-4 w-4" />
              Link next task
            </button>
          )}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <NotebookPen className="h-4 w-4" />
          Notes
        </h3>
        <div className="space-y-2">
          {project.notes.map((item) => (
            <p key={item.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-slate-300">
              {item.body}
            </p>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add note" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-ion/40" />
          <Button
            onClick={() => {
              onAddNote(project.id, note);
              setNote('');
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
}

function WeeklyPlanner({
  days,
  tasks,
  projects,
  taskDayMap,
  onAssignTask,
}: {
  days: Date[];
  tasks: Task[];
  projects: Project[];
  taskDayMap: Record<string, string>;
  onAssignTask: (taskId: string, date: string) => void;
}) {
  const unscheduled = tasks.filter((task) => task.status !== 'Completed' && !task.dueDate);
  return (
    <div className="space-y-5">
      <GlassPanel className="rounded-xl p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Unscheduled</p>
        <div className="flex gap-2 overflow-x-auto">
          {unscheduled.map((task) => (
            <TaskPill key={task.id} task={task} projectTitle={projects.find((project) => project.id === task.projectId)?.title} />
          ))}
        </div>
      </GlassPanel>
      <div className="grid gap-3 xl:grid-cols-7">
        {days.map((day) => {
          const date = dateOnly(day);
          const dayTasks = tasks.filter((task) => task.dueDate === date || taskDayMap[task.id] === date);
          return (
            <div
              key={date}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const taskId = event.dataTransfer.getData('text/task-id');
                if (taskId) onAssignTask(taskId, date);
              }}
              className="min-h-80 rounded-xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-ion/30"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{day.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                  <p className="text-xs text-slate-500">{shortDate(date)}</p>
                </div>
                <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs text-slate-400">{dayTasks.length}</span>
              </div>
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <TaskPill key={task.id} task={task} projectTitle={projects.find((project) => project.id === task.projectId)?.title} full />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskPill({ task, projectTitle, full = false }: { task: Task; projectTitle?: string; full?: boolean }) {
  return (
    <motion.div draggable onDragStart={(event) => event.dataTransfer.setData('text/task-id', task.id)} whileHover={{ y: -3 }} className={cn('shrink-0 rounded-lg border border-white/10 bg-black/20 p-3', full ? 'w-full' : 'w-72')}>
      <p className="line-clamp-2 text-sm font-medium text-white">{task.title}</p>
      <p className="mt-2 truncate text-xs text-slate-500">{projectTitle || 'No project'} / {task.priority}</p>
    </motion.div>
  );
}
