/**
 * Live wallpaper sources for the Home theme.
 *
 * Provider is chosen automatically from whichever API key is present:
 *   1. Unsplash  — set VITE_UNSPLASH_ACCESS_KEY  (full text search, attribution)
 *   2. Pexels    — set VITE_PEXELS_API_KEY        (full text search, attribution)
 *   3. Picsum    — no key needed (curated random photos, no text search)
 *
 * Picsum is the zero-config fallback so the feature works out of the box; add a
 * key to unlock keyword search. Image URLs are rendered via <img>, so there is
 * no CORS concern on display — only the JSON list endpoints need CORS, and all
 * three providers allow it.
 */

export type WallpaperProvider = 'unsplash' | 'pexels' | 'picsum';

export interface Wallpaper {
  id: string;
  thumb: string;
  full: string;
  author?: string;
  authorUrl?: string;
  source: WallpaperProvider;
}

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;
const PEXELS_KEY = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;

export const WALLPAPER_PROVIDER: WallpaperProvider = UNSPLASH_KEY
  ? 'unsplash'
  : PEXELS_KEY
    ? 'pexels'
    : 'picsum';

/** Whether the active provider supports keyword search (Picsum does not). */
export const WALLPAPER_SEARCH_ENABLED = WALLPAPER_PROVIDER !== 'picsum';

const PER_PAGE = 24;

/** Curated quick-pick topics surfaced as chips in the UI. */
export const WALLPAPER_TOPICS = [
  'Nature', 'Mountains', 'Ocean', 'Forest', 'City', 'Space',
  'Minimal', 'Lofi', 'Sunset', 'Rain', 'Desk', 'Abstract',
];

// --- Provider response shapes (only the fields we read) -------------------

interface UnsplashPhoto {
  id: string;
  urls: { small: string; regular?: string; full?: string };
  user?: { name?: string; links?: { html?: string } };
}
interface UnsplashSearch { results: UnsplashPhoto[] }

interface PexelsPhoto {
  id: number;
  src: { medium: string; large2x?: string; landscape?: string; original?: string };
  photographer?: string;
  photographer_url?: string;
}
interface PexelsResponse { photos: PexelsPhoto[] }

interface PicsumPhoto {
  id: string;
  author: string;
  url: string;
}

// --- Public API -----------------------------------------------------------

/**
 * Fetch a page of wallpapers. An empty query returns the provider's curated /
 * popular feed. Any provider error falls back to keyless Picsum so the grid
 * never ends up empty when the network or a key fails.
 */
export async function searchWallpapers(query: string, page = 1): Promise<Wallpaper[]> {
  try {
    if (WALLPAPER_PROVIDER === 'unsplash') return await fromUnsplash(query, page);
    if (WALLPAPER_PROVIDER === 'pexels') return await fromPexels(query, page);
    return await fromPicsum(page);
  } catch {
    if (WALLPAPER_PROVIDER !== 'picsum') {
      try { return await fromPicsum(page); } catch { /* ignore */ }
    }
    return [];
  }
}

async function fromUnsplash(query: string, page: number): Promise<Wallpaper[]> {
  const base = query.trim()
    ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape`
    : `https://api.unsplash.com/photos?order_by=popular`;
  const res = await fetch(`${base}&per_page=${PER_PAGE}&page=${page}&client_id=${UNSPLASH_KEY}`);
  if (!res.ok) throw new Error(`unsplash ${res.status}`);
  const data = (await res.json()) as UnsplashSearch | UnsplashPhoto[];
  const photos = Array.isArray(data) ? data : data.results;
  return photos.map((p) => ({
    id: p.id,
    thumb: p.urls.small,
    full: p.urls.regular ?? p.urls.full ?? p.urls.small,
    author: p.user?.name,
    authorUrl: p.user?.links?.html,
    source: 'unsplash' as const,
  }));
}

async function fromPexels(query: string, page: number): Promise<Wallpaper[]> {
  const url = query.trim()
    ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${PER_PAGE}&page=${page}`
    : `https://api.pexels.com/v1/curated?per_page=${PER_PAGE}&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY ?? '' } });
  if (!res.ok) throw new Error(`pexels ${res.status}`);
  const data = (await res.json()) as PexelsResponse;
  return (data.photos ?? []).map((p) => ({
    id: String(p.id),
    thumb: p.src.medium,
    full: p.src.landscape ?? p.src.large2x ?? p.src.original ?? p.src.medium,
    author: p.photographer,
    authorUrl: p.photographer_url,
    source: 'pexels' as const,
  }));
}

async function fromPicsum(page: number): Promise<Wallpaper[]> {
  const res = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${PER_PAGE}`);
  if (!res.ok) throw new Error(`picsum ${res.status}`);
  const data = (await res.json()) as PicsumPhoto[];
  return data.map((p) => ({
    id: p.id,
    thumb: `https://picsum.photos/id/${p.id}/400/250`,
    full: `https://picsum.photos/id/${p.id}/1920/1080`,
    author: p.author,
    authorUrl: p.url,
    source: 'picsum' as const,
  }));
}
