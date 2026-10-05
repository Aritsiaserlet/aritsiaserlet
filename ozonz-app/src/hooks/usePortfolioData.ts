import { useState, useEffect, useCallback } from 'react';
import { Work, Settings, TeamMember } from '../types';
import {
  fetchWithTimeout,
  parseSecureJSON,
  normalizeWorks,
  getShortDescription,
  ensureItchContact,
  defaultContacts,
} from '../lib/utils';

const DATA_OWNER = 'OzonZ';
const DATA_REPO = 'Non-Four-Portfolio-Data';
const CACHE_TTL_MS = 300_000; // 5 min

export function usePortfolioData() {
  const [works, setWorks] = useState<Work[]>([]);
  const [settings, setSettings] = useState<Settings>({ socials: defaultContacts });
  const [isLoading, setIsLoading] = useState(true);

  const processWorks = useCallback(
    (rawWorks: unknown, curSettings: Settings): Work[] => {
      const normalized = normalizeWorks(rawWorks);
      return normalized.map((w) => {
        let image = w.image || w.thumbnail;
        if (Array.isArray(w.image)) image = w.image[0];
        if (!image && w.images && w.images.length > 0) image = w.images[0];
        if (!image && w.model) image = 'view_in_ar';

        let link = w.link;
        if (!link && w.links && w.links.length > 0) link = w.links[0].url;

        const tags = Array.isArray(w.tags)
          ? w.tags.join(', ')
          : typeof w.tags === 'string'
          ? w.tags
          : `${w.cat || ''}, ${w.subcat || ''}`;

        let contributors: { name: string; avatar?: string; url?: string }[] = [];
        if (w.team && curSettings.teams) {
          contributors = w.team
            .map((tid) => {
              const t = (curSettings.teams as TeamMember[]).find((x) => x.id === tid);
              return t
                ? {
                    name: t.name,
                    avatar: t.image || t.iconId,
                    url: t.url || t.link,
                  }
                : null;
            })
            .filter(Boolean) as { name: string; avatar?: string; url?: string }[];
        }

        const tagline =
          w.tagline || w.aiSummary || getShortDescription(w.desc || w.description || '');

        return {
          ...w,
          title: w.name || w.title || '',
          detail: w.desc || w.description || w.detail || '',
          tagline,
          aiSummary: w.aiSummary || '',
          year: w.year || (w.date ? new Date(w.date).getFullYear() : ''),
          image: image || 'brush',
          link: link || '#',
          tags,
          contributors,
        };
      });
    },
    []
  );

  const loadData = useCallback(
    async (force = false) => {
      const now = Date.now();
      const cachedTime = parseInt(localStorage.getItem('cached_timestamp') || '0', 10);
      const isCacheValid = !force && now - cachedTime < CACHE_TTL_MS;

      const cachedWorks = localStorage.getItem('cached_works');
      const cachedSettings = localStorage.getItem('cached_settings');
      let hasCache = false;

      if (cachedWorks && cachedSettings) {
        try {
          const parsedSettings: Settings = JSON.parse(cachedSettings) || {};
          parsedSettings.socials = ensureItchContact(parsedSettings.socials || defaultContacts);
          const parsedWorks = processWorks(JSON.parse(cachedWorks), parsedSettings);
          setWorks(parsedWorks);
          setSettings(parsedSettings);
          setIsLoading(false);
          hasCache = true;
        } catch (_) {}
      }

      if (isCacheValid && hasCache) {
        return;
      }

      try {
        const [worksRes, settingsRes, sharedRes] = await Promise.all([
          fetchWithTimeout(
            `https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_works.json`
          )
            .then(async (r) => (r.ok ? parseSecureJSON(await r.text()) : null))
            .catch(() => null),
          fetchWithTimeout(
            `https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/ozonz_settings.json`
          )
            .then(async (r) => (r.ok ? parseSecureJSON(await r.text()) : null))
            .catch(() => null),
          fetchWithTimeout(
            `https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/main/All%20File%20Aritsia/settings.json`
          )
            .then(async (r) => (r.ok ? parseSecureJSON(await r.text()) : null))
            .catch(() => null),
        ]);

        let finalWorks = worksRes;
        if (!finalWorks) {
          finalWorks = await fetchWithTimeout('data/ozonz-works.json')
            .then(async (r) => (r.ok ? parseSecureJSON(await r.text()) : null))
            .catch(() => null);
        }

        let newSettings: Settings = (settingsRes as Settings) || {};
        if (!newSettings.socials || newSettings.socials.length === 0) {
          newSettings.socials = defaultContacts;
        } else {
          newSettings.socials = ensureItchContact(newSettings.socials);
        }

        if (sharedRes && typeof sharedRes === 'object') {
          const s = sharedRes as Record<string, unknown>;
          if (Array.isArray(s.icons)) newSettings.icons = s.icons as { id: string; url: string }[];
          if (Array.isArray(s.teams)) newSettings.teams = s.teams as TeamMember[];
          if (Array.isArray(s.sounds)) newSettings.sounds = s.sounds;
        }

        const processed = processWorks(finalWorks, newSettings);
        setWorks(processed);
        setSettings(newSettings);
        setIsLoading(false);

        try {
          localStorage.setItem('cached_works', JSON.stringify(finalWorks));
          localStorage.setItem('cached_settings', JSON.stringify(newSettings));
          localStorage.setItem('cached_timestamp', String(now));
        } catch (_) {}
      } catch (err) {
        console.warn('[usePortfolioData] fetch error:', err);
        setIsLoading(false);
      }
    },
    [processWorks]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { works, settings, isLoading, refresh: () => loadData(true) };
}
