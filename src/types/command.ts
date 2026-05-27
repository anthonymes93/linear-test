import type { LucideIcon } from 'lucide-react';

export type CommandTone = 'default' | 'success' | 'danger' | 'accent';

export interface CommandActionContext {
  query: string;
  close: () => void;
}

export interface CommandDefinition {
  id: string;
  title: string;
  subtitle?: string;
  group: string;
  nestedGroup?: string;
  keywords: string[];
  shortcut?: string;
  icon: LucideIcon;
  tone?: CommandTone;
  suggested?: boolean;
  disabled?: boolean;
  perform: (context: CommandActionContext) => void;
}

export interface ShortcutDefinition {
  id: string;
  keys: string;
  description: string;
  scope: 'Global' | 'Palette' | 'Tasks';
}
