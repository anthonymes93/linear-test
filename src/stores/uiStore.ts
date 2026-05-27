import { create } from 'zustand';

type ThemeMode = 'dark' | 'light';

interface UiState {
  commandOpen: boolean;
  detailsOpen: boolean;
  quickAddOpen: boolean;
  theme: ThemeMode;
  setCommandOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;
  toggleCommand: () => void;
  toggleTheme: () => void;
}

function getInitialTheme(): ThemeMode {
  try {
    const savedTheme = localStorage.getItem('brainflow-theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export const useUiStore = create<UiState>((set) => ({
  commandOpen: false,
  detailsOpen: true,
  quickAddOpen: false,
  theme: getInitialTheme(),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setDetailsOpen: (open) => set({ detailsOpen: open }),
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
