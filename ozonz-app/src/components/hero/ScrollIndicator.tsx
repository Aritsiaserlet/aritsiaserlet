import React from 'react';

interface ScrollIndicatorProps {
  show: boolean;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ show }) => {
  return (
    <div
      id="scroll-indicator"
      className={`flex flex-col items-center gap-1.5 pb-2 pointer-events-none select-none text-primary shrink-0 transition-all duration-500 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
      aria-hidden="true"
    >
      <span className="text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
        Scroll down for more
      </span>
      <svg
        className="scroll-arrow"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 10px rgba(var(--primary-rgb),0.3))' }}
      >
        <path
          d="M12 5v14M5 13l7 7 7-7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
