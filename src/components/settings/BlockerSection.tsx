import { useState } from 'react';
import { Ban, Dice5, EyeOff, ShieldAlert, Sparkles, Puzzle, Skull, MegaphoneOff } from 'lucide-react';
import type { Settings, BlockerConfig, BlockerCategory } from '@/stores/pomodoroStore';
import { useSettings } from '@/stores/pomodoroStore';
import { useTranslation } from '@/lib/i18n';
import { SectionHeader, Toggle } from './_shared';
import DesktopProtectionCard from '@/components/DesktopProtectionCard';
import ReflectionGate from '@/components/ReflectionGate';
import SocialCommitmentGate from '@/components/SocialCommitmentGate';
import SocialCommitmentSetup from '@/components/SocialCommitmentSetup';
import { isCommitted, requiredReasonChars, remainingMs, formatRemaining } from '@/lib/socialCommitment';
import { toDateInput } from '@/lib/weaning';

const CATEGORY_META: { key: BlockerCategory; icon: typeof Ban }[] = [
  { key: 'distracting', icon: EyeOff },
  { key: 'ads', icon: MegaphoneOff },
  { key: 'gambling', icon: Dice5 },
  { key: 'adult', icon: Ban },
  { key: 'piracy', icon: Skull },
  { key: 'threat', icon: ShieldAlert },
];

function catText(key: BlockerCategory, pt: boolean): { label: string; desc: string } {
  const en: Record<BlockerCategory, { label: string; desc: string }> = {
    distracting: { label: 'Distracting / Social', desc: 'Instagram, TikTok, YouTube, Reddit, X…' },
    ads: { label: 'Ads / Pop-ups', desc: 'Betting, adult & junk ad networks. Auto-closes ad pop-up tabs.' },
    gambling: { label: 'Gambling / Bets', desc: 'Betting and casino sites.' },
    adult: { label: 'Adult / NSFW', desc: 'Pornography and adult content.' },
    piracy: { label: 'Piracy / Torrents', desc: 'Torrent & illegal streaming sites.' },
    threat: { label: 'Malware / Phishing', desc: 'Known malicious / suspicious sites.' },
  };
  const ptT: Record<BlockerCategory, { label: string; desc: string }> = {
    distracting: { label: 'Distração / Redes sociais', desc: 'Instagram, TikTok, YouTube, Reddit, X…' },
    ads: { label: 'Anúncios / Pop-ups', desc: 'Redes de anúncios de apostas, adulto e lixo. Fecha abas de anúncios.' },
    gambling: { label: 'Apostas / Jogo', desc: 'Sites de apostas e casino.' },
    adult: { label: 'Adulto / NSFW', desc: 'Pornografia e conteúdo adulto.' },
    piracy: { label: 'Pirataria / Torrents', desc: 'Sites de torrents e streaming ilegal.' },
    threat: { label: 'Malware / Phishing', desc: 'Sites maliciosos / suspeitos conhecidos.' },
  };
  return (pt ? ptT : en)[key];
}

const DEFAULT_BLOCKER: BlockerConfig = {
  categories: { distracting: false, ads: true, gambling: true, adult: true, piracy: true, threat: true },
  personalBlock: [],
  personalAllow: [],
  focusOnly: false,
};

