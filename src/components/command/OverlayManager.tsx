import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, Settings, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { shortcuts } from '../../lib/shortcutRegistry';
import { useOverlayStore } from '../../stores/overlayStore';
import { FocusMode } from './FocusMode';

export function OverlayManager() {
  const shortcutsOpen = useOverlayStore((state) => state.shortcutsOpen);
  const settingsOpen = useOverlayStore((state) => state.settingsOpen);
  const setShortcutsOpen = useOverlayStore((state) => state.setShortcutsOpen);
  const setSettingsOpen = useOverlayStore((state) => state.setSettingsOpen);

  return (
    <>
      <FocusMode />
      <AnimatePresence>
        {shortcutsOpen && (
          <Panel title="Keyboard shortcuts" icon={<Keyboard className="h-5 w-5 text-ion" />} onClose={() => setShortcutsOpen(false)}>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{shortcut.description}</p>
                    <p className="text-xs text-slate-500">{shortcut.scope}</p>
                  </div>
                  <kbd className="rounded-md border border-white/10 bg-black/25 px-2 py-1 text-xs text-slate-300">{shortcut.keys}</kbd>
                </div>
              ))}
            </div>
          </Panel>
        )}
        {settingsOpen && (
          <Panel title="Settings" icon={<Settings className="h-5 w-5 text-ion" />} onClose={() => setSettingsOpen(false)}>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <p className="font-medium text-white">BrainFlow controls</p>
                <p className="mt-1 leading-6">Theme, sync, focus mode, and command actions are managed through the command palette.</p>
              </div>
            </div>
          </Panel>
        )}
      </AnimatePresence>
    </>
  );
}

function Panel({ title, icon, onClose, children }: { title: string; icon: ReactNode; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-black/55 px-4 backdrop-blur-xl" onMouseDown={onClose}>
      <motion.section
        onMouseDown={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-graphite/95 p-4 shadow-glass"
      >
        <header className="mb-4 flex items-center gap-3">
          {icon}
          <h2 className="flex-1 text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label={`Close ${title}`}>
            <X className="h-4 w-4" />
          </button>
        </header>
        {children}
      </motion.section>
    </div>
  );
}
