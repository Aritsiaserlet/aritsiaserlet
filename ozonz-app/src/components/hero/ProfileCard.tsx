import React from 'react';
import { GitHubStats } from '../../types';
import { StatCard } from './StatCard';

interface ProfileCardProps {
  stats: GitHubStats;
  isLivePulsing: boolean;
  hasLoaded: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ stats, isLivePulsing, hasLoaded }) => {
  return (
    <div className="w-full relative mb-6">
      <div className="relative group p-5 sm:p-7 md:p-8 rounded-2xl border border-primary/20 bg-surface/40 backdrop-blur-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 animate-card-ambient">
        {/* Texture & GitHub Icon Overlay */}
        <div className="absolute inset-0 bg-grain z-0"></div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-10 group-hover:opacity-30 transition-opacity z-10">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 fill-current" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Header: Avatar & Info */}
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-12">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 shrink-0">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:bg-primary/50 transition-all duration-700 animate-pulse" />
              <div className="relative w-full h-full rounded-full border-2 border-primary/40 overflow-hidden shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                <img
                  id="ghAvatar"
                  alt="OzonZ Profile"
                  className="w-full h-full object-cover"
                  src={stats.avatarUrl}
                />
              </div>
              {/* Status Indicator */}
              <div
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-background rounded-full flex items-center justify-center border border-white/10"
                title="Live from GitHub"
              >
                <div
                  id="ghLiveDot"
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full transition-all duration-300 ${
                    isLivePulsing ? 'scale-125 opacity-100' : 'animate-pulse opacity-40'
                  }`}
                />
              </div>
            </div>

            <div className="text-center px-2">
              <h3
                id="ghDisplayName"
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-on-background font-headline leading-tight tracking-tight min-h-[1.2em] break-words"
              >
                {!hasLoaded ? (
                  <span className="gh-skeleton inline-block w-40 sm:w-48 h-8 sm:h-10 rounded-lg" />
                ) : (
                  <a
                    href={stats.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {stats.name}
                  </a>
                )}
              </h3>
              <p
                id="ghHandle"
                className="text-primary/70 font-body-md text-base sm:text-xl md:text-2xl tracking-wide mt-1 sm:mt-2"
              >
                {!hasLoaded ? (
                  <span className="gh-skeleton inline-block w-20 sm:w-24 h-5 sm:h-6 rounded-md" />
                ) : (
                  <a
                    href={stats.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    @{stats.login}
                  </a>
                )}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
            <StatCard
              icon="show_chart"
              label="Contributions"
              value={stats.contributions}
            />
            <StatCard
              icon="folder"
              label="Repositories"
              value={stats.repositories}
            />
          </div>

          {/* Action Button */}
          <a
            className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-primary text-on-primary py-3.5 sm:py-5 md:py-6 rounded-xl font-bold text-xs sm:text-sm md:text-base tracking-wider sm:tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] relative overflow-hidden"
            href={stats.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>FOLLOW ON GITHUB</span>
              <span className="material-symbols-outlined text-base sm:text-lg">open_in_new</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          </a>
        </div>
      </div>
    </div>
  );
};
