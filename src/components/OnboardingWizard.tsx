import { useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Globe, Coffee, Check } from 'lucide-react';
import tos from '@/content/legal/terms-of-service.md?raw';
import privacy from '@/content/legal/privacy-policy.md?raw';
import sysperm from '@/content/legal/system-permissions-consent.md?raw';
import tosPt from '@/content/legal/terms-of-service.pt.md?raw';
import privacyPt from '@/content/legal/privacy-policy.pt.md?raw';
import syspermPt from '@/content/legal/system-permissions-consent.pt.md?raw';
import { isTauri } from '@/platform';
import { effectiveDomains } from '@/platform/desktop';
import { applyBlock } from '@/platform/desktop';
import { useTranslation } from '@/lib/i18n';
import type { BlockerCategory, BlockerConfig } from '@/stores/pomodoroStore';

const DONE_KEY = 'focusflow:onboarded:v1';

const DOC_TITLES = {
  tos: { en: 'Terms of Service', pt: 'Termos de Serviço', body: tos, bodyPt: tosPt },
  privacy: { en: 'Privacy Policy', pt: 'Política de Privacidade', body: privacy, bodyPt: privacyPt },
  sys: { en: 'System Permissions & Consent', pt: 'Permissões do Sistema e Consentimento', body: sysperm, bodyPt: syspermPt },
} as const;
type DocKey = keyof typeof DOC_TITLES;

const CAT_KEYS: BlockerCategory[] = ['distracting', 'ads', 'gambling', 'adult', 'piracy', 'threat'];
function catLabel(key: BlockerCategory, pt: boolean): string {
  const en = { distracting: 'Distracting / Social', ads: 'Ads / Pop-ups', gambling: 'Gambling / Bets', adult: 'Adult / NSFW', piracy: 'Piracy / Torrents', threat: 'Malware / Phishing' };
  const ptL = { distracting: 'Distração / Redes sociais', ads: 'Anúncios / Pop-ups', gambling: 'Apostas / Jogo', adult: 'Adulto / NSFW', piracy: 'Pirataria / Torrents', threat: 'Malware / Phishing' };
  return (pt ? ptL : en)[key];
}
function catDesc(key: BlockerCategory, pt: boolean): string {
  const en = { distracting: 'Instagram, TikTok, YouTube, Reddit, X…', ads: 'Betting/adult/junk ad networks; auto-closes ad pop-up tabs', gambling: 'Betting and casino sites', adult: 'Pornography and adult content', piracy: 'Torrent & illegal streaming sites', threat: 'Known malicious sites' };
  const ptD = { distracting: 'Instagram, TikTok, YouTube, Reddit, X…', ads: 'Redes de anúncios de apostas/adulto/lixo; fecha abas de anúncios', gambling: 'Sites de apostas e casino', adult: 'Pornografia e conteúdo adulto', piracy: 'Sites de torrents e streaming ilegal', threat: 'Sites maliciosos conhecidos' };
  return (pt ? ptD : en)[key];
}

function patchSettings(patch: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem('pomo:settings');
    const cur = raw ? JSON.parse(raw) : {};
    localStorage.setItem('pomo:settings', JSON.stringify({ ...cur, ...patch }));
  } catch { /* ignore */ }
}

