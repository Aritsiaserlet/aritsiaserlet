

(function () {
'use strict';

/* ══════════════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════════════ */
const PASSCODE       = '977254';
const GH_USER        = 'OzonZ';
const GH_REPO        = 'Non-Four-Portfolio-Data';
const GH_API         = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents`;
const WORKS_FILE     = 'ozonz_works.json';
const SETTINGS_FILE  = 'ozonz_settings.json';

/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
let ghToken       = '';
let works         = [];        // live array
let worksSha      = null;      // latest SHA for works file
let ozonzSettings = {};        // { socials: [] }
let settingsSha   = null;
let confirmCb     = null;
let selectedTeams = [];
let aritsiaTeams  = [];

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

/* ══════════════════════════════════════════════════════
   GITHUB API HELPERS
══════════════════════════════════════════════════════ */
function ghHeaders() {
    return {
        Authorization:  `token ${ghToken}`,
        Accept:         'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
    };
}

async function ghGet(path) {
    const r = await fetch(`${GH_API}/${path}?t=${Date.now()}`, { headers: ghHeaders() });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`GitHub GET ${r.status}`);
    return r.json();
}

async function ghPutBinary(path, base64content, message) {
    let sha;
    try {
        const existing = await ghGet(path);
        if (existing?.sha) sha = existing.sha;
    } catch (_) {}
    const body = { message, content: base64content };
    if (sha) body.sha = sha;
    let r = await fetch(`${GH_API}/${path}`, {
        method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body),
    });
    if (!r.ok) {
        const t = await r.text();
        throw new Error(`GitHub PUT binary ${r.status}: ${t}`);
    }
    return r.json();
}

async function ghPut(path, content, message, sha) {
    const body = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
    };
    if (sha) body.sha = sha;

    let r = await fetch(`${GH_API}/${path}`, {
        method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body),
    });

    // 409 Conflict → fetch latest SHA and retry once
    if (r.status === 409) {
        const latest = await ghGet(path);
        if (latest?.sha) { body.sha = latest.sha; }
        r = await fetch(`${GH_API}/${path}`, {
            method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body),
        });
    }
    if (!r.ok) {
        const t = await r.text();
        throw new Error(`GitHub PUT ${r.status}: ${t}`);
    }
    return r.json();
}

function decodeGH(b64) {
    return JSON.parse(decodeURIComponent(escape(atob(b64.replace(/\n/g, '')))));
}

async function syncGitHubProfileToSettings() {
    if (!ghToken) return;
    try {
        const headers = { 
            Authorization: `token ${ghToken}`,
            Accept: 'application/vnd.github+json'
        };
        const uRes = await fetch(`https://api.github.com/users/${GH_USER}`, { headers });
        if (!uRes.ok) return;
        const u = await uRes.json();
        
        let contributions = null;
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
                'Authorization': `bearer ${ghToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                query,
                variables: { username: GH_USER }
              })
            });
            if (gqlRes.ok) {
              const gqlData = await gqlRes.json();
              if (gqlData.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions !== undefined) {
                contributions = gqlData.data.user.contributionsCollection.contributionCalendar.totalContributions;
              }
            }
        } catch (_) {}
        
        if (contributions === null) {
            try {
                const cr = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}`);
                if (cr.ok) {
                    const cal = await cr.json();
                    if (cal.total) contributions = Object.values(cal.total).reduce((sum, v) => sum + (v || 0), 0);
                }
            } catch (_) {}
        }

        ozonzSettings.githubProfile = {
            name: u.name || u.login,
            login: u.login,
            avatarUrl: u.avatar_url,
            bio: u.bio || '',
            publicRepos: u.public_repos || 0,
            contributions: contributions || 0,
            updatedAt: new Date().toISOString()
        };

        // Automatically save settings silently in the background
        await saveSettings(`Sync GitHub profile info: @${GH_USER}`, true);
    } catch (err) {
        console.error("Failed to sync GitHub profile to settings:", err);
    }
}

/* ══════════════════════════════════════════════════════
   LOAD ARITSIA TEAMS
══════════════════════════════════════════════════════ */
async function loadAritsiaTeams() {
    try {
        const res = await fetch(`https://raw.githubusercontent.com/Aritsiaserlet/aritsiaserlet/main/settings.json?t=${Date.now()}`);
        if (res.ok) {
            const data = await res.json();
            if (data.teams) {
                aritsiaTeams = data.teams;
                renderCollaboratorCheckboxes();
            }
        }
    } catch (e) {
        console.warn("Failed to fetch Aritsia teams", e);
    }
}

function renderCollaboratorCheckboxes() {
    const container = document.getElementById('collaborator-list');
    if (!container) return;
    container.innerHTML = '';
    
    if (aritsiaTeams.length === 0) {
        container.innerHTML = '<p class="text-on-surface-variant text-xs">No team members available.</p>';
        return;
    }
    
    aritsiaTeams.forEach(tm => {
        const iconHtml = tm.iconId ? `<img src="${tm.iconId}" class="w-5 h-5 rounded-full object-cover border border-outline/20">` : (tm.image ? `<img src="${tm.image}" class="w-5 h-5 rounded-full object-cover border border-outline/20">` : `<div class="w-5 h-5 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant">${tm.name.charAt(0).toUpperCase()}</div>`);
        
        const label = document.createElement('label');
        label.className = "flex items-center gap-2 bg-surface-container hover:bg-surface-variant transition-colors px-3 py-1.5 border border-outline/20 rounded-lg cursor-pointer";
        label.innerHTML = `
            <input type="checkbox" value="${tm.id}" class="collab-checkbox text-primary bg-background border-outline rounded focus:ring-primary h-4 w-4">
            ${iconHtml}
            <span class="font-body-md text-sm text-on-surface">${tm.name}</span>
        `;
        container.appendChild(label);
    });
}

