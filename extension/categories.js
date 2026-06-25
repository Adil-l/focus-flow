// Curated, high-impact domain lists per category. For a focus / self-control
// blocker, a tight list of the *tempting* sites beats a 260k-domain dump:
// it stays well within declarativeNetRequest limits and covers what actually
// derails people. Users extend it with their personal block list, and the
// desktop (DNS) track handles the exhaustive HaGeZi lists + wildcards.

export const CATEGORIES = {
  distracting: {
    label: 'Distracting / Social',
    domains: [
      'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'facebook.com',
      'reddit.com', 'youtube.com', 'twitch.tv', 'netflix.com', 'pinterest.com',
      '9gag.com', 'tumblr.com', 'snapchat.com', 'whatsapp.com', 'telegram.org',
      'discord.com', 'linkedin.com', 'quora.com', 'buzzfeed.com', 'imgur.com',
      'primevideo.com', 'hulu.com', 'disneyplus.com',
    ],
  },
  gambling: {
    label: 'Gambling / Bets',
    domains: [
      'bet365.com', 'betano.com', 'betano.pt', 'betway.com', '1xbet.com',
      'bwin.com', 'pokerstars.com', 'stake.com', 'draftkings.com', 'fanduel.com',
      'williamhill.com', 'betfair.com', '888casino.com', '888sport.com',
      'ladbrokes.com', 'unibet.com', 'betclic.com', 'sportingbet.com',
      'betsson.com', 'parimatch.com', 'melbet.com', '22bet.com', 'pinnacle.com',
      'blaze.com', 'sportradar.com', 'casino.com', 'pokerstarscasino.com',
      'leovegas.com', 'rivalo.com', 'kto.com', 'estrelabet.com',
    ],
  },
  adult: {
    label: 'Adult / NSFW',
    domains: [
      'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
      'youporn.com', 'onlyfans.com', 'chaturbate.com', 'brazzers.com',
      'spankbang.com', 'eporner.com', 'tnaflix.com', 'youjizz.com', 'porn.com',
      'fapello.com', 'motherless.com', 'rule34.xxx', 'nhentai.net',
      'hanime.tv', 'stripchat.com', 'bongacams.com', 'cam4.com',
    ],
  },
  threat: {
    label: 'Malware / Phishing (seed)',
    // Threat domains are obscure and rotate constantly — a curated seed is only
    // a token here. The desktop/DNS track ingests the full HaGeZi TIF list.
    domains: [
      'malware-test.example', 'phishing-test.example',
    ],
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);
