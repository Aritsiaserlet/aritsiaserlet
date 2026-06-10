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

  function initLocalStorage() {
    if (!localStorage.getItem('works')) {
      localStorage.setItem('works', JSON.stringify(defaultWorks));
    }
    if (!localStorage.getItem('contacts')) {
      localStorage.setItem('contacts', JSON.stringify(defaultContacts));
    }
  }

  function renderWorks() {
    const grid = document.getElementById('archives-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const works = JSON.parse(localStorage.getItem('works') || '[]');
    if (works.length === 0) {
      grid.innerHTML = '<div class="text-center text-on-surface-variant py-10 col-span-12">No works available.</div>';
      return;
    }

    // Featured Card (Index 0)
    const featured = works[0];
    const isFeaturedImg = featured.image.startsWith('http') || featured.image.includes('/') || featured.image.includes('.');
    const featuredHTML = `
        <div class="lg:col-span-8 group relative overflow-hidden rounded-2xl border border-outline/30">
            <div class="absolute inset-0 bg-black/50 z-10 transition-opacity group-hover:opacity-30"></div>
            ${
              isFeaturedImg
                ? `<img alt="${featured.title}" class="w-full h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105" src="${featured.image}" />`
                : `<div class="w-full h-[600px] bg-surface/10 flex items-center justify-center transition-transform duration-1000 group-hover:scale-105"><span class="material-symbols-outlined text-primary text-9xl">${featured.image}</span></div>`
            }
            <div class="absolute bottom-0 left-0 w-full p-10 z-20 bg-gradient-to-t from-background via-background/60 to-transparent">
                <div class="flex flex-wrap gap-3 mb-6">
                    ${featured.tags.split(',').map(tag => `<span class="text-xs font-bold uppercase tracking-[0.2em] text-white mix-blend-difference">${tag.trim()}</span>`).join('')}
                </div>
                <h3 class="text-4xl md:text-5xl font-bold mb-4 uppercase mix-blend-difference text-white">${featured.title}</h3>
                <p class="text-white text-lg max-w-2xl mb-8 mix-blend-difference">${featured.detail}</p>
                <a href="${featured.link}" target="_blank" class="group/btn inline-flex items-center justify-center relative bg-primary text-on-primary px-8 py-4 font-headline font-bold text-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-105 border-4 border-primary hover:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-0 overflow-hidden">
                    <span class="relative z-10 uppercase tracking-widest">Go Itch.io</span>
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] pointer-events-none"></div>
                </a>
            </div>
        </div>
    `;
    grid.innerHTML += featuredHTML;

    // Bento Cards (Index 1 and later)
    if (works.length > 1) {
      const bentoContainer = document.createElement('div');
      bentoContainer.className = 'lg:col-span-4 flex flex-col gap-10';

      for (let i = 1; i < works.length; i++) {
        const work = works[i];
        const isImg = work.image.startsWith('http') || work.image.includes('/') || work.image.includes('.');

        const cardHTML = `
            <div class="pixel-card p-10 rounded-2xl border border-outline/30 flex-1 group hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-6">
                        ${
                          isImg
                            ? `<img src="${work.image}" class="w-16 h-16 rounded-xl object-cover border border-outline/30" />`
                            : `<span class="material-symbols-outlined text-primary text-4xl">${work.image}</span>`
                        }
                        <span class="text-on-surface-variant font-mono text-sm">${new Date().getFullYear()}</span>
                    </div>
                    <h3 class="text-2xl font-bold mb-3 uppercase text-on-background">${work.title}</h3>
                    <p class="text-on-surface-variant text-base mb-6">${work.detail}</p>
                </div>
                <div>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${work.tags.split(',').map(tag => `<span class="px-3 py-1.5 bg-surface-variant text-xs rounded font-bold text-primary uppercase tracking-wider">${tag.trim()}</span>`).join('')}
                    </div>
                    <a href="${work.link}" target="_blank" class="text-sm font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-2">View Work <span class="material-symbols-outlined text-xs">open_in_new</span></a>
                </div>
            </div>
        `;
        bentoContainer.innerHTML += cardHTML;
      }
      grid.appendChild(bentoContainer);
    }
  }

  function renderContacts() {
    const container = document.getElementById('contact-links-container');
    if (!container) return;
    container.innerHTML = '';

    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    contacts.forEach((c) => {
      let iconHTML = '';
      if (c.iconType === 'svg') {
        iconHTML = `<svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="${c.iconVal}"></path></svg>`;
      } else if (c.iconType === 'image') {
        iconHTML = `<img alt="${c.name}" class="w-8 h-8 rounded-full object-cover border border-outline/20" src="${c.iconVal}" />`;
      } else {
        iconHTML = `<span class="material-symbols-outlined text-2xl">${c.iconVal}</span>`;
      }

      const linkHTML = `
          <a class="text-on-surface-variant hover:text-primary transition-all hover:scale-110 flex items-center gap-3"
              href="${c.link}" target="_blank" title="${c.name}">
              ${iconHTML}
              <span class="text-sm font-bold">${c.name.toUpperCase()}</span>
          </a>
      `;
      container.innerHTML += linkHTML;
    });
  }

  function openProjectDetailModal(index) {
    const works = JSON.parse(localStorage.getItem('works') || '[]');
    const w = works[index];
    if (!w) return;

    const modal = document.getElementById('project-detail-modal');
    const titleEl = document.getElementById('project-detail-title');
    const descEl = document.getElementById('project-detail-description');
    const imgContainer = document.getElementById('project-detail-image-container');
    const tagsContainer = document.getElementById('project-detail-tags');
    const linkEl = document.getElementById('project-detail-link');
    const contribSection = document.getElementById('project-detail-contributors-section');
    const contribList = document.getElementById('project-detail-contributors-list');

    titleEl.textContent = w.title;
    descEl.textContent = w.detail;
    linkEl.href = w.link;

    // Set image or icon
    imgContainer.innerHTML = '';
    const isImg = w.image.startsWith('http') || w.image.includes('/') || w.image.includes('.');
    if (isImg) {
      imgContainer.innerHTML = `<img src="${w.image}" class="w-full h-full object-cover" />`;
    } else {
      imgContainer.innerHTML = `<div class="flex items-center justify-center w-full h-full"><span class="material-symbols-outlined text-primary text-8xl">${w.image || 'brush'}</span></div>`;
    }

    // Set tags
    tagsContainer.innerHTML = '';
    if (w.tags) {
      w.tags.split(',').forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-bold uppercase tracking-wider';
        badge.textContent = tag.trim();
        tagsContainer.appendChild(badge);
      });
    }

    // Set contributors
    contribList.innerHTML = '';
    const contributors = w.contributors || [];
    if (contributors.length > 0) {
      contribSection.classList.remove('hidden');
      contributors.forEach(c => {
        const item = document.createElement('a');
        item.className = 'flex items-center gap-2 bg-surface-variant/40 p-2 rounded-xl border border-outline/10 hover:border-primary/30 transition-all';
        if (c.url) {
          item.href = c.url;
          item.target = '_blank';
        } else {
          item.href = 'javascript:void(0)';
        }

        const avatar = c.avatar 
          ? `<img src="${c.avatar}" class="w-6 h-6 rounded-full object-cover border border-outline/20" />`
          : `<div class="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center"><span class="material-symbols-outlined text-sm text-primary">person</span></div>`;
        
        item.innerHTML = `
          ${avatar}
          <span class="text-xs font-bold text-on-surface">${c.name}</span>
        `;
        contribList.appendChild(item);
      });
    } else {
      contribSection.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  // Bind close buttons for Detail Modal
  document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('project-detail-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('project-detail-modal').classList.add('hidden');
        document.body.style.overflow = '';
      });
    }
    const modal = document.getElementById('project-detail-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    }
  });

  function checkHashRoute() {
    if (window.location.hash === '#admin') {
      document.getElementById('admin-auth-modal').classList.remove('hidden');
      document.getElementById('admin-passcode-input').value = '';
      document.getElementById('admin-passcode-input').focus();
      document.getElementById('admin-auth-error').classList.add('hidden');
    } else {
      document.getElementById('admin-auth-modal').classList.add('hidden');
      document.getElementById('admin-panel').classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function renderAdminWorksList() {
    const list = document.getElementById('admin-works-list');
    if (!list) return;
    list.innerHTML = '';

    const works = JSON.parse(localStorage.getItem('works') || '[]');
    works.forEach((w, idx) => {
      const isImg = w.image.startsWith('http') || w.image.includes('/') || w.image.includes('.');
      const item = document.createElement('div');
      item.className = 'pixel-card p-4 rounded-xl flex justify-between items-center gap-4 bg-surface/40';
      item.innerHTML = `
          <div class="flex items-center gap-4 min-w-0">
              ${
                isImg
                  ? `<img src="${w.image}" class="w-12 h-12 rounded object-cover border border-outline/20 flex-shrink-0" />`
                  : `<span class="material-symbols-outlined text-primary text-3xl flex-shrink-0">${w.image}</span>`
              }
              <div class="min-w-0">
                  <h4 class="font-bold text-sm text-on-background truncate">${w.title}</h4>
                  <p class="text-xs text-on-surface-variant truncate max-w-[200px]">${w.detail}</p>
              </div>
          </div>
          <div class="flex gap-2 flex-shrink-0">
              <button class="admin-edit-work-btn bg-surface-variant hover:bg-outline/20 text-on-surface text-xs py-1.5 px-3 rounded-lg font-bold" data-index="${idx}">Edit</button>
              <button class="admin-delete-work-btn bg-red-600/80 hover:bg-red-600 text-white text-xs py-1.5 px-3 rounded-lg font-bold" data-index="${idx}">Delete</button>
          </div>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll('.admin-edit-work-btn').forEach(btn => {
      btn.addEventListener('click', () => openWorkForm(parseInt(btn.dataset.index)));
    });
    list.querySelectorAll('.admin-delete-work-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteWork(parseInt(btn.dataset.index)));
    });
  }

  function renderAdminContactsList() {
    const list = document.getElementById('admin-contacts-list');
    if (!list) return;
    list.innerHTML = '';

    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    contacts.forEach((c, idx) => {
      const item = document.createElement('div');
      item.className = 'pixel-card p-4 rounded-xl flex justify-between items-center gap-4 bg-surface/40';
      item.innerHTML = `
          <div class="flex items-center gap-4 min-w-0">
              <div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary flex-shrink-0">
                  ${
                    c.iconType === 'svg'
                      ? `<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="${c.iconVal}"></path></svg>`
                      : c.iconType === 'image'
                      ? `<img class="w-4 h-4 rounded-full object-cover" src="${c.iconVal}" />`
                      : `<span class="material-symbols-outlined text-base">${c.iconVal}</span>`
                  }
              </div>
              <div class="min-w-0">
                  <h4 class="font-bold text-sm text-on-background truncate">${c.name}</h4>
                  <p class="text-xs text-on-surface-variant truncate max-w-[200px]">${c.link}</p>
              </div>
          </div>
          <div class="flex gap-2 flex-shrink-0">
              <button class="admin-edit-contact-btn bg-surface-variant hover:bg-outline/20 text-on-surface text-xs py-1.5 px-3 rounded-lg font-bold" data-index="${idx}">Edit</button>
              <button class="admin-delete-contact-btn bg-red-600/80 hover:bg-red-600 text-white text-xs py-1.5 px-3 rounded-lg font-bold" data-index="${idx}">Delete</button>
          </div>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll('.admin-edit-contact-btn').forEach(btn => {
      btn.addEventListener('click', () => openContactForm(parseInt(btn.dataset.index)));
    });
    list.querySelectorAll('.admin-delete-contact-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteContact(parseInt(btn.dataset.index)));
    });
  }

  function renderAdminDashboard() {
    renderAdminWorksList();
    renderAdminContactsList();
  }

  function openWorkForm(index = -1) {
    const modal = document.getElementById('work-form-modal');
    const title = document.getElementById('work-form-title');
    const idxInput = document.getElementById('work-form-index');

    const autofillUrl = document.getElementById('work-autofill-url');
    if (autofillUrl) autofillUrl.value = '';
    const autofillStatus = document.getElementById('work-autofill-status');
    if (autofillStatus) {
      autofillStatus.classList.add('hidden');
      autofillStatus.textContent = '';
    }

    // Reset AI write status
    const aiStatus = document.getElementById('work-ai-status');
    if (aiStatus) {
      aiStatus.classList.add('hidden');
      aiStatus.textContent = '';
    }

    idxInput.value = index;
    if (index === -1) {
      title.textContent = 'Add New Work';
      document.getElementById('work-form').reset();
      document.getElementById('work-form-contributors-input').value = '';
      window.tempAutofilledContributors = [];
    } else {
      title.textContent = 'Edit Work';
      const works = JSON.parse(localStorage.getItem('works') || '[]');
      const w = works[index];
      document.getElementById('work-form-title-input').value = w.title;
      document.getElementById('work-form-image-input').value = w.image;
      document.getElementById('work-form-link-input').value = w.link;
      document.getElementById('work-form-tags-input').value = w.tags;
      document.getElementById('work-form-detail-input').value = w.detail;
      
      const contributors = w.contributors || [];
      document.getElementById('work-form-contributors-input').value = contributors.map(c => c.name).join(', ');
      window.tempAutofilledContributors = contributors;
    }
    modal.classList.remove('hidden');
  }

  function deleteWork(index) {
    if (confirm('Are you sure you want to delete this work?')) {
      const works = JSON.parse(localStorage.getItem('works') || '[]');
      works.splice(index, 1);
      localStorage.setItem('works', JSON.stringify(works));
      renderWorks();
      renderAdminDashboard();
    }
  }

  function openContactForm(index = -1) {
    const modal = document.getElementById('contact-form-modal');
    const title = document.getElementById('contact-form-title');
    const idxInput = document.getElementById('contact-form-index');

    idxInput.value = index;
    if (index === -1) {
      title.textContent = 'Add Contact Channel';
      document.getElementById('contact-form').reset();
      updateContactIconLabels();
    } else {
      title.textContent = 'Edit Contact Channel';
      const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
      const c = contacts[index];
      document.getElementById('contact-form-name-input').value = c.name;
      document.getElementById('contact-form-link-input').value = c.link;
      document.getElementById('contact-form-icon-type').value = c.iconType;
      document.getElementById('contact-form-icon-val').value = c.iconVal;
      updateContactIconLabels();
    }
    modal.classList.remove('hidden');
  }

  function updateContactIconLabels() {
    const select = document.getElementById('contact-form-icon-type');
    const label = document.getElementById('contact-icon-label');
    const input = document.getElementById('contact-form-icon-val');

    if (select.value === 'material') {
      label.textContent = 'Material Symbol Name (e.g. terminal)';
      input.placeholder = 'terminal';
    } else if (select.value === 'svg') {
      label.textContent = 'SVG Path D-Attribute Data';
      input.placeholder = 'M12 0c-6...';
    } else {
      label.textContent = 'Image URL';
      input.placeholder = 'https://example.com/icon.png';
    }
  }

  function deleteContact(index) {
    if (confirm('Are you sure you want to delete this contact channel?')) {
      const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
      contacts.splice(index, 1);
      localStorage.setItem('contacts', JSON.stringify(contacts));
      renderContacts();
      renderAdminDashboard();
    }
  }

  function handleWorkAutofill() {
    const urlInput = document.getElementById('work-autofill-url');
    const statusEl = document.getElementById('work-autofill-status');
    if (!urlInput || !statusEl) return;

    const url = urlInput.value.trim();
    if (!url) {
      statusEl.textContent = 'Please enter a URL first.';
      statusEl.className = 'text-red-500 text-xs mt-2 block';
      statusEl.classList.remove('hidden');
      return;
    }

    statusEl.textContent = 'Fetching data...';
    statusEl.className = 'text-on-surface-variant text-xs mt-2 block';
    statusEl.classList.remove('hidden');

    // Check if it is a GitHub repo link
    const githubRegex = /github\.com\/([^/]+)\/([^/]+)/i;
    const githubMatch = url.match(githubRegex);

    if (githubMatch) {
      const owner = githubMatch[1];
      let repo = githubMatch[2].split(/[#?]/)[0];
      if (repo.endsWith('.git')) repo = repo.slice(0, -4);

      fetch(`https://api.github.com/repos/${owner}/${repo}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`GitHub API returned status ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          const formattedTitle = data.name
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
          document.getElementById('work-form-title-input').value = formattedTitle;
          document.getElementById('work-form-detail-input').value = data.description || '';
          document.getElementById('work-form-link-input').value = data.html_url || url;
          document.getElementById('work-form-image-input').value = 'terminal';
          
          const tags = [];
          if (data.language) tags.push(data.language.toUpperCase());
          tags.push('GITHUB');
          document.getElementById('work-form-tags-input').value = tags.join(', ');

          statusEl.textContent = 'Autofill successful!';
          statusEl.className = 'text-green-500 text-xs mt-2 block';
        })
        .catch(err => {
          console.error(err);
          statusEl.textContent = `Error: ${err.message}`;
          statusEl.className = 'text-red-500 text-xs mt-2 block';
        });
      return;
    }

    // Check if it is an Itch.io link
    const itchRegex = /itch\.io/i;
    if (itchRegex.test(url)) {
      fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Proxy server returned status ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (!data || !data.contents) {
            throw new Error('No content returned from proxy');
          }
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.contents, 'text/html');

          let title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                      doc.querySelector('h1.game_title')?.textContent ||
                      doc.title;
          
          if (title) {
            title = title.replace(/\s+/g, ' ').trim();
            if (title.toLowerCase().endsWith(' by itch.io')) {
              title = title.slice(0, -11);
            }
          }

          const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                        doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
                        doc.querySelector('.header_image')?.getAttribute('src') ||
                        'brush';

          let detail = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                       doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                       '';
          if (detail) {
            detail = detail.replace(/\s+/g, ' ').trim();
          }

          document.getElementById('work-form-title-input').value = title || '';
          document.getElementById('work-form-image-input').value = image || 'brush';
          document.getElementById('work-form-link-input').value = url;
          document.getElementById('work-form-detail-input').value = detail || '';
          document.getElementById('work-form-tags-input').value = 'ITCH.IO';

          statusEl.textContent = 'Autofill successful!';
          statusEl.className = 'text-green-500 text-xs mt-2 block';
        })
        .catch(err => {
          console.error(err);
          statusEl.textContent = `Error: ${err.message}`;
          statusEl.className = 'text-red-500 text-xs mt-2 block';
        });
      return;
    }

    statusEl.textContent = 'Invalid URL. Please input a valid GitHub or Itch.io link.';
    statusEl.className = 'text-red-500 text-xs mt-2 block';
  }

  function initAdminHooks() {
    // Auth Modal
    document.getElementById('admin-auth-submit').addEventListener('click', () => {
      const pin = document.getElementById('admin-passcode-input').value;
      if (pin === '977254') {
        document.getElementById('admin-auth-modal').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        renderAdminDashboard();
      } else {
        document.getElementById('admin-auth-error').classList.remove('hidden');
      }
    });

    document.getElementById('admin-auth-cancel').addEventListener('click', () => {
      window.location.hash = '';
    });

    document.getElementById('admin-close-btn').addEventListener('click', () => {
      window.location.hash = '';
    });

    document.getElementById('admin-passcode-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('admin-auth-submit').click();
      }
    });

    // Form modals cancel buttons
    document.getElementById('work-form-cancel').addEventListener('click', () => {
      document.getElementById('work-form-modal').classList.add('hidden');
    });

    document.getElementById('contact-form-cancel').addEventListener('click', () => {
      document.getElementById('contact-form-modal').classList.add('hidden');
    });

    // Add buttons
    document.getElementById('admin-add-work-btn').addEventListener('click', () => openWorkForm(-1));
    document.getElementById('admin-add-contact-btn').addEventListener('click', () => openContactForm(-1));

    // Autofill button
    const autofillBtn = document.getElementById('work-autofill-btn');
    if (autofillBtn) {
      autofillBtn.addEventListener('click', handleWorkAutofill);
    }

    // Icon select type change
    document.getElementById('contact-form-icon-type').addEventListener('change', updateContactIconLabels);

    // Form submit handlers
    document.getElementById('work-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const index = parseInt(document.getElementById('work-form-index').value);
      const works = JSON.parse(localStorage.getItem('works') || '[]');

      const contributorsInput = document.getElementById('work-form-contributors-input').value;
      const names = contributorsInput.split(',').map(n => n.trim()).filter(Boolean);
      const existingContributors = window.tempAutofilledContributors || [];
      const contributors = names.map(name => {
        const match = existingContributors.find(c => c.name.toLowerCase() === name.toLowerCase());
        return match ? match : { name: name };
      });

      const newWork = {
        title: document.getElementById('work-form-title-input').value,
        image: document.getElementById('work-form-image-input').value,
        link: document.getElementById('work-form-link-input').value,
        tags: document.getElementById('work-form-tags-input').value,
        detail: document.getElementById('work-form-detail-input').value,
        contributors: contributors,
      };

      if (index === -1) {
        works.push(newWork);
      } else {
        works[index] = newWork;
      }

      localStorage.setItem('works', JSON.stringify(works));
      document.getElementById('work-form-modal').classList.add('hidden');
      renderWorks();
      renderAdminDashboard();
    });

    document.getElementById('contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const index = parseInt(document.getElementById('contact-form-index').value);
      const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');

      const newContact = {
        name: document.getElementById('contact-form-name-input').value,
        link: document.getElementById('contact-form-link-input').value,
        iconType: document.getElementById('contact-form-icon-type').value,
        iconVal: document.getElementById('contact-form-icon-val').value,
      };

      if (index === -1) {
        contacts.push(newContact);
      } else {
        contacts[index] = newContact;
      }

      localStorage.setItem('contacts', JSON.stringify(contacts));
      document.getElementById('contact-form-modal').classList.add('hidden');
      renderContacts();
      renderAdminDashboard();
    });
  }

  function init() {
    initLocalStorage();
    initBackground();
    startGitHubSync();
    initRevealAndTheme();
    initNavbarScroll();
    initSmoothScroll();
    renderWorks();
    renderContacts();
    checkHashRoute();
    initAdminHooks();
    
    // Listen to hash change for admin panel route
    window.addEventListener('hashchange', checkHashRoute);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
