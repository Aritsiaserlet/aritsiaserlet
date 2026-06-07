// ═════════════════════════════════════════════════════════════════════════════════
// OZONZ PORTFOLIO - Main Entry Point
// portfolio-ozonz.js
//
// Architecture:
// - Modular component system
// - State management pattern
// - Clean separation of concerns
// - No external dependencies (Vanilla JS ES6+)
// ═════════════════════════════════════════════════════════════════════════════════

// ── Module: State Management ──
const OzonZState = (() => {
  let state = {
    theme: 'light',
    activeFilter: 'all',
    scrollPosition: 0,
    isNavigationOpen: false,
    user: {
      name: 'Chanon Thongduang',
      handle: 'OzonZ',
      email: 'contact@ozonz.dev'
    }
  };

  return {
    getState: () => ({ ...state }),
    setState: (updates) => {
      state = { ...state, ...updates };
      window.dispatchEvent(new CustomEvent('stateChange', { detail: state }));
    },
    subscribe: (listener) => {
      window.addEventListener('stateChange', (e) => listener(e.detail));
    }
  };
})();

// ── Module: DOM Utilities ──
const DOMUtils = (() => {
  return {
    // Query Selectors
    qs: (selector) => document.querySelector(selector),
    qsa: (selector) => Array.from(document.querySelectorAll(selector)),

    // Element Creation
    create: (tag, attrs = {}, content = '') => {
      const element = document.createElement(tag);
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class') {
          element.className = value;
        } else if (key === 'html') {
          element.innerHTML = value;
        } else if (key === 'text') {
          element.textContent = value;
        } else {
          element.setAttribute(key, value);
        }
      });
      if (content) element.innerHTML = content;
      return element;
    },

    // Event Listeners
    on: (element, event, handler) => {
      if (Array.isArray(element)) {
        element.forEach(el => el.addEventListener(event, handler));
      } else {
        element?.addEventListener(event, handler);
      }
    },

    // Class Manipulation
    addClass: (element, className) => element?.classList.add(className),
    removeClass: (element, className) => element?.classList.remove(className),
    toggleClass: (element, className) => element?.classList.toggle(className),
    hasClass: (element, className) => element?.classList.contains(className),

    // Attribute Manipulation
    attr: (element, attr, value = null) => {
      if (value === null) return element?.getAttribute(attr);
      element?.setAttribute(attr, value);
    },

    // Text Content
    text: (element, content = null) => {
      if (content === null) return element?.textContent;
      element.textContent = content;
    },

    // HTML Content
    html: (element, content = null) => {
      if (content === null) return element?.innerHTML;
      element.innerHTML = content;
    },

    // Style Manipulation
    style: (element, styles) => {
      Object.entries(styles).forEach(([key, value]) => {
        element.style[key] = value;
      });
    },

    // Show/Hide
    show: (element) => element?.style.display !== 'none' && (element.style.display = ''),
    hide: (element) => element.style.display = 'none',

    // Parent Traversal
    closest: (element, selector) => element?.closest(selector),

    // Scroll to Element
    scrollTo: (element, smooth = true) => {
      element?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };
})();

// ── Module: Navigation Handler ──
const NavigationHandler = (() => {
  const navbar = DOMUtils.qs('.ozonz-navbar');
  const navLinks = DOMUtils.qsa('.nav-link');
  const scrollIndicator = DOMUtils.qs('.scroll-indicator');

  const init = () => {
    setupNavigation();
    setupScrollIndicator();
    setupSmoothScroll();
  };

  const setupNavigation = () => {
    navLinks.forEach(link => {
      DOMUtils.on(link, 'click', (e) => {
        const href = DOMUtils.attr(link, 'href');
        if (href?.startsWith('#')) {
          e.preventDefault();
          const target = DOMUtils.qs(href);
          if (target) {
            DOMUtils.scrollTo(target);
            updateActiveLink(link);
          }
        }
      });
    });

    // Update active link on scroll
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      navLinks.forEach(link => {
        const href = DOMUtils.attr(link, 'href');
        if (href?.startsWith('#')) {
          const section = DOMUtils.qs(href);
          if (section) {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
              updateActiveLink(link);
            }
          }
        }
      });

      // Hide scroll indicator when scrolled
      if (scrollIndicator) {
        if (scrollPos > 100) {
          DOMUtils.hide(scrollIndicator);
        } else {
          DOMUtils.show(scrollIndicator);
        }
      }

      // Update navbar shadow on scroll
      if (scrollPos > 50) {
        DOMUtils.addClass(navbar, 'scrolled');
      } else {
        DOMUtils.removeClass(navbar, 'scrolled');
      }
    });
  };

  const updateActiveLink = (activeLink) => {
    navLinks.forEach(link => DOMUtils.removeClass(link, 'active'));
    DOMUtils.addClass(activeLink, 'active');
  };

  const setupScrollIndicator = () => {
    if (!scrollIndicator) return;

    // Smooth scroll animation
    const scroll = () => {
      const scrollPos = window.scrollY;
      scrollIndicator.style.opacity = Math.max(1 - scrollPos / 300, 0);
    };

    window.addEventListener('scroll', scroll);
  };

  const setupSmoothScroll = () => {
    // Already handled by scroll-behavior: smooth in CSS
  };

  return { init };
})();

