import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Trash2, Sparkles, Clock, Activity, X, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  useRecovery,
  useUrgeLog,
  currentCleanMs,
  humanizeDuration,
  type RecoveryGoal,
} from '@/stores/recoveryStore';

// Feature #4 + #5 — compassionate recovery: streak / relapse tracking and
// insights derived from the local urge log. No dark patterns, no shaming, no
// "failure" red. A slip is data, not failure. All data stays on the Mac.

const MPE_KEY = 'pomo:minutes-per-episode';

function loadMinutesPerEpisode(): number {
  try {
    const raw = localStorage.getItem(MPE_KEY);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 15;
  } catch {
    return 15;
  }
}

function saveMinutesPerEpisode(n: number): void {
  try {
    localStorage.setItem(MPE_KEY, String(n));
  } catch {
    /* ignore */
  }
}

export default function RecoveryPanel({ onClose }: { onClose: () => void }) {
  const { language } = useTranslation();
  const isPt = language === 'pt';

  const { goals, addGoal, recordSlip, removeGoal } = useRecovery();
  const { entries } = useUrgeLog();

  const [newLabel, setNewLabel] = useState('');
  const [minutesPerEpisode, setMinutesPerEpisode] = useState<number>(() => loadMinutesPerEpisode());
  const [slipFor, setSlipFor] = useState<RecoveryGoal | null>(null);
  const [slipNote, setSlipNote] = useState('');

  // --- Insights (Feature #5) -------------------------------------------------
  const resistedCount = useMemo(
    () => entries.filter((e) => e.type === 'resisted').length,
    [entries],
  );
  const reclaimedMinutes = resistedCount * minutesPerEpisode;

  // "When urges happen" — group all logged moments by hour of day.
  const byHour = useMemo(() => {
    const buckets = new Array<number>(24).fill(0);
    for (const e of entries) {
      const h = new Date(e.ts).getHours();
      if (h >= 0 && h < 24) buckets[h] += 1;
    }
    return buckets;
  }, [entries]);
  const maxHour = useMemo(() => Math.max(1, ...byHour), [byHour]);
  const hasHourData = useMemo(() => byHour.some((v) => v > 0), [byHour]);

  const reclaimedLabel = useMemo(() => {
    const total = reclaimedMinutes;
    if (total <= 0) return isPt ? '0 min' : '0 min';
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0) return isPt ? `${h}h ${m}min` : `${h}h ${m}m`;
    return isPt ? `${m}min` : `${m}m`;
  }, [reclaimedMinutes, isPt]);

  const handleAddGoal = () => {
    const clean = newLabel.trim();
    if (!clean) return;
    addGoal(clean);
    setNewLabel('');
  };

  const openSlip = (goal: RecoveryGoal) => {
    setSlipFor(goal);
    setSlipNote('');
  };

  const confirmSlip = () => {
    if (!slipFor) return;
    recordSlip(slipFor.id, { note: slipNote.trim() || undefined });
    setSlipFor(null);
    setSlipNote('');
  };

  const updateMinutes = (n: number) => {
    const safe = Number.isFinite(n) && n > 0 ? Math.round(n) : 1;
    setMinutesPerEpisode(safe);
    saveMinutesPerEpisode(safe);
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-start justify-center overflow-y-auto scrollbar-thin bg-[#0c0a12]/95 p-3 sm:items-center sm:p-6"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto scrollbar-thin rounded-2xl border border-white/10 bg-[#15101e] p-5 text-white shadow-2xl sm:max-h-[85vh] sm:p-6"
      >
        {/* Header */}
        <div className="mb-1 flex items-start justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight">
            {isPt ? 'Recuperação 💜' : 'Recovery 💜'}
          </h2>
          <button
            onClick={onClose}
            aria-label={isPt ? 'Fechar' : 'Close'}
            className="-mr-1.5 -mt-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-6 text-[13px] text-white/55">
          {isPt
            ? 'Um deslize é informação, não fracasso. Tudo fica no seu Mac.'
            : 'A slip is data, not failure. Everything stays on your Mac.'}
        </p>

        {/* --- Slip recovery screen (gentle) --- */}
        {slipFor ? (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-5 text-center">
            <Heart size={36} className="mx-auto mb-3 text-violet-300" />
            <div className="mb-2 text-lg font-black text-white">
              {isPt ? 'Você percebeu, e você está aqui.' : 'You noticed and you’re here.'}
            </div>
            <p className="mx-auto mb-5 max-w-xs text-[13px] text-white/60">
              {isPt
                ? 'Isso é o trabalho. Não há vergonha aqui — apenas a próxima escolha gentil.'
                : 'That’s the work. There’s no shame here — just the next kind choice.'}
            </p>
            <textarea
              value={slipNote}
              onChange={(e) => setSlipNote(e.target.value)}
              placeholder={
                isPt
                  ? 'Opcional: o que estava acontecendo? (fica no seu Mac)'
                  : 'Optional: what was going on? (stays on your Mac)'
              }
              className="mb-4 min-h-[72px] w-full resize-y rounded-xl border border-white/10 bg-black/30 p-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-violet-500/50"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSlipFor(null)}
                className="flex min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white/70 transition hover:bg-white/15"
              >
                <ArrowLeft size={16} className="shrink-0" />
                {isPt ? 'Voltar' : 'Back'}
              </button>
              <button
                onClick={confirmSlip}
                className="min-h-[48px] flex-1 rounded-xl bg-violet-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-violet-500"
              >
                {isPt ? 'Registrar e seguir em frente' : 'Log it and move forward'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* --- Goals --- */}
            <section className="mb-7">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-violet-300">
                <Activity size={14} />
                {isPt ? 'Suas metas' : 'Your goals'}
              </div>

              {goals.length === 0 ? (
                <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[13px] text-white/50">
                  {isPt
                    ? 'Adicione algo de que você quer se afastar. Sem pressão — começar é tudo.'
                    : 'Add something you want to step back from. No pressure — starting is everything.'}
                </p>
              ) : (
                <div className="mb-4 space-y-3">
                  {goals.map((goal) => {
                    const current = currentCleanMs(goal);
                    return (
                      <div
                        key={goal.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="text-[15px] font-bold text-white">{goal.label}</div>
                          <button
                            onClick={() => removeGoal(goal.id)}
                            aria-label={isPt ? 'Remover meta' : 'Remove goal'}
                            className="-mr-1.5 -mt-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/10 hover:text-white/60"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-black/20 p-3">
                            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                              {isPt ? 'Trecho atual' : 'Current stretch'}
                            </div>
                            <div className="text-lg font-black text-violet-200">
                              {humanizeDuration(current)}
                            </div>
                          </div>
                          <div className="rounded-xl bg-black/20 p-3">
                            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                              {isPt ? 'Recorde' : 'Longest ever'}
                            </div>
                            <div className="text-lg font-black text-white">
                              {humanizeDuration(Math.max(goal.longestCleanMs, current))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => openSlip(goal)}
                          className="min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          {isPt ? 'Tive um deslize' : 'I had a slip'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add goal */}
              <div className="flex gap-2">
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddGoal();
                  }}
                  placeholder={isPt ? 'Adicionar uma meta…' : 'Add a goal…'}
                  className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-violet-500/50"
                />
                <button
                  onClick={handleAddGoal}
                  className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-violet-500"
                >
                  <Plus size={16} className="shrink-0" />
                  {isPt ? 'Adicionar' : 'Add'}
                </button>
              </div>
            </section>

            {/* --- Insights (Feature #5) --- */}
            <section className="mb-2">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-violet-300">
                <Sparkles size={14} />
                {isPt ? 'Reflexões' : 'Insights'}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-0.5 text-2xl font-black text-violet-200">{resistedCount}</div>
                  <div className="text-[11px] font-semibold text-white/55">
                    {isPt ? 'Impulsos resistidos' : 'Urges resisted'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-0.5 flex items-center gap-1.5 text-2xl font-black text-white">
                    <Clock size={18} className="text-violet-300" />
                    {reclaimedLabel}
                  </div>
                  <div className="text-[11px] font-semibold text-white/55">
                    {isPt ? 'Tempo recuperado (est.)' : 'Time reclaimed (est.)'}
                  </div>
                </div>
              </div>

              {/* Minutes per episode (editable) */}
              <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <label htmlFor="mpe" className="text-[13px] text-white/60">
                  {isPt ? 'Minutos por episódio' : 'Minutes per episode'}
                </label>
                <input
                  id="mpe"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={minutesPerEpisode}
                  onChange={(e) => updateMinutes(Number(e.target.value))}
                  className="min-h-[40px] w-20 shrink-0 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-right text-[13px] font-bold text-white outline-none focus:border-violet-500/50"
                />
              </div>

              {/* When urges happen — by-hour distribution */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 text-[13px] font-bold text-white/80">
                  {isPt ? 'Quando os impulsos surgem' : 'When urges happen'}
                </div>
                {hasHourData ? (
                  <>
                    <div className="flex h-20 items-end gap-[2px]">
                      {byHour.map((count, h) => (
                        <div
                          key={h}
                          title={`${String(h).padStart(2, '0')}:00 — ${count}`}
                          className="flex-1 rounded-t-sm bg-violet-500/70"
                          style={{ height: `${Math.max(count > 0 ? 8 : 2, (count / maxHour) * 100)}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] font-medium text-white/35">
                      <span>0h</span>
                      <span>6h</span>
                      <span>12h</span>
                      <span>18h</span>
                      <span>23h</span>
                    </div>
                  </>
                ) : (
                  <p className="text-[12px] text-white/45">
                    {isPt
                      ? 'Ainda sem dados. Conforme você registra momentos, padrões aparecem aqui.'
                      : 'No data yet. As you log moments, patterns will show up here.'}
                  </p>
                )}
              </div>
            </section>

            {/* Close */}
            <button
              onClick={onClose}
              className="mt-6 min-h-[48px] w-full rounded-xl bg-white/10 py-3 text-sm font-bold text-white/70 transition hover:bg-white/15"
            >
              {isPt ? 'Fechar' : 'Close'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
