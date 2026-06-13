(function () {
  const GITHUB_USER =
    document.body.dataset.githubUser || 'OzonZ';
  const POLL_MS = 60_000;

  let globalWorks = [];
  let globalSettings = {};
  const GH_REPO_OWNER = 'Aritsiaserlet';
  const GH_REPO_NAME = 'aritsiaserlet';
  const DATA_OWNER = 'OzonZ';
  const DATA_REPO = 'Non-Four-Portfolio-Data';

  const els = {
    contributions: document.getElementById('ghContributions'),
    repositories: document.getElementById('ghRepositories'),
    avatar: document.getElementById('ghAvatar'),
    displayName: document.getElementById('ghDisplayName'),
    handle: document.getElementById('ghHandle'),
    bio: document.getElementById('ghBio'),
    liveDot: document.getElementById('ghLiveDot'),
  };

  let statsTimer = null;
  let revealObserver = null;
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
      bio: u.bio ?? '',
      profileUrl: u.html_url ?? `https://github.com/${u.login}`,
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

    // Display name — clear skeleton, apply real data
    if (data.name && els.displayName) {
      els.displayName.innerHTML = data.profileUrl
        ? `<a href="${data.profileUrl}" target="_blank" rel="noopener"
              class="hover:text-primary transition-colors">${data.name}</a>`
        : data.name;
    }

    // Handle @login — clear skeleton
    if (data.login && els.handle) {
      els.handle.innerHTML = data.profileUrl
        ? `<a href="${data.profileUrl}" target="_blank" rel="noopener"
              class="hover:text-primary transition-colors">@${data.login}</a>`
        : `@${data.login}`;
    }

    // Bio — clear skeleton
    if (els.bio) {
      els.bio.textContent = data.bio || '';
      els.bio.style.display = data.bio ? '' : 'none';
    }
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
        float coreShape = 1.0 - smoothstep(1.5, 0.0, length(cell));
        float glowShape = exp(-length(cell) / 3.0);

        vec2 mousePx = u_mouse * u_resolution;
        float spotDist = length(px - mousePx);
        float spotlight = u_spot * exp(-spotDist * spotDist / (2.0 * 95.0 * 95.0));

        // Dot Colors for dark/light modes
        vec3 dotColorDimDark = vec3(0.22, 0.24, 0.28);
        vec3 dotColorDimLight = vec3(0.878, 0.855, 0.784); // Soft warm gray/beige dots
        
        vec3 dotColorDim = mix(dotColorDimLight, dotColorDimDark, u_isDark);
        vec3 dotColorLit = vec3(1.8, 1.8, 1.8); // Super bright white neon

        // Brightness and mixing
        float dim = mix(0.18, 0.14, u_isDark);

        // Dim dot color contribution
        vec3 dimColorContrib = dotColorDim * dim * coreShape * (1.0 - spotlight);

        // Lit dot color contribution (neon glow)
        vec3 litColorContrib = dotColorLit * (coreShape * 2.5 + glowShape * 1.2) * spotlight;

        // Final color mix
        vec3 color = bg + dimColorContrib + litColorContrib;

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
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal, .reveal-delayed').forEach((el) => revealObserver.observe(el));

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
    const defaultApiKey = (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY) ? CONFIG.GEMINI_API_KEY : '';
    if (!localStorage.getItem('gemini_api_key') && defaultApiKey) {
      localStorage.setItem('gemini_api_key', defaultApiKey);
    }
  }

  function renderWorks() {
    const grid = document.getElementById('archives-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let works = globalWorks || [];
    if (works.length > 0) {
      works = works.map(w => {
        let image = w.image;
        if (Array.isArray(w.image)) image = w.image[0];
        if (!image && w.model) image = 'view_in_ar';
        let link = w.link;
        if (!link && w.links && w.links.length > 0) link = w.links[0].url;
        let tags = w.tags && w.tags.length > 0 ? w.tags.join(', ') : `${w.cat}, ${w.subcat}`;
        let contributors = [];
        if (w.team && globalSettings.teams) {
          contributors = w.team.map(tid => {
            const t = globalSettings.teams.find(x => x.id === tid);
            return t ? { name: t.name, avatar: t.image, url: t.url } : null;
          }).filter(Boolean);
        }
        return { ...w, title: w.name, detail: w.desc || '', aiSummary: w.aiSummary || '', year: w.year || '', image: image || 'brush', link: link || '#', tags: tags, contributors: contributors };
      });
      globalWorks = works;
    }

    if (works.length === 0) {
      grid.innerHTML = '<div class="text-center text-on-surface-variant py-10 col-span-12">No works available.</div>';
      return;
    }

    // Featured Card (Index 0)
    const featured = works[0];
    const isFeaturedImg = featured.image.startsWith('http') || featured.image.includes('/') || featured.image.includes('.');
    const featuredHTML = `
        <div class="lg:col-span-8 group relative overflow-hidden rounded-2xl border border-outline/30 cursor-pointer work-card-trigger project-glow reveal h-[500px] md:h-[600px] lg:h-full" data-index="0">
            <div class="absolute inset-0 bg-black/20 z-10 transition-all duration-500 group-hover:bg-black/10"></div>
            ${
              isFeaturedImg
                ? `<img alt="${featured.title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="${featured.image}" />`
                : `<div class="absolute inset-0 w-full h-full bg-surface/10 flex items-center justify-center transition-transform duration-1000 group-hover:scale-105"><span class="material-symbols-outlined text-primary text-9xl">${featured.image}</span></div>`
            }
            <div class="absolute bottom-0 left-0 w-full p-10 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                <div class="flex flex-wrap gap-3 mb-6">
                    ${featured.tags.split(',').map(tag => `<span class="text-xs font-bold uppercase tracking-[0.2em] text-white mix-blend-difference">${tag.trim()}</span>`).join('')}
                </div>
                <h3 class="text-4xl md:text-5xl font-bold mb-4 uppercase mix-blend-difference text-white">${featured.title}</h3>
                <p class="text-white text-lg max-w-2xl mb-4 mix-blend-difference">${featured.detail}</p>
                ${
                  featured.aiSummary
                    ? `<p class="text-primary font-bold text-sm tracking-wider uppercase mb-8 mix-blend-difference flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">auto_awesome</span> ${featured.aiSummary}</p>`
                    : ''
                }
                <a href="${featured.link}" target="_blank" onclick="event.stopPropagation(); if(this.getAttribute('href') === '#' || !this.getAttribute('href')) { alert('เกมนี้ยังไม่มี link ตอนนี้'); return false; }" class="group/btn inline-flex items-center justify-center relative bg-primary text-on-primary px-8 py-4 font-headline font-bold text-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-105 border-4 border-primary hover:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-0 overflow-hidden">
                    <span class="relative z-10 uppercase tracking-widest">Go Itch.io</span>
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] pointer-events-none"></div>
                </a>
            </div>
        </div>
    `;
    grid.innerHTML += featuredHTML;

    // Bento Cards (Index 1 and 2, next to Featured Project)
    const sideWorks = works.slice(1, 3);
    if (sideWorks.length > 0) {
      const bentoContainer = document.createElement('div');
      bentoContainer.className = 'lg:col-span-4 flex flex-col gap-10';

      sideWorks.forEach((work, index) => {
        const i = index + 1;
        const isImg = work.image.startsWith('http') || work.image.includes('/') || work.image.includes('.');

        const cardHTML = `
            <div class="pixel-card project-glow p-8 rounded-2xl border border-outline/30 flex-1 group hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer work-card-trigger reveal" data-index="${i}">
                <div>
                    <div class="w-full h-48 rounded-xl overflow-hidden mb-6 border border-outline/20 bg-surface/20 flex items-center justify-center">
                        ${
                          isImg
                            ? `<img src="${work.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />`
                            : `<span class="material-symbols-outlined text-primary text-5xl transition-transform duration-500 group-hover:scale-105">${work.image}</span>`
                        }
                    </div>
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-2xl font-bold uppercase text-on-background">${work.title}</h3>
                        <span class="text-on-surface-variant font-mono text-sm">${work.year || (work.date ? new Date(work.date).getFullYear() : new Date().getFullYear())}</span>
                    </div>
                </div>
                <div>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${work.tags.split(',').map(tag => `<span class="px-3 py-1.5 bg-surface-variant text-xs rounded font-bold text-primary uppercase tracking-wider">${tag.trim()}</span>`).join('')}
                    </div>
                    <a href="${work.link}" target="_blank" onclick="event.stopPropagation(); if(this.getAttribute('href') === '#' || !this.getAttribute('href')) { alert('เกมนี้ยังไม่มี link ตอนนี้'); return false; }" class="text-sm font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-2">View Work <span class="material-symbols-outlined text-xs">open_in_new</span></a>
                </div>
            </div>
        `;
        bentoContainer.innerHTML += cardHTML;
      });
      grid.appendChild(bentoContainer);
    }

    // Grid Cards (Index 3 and later, rendered below the featured section)
    const extraWorks = works.slice(3);
    if (extraWorks.length > 0) {
      // Create a full-width grid container for the remaining cards
      const extraGridContainer = document.createElement('div');
      extraGridContainer.className = 'col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10';

      extraWorks.forEach((work, index) => {
        const i = index + 3;
        const isImg = work.image.startsWith('http') || work.image.includes('/') || work.image.includes('.');

        const cardHTML = `
            <div class="pixel-card project-glow p-8 rounded-2xl border border-outline/30 group hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer work-card-trigger reveal" data-index="${i}">
                <div>
                    <div class="w-full h-48 rounded-xl overflow-hidden mb-6 border border-outline/20 bg-surface/20 flex items-center justify-center">
                        ${
                          isImg
                            ? `<img src="${work.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />`
                            : `<span class="material-symbols-outlined text-primary text-5xl transition-transform duration-500 group-hover:scale-105">${work.image}</span>`
                        }
                    </div>
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-2xl font-bold uppercase text-on-background">${work.title}</h3>
                        <span class="text-on-surface-variant font-mono text-sm">${work.year || (work.date ? new Date(work.date).getFullYear() : new Date().getFullYear())}</span>
                    </div>
                </div>
                <div>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${work.tags.split(',').map(tag => `<span class="px-3 py-1.5 bg-surface-variant text-xs rounded font-bold text-primary uppercase tracking-wider">${tag.trim()}</span>`).join('')}
                    </div>
                    <a href="${work.link}" target="_blank" onclick="event.stopPropagation(); if(this.getAttribute('href') === '#' || !this.getAttribute('href')) { alert('เกมนี้ยังไม่มี link ตอนนี้'); return false; }" class="text-sm font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-2">View Work <span class="material-symbols-outlined text-xs">open_in_new</span></a>
                </div>
            </div>
        `;
        extraGridContainer.innerHTML += cardHTML;
      });
      grid.appendChild(extraGridContainer);
    }

    // Bind click listeners to work-card-trigger
    grid.querySelectorAll('.work-card-trigger').forEach(card => {
      card.addEventListener('click', (e) => {
        const linkBtn = e.target.closest('a');
        if (linkBtn) {
          const href = linkBtn.getAttribute('href');
          if (href === '#' || !href || href.trim() === '') {
            e.preventDefault();
            e.stopPropagation();
            alert('เกมนี้ยังไม่มี link ตอนนี้');
          } else {
            // Stop propagation so it doesn't open the modal, but let the default link target="_blank" behavior run
            e.stopPropagation();
          }
          return;
        }
        e.preventDefault();
        const index = parseInt(card.getAttribute('data-index'));
        openProjectDetailModal(index);
      });
    });

    // Observe newly rendered cards for reveal scroll animations
    if (revealObserver) {
      grid.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
    }
  }

  function renderContacts() {
    const container = document.getElementById('contact-links-container');
    if (!container) return;
    container.innerHTML = '';

    let contacts = [];
    if (globalSettings && globalSettings.socials) {
      contacts = globalSettings.socials.map(s => {
        // Support new format (iconType, iconVal, url) with fallback to iconId
        if (s.iconType) {
          return {
            name: s.name,
            link: s.url || '#',
            iconType: s.iconType,
            iconVal: s.iconVal || 'link'
          };
        }
        
        let iconUrl = '';
        if (s.iconId && globalSettings.icons) {
          const ic = globalSettings.icons.find(x => x.id === s.iconId);
          if (ic) iconUrl = ic.url;
        }
        return {
          name: s.name,
          link: s.url || '#',
          iconType: iconUrl ? 'image' : 'material',
          iconVal: iconUrl ? iconUrl : 'link'
        };
      });
    }

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
    const works = globalWorks || [];
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

  function initProjectDetailModal() {
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
    const linkEl = document.getElementById('project-detail-link');
    if (linkEl) {
      linkEl.addEventListener('click', (e) => {
        const href = linkEl.getAttribute('href');
        if (href === '#' || !href || href.trim() === '') {
          e.preventDefault();
          alert('เกมนี้ยังไม่มี link ตอนนี้');
        }
      });
    }
  }

  function checkHashRoute() {
    if (window.location.hash === '#admin') {
      window.location.href = 'admin-ozonz-page.html';
    } else {
      const authModal = document.getElementById('admin-auth-modal');
      const adminPanel = document.getElementById('admin-panel');
      if (authModal) authModal.classList.add('hidden');
      if (adminPanel) adminPanel.classList.add('hidden');
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
          <div class="flex items-center gap-4 min-w-0 flex-1">
              <!-- Reorder Buttons -->
              <div class="flex flex-col gap-1 mr-1">
                  <button class="admin-move-up-work-btn text-on-surface-variant hover:text-primary transition-all p-1" data-index="${idx}" ${idx === 0 ? 'disabled style="opacity: 0.25; cursor: not-allowed;"' : ''} title="Move Up">
                      <span class="material-symbols-outlined text-sm font-bold">arrow_upward</span>
                  </button>
                  <button class="admin-move-down-work-btn text-on-surface-variant hover:text-primary transition-all p-1" data-index="${idx}" ${idx === works.length - 1 ? 'disabled style="opacity: 0.25; cursor: not-allowed;"' : ''} title="Move Down">
                      <span class="material-symbols-outlined text-sm font-bold">arrow_downward</span>
                  </button>
              </div>
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
    list.querySelectorAll('.admin-move-up-work-btn').forEach(btn => {
      if (!btn.disabled) {
        btn.addEventListener('click', () => moveWork(parseInt(btn.dataset.index), -1));
      }
    });
    list.querySelectorAll('.admin-move-down-work-btn').forEach(btn => {
      if (!btn.disabled) {
        btn.addEventListener('click', () => moveWork(parseInt(btn.dataset.index), 1));
      }
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
          <div class="flex items-center gap-4 min-w-0 flex-1">
              <!-- Reorder Buttons -->
              <div class="flex flex-col gap-1 mr-1">
                  <button class="admin-move-up-contact-btn text-on-surface-variant hover:text-primary transition-all p-1" data-index="${idx}" ${idx === 0 ? 'disabled style="opacity: 0.25; cursor: not-allowed;"' : ''} title="Move Up">
                      <span class="material-symbols-outlined text-sm font-bold">arrow_upward</span>
                  </button>
                  <button class="admin-move-down-contact-btn text-on-surface-variant hover:text-primary transition-all p-1" data-index="${idx}" ${idx === contacts.length - 1 ? 'disabled style="opacity: 0.25; cursor: not-allowed;"' : ''} title="Move Down">
                      <span class="material-symbols-outlined text-sm font-bold">arrow_downward</span>
                  </button>
              </div>
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
    list.querySelectorAll('.admin-move-up-contact-btn').forEach(btn => {
      if (!btn.disabled) {
        btn.addEventListener('click', () => moveContact(parseInt(btn.dataset.index), -1));
      }
    });
    list.querySelectorAll('.admin-move-down-contact-btn').forEach(btn => {
      if (!btn.disabled) {
        btn.addEventListener('click', () => moveContact(parseInt(btn.dataset.index), 1));
      }
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

    const aiSummarizeStatus = document.getElementById('work-form-ai-summarize-status');
    if (aiSummarizeStatus) {
      aiSummarizeStatus.classList.add('hidden');
      aiSummarizeStatus.textContent = '';
    }

    idxInput.value = index;
    if (index === -1) {
      title.textContent = 'Add New Work';
      document.getElementById('work-form').reset();
      document.getElementById('work-form-contributors-input').value = '';
      document.getElementById('work-form-ai-summary-input').value = '';
      document.getElementById('work-form-year-input').value = '';
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
      document.getElementById('work-form-ai-summary-input').value = w.aiSummary || '';
      document.getElementById('work-form-year-input').value = w.year || '';
      
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

  function moveWork(index, direction) {
    const works = JSON.parse(localStorage.getItem('works') || '[]');
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= works.length) return;

    const temp = works[index];
    works[index] = works[targetIdx];
    works[targetIdx] = temp;

    localStorage.setItem('works', JSON.stringify(works));
    // Update globalWorks if it exists
    if (typeof globalWorks !== 'undefined') {
      globalWorks = works.map(w => {
        let image = w.image;
        if (Array.isArray(w.image)) image = w.image[0];
        if (!image && w.model) image = 'view_in_ar';
        let link = w.link;
        if (!link && w.links && w.links.length > 0) link = w.links[0].url;
        let tags = w.tags && w.tags.length > 0 ? w.tags.join(', ') : `${w.cat}, ${w.subcat}`;
        let contributors = [];
        if (w.team && globalSettings.teams) {
          contributors = w.team.map(tid => {
            const t = globalSettings.teams.find(x => x.id === tid);
            return t ? { name: t.name, avatar: t.image, url: t.url } : null;
          }).filter(Boolean);
        }
        return { ...w, title: w.name, detail: w.desc || '', image: image || 'brush', link: link || '#', tags: tags, contributors: contributors };
      });
    }
    renderWorks();
    renderAdminDashboard();
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

  function moveContact(index, direction) {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= contacts.length) return;

    const temp = contacts[index];
    contacts[index] = contacts[targetIdx];
    contacts[targetIdx] = temp;

    localStorage.setItem('contacts', JSON.stringify(contacts));
    renderContacts();
    renderAdminDashboard();
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

      // Fetch repo details and contributors in parallel
      Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}`).then(res => {
          if (!res.ok) throw new Error(`GitHub Repo API returned status ${res.status}`);
          return res.json();
        }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`).then(res => {
          if (!res.ok) return []; // Fallback if endpoint fails
          return res.json();
        }).catch(() => []) // Catch network errors on contributors and return empty
      ])
      .then(([repoData, contributorsData]) => {
        const formattedTitle = repoData.name
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        document.getElementById('work-form-title-input').value = formattedTitle;
        document.getElementById('work-form-detail-input').value = repoData.description || '';
        document.getElementById('work-form-link-input').value = repoData.html_url || url;
        document.getElementById('work-form-image-input').value = 'terminal';
        
        const tags = [];
        if (repoData.language) tags.push(repoData.language.toUpperCase());
        tags.push('GITHUB');
        document.getElementById('work-form-tags-input').value = tags.join(', ');

        const list = Array.isArray(contributorsData) ? contributorsData : [];
        const mappedContributors = list.map(c => ({
          name: c.login,
          avatar: c.avatar_url,
          url: c.html_url
        }));

        document.getElementById('work-form-contributors-input').value = mappedContributors.map(c => c.name).join(', ');
        window.tempAutofilledContributors = mappedContributors;

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
      const tryFetch = (proxyUrl, isRaw) => {
        return fetch(proxyUrl)
          .then(res => {
            if (!res.ok) throw new Error(`Proxy error ${res.status}`);
            return isRaw ? res.text() : res.json();
          });
      };

      const parseItchHtml = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

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
        document.getElementById('work-form-contributors-input').value = '';
        window.tempAutofilledContributors = [];

        statusEl.textContent = 'Autofill successful!';
        statusEl.className = 'text-green-500 text-xs mt-2 block';
      };

      // Try corsproxy.io first
      tryFetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, true)
        .then(html => parseItchHtml(html))
        .catch(err => {
          console.warn('corsproxy.io failed, trying allorigins...', err);
          // Try allorigins.win second
          tryFetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, false)
            .then(data => {
              if (!data || !data.contents) throw new Error('No content from allorigins');
              parseItchHtml(data.contents);
            })
            .catch(err2 => {
              console.warn('allorigins failed, trying codetabs...', err2);
              // Try codetabs third
              tryFetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, true)
                .then(html => parseItchHtml(html))
                .catch(err3 => {
                  console.error('All proxies failed:', err3);
                  statusEl.textContent = 'Error: Failed to fetch Itch.io page (Proxy connection failed)';
                  statusEl.className = 'text-red-500 text-xs mt-2 block';
                });
            });
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
        aiSummary: document.getElementById('work-form-ai-summary-input').value,
        year: document.getElementById('work-form-year-input').value.trim(),
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

    // AI Write button logic
    const aiWriteBtn = document.getElementById('work-ai-write-btn');
    if (aiWriteBtn) {
      aiWriteBtn.addEventListener('click', () => {
        const title = document.getElementById('work-form-title-input').value.trim();
        const tags = document.getElementById('work-form-tags-input').value.trim();
        const detailInput = document.getElementById('work-form-detail-input');
        const aiStatus = document.getElementById('work-ai-status');

        if (!title) {
          aiStatus.textContent = 'Please enter a Project Name first.';
          aiStatus.className = 'text-red-500 text-[10px] mt-1 block';
          aiStatus.classList.remove('hidden');
          return;
        }

        const apiKey = localStorage.getItem('gemini_api_key') || '';
        if (!apiKey) {
          aiStatus.textContent = 'Please enter your Gemini API Key in the settings first.';
          aiStatus.className = 'text-red-500 text-[10px] mt-1 block';
          aiStatus.classList.remove('hidden');
          return;
        }

        aiStatus.textContent = 'Generating description with AI...';
        aiStatus.className = 'text-on-surface-variant text-[10px] mt-1 block';
        aiStatus.classList.remove('hidden');

        const promptText = `Write a professional, short, and engaging description (1-2 sentences, in English) for a portfolio project named "${title}" with tags "${tags}". Do not include markdown formatting, quotes, or any prefix/suffix. Just output the description itself.`;

        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        })
        .then(res => {
          if (!res.ok) throw new Error(`API returned status ${res.status}`);
          return res.json();
        })
        .then(data => {
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            text = text.trim();
            detailInput.value = text;
            aiStatus.textContent = 'AI Generation successful!';
            aiStatus.className = 'text-green-500 text-[10px] mt-1 block';
          } else {
            throw new Error('Invalid response structure from Gemini API');
          }
        })
        .catch(err => {
          console.error(err);
          aiStatus.textContent = `AI Error: ${err.message}`;
          aiStatus.className = 'text-red-500 text-[10px] mt-1 block';
        });
      });
    }

    const aiSummarizeBtn = document.getElementById('work-form-ai-summarize-btn');
    if (aiSummarizeBtn) {
      aiSummarizeBtn.addEventListener('click', () => {
        const desc = document.getElementById('work-form-detail-input').value.trim();
        const summaryInput = document.getElementById('work-form-ai-summary-input');
        const status = document.getElementById('work-form-ai-summarize-status');

        if (!desc) {
          status.textContent = 'Please enter a Details / Description first.';
          status.className = 'text-red-500 text-[10px] mt-1 block';
          status.classList.remove('hidden');
          return;
        }

        const apiKey = localStorage.getItem('gemini_api_key') || '';
        if (!apiKey) {
          status.textContent = 'Please enter your Gemini API Key in settings first.';
          status.className = 'text-red-500 text-[10px] mt-1 block';
          status.classList.remove('hidden');
          return;
        }

        status.textContent = 'Summarizing...';
        status.className = 'text-on-surface-variant text-[10px] mt-1 block';
        status.classList.remove('hidden');

        const promptText = `Summarize the following description into a very short, punchy tagline or summary (maximum 6-8 words, in English). Do not use markdown, quotes, prefix or suffix. Just output the summary text itself. Description: "${desc}"`;

        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        })
        .then(res => {
          if (!res.ok) throw new Error(`API returned status ${res.status}`);
          return res.json();
        })
        .then(data => {
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            summaryInput.value = text.trim().replace(/^["']|["']$/g, '');
            status.textContent = 'AI Summary generated!';
            status.className = 'text-green-500 text-[10px] mt-1 block';
          } else {
            throw new Error('Invalid response structure from Gemini API');
          }
        })
        .catch(err => {
          console.error(err);
          status.textContent = `AI Error: ${err.message}`;
          status.className = 'text-red-500 text-[10px] mt-1 block';
        });
      });
    }

    // Save Settings
    const saveSettingsBtn = document.getElementById('admin-save-settings-btn');
    const geminiKeyInput = document.getElementById('admin-gemini-key');
    if (geminiKeyInput) {
      geminiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
    }
    if (saveSettingsBtn && geminiKeyInput) {
      saveSettingsBtn.addEventListener('click', () => {
        const key = geminiKeyInput.value.trim();
        localStorage.setItem('gemini_api_key', key);
        saveSettingsBtn.textContent = 'Saved!';
        saveSettingsBtn.classList.remove('bg-primary/20', 'text-primary');
        saveSettingsBtn.classList.add('bg-green-600/20', 'text-green-500');
        setTimeout(() => {
          saveSettingsBtn.textContent = 'Save Key';
          saveSettingsBtn.classList.remove('bg-green-600/20', 'text-green-500');
          saveSettingsBtn.classList.add('bg-primary/20', 'text-primary');
        }, 1500);
      });
    }
  }

  async function fetchPortfolioData() {
    try {
      const [worksRes, settingsRes] = await Promise.all([
          fetch(`https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_works.json?t=${Date.now()}`),
          fetch(`https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_settings.json?t=${Date.now()}`)
      ]);
      
      if (worksRes.ok) {
          globalWorks = await worksRes.json();
      } else {
          try {
              const r = await fetch('ozonz_works.json?t=' + Date.now());
              if (r.ok) globalWorks = await r.json();
              else globalWorks = [];
          } catch (_) {
              globalWorks = [];
          }
      }
      
      if (settingsRes.ok) {
          globalSettings = await settingsRes.json();
      } else {
          try {
              const r = await fetch('ozonz_settings.json?t=' + Date.now());
              if (r.ok) globalSettings = await r.json();
              else globalSettings = { socials: [] };
          } catch (_) {
              globalSettings = { socials: [] };
          }
      }
      
      const sharedSettingsRes = await fetch(`https://raw.githubusercontent.com/${GH_REPO_OWNER}/${GH_REPO_NAME}/main/settings.json?t=${Date.now()}`);
      let sharedSettings = {};
      if (sharedSettingsRes.ok) sharedSettings = await sharedSettingsRes.json();
      
      // Inject shared icons and teams
      globalSettings.icons = sharedSettings.icons || [];
      globalSettings.teams = sharedSettings.teams || [];
      globalSettings.sounds = sharedSettings.sounds || [];
      
    } catch (err) {
      console.error("Failed to fetch portfolio data from GitHub:", err);
    }
  }

  async function loadInitialData() {
    const cachedWorks = localStorage.getItem('cached_works');
    const cachedSettings = localStorage.getItem('cached_settings');
    let hasCache = false;
    if (cachedWorks && cachedSettings) {
      try {
        globalWorks = JSON.parse(cachedWorks);
        globalSettings = JSON.parse(cachedSettings);
        hasCache = true;
      } catch (_) {}
    }
    if (!hasCache) {
      try {
        const [rWorks, rSettings] = await Promise.all([
          fetch(`https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_works.json?t=${Date.now()}`).then(r => r.ok ? r.json() : []),
          fetch(`https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_settings.json?t=${Date.now()}`).then(r => r.ok ? r.json() : { socials: [] })
        ]);
        globalWorks = rWorks;
        globalSettings = rSettings;
      } catch (err) {
        try {
          const [lWorks, lSettings] = await Promise.all([
            fetch('ozonz_works.json?t=' + Date.now()).then(r => r.ok ? r.json() : []),
            fetch('ozonz_settings.json?t=' + Date.now()).then(r => r.ok ? r.json() : { socials: [] })
          ]);
          globalWorks = lWorks;
          globalSettings = lSettings;
        } catch (lErr) {
          console.warn("Failed to load local fallback JSONs:", lErr);
        }
      }
    }
    renderWorks();
    renderContacts();
    fetchPortfolioData().then(() => {
      localStorage.setItem('cached_works', JSON.stringify(globalWorks));
      localStorage.setItem('cached_settings', JSON.stringify(globalSettings));
      renderWorks();
      renderContacts();
    });
  }

  async function init() {
    initLocalStorage();
    initBackground();
    startGitHubSync();
    initRevealAndTheme();
    initNavbarScroll();
    initSmoothScroll();
    
    await loadInitialData();
    
    checkHashRoute();
    initAdminHooks();
    initProjectDetailModal();
    
    window.addEventListener('hashchange', checkHashRoute);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
