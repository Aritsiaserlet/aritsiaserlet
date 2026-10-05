import React from 'react';

export const RolesBar: React.FC = () => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-1 sm:gap-0" id="roles-bar">
        <span className="roles-tag">Game Developer</span>
        <span className="roles-tag-sep hidden sm:inline">|</span>
        <span className="roles-tag">2D Artist</span>
        <span className="roles-tag-sep hidden sm:inline">|</span>
        <span className="roles-tag">Programmer</span>
        <span className="roles-tag-sep hidden sm:inline">|</span>
        <span className="roles-tag">Game Designer</span>
      </div>
    </div>
  );
};
