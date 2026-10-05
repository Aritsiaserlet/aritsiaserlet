import React, { useState, useMemo } from 'react';
import { Work, WorkFilterType } from '../../types';
import { FilterBar } from './FilterBar';
import { FeaturedCard } from './FeaturedCard';
import { BentoCard } from './BentoCard';

interface WorkSectionProps {
  works: Work[];
  isLoading: boolean;
  onOpenModal: (work: Work) => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  works,
  isLoading,
  onOpenModal,
}) => {
  const [filter, setFilter] = useState<WorkFilterType>('all');

  const filteredWorks = useMemo(() => {
    if (filter === 'all') return works;
    return works.filter((w) => {
      const cats = Array.isArray(w.categories)
        ? w.categories.map((c) => String(c).toLowerCase())
        : [];
      const tags = Array.isArray(w.tags)
        ? w.tags.join(', ').toLowerCase()
        : typeof w.tags === 'string'
        ? w.tags.toLowerCase()
        : `${w.cat || ''} ${w.subcat || ''}`.toLowerCase();

      const isGame =
        cats.includes('game') ||
        cats.includes('games') ||
        tags.includes('game') ||
        tags.includes('games');
      const isWebsite =
        cats.includes('website') ||
        cats.includes('web') ||
        cats.includes('webapp') ||
        tags.includes('web') ||
        tags.includes('website');

      if (filter === 'games') return isGame;
      if (filter === 'website') return isWebsite;
      if (filter === 'other') return cats.includes('other') || (!isGame && !isWebsite);
      return true;
    });
  }, [works, filter]);

  const featured = filteredWorks[0];
  const sideWorks = filteredWorks.slice(1, 3);
  const extraWorks = filteredWorks.slice(3);

  return (
    <section className="py-20 sm:py-24 md:py-32" id="work">
      <div className="px-4 sm:px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 md:mb-20 gap-6 sm:gap-8">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 uppercase">
              Selected Archives
            </h2>
            <p className="text-on-surface-variant text-base sm:text-lg md:text-xl">
              A chronicle of interactive experiences and digital creations.
            </p>
          </div>
          <FilterBar currentFilter={filter} onFilterChange={setFilter} />
        </div>

        {/* Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 md:gap-10" id="archives-grid">
          {isLoading && works.length === 0 ? (
            <>
              {/* Featured Skeleton */}
              <div className="col-span-1 lg:col-span-8 min-h-[280px] sm:min-h-[460px] lg:min-h-[560px] rounded-2xl border border-outline/20 bg-surface/30 p-4 sm:p-8 md:p-10 flex flex-col justify-end gap-3 sm:gap-4 relative overflow-hidden animate-pulse">
                <div className="absolute inset-0 gh-skeleton opacity-20" />
                <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
                  <div className="gh-skeleton w-20 sm:w-24 h-4 sm:h-5 rounded-md" />
                  <div className="gh-skeleton w-3/4 h-6 sm:h-10 rounded-lg" />
                  <div className="gh-skeleton w-1/2 h-4 sm:h-6 rounded-md" />
                  <div className="gh-skeleton w-28 sm:w-32 h-8 sm:h-12 rounded-xl mt-2 sm:mt-4" />
                </div>
              </div>
              {/* Side Skeletons */}
              <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 sm:gap-8 md:gap-10">
                <div className="pixel-card p-4 sm:p-8 rounded-2xl border border-outline/20 flex-1 flex flex-col justify-between min-h-[180px] sm:min-h-[260px] animate-pulse">
                  <div>
                    <div className="gh-skeleton w-full h-24 sm:h-32 rounded-xl mb-3 sm:mb-4" />
                    <div className="gh-skeleton w-1/2 h-4 sm:h-6 rounded-md mb-2" />
                  </div>
                  <div className="gh-skeleton w-20 sm:w-24 h-4 sm:h-5 rounded-md" />
                </div>
                <div className="pixel-card p-4 sm:p-8 rounded-2xl border border-outline/20 flex-1 flex flex-col justify-between min-h-[180px] sm:min-h-[260px] animate-pulse">
                  <div>
                    <div className="gh-skeleton w-full h-24 sm:h-32 rounded-xl mb-3 sm:mb-4" />
                    <div className="gh-skeleton w-1/2 h-4 sm:h-6 rounded-md mb-2" />
                  </div>
                  <div className="gh-skeleton w-20 sm:w-24 h-4 sm:h-5 rounded-md" />
                </div>
              </div>
            </>
          ) : filteredWorks.length === 0 ? (
            <div className="text-center text-on-surface-variant py-12 col-span-12">
              No works available in this category.
            </div>
          ) : (
            <>
              {featured && (
                <FeaturedCard work={featured} onOpenModal={onOpenModal} />
              )}

              {sideWorks.length > 0 && (
                <div className="col-span-1 lg:col-span-4 w-full min-w-0 flex flex-col gap-4 sm:gap-8 md:gap-10">
                  {sideWorks.map((work) => (
                    <BentoCard
                      key={String(work.id || work.title || work.name)}
                      work={work}
                      onOpenModal={onOpenModal}
                    />
                  ))}
                </div>
              )}

              {extraWorks.length > 0 && (
                <div className="col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-10 mt-4 sm:mt-10 w-full min-w-0">
                  {extraWorks.map((work) => (
                    <BentoCard
                      key={String(work.id || work.title || work.name)}
                      work={work}
                      onOpenModal={onOpenModal}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
