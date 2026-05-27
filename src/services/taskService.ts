import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { firestoreCollections } from './firestoreSchema';
import type { Task, TaskActivity, TaskComment, TaskTag } from '../types/task';

const noopUnsubscribe: Unsubscribe = () => undefined;

function toIsoDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return null;
}

function fromDocument(id: string, data: DocumentData): Task {
  return {
    ...(data as Omit<Task, 'id'>),
    id,
    createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoDate(data.updatedAt) ?? new Date().toISOString(),
    completedAt: toIsoDate(data.completedAt),
    order: typeof data.order === 'number' ? data.order : Date.now(),
  };
}

function fromComment(id: string, data: DocumentData): TaskComment {
  return {
    ...(data as Omit<TaskComment, 'id'>),
    id,
    createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoDate(data.updatedAt) ?? new Date().toISOString(),
  };
}

function fromActivity(id: string, data: DocumentData): TaskActivity {
  return {
    ...(data as Omit<TaskActivity, 'id'>),
    id,
    createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
  };
}

function fromTag(id: string, data: DocumentData): TaskTag {
  return {
    ...(data as Omit<TaskTag, 'id'>),
    id,
    createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
  };
}

export function subscribeToTasks(workspaceId: string, onTasks: (tasks: Task[]) => void, onError?: (error: Error) => void): Unsubscribe {
  if (!db) return noopUnsubscribe;

  const tasksCollection = collection(db, firestoreCollections.tasks);
  const taskQuery = query(tasksCollection, where('workspaceId', '==', workspaceId), orderBy('order', 'asc'), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    taskQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map((item) => fromDocument(item.id, item.data()));
      onTasks(tasks);
    },
    (error) => onError?.(error),
  );
}

export async function persistTask(task: Task) {
  if (!db) return;

  const taskRef = doc(db, firestoreCollections.tasks, task.id);

  await setDoc(
    taskRef,
    {
      ...task,
      createdAt: task.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteTaskDocument(taskId: string) {
  if (!db) return;
  await deleteDoc(doc(db, firestoreCollections.tasks, taskId));
}

export async function addTaskComment(taskId: string, userId: string, body: string) {
  if (!db) return;
  await addDoc(collection(db, firestoreCollections.taskComments), {
    taskId,
    userId,
    body,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToTaskComments(taskId: string | null, onComments: (comments: TaskComment[]) => void, onError?: (error: Error) => void): Unsubscribe {
  if (!db || !taskId) return noopUnsubscribe;
  return onSnapshot(
    query(collection(db, firestoreCollections.taskComments), where('taskId', '==', taskId), orderBy('createdAt', 'asc')),
    (snapshot) => onComments(snapshot.docs.map((item) => fromComment(item.id, item.data()))),
    (error) => onError?.(error),
  );
}

export async function writeTaskActivity(activity: Omit<TaskActivity, 'id' | 'createdAt'>) {
  if (!db) return;
  await addDoc(collection(db, firestoreCollections.taskActivity), {
    ...activity,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToTaskActivity(taskId: string | null, onActivity: (activity: TaskActivity[]) => void, onError?: (error: Error) => void): Unsubscribe {
  if (!db || !taskId) return noopUnsubscribe;
  return onSnapshot(
    query(collection(db, firestoreCollections.taskActivity), where('taskId', '==', taskId), orderBy('createdAt', 'desc')),
    (snapshot) => onActivity(snapshot.docs.map((item) => fromActivity(item.id, item.data()))),
    (error) => onError?.(error),
  );
}

export async function upsertTag(tag: TaskTag) {
  if (!db) return;
  await setDoc(doc(db, firestoreCollections.tags, tag.id), { ...tag, createdAt: tag.createdAt || serverTimestamp() }, { merge: true });
}

export function subscribeToTags(workspaceId: string, onTags: (tags: TaskTag[]) => void, onError?: (error: Error) => void): Unsubscribe {
  if (!db) return noopUnsubscribe;
  return onSnapshot(
    query(collection(db, firestoreCollections.tags), where('workspaceId', '==', workspaceId), orderBy('name', 'asc')),
    (snapshot) => onTags(snapshot.docs.map((item) => fromTag(item.id, item.data()))),
    (error) => onError?.(error),
  );
}

export async function patchTask(taskId: string, patch: Partial<Task>) {
  if (!db) return;
  await updateDoc(doc(db, firestoreCollections.tasks, taskId), { ...patch, updatedAt: serverTimestamp() });
}
