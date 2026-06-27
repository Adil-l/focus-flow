import { useEffect, useRef } from 'react';
import { isTauri } from '@/platform';
import { applyBlockWithFeeds, effectiveDomains, feedUrlsFor } from '@/platform/desktop';
import { useSettings } from '@/stores/pomodoroStore';
import { effectiveBlockedCategories } from '@/lib/weaning';

const DAY = 24 * 60 * 60 * 1000;

// Deep mode auto-refresh (desktop only). When enabled, refreshes the maintained
// feeds shortly after launch and then daily — but only if it hasn't refreshed in
// the last 24h, so launches within a day don't re-download or re-prompt. The Rust
// side re-applies (and so prompts) only when a feed actually changed, so an
// unchanged daily check is silent. Offline/errors just retry next time.
export function useDeepBlocklistAutoRefresh() {
  const { settings, setSettings } = useSettings();
  // Keep the latest settings/setter in a ref so the timers (set up once) always
  // read current values without re-subscribing and tearing down the schedule.
  const ref = useRef({ settings, setSettings });
  ref.current = { settings, setSettings };

  useEffect(() => {
    if (!isTauri()) return;
    let running = false;

    const check = async () => {
      if (running) return;
      const { settings, setSettings } = ref.current;
      const deep = settings.deepBlocklist;
      if (!deep?.enabled) return;
      if (deep.lastRun && Date.now() - deep.lastRun < DAY) return; // refreshed recently
      const cfg = settings.blocker;
      const effCats = effectiveBlockedCategories(cfg.categories, settings.weaning);
      const feeds = feedUrlsFor(effCats, deep.tier);
      if (feeds.length === 0) return;
      const curated = effectiveDomains({ ...cfg, categories: effCats });
      running = true;
      try {
        const res = await applyBlockWithFeeds(curated, feeds);
        setSettings({ deepBlocklist: { ...deep, lastRun: Date.now(), lastCount: res.total } });
      } catch {
        /* offline / cancelled — try again on the next tick */
      } finally {
        running = false;
      }
    };

    const t = setTimeout(check, 4000);                  // a few seconds after launch
    const iv = setInterval(check, 6 * 60 * 60 * 1000);  // re-check every 6h while open
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);
}
