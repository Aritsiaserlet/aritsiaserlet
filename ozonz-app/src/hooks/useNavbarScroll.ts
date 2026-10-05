import { useState, useEffect } from 'react';

export function useNavbarScroll() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 80;
      setIsScrolled(scrolled);
      if (scrolled) {
        document.documentElement.classList.add('scrolled-down');
      } else {
        document.documentElement.classList.remove('scrolled-down');
      }

      if (window.scrollY > 60) {
        setShowScrollIndicator(false);
      } else if (window.scrollY <= 10) {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isScrolled, showScrollIndicator };
}
