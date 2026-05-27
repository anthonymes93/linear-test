import { useEffect } from 'react';
import { useUiStore } from '../stores/uiStore';

export function useTheme() {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.add('dark');
    try {
      localStorage.setItem('brainflow-theme', theme);
    } catch {
      // Theme should still apply even if browser storage is unavailable.
    }
  }, [theme]);
}
