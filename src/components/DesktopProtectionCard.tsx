import { useEffect, useState } from 'react';
import { Monitor, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BlockerConfig } from '@/stores/pomodoroStore';
import { isTauri } from '@/platform';
import { effectiveDomains } from '@/platform/desktop';
import { applyBlock, clearBlock, blockStatus } from '@/platform/desktop';
import ReflectionGate from '@/components/ReflectionGate';
import { useSettings } from '@/stores/pomodoroStore';
import { useTranslation } from '@/lib/i18n';
import { effectiveBlockedCategories, pendingCategories } from '@/lib/weaning';

// Desktop-only card: applies the selected blocker config system-wide on this Mac
// by editing /etc/hosts (via the native admin prompt). Hidden in the web build.
// Any action that WEAKENS protection (Remove, or an Apply that drops sites that
// are currently blocked) is routed through the reflection gate first.
export default function DesktopProtectionCard({ cfg }: { cfg: BlockerConfig }) {
  const { t, language } = useTranslation();
  const isPt = language === 'pt';
  const [active, setActive] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [gateAction, setGateAction] = useState<null | 'remove' | 'apply'>(null);
  const { settings } = useSettings();
  const guardMode = settings.deactivateGuard;
  const cooldownMin = settings.deactivateCooldownMin;

  useEffect(() => {
    if (!isTauri()) return;
    blockStatus().then(setActive).catch(() => setActive([]));
  }, []);

  if (!isTauri()) return null;

  const effCats = effectiveBlockedCategories(cfg.categories, settings.weaning);
  const domains = effectiveDomains({ ...cfg, categories: effCats });
  const pending = pendingCategories(cfg.categories, settings.weaning);
  const count = active?.length ?? 0;

  const doApply = async () => {
    setBusy(true);
    try {
      await applyBlock(domains);
      const s = await blockStatus();
      setActive(s);
      toast.success(isPt ? `A bloquear ${s.length} site${s.length === 1 ? '' : 's'} em todo o sistema neste Mac.` : `Blocking ${s.length} site${s.length === 1 ? '' : 's'} system-wide on this Mac.`);
    } catch (e) {
      const msg = String(e);
      if (msg.includes('cancelled')) toast(isPt ? 'Autorização cancelada.' : 'Authorization cancelled.');
      else toast.error(isPt ? `Não foi possível atualizar o bloqueio: ${msg}` : `Couldn't update blocking: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  const doRemove = async () => {
    setBusy(true);
    try {
      await clearBlock();
      setActive([]);
      toast.success(isPt ? 'Bloqueio de todo o sistema removido.' : 'System-wide blocking removed.');
    } catch (e) {
      const msg = String(e);
      if (msg.includes('cancelled')) toast(isPt ? 'Autorização cancelada.' : 'Authorization cancelled.');
      else toast.error(isPt ? `Não foi possível remover o bloqueio: ${msg}` : `Couldn't remove blocking: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  // Apply directly when strengthening; reflect first when it would drop sites
  // that are currently blocked (a weakening).
  const requestApply = () => {
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
  };

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
          <span className="font-semibold text-violet-300">● {isPt ? `Ativo — ${count} site${count === 1 ? '' : 's'} bloqueado${count === 1 ? '' : 's'}` : `Active — ${count} site${count === 1 ? '' : 's'} blocked`}</span>
        ) : (
          <span>○ {isPt ? 'Inativo' : 'Not active'}</span>
        )}
        {' · '}
        {isPt ? `${domains.length} escolhidos` : `${domains.length} selected`}
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
