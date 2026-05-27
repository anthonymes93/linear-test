import { useEffect } from 'react';
import { isFirebaseConfigured } from '../lib/firebase';
import { subscribeToTags, subscribeToTaskActivity, subscribeToTaskComments, subscribeToTasks } from '../services/taskService';
import { useTaskStore } from '../stores/taskStore';

export function useTaskSync() {
  const setTasks = useTaskStore((state) => state.setTasks);
  const setTags = useTaskStore((state) => state.setTags);
  const setTaskComments = useTaskStore((state) => state.setTaskComments);
  const setTaskActivity = useTaskStore((state) => state.setTaskActivity);
  const setLoading = useTaskStore((state) => state.setLoading);
  const setSyncError = useTaskStore((state) => state.setSyncError);
  const selectedWorkspaceId = useTaskStore((state) => state.selectedWorkspaceId);
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    // Realtime sync is a shell concern; feature components consume normalized task state only.
    setLoading(true);
    const unsubscribe = subscribeToTasks(
      selectedWorkspaceId,
      (tasks) => {
        setTasks(tasks);
        setSyncError(null);
      },
      (error) => setSyncError(error.message),
    );

    return unsubscribe;
  }, [selectedWorkspaceId, setLoading, setSyncError, setTasks]);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    return subscribeToTags(selectedWorkspaceId, setTags, (error) => setSyncError(error.message));
  }, [selectedWorkspaceId, setSyncError, setTags]);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    const unsubscribeComments = subscribeToTaskComments(selectedTaskId, setTaskComments, (error) => setSyncError(error.message));
    const unsubscribeActivity = subscribeToTaskActivity(selectedTaskId, setTaskActivity, (error) => setSyncError(error.message));
    return () => {
      unsubscribeComments();
      unsubscribeActivity();
    };
  }, [selectedTaskId, setSyncError, setTaskActivity, setTaskComments]);
}
