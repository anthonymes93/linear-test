import { cn } from '../../lib/cn';

const tones = {
  Low: 'border-slate-500/30 bg-slate-400/10 text-slate-300',
  Medium: 'border-ion/30 bg-ion/10 text-sky-200',
  High: 'border-plasma/30 bg-plasma/10 text-purple-200',
  Critical: 'border-ember/40 bg-ember/10 text-rose-200',
};

export function Badge({ label }: { label: keyof typeof tones }) {
  return <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', tones[label])}>{label}</span>;
}
