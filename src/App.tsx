import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { CommandPalette } from './components/command/CommandPalette';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTaskSync } from './hooks/useTaskSync';
import { useTheme } from './hooks/useTheme';
import { Dashboard } from './routes/Dashboard';

export default function App() {
  useTheme();
  useTaskSync();
  useKeyboardShortcuts();

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/inbox" replace />} />
          <Route path="/:status" element={<Dashboard />} />
        </Route>
      </Routes>
      <CommandPalette />
    </>
  );
}
