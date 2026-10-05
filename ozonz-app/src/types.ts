export interface Contributor {
  name: string;
  avatar?: string;
  url?: string;
}

export interface Work {
  id?: string | number;
  title?: string;
  name?: string;
  tagline?: string;
  aiSummary?: string;
  desc?: string;
  description?: string;
  detail?: string;
  image?: string | string[];
  images?: string[];
  thumbnail?: string;
  link?: string;
  links?: { label?: string; url: string }[];
  model?: string;
  tags?: string | string[];
  categories?: string[];
  cat?: string;
  subcat?: string;
  year?: string | number;
  date?: string;
  team?: string[];
  contributors?: Contributor[];
}

export interface Social {
  name: string;
  link: string;
  iconType?: 'svg' | 'image' | 'material';
  iconVal?: string;
  iconId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  image?: string;
  iconId?: string;
  url?: string;
  link?: string;
}

export interface Settings {
  socials?: Social[];
  icons?: { id: string; url: string }[];
  teams?: TeamMember[];
  sounds?: unknown[];
  githubProfile?: {
    name?: string;
    login?: string;
    avatarUrl?: string;
    bio?: string;
    publicRepos?: number;
    contributions?: number | string;
  };
}

export interface GitHubStats {
  contributions: number | string;
  repositories: number | string;
  name: string;
  login: string;
  avatarUrl: string;
  bio: string;
  profileUrl: string;
}

export type WorkFilterType = 'all' | 'games' | 'website' | 'other';
