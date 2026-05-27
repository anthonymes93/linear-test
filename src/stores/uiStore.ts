import { create } from 'zustand';

type ThemeMode = 'dark' | 'dim';

interface UiState {
  commandOpen: boolean;
  theme: ThemeMode;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  commandOpen: false,
  theme: 'dark',
  setCommandOpen: (open) => set({ commandOpen: open }),
  toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'dim' : 'dark' })),
}));
