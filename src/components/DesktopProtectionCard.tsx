import { useEffect, useState } from 'react';
import { Monitor, Loader2, Database, RefreshCw, Puzzle } from 'lucide-react';
import { toast } from 'sonner';
import type { BlockerConfig, DeepBlocklist } from '@/stores/pomodoroStore';
import { isTauri } from '@/platform';
import { effectiveDomains, feedUrlsFor } from '@/platform/desktop';
import { applyBlock, applyBlockWithFeeds, clearBlock, blockStatus, browserLockStatus, browserLockInstall, browserLockUninstall } from '@/platform/desktop';
import ReflectionGate from '@/components/ReflectionGate';
import { useSettings } from '@/stores/pomodoroStore';
import { useTranslation } from '@/lib/i18n';
import { effectiveBlockedCategories, pendingCategories } from '@/lib/weaning';

// Desktop-only card: applies the selected blocker config system-wide on this Mac
// by editing /etc/hosts (via the native admin prompt). Hidden in the web build.
// Any action that WEAKENS protection (Remove, an Apply that drops sites that are
// currently blocked, or turning Deep mode off) is routed through the reflection
// gate first. Deep mode additionally merges maintained public feeds (hundreds of
// thousands of domains) into the same block.
export default function DesktopProtectionCard({ cfg }: { cfg: BlockerConfig }) {
  const { t, language } = useTranslation();
  const isPt = language === 'pt';
  const [active, setActive] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [browserLock, setBrowserLock] = useState<boolean | null>(null);
  const [gateAction, setGateAction] = useState<null | 'remove' | 'apply' | 'disableDeep' | 'browserUnlock'>(null);
  const { settings, setSettings } = useSettings();
  const guardMode = settings.deactivateGuard;
  const cooldownMin = settings.deactivateCooldownMin;
  const deep = settings.deepBlocklist;

  useEffect(() => {
    if (!isTauri()) return;
    blockStatus().then(setActive).catch(() => setActive([]));
    browserLockStatus().then(setBrowserLock).catch(() => setBrowserLock(false));
  }, []);

  if (!isTauri()) return null;

  const effCats = effectiveBlockedCategories(cfg.categories, settings.weaning);
  const domains = effectiveDomains({ ...cfg, categories: effCats });
  const pending = pendingCategories(cfg.categories, settings.weaning);
  const count = active?.length ?? 0;

  const applyError = (e: unknown) => {
    const msg = String(e);
    if (msg.includes('cancelled')) toast(isPt ? 'Autorização cancelada.' : 'Authorization cancelled.');
    else toast.error(isPt ? `Não foi possível atualizar o bloqueio: ${msg}` : `Couldn't update blocking: ${msg}`);
  };

  // Curated-only apply (deep mode off).
  const doApply = async () => {
    setBusy(true);
    try {
      await applyBlock(domains);
      const s = await blockStatus();
      setActive(s);
      toast.success(isPt ? `A bloquear ${s.length} site${s.length === 1 ? '' : 's'} em todo o sistema neste Mac.` : `Blocking ${s.length} site${s.length === 1 ? '' : 's'} system-wide on this Mac.`);
    } catch (e) {
      applyError(e);
    } finally {
      setBusy(false);
    }
  };

  // Curated + maintained feeds. `enable` turns deep mode on; otherwise it keeps
  // the current enabled state (used for "update now" and tier changes).
  const doApplyDeep = async (tier: DeepBlocklist['tier'], enable: boolean) => {
    setBusy(true);
    try {
      const feeds = feedUrlsFor(effCats, tier);
      if (feeds.length === 0) {
        toast.error(isPt ? 'Nenhuma categoria com listas — ativa Apostas/Adulto/etc. primeiro.' : 'No category has feeds — enable Gambling/Adult/etc. first.');
        return;
      }
      const res = await applyBlockWithFeeds(domains, feeds);
      setSettings({ deepBlocklist: { enabled: enable || deep.enabled, tier, lastRun: Date.now(), lastCount: res.total } });
      const s = await blockStatus();
      setActive(s);
      if (res.errors.length > 0) {
        toast.warning(isPt
          ? `${res.total.toLocaleString()} domínios aplicados — ${res.errors.length} lista(s) falharam (tenta de novo mais tarde).`
          : `${res.total.toLocaleString()} domains applied — ${res.errors.length} list(s) failed (try again later).`);
      } else if (!res.applied) {
        toast.success(isPt ? `Já atualizado — ${res.total.toLocaleString()} domínios bloqueados.` : `Already up to date — ${res.total.toLocaleString()} domains blocked.`);
      } else {
        toast.success(isPt ? `A bloquear ${res.total.toLocaleString()} domínios em todo o sistema.` : `Blocking ${res.total.toLocaleString()} domains system-wide.`);
      }
    } catch (e) {
      applyError(e);
    } finally {
      setBusy(false);
    }
  };

  const doRemove = async () => {
    setBusy(true);
    try {
      await clearBlock();
      setActive([]);
      if (deep.enabled) setSettings({ deepBlocklist: { ...deep, enabled: false } });
      toast.success(isPt ? 'Bloqueio de todo o sistema removido.' : 'System-wide blocking removed.');
    } catch (e) {
      const msg = String(e);
      if (msg.includes('cancelled')) toast(isPt ? 'Autorização cancelada.' : 'Authorization cancelled.');
      else toast.error(isPt ? `Não foi possível remover o bloqueio: ${msg}` : `Couldn't remove blocking: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  // Turning deep mode off drops the feed domains -> a weakening -> reflect first.
  const doDisableDeep = async () => {
    setBusy(true);
    try {
      setSettings({ deepBlocklist: { ...deep, enabled: false } });
      await applyBlock(domains);
      const s = await blockStatus();
      setActive(s);
      toast.success(isPt ? 'Modo profundo desligado — voltou à lista curada.' : 'Deep mode off — back to the curated list.');
    } catch (e) {
      applyError(e);
    } finally {
      setBusy(false);
    }
  };

  // Browser lock: the app force-installs the companion extension into every
  // Chromium browser, so pop-ups/ads are handled inside the browser (which the
  // hosts blocker can't do) without the user installing anything by hand.
  const doBrowserLockInstall = async () => {
    setBusy(true);
    try {
      await browserLockInstall();
      setBrowserLock(true);
      toast.success(isPt
        ? 'Extensão instalada em todos os browsers Chromium. Fecha e reabre o Chrome/Brave/Edge para ativar.'
        : 'Extension installed across Chromium browsers. Fully quit and reopen Chrome/Brave/Edge to activate.');
    } catch (e) {
      applyError(e);
    } finally {
      setBusy(false);
    }
  };

  const doBrowserLockUninstall = async () => {
    setBusy(true);
    try {
      await browserLockUninstall();
      setBrowserLock(false);
      toast.success(isPt ? 'Bloqueio no browser removido.' : 'Browser lock removed.');
    } catch (e) {
      applyError(e);
    } finally {
      setBusy(false);
    }
  };

  // Apply directly when strengthening; reflect first when it would drop sites
  // that are currently blocked (a weakening). Deep refresh only adds -> no gate.
  const requestApply = () => {
    if (deep.enabled) { void doApplyDeep(deep.tier, false); return; }
    if (domains.length === 0) {
      toast.error(isPt ? 'Nada para bloquear — ativa uma categoria ou adiciona um domínio primeiro.' : 'Nothing to block — enable a category or add a domain first.');
      return;
    }
    const next = new Set(domains);
    const weakens = (active ?? []).some((d) => !next.has(d));
    if (weakens && guardMode !== 'off') setGateAction('apply');
    else void doApply();
  };

  const onGateConfirm = () => {
    const action = gateAction;
    setGateAction(null);
    if (action === 'remove') void doRemove();
    else if (action === 'apply') void doApply();
    else if (action === 'disableDeep') void doDisableDeep();
    else if (action === 'browserUnlock') void doBrowserLockUninstall();
  };

  const tierBtn = (tier: DeepBlocklist['tier'], label: string) => (
    <button
      onClick={() => { if (tier !== deep.tier || !deep.enabled) void doApplyDeep(tier, deep.enabled); }}
      disabled={busy}
      className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors disabled:opacity-50 ${
        deep.tier === tier ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/60'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
      <div className="flex items-center gap-2">
        <Monitor size={16} className="text-violet-300" />
        <div className="text-[13px] font-bold text-white">{isPt ? 'Bloqueio em todo o sistema (este Mac)' : 'System-wide blocking (this Mac)'}</div>
      </div>
      <p className="text-[11px] leading-relaxed text-white/60">
        {isPt
          ? <>Bloqueia os sites escolhidos em <span className="font-semibold text-white/80">todos os navegadores</span> editando o ficheiro hosts do teu Mac. O macOS pede a password de admin — nada muda sem ela, e enfraquecer pede primeiro uma pausa para refletir.</>
          : <>Blocks the selected sites in <span className="font-semibold text-white/80">every browser</span> by editing your Mac's hosts file. macOS asks for your admin password — nothing changes without it, and weakening it first asks you to pause and reflect.</>}
      </p>
      <div className="text-[11px] text-white/50">
        {count > 0 ? (
          <span className="font-semibold text-violet-300">● {isPt ? `Ativo — ${count.toLocaleString()} site${count === 1 ? '' : 's'} bloqueado${count === 1 ? '' : 's'}` : `Active — ${count.toLocaleString()} site${count === 1 ? '' : 's'} blocked`}</span>
        ) : (
          <span>○ {isPt ? 'Inativo' : 'Not active'}</span>
        )}
        {' · '}
        {deep.enabled
          ? (isPt ? 'modo profundo (feeds)' : 'deep mode (feeds)')
          : (isPt ? `${domains.length} escolhidos` : `${domains.length} selected`)}
      </div>
      {pending.length > 0 && (
        <div className="text-[11px] text-amber-300/80">
          {isPt
            ? `${pending.length} categoria(s) agendada(s) (faseamento) — reaplica quando ativarem.`
            : `${pending.length} category(ies) scheduled (weaning) — re-apply once they activate.`}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={requestApply}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-600 py-2.5 text-[12px] font-bold text-white disabled:opacity-50"
        >
          {busy && <Loader2 size={13} className="animate-spin" />} {isPt ? 'Aplicar / atualizar bloqueio' : 'Apply / update block'}
        </button>
        {count > 0 && (
          <button
            onClick={() => (guardMode === 'off' ? void doRemove() : setGateAction('remove'))}
            disabled={busy}
            className="rounded-lg bg-white/10 px-4 py-2.5 text-[12px] font-bold text-white/70 disabled:opacity-50"
          >
            {isPt ? 'Remover' : 'Remove'}
          </button>
        )}
      </div>

      {/* Deep mode: maintained public feeds (hundreds of thousands of domains). */}
      <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Database size={14} className="mt-0.5 shrink-0 text-violet-300" />
            <div>
              <div className="text-[12px] font-bold text-white">{isPt ? 'Modo profundo — listas mantidas' : 'Deep mode — maintained feeds'}</div>
              <p className="text-[10.5px] leading-relaxed text-white/50">
                {isPt
                  ? 'Transfere listas públicas atualizadas (StevenBlack, Hagezi, blocklistproject, URLhaus) — centenas de milhares de domínios por categoria, em vez de uma lista fixa. Atualiza ao abrir e diariamente.'
                  : 'Downloads maintained public lists (StevenBlack, Hagezi, blocklistproject, URLhaus) — hundreds of thousands of domains per category instead of a fixed list. Refreshes on launch and daily.'}
              </p>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={deep.enabled}
            onClick={() => {
              if (busy) return;
              if (!deep.enabled) { void doApplyDeep(deep.tier, true); return; }
              if (guardMode === 'off') void doDisableDeep();
              else setGateAction('disableDeep');
            }}
            disabled={busy}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${deep.enabled ? 'bg-violet-600' : 'bg-white/20'}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${deep.enabled ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        </div>

        {deep.enabled && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-white/40">{isPt ? 'Cobertura' : 'Coverage'}</span>
              {tierBtn('balanced', isPt ? 'Equilibrado' : 'Balanced')}
              {tierBtn('max', isPt ? 'Máximo' : 'Maximum')}
            </div>
            {deep.tier === 'max' && (
              <p className="text-[10px] text-amber-300/70">{isPt ? '⚠ Máximo (1M+): cobertura quase total, mas pode abrandar o DNS do Mac.' : '⚠ Maximum (1M+): near-total coverage, but may slow your Mac\'s DNS.'}</p>
            )}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[10.5px] text-white/45">
                {deep.lastRun
                  ? (isPt ? `Atualizado ${new Date(deep.lastRun).toLocaleDateString()} · ${(deep.lastCount ?? 0).toLocaleString()} domínios` : `Updated ${new Date(deep.lastRun).toLocaleDateString()} · ${(deep.lastCount ?? 0).toLocaleString()} domains`)
                  : (isPt ? 'Ainda não atualizado' : 'Not updated yet')}
              </span>
              <button
                onClick={() => { if (!busy) void doApplyDeep(deep.tier, false); }}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/80 disabled:opacity-50"
              >
                {busy ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />} {isPt ? 'Atualizar agora' : 'Update now'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Browser lock: the app installs the companion extension itself. */}
      <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Puzzle size={14} className="mt-0.5 shrink-0 text-violet-300" />
            <div>
              <div className="text-[12px] font-bold text-white">{isPt ? 'Bloqueio no browser (fecha pop-ups)' : 'Browser lock (closes pop-ups)'}</div>
              <p className="text-[10.5px] leading-relaxed text-white/50">
                {isPt
                  ? 'O ficheiro hosts não consegue fechar pop-ups. A app instala a extensão companheira em todos os browsers Chromium (Chrome/Brave/Edge) automaticamente — fecha pop-unders e limpa anúncios na página. Não instalas nada à mão.'
                  : "The hosts file can't close pop-ups. The app force-installs the companion extension into every Chromium browser (Chrome/Brave/Edge) — it closes pop-unders and cleans on-page ads. You install nothing by hand."}
              </p>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={!!browserLock}
            onClick={() => {
              if (busy) return;
              if (!browserLock) { void doBrowserLockInstall(); return; }
              if (guardMode === 'off') void doBrowserLockUninstall();
              else setGateAction('browserUnlock');
            }}
            disabled={busy || browserLock === null}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${browserLock ? 'bg-violet-600' : 'bg-white/20'}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${browserLock ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        </div>
        {browserLock && (
          <p className="text-[10.5px] font-semibold text-violet-300/80">
            {isPt ? '🔒 Ativo — fecha e reabre o browser para apanhar a extensão.' : '🔒 Active — quit and reopen your browser to pick up the extension.'}
          </p>
        )}
        <p className="text-[10px] text-white/30">{isPt ? 'Não cobre o Safari (precisa de extensão própria).' : 'Does not cover Safari (needs its own extension).'}</p>
      </div>

      {gateAction && (
        <ReflectionGate
          mode={guardMode === 'confirm' ? 'confirm' : 'reflect'}
          cooldownMin={cooldownMin}
          onConfirm={onGateConfirm}
          onCancel={() => setGateAction(null)}
        />
      )}
    </div>
  );
}
