import { create } from 'zustand';

type ThemeMode = 'dark' | 'dim';

interface UiState {
  commandOpen: boolean;
  theme: ThemeMode;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
  toggleTheme: () => void;
}

function getInitialTheme(): ThemeMode {
  try {
    const savedTheme = localStorage.getItem('brainflow-theme');
    return savedTheme === 'dim' ? 'dim' : 'dark';
  } catch {
    return 'dark';
  }
}

export const useUiStore = create<UiState>((set) => ({
  commandOpen: false,
  theme: getInitialTheme(),
  setCommandOpen: (open) => set({ commandOpen: open }),
  toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'dim' : 'dark' })),
}));
