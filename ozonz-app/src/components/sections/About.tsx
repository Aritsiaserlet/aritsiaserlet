import React from 'react';

export const About: React.FC = () => {
  return (
    <section
      className="px-4 sm:px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto py-16 sm:py-24 md:py-32"
      id="about"
    >
      <div className="max-w-4xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-10 uppercase text-primary">
          About the Dev
        </h2>
        <p className="text-xl sm:text-2xl md:text-3xl text-on-surface leading-relaxed mb-6 sm:mb-8 font-headline">
          Game Developer. 2D Artist. Programmer. Game Designer.
        </p>
        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          I started my journey in Game Jams and deepened my roots through{' '}
          <strong className="text-on-surface">Hamster Hub&apos;s</strong> courses, mastering
          Game Design, <strong className="text-on-surface">Unity development</strong>, and
          the core philosophy of effective presentation. Building on that foundation
          through self-study, I expanded into web development, web for education and game
          programming, collaborating closely with peers and mentors from the community to
          transform creative concepts into reality.
        </p>
      </div>
    </section>
  );
};