/* ══════════════════════════════════════════════════════
   LOAD FROM DATABASE
══════════════════════════════════════════════════════ */
async function loadData() {
    showLoading('Loading from Repository…');
    try {
        let loadedWorks = null;
        let loadedSettings = null;

        // Try using GitHub API first if token is available (always gets the latest, non-cached content)
        if (ghToken) {
            try {
                const worksData = await ghGet(WORKS_FILE);
                if (worksData) {
                    worksSha = worksData.sha;
                    if (worksData.content) {
                        loadedWorks = decodeGH(worksData.content);
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch works via GitHub API:", err);
            }

            try {
                const settingsData = await ghGet(SETTINGS_FILE);
                if (settingsData) {
                    settingsSha = settingsData.sha;
                    if (settingsData.content) {
                        loadedSettings = decodeGH(settingsData.content);
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch settings via GitHub API:", err);
            }
        }

        // Fallback to raw github fetch if API fetch failed or wasn't run
        if (!loadedWorks) {
            const worksRes = await fetch(`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${WORKS_FILE}?t=${Date.now()}`);
            if (worksRes.ok) {
                loadedWorks = await worksRes.json();
            } else {
                try {
                    const r = await fetch('data/ozonz-works.json?t=' + Date.now());
                    if (r.ok) loadedWorks = await r.json();
                    else loadedWorks = [];
                } catch (_) {
                    loadedWorks = [];
                }
            }
        }
        works = loadedWorks || [];

        if (!loadedSettings || !loadedSettings.socials || loadedSettings.socials.length === 0) {
            if (!loadedSettings) {
                const settingsRes = await fetch(`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${SETTINGS_FILE}?t=${Date.now()}`);
                if (settingsRes.ok) {
                    loadedSettings = await settingsRes.json();
                }
            }
            if (!loadedSettings || !loadedSettings.socials || loadedSettings.socials.length === 0) {
                loadedSettings = { socials: defaultContacts };
            }
        }
        
        if (loadedSettings) {
            loadedSettings.socials = ensureItchContact(loadedSettings.socials);
        }
        
        ozonzSettings = loadedSettings;
        
        // Wait for token validation or skip
        if (ghToken) {
            syncGitHubProfileToSettings();
        }
        
        await loadAritsiaTeams();
    } catch (err) {
        console.error("loadData error:", err);
        setBadge(false, err.message);
        showToast('Load error: ' + err.message);
    } finally {
        hideLoading();
    }
    renderWorks();
    renderContacts();
}

/* ══════════════════════════════════════════════════════
   SAVE WORKS → GITHUB
   ══════════════════════════════════════════════════════ */
async function saveWorks(actionLabel) {
    showLoading('Saving to GitHub…');
    try {
        if (!ghToken) {
            showToast('GitHub token is required to save changes!');
            return false;
        }
        let sha = null;
        try {
            const fileData = await ghGet(WORKS_FILE);
            if (fileData?.sha) sha = fileData.sha;
        } catch (_) {}

        const content = JSON.stringify(works, null, 4);
        await ghPut(WORKS_FILE, content, actionLabel, sha);
        showToast('✓ ' + actionLabel);
        setBadge(true, 'Connected to GitHub');
        return true;
    } catch (err) {
        console.error("saveWorks error:", err);
        showToast('Error: ' + err.message);
        setBadge(false, err.message);
        return false;
    } finally {
        hideLoading();
    }
}

async function saveSettings(actionLabel, silent = false) {
    if (!silent) showLoading('Saving settings to GitHub…');
    try {
        if (!ghToken) {
            if (!silent) showToast('GitHub token is required to save settings!');
            return false;
        }
        let sha = null;
        try {
            const fileData = await ghGet(SETTINGS_FILE);
            if (fileData?.sha) sha = fileData.sha;
        } catch (_) {}

        const content = JSON.stringify(ozonzSettings, null, 4);
        await ghPut(SETTINGS_FILE, content, actionLabel, sha);
        if (!silent) showToast('✓ ' + actionLabel);
        return true;
    } catch (err) {
        console.error("saveSettings error:", err);
        if (!silent) showToast('Error: ' + err.message);
        return false;
    } finally {
        if (!silent) hideLoading();
    }
}

/* ══════════════════════════════════════════════════════
   RENDER WORKS
══════════════════════════════════════════════════════ */
function renderWorks() {
    const list = document.getElementById('works-list');
    document.getElementById('works-count').textContent = works.length + ' work' + (works.length !== 1 ? 's' : '');
    if (!works.length) {
        list.innerHTML = '<p class="text-on-surface-variant text-sm text-center py-8">No works yet. Add the first one!</p>';
        return;
    }
    list.innerHTML = works.map((w, i) => {
        const img = Array.isArray(w.image) ? w.image[0] : w.image;
        const isUrl = img && (img.startsWith('http') || img.includes('/') || img.includes('.'));
        const thumb = isUrl
            ? `<img src="${img}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" onerror="this.style.display='none'" />`
            : `<div class="w-full h-full flex items-center justify-center bg-primary/10 text-primary"><span class="material-symbols-outlined text-2xl">${img || 'brush'}</span></div>`;
        const tagStr = Array.isArray(w.tags) ? w.tags.join(', ') : (w.tags || '');
        return `
        <div class="flex items-center gap-4 p-4 glass border-on-surface/5 rounded-xl hover:border-primary/30 transition-all group">
            <div class="w-20 h-16 bg-surface-container rounded-lg overflow-hidden shrink-0">
                ${thumb}
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-headline-md text-base text-on-surface">${w.name || '(Untitled)'}</h4>
                <p class="font-body-md text-xs text-on-surface-variant line-clamp-1">${tagStr || w.aiSummary || w.desc || ''}</p>
            </div>
            <div class="flex items-center gap-1">
                <button onclick="moveWorkItem(${i}, -1)" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center" ${i === 0 ? 'disabled style="opacity:0.25; cursor:not-allowed;"' : ''} title="Move Up">
                    <span class="material-symbols-outlined text-sm">arrow_upward</span>
                </button>
                <button onclick="moveWorkItem(${i}, 1)" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center" ${i === works.length - 1 ? 'disabled style="opacity:0.25; cursor:not-allowed;"' : ''} title="Move Down">
                    <span class="material-symbols-outlined text-sm">arrow_downward</span>
                </button>
                <button onclick="openWorkModal('${w.id}')" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center" title="Edit">
                    <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button onclick="deleteWork('${w.id}')" class="w-8 h-8 rounded-full hover:bg-error-container/20 flex items-center justify-center text-error" title="Delete">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        </div>`;
    }).join('');
}

/* ══════════════════════════════════════════════════════
   WORK MODAL
══════════════════════════════════════════════════════ */
window.openWorkModal = function(id) {
    const w = id ? works.find(x => String(x.id) === String(id)) : null;
    document.getElementById('work-modal-title').textContent = w ? 'Edit Work' : 'Add New Work';
    document.getElementById('work-edit-id').value           = w ? w.id : '';
    document.getElementById('autofill-url').value           = '';
    document.getElementById('autofill-status').classList.add('hidden');
    document.getElementById('ai-status').classList.add('hidden');

    // Reset image upload zone
    resetImageZone();

    // Reset form
    document.getElementById('work-name').value  = w?.name  || '';
    const img = w?.image;
    const imgVal = Array.isArray(img) ? img[0] : (img || '');
    document.getElementById('work-image').value = imgVal;
    const tags = w?.tags;
    document.getElementById('work-tags').value  = Array.isArray(tags) ? tags.join(', ') : (tags || '');
    document.getElementById('work-desc').value  = w?.desc  || '';
    document.getElementById('work-year').value  = w?.year  || '';
    document.getElementById('work-ai-summary').value = w?.aiSummary || '';
    document.getElementById('ai-summarize-status').classList.add('hidden');

    // Set collaborators
    selectedTeams = w?.team || [];
    Array.from(document.querySelectorAll('.collab-checkbox')).forEach(cb => {
        cb.checked = selectedTeams.includes(cb.value);
    });

    const m = document.getElementById('work-modal');
    m.classList.add('open');
    
    // Reset modal position
    const win = document.getElementById('work-modal-window');
    win.style.left = '0px';
    win.style.top = '0px';

    // If editing and has a valid image URL, show preview
    if (imgVal && (imgVal.startsWith('http') || imgVal.includes('/'))) {
        setImagePreviewUrl(imgVal);
    }

    // Links
    renderLinkRows(w?.links || []);
};

function renderLinkRows(links) {
    const wrap = document.getElementById('work-links-wrap');
    wrap.innerHTML = '';
    links.forEach((l, i) => {
        wrap.insertAdjacentHTML('beforeend', makeLinkRow(i, l.url || '', l.label || ''));
    });
}

function makeLinkRow(i, url = '', label = '') {
    return `
    <div class="link-row" data-link-idx="${i}">
        <input type="url" class="admin-input flex-1 bg-surface-container border-outline/20 rounded-lg px-4 py-2 text-xs" placeholder="https://..." value="${url}" />
        <input type="text" class="admin-input bg-surface-container border-outline/20 rounded-lg px-4 py-2 text-xs" placeholder="Label" style="max-width:130px" value="${label}" />
        <button type="button" onclick="removeLinkRow(this)" class="text-red-500 hover:text-red-400 transition-colors flex-shrink-0">
            <span class="material-symbols-outlined text-lg">close</span>
        </button>
    </div>`;
}

window.removeLinkRow = function(btn) { btn.closest('.link-row').remove(); };
document.getElementById('add-link-btn').addEventListener('click', () => {
    const wrap = document.getElementById('work-links-wrap');
    const idx  = wrap.querySelectorAll('.link-row').length;
    wrap.insertAdjacentHTML('beforeend', makeLinkRow(idx));
});

function collectLinks() {
    return Array.from(document.querySelectorAll('#work-links-wrap .link-row'))
        .map(row => ({
            url:   row.querySelector('input[type="url"]').value.trim(),
            label: row.querySelector('input[type="text"]').value.trim(),
        }))
        .filter(l => l.url);
}

document.getElementById('work-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (pendingImageFile && !ghToken) { showToast('GitHub token is required to upload images!'); return; }

    const editId  = document.getElementById('work-edit-id').value;
    const tagsVal = document.getElementById('work-tags').value.trim();

    // ── Upload pending image to GitHub if any ──
    let imgVal = document.getElementById('work-image').value.trim();
    if (pendingImageFile) {
        const uploaded = await uploadImageToGitHub(pendingImageFile);
        if (uploaded) {
            imgVal = uploaded;
            document.getElementById('work-image').value = imgVal;
        } else {
            return; // upload failed, abort
        }
    }

    const entry = {
        id:    editId ? Number(editId) : Date.now(),
        name:  document.getElementById('work-name').value.trim(),
        cat:   'ozonz',
        subcat: '',
        desc:  document.getElementById('work-desc').value.trim(),
        year:  document.getElementById('work-year').value.trim(),
        aiSummary: document.getElementById('work-ai-summary').value.trim(),
        image: imgVal,
        tags:  tagsVal ? tagsVal.split(',').map(t => t.trim()).filter(Boolean) : [],
        links: collectLinks(),
        team:  Array.from(document.querySelectorAll('.collab-checkbox:checked')).map(cb => cb.value),
        tools: [],
        date:  editId
               ? (works.find(w => String(w.id) === editId)?.date || new Date().toISOString())
               : new Date().toISOString(),
    };

    if (editId) {
        const idx = works.findIndex(w => String(w.id) === editId);
        if (idx >= 0) works[idx] = entry;
    } else {
        works.push(entry);  // oldest first / add to bottom
    }

    const ok = await saveWorks(editId ? `Update work: ${entry.name}` : `Add work: ${entry.name}`);
    if (ok) {
        document.getElementById('work-modal').classList.remove('open');
        renderWorks();
    }
});

/* ══════════════════════════════════════════════════════
   IMAGE UPLOAD SYSTEM
══════════════════════════════════════════════════════ */
let pendingImageFile = null;

window.resetImageZone = function resetImageZone() {
    pendingImageFile = null;
    document.getElementById('img-file-input').value = '';
    document.getElementById('img-upload-progress').classList.remove('visible');
    document.getElementById('work-image').value = '';
};

function setImagePreviewUrl(url) {
    // The sleek UI does not have an image preview drop zone.
    // If we wanted, we could update the input value or add a small preview thumbnail elsewhere.
}

function setImagePreviewBlob(file) {
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
}

async function uploadImageToGitHub(file) {
    const progress = document.getElementById('img-upload-progress');
    const bar      = document.getElementById('img-progress-bar');
    const label    = document.getElementById('img-progress-label');
    progress.classList.add('visible');
    bar.style.width = '0%';
    label.textContent = 'Reading file…';
    label.style.color = ''; // reset color to default

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                bar.style.width = '30%';
                label.textContent = 'Uploading to GitHub…';
                const base64   = ev.target.result.split(',')[1];
                const ext      = file.name.split('.').pop().toLowerCase() || 'jpg';
                const filename = `works/${Date.now()}_ozonz.${ext}`;
                bar.style.width = '60%';
                await ghPutBinary(filename, base64, `Upload work image: ${file.name}`);
                const rawUrl = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${filename}`;
                bar.style.width = '100%';
                label.textContent = '✓ Uploaded!';
                setTimeout(() => progress.classList.remove('visible'), 1500);
                resolve(rawUrl);
            } catch (err) {
                bar.style.width = '0%';
                label.textContent = `Error: ${err.message}`;
                label.style.color = '#ef4444';
                showToast('Image upload failed: ' + err.message);
                resolve(null);
            }
        };
        reader.readAsDataURL(file);
    });
}

function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) { showToast('Please select an image file.'); return; }
    if (file.size > 4 * 1024 * 1024) { showToast('Image too large — max 4 MB.'); return; }
    pendingImageFile = file;
    // Just update the input to show the file name as a visual cue
    document.getElementById('work-image').value = file.name + ' (Pending)';
}

document.getElementById('img-file-input').addEventListener('change', (e) => {
    if (e.target.files[0]) handleImageFile(e.target.files[0]);
});

// Paste from clipboard (Ctrl+V)
document.getElementById('work-modal').addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) { handleImageFile(file); break; }
        }
    }
});

window.deleteWork = function(id) {
    const w = works.find(x => String(x.id) === String(id));
    confirmDialog(`Delete "${w?.name || 'this work'}"? This cannot be undone.`, async () => {
        works = works.filter(x => String(x.id) !== String(id));
        const ok = await saveWorks(`Delete work: ${w?.name}`);
        if (ok) renderWorks();
    });
};

window.moveWorkItem = async function(idx, direction) {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= works.length) return;
    
    const temp = works[idx];
    works[idx] = works[targetIdx];
    works[targetIdx] = temp;
    
    const ok = await saveWorks(`Reorder work: ${temp.name || 'item'}`);
    if (ok) {
        renderWorks();
    }
};

document.getElementById('work-cancel').addEventListener('click', () => {
    document.getElementById('work-modal').classList.remove('open');
});
document.getElementById('work-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('work-modal'))
        document.getElementById('work-modal').classList.remove('open');
});

/* ══════════════════════════════════════════════════════
   DRAGGABLE MODAL LOGIC
══════════════════════════════════════════════════════ */
function initDraggableModal() {
    const header = document.getElementById('work-modal-header');
    const win = document.getElementById('work-modal-window');
    if (!header || !win) return;

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    function onDown(e) {
        if (e.target.closest('button')) return; // Don't drag if clicking close button
        isDragging = true;
        startX = e.clientX || (e.touches && e.touches[0].clientX);
        startY = e.clientY || (e.touches && e.touches[0].clientY);
        initialLeft = parseInt(win.style.left || 0);
        initialTop = parseInt(win.style.top || 0);
    }

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const cx = e.clientX || (e.touches && e.touches[0].clientX);
        const cy = e.clientY || (e.touches && e.touches[0].clientY);
        const dx = cx - startX;
        const dy = cy - startY;
        win.style.left = (initialLeft + dx) + 'px';
        win.style.top = (initialTop + dy) + 'px';
    }

    function onUp() {
        isDragging = false;
    }

    header.addEventListener('mousedown', onDown);
    header.addEventListener('touchstart', onDown, {passive: true});
    document.addEventListener('mousemove', onMove, {passive: false});
    document.addEventListener('touchmove', onMove, {passive: false});
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
}
initDraggableModal();

async function callGeminiSummary(apiKey, rawDesc) {
    const promptText = `You are an assistant that summarizes project/game descriptions for a developer portfolio. Summarize the following raw description into two parts: 1. A clean, professional description (1-2 sentences, in English). 2. A very short, punchy tagline or summary (maximum 6-8 words, in English). Return the result as a raw JSON object with keys "description" and "tagline". Do not include markdown formatting or backticks. Description: "${rawDesc}"`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });
    if (!res.ok) throw new Error(`Gemini status ${res.status}`);
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(text);
    } catch (e) {
        const descMatch = text.match(/"description"\s*:\s*"([^"]+)"/);
        const taglineMatch = text.match(/"tagline"\s*:\s*"([^"]+)"/);
        return {
            description: descMatch ? descMatch[1] : null,
            tagline: taglineMatch ? taglineMatch[1] : null
        };
    }
}

document.getElementById('autofill-btn').addEventListener('click', () => {
    const url    = document.getElementById('autofill-url').value.trim();
    const status = document.getElementById('autofill-status');
    if (!url) { status.textContent = 'Enter a URL first.'; status.className = 'text-red-500 text-xs mt-2 block'; return; }

    status.textContent = 'Fetching…'; status.className = 'text-on-surface-variant text-xs mt-2 block';

    const ghMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/i);
    if (ghMatch) {
        const owner = ghMatch[1];
        let   repo  = ghMatch[2].split(/[#?]/)[0].replace(/\.git$/, '');
        Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${repo}`).then(r => r.json()),
            fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(async ([rd, cd]) => {
            const title = rd.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            document.getElementById('work-name').value  = title;
            const rawDesc = rd.description || '';
            document.getElementById('work-desc').value  = rawDesc;
            document.getElementById('work-ai-summary').value = '';
            document.getElementById('work-image').value = 'terminal';
            const tags = [];
            if (rd.language) tags.push(rd.language.toUpperCase());
            tags.push('GITHUB');
            document.getElementById('work-tags').value  = tags.join(', ');
            renderLinkRows([{ url: rd.html_url, label: 'GitHub Repo' }]);

            const apiKey = localStorage.getItem('gemini_api_key') || '';
            if (rawDesc && apiKey) {
                status.textContent = 'AI Summarizing description…';
                try {
                    const aiRes = await callGeminiSummary(apiKey, rawDesc);
                    if (aiRes.description) document.getElementById('work-desc').value = aiRes.description;
                    if (aiRes.tagline) document.getElementById('work-ai-summary').value = aiRes.tagline;
                } catch (e) {
                    console.warn("Gemini Autofill summary failed:", e);
                }
            }

            status.textContent = '✓ Autofill successful!'; status.className = 'text-green-500 text-xs mt-2 block';
        }).catch(err => { status.textContent = 'Error: ' + err.message; status.className = 'text-red-500 text-xs mt-2 block'; });
        return;
    }

    if (/itch\.io/i.test(url)) {
        const parseHtml = async html => {
            const doc   = new DOMParser().parseFromString(html, 'text/html');
            let title   = doc.querySelector('meta[property="og:title"]')?.content || doc.title || '';
            title       = title.replace(/\s*by\s+itch\.io$/i, '').trim();
            const image = doc.querySelector('meta[property="og:image"]')?.content || 'brush';
            const desc  = (doc.querySelector('meta[property="og:description"]')?.content || '').trim();
            document.getElementById('work-name').value  = title;
            document.getElementById('work-image').value = image;
            document.getElementById('work-desc').value  = desc;
            document.getElementById('work-ai-summary').value = '';
            document.getElementById('work-tags').value  = 'ITCH.IO';
            renderLinkRows([{ url, label: 'Play on Itch.io' }]);

            const apiKey = localStorage.getItem('gemini_api_key') || '';
            if (desc && apiKey) {
                status.textContent = 'AI Summarizing description…';
                try {
                    const aiRes = await callGeminiSummary(apiKey, desc);
                    if (aiRes.description) document.getElementById('work-desc').value = aiRes.description;
                    if (aiRes.tagline) document.getElementById('work-ai-summary').value = aiRes.tagline;
                } catch (e) {
                    console.warn("Gemini Autofill summary failed:", e);
                }
            }

            status.textContent = '✓ Autofill successful!'; status.className = 'text-green-500 text-xs mt-2 block';
        };
        fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`).then(r => r.text()).then(parseHtml)
            .catch(() => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`).then(r => r.json()).then(d => parseHtml(d.contents)))
            .catch(() => { status.textContent = 'Proxy failed. Fill manually.'; status.className = 'text-red-500 text-xs mt-2 block'; });
        return;
    }
    status.textContent = 'Use a GitHub or Itch.io URL.'; status.className = 'text-red-500 text-xs mt-2 block';
});

