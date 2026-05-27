import { cn } from '../../lib/cn';

const tones = {
  Low: 'border-slate-500/30 bg-slate-400/10 text-slate-300',
  Medium: 'border-ion/30 bg-ion/10 text-sky-200',
  High: 'border-plasma/30 bg-plasma/10 text-purple-200',
  Critical: 'border-ember/40 bg-ember/10 text-rose-200',
  Idea: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  Planned: 'border-sky-300/30 bg-sky-300/10 text-sky-100',
  Active: 'border-lime-300/30 bg-lime-300/10 text-lime-100',
  Waiting: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
  Completed: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
  Archived: 'border-slate-500/30 bg-slate-400/10 text-slate-300',
};

export function Badge({ label }: { label: keyof typeof tones | string }) {
  return <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', tones[label as keyof typeof tones] ?? tones.Medium)}>{label}</span>;
}
