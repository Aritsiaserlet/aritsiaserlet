import { useState, useEffect, useCallback, useRef } from 'react';
import { GitHubStats, Settings } from '../types';

const GITHUB_USER = 'OzonZ';
const POLL_MS = 300_000; // 5 min

export function useGitHubStats(settings: Settings) {
  const [stats, setStats] = useState<GitHubStats>({
    contributions: '…',
    repositories: '…',
    name: 'Chanon Thongduang',
    login: GITHUB_USER,
    avatarUrl: 'https://avatars.githubusercontent.com/u/255675901?v=4',
    bio: '',
    profileUrl: `https://github.com/${GITHUB_USER}`,
  });
  const [isLivePulsing, setIsLivePulsing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const lastContributionsRef = useRef<number | string | null>(null);

  const triggerLivePulse = useCallback(() => {
    setIsLivePulsing(true);
    setTimeout(() => setIsLivePulsing(false), 500);
  }, []);

  const fetchFallbackProfile = useCallback(async (): Promise<Partial<GitHubStats> | null> => {
    if (settings && settings.githubProfile) {
      const p = settings.githubProfile;
      return {
        contributions: p.contributions ?? '—',
        repositories: p.publicRepos ?? 0,
        name: p.name || 'Chanon Thongduang',
        login: p.login || GITHUB_USER,
        avatarUrl: p.avatarUrl || `https://github.com/${GITHUB_USER}.png`,
        bio: p.bio || '',
        profileUrl: `https://github.com/${p.login || GITHUB_USER}`,
      };
    }
    try {
      const r = await fetch('data/ozonz-profile.json');
      if (r.ok) {
        const d = await r.json();
        if (d && d.profile) {
          let avatar =
            d.profile.profileImage || 'https://avatars.githubusercontent.com/u/255675901?v=4';
          if (avatar.startsWith('/images/')) {
            avatar = 'https://avatars.githubusercontent.com/u/255675901?v=4';
          }
          return {
            contributions: '—',
            repositories: d.profile.stats?.projects || 0,
            name: d.profile.name || 'Chanon Thongduang',
            login: d.profile.handle || GITHUB_USER,
            avatarUrl: avatar,
            bio: d.profile.bio || '',
            profileUrl: `https://github.com/${d.profile.handle || GITHUB_USER}`,
          };
        }
      }
    } catch (_) {}
    return null;
  }, [settings]);

  const syncGitHub = useCallback(async () => {
    const t = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('ghToken') : null;
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (t) headers['Authorization'] = `token ${t}`;

    let u: Record<string, unknown> = {};
    let profileFetched = false;

    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers });
      if (res.ok) {
        u = await res.json();
        profileFetched = true;
      }
    } catch (err) {
      console.warn('[GitHub sync] Profile fetch failed:', err);
    }

    if (!profileFetched) {
      const p = settings.githubProfile || {};
      u = {
        name: p.name || 'Chanon Thongduang',
        login: p.login || GITHUB_USER,
        avatar_url: p.avatarUrl || `https://github.com/${GITHUB_USER}.png`,
        bio: p.bio || '',
        public_repos: p.publicRepos ?? 50,
      };
    }

    let contributions: number | string | null = null;

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
            Authorization: `bearer ${t}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, variables: { username: GITHUB_USER } }),
        });
        if (gqlRes.ok) {
          const gqlData = await gqlRes.json();
          const total =
            gqlData.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions;
          if (total !== undefined) contributions = total;
        }
      } catch (err) {
        console.warn('[GitHub sync] GraphQL error:', err);
      }
    }

    if (contributions === null) {
      try {
        const cr = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}`);
        if (cr.ok) {
          const cal = await cr.json();
          if (cal.total) {
            contributions = Object.values(cal.total as Record<string, number>).reduce(
              (sum, v) => sum + (v || 0),
              0
            );
          }
        }
      } catch (_) {}
    }

    if (contributions === null) {
      try {
        const cr = await fetch(`https://github-contributions-api.deno.dev/${GITHUB_USER}.json`);
        if (cr.ok) {
          const cal = await cr.json();
          let count = 0;
          if (Array.isArray(cal.contributions)) {
            for (const week of cal.contributions) {
              if (Array.isArray(week)) {
                for (const day of week) {
                  count += (day?.contributionCount as number) || 0;
                }
              }
            }
          }
          contributions = count;
        }
      } catch (_) {}
    }

    if (contributions === null && settings.githubProfile?.contributions !== undefined) {
      contributions = settings.githubProfile.contributions;
    }

    const finalContribs = contributions ?? lastContributionsRef.current ?? '—';
    lastContributionsRef.current = finalContribs;

    setStats({
      contributions: finalContribs,
      repositories: (u.public_repos as number) ?? 0,
      name: (u.name as string) || (u.login as string) || 'Chanon Thongduang',
      login: (u.login as string) || GITHUB_USER,
      avatarUrl:
        (u.avatar_url as string) || 'https://avatars.githubusercontent.com/u/255675901?v=4',
      bio: (u.bio as string) || '',
      profileUrl: `https://github.com/${(u.login as string) || GITHUB_USER}`,
    });

    setHasLoaded(true);
    triggerLivePulse();
  }, [settings, triggerLivePulse]);

  useEffect(() => {
    fetchFallbackProfile().then((fb) => {
      if (fb) {
        setStats((prev) => ({ ...prev, ...fb }));
        setHasLoaded(true);
      }
      syncGitHub();
    });

    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        syncGitHub();
      }
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [fetchFallbackProfile, syncGitHub]);

  return { stats, isLivePulsing, hasLoaded };
}