export default function BlockerSection({
  title,
  subtitle,
  blocker,
  onUpdate,
}: {
  title: string;
  subtitle: string;
  blocker: BlockerConfig | undefined;
  onUpdate: (update: Partial<Settings>) => void;
}) {
  const { t, language } = useTranslation();
  const isPt = language === 'pt';
  const cfg = { ...DEFAULT_BLOCKER, ...(blocker || {}) };
  const cats = { ...DEFAULT_BLOCKER.categories, ...(cfg.categories || {}) };

  const patch = (next: Partial<BlockerConfig>) => onUpdate({ blocker: { ...cfg, categories: cats, ...next } });

  const { settings } = useSettings();
  const [pendingFn, setPendingFn] = useState<{ run: () => void } | null>(null);
  // Social/Distracting time commitment.
  const [socialSetup, setSocialSetup] = useState(false); // choosing a length (turning on)
  const [socialGate, setSocialGate] = useState(false);   // typed-reason gate (turning off early)
  const commitment = settings.socialCommitment;
  const socialCommitted = isCommitted(commitment);
  // Route weakening actions (turning a category off) through the guard the user
  // chose during onboarding, unless they set it to 'off'.
  const guardedWeaken = (run: () => void) => {
    if (settings.deactivateGuard === 'off') run();
    else setPendingFn({ run });
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} />

      {/* How it works */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/20">
        <Puzzle size={16} className="text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] text-white/70 leading-relaxed">
          {isPt
            ? <>Estas definições sincronizam com a extensão <span className="font-bold text-white">Kipto Blocker</span> (e com a app desktop) para bloquear sites de verdade. Uma página web não bloqueia outras abas sozinha — instala o complemento e tudo o que ligares aqui aplica-se automaticamente.</>
            : <>These settings sync to the <span className="font-bold text-white">Kipto Blocker</span> browser extension (and the desktop app) to actually block sites. A web page can't block other tabs on its own — install the companion, then everything you toggle here applies automatically.</>}
        </p>
      </div>

      {/* Desktop app: apply the same config system-wide via /etc/hosts (Tauri only) */}
      <DesktopProtectionCard cfg={cfg} />

      {/* Categories */}
      <div className="space-y-2">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">{isPt ? 'Categorias' : 'Categories'}</div>
        {CATEGORY_META.map(({ key, icon: Icon }) => {
          const { label, desc } = catText(key, isPt);
          return (
            <div key={key}>
              <Toggle
                icon={<Icon size={15} />}
                label={label}
                desc={desc}
                checked={!!cats[key]}
                onChange={(v) => {
                  // The Distracting / Social button uses a time commitment instead
                  // of the generic guard: turning it on picks a length; turning it
                  // off before the time is up demands a typed reason.
                  if (key === 'distracting') {
                    if (v) setSocialSetup(true);
                    else if (socialCommitted) setSocialGate(true);
                    else patch({ categories: { ...cats, distracting: false } });
                    return;
                  }
                  const apply = () => patch({ categories: { ...cats, [key]: v } });
                  if (!v) guardedWeaken(apply);
                  else apply();
                }}
              />
              {key === 'distracting' && socialCommitted && commitment && (
                <p className="ml-1 mt-1 text-[11px] font-semibold text-violet-300/80">
                  🔒 {isPt
                    ? `Comprometido — faltam ${formatRemaining(remainingMs(commitment), isPt)}`
                    : `Committed — ${formatRemaining(remainingMs(commitment), isPt)} left`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Gradual phase-in (weaning) */}
      {CATEGORY_META.some(({ key }) => cats[key]) && (
        <div className="space-y-2 rounded-xl bg-white/[0.02] p-3 border border-white/[0.05]">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{isPt ? 'Faseamento gradual' : 'Phase in gradually'}</div>
          <p className="text-[11px] text-white/40">{isPt ? 'Escolhe quando cada categoria começa a bloquear — aperta aos poucos.' : 'Choose when each category starts blocking — tighten step by step.'}</p>
          {CATEGORY_META.filter(({ key }) => cats[key]).map(({ key }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-[12px] text-white/70">{catText(key, isPt).label}</span>
              <input
                type="date"
                value={toDateInput(settings.weaning?.[key])}
                onChange={(e) => {
                  const v = e.target.value;
                  const next = { ...(settings.weaning || {}) };
                  if (v) next[key] = new Date(`${v}T00:00:00`).toISOString();
                  else delete next[key];
                  onUpdate({ weaning: next });
                }}
                className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-[12px] text-white outline-none [color-scheme:dark]"
              />
            </div>
          ))}
          <p className="text-[10px] text-white/30">{isPt ? 'Vazio = já. Data futura = começa nesse dia.' : 'Empty = now. Future date = starts that day.'}</p>
        </div>
      )}

      {/* Focus-only */}
      <Toggle
        icon={<Sparkles size={15} />}
        label={isPt ? 'Bloquear só durante sessões de foco' : 'Only block during focus sessions'}
        desc={isPt ? 'Os sites são bloqueados só enquanto uma sessão de foco está a decorrer. Desligado = sempre bloqueado.' : 'Sites are blocked only while a focus session is running. Off = always blocked.'}
        checked={cfg.focusOnly}
        onChange={(v) => patch({ focusOnly: v })}
      />

      {/* Personal block list */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">{isPt ? 'A tua lista de bloqueio' : 'Your block list'}</div>
        <textarea
          value={cfg.personalBlock.join('\n')}
          onChange={(e) => patch({ personalBlock: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
          placeholder={isPt ? 'um domínio por linha\nnews.ycombinator.com\nx.com' : 'one domain per line\nnews.ycombinator.com\nx.com'}
          className="w-full min-h-[88px] resize-y bg-black/20 border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-primary/40 transition-all font-mono placeholder:text-white/20"
        />
        <p className="text-[11px] text-white/30 mt-2">{isPt ? 'Sempre bloqueados, além das categorias acima.' : 'Always blocked, on top of the categories above.'}</p>
      </div>

      {/* Allow list */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">{isPt ? 'Lista de exceções' : 'Allow list (exceptions)'}</div>
        <textarea
          value={cfg.personalAllow.join('\n')}
          onChange={(e) => patch({ personalAllow: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
          placeholder={isPt ? 'nunca bloquear estes\nyoutube.com' : 'never block these\nyoutube.com'}
          className="w-full min-h-[64px] resize-y bg-black/20 border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-primary/40 transition-all font-mono placeholder:text-white/20"
        />
      </div>

      {pendingFn && (
        <ReflectionGate
          mode={settings.deactivateGuard === 'confirm' ? 'confirm' : 'reflect'}
          cooldownMin={settings.deactivateCooldownMin}
          onConfirm={() => { const fn = pendingFn; setPendingFn(null); fn.run(); }}
          onCancel={() => setPendingFn(null)}
        />
      )}

      {/* Social/Distracting: pick a commitment length when turning it on. */}
      {socialSetup && (
        <SocialCommitmentSetup
          onConfirm={(spanMs) => {
            setSocialSetup(false);
            onUpdate({
              blocker: { ...cfg, categories: { ...cats, distracting: true } },
              socialCommitment: { until: Date.now() + spanMs, spanMs },
            });
          }}
          onCancel={() => setSocialSetup(false)}
        />
      )}

      {/* Social/Distracting: typed-reason gate when turning it off before time's up. */}
      {socialGate && commitment && (
        <SocialCommitmentGate
          requiredChars={requiredReasonChars(commitment)}
          remainingLabel={formatRemaining(remainingMs(commitment), isPt)}
          onConfirm={() => {
            setSocialGate(false);
            onUpdate({
              blocker: { ...cfg, categories: { ...cats, distracting: false } },
              socialCommitment: null,
            });
          }}
          onCancel={() => setSocialGate(false)}
        />
      )}
    </div>
  );
}
