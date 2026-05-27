import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTaskStore } from '../stores/taskStore';
import { useUiStore } from '../stores/uiStore';

export function useKeyboardShortcuts() {
  const toggleCommand = useUiStore((state) => state.toggleCommand);
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);
  const addTask = useTaskStore((state) => state.addTask);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggleCommand();
      }

      if (event.key === 'Escape') {
        setCommandOpen(false);
      }

      if (!isTyping && event.key.toLowerCase() === 'n') {
        const task = addTask('Untitled task');
        toast.success(`Created ${task.title}`);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [addTask, setCommandOpen, toggleCommand]);
}
