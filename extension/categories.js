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
  // Ad / pop-under / redirect / tracker networks. Unlike the other categories
  // (a tight list of *tempting* sites you'd type), the ad list earns its keep by
  // breadth: it blocks the infrastructure that serves betting / adult / junk ads
  // and pop-unders as page sub-resources. Still well within the DNR rule budget.
  ads: {
    label: 'Ads / Pop-ups',
    domains: [
      '2mdn.net', '33across.com', '3lift.com', 'aax.media', 'acuityads.com',
      'ad-maven.com', 'adamoads.com', 'adblade.com', 'adcash.com', 'adcolony.com',
      'adelphic.com', 'adexchangeprediction.com', 'adextrem.com', 'adforcast.com', 'adform.net',
      'adform.ru', 'adgear.com', 'adgrx.com', 'adition.com', 'adk2.com',
      'admaven.com', 'adnium.com', 'adnow.com', 'adnxs-simple.com', 'adnxs.com',
      'adnxs.net', 'adroll.com', 'adsafeprotected.com', 'adscore.com', 'adsexo.com',
      'adsformarket.com', 'adskeeper.co.uk', 'adskeeper.com', 'adsmatemedia.com', 'adspyglass.com',
      'adsrvr.com', 'adsrvr.org', 'adsterra.com', 'adsterraserver.com', 'adsterratech.com',
      'adsupply.com', 'adsupplyads.com', 'adsupplyads.net', 'adsupplyssl.com', 'adswizz.com',
      'adsymptotic.com', 'adtelligent.com', 'adtheorent.com', 'adtng.com', 'advertising.com',
      'adxserve.com', 'adxxx.com', 'agkn.com', 'amazon-adsystem.com', 'amobee.com',
      'aniview.com', 'applovin.com', 'appnexus.com', 'aqfer.com', 'bidr.io',
      'bidswitch.net', 'bidvertiser.com', 'bluekai.com', 'bullionyield.com', 'casalemedia.com',
      'chartbeat.com', 'chartbeat.net', 'chartboost.com', 'clickadilla.com', 'clickadilla.net',
      'clickadu.com', 'clickadu.net', 'clickaine.com', 'clickdaly.com', 'clickpapa.com',
      'clksite.com', 'content.ad', 'contentabc.com', 'contextweb.com', 'cpx24.com',
      'crakrevenue.com', 'criteo.com', 'criteo.net', 'crwdcntrl.net', 'demdex.net',
      'dianomi.com', 'districtm.ca', 'districtm.io', 'doubleclick.com', 'doubleclick.net',
      'doublepimp.com', 'doubleverify.com', 'dpinteractive.com', 'eabids.com', 'effectivecreativeformats.com',
      'engageya.com', 'ero-advertising.com', 'eroadvertising.com', 'etology.com', 'evadav.com',
      'evadavdsp.pro', 'everesttech.net', 'exads.com', 'exdynsrv.com', 'exelator.com',
      'exoclick.com', 'exosrv.com', 'exoticads.com', 'exv6.com', 'eyeota.net',
      'fullstory.com', 'galaksion.com', 'gammassp.com', 'google-analytics.com', 'googleadservices.com',
      'googlesyndication.com', 'googletagservices.com', 'gumgum.com', 'highperformanceformat.com', 'hilltopads.com',
      'hilltopads.net', 'hotjar.com', 'illumin.com', 'improvedigital.com', 'indexww.com',
      'infolinks.com', 'inmobi.com', 'ipredictive.com', 'jediads.com', 'juicyads.com',
      'juicyads.in', 'juicyads.me', 'kadam.net', 'krxd.net', 'lijit.com',
      'magsrv.com', 'mathtag.com', 'media.net', 'mediaxx.net', 'mgid.com',
      'moatads.com', 'mobfox.com', 'monetag.com', 'monetixads.com', 'mopub.com',
      'mouseflow.com', 'mybetterdeals.com', 'mybid.io', 'nativo.com', 'onclckds.com',
      'onclicka.com', 'onclickaclk.com', 'onclickads.net', 'onclickalgo.com', 'openx.net',
      'optnx.com', 'orbsrv.com', 'outbrain.com', 'peerclick.com', 'plista.com',
      'plugrush.com', 'pnperf.com', 'polluxnetwork.com', 'popads.media', 'popads.net',
      'popca.sh', 'popcash.net', 'popmyads.com', 'poprtb.pro', 'poptm.com',
      'popunder.bid', 'popunder.com', 'popunder.net', 'popunder.ru', 'propellerads.com',
      'propellerads.tech', 'propellerpops.com', 'propu.sh', 'pubmatic.com', 'pubmine.com',
      'push.house', 'quantcount.com', 'quantserve.com', 'realsrv.com', 'realsrvcdn.com',
      'revcontent.com', 'revjet.com', 'revopush.com', 'richads.com', 'rivertraffic.com',
      'rlcdn.com', 'royalads.net', 'rubiconproject.com', 'scorecardresearch.com', 'serving-sys.com',
      'sharethrough.com', 'slimspots.com', 'smaato.com', 'smac-ad.com', 'smartadserver.com',
      'smartadserver.de', 'smartclip.net', 'smartstream.tv', 'sonobi.com', 'sovrn.com',
      'spotx.tv', 'spotxchange.com', 'star-advertising.com', 'startapp.com', 'stickyadstv.com',
      'taboola.com', 'tapad.com', 'teads.com', 'teads.tv', 'trafficfactory.biz',
      'trafficfactory.com', 'trafficforce.com', 'traffichaus.com', 'traffichouse.com', 'traffichunt.com',
      'trafficjunky.com', 'trafficjunky.net', 'trafficreps.com', 'trafficshop.com', 'trafficstars.com',
      'triplelift.com', 'tsyndicate.com', 'tsyndicate.net', 'tubecorporate.com', 'twinred.com',
      'tynt.com', 'viantinc.com', 'viglink.com', 'vungle.com', 'yieldlab.net',
      'yieldmo.com', 'youradexchange.com', 'zedo.com', 'zergnet.com', 'zeropark.com',
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
