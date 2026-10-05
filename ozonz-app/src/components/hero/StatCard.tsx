import React, { useEffect, useState } from 'react';
import { formatCount } from '../../lib/utils';

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {
  const [displayValue, setDisplayValue] = useState<string>('…');

  useEffect(() => {
    if (value === '…' || value === '—') {
      setDisplayValue(value);
      return;
    }

    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) {
      setDisplayValue(String(value));
      return;
    }

    let start = 0;
    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(start + (num - start) * eased);
      setDisplayValue(formatCount(current));
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplayValue(formatCount(num));
      }
    };

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3.5 sm:p-6 md:p-8 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-center overflow-hidden">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-3 text-on-surface-variant">
        <span className="material-symbols-outlined text-base sm:text-lg shrink-0">{icon}</span>
        <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider sm:tracking-[0.2em] opacity-75 truncate">
          {label}
        </span>
      </div>
      <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary font-headline tabular-nums">
        {displayValue}
      </span>
    </div>
  );
};
