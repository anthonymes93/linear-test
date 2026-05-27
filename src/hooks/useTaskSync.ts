import { useEffect } from 'react';
import { isFirebaseConfigured } from '../lib/firebase';
import { subscribeToTasks } from '../services/taskService';
import { useTaskStore } from '../stores/taskStore';

export function useTaskSync() {
  const setTasks = useTaskStore((state) => state.setTasks);
  const setLoading = useTaskStore((state) => state.setLoading);
  const setSyncError = useTaskStore((state) => state.setSyncError);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    // Realtime sync is a shell concern; feature components consume normalized task state only.
    setLoading(true);
    const unsubscribe = subscribeToTasks(
      (tasks) => {
        setTasks(tasks);
        setSyncError(null);
      },
      (error) => setSyncError(error.message),
    );

    return unsubscribe;
  }, [setLoading, setSyncError, setTasks]);
}
