import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Task } from '../types/task';

const tasksCollection = collection(db, 'tasks');

export function subscribeToTasks(onTasks: (tasks: Task[]) => void): Unsubscribe {
  const taskQuery = query(tasksCollection, orderBy('updatedAt', 'desc'));

  return onSnapshot(taskQuery, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
    onTasks(tasks);
  });
}

export async function createTaskDocument(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  return addDoc(tasksCollection, {
    ...task,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