/* ══════════════════════════════════════════════════════
   AI WRITE
══════════════════════════════════════════════════════ */
document.getElementById('ai-write-btn').addEventListener('click', () => {
    const title  = document.getElementById('work-name').value.trim();
    const tags   = document.getElementById('work-tags').value.trim();
    const detail = document.getElementById('work-desc');
    const status = document.getElementById('ai-status');
    const apiKey = localStorage.getItem('gemini_api_key') || '';
    if (!title)  { status.textContent = 'Enter a Work Name first.'; status.className = 'text-red-500 text-[10px] mt-1 block'; return; }
    if (!apiKey) { status.textContent = 'Set a Gemini API Key first (AI Settings).'; status.className = 'text-red-500 text-[10px] mt-1 block'; return; }
    status.textContent = 'Generating…'; status.className = 'text-on-surface-variant text-[10px] mt-1 block';
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Write a professional, short, engaging description (1-2 sentences, English) for a portfolio project named "${title}" with tags "${tags}". No markdown, no quotes, just the description.` }] }] })
    }).then(r => r.json()).then(d => {
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) { detail.value = text.trim(); status.textContent = '✓ Done!'; status.className = 'text-green-500 text-[10px] mt-1 block'; }
        else throw new Error('Invalid AI response');
    }).catch(err => { status.textContent = 'Error: ' + err.message; status.className = 'text-red-500 text-[10px] mt-1 block'; });
});

document.getElementById('ai-summarize-btn').addEventListener('click', () => {
    const desc   = document.getElementById('work-desc').value.trim();
    const summaryInput = document.getElementById('work-ai-summary');
    const status = document.getElementById('ai-summarize-status');
    const apiKey = localStorage.getItem('gemini_api_key') || '';
    if (!desc)   { status.textContent = 'Enter a Description first.'; status.className = 'text-red-500 text-[10px] mt-1 block'; status.classList.remove('hidden'); return; }
    if (!apiKey) { status.textContent = 'Set a Gemini API Key first (AI Settings).'; status.className = 'text-red-500 text-[10px] mt-1 block'; status.classList.remove('hidden'); return; }
    status.textContent = 'Summarizing…'; status.className = 'text-on-surface-variant text-[10px] mt-1 block'; status.classList.remove('hidden');
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Summarize the following description into a very short, punchy tagline or summary (maximum 6-8 words, in English). Do not use markdown, quotes, prefix or suffix. Just output the summary text itself. Description: "${desc}"` }] }] })
    }).then(r => r.json()).then(d => {
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            summaryInput.value = text.trim().replace(/^["']|["']$/g, '');
            status.textContent = '✓ Done!'; status.className = 'text-green-500 text-[10px] mt-1 block';
        }
        else throw new Error('Invalid AI response');
    }).catch(err => { status.textContent = 'Error: ' + err.message; status.className = 'text-red-500 text-[10px] mt-1 block'; });
});

