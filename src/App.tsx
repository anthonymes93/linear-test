import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { CommandPalette } from './components/command/CommandPalette';
import { OverlayManager } from './components/command/OverlayManager';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePlanningSync } from './hooks/usePlanningSync';
import { useTaskSync } from './hooks/useTaskSync';
import { useTheme } from './hooks/useTheme';
import { Dashboard } from './routes/Dashboard';
import { Planning } from './routes/Planning';

export default function App() {
  useTheme();
  useTaskSync();
  usePlanningSync();
  useKeyboardShortcuts();

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/inbox" replace />} />
          <Route path="/planning" element={<Navigate to="/planning/dashboard" replace />} />
          <Route path="/planning/:tab" element={<Planning />} />
          <Route path="/planning/:tab/:projectId" element={<Planning />} />
          <Route path="/:status" element={<Dashboard />} />
        </Route>
      </Routes>
      <CommandPalette />
      <OverlayManager />
    </>
  );
}
