import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function GlassPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border border-white/10 bg-white/[0.055] shadow-glass backdrop-blur-xl',
        'supports-[backdrop-filter]:bg-white/[0.045]',
        className,
      )}
      {...props}
    />
  );
}
