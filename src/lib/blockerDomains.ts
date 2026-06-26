import type { BlockerConfig, BlockerCategory } from '@/stores/pomodoroStore';

// Curated, high-impact domain lists per category — mirrors the browser
// extension's list so the desktop hosts-blocker blocks the same sites.
export const CATEGORY_DOMAINS: Record<BlockerCategory, string[]> = {
  distracting: [
    'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'facebook.com',
    'reddit.com', 'youtube.com', 'twitch.tv', 'netflix.com', 'pinterest.com',
    '9gag.com', 'tumblr.com', 'snapchat.com', 'whatsapp.com', 'telegram.org',
    'discord.com', 'linkedin.com', 'quora.com', 'buzzfeed.com', 'imgur.com',
    'primevideo.com', 'hulu.com', 'disneyplus.com',
  ],
  gambling: [
    'bet365.com', 'betano.com', 'betano.pt', 'betway.com', '1xbet.com',
    'bwin.com', 'pokerstars.com', 'stake.com', 'draftkings.com', 'fanduel.com',
    'williamhill.com', 'betfair.com', '888casino.com', '888sport.com',
    'ladbrokes.com', 'unibet.com', 'betclic.com', 'sportingbet.com',
    'betsson.com', 'parimatch.com', 'melbet.com', '22bet.com', 'pinnacle.com',
    'blaze.com', 'casino.com', 'leovegas.com', 'rivalo.com', 'kto.com',
    'estrelabet.com',
  ],
  adult: [
    'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
    'youporn.com', 'onlyfans.com', 'chaturbate.com', 'brazzers.com',
    'spankbang.com', 'eporner.com', 'tnaflix.com', 'youjizz.com', 'porn.com',
    'fapello.com', 'motherless.com', 'rule34.xxx', 'nhentai.net',
    'hanime.tv', 'stripchat.com', 'bongacams.com', 'cam4.com',
  ],
  threat: [
    'malware-test.example', 'phishing-test.example',
  ],
};

const norm = (d: string) =>
  d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

// Compute the effective domain list from a blocker config: enabled categories +
// personal blocks, minus the allow list.
export function effectiveDomains(cfg: BlockerConfig): string[] {
  const set = new Set<string>();
  (Object.keys(CATEGORY_DOMAINS) as BlockerCategory[]).forEach((k) => {
    if (cfg.categories?.[k]) CATEGORY_DOMAINS[k].forEach((d) => set.add(norm(d)));
  });
  (cfg.personalBlock || []).forEach((d) => { const n = norm(d); if (n.includes('.')) set.add(n); });
  (cfg.personalAllow || []).forEach((d) => set.delete(norm(d)));
  set.delete('');
  return [...set];
}
