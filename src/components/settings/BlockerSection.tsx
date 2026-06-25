import { Ban, Dice5, EyeOff, ShieldAlert, Sparkles, Puzzle } from 'lucide-react';
import type { Settings, BlockerConfig, BlockerCategory } from '@/stores/pomodoroStore';
import { SectionHeader, Toggle } from './_shared';

const CATEGORY_META: { key: BlockerCategory; label: string; desc: string; icon: typeof Ban }[] = [
  { key: 'distracting', label: 'Distracting / Social', desc: 'Instagram, TikTok, YouTube, Reddit, X…', icon: EyeOff },
  { key: 'gambling', label: 'Gambling / Bets', desc: 'Betting and casino sites.', icon: Dice5 },
  { key: 'adult', label: 'Adult / NSFW', desc: 'Pornography and adult content.', icon: Ban },
  { key: 'threat', label: 'Malware / Phishing', desc: 'Known malicious / suspicious sites.', icon: ShieldAlert },
];

const DEFAULT_BLOCKER: BlockerConfig = {
  categories: { distracting: false, gambling: true, adult: true, threat: true },
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
  const cfg = { ...DEFAULT_BLOCKER, ...(blocker || {}) };
  const cats = { ...DEFAULT_BLOCKER.categories, ...(cfg.categories || {}) };

  const patch = (next: Partial<BlockerConfig>) => onUpdate({ blocker: { ...cfg, categories: cats, ...next } });

  return (
    <div className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} />

      {/* How it works */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/20">
        <Puzzle size={16} className="text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] text-white/70 leading-relaxed">
          These settings sync to the <span className="font-bold text-white">Focus Flow Blocker</span> browser
          extension (and the desktop app) to actually block sites. A web page can't block other tabs on its own —
          install the companion, then everything you toggle here applies automatically.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Categories</div>
        {CATEGORY_META.map(({ key, label, desc, icon: Icon }) => (
          <Toggle
            key={key}
            icon={<Icon size={15} />}
            label={label}
            desc={desc}
            checked={!!cats[key]}
            onChange={(v) => patch({ categories: { ...cats, [key]: v } })}
          />
        ))}
      </div>

      {/* Focus-only */}
      <Toggle
        icon={<Sparkles size={15} />}
        label="Only block during focus sessions"
        desc="Sites are blocked only while a focus session is running. Off = always blocked."
        checked={cfg.focusOnly}
        onChange={(v) => patch({ focusOnly: v })}
      />

      {/* Personal block list */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Your block list</div>
        <textarea
          value={cfg.personalBlock.join('\n')}
          onChange={(e) => patch({ personalBlock: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
          placeholder={'one domain per line\nnews.ycombinator.com\nx.com'}
          className="w-full min-h-[88px] resize-y bg-black/20 border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-primary/40 transition-all font-mono placeholder:text-white/20"
        />
        <p className="text-[11px] text-white/30 mt-2">Always blocked, on top of the categories above.</p>
      </div>

      {/* Allow list */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Allow list (exceptions)</div>
        <textarea
          value={cfg.personalAllow.join('\n')}
          onChange={(e) => patch({ personalAllow: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
          placeholder={'never block these\nyoutube.com'}
          className="w-full min-h-[64px] resize-y bg-black/20 border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-primary/40 transition-all font-mono placeholder:text-white/20"
        />
      </div>
    </div>
  );
}
