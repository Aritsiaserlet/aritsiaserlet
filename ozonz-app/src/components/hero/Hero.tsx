import React from 'react';
import { GitHubStats } from '../../types';
import { ProfileCard } from './ProfileCard';
import { RolesBar } from './RolesBar';
import { ScrollIndicator } from './ScrollIndicator';

interface HeroProps {
  stats: GitHubStats;
  isLivePulsing: boolean;
  hasLoaded: boolean;
  showScrollIndicator: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  stats,
  isLivePulsing,
  hasLoaded,
  showScrollIndicator,
}) => {
  return (
    <section
      className="ozonz-hero-section px-4 sm:px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto"
      id="hero"
    >
      {/* Top Spacer to keep center balanced */}
      <div className="h-4 sm:h-8 shrink-0" />

      <div className="flex flex-col items-center w-full max-w-2xl my-auto">
        <ProfileCard
          stats={stats}
          isLivePulsing={isLivePulsing}
          hasLoaded={hasLoaded}
        />
        <RolesBar />
      </div>

      <ScrollIndicator show={showScrollIndicator} />
    </section>
  );
};
