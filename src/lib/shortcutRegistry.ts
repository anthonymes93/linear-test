import type { ShortcutDefinition } from '../types/command';

export const shortcuts: ShortcutDefinition[] = [
  { id: 'command.open', keys: 'Ctrl K', description: 'Open command palette', scope: 'Global' },
  { id: 'quick-add.open', keys: 'Q', description: 'Open natural language quick add', scope: 'Global' },
  { id: 'search.focus', keys: '/', description: 'Focus task search', scope: 'Global' },
  { id: 'overlay.close', keys: 'Esc', description: 'Close overlays', scope: 'Global' },
  { id: 'palette.navigate', keys: 'Up / Down', description: 'Move through command results', scope: 'Palette' },
  { id: 'palette.run', keys: 'Enter', description: 'Run selected command', scope: 'Palette' },
  { id: 'quick-add.save', keys: 'Ctrl Enter', description: 'Save quick-add task', scope: 'Global' },
  { id: 'tasks.multi-select', keys: 'Shift Click', description: 'Multi-select tasks', scope: 'Tasks' },
  { id: 'sections.nav', keys: '1-4', description: 'Jump between navigation sections', scope: 'Global' },
];
