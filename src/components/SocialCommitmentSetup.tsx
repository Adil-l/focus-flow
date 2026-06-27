import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  COMMITMENT_PRESETS,
  LONG_COMMITMENT_MS,
  SHORT_REASON_CHARS,
  LONG_REASON_CHARS,
} from '@/lib/socialCommitment';

// Modal shown when the user turns ON the Distracting / Social website blocker.
// They pick HOW LONG to commit to keeping it blocked. After confirming, the
// blocker is committed for that span; ending early will later require a typed
// reason whose length scales with the commitment (see socialCommitment.ts).

const HOUR_MS = 60 * 60 * 1000;
const MIN_CUSTOM_HOURS = 1;
const MAX_CUSTOM_HOURS = 720;

interface SocialCommitmentSetupProps {
  onConfirm: (spanMs: number) => void; // chosen commitment length in milliseconds
  onCancel: () => void;
}

export default function SocialCommitmentSetup({ onConfirm, onCancel }: SocialCommitmentSetupProps) {
  const { language } = useTranslation();
  const isPt = language === 'pt';

  // Default-select a sensible preset: the '1d' id, else the first available.
  const defaultPreset =
    COMMITMENT_PRESETS.find((p) => p.id === '1d') ?? COMMITMENT_PRESETS[0] ?? null;

  // `null` selectedId means the custom-hours field is the active source of truth.
  const [selectedId, setSelectedId] = useState<string | null>(defaultPreset?.id ?? null);
  const [customHours, setCustomHours] = useState<string>('');

  const customHoursNum = (() => {
    const n = Number.parseInt(customHours, 10);
    return Number.isFinite(n) ? n : NaN;
  })();
  const customValid =
    !Number.isNaN(customHoursNum) &&
    customHoursNum >= MIN_CUSTOM_HOURS &&
    customHoursNum <= MAX_CUSTOM_HOURS;

  // The chosen span in ms: a custom value (when selected & valid) wins, otherwise
  // the highlighted preset.
  const selectedPreset = COMMITMENT_PRESETS.find((p) => p.id === selectedId) ?? null;
  const chosenMs =
    selectedId === null && customValid
      ? customHoursNum * HOUR_MS
      : selectedPreset?.ms ?? 0;

  const canConfirm = chosenMs > 0;

  const reasonChars = chosenMs >= LONG_COMMITMENT_MS ? LONG_REASON_CHARS : SHORT_REASON_CHARS;
  const earlyExitHint = isPt
    ? `Sair antes do fim exige escrever ${reasonChars} caracteres.`
    : `Ending early requires typing ${reasonChars} characters.`;

  const selectPreset = (id: string) => {
    setSelectedId(id);
    setCustomHours('');
  };

  const onCustomChange = (raw: string) => {
    // Keep only digits so the field stays clean on mobile keyboards.
    const cleaned = raw.replace(/[^0-9]/g, '');
    setCustomHours(cleaned);
    setSelectedId(cleaned === '' ? (defaultPreset?.id ?? null) : null);
  };

  const confirm = () => {
    if (!canConfirm) return;
    onConfirm(chosenMs);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-[#0c0a12]/95"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="max-h-[100dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-7"
      >
        <ShieldCheck size={40} className="mx-auto mb-3 text-violet-300" />
        <h2 className="mb-2 text-center text-xl font-black text-white">
          {isPt ? 'Comprometer-te a manter bloqueado' : 'Commit to staying blocked'}
        </h2>
        <p className="mb-6 text-center text-[13px] leading-relaxed text-white/60">
          {isPt
            ? 'Escolher um período compromete-te a manter o Instagram, TikTok, YouTube, Reddit, X… bloqueados. Não podes simplesmente desligar antes do tempo acabar — terias de escrever uma justificação.'
            : "Choosing a period commits you to keeping Instagram, TikTok, YouTube, Reddit, X… blocked. You can't simply switch it off before the time is up — you'd have to type a reason."}
        </p>

        <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-violet-300">
          {isPt ? 'Por quanto tempo?' : 'For how long?'}
        </div>
        <div className="mb-5 grid grid-cols-2 gap-2">
          {COMMITMENT_PRESETS.map((preset) => {
            const isActive = selectedId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset.id)}
                aria-pressed={isActive}
                className={`flex min-h-[44px] items-center justify-center rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${
                  isActive
                    ? 'border-violet-500 bg-violet-600 text-white'
                    : 'border-white/10 bg-white/5 text-white/70'
                }`}
              >
                {isPt ? preset.labelPt : preset.labelEn}
              </button>
            );
          })}
        </div>

        <div className="mb-5">
          <label
            htmlFor="social-commitment-custom-hours"
            className="mb-2 block text-[11px] font-black uppercase tracking-widest text-white/40"
          >
            {isPt ? 'Ou horas personalizadas' : 'Or custom hours'}
          </label>
          <div className="flex items-center gap-2">
            <Clock size={18} className="shrink-0 text-white/40" />
            <input
              id="social-commitment-custom-hours"
              type="number"
              inputMode="numeric"
              min={MIN_CUSTOM_HOURS}
              max={MAX_CUSTOM_HOURS}
              value={customHours}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder={isPt ? `1–${MAX_CUSTOM_HOURS} horas` : `1–${MAX_CUSTOM_HOURS} hours`}
              className={`min-h-[44px] w-full rounded-xl border bg-black/30 px-3 py-2 text-base text-white outline-none placeholder:text-white/30 ${
                selectedId === null && customHours !== '' && !customValid
                  ? 'border-amber-400/60'
                  : selectedId === null && customValid
                    ? 'border-violet-500'
                    : 'border-white/10'
              }`}
            />
          </div>
          {selectedId === null && customHours !== '' && !customValid && (
            <p className="mt-1.5 text-[11px] font-bold text-amber-300/80">
              {isPt
                ? `Escolhe entre ${MIN_CUSTOM_HOURS} e ${MAX_CUSTOM_HOURS} horas.`
                : `Pick between ${MIN_CUSTOM_HOURS} and ${MAX_CUSTOM_HOURS} hours.`}
            </p>
          )}
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-3 text-center text-[12px] font-bold text-amber-200/80">
          {earlyExitHint}
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={confirm}
            disabled={!canConfirm}
            className="min-h-[44px] rounded-xl bg-violet-600 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPt ? 'Começar' : 'Start'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl bg-white/10 py-3 text-sm font-bold text-white/60"
          >
            {isPt ? 'Cancelar' : 'Cancel'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