// First-run setup wizard for the desktop app. The user authorizes and activates
// the powerful features (website blocker, mandatory break lock) BEFORE getting
// into the app. No-op on the web build.
export default function OnboardingWizard({ children }: { children: ReactNode }) {
  const { t, language, setLanguage } = useTranslation();
  const isPt = language === 'pt';

  const [done, setDone] = useState(() => {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem(DONE_KEY) != null || !isTauri();
  });
  const [step, setStep] = useState(0);
  const [doc, setDoc] = useState<DocKey | null>(null);

  // Step 0 — legal
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);

  // Step 1 — blocker
  const [cats, setCats] = useState<Record<BlockerCategory, boolean>>({
    distracting: false, ads: true, gambling: true, adult: true, piracy: true, threat: true,
  });
  const [activated, setActivated] = useState(false);
  const [busy, setBusy] = useState(false);

  // Step 2 — mandatory breaks
  const [breaks, setBreaks] = useState(true);

  // Step 1 — what should happen when you later try to disable/weaken blocking.
  const [guard, setGuard] = useState<'reflect' | 'confirm' | 'off'>('reflect');
  const [guardCooldown, setGuardCooldown] = useState(15);

  if (done) return <>{children}</>;

  const blockerCfg: BlockerConfig = { categories: cats, personalBlock: [], personalAllow: [], focusOnly: false };
  const domains = effectiveDomains(blockerCfg);

  const quit = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch { /* ignore */ }
  };

  const activateBlocker = async () => {
    if (domains.length === 0) { toast.error(isPt ? 'Escolhe pelo menos uma categoria para bloquear.' : 'Pick at least one category to block.'); return; }
    setBusy(true);
    try {
      await applyBlock(domains);
      setActivated(true);
      toast.success(isPt ? `A bloquear ${domains.length} sites em todo o sistema.` : `Blocking ${domains.length} sites system-wide.`);
    } catch (e) {
      const msg = String(e);
      if (msg.includes('cancelled')) toast(isPt ? 'Autorização cancelada — podes ativar depois.' : 'Authorization cancelled — you can enable it later.');
      else toast.error(isPt ? `Não foi possível ativar: ${msg}` : `Couldn't activate: ${msg}`);
    } finally { setBusy(false); }
  };

  const finish = () => {
    patchSettings({ blocker: blockerCfg, forceBreakLock: breaks, deactivateGuard: guard, deactivateCooldownMin: guardCooldown });
    try { localStorage.setItem(DONE_KEY, new Date().toISOString()); } catch { /* ignore */ }
    setDone(true);
  };

  const allLegal = c1 && c2 && c3;
  const titles = isPt
    ? ['Bem-vindo', 'Bloqueador', 'Pausas', 'Tudo pronto']
    : ['Welcome', 'Website blocker', 'Focus breaks', 'All set'];

  const legalRows: [DocKey, string, boolean, (v: boolean) => void][] = [
    ['tos', isPt ? 'os Termos de Serviço' : 'the Terms of Service', c1, setC1],
    ['privacy', isPt ? 'a Política de Privacidade' : 'the Privacy Policy', c2, setC2],
    ['sys', isPt ? 'as alterações ao sistema descritas' : 'the system changes described', c3, setC3],
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-auto bg-[#0c0a12] p-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl">
        {/* progress dots + language picker */}
        <div className="mb-5 flex items-center gap-2">
          {titles.map((tt, i) => (
            <div key={tt} className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${i <= step ? 'bg-violet-500' : 'bg-white/15'}`} />
            </div>
          ))}
          <span className="ml-2 text-[11px] font-bold uppercase tracking-widest text-white/40">{titles[step]}</span>
          {/* Choose language up front — localizes the whole wizard (incl. legal docs). */}
          <div className="ml-auto flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-0.5">
            {(['en', 'pt'] as const).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => setLanguage(lng)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-black transition ${language === lng ? 'bg-violet-600 text-white' : 'text-white/55 hover:text-white/80'}`}
                aria-label={lng === 'pt' ? 'Português' : 'English'}
                aria-pressed={language === lng}
              >
                {lng === 'pt' ? '🇵🇹 PT' : '🇬🇧 EN'}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 0 — legal */}
        {step === 0 && (
          <>
            <div className="mb-1 text-2xl font-black text-white">{isPt ? 'Bem-vindo ao Focus Flow 🛡️' : 'Welcome to Focus Flow 🛡️'}</div>
            <p className="mb-5 text-[13px] leading-relaxed text-white/60">
              {isPt
                ? 'A versão honesta: as tuas definições, estatísticas e listas ficam no teu Mac — não nos nossos servidores — e não te seguimos. Os próximos passos deixam-te ligar as funções poderosas e autorizar as alterações ao sistema que precisam. Mantens o controlo e podes reverter tudo quando quiseres.'
                : "The honest version: your settings, stats and blocklists live on your Mac — not on our servers — and we don't track you. The next steps let you turn on the powerful features and authorize the system changes they need. You stay in control and can reverse everything anytime."}
            </p>
            <div className="mb-5 space-y-2.5">
              {legalRows.map(([key, label, val, set]) => (
                <label key={key} className="flex cursor-pointer items-start gap-3 text-[13px] text-white/85">
                  <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="mt-0.5 h-4 w-4 accent-violet-500" />
                  <span>
                    {isPt ? 'Li e concordo com ' : 'I have read and agree to '}
                    <button type="button" onClick={() => setDoc(key)} className="text-violet-400 underline underline-offset-2">{label}</button>.
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} disabled={!allLegal} className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{isPt ? 'Continuar' : 'Continue'}</button>
              <button onClick={quit} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white/70">{isPt ? 'Sair' : 'Quit'}</button>
            </div>
          </>
        )}

        {/* STEP 1 — website blocker */}
        {step === 1 && (
          <>
            <div className="mb-1 flex items-center gap-2 text-xl font-black text-white"><Globe size={20} className="text-violet-300" /> {isPt ? 'Bloqueador de sites' : 'Website blocker'}</div>
            <p className="mb-4 text-[13px] leading-relaxed text-white/60">
              {isPt ? <>Bloqueia sites distrativos e nocivos em <span className="font-semibold text-white/80">todos os navegadores</span> deste Mac. Ativar pede a tua password do Mac (nunca a vemos) e é totalmente reversível.</>
                    : <>Block distracting and harmful sites in <span className="font-semibold text-white/80">every browser</span> on this Mac. Activating asks for your Mac password (we never see it) and is fully reversible later.</>}
            </p>
            <div className="mb-4 space-y-2">
              {CAT_KEYS.map((key) => (
                <label key={key} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                  <span>
                    <span className="block text-[13px] font-semibold text-white">{catLabel(key, isPt)}</span>
                    <span className="block text-[11px] text-white/45">{catDesc(key, isPt)}</span>
                  </span>
                  <input type="checkbox" checked={cats[key]} onChange={(e) => setCats((c) => ({ ...c, [key]: e.target.checked }))} className="h-4 w-4 accent-violet-500" />
                </label>
              ))}
            </div>
            <div className="mb-4 flex items-center gap-2 text-[12px]">
              {activated
                ? <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400"><Check size={14} /> {isPt ? `Ativado — ${domains.length} sites bloqueados` : `Activated — ${domains.length} sites blocked`}</span>
                : <button onClick={activateBlocker} disabled={busy} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 font-bold text-white disabled:opacity-50">{busy && <Loader2 size={13} className="animate-spin" />} {isPt ? 'Ativar agora (pede password)' : 'Activate now (asks for password)'}</button>}
            </div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-white/40">{isPt ? 'Se tentares desativar o bloqueio mais tarde…' : 'If you try to disable blocking later…'}</div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {(['reflect', 'confirm', 'off'] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setGuard(val)}
                  className={`rounded-xl border px-2 py-2 text-[11px] font-bold ${guard === val ? 'border-violet-500 bg-violet-600 text-white' : 'border-white/10 bg-white/5 text-white/70'}`}
                >
                  {val === 'reflect' ? (isPt ? 'Refletir e esperar' : 'Reflect & wait') : val === 'confirm' ? (isPt ? 'Só confirmar' : 'Just confirm') : (isPt ? 'Sem fricção' : 'No friction')}
                </button>
              ))}
            </div>
            {guard === 'reflect' && (
              <select
                value={guardCooldown}
                onChange={(e) => setGuardCooldown(parseInt(e.target.value, 10))}
                className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[12px] text-white outline-none"
              >
                <option value={5}>{isPt ? 'Base: 5 min/dia' : 'Base: 5 min/day'}</option>
                <option value={10}>{isPt ? 'Base: 10 min/dia' : 'Base: 10 min/day'}</option>
                <option value={15}>{isPt ? 'Base: 15 min/dia' : 'Base: 15 min/day'}</option>
                <option value={20}>{isPt ? 'Base: 20 min/dia' : 'Base: 20 min/day'}</option>
              </select>
            )}
            {guard === 'reflect' && (
              <p className="mb-4 -mt-2 text-[10px] text-white/35">{isPt ? 'A espera aumenta a cada dia e a cada tentativa no mesmo dia.' : 'The wait grows each day and with each attempt the same day.'}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white/70">{isPt ? 'Voltar' : 'Back'}</button>
              <button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white">{activated ? (isPt ? 'Continuar' : 'Continue') : (isPt ? 'Saltar por agora' : 'Skip for now')}</button>
            </div>
          </>
        )}

        {/* STEP 2 — mandatory breaks */}
        {step === 2 && (
          <>
            <div className="mb-1 flex items-center gap-2 text-xl font-black text-white"><Coffee size={20} className="text-violet-300" /> {isPt ? 'Pausas de foco' : 'Focus breaks'}</div>
            <p className="mb-4 text-[13px] leading-relaxed text-white/60">
              {isPt ? <>Quando começa uma pausa curta ou longa, o Focus Flow pode <span className="font-semibold text-white/80">trancar o Mac todo</span> num ecrã de pausa calmo — escondendo a Dock e desativando a troca de apps, fechar e forçar-fecho — até a pausa acabar. Liberta-se sozinho e sobrevive a um reload. Não precisa de password de admin.</>
                    : <>When a short or long break starts, Focus Flow can <span className="font-semibold text-white/80">lock the whole Mac</span> on a calm break screen — hiding the Dock and disabling app-switching, quit and force-quit — until the break ends. It releases automatically and survives a reload. No admin password needed.</>}
            </p>
            <label className="mb-5 flex cursor-pointer items-center justify-between rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3.5">
              <span>
                <span className="block text-[13px] font-bold text-white">{isPt ? 'Ativar pausa obrigatória' : 'Enable mandatory break lock'}</span>
                <span className="block text-[11px] text-white/50">{isPt ? 'Recomendado — este é o compromisso de foco.' : 'Recommended — this is the focus commitment.'}</span>
              </span>
              <input type="checkbox" checked={breaks} onChange={(e) => setBreaks(e.target.checked)} className="h-5 w-5 accent-violet-500" />
            </label>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white/70">{isPt ? 'Voltar' : 'Back'}</button>
              <button onClick={() => setStep(3)} className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white">{isPt ? 'Continuar' : 'Continue'}</button>
            </div>
          </>
        )}

        {/* STEP 3 — done */}
        {step === 3 && (
          <>
            <div className="mb-1 flex items-center gap-2 text-2xl font-black text-white"><ShieldCheck size={24} className="text-emerald-400" /> {isPt ? 'Tudo pronto' : "You're all set"}</div>
            <p className="mb-4 text-[13px] leading-relaxed text-white/60">{isPt ? 'Eis o que autorizaste:' : "Here's what you authorized:"}</p>
            <ul className="mb-6 space-y-2 text-[13px] text-white/80">
              <li className="flex items-center gap-2"><Check size={15} className="text-emerald-400" /> {isPt ? 'Bloqueador de sites — ' : 'Website blocker — '}{activated ? (isPt ? `ativo (${domains.length} sites)` : `active (${domains.length} sites)`) : (isPt ? `${domains.length} sites escolhidos (ativa quando quiseres nas Definições)` : `${domains.length} sites selected (activate anytime in Settings)`)}</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-emerald-400" /> {isPt ? 'Pausa obrigatória — ' : 'Mandatory break lock — '}{breaks ? (isPt ? 'ligada' : 'on') : (isPt ? 'desligada' : 'off')}</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-emerald-400" /> {isPt ? 'Termos e Privacidade aceites' : 'Terms & Privacy accepted'}</li>
            </ul>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white/70">{isPt ? 'Voltar' : 'Back'}</button>
              <button onClick={finish} className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white">{isPt ? 'Entrar no Focus Flow' : 'Enter Focus Flow'}</button>
            </div>
          </>
        )}
      </div>

      {doc && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-6" onClick={() => setDoc(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-[#15101e] p-7" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-bold text-white">{isPt ? DOC_TITLES[doc].pt : DOC_TITLES[doc].en}</div>
              <button onClick={() => setDoc(null)} className="text-sm text-white/50 hover:text-white">{isPt ? 'Fechar ✕' : 'Close ✕'}</button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-violet-400">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{isPt ? DOC_TITLES[doc].bodyPt : DOC_TITLES[doc].body}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
