import React from 'react';
import { Work } from '../../types';
import { safeUrl } from '../../lib/utils';

interface FeaturedCardProps {
  work: Work;
  onOpenModal: (work: Work) => void;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ work, onOpenModal }) => {
  const isImg =
    typeof work.image === 'string' &&
    (work.image.startsWith('http') || work.image.includes('/') || work.image.includes('.'));
  const safeImg = isImg ? safeUrl(work.image as string) : '';
  const safeTitle = work.title || work.name || '(Untitled)';
  const safeTagline = work.tagline || '';
  const safeLink = safeUrl(work.link || '#');
  const safeYear = work.year || new Date().getFullYear();

  const tagsList = work.tags
    ? (Array.isArray(work.tags) ? work.tags : work.tags.split(',')).map((t) => t.trim()).filter(Boolean)
    : [];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (!safeLink || safeLink === '#') {
      e.preventDefault();
      alert('เกมนี้ยังไม่มี link ตอนนี้');
    }
  };

  return (
    <div
      className="col-span-1 lg:col-span-8 w-full min-w-0 work-card-trigger design-featured-card group"
      data-id={String(work.id || '')}
      onClick={() => onOpenModal(work)}
    >
      {safeImg ? (
        <img alt={safeTitle} className="design-featured-img" src={safeImg} />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-surface/10 flex items-center justify-center transition-transform duration-1000 group-hover:scale-105">
          <span className="material-symbols-outlined text-primary text-8xl sm:text-9xl">
            {(work.image as string) || 'brush'}
          </span>
        </div>
      )}
      <div className="design-featured-gradient" />

      {/* Top badges */}
      <div className="absolute top-4 sm:top-5 left-4 sm:left-5 flex gap-2.5 z-10">
        <span className="design-featured-badge">★ Featured</span>
      </div>
      <div className="absolute top-4 sm:top-5 right-4 sm:top-5 right-5 z-10">
        <span className="design-featured-year">{safeYear}</span>
      </div>

      <div className="relative z-10 p-4 sm:p-8 md:p-10 flex flex-col">
        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5 sm:mb-4">
            {tagsList.map((tag, idx) => (
              <span key={idx} className="design-featured-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="design-featured-title">{safeTitle}</h3>
        <p className="design-featured-tagline">{safeTagline}</p>
        {work.aiSummary && (
          <p className="text-primary font-bold text-xs sm:text-sm tracking-wider uppercase mb-3 sm:mb-5 mix-blend-difference flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>{' '}
            {work.aiSummary}
          </p>
        )}
        <div>
          <a
            href={safeLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="design-featured-btn cursor-pointer"
          >
            <span>Visit Project</span>
            <span className="material-symbols-outlined text-xs sm:text-sm">open_in_new</span>
          </a>
        </div>
      </div>

      <div className="design-hover-center-pulse">
        <div className="design-pulse-circle">
          <span className="material-symbols-outlined text-xl sm:text-2xl">open_in_new</span>
        </div>
      </div>
    </div>
  );
};
