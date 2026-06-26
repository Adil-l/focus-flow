import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Phone, ExternalLink, X } from 'lucide-react';
import { openExternal } from '@/lib/openExternal';
import {
  HELP_DISCLAIMER,
  HELP_REGIONS,
  getRegion,
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
  const [regionCode, setRegionCode] = useState<string>(readInitialRegion);

  const region = getRegion(regionCode);

  const handleRegionChange = (code: string) => {
    setRegionCode(code);
    try {
      localStorage.setItem(REGION_STORAGE_KEY, code);
    } catch {
      /* storage may be unavailable — fall back to in-memory state only */
    }
  };

  const handleOpen = (url: string) => {
    if (url) {
      void openExternal(url);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-label="Professional help and crisis resources"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#15101e] text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-600/20 text-violet-300">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">You're not alone 💜</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto p-6">
          {/* Disclaimer */}
          <p className="mb-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm leading-relaxed text-violet-100">
            {HELP_DISCLAIMER}
          </p>

          {/* Region selector */}
          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-medium text-white/70">
              Choose your region
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

          {/* Resource sections */}
          <div className="space-y-6">
            {region.resources.map((resource, idx) => (
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
                    <p className="mt-2 text-xs leading-relaxed text-white/50">
                      {resource.note}
                    </p>
                  )}

                  {resource.url && (
                    <button
                      type="button"
                      onClick={() => handleOpen(resource.url!)}
                      className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit website
                    </button>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
