import React, { useState } from 'react';

interface NavBarProps {
  isScrolled: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (targetId === '#' || targetId === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      id="main-nav"
      className={`fixed top-0 left-0 w-full z-50 bg-background/85 backdrop-blur-xl border-b border-outline/20 transition-all duration-500 transform ${
        isScrolled ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex justify-between items-center px-4 sm:px-margin-mobile md:px-margin-desktop py-3.5 sm:py-4 max-w-max-width mx-auto">
        <a
          className="text-xl sm:text-2xl font-bold text-primary tracking-wide"
          href="#"
          onClick={(e) => handleNavClick(e, '#')}
        >
          OzonZ
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            className="text-on-surface hover:text-primary transition-colors text-sm font-medium"
            href="#work"
            onClick={(e) => handleNavClick(e, '#work')}
          >
            Work
          </a>
          <a
            className="text-on-surface hover:text-primary transition-colors text-sm font-medium"
            href="#about"
            onClick={(e) => handleNavClick(e, '#about')}
          >
            About
          </a>
          <a
            className="text-on-surface hover:text-primary transition-colors text-sm font-medium"
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
          >
            Contact
          </a>
        </div>

        {/* Mobile Hamburger Button (44px touch area) */}
        <button
          className="md:hidden text-primary p-2 min-w-[44px] min-h-[44px] focus:outline-none flex items-center justify-center cursor-pointer"
          id="menu-toggle"
          aria-label="Toggle Navigation Menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span className="material-symbols-outlined text-2xl" id="menu-icon">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden px-6 py-4 flex flex-col gap-3 border-t border-outline/10 bg-background/95 backdrop-blur-2xl"
        >
          <a
            className="text-on-surface hover:text-primary transition-colors text-base font-medium py-2.5 border-b border-outline/5"
            href="#work"
            onClick={(e) => handleNavClick(e, '#work')}
          >
            Work
          </a>
          <a
            className="text-on-surface hover:text-primary transition-colors text-base font-medium py-2.5 border-b border-outline/5"
            href="#about"
            onClick={(e) => handleNavClick(e, '#about')}
          >
            About
          </a>
          <a
            className="text-on-surface hover:text-primary transition-colors text-base font-medium py-2.5"
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
          >
            Contact
          </a>
        </div>
      )}
    </nav>
  );
};
