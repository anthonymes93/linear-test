import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { firestoreCollections } from './firestoreSchema';
import type { PlanningSession, Project, ProjectTaskLink, Space } from '../types/planning';

const noopUnsubscribe: Unsubscribe = () => undefined;

function toIsoDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate().toISOString();
  return null;
}

function fromSpace(id: string, data: DocumentData): Space {
  return {
    ...(data as Omit<Space, 'id'>),
    id,
    createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoDate(data.updatedAt) ?? new Date().toISOString(),
  };
}

function fromProject(id: string, data: DocumentData): Project {
  return {
    ...(data as Omit<Project, 'id'>),
    id,
    dueDate: data.dueDate ?? null,
    linkedTaskIds: Array.isArray(data.linkedTaskIds) ? data.linkedTaskIds : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    progress: typeof data.progress === 'number' ? data.progress : 0,
    createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoDate(data.updatedAt) ?? new Date().toISOString(),
  };
}

function fromPlanningSession(id: string, data: DocumentData): PlanningSession {
  return {
    ...(data as Omit<PlanningSession, 'id'>),
    id,
    taskDayMap: data.taskDayMap && typeof data.taskDayMap === 'object' ? data.taskDayMap : {},
    createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoDate(data.updatedAt) ?? new Date().toISOString(),
  };
}

export function subscribeToSpaces(workspaceId: string, onSpaces: (spaces: Space[]) => void, onError?: (error: Error) => void): Unsubscribe {
  if (!db) return noopUnsubscribe;
  return onSnapshot(
    query(collection(db, firestoreCollections.spaces), where('workspaceId', '==', workspaceId), orderBy('order', 'asc')),
    (snapshot) => onSpaces(snapshot.docs.map((item) => fromSpace(item.id, item.data()))),
    (error) => onError?.(error),
  );
}

export function subscribeToProjects(workspaceId: string, onProjects: (projects: Project[]) => void, onError?: (error: Error) => void): Unsubscribe {
  if (!db) return noopUnsubscribe;
  return onSnapshot(
    query(collection(db, firestoreCollections.projects), where('workspaceId', '==', workspaceId), orderBy('updatedAt', 'desc')),
    (snapshot) => onProjects(snapshot.docs.map((item) => fromProject(item.id, item.data()))),
    (error) => onError?.(error),
  );
}

export function subscribeToPlanningSessions(
  workspaceId: string,
  onSessions: (sessions: PlanningSession[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!db) return noopUnsubscribe;
  return onSnapshot(
    query(collection(db, firestoreCollections.planningSessions), where('workspaceId', '==', workspaceId), orderBy('weekStart', 'desc')),
    (snapshot) => onSessions(snapshot.docs.map((item) => fromPlanningSession(item.id, item.data()))),
    (error) => onError?.(error),
  );
}

export async function persistSpace(space: Space) {
  if (!db) return;
  await setDoc(doc(db, firestoreCollections.spaces, space.id), { ...space, updatedAt: serverTimestamp() }, { merge: true });
}

export async function persistProject(project: Project) {
  if (!db) return;
  await setDoc(doc(db, firestoreCollections.projects, project.id), { ...project, updatedAt: serverTimestamp() }, { merge: true });
}

export async function persistProjectTaskLink(link: ProjectTaskLink) {
  if (!db) return;
  await setDoc(doc(db, firestoreCollections.projectTasks, link.id), { ...link, createdAt: link.createdAt || serverTimestamp() }, { merge: true });
}

export async function persistPlanningSession(session: PlanningSession) {
  if (!db) return;
  await setDoc(doc(db, firestoreCollections.planningSessions, session.id), { ...session, updatedAt: serverTimestamp() }, { merge: true });
}
