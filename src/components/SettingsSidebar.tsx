import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Clock, Timer, BarChart3, MessageSquareQuote, Zap, User, HelpCircle, Sparkles } from 'lucide-react';
import type { Settings, TimerMode, TimerPreset } from '@/stores/pomodoroStore';
import StatsPanel from './StatsPanel';
import type { HistoryEntry } from '@/stores/pomodoroStore';

interface SettingsSidebarProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  presets: TimerPreset[];
  onUpdate: (update: Partial<Settings>) => void;
  onAddPreset: (preset: TimerPreset) => void;
  onRemovePreset: (name: string) => void;
  history: HistoryEntry[];
  onClearHistory: () => void;
}

type NavItem = 'themes' | 'home-theme' | 'focus-theme' | 'ambient-theme' | 'clock' | 'timer' | 'stats' | 'quotes' | 'extras' | 'account' | 'support' | 'whats-new';

const TIMER_MODES: { id: TimerMode; label: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'countdown', label: 'Countdown' },
  { id: 'stopwatch', label: 'Stopwatch' },
  { id: 'animedoro', label: 'Animedoro' },
  { id: '52/17', label: '52/17' },
];

const TALLY_STYLES = [
  { id: 'dots', label: '● Dots' }, { id: 'hearts', label: '❤️ Hearts' },
  { id: 'stars', label: '⭐ Stars' }, { id: 'tomatoes', label: '🍅 Tomatoes' },
  { id: 'lightning', label: '⚡ Lightning' }, { id: 'trees', label: '🌳 Trees' },
];

const ALERT_SOUNDS = ['Sparkle', 'Chime', 'Piano', 'Applause', 'Success', 'Bell', 'Level Up', 'No Alert'];
const CLOCK_FONTS = ['Default', 'Minimal', 'Serif', 'Handwritten', 'Mono'];

