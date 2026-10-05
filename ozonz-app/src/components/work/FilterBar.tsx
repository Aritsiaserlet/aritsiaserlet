import React from 'react';
import { WorkFilterType } from '../../types';

interface FilterBarProps {
  currentFilter: WorkFilterType;
  onFilterChange: (filter: WorkFilterType) => void;
}

const filters: { id: WorkFilterType; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'games', label: 'GAMES' },
  { id: 'website', label: 'WEBSITE' },
  { id: 'other', label: 'OTHER' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2 filter-group bg-surface-container/20 p-1.5 sm:p-2 rounded-2xl sm:rounded-full border border-outline/10 backdrop-blur-md shadow-xl w-full sm:w-auto overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      id="work-filters"
    >
      {filters.map((f) => {
        const isActive = currentFilter === f.id;
        return (
          <button
            key={f.id}
            className={`filter-btn relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wider sm:tracking-widest transition-all duration-300 hover:scale-105 overflow-hidden group cursor-pointer shrink-0 ${
              isActive
                ? 'active bg-primary text-on-primary shadow-[0_6px_16px_rgba(var(--primary-rgb),0.25)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            data-filter={f.id}
            onClick={() => onFilterChange(f.id)}
          >
            <span className="relative z-10">{f.label}</span>
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
          </button>
        );
      })}
    </div>
  );
};
