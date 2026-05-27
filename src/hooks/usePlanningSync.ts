import { useEffect } from 'react';
import { isFirebaseConfigured } from '../lib/firebase';
import { subscribeToPlanningSessions, subscribeToProjects, subscribeToSpaces } from '../services/planningService';
import { usePlanningStore } from '../stores/planningStore';
import { useTaskStore } from '../stores/taskStore';

export function usePlanningSync() {
  const selectedWorkspaceId = useTaskStore((state) => state.selectedWorkspaceId);
  const setSpaces = usePlanningStore((state) => state.setSpaces);
  const setProjects = usePlanningStore((state) => state.setProjects);
  const setPlanningSessions = usePlanningStore((state) => state.setPlanningSessions);
  const setSyncError = useTaskStore((state) => state.setSyncError);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    const unsubscribeSpaces = subscribeToSpaces(selectedWorkspaceId, setSpaces, (error) => setSyncError(error.message));
    const unsubscribeProjects = subscribeToProjects(selectedWorkspaceId, setProjects, (error) => setSyncError(error.message));
    const unsubscribeSessions = subscribeToPlanningSessions(selectedWorkspaceId, setPlanningSessions, (error) => setSyncError(error.message));
    return () => {
      unsubscribeSpaces();
      unsubscribeProjects();
      unsubscribeSessions();
    };
  }, [selectedWorkspaceId, setPlanningSessions, setProjects, setSpaces, setSyncError]);
}
