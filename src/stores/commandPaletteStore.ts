import { create } from 'zustand';

interface CommandPaletteState {
  query: string;
  activeIndex: number;
  recentCommandIds: string[];
  setQuery: (query: string) => void;
  setActiveIndex: (index: number) => void;
  recordCommand: (commandId: string) => void;
  reset: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  query: '',
  activeIndex: 0,
  recentCommandIds: [],
  setQuery: (query) => set({ query, activeIndex: 0 }),
  setActiveIndex: (activeIndex) => set({ activeIndex }),
  recordCommand: (commandId) =>
    set((state) => ({
      recentCommandIds: [commandId, ...state.recentCommandIds.filter((id) => id !== commandId)].slice(0, 6),
    })),
  reset: () => set({ query: '', activeIndex: 0 }),
}));