// ── Module: Theme Manager ──
const ThemeManager = (() => {
  const themeBtn = DOMUtils.qs('#themeBtn');
  const themes = ['light', 'dark'];
  let currentTheme = 'light';

  const init = () => {
    loadTheme();
    setupThemeButton();
  };

  const loadTheme = () => {
    const saved = localStorage.getItem('ozonz-theme') || 'light';
    setTheme(saved);
  };

  const setTheme = (themeName) => {
    if (!themes.includes(themeName)) themeName = 'light';
    currentTheme = themeName;

    DOMUtils.toggleClass(document.body, 'dark-theme', themeName === 'dark');
    localStorage.setItem('ozonz-theme', themeName);

    updateThemeButton();
    OzonZState.setState({ theme: themeName });
  };

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const setupThemeButton = () => {
    if (themeBtn) {
      DOMUtils.on(themeBtn, 'click', toggleTheme);
    }
  };

  const updateThemeButton = () => {
    if (themeBtn) {
      DOMUtils.text(themeBtn, currentTheme === 'light' ? '🌙' : '☀️');
    }
  };

  return { init, setTheme, toggleTheme, getTheme: () => currentTheme };
})();

// ── Module: Help Modal ──
const HelpModal = (() => {
  const helpBtn = DOMUtils.qs('#helpBtn');
  let modalElement = null;

  const init = () => {
    if (helpBtn) {
      DOMUtils.on(helpBtn, 'click', openModal);
    }
  };

  const createModal = () => {
    const modal = DOMUtils.create('div', { class: 'modal' });
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>About OzonZ</h3>
          <button class="modal-close" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>Chanon Thongduang (OzonZ)</strong> is a multi-disciplinary creator combining game development, 2D art, programming, and game design.</p>
          <p><strong>Disciplines:</strong></p>
          <ul style="margin: 12px 0; padding-left: 24px;">
            <li>🎮 Game Developer - Systems & mechanics</li>
            <li>🎨 2D Artist - Pixel art & animation</li>
            <li>💻 Programmer - Code architecture</li>
            <li>🎭 Game Designer - Narrative & UX</li>
          </ul>
          <p><strong>Keyboard Shortcuts:</strong></p>
          <ul style="margin: 12px 0; padding-left: 24px;">
            <li><kbd>Home</kbd> - Go to top</li>
            <li><kbd>End</kbd> - Go to bottom</li>
          </ul>
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('.modal-close');
    DOMUtils.on(closeBtn, 'click', closeModal);
    DOMUtils.on(modal, 'click', (e) => {
      if (e.target === modal) closeModal();
    });

    return modal;
  };

  const openModal = () => {
    if (!modalElement) {
      modalElement = createModal();
      document.body.appendChild(modalElement);
    }
    DOMUtils.addClass(modalElement, 'active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (modalElement) {
      DOMUtils.removeClass(modalElement, 'active');
      document.body.style.overflow = '';
    }
  };

  return { init };
})();

// ── Module: Performance Monitor ──
const PerformanceMonitor = (() => {
  const init = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[OzonZ Portfolio] Initialized successfully');
      console.log('[Theme] Loaded:', ThemeManager.getTheme());
    }
  };

  return { init };
})();

// ── Module: Lazy Loading Images ──
const LazyLoadImages = (() => {
  const init = () => {
    if (!('IntersectionObserver' in window)) return;

    const images = DOMUtils.qsa('[data-src]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = DOMUtils.attr(img, 'data-src');
          if (src) {
            DOMUtils.attr(img, 'src', src);
            DOMUtils.attr(img, 'data-src', null);
            observer.unobserve(img);
          }
        }
      });
    }, { rootMargin: '50px' });

    images.forEach(img => observer.observe(img));
  };

  return { init };
})();

// ── Module: Animation Triggers ──
const AnimationTriggers = (() => {
  const init = () => {
    if (!('IntersectionObserver' in window)) return;

    const animatedElements = DOMUtils.qsa('[data-animate]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          DOMUtils.addClass(entry.target, 'animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));
  };

  return { init };
})();

// ══════════════════════════════════════════════════════════════════════════════
// APPLICATION INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════════

const App = (() => {
  const init = () => {
    // Initialize all modules in order
    console.log('🎨 OzonZ Portfolio - Initializing...');

    // Phase 1: Setup Core Systems
    ThemeManager.init();
    NavigationHandler.init();
    HelpModal.init();

    // Phase 2: Setup Performance Features
    LazyLoadImages.init();
    AnimationTriggers.init();

    // Phase 3: Monitor
    PerformanceMonitor.init();

    console.log('✅ OzonZ Portfolio - Ready');
  };

  return { init };
})();

// ── DOM Ready ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Export for module usage
export {
  OzonZState,
  DOMUtils,
  NavigationHandler,
  ThemeManager,
  HelpModal,
  LazyLoadImages,
  AnimationTriggers
};