/* ══════════════════════════════════════════════════════
   RENDER CONTACTS (from ozonzSettings.socials)
══════════════════════════════════════════════════════ */
function renderContacts() {
    const list     = document.getElementById('contacts-list');
    const socials  = ozonzSettings.socials || [];
    document.getElementById('contacts-count').textContent = socials.length + ' contact' + (socials.length !== 1 ? 's' : '');
    if (!socials.length) {
        list.innerHTML = '<p class="text-on-surface-variant text-sm text-center py-8">No contacts yet.</p>';
        return;
    }
    list.innerHTML = socials.map((c, i) => {
        let iconEl = '';
        if (c.iconType === 'svg')
            iconEl = `<svg class="w-5 h-5 fill-current text-primary" viewBox="0 0 24 24"><path d="${c.iconVal}"></path></svg>`;
        else if (c.iconType === 'image')
            iconEl = `<img src="${c.iconVal}" class="w-5 h-5 rounded-full object-cover" />`;
        else
            iconEl = `<span class="material-symbols-outlined text-base text-primary">${c.iconVal || 'link'}</span>`;
        return `
        <div class="flex items-center gap-4 p-4 glass border-on-surface/5 rounded-xl hover:border-primary/30 transition-all group">
            <div class="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-primary flex-shrink-0">
                ${iconEl}
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-headline-md text-base text-on-surface">${c.name}</h4>
                <p class="font-body-md text-xs text-on-surface-variant truncate">${c.link || c.url || ''}</p>
            </div>
            <div class="flex items-center gap-1">
                <button onclick="moveContactItem(${i}, -1)" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center" ${i === 0 ? 'disabled style="opacity:0.25; cursor:not-allowed;"' : ''} title="Move Up">
                    <span class="material-symbols-outlined text-sm">arrow_upward</span>
                </button>
                <button onclick="moveContactItem(${i}, 1)" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center" ${i === socials.length - 1 ? 'disabled style="opacity:0.25; cursor:not-allowed;"' : ''} title="Move Down">
                    <span class="material-symbols-outlined text-sm">arrow_downward</span>
                </button>
                <button onclick="openContactModal(${i})" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center" title="Edit">
                    <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button onclick="deleteContact(${i})" class="w-8 h-8 rounded-full hover:bg-error-container/20 flex items-center justify-center text-error" title="Delete">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        </div>`;
    }).join('');
}

