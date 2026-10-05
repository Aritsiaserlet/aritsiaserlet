import React from 'react';
import { Social } from '../../types';
import { safeUrl } from '../../lib/utils';

interface ContactProps {
  socials?: Social[];
}

export const Contact: React.FC<ContactProps> = ({ socials = [] }) => {
  return (
    <section
      className="px-4 sm:px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto py-16 sm:py-24 md:py-32 flex flex-col items-center"
      id="contact"
    >
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 uppercase text-center">
        CONTACT ME
      </h2>
      <div
        id="contact-links-container"
        className="inline-flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-10 px-6 sm:px-12 py-4 sm:py-6 bg-surface/50 backdrop-blur rounded-2xl sm:rounded-full border border-outline/20 shadow-2xl max-w-full"
      >
        {socials.map((c, idx) => {
          const sUrl = safeUrl(c.link);
          return (
            <a
              key={idx}
              className="text-on-surface-variant hover:text-primary transition-all hover:scale-110 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold min-h-[44px]"
              href={sUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              title={c.name}
            >
              {c.iconType === 'svg' && c.iconVal ? (
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 fill-current shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d={c.iconVal} />
                </svg>
              ) : c.iconType === 'image' && c.iconVal ? (
                <img
                  alt={c.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-outline/20 shrink-0"
                  src={safeUrl(c.iconVal)}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="material-symbols-outlined text-xl sm:text-2xl shrink-0">
                  {c.iconVal || 'link'}
                </span>
              )}
              <span>{c.name.toUpperCase()}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
};
