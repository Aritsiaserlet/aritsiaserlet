import React, { useEffect, useState, useRef } from 'react';
import { Work } from '../../types';
import { safeUrl } from '../../lib/utils';

interface ProjectModalProps {
  work: Work | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ work, onClose }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const imagesList: string[] = [];
  if (work) {
    if (work.images && Array.isArray(work.images) && work.images.length > 0) {
      imagesList.push(...work.images);
    } else if (work.image) {
      imagesList.push(Array.isArray(work.image) ? work.image[0] : work.image);
    }
  }

  // Track click for analytics
  useEffect(() => {
    if (work) {
      const win = window as unknown as { trackPortfolioClick?: (name?: string) => void };
      if (typeof win.trackPortfolioClick === 'function') {
        win.trackPortfolioClick(work.name || work.title);
      }
      setImageIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [work]);

  // Carousel auto-slide when multiple images
  useEffect(() => {
    if (!work || imagesList.length <= 1) return;
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % imagesList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [work, imagesList.length]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!work) return null;

  const isImg =
    imagesList.length > 0 &&
    typeof imagesList[0] === 'string' &&
    (imagesList[0].startsWith('http') ||
      imagesList[0].includes('/') ||
      imagesList[0].includes('.'));

  const safeLink = safeUrl(work.link || '#');
  const tagsList = work.tags
    ? (Array.isArray(work.tags) ? work.tags : work.tags.split(','))
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!safeLink || safeLink === '#') {
      e.preventDefault();
      alert('เกมนี้ยังไม่มี link ตอนนี้');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || imagesList.length <= 1) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (diff > 50) {
      // swipe right -> previous
      setImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
    } else if (diff < -50) {
      // swipe left -> next
      setImageIndex((prev) => (prev + 1) % imagesList.length);
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      id="project-detail-modal"
      className="fixed inset-0 z-[800] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        id="project-detail-box"
        className="relative max-w-2xl w-full max-h-[92vh] overflow-y-auto rounded-2xl bg-surface border border-primary/30 shadow-[0_32px_80px_rgba(0,0,0,0.5)] flex flex-col animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image hero */}
        <div
          className="relative w-full h-[200px] sm:h-[280px] shrink-0 overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {isImg ? (
            <div className="w-full h-full relative">
              {imagesList.map((src, idx) => (
                <img
                  key={idx}
                  src={safeUrl(src)}
                  alt={work.title || work.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    idx === imageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />
              ))}

              {/* Dots indicator for multi-image */}
              {imagesList.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                  {imagesList.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        idx === imageIndex ? 'w-5 bg-primary' : 'bg-white/50'
                      }`}
                      onClick={() => setImageIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-surface/20">
              <span className="material-symbols-outlined text-primary text-6xl sm:text-8xl">
                {(work.image as string) || (work.model ? 'view_in_ar' : 'brush')}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />

          {/* Close Button (44px touch area on mobile) */}
          <button
            id="project-detail-close-btn"
            className="absolute top-3 right-3 w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white border-none cursor-pointer hover:bg-black/80 transition-colors z-30 min-w-[40px] min-h-[40px]"
            onClick={onClose}
            aria-label="Close Modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 md:p-8 flex flex-col relative z-10 bg-surface">
          {/* Tags */}
          {tagsList.length > 0 && (
            <div id="project-detail-tags" className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
              {tagsList.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.16em] px-[8px] sm:px-[10px] py-[3px] rounded border border-primary/20 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title & Tagline */}
          <h3
            id="project-detail-title"
            className="font-headline text-[clamp(1.35rem,4vw,2.2rem)] font-bold uppercase text-on-background leading-[1.1] mb-1.5 break-words"
          >
            {work.title || work.name}
          </h3>
          {work.tagline && (
            <p
              id="project-detail-tagline"
              className="text-primary text-xs sm:text-[14px] font-semibold mb-4 sm:mb-5"
            >
              {work.tagline}
            </p>
          )}

          {/* Description Box */}
          <div className="bg-surface-variant rounded-xl p-3.5 sm:p-5 mb-4 sm:mb-5 border border-outline/10">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-primary mb-1.5 sm:mb-2">
              Project Details
            </p>
            <p
              id="project-detail-description"
              className="text-on-surface-variant text-xs sm:text-[14px] leading-[1.7] m-0 whitespace-pre-line"
            >
              {work.detail || work.desc || work.description || 'No description provided.'}
            </p>
          </div>

          {/* Contributors Section */}
          {work.contributors && work.contributors.length > 0 && (
            <div
              id="project-detail-contributors-section"
              className="mb-6 flex flex-wrap items-center gap-2.5"
            >
              <span className="text-on-surface-variant flex items-center gap-1.5 text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">group</span> Contributors
              </span>
              <div id="project-detail-contributors-list" className="flex flex-wrap gap-2">
                {work.contributors.map((c, idx) => (
                  <a
                    key={idx}
                    href={c.url || undefined}
                    target={c.url ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={`bg-surface-variant text-on-background text-[11px] sm:text-[12px] font-semibold py-1 px-2.5 sm:px-3 rounded-full border border-outline/30 transition-colors inline-block ${
                      c.url ? 'hover:border-primary/50' : 'cursor-default'
                    }`}
                  >
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Link */}
          <a
            id="project-detail-link"
            href={safeLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="w-full py-3.5 sm:py-4 rounded-[14px] bg-primary text-on-primary font-bold text-[13px] tracking-[0.18em] uppercase text-center flex items-center justify-center gap-2.5 shadow-[0_8px_28px_rgba(var(--primary-rgb),0.18)] transition-all hover:opacity-90 hover:scale-[1.015] cursor-pointer"
          >
            <span>Visit Project</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  );
};