/* ══════════════════════════════════════════════════════
   CONTACT MODAL
══════════════════════════════════════════════════════ */
let pendingContactImageFile = null;

window.resetContactImageZone = function resetContactImageZone() {
    pendingContactImageFile = null;
    const zone = document.getElementById('contact-img-drop-zone');
    if (!zone) return;
    zone.classList.remove('has-image');
    zone.innerHTML = `
        <span class="material-symbols-outlined text-primary text-3xl">add_photo_alternate</span>
        <span class="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">Click or drag image</span>
        <span class="text-[10px] text-on-surface-variant block">(JPG, PNG, GIF, WebP · max 4 MB)</span>
        <span class="remove-img">✕ Remove</span>
    `;
    document.getElementById('contact-img-file-input').value = '';
    document.getElementById('contact-img-upload-progress').classList.remove('visible');
};

function setContactImagePreviewUrl(url) {
    const zone = document.getElementById('contact-img-drop-zone');
    if (!zone) return;
    zone.classList.add('has-image');
    zone.innerHTML = `
        <img class="preview" src="${url}" alt="preview" />
        <span class="remove-img">✕ Remove</span>
    `;
}

function setContactImagePreviewBlob(file) {
    const url = URL.createObjectURL(file);
    setContactImagePreviewUrl(url);
}

