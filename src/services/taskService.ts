import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, type DocumentData, type Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Task } from '../types/task';

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
  };
}

export function subscribeToTasks(onTasks: (tasks: Task[]) => void, onError?: (error: Error) => void): Unsubscribe {
  if (!db) return noopUnsubscribe;

  const tasksCollection = collection(db, 'tasks');
  const taskQuery = query(tasksCollection, orderBy('updatedAt', 'desc'));

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

  const taskRef = doc(db, 'tasks', task.id);

  await setDoc(taskRef, {
    ...task,
    createdAt: task.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
