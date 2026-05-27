import { create } from 'zustand';
import { mockPlanningProjects, mockPlanningSessions, mockSpaces } from '../data/mockPlanning';
import { isFirebaseConfigured } from '../lib/firebase';
import { persistPlanningSession, persistProject, persistProjectTaskLink, persistSpace } from '../services/planningService';
import type { PlanningSession, Project, ProjectNote, ProjectStatus, ProjectTaskLink, Space } from '../types/planning';
import type { TaskPriority } from '../types/task';

interface PlanningState {
  spaces: Space[];
  projects: Project[];
  planningSessions: PlanningSession[];
  selectedSpaceId: string | null;
  selectedProjectId: string | null;
  selectedProjectView: 'list' | 'board' | 'timeline' | 'progress';
  setSpaces: (spaces: Space[]) => void;
  setProjects: (projects: Project[]) => void;
  setPlanningSessions: (sessions: PlanningSession[]) => void;
  selectSpace: (spaceId: string | null) => void;
  selectProject: (projectId: string | null) => void;
  setProjectView: (view: PlanningState['selectedProjectView']) => void;
  addProject: (input: { workspaceId: string; spaceId: string; title: string }) => Project;
  updateProject: (projectId: string, patch: Partial<Project>) => void;
  addProjectNote: (projectId: string, body: string) => void;
  linkTaskToProject: (projectId: string, taskId: string, workspaceId: string) => void;
  assignTaskToDay: (taskId: string, date: string, workspaceId: string) => void;
}

function now() {
  return new Date().toISOString();
}

function persistProjectOptimistically(project: Project) {
  if (!isFirebaseConfigured) return;
  void persistProject(project).catch((error) => console.error('Failed to persist project', error));
}

function persistSessionOptimistically(session: PlanningSession) {
  if (!isFirebaseConfigured) return;
  void persistPlanningSession(session).catch((error) => console.error('Failed to persist planning session', error));
}

function persistSpaceOptimistically(space: Space) {
  if (!isFirebaseConfigured) return;
  void persistSpace(space).catch((error) => console.error('Failed to persist space', error));
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  spaces: mockSpaces,
  projects: mockPlanningProjects,
  planningSessions: mockPlanningSessions,
  selectedSpaceId: null,
  selectedProjectId: mockPlanningProjects[0]?.id ?? null,
  selectedProjectView: 'list',
  setSpaces: (spaces) => set({ spaces }),
  setProjects: (projects) =>
    set((state) => ({
      projects,
      selectedProjectId: projects.some((project) => project.id === state.selectedProjectId) ? state.selectedProjectId : projects[0]?.id ?? null,
    })),
  setPlanningSessions: (planningSessions) => set({ planningSessions }),
  selectSpace: (selectedSpaceId) => set({ selectedSpaceId }),
  selectProject: (selectedProjectId) => set({ selectedProjectId }),
  setProjectView: (selectedProjectView) => set({ selectedProjectView }),
  addProject: ({ workspaceId, spaceId, title }) => {
    const timestamp = now();
    const project: Project = {
      id: crypto.randomUUID(),
      workspaceId,
      spaceId,
      title: title.trim() || 'New project',
      description: '',
      status: 'Idea',
      priority: 'Medium' satisfies TaskPriority,
      dueDate: null,
      progress: 0,
      linkedTaskIds: [],
      notes: [],
      tags: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    set((state) => ({ projects: [project, ...state.projects], selectedProjectId: project.id }));
    persistProjectOptimistically(project);
    return project;
  },
  updateProject: (projectId, patch) =>
    set((state) => {
      let updatedProject: Project | null = null;
      const projects = state.projects.map((project) => {
        if (project.id !== projectId) return project;
        updatedProject = { ...project, ...patch, updatedAt: now() };
        return updatedProject;
      });
      if (updatedProject) persistProjectOptimistically(updatedProject);
      return { projects };
    }),
  addProjectNote: (projectId, body) => {
    const text = body.trim();
    if (!text) return;
    const note: ProjectNote = { id: crypto.randomUUID(), body: text, createdAt: now(), updatedAt: now() };
    const project = get().projects.find((item) => item.id === projectId);
    if (project) get().updateProject(projectId, { notes: [...project.notes, note] });
  },
  linkTaskToProject: (projectId, taskId, workspaceId) => {
    const project = get().projects.find((item) => item.id === projectId);
    if (!project || project.linkedTaskIds.includes(taskId)) return;
    const nextIds = [...project.linkedTaskIds, taskId];
    get().updateProject(projectId, { linkedTaskIds: nextIds });
    const link: ProjectTaskLink = {
      id: `${projectId}_${taskId}`,
      workspaceId,
      projectId,
      taskId,
      order: nextIds.length * 10,
      createdAt: now(),
    };
    if (isFirebaseConfigured) void persistProjectTaskLink(link).catch((error) => console.error('Failed to persist project task link', error));
  },
  assignTaskToDay: (taskId, date, workspaceId) => {
    const session = get().planningSessions[0] ?? {
      id: crypto.randomUUID(),
      workspaceId,
      weekStart: date,
      focus: '',
      taskDayMap: {},
      createdAt: now(),
      updatedAt: now(),
    };
    const updatedSession = { ...session, taskDayMap: { ...session.taskDayMap, [taskId]: date }, updatedAt: now() };
    set((state) => ({
      planningSessions: state.planningSessions.some((item) => item.id === session.id)
        ? state.planningSessions.map((item) => (item.id === session.id ? updatedSession : item))
        : [updatedSession, ...state.planningSessions],
    }));
    persistSessionOptimistically(updatedSession);
  },
}));

export const projectStatuses: ProjectStatus[] = ['Idea', 'Planned', 'Active', 'Waiting', 'Completed', 'Archived'];
