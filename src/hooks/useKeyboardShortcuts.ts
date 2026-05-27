import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../stores/taskStore';
import { useUiStore } from '../stores/uiStore';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const toggleCommand = useUiStore((state) => state.toggleCommand);
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);
  const setDetailsOpen = useUiStore((state) => state.setDetailsOpen);
  const setQuickAddOpen = useUiStore((state) => state.setQuickAddOpen);
  const addTask = useTaskStore((state) => state.addTask);
  const selectTask = useTaskStore((state) => state.selectTask);
  const focusTask = useTaskStore((state) => state.focusTask);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const clearSelection = useTaskStore((state) => state.clearSelection);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggleCommand();
      }

      if (event.key === 'Escape') {
        setCommandOpen(false);
        setDetailsOpen(false);
        setQuickAddOpen(false);
        clearSelection();
      }

      if (!isTyping && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        setQuickAddOpen(true);
      }

      if (!isTyping && event.key === '/') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('[data-task-search]')?.focus();
      }

      if (!isTyping && event.key === 'Enter') {
        const focusedTaskId = useTaskStore.getState().focusedTaskId;
        if (focusedTaskId) {
          selectTask(focusedTaskId);
          setDetailsOpen(true);
        }
      }

      if (!isTyping && event.key.toLowerCase() === 'c') {
        const focusedTaskId = useTaskStore.getState().focusedTaskId;
        if (focusedTaskId) updateTaskStatus(focusedTaskId, 'Completed');
      }

      if (!isTyping && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        const state = useTaskStore.getState();
        const visible = state.tasks.filter((task) => task.workspaceId === state.selectedWorkspaceId);
        const index = Math.max(0, visible.findIndex((task) => task.id === state.focusedTaskId));
        const next = visible[event.key === 'ArrowDown' ? Math.min(visible.length - 1, index + 1) : Math.max(0, index - 1)];
        if (next) focusTask(next.id);
      }

      if (!isTyping && event.altKey && event.key >= '1' && event.key <= '4') {
        const paths = ['/inbox', '/today', '/upcoming', '/in-progress'];
        navigate(paths[Number(event.key) - 1]);
      }

      if (!isTyping && event.key.toLowerCase() === 'n') {
        const task = addTask('Untitled task');
        toast.success(`Created ${task.title}`);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [addTask, clearSelection, focusTask, navigate, selectTask, setCommandOpen, setDetailsOpen, setQuickAddOpen, toggleCommand, updateTaskStatus]);
}
