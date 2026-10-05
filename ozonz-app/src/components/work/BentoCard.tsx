import React from 'react';
import { Work } from '../../types';
import { safeUrl } from '../../lib/utils';

interface BentoCardProps {
  work: Work;
  onOpenModal: (work: Work) => void;
}

export const BentoCard: React.FC<BentoCardProps> = ({ work, onOpenModal }) => {
  const isImg =
    typeof work.image === 'string' &&
    (work.image.startsWith('http') || work.image.includes('/') || work.image.includes('.'));
  const safeImg = isImg ? safeUrl(work.image as string) : '';
  const safeTitle = work.title || work.name || '(Untitled)';
  const safeTagline = work.tagline || '';
  const safeYear = work.year || (work.date ? new Date(work.date).getFullYear() : new Date().getFullYear());

  const tagsList = work.tags
    ? (Array.isArray(work.tags) ? work.tags : work.tags.split(','))
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  return (
    <div
      className="design-side-card work-card-trigger cursor-pointer w-full min-w-0"
      data-id={String(work.id || '')}
      onClick={() => onOpenModal(work)}
    >
      <div className="design-side-thumbnail">
        {safeImg ? (
          <img src={safeImg} alt={safeTitle} className="design-side-img" />
        ) : (
          <div className="w-full h-full bg-surface/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl sm:text-5xl">
              {(work.image as string) || 'brush'}
            </span>
          </div>
        )}
        <div className="design-side-fade" />
        <span className="design-side-year">{safeYear}</span>
        <div className="design-side-hover-overlay">
          <div className="design-side-overlay-circle">
            <span className="material-symbols-outlined text-base sm:text-lg">arrow_forward</span>
          </div>
        </div>
      </div>

      <div className="design-side-body">
        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
            {tagsList.map((tag, idx) => (
              <span key={idx} className="design-tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="design-side-title">{safeTitle}</h3>
        <p className="design-side-tagline">{safeTagline}</p>

        <div className="design-side-footer">
          {work.contributors && work.contributors.length > 1 ? (
            <span className="flex items-center gap-1 text-on-surface-variant/70 text-[9.5px] sm:text-[11px] font-semibold truncate">
              <span className="material-symbols-outlined text-[12px] sm:text-[13px] shrink-0">
                group
              </span>
              <span>{work.contributors.length} contributors</span>
            </span>
          ) : (
            <div />
          )}

          <span className="design-side-explore">
            <span>Explore</span>
            <span className="material-symbols-outlined text-[9px] sm:text-[11px]">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
