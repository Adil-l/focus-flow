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
    'williamhill.com', 'betfair.com', '888casino.com', '888sport.com', 'ladbrokes.com',
    'unibet.com', 'betclic.com', 'sportingbet.com', 'betsson.com', 'parimatch.com',
    'melbet.com', '22bet.com', 'pinnacle.com', 'blaze.com', 'casino.com',
    'leovegas.com', 'rivalo.com', 'kto.com', 'estrelabet.com', 'betano.com.br',
    'betano.bet.br', 'betfair.com.br', '888.com', '888poker.com', 'pokerstars.pt',
    'pokerstars.com.br', 'stake.bet.br', 'bovada.lv', 'betonline.ag', 'bwin.pt',
    'paddypower.com', 'betsafe.com', 'nordicbet.com', 'tipico.com', 'betclic.pt',
    'megapari.com', 'gamdom.com', 'roobet.com', 'duelbits.com', 'rollbit.com',
    'bc.game', 'sportsbet.io', 'cloudbet.com', 'mystake.com', 'mrgreen.com',
    'casumo.com', 'rizk.com', 'sbobet.com', 'dafabet.com', 'caesars.com',
    'betmgm.com', 'borgataonline.com', 'hardrock.bet', 'espnbet.com', 'pointsbet.com',
    'sisal.it', 'snai.it', 'eurobet.it', 'goldbet.it', 'lottomatica.it',
    'sportingbet.bet.br', 'codere.es', 'luckia.pt', 'solverde.pt', 'placard.pt',
    'esc-online.pt', 'casinoportugal.pt', 'nossaaposta.pt', 'bacanaplay.pt', 'goldenpark.pt',
    'lebull.pt', 'bidluck.pt', 'moosh.pt', 'betnacional.com', 'betnacional.bet.br',
    'estrelabet.bet.br', 'blaze.bet.br', 'kto.bet.br', 'superbet.com', 'superbet.bet.br',
    'superbet.ro', 'bet7k.com', 'bet7k.bet.br', 'reidopitaco.bet.br', 'brazino777.com',
    'pixbet.com', 'pixbet.bet.br', 'vaidebet.bet.br', 'hollywoodbets.com', 'sportybet.com',
    'bet9ja.com', 'caliente.mx', 'stoiximan.gr', 'chumbacasino.com', 'vbet.com',
    'wazamba.com',
  ],
  adult: [
    'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
    'youporn.com', 'onlyfans.com', 'chaturbate.com', 'brazzers.com', 'spankbang.com',
    'eporner.com', 'tnaflix.com', 'youjizz.com', 'porn.com', 'fapello.com',
    'motherless.com', 'rule34.xxx', 'nhentai.net', 'hanime.tv', 'stripchat.com',
    'bongacams.com', 'cam4.com', 'xhamsterlive.com', 'tube8.com', 'txxx.com',
    'hclips.com', 'upornia.com', 'hqporner.com', 'porntrex.com', 'porn300.com',
    'sex.com', 'xxx.com', 'beeg.com', 'drtuber.com', 'nuvid.com',
    'sunporno.com', '4tube.com', 'porndig.com', 'pornone.com', 'fapvid.com',
    'porngo.com', 'thumbzilla.com', 'keezmovies.com', 'extremetube.com', '3movs.com',
    'gotporn.com', 'sexvid.xxx', 'porn555.com', 'fuq.com', 'pornhd.com',
    'analdin.com', 'vjav.com', 'spankwire.com', 'empflix.com', 'slutload.com',
    'ixxx.com', 'elephanttube.com', 'camwhores.tv', 'javhd.com', 'jav.guru',
    'javmost.com', 'javdoe.com', 'missav.com', 'hentaihaven.xxx', 'hentai2read.com',
    'hentaifox.com', 'e-hentai.org', 'hentaicity.com', 'luscious.net', 'multporn.net',
    'rule34video.com', 'gelbooru.com', 'e621.net', 'sankakucomplex.com', 'pornpics.com',
    'imagefap.com', 'fapality.com', 'livejasmin.com', 'camsoda.com', 'myfreecams.com',
    'jerkmate.com', 'flirt4free.com', 'imlive.com', 'streamate.com', 'xlovecam.com',
    'fansly.com', 'manyvids.com', 'clips4sale.com', 'coomer.su', 'kemono.su',
    'realitykings.com', 'naughtyamerica.com', 'bangbros.com', 'mofos.com', 'digitalplayground.com',
    'adulttime.com', 'blacked.com', 'tushy.com', 'vixen.com', 'deeper.com',
    'wicked.com', 'evilangel.com', 'metart.com', 'twistys.com', 'nubiles.net',
    'teamskeet.com', 'fakehub.com', 'adultfriendfinder.com', 'ashleymadison.com', 'fetlife.com',
    'literotica.com', 'theporndude.com',
  ],
  piracy: [
    // Torrent indexes, illegal movie/TV/anime/sports streaming, manga aggregators.
    // Researched from public anti-piracy references (TorrentFreak, USTR/MPA
    // notorious markets, Wikipedia). These rotate often — refresh periodically.
    'thepiratebay.org', '1337x.to', '1337x.st', 'yts.mx', 'yts.bz',
    'yts.am', 'yts.rs', 'torrentgalaxy.to', 'torrentgalaxy.mx', 'nyaa.si',
    'nyaa.land', 'limetorrents.lol', 'limetorrents.cc', 'torlock.com', 'eztv.re',
    'eztvx.to', 'magnetdl.com', 'glodls.to', 'torrentdownloads.pro', 'torrentfunk.com',
    'bitsearch.to', 'ext.to', 'rutracker.org', 'kickasstorrents.to', 'katcr.co',
    'rargb.to', 'rarbgmirror.org', 'skidrowreloaded.com', 'fitgirl-repacks.site', 'zooqle.com',
    'yourbittorrent.com', 'demonoid.is', 'tamilrockers.ws', 'tamilmv.cc', 'fmovies.to',
    'fmovies.co', 'fmoviesz.to', 'fmovies24.to', 'bflix.to', 'bflixhd.to',
    'sflix.to', 'sflix.ps', 'sflixhd.to', '123movies.net', '123moviesfree.net',
    'gomovies.sx', 'gomovies.gg', 'gostream.to', 'solarmovie.pe', 'solarmovies.to',
    'soap2day.day', 'soap2day.to', 'soap2dayx.to', 'putlocker.pe', 'primewire.mov',
    'primewire.li', 'watchseries.mx', 'watchserieshd.to', 'hdtoday.tv', 'hdtoday.cc',
    'flixhq.to', 'flixhq.click', 'losmovies.id', 'hurawatch.to', 'hurawatch.cc',
    'lookmovie.io', 'lookmovie2.to', 'flixtor.to', 'flixtor.se', 'yesmovies.ag',
    'yesmovies.mn', 'movies123.net', '0123movie.net', 'cuevana3.io', 'pelisplus.to',
    'hianime.to', 'hianime.nz', 'aniwave.to', 'aniwave.se', '9anime.to',
    '9animetv.to', 'gogoanime.by', 'gogoanime.tel', 'gogoanimes.fi', 'animekai.to',
    'animesuge.to', 'animeflix.to', 'animepahe.ru', 'zoro.to', 'zorox.to',
    'aniwatch.to', 'kissanime.com.ru', 'animixplay.to', 'streameast.is', 'streameast.live',
    'streameast.to', 'streameast.app', 'crackstreams.me', 'crackstreams.biz', 'crackstreams.io',
    'methstreams.com', 'buffstreams.app', 'buffstreams.sx', 'sportsurge.net', 'sportsurge.club',
    'vipbox.lc', 'vipleague.im', 'totalsportek.com', 'streamed.su', 'soccerstreams.net',
    'nbastreams.to', 'mangakakalot.com', 'manganato.com', 'chapmanganato.to', 'manganelo.com',
    'manganelo.tv', 'mangakakalot.tv', 'mangafire.to', 'mangapark.net', 'mangabuddy.com',
    'mangareader.to', 'vegamovies.to', 'hdhub4u.tv', 'movierulz.vc', 'filmywap.com',
    'bolly4u.org',
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
