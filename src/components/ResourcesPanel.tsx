import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Phone, ExternalLink, X, ShieldAlert } from 'lucide-react';
import { openExternal } from '@/lib/openExternal';
import { useTranslation } from '@/lib/i18n';
import {
  HELP_REGIONS,
  getRegion,
  isPlaceholder,
} from '@/data/resources';

const REGION_STORAGE_KEY = 'pomo:region';

function readInitialRegion(): string {
  try {
    return localStorage.getItem(REGION_STORAGE_KEY) || 'INT';
  } catch {
    return 'INT';
  }
}

export default function ResourcesPanel({ onClose }: { onClose: () => void }) {
  const { language } = useTranslation();
  const isPt = language === 'pt';
  const [regionCode, setRegionCode] = useState<string>(readInitialRegion);

  const region = getRegion(regionCode);
  // SAFETY: never present an unverified placeholder as a real crisis contact.
  // Until a human fills in verified numbers, we show honest guidance instead of
  // fabricated entries (a wrong crisis number can cost someone help).
  const verified = region.resources.filter((r) => !isPlaceholder(r));

  const handleRegionChange = (code: string) => {
    setRegionCode(code);
    try {
      localStorage.setItem(REGION_STORAGE_KEY, code);
    } catch {
      /* storage may be unavailable — fall back to in-memory state only */
    }
  };

  const handleOpen = (url: string) => {
    if (url) void openExternal(url);
  };

  const disclaimer = isPt
    ? 'A Focus Flow é uma ferramenta, não um profissional de saúde. Procurar ajuda é um sinal de força. Se estás em perigo imediato ou a pensar em magoar-te, contacta já os serviços de emergência locais.'
    : "Focus Flow is a tool, not a clinician. Reaching out is a sign of strength. If you're in immediate danger or thinking about harming yourself, please contact your local emergency services right now.";

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-label={isPt ? 'Ajuda profissional e recursos de crise' : 'Professional help and crisis resources'}
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#15101e] text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-600/20 text-violet-300">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">{isPt ? 'Não estás sozinho 💜' : "You're not alone 💜"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isPt ? 'Fechar' : 'Close'}
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto p-6">
          {/* Disclaimer */}
          <p className="mb-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm leading-relaxed text-violet-100">
            {disclaimer}
          </p>

          {/* Region selector */}
          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-medium text-white/70">
              {isPt ? 'Escolhe a tua região' : 'Choose your region'}
            </span>
            <select
              value={regionCode}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/40"
            >
              {HELP_REGIONS.map((r) => (
                <option key={r.code} value={r.code} className="bg-[#0c0a12]">
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          {verified.length > 0 ? (
            <div className="space-y-6">
              {verified.map((resource, idx) => (
                <section key={`${resource.category}-${idx}`}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-300/80">
                    {resource.category}
                  </h3>
                  <div className="rounded-2xl border border-white/10 bg-[#0c0a12] p-4">
                    <p className="font-medium text-white">{resource.name}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                      <Phone className="h-4 w-4 shrink-0 text-violet-300" />
                      <span>{resource.contact}</span>
                    </div>
                    {resource.note && (
                      <p className="mt-2 text-xs leading-relaxed text-white/50">{resource.note}</p>
                    )}
                    {resource.url && (
                      <button
                        type="button"
                        onClick={() => handleOpen(resource.url!)}
                        className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {isPt ? 'Abrir site' : 'Visit website'}
                      </button>
                    )}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            // No human-verified resources for this region yet — be honest rather
            // than show a fabricated number.
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-200">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span className="text-sm font-semibold">
                  {isPt ? 'Em emergência, age já' : 'In an emergency, act now'}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/70">
                {isPt
                  ? 'Ainda não temos uma lista verificada de linhas de apoio para esta região. Se estás em perigo imediato, liga para o número de emergência local (na Europa: 112). Para apoio, procura "linha de apoio" + o teu país, ou contacta o teu médico.'
                  : 'We don\'t have a verified list of helplines for this region yet. If you\'re in immediate danger, call your local emergency number (e.g. 911 in the US, 112 in Europe). For support, search "helpline" + your country, or contact your doctor.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            {isPt ? 'Fechar' : 'Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
