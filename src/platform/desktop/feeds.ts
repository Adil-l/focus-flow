import type { BlockerCategory } from '@/stores/pomodoroStore';

// Maintained, public, keyless blocklist feeds for "deep mode" — the way Pi-hole /
// AdGuard / uBlock get real coverage instead of a hand-written list. The desktop
// app downloads these, merges them with the curated list, and applies them to
// /etc/hosts (Rust: block_apply_feeds). The browser extension stays curated
// (declarativeNetRequest can't hold hundreds of thousands of rules).
//
// Every URL here was verified live (HTTP 200, hosts/domain format). Only hosts on
// the Rust allow-list (raw.githubusercontent.com, urlhaus.abuse.ch, pgl.yoyo.org)
// are accepted, so this list and that list must stay in sync.

export type FeedTier = 'balanced' | 'max';

// Sources (single definition so a URL is never duplicated/mistyped).
const SB = 'https://raw.githubusercontent.com/StevenBlack/hosts/master';
const HAGEZI = 'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/hosts';
const BLP = 'https://raw.githubusercontent.com/blocklistproject/Lists/master';

const F = {
  sbBase: `${SB}/hosts`,                       // StevenBlack unified: ads + malware (~84k)
  sbPorn: `${SB}/alternates/porn/hosts`,       // ~167k
  sbGambling: `${SB}/alternates/gambling/hosts`, // ~97k
  hageziLight: `${HAGEZI}/light.txt`,          // ads/tracking, balanced (~92k)
  hageziPro: `${HAGEZI}/pro.txt`,              // ads/tracking, large (~507k)
  hageziTif: `${HAGEZI}/tif.txt`,              // threat intelligence (malware/phishing/scam, large)
  blpPorn: `${BLP}/porn.txt`,                  // ~500k
  blpMalware: `${BLP}/malware.txt`,            // ~435k
  blpPhishing: `${BLP}/phishing.txt`,          // ~190k
  blpPiracy: `${BLP}/piracy.txt`,              // ~2k (the only real piracy feed)
  urlhaus: 'https://urlhaus.abuse.ch/downloads/hostfile/', // live malware hosts (fresh)
  peterlowe: 'https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=0&mimetype=plaintext', // ads (~3.5k)
} as const;

// Per category, per tier. Only feeds for ENABLED categories get downloaded.
// Distracting has no feed (the curated social list is the point there).
const FEEDS: Record<BlockerCategory, Record<FeedTier, string[]>> = {
  distracting: { balanced: [], max: [] },
  ads: {
    balanced: [F.hageziLight, F.peterlowe],
    max: [F.hageziPro, F.peterlowe, F.sbBase],
  },
  gambling: {
    balanced: [F.sbGambling],
    max: [F.sbGambling],
  },
  adult: {
    balanced: [F.sbPorn],
    max: [F.sbPorn, F.blpPorn],
  },
  piracy: {
    balanced: [F.blpPiracy],
    max: [F.blpPiracy],
  },
  threat: {
    balanced: [F.sbBase, F.urlhaus],
    max: [F.hageziTif, F.blpMalware, F.blpPhishing, F.urlhaus],
  },
};

// The deduplicated set of feed URLs to download for the enabled categories.
export function feedUrlsFor(cats: Partial<Record<BlockerCategory, boolean>>, tier: FeedTier): string[] {
  const set = new Set<string>();
  (Object.keys(FEEDS) as BlockerCategory[]).forEach((k) => {
    if (cats[k]) FEEDS[k][tier].forEach((u) => set.add(u));
  });
  return [...set];
}
