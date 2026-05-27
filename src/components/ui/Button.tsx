import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: 'primary' | 'ghost' | 'panel';
}

export function Button({ children, className, icon, variant = 'ghost', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition duration-150',
        'focus:outline-none focus:ring-2 focus:ring-ion/40 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-white text-obsidian shadow-glow hover:bg-slate-200',
        variant === 'ghost' && 'text-slate-300 hover:bg-white/[0.08] hover:text-white',
        variant === 'panel' && 'border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/10',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
