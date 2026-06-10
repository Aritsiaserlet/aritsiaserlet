/**
 * OzonZ portfolio — live GitHub stats + cursor-reactive background
 */
(function () {
  const GITHUB_USER =
    document.body.dataset.githubUser || 'OzonZ';
  const POLL_MS = 60_000;

  const defaultWorks = [
    {
      title: "Project: Neon Dreams",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAB52Gn30AfNgh_ZIaX0WiCP3ULKJO16YpMvDm_d6OFmYoLiJZuIz6kYU0dWjP51u9KSF3rz05OiTcd7jOstWfwOf0135M2Zdh_eIKUBhCTKP8e4gwhrc-Q16KdGIqe5Lh_IcxEm76bR3WiHWks33_7KBAGYy2gyAN-gDZwGt7KV6PmvsfJQrEvrdNCy_j0nHKudDfKnE5qgqy0nseuq0C3B3Jtc3NvA5MC3guzL2BHHWtOcJiF3TBuJqJcX3OZHKJCrTEngA-Xuc7A",
      link: "https://github.com/OzonZ",
      tags: "NARRATIVE ADVENTURE, PIXEL ART",
      detail: "A cinematic exploration of memory and connection set in a vibrant post-human cityscape."
    },
    {
      title: "Engine Architecture",
      image: "architecture",
      link: "https://github.com/OzonZ",
      tags: "C++, HLSL",
      detail: "Custom rendering pipeline for retro-style shaders and pixel-perfect scaling."
    },
    {
      title: "Concept Gallery",
      image: "brush",
      link: "https://github.com/OzonZ",
      tags: "ASEPRITE, ILLUSTRATION",
      detail: "A collection of environment sketches and sprites inspired by 90s anime."
    }
  ];

  const defaultContacts = [
    {
      name: "GITHUB",
      link: "https://github.com/OzonZ",
      iconType: "svg",
      iconVal: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
    },
    {
      name: "FACEBOOK",
      link: "https://www.facebook.com/chanon.thongduang?locale=th_TH",
      iconType: "svg",
      iconVal: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    },
    {
      name: "DISCORD",
      link: "https://discordapp.com/users/1018888909419204658",
      iconType: "svg",
      iconVal: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"
    },
    {
      name: "HAMSTER HUB",
      link: "https://hamsterhub.co/profile/eaya",
      iconType: "image",
      iconVal: "https://lh3.googleusercontent.com/aida-public/AB6AXuAB52Gn30AfNgh_ZIaX0WiCP3ULKJO16YpMvDm_d6OFmYoLiJZuIz6kYU0dWjP51u9KSF3rz05OiTcd7jOstWfwOf0135M2Zdh_eIKUBhCTKP8e4gwhrc-Q16KdGIqe5Lh_IcxEm76bR3WiHWks33_7KBAGYy2gyAN-gDZwGt7KV6PmvsfJQrEvrdNCy_j0nHKudDfKnE5qgqy0nseuq0C3B3Jtc3NvA5MC3guzL2BHHWtOcJiF3TBuJqJcX3OZHKJCrTEngA-Xuc7A"
    }
  ];

  const els = {
    contributions: document.getElementById('ghContributions'),
    repositories: document.getElementById('ghRepositories'),
    avatar: document.getElementById('ghAvatar'),
    displayName: document.getElementById('ghDisplayName'),
    handle: document.getElementById('ghHandle'),
    liveDot: document.getElementById('ghLiveDot'),
  };

  let statsTimer = null;
  let lastContributions = null;
  let lastRepos = null;

  function formatCount(n) {
    if (n == null || Number.isNaN(n)) return '—';
    return n.toLocaleString();
  }

  function animateValue(el, from, to, duration = 600) {
    if (!el || from === to) {
      if (el) el.textContent = formatCount(to);
      return;
    }
    const start = performance.now();
    const diff = to - from;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatCount(Math.round(from + diff * eased));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatCount(to);
    }
    requestAnimationFrame(tick);
  }

  function setStat(el, value, cacheKey) {
    if (!el || value == null) return;
    const prev = cacheKey === 'c' ? lastContributions : lastRepos;
    animateValue(el, prev ?? 0, value);
    if (cacheKey === 'c') lastContributions = value;
    else lastRepos = value;
  }

  function pulseLive() {
    if (!els.liveDot) return;
    els.liveDot.classList.remove('opacity-40');
    els.liveDot.classList.add('opacity-100', 'scale-125');
    setTimeout(() => {
      els.liveDot.classList.remove('scale-125', 'opacity-100');
      els.liveDot.classList.add('opacity-40');
    }, 400);
  }

  async function fetchGitHubData() {
    // 1. Fetch profile info
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}`,
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) throw new Error('REST HTTP ' + res.status);
    const u = await res.json();

    // 2. Fetch contributions
    let contributions = null;
    
    // Try jogruber API first (highly reliable)
    try {
      const cr = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}`
      );
      if (cr.ok) {
        const cal = await cr.json();
        if (cal.total) {
          contributions = Object.values(cal.total).reduce((sum, v) => sum + (v || 0), 0);
        }
      }
    } catch (err) {
      console.warn('[GitHub sync] jogruber API failed, trying deno.dev:', err.message);
    }

    // Fallback to deno.dev API if jogruber failed or returned null
    if (contributions === null) {
      try {
        const cr = await fetch(
          `https://github-contributions-api.deno.dev/${GITHUB_USER}.json`
        );
        if (cr.ok) {
          const cal = await cr.json();
          let count = 0;
          if (Array.isArray(cal.contributions)) {
            for (const week of cal.contributions) {
              if (Array.isArray(week)) {
                for (const day of week) {
                  count += (day.contributionCount || 0);
                }
              }
            }
          }
          contributions = count;
        }
      } catch (err) {
        console.warn('[GitHub sync] deno.dev API failed:', err.message);
      }
    }

    return {
      contributions: contributions ?? lastContributions ?? 0,
      repositories: u.public_repos ?? 0,
      name: u.name ?? u.login,
      login: u.login,
      avatarUrl: u.avatar_url,
    };
  }

  async function syncGitHub() {
    try {
      const data = await fetchGitHubData();
      applyStats(data);
      pulseLive();
    } catch (err) {
      console.warn('[GitHub sync] sync failed:', err.message);
      if (els.contributions?.textContent === '…')
        els.contributions.textContent = '—';
      if (els.repositories?.textContent === '…')
        els.repositories.textContent = '—';
    }
  }

  function applyStats(data) {
    setStat(els.contributions, data.contributions, 'c');
    setStat(els.repositories, data.repositories, 'r');
    if (data.avatarUrl && els.avatar) els.avatar.src = data.avatarUrl;
    if (data.name && els.displayName) els.displayName.textContent = data.name;
    if (data.login && els.handle)
      els.handle.textContent = '@' + data.login;
  }

  function startGitHubSync() {
    if (els.contributions) els.contributions.textContent = '…';
    if (els.repositories) els.repositories.textContent = '…';
    syncGitHub();
    statsTimer = setInterval(syncGitHub, POLL_MS);
    window.addEventListener('focus', syncGitHub);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) syncGitHub();
    });
  }

  /* ── Dot-grid background + soft cursor spotlight ── */
  function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        v_texCoord.y = 1.0 - v_texCoord.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_spot;
      uniform float u_isDark;
      varying vec2 v_texCoord;

      void main() {
        vec2 px = v_texCoord * u_resolution;
        
        // Background colors
        vec3 bgDark = vec3(0.063, 0.078, 0.102);
        
        // Yellowish-white gradient for light mode
        float grad = clamp(v_texCoord.x * 0.5 + v_texCoord.y * 0.5, 0.0, 1.0);
        vec3 bgLight = mix(vec3(0.98, 0.965, 0.922), vec3(1.0, 0.992, 0.969), grad);
        
        vec3 bg = mix(bgLight, bgDark, u_isDark);

        float spacing = 26.0;
        vec2 cell = mod(px + spacing * 0.5, spacing) - spacing * 0.5;
        float dotShape = 1.0 - smoothstep(1.35, 0.0, length(cell));

        vec2 mousePx = u_mouse * u_resolution;
        float spotDist = length(px - mousePx);
        float spotlight = u_spot * exp(-spotDist * spotDist / (2.0 * 95.0 * 95.0));

        // Dot Colors for dark/light modes
        vec3 dotColorDimDark = vec3(0.22, 0.24, 0.28);
        vec3 dotColorLitDark = vec3(0.82, 0.84, 0.88);
        
        vec3 dotColorDimLight = vec3(0.878, 0.855, 0.784); // Soft warm gray/beige dots
        vec3 dotColorLitLight = vec3(0.22, 0.42, 0.25); // Rich green dots under spotlight
        
        vec3 dotColorDim = mix(dotColorDimLight, dotColorDimDark, u_isDark);
        vec3 dotColorLit = mix(dotColorLitLight, dotColorLitDark, u_isDark);
        
        vec3 dotColor = mix(dotColorDim, dotColorLit, spotlight);

        // Brightness and mixing
        float dim = mix(0.18, 0.14, u_isDark);
        float lit = dim + spotlight * 0.42;
        float brightness = mix(dim, lit, dotShape);
        
        // Spotlight cursor glow color
        vec3 glowColorDark = vec3(0.918, 0.894, 0.694); // #eae4b1 (warm cream)
        vec3 glowColorLight = vec3(0.702, 0.859, 0.502); // #b3db80 (vibrant lime green)
        vec3 glowColor = mix(glowColorLight, glowColorDark, u_isDark);
        
        // Add ambient glow to the background around the cursor
        float ambientGlow = spotlight * spotlight * 0.08;
        
        // Final color mix
        vec3 color = bg + glowColor * ambientGlow + dotColor * brightness * dotShape;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(
      program,
      createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
    );
    gl.linkProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const spotLocation = gl.getUniformLocation(program, 'u_spot');
    const isDarkLocation = gl.getUniformLocation(program, 'u_isDark');

    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    let spot = 0;
    let targetSpot = 0;
    let pointerInside = false;

    // Theme transition state
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialIsDark = savedTheme === 'dark' || (savedTheme === null && systemPrefersDark);
    let darkTransition = initialIsDark ? 1.0 : 0.0;

    function onMove(e) {
      target.x = e.clientX / window.innerWidth;
      target.y = e.clientY / window.innerHeight;
      targetSpot = 1;
      pointerInside = true;
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseenter', onMove, { passive: true });
    document.addEventListener(
      'touchmove',
      (e) => {
        const t = e.touches[0];
        if (t) onMove({ clientX: t.clientX, clientY: t.clientY });
      },
      { passive: true }
    );
    document.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (t) onMove({ clientX: t.clientX, clientY: t.clientY });
    }, { passive: true });
    document.addEventListener('mouseleave', () => {
      pointerInside = false;
      targetSpot = 0;
    });

    function render() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);

      const lerp = pointerInside ? 0.14 : 0.06;
      mouse.x += (target.x - mouse.x) * lerp;
      mouse.y += (target.y - mouse.y) * lerp;
      spot += (targetSpot - spot) * 0.12;

      // Animate transition between dark and light modes
      const currentIsDark = document.documentElement.classList.contains('dark');
      const targetDark = currentIsDark ? 1.0 : 0.0;
      darkTransition += (targetDark - darkTransition) * 0.1;

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);
      gl.uniform1f(spotLocation, spot);
      gl.uniform1f(isDarkLocation, darkTransition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  function initRevealAndTheme() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal, .reveal-delayed').forEach((el) => observer.observe(el));

    const themeToggle = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');

    // Initialize toggle state correctly based on current classes
    const isDarkInitial = document.documentElement.classList.contains('dark');
    if (icon) {
      icon.textContent = isDarkInitial ? 'light_mode' : 'dark_mode';
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
      });
    }

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        console.log('Mobile menu clicked');
      });
    }
  }

  function initNavbarScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    function handleScroll() {
      if (window.scrollY > 80) {
        nav.classList.remove('-translate-y-full');
        nav.classList.add('translate-y-0');
      } else {
        nav.classList.remove('translate-y-0');
        nav.classList.add('-translate-y-full');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function initSmoothScroll() {
    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href) return;

        if (href === '#' || href === '') {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else if (href.startsWith('#')) {
          e.preventDefault();
          const targetElement = document.querySelector(href);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  function init() {
    initBackground();
    startGitHubSync();
    initRevealAndTheme();
    initNavbarScroll();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
