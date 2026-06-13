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

  const itchContact = {
    name: "ITCH.IO",
    link: "https://ozonz.itch.io",
    iconType: "svg",
    iconVal: "M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.137 2.41 2.466 2.41h.024c1.33 0 2.466-1.102 2.466-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.106 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.62-2.082-2.99-3.13-3.612-3.253-.114-5.508-.134-8.87-.133-3.362 0-7.945.053-8.87.133zm6.376 6.477a2.74 2.74 0 0 1-.468.602c-.5.49-1.19.795-1.947.795a2.786 2.786 0 0 1-1.95-.795c-.182-.178-.32-.37-.446-.59-.127.222-.303.412-.486.59a2.788 2.788 0 0 1-1.95.795c-.092 0-.187-.025-.264-.052-.107 1.113-.152 2.176-.168 2.95v.005l-.006 1.167c.02 2.334-.23 7.564 1.03 8.85 1.952.454 5.545.662 9.15.663 3.605 0 7.198-.21 9.15-.664 1.26-1.284 1.01-6.514 1.03-8.848l-.006-1.167v-.004c-.016-.775-.06-1.838-.168-2.95-.077.026-.172.052-.263.052a2.788 2.788 0 0 1-1.95-.795c-.184-.178-.36-.368-.486-.59-.127.22-.265.412-.447.59a2.786 2.786 0 0 1-1.95.794c-.76 0-1.446-.303-1.948-.793a2.74 2.74 0 0 1-.468-.602 2.738 2.738 0 0 1-.463.602 2.787 2.787 0 0 1-1.95.794h-.16a2.787 2.787 0 0 1-1.95-.793 2.738 2.738 0 0 1-.464-.602zm-2.004 2.59v.002c.795.002 1.5 0 2.373.953.687-.072 1.406-.108 2.125-.107.72 0 1.438.035 2.125.107.873-.953 1.578-.95 2.372-.953.376 0 1.876 0 2.92 2.934l1.123 4.028c.832 2.995-.266 3.068-1.636 3.07-2.03-.075-3.156-1.55-3.156-3.025-1.124.184-2.436.276-3.748.277-1.312 0-2.624-.093-3.748-.277 0 1.475-1.125 2.95-3.156 3.026-1.37-.004-2.468-.077-1.636-3.072l1.122-4.027c1.045-2.934 2.545-2.934 2.92-2.934zM12 12.714c-.002.002-2.14 1.964-2.523 2.662l1.4-.056v1.22c0 .056.56.033 1.123.007.562.026 1.124.05 1.124-.008v-1.22l1.4.055C14.138 14.677 12 12.713 12 12.713z"
  };

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
    itchContact,
    {
      name: "HAMSTER HUB",
      link: "https://hamsterhub.co/profile/eaya",
      iconType: "image",
      iconVal: "https://lh3.googleusercontent.com/aida-public/AB6AXuAB52Gn30AfNgh_ZIaX0WiCP3ULKJO16YpMvDm_d6OFmYoLiJZuIz6kYU0dWjP51u9KSF3rz05OiTcd7jOstWfwOf0135M2Zdh_eIKUBhCTKP8e4gwhrc-Q16KdGIqe5Lh_IcxEm76bR3WiHWks33_7KBAGYy2gyAN-gDZwGt7KV6PmvsfJQrEvrdNCy_j0nHKudDfKnE5qgqy0nseuq0C3B3Jtc3NvA5MC3guzL2BHHWtOcJiF3TBuJqJcX3OZHKJCrTEngA-Xuc7A"
    }
  ];

  function ensureItchContact(socials) {
    if (!Array.isArray(socials)) return [itchContact];
    const hasItch = socials.some(s => s && s.name && (s.name.toUpperCase() === 'ITCH.IO' || s.name.toUpperCase() === 'ITCHIO'));
    if (!hasItch) {
      const hamsterIdx = socials.findIndex(s => s && s.name && s.name.toUpperCase() === 'HAMSTER HUB');
      if (hamsterIdx >= 0) {
        socials.splice(hamsterIdx, 0, itchContact);
      } else {
        socials.push(itchContact);
      }
    }
    return socials;
  }

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
    if (!el) return;
    if (typeof value === 'string' || value == null || Number.isNaN(Number(value))) {
      el.textContent = value ?? '—';
      return;
    }
    const prev = cacheKey === 'c' ? lastContributions : lastRepos;
    animateValue(el, prev ?? 0, Number(value));
    if (cacheKey === 'c') lastContributions = Number(value);
    else lastRepos = Number(value);
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
    const t = sessionStorage.getItem('ghToken');
    const headers = { Accept: 'application/vnd.github+json' };
    if (t) {
      headers['Authorization'] = `token ${t}`;
    }

    let u = {};
    let profileFetched = false;
    try {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USER}`,
        { headers }
      );
      if (res.ok) {
        u = await res.json();
        profileFetched = true;
      } else {
        console.warn('[GitHub sync] REST API returned status:', res.status);
      }
    } catch (err) {
      console.warn('[GitHub sync] Profile fetch failed:', err.message);
    }

    if (!profileFetched) {
      // Load fallback profile properties (from database settings if available)
      const p = (globalSettings && globalSettings.githubProfile) ? globalSettings.githubProfile : {};
      u = {
        name: p.name || 'Chanon Thongduang',
        login: p.login || GITHUB_USER,
        avatar_url: p.avatarUrl || `https://github.com/${GITHUB_USER}.png`,
        bio: p.bio || 'I create cohesive game experiences where programming, visual design, and game architecture intersect.',
        public_repos: p.publicRepos || 50
      };
    }

    // 2. Fetch contributions
    let contributions = null;

    // Try GraphQL contributions API if token is available
    if (t) {
      try {
        const query = `
          query($username: String!) {
            user(login: $username) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                }
              }
            }
          }
        `;
        const gqlRes = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `bearer ${t}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            variables: { username: GITHUB_USER }
          })
        });
        if (gqlRes.ok) {
          const gqlData = await gqlRes.json();
          if (gqlData.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions !== undefined) {
            contributions = gqlData.data.user.contributionsCollection.contributionCalendar.totalContributions;
          }
        }
      } catch (err) {
        console.warn('[GitHub sync] GraphQL contributions fetch failed:', err.message);
      }
    }
    
    // Try jogruber API next (highly reliable and rate-limit-free for visitors)
    if (contributions === null) {
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
        console.warn('[GitHub sync] jogruber API failed:', err.message);
      }
    }

    // Fallback to Deno.dev API
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

    // Fallback to database cached contributions if still null
    if (contributions === null && globalSettings && globalSettings.githubProfile) {
      contributions = globalSettings.githubProfile.contributions;
    }

    return {
      contributions: contributions ?? lastContributions ?? '—',
      repositories: u.public_repos ?? 0,
      name: u.name ?? u.login,
      login: u.login,
      avatarUrl: u.avatar_url,
      bio: u.bio ?? '',
      profileUrl: `https://github.com/${u.login}`,
    };
  }

  async function fetchFallbackProfile() {
    if (globalSettings && globalSettings.githubProfile) {
      const p = globalSettings.githubProfile;
      return {
        contributions: p.contributions ?? '—',
        repositories: p.publicRepos ?? 0,
        name: p.name || 'Chanon Thongduang',
        login: p.login || GITHUB_USER,
        avatarUrl: p.avatarUrl || `https://github.com/${GITHUB_USER}.png`,
        bio: p.bio || '',
        profileUrl: `https://github.com/${p.login || GITHUB_USER}`
      };
    }
    try {
      const r = await fetch('data/ozonz-profile.json?t=' + Date.now());
      if (r.ok) {
        const d = await r.json();
        if (d && d.profile) {
          let avatar = d.profile.profileImage || 'https://avatars.githubusercontent.com/u/101888890?v=4';
          if (avatar.startsWith('/images/')) {
            avatar = 'https://avatars.githubusercontent.com/u/101888890?v=4';
          }
          return {
            contributions: '—',
            repositories: d.profile.stats?.projects || 0,
            name: d.profile.name || 'Chanon Thongduang',
            login: d.profile.handle || 'OzonZ',
            avatarUrl: avatar,
            bio: d.profile.bio || '',
            profileUrl: `https://github.com/${d.profile.handle || 'OzonZ'}`
          };
        }
      }
    } catch (_) {}
    return null;
  }

  async function syncGitHub() {
    try {
      const data = await fetchGitHubData();
      applyStats(data);
      pulseLive();
    } catch (err) {
      console.warn('[GitHub sync] sync failed, loading fallback profile:', err.message);
      const fallback = await fetchFallbackProfile();
      if (fallback) {
        applyStats(fallback);
      } else {
        if (els.contributions?.textContent === '…')
          els.contributions.textContent = '—';
        if (els.repositories?.textContent === '…')
          els.repositories.textContent = '—';
      }
    }
  }

  let profileApplied = false;

  function applyStats(data) {
    // Remove all skeleton elements on first data application
    if (!profileApplied) {
      document.querySelectorAll('#ghDisplayName .gh-skeleton, #ghHandle .gh-skeleton, #ghBio .gh-skeleton').forEach(el => el.remove());
      profileApplied = true;
    }

    setStat(els.contributions, data.contributions, 'c');
    setStat(els.repositories, data.repositories, 'r');
    if (data.avatarUrl && els.avatar) els.avatar.src = data.avatarUrl;

    // Display name — replace content cleanly
    if (data.name && els.displayName) {
      els.displayName.textContent = '';
      if (data.profileUrl) {
        const a = document.createElement('a');
        a.href = data.profileUrl;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'hover:text-primary transition-colors';
        a.textContent = data.name;
        els.displayName.appendChild(a);
      } else {
        els.displayName.textContent = data.name;
      }
    }

    // Handle @login — replace content cleanly
    if (data.login && els.handle) {
      els.handle.textContent = '';
      if (data.profileUrl) {
        const a = document.createElement('a');
        a.href = data.profileUrl;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'hover:text-primary transition-colors';
        a.textContent = `@${data.login}`;
        els.handle.appendChild(a);
      } else {
        els.handle.textContent = `@${data.login}`;
      }
    }

    // Bio — replace content cleanly
    if (els.bio) {
      els.bio.textContent = data.bio || '';
      els.bio.style.display = data.bio ? '' : 'none';
    }
  }

  function startGitHubSync() {
    if (els.contributions) els.contributions.textContent = '…';
    if (els.repositories) els.repositories.textContent = '…';
    
    // Load fallback profile immediately so the page doesn't show blank skeletons
    fetchFallbackProfile().then(fallback => {
      if (fallback) applyStats(fallback);
      syncGitHub();
    });
    
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
      uniform float u_time;
      uniform float u_holdDown;
      // x,y = pos, z = time, w = intensity
      uniform vec4 u_waves[30];
      varying vec2 v_texCoord;

      void main() {
        vec2 px = v_texCoord * u_resolution;
        
        vec3 bgDark = vec3(0.063, 0.078, 0.102);
        float grad = clamp(v_texCoord.x * 0.5 + v_texCoord.y * 0.5, 0.0, 1.0);
        vec3 bgLight = mix(vec3(0.98, 0.965, 0.922), vec3(1.0, 0.992, 0.969), grad);
        
        vec2 mousePx = u_mouse * u_resolution;
        float spotDist = length(px - mousePx);

        // 1. Initial dark suppression
        float dimFactor = smoothstep(0.0, 0.2, u_holdDown);
        float spotlight = u_spot * exp(-spotDist * spotDist / (2.0 * 95.0 * 95.0)) * (1.0 - dimFactor * 0.9);

        // 2. Fusion buildup from 2s to 5s
        float fusionProgress = clamp((u_holdDown - 2.0) / 3.0, 0.0, 1.0);
        float chargeGlow = 0.0;
        if (fusionProgress > 0.0) {
            float chargeRadius = 95.0 + fusionProgress * 150.0;
            float pulse = 1.0 + 0.1 * sin(u_time * 15.0) * fusionProgress; // soft pulse
            chargeGlow = fusionProgress * exp(-spotDist * spotDist / (2.0 * chargeRadius * chargeRadius)) * pulse;
        }

        spotlight += chargeGlow * u_spot;

        // Accumulate waves (both clicks and trails)
        float waveIntensity = 0.0;
        float darkSuppress = 0.0;
        vec2 quakeDisplacement = vec2(0.0);

        for (int i = 0; i < 30; i++) {
            vec4 w = u_waves[i];
            if (w.z > 0.0) { // time since wave created
                float clickDist = length(px - w.xy * u_resolution);
                
                // Super wave logic: slower, thicker, further, longer
                float extraPower = max(0.0, w.w - 1.5);
                float waveSpeed = max(300.0, 1000.0 - extraPower * 150.0);
                float waveFront = w.z * waveSpeed;
                float distFromFront = abs(clickDist - waveFront);
                
                float thickness = 800.0 + extraPower * 2000.0;
                float wave = exp(-distFromFront * distFromFront / thickness);
                
                float maxDist = 1200.0 + extraPower * 1500.0;
                float fadeDist = max(0.0, 1.0 - clickDist / maxDist);
                float maxLife = maxDist / waveSpeed;
                float fadeTime = max(0.0, 1.0 - w.z / maxLife);
                
                waveIntensity += wave * fadeDist * fadeTime * w.w;

                // Quake displacement directed away from the wave center (smoothed)
                if (extraPower > 0.0) {
                    vec2 dir = clickDist > 0.1 ? (px - w.xy * u_resolution) / clickDist : vec2(0.0);
                    quakeDisplacement += dir * wave * fadeDist * fadeTime * (extraPower * 4.0);
                }
                
                // Suppress center brightness on standard clicks
                if (w.w > 0.4 && w.w <= 1.5) {
                    float suppressDist = exp(-clickDist * clickDist / (2.0 * 100.0 * 100.0));
                    float suppressFade = max(0.0, 1.0 - w.z / 0.8); // Smooth linear fade
                    darkSuppress += suppressDist * suppressFade * 2.0;
                }
            }
        }

        // Apply wave to spotlight effects
        float effectIntensity = max(0.0, spotlight - darkSuppress) + waveIntensity;

        float spacing = 26.0;
        vec2 displacedPx = px + quakeDisplacement;
        vec2 cell = mod(displacedPx + spacing * 0.5, spacing) - spacing * 0.5;
        
        // Size boost (scale down)
        float baseSize = 1.6;
        float sizeBoost = 1.0 + min(1.5, effectIntensity * 1.2);
        float dotShape = 1.0 - smoothstep(0.0, baseSize * sizeBoost, length(cell));

        // Dot Colors for dark/light modes
        vec3 dotColorDimDark = vec3(0.35, 0.38, 0.45);
        vec3 dotColorDimLight = vec3(0.65, 0.62, 0.55);
        vec3 dotColorDim = mix(dotColorDimLight, dotColorDimDark, u_isDark);
        
        vec3 dotColorLitDark = vec3(3.0, 3.0, 3.0);
        vec3 dotColorLitLight = vec3(0.15, 0.35, 0.2); // Dark green for spotlight
        vec3 dotColorLit = mix(dotColorLitLight, dotColorLitDark, u_isDark);

        // Brightness and mixing
        float dimDark = 0.25;
        float dimLight = 0.35;
        float dim = mix(dimLight, dimDark, u_isDark);
        float lit = dim + effectIntensity * mix(1.2, 2.0, u_isDark);
        
        float clampedEffect = clamp(effectIntensity, 0.0, 1.0);
        float brightness = mix(dim, lit, clampedEffect);
        vec3 dotColor = mix(dotColorDim, dotColorLit, clampedEffect);

        // Final color mix
        vec3 colorDark = bgDark + dotColor * brightness * dotShape;
        vec3 colorLight = mix(bgLight, dotColor, brightness * dotShape);
        
        vec3 color = mix(colorLight, colorDark, u_isDark);

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
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const wavesLocation = gl.getUniformLocation(program, 'u_waves');
    const holdDownLocation = gl.getUniformLocation(program, 'u_holdDown');

    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    let spot = 0;
    let targetSpot = 0;
    let pointerInside = false;

    // Multiple waves tracking
    const MAX_WAVES = 30;
    let waves = Array(MAX_WAVES).fill(null).map(() => ({ x: 0, y: 0, time: 0, intensity: 0 }));
    let waveIndex = 0;
    function addWave(x, y, intensity) {
        waves[waveIndex] = { x, y, time: 0.001, intensity };
        waveIndex = (waveIndex + 1) % MAX_WAVES;
    }

    let isMouseDown = false;
    let holdDownAmt = 0.0;
    let lastTime = performance.now();
    let totalTime = 0.0;
    let lastTrailPos = { x: -1000, y: -1000 };

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

      // Add trail waves based on movement distance
      let dx = e.clientX - lastTrailPos.x;
      let dy = e.clientY - lastTrailPos.y;
      if (Math.sqrt(dx*dx + dy*dy) > 30) {
          addWave(target.x, target.y, 0.25); // small trail wave
          lastTrailPos.x = e.clientX;
          lastTrailPos.y = e.clientY;
      }
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
      if (isMouseDown) {
          isMouseDown = false;
          let extra = Math.max(0.0, holdDownAmt - 2.0);
          let power = 1.0 + extra * 2.0;
          addWave(target.x, target.y, power);
          holdDownAmt = 0.0;
      }
    });

    document.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      addWave(e.clientX / window.innerWidth, e.clientY / window.innerHeight, 0.5); // Little wave at first
    });
    document.addEventListener('mouseup', (e) => {
      if (isMouseDown) {
          isMouseDown = false;
          let extra = Math.max(0.0, holdDownAmt - 2.0);
          let power = 1.0 + extra * 2.0;
          addWave(e.clientX / window.innerWidth, e.clientY / window.innerHeight, power);
          holdDownAmt = 0.0;
      }
    });

    document.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (t) {
        isMouseDown = true;
        addWave(t.clientX / window.innerWidth, t.clientY / window.innerHeight, 0.5); // Little wave at first
      }
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
      if (isMouseDown) {
          isMouseDown = false;
          let extra = Math.max(0.0, holdDownAmt - 2.0);
          let power = 1.0 + extra * 2.0;
          addWave(target.x, target.y, power);
          holdDownAmt = 0.0;
      }
    }, { passive: true });

    function render() {
      const now = performance.now();
      const dt = (now - lastTime) / 1000.0;
      lastTime = now;
      totalTime += dt;

      // Animate hold down charging (up to 5 seconds)
      if (isMouseDown) {
          holdDownAmt = Math.min(5.0, holdDownAmt + dt);
      } else {
          holdDownAmt = 0.0;
      }

      // Update waves
      let wavesData = new Float32Array(MAX_WAVES * 4);
      for (let i = 0; i < MAX_WAVES; i++) {
          if (waves[i].time > 0.0) {
              waves[i].time += dt;
              
              let extraPower = Math.max(0.0, waves[i].intensity - 1.5);
              let waveSpeed = Math.max(300.0, 1000.0 - extraPower * 150.0);
              let maxDist = 1200.0 + extraPower * 1500.0;
              let maxLife = maxDist / waveSpeed;
              
              if (waves[i].time > maxLife) { // Max lifetime
                  waves[i].time = 0;
              }
          }
          wavesData[i*4 + 0] = waves[i].x;
          wavesData[i*4 + 1] = waves[i].y;
          wavesData[i*4 + 2] = waves[i].time;
          wavesData[i*4 + 3] = waves[i].intensity;
      }

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
      gl.uniform1f(timeLocation, totalTime);
      gl.uniform1f(holdDownLocation, holdDownAmt);
      if (wavesLocation) {
          gl.uniform4fv(wavesLocation, wavesData);
      }

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
        let tags = Array.isArray(w.tags) ? w.tags.join(', ') : (typeof w.tags === 'string' ? w.tags : `${w.cat || ''}, ${w.subcat || ''}`);
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
        // Support new format (iconType, iconVal, link/url) with fallback to iconId
        if (s.iconType) {
          return {
            name: s.name,
            link: s.link || s.url || '#',
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
          link: s.link || s.url || '#',
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
    }
  }


  async function fetchPortfolioData() {
    try {
      const t = sessionStorage.getItem('ghToken');
      let worksRes, settingsRes;

      const headers = { 'Accept': 'application/vnd.github.v3.raw' };
      if (t) {
        headers['Authorization'] = `token ${t}`;
      }

      // Query GitHub API directly (authenticated or anonymously) for real-time updates
      worksRes = await fetch(`https://api.github.com/repos/${DATA_OWNER}/${DATA_REPO}/contents/ozonz_works.json?ref=main&t=${Date.now()}`, { headers }).catch(() => null);
      settingsRes = await fetch(`https://api.github.com/repos/${DATA_OWNER}/${DATA_REPO}/contents/ozonz_settings.json?ref=main&t=${Date.now()}`, { headers }).catch(() => null);

      if (!worksRes || !worksRes.ok) {
        worksRes = await fetch(`https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_works.json?t=${Date.now()}`);
      }
      if (!settingsRes || !settingsRes.ok) {
        settingsRes = await fetch(`https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_settings.json?t=${Date.now()}`);
      }
      
      if (worksRes.ok) {
          globalWorks = await worksRes.json();
      } else {
          try {
              const r = await fetch('data/ozonz-works.json?t=' + Date.now());
              if (r.ok) globalWorks = await r.json();
              else globalWorks = [];
          } catch (_) {
              globalWorks = [];
          }
      }
      
      if (settingsRes.ok) {
          globalSettings = await settingsRes.json();
      }
      
      if (!globalSettings || !globalSettings.socials || globalSettings.socials.length === 0) {
          globalSettings = { ...globalSettings, socials: defaultContacts };
      } else {
          globalSettings.socials = ensureItchContact(globalSettings.socials);
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
    // Show cached data immediately for fast first paint
    const cachedWorks = localStorage.getItem('cached_works');
    const cachedSettings = localStorage.getItem('cached_settings');
    if (cachedWorks && cachedSettings) {
      try {
        globalWorks = JSON.parse(cachedWorks);
        globalSettings = JSON.parse(cachedSettings);
        if (globalSettings && globalSettings.socials) {
          globalSettings.socials = ensureItchContact(globalSettings.socials);
        }
        renderWorks();
        renderContacts();
      } catch (_) {}
    }

    // Always fetch fresh data from GitHub
    try {
      const t = sessionStorage.getItem('ghToken');
      let rWorks = null;
      let rSettings = null;

      const headers = { 'Accept': 'application/vnd.github.v3.raw' };
      if (t) {
        headers['Authorization'] = `token ${t}`;
      }

      // Query GitHub API directly (authenticated or anonymously) for real-time updates
      rWorks = await fetch(`https://api.github.com/repos/${DATA_OWNER}/${DATA_REPO}/contents/ozonz_works.json?ref=main&t=${Date.now()}`, { headers })
        .then(r => r.ok ? r.json() : null).catch(() => null);

      rSettings = await fetch(`https://api.github.com/repos/${DATA_OWNER}/${DATA_REPO}/contents/ozonz_settings.json?ref=main&t=${Date.now()}`, { headers })
        .then(r => r.ok ? r.json() : null).catch(() => null);

      if (rWorks === null) {
        rWorks = await fetch(`https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_works.json?t=${Date.now()}`).then(r => r.ok ? r.json() : null).catch(() => null);
      }
      if (rSettings === null) {
        rSettings = await fetch(`https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_settings.json?t=${Date.now()}`).then(r => r.ok ? r.json() : null).catch(() => null);
      }

      if (rWorks !== null) globalWorks = rWorks;
      if (rSettings !== null) globalSettings = rSettings;
      if (!globalSettings || !globalSettings.socials || globalSettings.socials.length === 0) {
        globalSettings = { ...globalSettings, socials: defaultContacts };
      } else {
        globalSettings.socials = ensureItchContact(globalSettings.socials);
      }
    } catch (err) {
      console.warn('[Portfolio] GitHub fetch failed:', err.message);
    }

    // Update cache and render with fresh data
    try {
      localStorage.setItem('cached_works', JSON.stringify(globalWorks));
      localStorage.setItem('cached_settings', JSON.stringify(globalSettings));
    } catch (_) {}
    renderWorks();
    renderContacts();

    // Background refresh for shared icons/teams (non-blocking)
    fetchPortfolioData().then(() => {
      renderContacts();
    });
  }

  async function init() {
    initLocalStorage();
    initBackground();
    initRevealAndTheme();
    initNavbarScroll();
    initSmoothScroll();
    
    // Load database settings FIRST so GitHub sync has fallback data ready
    await loadInitialData();
    
    // Start GitHub sync AFTER settings are loaded to prevent race condition
    startGitHubSync();
    
    checkHashRoute();
    initProjectDetailModal();
    
    window.addEventListener('hashchange', checkHashRoute);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