export default function SettingsSidebar({
  open, onClose, settings, presets, onUpdate, onAddPreset, onRemovePreset, history, onClearHistory,
}: SettingsSidebarProps) {
  const [activeNav, setActiveNav] = useState<NavItem>('timer');
  const [presetName, setPresetName] = useState('');

  const navItems: { id: NavItem; label: string; icon: typeof Timer; sub?: boolean }[] = [
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'home-theme', label: 'Home Theme', icon: Palette, sub: true },
    { id: 'focus-theme', label: 'Focus Theme', icon: Palette, sub: true },
    { id: 'ambient-theme', label: 'Ambient Theme', icon: Palette, sub: true },
    { id: 'clock', label: 'Clock', icon: Clock },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'quotes', label: 'Quotes', icon: MessageSquareQuote },
    { id: 'extras', label: 'Extras', icon: Zap },
    { id: 'account', label: 'Account', icon: User },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'whats-new', label: "What's New", icon: Sparkles },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[99]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="settings-sidebar"
          >
            {/* Nav */}
            <div className="settings-nav scrollbar-thin">
              <button onClick={onClose} className="ml-5 mb-4 text-white/50 hover:text-white transition-all">
                <X size={20} />
              </button>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`settings-nav-item ${item.sub ? 'settings-nav-sub' : ''} ${activeNav === item.id ? 'active' : ''}`}
                >
                  {!item.sub && <item.icon size={16} />}
                  {item.label}
                  {(item.id === 'clock' || item.id === 'timer') && (
                    <span className="ml-auto text-[10px] bg-primary/30 text-primary px-1.5 py-0.5 rounded">NEW</span>
                  )}
                </button>
              ))}
              <div className="mt-6 mx-5">
                <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(270 80% 65%), hsl(300 70% 55%))' }}>
                  ⚡ Upgrade to Plus
                </button>
                <button className="w-full mt-2 py-2 rounded-xl text-sm text-white/50 hover:text-white/70 bg-white/[0.04] transition-all">
                  🎁 Share with friends
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="settings-content scrollbar-thin">
              {activeNav === 'timer' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Focus Timer</h3>
                    <p className="text-sm text-white/40">Customize your timer to match your workflow.</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Timer mode</h4>
                    <div className="flex flex-wrap gap-2">
                      {TIMER_MODES.map(m => (
                        <button key={m.id} onClick={() => onUpdate({ timerMode: m.id })}
                          className={`px-4 py-2 rounded-xl text-sm transition-all ${
                            settings.timerMode === m.id ? 'bg-primary/20 text-white ring-1 ring-primary/40' : 'bg-white/[0.04] text-white/60 hover:text-white'
                          }`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {settings.timerMode === 'pomodoro' && (
                    <div>
                      <h4 className="text-sm font-medium text-white/70 mb-3">Timer Lengths</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ l: 'Focus', k: 'work' as const, v: settings.work }, { l: 'Short Break', k: 'short' as const, v: settings.short }, { l: 'Long Break', k: 'long' as const, v: settings.long }].map(({ l, k, v }) => (
                          <div key={k}>
                            <label className="text-xs text-white/40 block mb-1">{l}</label>
                            <input type="number" min={1} value={v}
                              onChange={e => onUpdate({ [k]: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary/40" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <label className="text-xs text-white/40">Long break after</label>
                        <input type="number" min={1} value={settings.cyclesForLong}
                          onChange={e => onUpdate({ cyclesForLong: Math.max(1, parseInt(e.target.value) || 4) })}
                          className="w-14 bg-white/[0.06] rounded-lg px-2 py-1.5 text-sm text-white outline-none" />
                        <span className="text-xs text-white/40">sessions</span>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.autoNext}
                      onChange={e => onUpdate({ autoNext: e.target.checked })}
                      className="accent-[hsl(270,80%,65%)] w-4 h-4" />
                    <span className="text-sm text-white/80">Auto-start next session</span>
                  </label>

                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Session Tallies</h4>
                    <div className="flex flex-wrap gap-2">
                      {TALLY_STYLES.map(t => (
                        <button key={t.id} onClick={() => onUpdate({ tallyStyle: t.id })}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            settings.tallyStyle === t.id ? 'bg-primary/20 text-white ring-1 ring-primary/40' : 'bg-white/[0.04] text-white/50'
                          }`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Alert Sound</h4>
                    <div className="space-y-1">
                      {ALERT_SOUNDS.map(s => (
                        <label key={s} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-all">
                          <input type="radio" name="alertSound" checked={settings.alertSound === s.toLowerCase()}
                            onChange={() => onUpdate({ alertSound: s.toLowerCase() })}
                            className="accent-[hsl(270,80%,65%)]" />
                          <span className="text-sm text-white/70">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Presets */}
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Presets</h4>
                    <div className="flex gap-2 mb-2">
                      <input type="text" placeholder="Preset name" value={presetName}
                        onChange={e => setPresetName(e.target.value)}
                        className="flex-1 bg-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none" />
                      <button onClick={() => { if (presetName.trim()) { onAddPreset({ name: presetName.trim(), work: settings.work, short: settings.short, long: settings.long, cyclesForLong: settings.cyclesForLong }); setPresetName(''); } }}
                        className="px-3 py-2 rounded-lg bg-primary/20 text-white text-sm font-medium">Save</button>
                    </div>
                    {presets.map(p => (
                      <div key={p.name} className="flex items-center justify-between bg-white/[0.04] rounded-lg p-2 mb-1">
                        <button onClick={() => onUpdate({ work: p.work, short: p.short, long: p.long, cyclesForLong: p.cyclesForLong })}
                          className="text-sm text-white/70 hover:text-white">{p.name} ({p.work}/{p.short}/{p.long})</button>
                        <button onClick={() => onRemovePreset(p.name)} className="text-xs text-white/30 hover:text-red-400">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeNav === 'clock' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Clock</h3>
                    <p className="text-sm text-white/40">Customize your clock and greetings.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Clock Format</h4>
                    <div className="flex gap-3">
                      {['12h', '24h'].map(f => (
                        <button key={f} onClick={() => onUpdate({ clockFormat: f as '12h' | '24h' })}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                            settings.clockFormat === f ? 'bg-primary/20 text-white ring-1 ring-primary/40' : 'bg-white/[0.04] text-white/50'
                          }`}>{f === '12h' ? '12-hour Clock' : '24-hour Clock'}</button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.showSeconds} onChange={e => onUpdate({ showSeconds: e.target.checked })} className="accent-[hsl(270,80%,65%)] w-4 h-4" />
                    <span className="text-sm text-white/80">Show seconds</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.flipClock} onChange={e => onUpdate({ flipClock: e.target.checked })} className="accent-[hsl(270,80%,65%)] w-4 h-4" />
                    <span className="text-sm text-white/80">Use flip clock</span>
                  </label>
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Greeting Name</h4>
                    <input type="text" value={settings.displayName} onChange={e => onUpdate({ displayName: e.target.value })}
                      placeholder="Your name" className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Font Style</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {CLOCK_FONTS.map(f => (
                        <button key={f} onClick={() => onUpdate({ clockFont: f.toLowerCase() })}
                          className={`py-2.5 rounded-xl text-sm transition-all ${
                            settings.clockFont === f.toLowerCase() ? 'bg-primary/20 text-white ring-1 ring-primary/40' : 'bg-white/[0.04] text-white/50'
                          }`}>{f}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeNav === 'stats' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Stats</h3>
                    <p className="text-sm text-white/40">Your focus history and productivity.</p>
                  </div>
                  <StatsPanel history={history} onClearHistory={onClearHistory} />
                </div>
              )}

              {activeNav === 'extras' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Extras</h3>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Dashboard Display Name</h4>
                    <p className="text-xs text-white/40 mb-2">Update your name in the Home dashboard.</p>
                    <input type="text" value={settings.displayName} onChange={e => onUpdate({ displayName: e.target.value })}
                      className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none" />
                  </div>
                  {[
                    { key: 'disableAnimatedThemes' as const, label: 'Disable animated themes', desc: 'Recommended for older devices' },
                    { key: 'clearMode' as const, label: 'Clear mode', desc: 'Hide extra UI when mouse is not over the browser window' },
                    { key: 'preventSleep' as const, label: 'Prevent sleep', desc: 'Prevent your device from dimming or turning the screen off' },
                    { key: 'randomizeTheme' as const, label: 'Theme Randomizer', desc: 'Load a random theme each time you open' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-white">{label}</h4>
                        <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer mt-0.5">
                        <input type="checkbox" checked={settings[key]}
                          onChange={e => onUpdate({ [key]: e.target.checked })}
                          className="sr-only peer" />
                        <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all
                          after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {activeNav === 'quotes' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Quotes</h3>
                    <p className="text-sm text-white/40">Pick a quote to keep you motivated through the day.</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 block mb-2">Select category</label>
                    <select className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                      value={settings.quoteCategory} onChange={e => onUpdate({ quoteCategory: e.target.value })}>
                      <option value="motivational">All Quotes</option>
                      <option value="motivational">Motivational</option>
                      <option value="inspirational">Inspirational</option>
                      <option value="selfcare">Self-care</option>
                    </select>
                  </div>
                </div>
              )}

              {(activeNav === 'themes' || activeNav === 'home-theme' || activeNav === 'focus-theme' || activeNav === 'ambient-theme') && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {activeNav === 'themes' ? 'Themes' : activeNav === 'home-theme' ? 'Home Theme' : activeNav === 'focus-theme' ? 'Focus Theme' : 'Ambient Theme'}
                    </h3>
                    <p className="text-sm text-white/40">Pick your theme for the dashboard.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Aura Twilight', 'Lava Lamp', 'Minimalist Black', 'Minimalist White', 'Heat Map', 'Dark Purple Heart', 'Sakura', 'Pastel Lofi'].map(t => (
                      <button key={t} className="aspect-video rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-500/30 border border-white/10 hover:border-white/30 transition-all flex items-end p-2">
                        <span className="text-xs text-white/70">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeNav === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Account</h3>
                    <p className="text-sm text-white/40">Sign in to sync your progress and personalize your experience.</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/40 block mb-1">Email</label>
                      <input type="email" className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 block mb-1">Password</label>
                      <input type="password" className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, hsl(270 80% 65%), hsl(300 70% 55%))' }}>
                      Log in
                    </button>
                    <p className="text-xs text-white/40 text-center">Don't have an account? <span className="text-primary underline cursor-pointer">Sign up</span></p>
                  </div>
                </div>
              )}

              {activeNav === 'support' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Support</h3>
                    <p className="text-sm text-white/40">Thanks for using Pomodoro!</p>
                  </div>
                  <div className="space-y-2">
                    {['Help Center', 'Leave Feedback', 'Contact Support'].map(l => (
                      <button key={l} className="w-full p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm text-white/70 text-left transition-all">{l}</button>
                    ))}
                  </div>
                  <button className="w-full p-3 rounded-xl bg-[#5865F2]/20 text-[#5865F2] text-sm font-medium">
                    Join us on Discord
                  </button>
                </div>
              )}

              {activeNav === 'whats-new' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">What's New</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/[0.04] rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-white">v1.0: Launch 🚀</h4>
                      <p className="text-xs text-white/40 mt-1">Full Pomodoro system with tasks, sounds, stats, and more.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
