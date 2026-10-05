import React from 'react';

const archetypes = [
  {
    icon: 'sports_esports',
    title: 'Game Dev',
    desc: 'Robust systems & gameplay logic.',
  },
  {
    icon: 'palette',
    title: '2D Art',
    desc: 'Pixel art & character design.',
  },
  {
    icon: 'terminal',
    title: 'Coding',
    desc: 'Clean, performant architectures.',
  },
  {
    icon: 'lightbulb',
    title: 'Design',
    desc: 'Player psychology & engagement.',
  },
];

export const Archetypes: React.FC = () => {
  return (
    <section
      className="px-4 sm:px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto py-16 sm:py-24 md:py-32 border-t border-outline/50"
      id="archetypes"
    >
      <h2 className="text-xs sm:text-sm font-bold tracking-[0.3em] sm:tracking-[0.4em] text-primary uppercase mb-10 sm:mb-16 text-center font-headline">
        Technical Archetype
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-12 text-center">
        {archetypes.map((item, idx) => (
          <div key={idx} className="group p-2 sm:p-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center rounded-2xl bg-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">
                {item.icon}
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-bold mb-1.5 sm:mb-3 uppercase font-headline">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant px-1 sm:px-4">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