async function uploadContactImageToGitHub(file) {
    const progress = document.getElementById('contact-img-upload-progress');
    const bar      = document.getElementById('contact-img-progress-bar');
    const label    = document.getElementById('contact-img-progress-label');
    progress.classList.add('visible');
    bar.style.width = '0%';
    label.textContent = 'Reading file…';
    label.style.color = '';

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                bar.style.width = '30%';
                label.textContent = 'Uploading to GitHub…';
                const base64   = ev.target.result.split(',')[1];
                const ext      = file.name.split('.').pop().toLowerCase() || 'jpg';
                const filename = `works/contact_${Date.now()}_ozonz.${ext}`;
                bar.style.width = '60%';
                await ghPutBinary(filename, base64, `Upload contact image: ${file.name}`);
                const rawUrl = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${filename}`;
                bar.style.width = '100%';
                label.textContent = '✓ Uploaded!';
                setTimeout(() => progress.classList.remove('visible'), 1500);
                resolve(rawUrl);
            } catch (err) {
                bar.style.width = '0%';
                label.textContent = `Error: ${err.message}`;
                label.style.color = '#ef4444';
                showToast('Image upload failed: ' + err.message);
                resolve(null);
            }
        };
        reader.readAsDataURL(file);
    });
}

function handleContactImageFile(file) {
    if (!file || !file.type.startsWith('image/')) { showToast('Please select an image file.'); return; }
    if (file.size > 4 * 1024 * 1024) { showToast('Image too large — max 4 MB.'); return; }
    pendingContactImageFile = file;
    setContactImagePreviewBlob(file);
    document.getElementById('contact-icon-val').value = '';
}

function updateContactIconLabel() {
    const type  = document.getElementById('contact-icon-type').value;
    const label = document.getElementById('contact-icon-label');
    const input = document.getElementById('contact-icon-val');
    const uploadWrap = document.getElementById('contact-img-upload-wrap');
    
    if (type === 'material') {
        label.textContent = 'Material Symbol Name (e.g. terminal)';
        input.placeholder = 'terminal';
        input.required = true;
        uploadWrap.classList.add('hidden');
    }
    else if (type === 'svg') {
        label.textContent = 'SVG Path D-Attribute';
        input.placeholder = 'M12 0c-6...';
        input.required = true;
        uploadWrap.classList.add('hidden');
    }
    else {
        label.textContent = 'Or enter Image URL';
        input.placeholder = 'https://...';
        input.required = false;
        uploadWrap.classList.remove('hidden');
    }
}
document.getElementById('contact-icon-type').addEventListener('change', updateContactIconLabel);

window.openContactModal = function(idx) {
    const c = idx != null ? (ozonzSettings.socials || [])[idx] : null;
    document.getElementById('contact-modal-title').textContent = c ? 'Edit Contact' : 'Add Contact Channel';
    document.getElementById('contact-edit-id').value = idx != null ? idx : '';
    document.getElementById('contact-name').value      = c?.name      || '';
    document.getElementById('contact-link').value      = c?.link || c?.url || '';
    document.getElementById('contact-icon-type').value = c?.iconType  || 'material';
    document.getElementById('contact-icon-val').value  = c?.iconVal   || '';
    updateContactIconLabel();
    
    resetContactImageZone();
    if (c?.iconType === 'image' && c?.iconVal && (c.iconVal.startsWith('http') || c.iconVal.includes('/'))) {
        setContactImagePreviewUrl(c.iconVal);
    }
    
    document.getElementById('contact-modal').classList.add('open');
};

document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (pendingContactImageFile && !ghToken) { showToast('GitHub token is required to upload images!'); return; }
    
    if (!ozonzSettings.socials) ozonzSettings.socials = [];
    const idx  = document.getElementById('contact-edit-id').value;
    
    let iconVal = document.getElementById('contact-icon-val').value.trim();
    if (document.getElementById('contact-icon-type').value === 'image' && pendingContactImageFile) {
        const uploaded = await uploadContactImageToGitHub(pendingContactImageFile);
        if (uploaded) {
            iconVal = uploaded;
            document.getElementById('contact-icon-val').value = iconVal;
        } else {
            return; // upload failed, abort
        }
    }

    const entry = {
        name:     document.getElementById('contact-name').value.trim(),
        link:     document.getElementById('contact-link').value.trim(),
        iconType: document.getElementById('contact-icon-type').value,
        iconVal:  iconVal,
    };
    const i = idx !== '' ? parseInt(idx) : -1;
    if (i >= 0) ozonzSettings.socials[i] = entry;
    else        ozonzSettings.socials.push(entry);

    const ok = await saveSettings(i >= 0 ? `Update contact: ${entry.name}` : `Add contact: ${entry.name}`);
    if (ok) {
        document.getElementById('contact-modal').classList.remove('open');
        renderContacts();
    }
});

// Contact image drop zone events wiring
document.getElementById('contact-img-drop-zone').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-img') || e.target.closest('.remove-img')) {
        e.stopPropagation();
        window.resetContactImageZone();
        return;
    }
    document.getElementById('contact-img-file-input').click();
});
document.getElementById('contact-img-file-input').addEventListener('change', (e) => {
    if (e.target.files[0]) handleContactImageFile(e.target.files[0]);
});

const contactDropZone = document.getElementById('contact-img-drop-zone');
contactDropZone.addEventListener('dragover', (e) => { e.preventDefault(); contactDropZone.classList.add('drag-over'); });
contactDropZone.addEventListener('dragleave', ()   => { contactDropZone.classList.remove('drag-over'); });
contactDropZone.addEventListener('drop', (e) => {
    e.preventDefault(); contactDropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleContactImageFile(file);
});

// Paste from clipboard to contact modal (Ctrl+V)
document.getElementById('contact-modal').addEventListener('paste', (e) => {
    if (document.getElementById('contact-icon-type').value !== 'image') return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) { handleContactImageFile(file); break; }
        }
    }
});

window.deleteContact = function(idx) {
    const c = (ozonzSettings.socials || [])[idx];
    confirmDialog(`Delete "${c?.name || 'this contact'}"?`, async () => {
        ozonzSettings.socials.splice(idx, 1);
        const ok = await saveSettings(`Delete contact: ${c?.name}`);
        if (ok) renderContacts();
    });
};

window.moveContactItem = async function(idx, direction) {
    const socials = ozonzSettings.socials || [];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= socials.length) return;
    
    const temp = socials[idx];
    socials[idx] = socials[targetIdx];
    socials[targetIdx] = temp;
    
    const ok = await saveSettings(`Reorder contact: ${temp.name || 'item'}`);
    if (ok) {
        renderContacts();
    }
};

window.renderTeamCheckboxList = function() {
    const wrap = document.getElementById('work-team-wrap');
    if (!wrap) return;
    if (!aritsiaTeams || aritsiaTeams.length === 0) {
        wrap.innerHTML = '<p class="text-xs text-on-surface-variant text-center">No team members available. Add them in ARITSIA Admin.</p>';
        return;
    }
    wrap.innerHTML = aritsiaTeams.map(tm => {
        const checked = selectedTeams.includes(tm.id) ? 'checked' : '';
        const iconHtml = tm.iconId ? `<img src="${tm.iconId}" class="w-5 h-5 rounded-full object-cover border border-outline/30">` : (tm.image ? `<img src="${tm.image}" class="w-5 h-5 rounded-full object-cover border border-outline/30">` : `<div class="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">${tm.name.charAt(0).toUpperCase()}</div>`);
        return `
        <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-surface-variant/30 transition-colors">
            <input type="checkbox" value="${tm.id}" ${checked} onchange="toggleTeamSelection('${tm.id}', this.checked)" class="rounded text-primary focus:ring-primary bg-surface-container border-outline/30">
            ${iconHtml}
            <span class="text-sm text-on-surface">${tm.name}</span>
        </label>
        `;
    }).join('');
};

window.toggleTeamSelection = function(id, isChecked) {
    if (isChecked) {
        if (!selectedTeams.includes(id)) selectedTeams.push(id);
    } else {
        selectedTeams = selectedTeams.filter(t => t !== id);
    }
};

document.getElementById('contact-cancel').addEventListener('click', () => {
    document.getElementById('contact-modal').classList.remove('open');
});
document.getElementById('contact-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('contact-modal'))
        document.getElementById('contact-modal').classList.remove('open');
});

/* ══════════════════════════════════════════════════════
   TOKEN MANAGEMENT
══════════════════════════════════════════════════════ */
function applyToken(token) {
    ghToken = token.trim();
    document.getElementById('gh-token-input').value = ghToken;
    document.getElementById('token-status').textContent = ghToken ? '✓ Token set' : 'No token';
    document.getElementById('token-status').className = ghToken
        ? 'text-xs text-green-500' : 'text-xs text-on-surface-variant';
    if (ghToken) sessionStorage.setItem('ghToken', ghToken);
    else         sessionStorage.removeItem('ghToken');
}

document.getElementById('gh-token-save').addEventListener('click', () => {
    applyToken(document.getElementById('gh-token-input').value);
    showToast('Token updated');
    loadData();
});

/* ══════════════════════════════════════════════════════
   GEMINI KEY
══════════════════════════════════════════════════════ */
document.getElementById('gemini-key-input').value = localStorage.getItem('gemini_api_key') || '';
if (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY && !localStorage.getItem('gemini_api_key')) {
    localStorage.setItem('gemini_api_key', CONFIG.GEMINI_API_KEY);
    document.getElementById('gemini-key-input').value = CONFIG.GEMINI_API_KEY;
}
document.getElementById('gemini-save-btn').addEventListener('click', () => {
    localStorage.setItem('gemini_api_key', document.getElementById('gemini-key-input').value.trim());
    showToast('Gemini API Key saved');
    document.getElementById('gemini-save-btn').textContent = '✓ Saved!';
    setTimeout(() => document.getElementById('gemini-save-btn').textContent = 'Save Key', 1500);
});



/* ══════════════════════════════════════════════════════
   LOGIN / LOGOUT
══════════════════════════════════════════════════════ */
function attemptLogin() {
    const pin   = document.getElementById('login-input').value;
    const token = document.getElementById('login-gh-token').value.trim();
    if (pin !== PASSCODE) {
        document.getElementById('login-error').classList.remove('hidden');
        document.getElementById('login-input').value = '';
        setTimeout(() => document.getElementById('login-error').classList.add('hidden'), 2500);
        return;
    }
    // Apply token (even if empty — user can set later)
    applyToken(token || sessionStorage.getItem('ghToken') || '');

    document.getElementById('login-screen').style.display  = 'none';
    document.getElementById('admin-main').classList.remove('hidden');
    loadData();
}

document.getElementById('login-btn').addEventListener('click', attemptLogin);
document.getElementById('login-input').addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });

document.getElementById('logout-btn').addEventListener('click', () => {
    document.getElementById('admin-main').classList.add('hidden');
    document.getElementById('login-screen').style.display = '';
    document.getElementById('login-input').value           = '';
    document.getElementById('login-gh-token').value        = '';
    ghToken = '';
});

// Auto-restore session
(function restoreSession() {
    const savedToken = sessionStorage.getItem('ghToken');
    if (savedToken) document.getElementById('login-gh-token').value = savedToken;
})();

/* ══════════════════════════════════════════════════════
   UI HELPERS
══════════════════════════════════════════════════════ */
function setBadge(ok, msg) {
    const b = document.getElementById('gh-status-badge');
    if (ok) {
        b.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-500"></span> Database Connected`;
        b.className  = 'inline-flex items-center gap-1.5 text-label-md text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30';
    } else {
        b.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span> ${msg || 'Disconnected'}`;
        b.className  = 'inline-flex items-center gap-1.5 text-label-md text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30';
    }
}

function showLoading(msg) {
    const ov = document.getElementById('loading-overlay');
    document.getElementById('loading-msg').textContent = msg || 'Loading…';
    ov.classList.remove('hidden');
}
function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

function confirmDialog(msg, cb) {
    document.getElementById('confirm-msg').textContent = msg;
    confirmCb = cb;
    document.getElementById('confirm-modal').classList.add('open');
}
document.getElementById('confirm-yes').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.remove('open');
    if (confirmCb) confirmCb();
    confirmCb = null;
});
document.getElementById('confirm-no').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.remove('open');
    confirmCb = null;
});

window.toggleSection = function(header) {
    const body = header.closest('.glass').querySelector('.grid, .collapsible-body');
    const icon = header.querySelector('.toggle-icon');
    if (!body) return;
    body.classList.toggle('hidden');
    if (icon) icon.textContent = body.classList.contains('hidden') ? 'expand_more' : 'expand_less';
};

/* ══════════════════════════════════════════════════════
   BUTTONS WIRING
══════════════════════════════════════════════════════ */
document.getElementById('add-work-btn').addEventListener('click',    () => openWorkModal(null));
document.getElementById('add-contact-btn').addEventListener('click', () => openContactModal(null));

/* ══════════════════════════════════════════════════════
   WEBGL DOT-GRID BACKGROUND
══════════════════════════════════════════════════════ */
(function initBG() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    const vert = `attribute vec2 a_p; varying vec2 v_t; void main(){ v_t=a_p*.5+.5; v_t.y=1.-v_t.y; gl_Position=vec4(a_p,0,1); }`;
    const frag = `precision highp float;
        uniform vec2 u_r,u_m; uniform float u_s,u_d; varying vec2 v_t;
        void main(){
            vec2 px=v_t*u_r;
            float g=clamp(v_t.x*.5+v_t.y*.5,0.,1.);
            vec3 bgL=mix(vec3(.98,.965,.922),vec3(1.,.992,.969),g),bgD=vec3(.063,.078,.102);
            vec3 bg=mix(bgL,bgD,u_d);
            float sp=26.;vec2 cell=mod(px+sp*.5,sp)-sp*.5;
            float dot=1.-smoothstep(0.0,1.6,length(cell));
            float sd=length(px-u_m*u_r);float spot=u_s*exp(-sd*sd/(2.*95.*95.));
            vec3 dL=mix(vec3(.75,.72,.65),vec3(.35,.38,.45),u_d),dH=vec3(3.0,3.0,3.0);
            float dim=mix(.35,.25,u_d),lit=dim+spot*2.0,br=mix(dim,lit,spot);
            vec3 c=bg+mix(dL,dH,spot)*br*dot;
            gl_FragColor=vec4(c,1.);
        }`;
    function mkShader(type, src) {
        const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;
    }
    const prog=gl.createProgram();
    gl.attachShader(prog,mkShader(gl.VERTEX_SHADER,vert));
    gl.attachShader(prog,mkShader(gl.FRAGMENT_SHADER,frag));
    gl.linkProgram(prog);
    const buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const pL=gl.getAttribLocation(prog,'a_p');
    const rL=gl.getUniformLocation(prog,'u_r'),mL=gl.getUniformLocation(prog,'u_m'),sL=gl.getUniformLocation(prog,'u_s'),dL=gl.getUniformLocation(prog,'u_d');
    const mouse={x:.5,y:.5},tgt={x:.5,y:.5};let spot=0,ts=0,pin=false,dT=document.documentElement.classList.contains('dark')?1:0;
    function onMv(e){tgt.x=e.clientX/innerWidth;tgt.y=e.clientY/innerHeight;ts=1;pin=true;}
    document.addEventListener('mousemove',onMv,{passive:true});
    document.addEventListener('mouseleave',()=>{pin=false;ts=0;});
    document.addEventListener('touchmove',e=>{const t=e.touches[0];if(t)onMv({clientX:t.clientX,clientY:t.clientY});},{passive:true});
    function render(){
        canvas.width=innerWidth;canvas.height=innerHeight;
        gl.viewport(0,0,canvas.width,canvas.height);
        const l=pin?.14:.06;mouse.x+=(tgt.x-mouse.x)*l;mouse.y+=(tgt.y-mouse.y)*l;
        spot+=(ts-spot)*.12;
        const id=document.documentElement.classList.contains('dark')?1:0;
        dT+=(id-dT)*.1;
        gl.useProgram(prog);gl.enableVertexAttribArray(pL);
        gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.vertexAttribPointer(pL,2,gl.FLOAT,false,0,0);
        gl.uniform2f(rL,canvas.width,canvas.height);gl.uniform2f(mL,mouse.x,mouse.y);
        gl.uniform1f(sL,spot);gl.uniform1f(dL,dT);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
})();

/* ══════════════════════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════════════════════ */
(function initTheme() {
    const btn  = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
    if (btn) btn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const d = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', d ? 'dark' : 'light');
        if (icon) icon.textContent = d ? 'light_mode' : 'dark_mode';
    });
})();

})();

