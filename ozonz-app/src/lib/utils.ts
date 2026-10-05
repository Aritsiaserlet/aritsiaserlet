import { Work, Social } from '../types';

export function safeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const u = String(url).trim();
  if (/^(https?:|\/|\.\/|data:image\/)/i.test(u)) return u;
  return '';
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export function parseSecureJSON(text: string | null): unknown {
  if (!text || typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(text))));
    } catch {
      return null;
    }
  }
}

export function normalizeWorks(data: unknown): Work[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Work[];
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.projects)) return obj.projects as Work[];
    if (Array.isArray(obj.works)) return obj.works as Work[];
    if (Array.isArray(obj.data)) return obj.data as Work[];
  }
  return [];
}

export function formatCount(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === '—' || n === '…') return (n as string) || '—';
  const num = typeof n === 'number' ? n : Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString();
}

export function getShortDescription(desc: string | undefined | null): string {
  if (!desc) return '';
  const sentences = desc.split(/[.!?]\s+/);
  if (sentences.length > 0 && sentences[0].length > 10) {
    let first = sentences[0].trim();
    if (!/[.!?]$/.test(first)) {
      first += '.';
    }
    if (first.length <= 120) {
      return first;
    }
  }
  if (desc.length <= 100) return desc;
  return desc.substring(0, 97) + '...';
}

export const itchContact: Social = {
  name: 'ITCH.IO',
  link: 'https://ozonz.itch.io',
  iconType: 'svg',
  iconVal:
    'M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.137 2.41 2.466 2.41h.024c1.33 0 2.466-1.102 2.466-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.106 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.62-2.082-2.99-3.13-3.612-3.253-.114-5.508-.134-8.87-.133-3.362 0-7.945.053-8.87.133zm6.376 6.477a2.74 2.74 0 0 1-.468.602c-.5.49-1.19.795-1.947.795a2.786 2.786 0 0 1-1.95-.795c-.182-.178-.32-.37-.446-.59-.127.222-.303.412-.486.59a2.788 2.788 0 0 1-1.95.795c-.092 0-.187-.025-.264-.052-.107 1.113-.152 2.176-.168 2.95v.005l-.006 1.167c.02 2.334-.23 7.564 1.03 8.85 1.952.454 5.545.662 9.15.663 3.605 0 7.198-.21 9.15-.664 1.26-1.284 1.01-6.514 1.03-8.848l-.006-1.167v-.004c-.016-.775-.06-1.838-.168-2.95-.077.026-.172.052-.263.052a2.788 2.788 0 0 1-1.95-.795c-.184-.178-.36-.368-.486-.59-.127.22-.265.412-.447.59a2.786 2.786 0 0 1-1.95.794c-.76 0-1.446-.303-1.948-.793a2.74 2.74 0 0 1-.468-.602 2.738 2.738 0 0 1-.463.602 2.787 2.787 0 0 1-1.95.794h-.16a2.787 2.787 0 0 1-1.95-.793 2.738 2.738 0 0 1-.464-.602zm-2.004 2.59v.002c.795.002 1.5 0 2.373.953.687-.072 1.406-.108 2.125-.107.72 0 1.438.035 2.125.107.873-.953 1.578-.95 2.372-.953.376 0 1.876 0 2.92 2.934l1.123 4.028c.832 2.995-.266 3.068-1.636 3.07-2.03-.075-3.156-1.55-3.156-3.025-1.124.184-2.436.276-3.748.277-1.312 0-2.624-.093-3.748-.277 0 1.475-1.125 2.95-3.156 3.026-1.37-.004-2.468-.077-1.636-3.072l1.122-4.027c1.045-2.934 2.545-2.934 2.92-2.934zM12 12.714c-.002.002-2.14 1.964-2.523 2.662l1.4-.056v1.22c0 .056.56.033 1.123.007.562.026 1.124.05 1.124-.008v-1.22l1.4.055C14.138 14.677 12 12.713 12 12.713z',
};

export const defaultContacts: Social[] = [
  {
    name: 'GITHUB',
    link: 'https://github.com/OzonZ',
    iconType: 'svg',
    iconVal:
      'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  },
  {
    name: 'FACEBOOK',
    link: 'https://www.facebook.com/chanon.thongduang?locale=th_TH',
    iconType: 'svg',
    iconVal:
      'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    name: 'DISCORD',
    link: 'https://discordapp.com/users/1018888909419204658',
    iconType: 'svg',
    iconVal:
      'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z',
  },
  itchContact,
  {
    name: 'HAMSTER HUB',
    link: 'https://hamsterhub.co/profile/eaya',
    iconType: 'image',
    iconVal:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAB52Gn30AfNgh_ZIaX0WiCP3ULKJO16YpMvDm_d6OFmYoLiJZuIz6kYU0dWjP51u9KSF3rz05OiTcd7jOstWfwOf0135M2Zdh_eIKUBhCTKP8e4gwhrc-Q16KdGIqe5Lh_IcxEm76bR3WiHWks33_7KBAGYy2gyAN-gDZwGt7KV6PmvsfJQrEvrdNCy_j0nHKudDfKnE5qgqy0nseuq0C3B3Jtc3NvA5MC3guzL2BHHWtOcJiF3TBuJqJcX3OZHKJCrTEngA-Xuc7A',
  },
];

export function ensureItchContact(socials: Social[] | undefined): Social[] {
  if (!Array.isArray(socials)) return [itchContact];
  const list = [...socials];
  const hasItch = list.some(
    (s) =>
      s &&
      s.name &&
      (s.name.toUpperCase() === 'ITCH.IO' || s.name.toUpperCase() === 'ITCHIO')
  );
  if (!hasItch) {
    const hamsterIdx = list.findIndex(
      (s) => s && s.name && s.name.toUpperCase() === 'HAMSTER HUB'
    );
    if (hamsterIdx >= 0) {
      list.splice(hamsterIdx, 0, itchContact);
    } else {
      list.push(itchContact);
    }
  }
  return list;
}
