import { create } from 'zustand';

interface OverlayState {
  focusModeOpen: boolean;
  shortcutsOpen: boolean;
  settingsOpen: boolean;
  setFocusModeOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  closeAllOverlays: () => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  focusModeOpen: false,
  shortcutsOpen: false,
  settingsOpen: false,
  setFocusModeOpen: (focusModeOpen) => set({ focusModeOpen }),
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  closeAllOverlays: () => set({ focusModeOpen: false, shortcutsOpen: false, settingsOpen: false }),
}));
