import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Clock, Timer, BarChart3, MessageSquareQuote, Zap, User, HelpCircle, Sparkles, Target, Crown, Keyboard, LogOut, Home, Share2, Upload, Trash2, Users } from 'lucide-react';
import type { Settings, TimerMode, TimerPreset, HistoryEntry } from '@/stores/pomodoroStore';
import StatsPanel from './StatsPanel';
import { THEMES, THEME_CATEGORIES } from '@/data/themes';
import { useGoals } from '@/stores/goalsStore';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/stores/subscriptionStore';
import { toast } from 'sonner';

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

type NavItem = 'themes-home' | 'themes-focus' | 'themes-ambient' | 'clock' | 'timer' | 'stats' | 'quotes' | 'extras' | 'goals' | 'shortcuts' | 'account' | 'share' | 'support' | 'whats-new';

const TIMER_MODES: { id: TimerMode; label: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro' }, { id: 'countdown', label: 'Countdown' },
  { id: 'stopwatch', label: 'Stopwatch' }, { id: 'animedoro', label: 'Animedoro' }, { id: '52/17', label: '52/17' },
];

const TALLY_STYLES = [
  { id: 'dots', label: '● Dots' }, { id: 'hearts', label: '❤️ Hearts' },
  { id: 'stars', label: '⭐ Stars' }, { id: 'tomatoes', label: '🍅 Tomatoes' },
  { id: 'lightning', label: '⚡ Lightning' }, { id: 'trees', label: '🌳 Trees' },
];

const ALERT_SOUNDS = ['Sparkle', 'Chime', 'Piano', 'Applause', 'Success', 'Bell', 'Level Up', 'No Alert'];
const CLOCK_FONTS = ['Default', 'Minimal', 'Serif', 'Handwritten', 'Mono'];

const SHORTCUTS = [
  { key: 'Space', action: 'Start / Pause timer' },
  { key: 'R', action: 'Reset timer' },
  { key: 'S', action: 'Skip break' },
  { key: 'T', action: 'Toggle tasks' },
  { key: 'M', action: 'Toggle sounds' },
  { key: 'N', action: 'Toggle notepad' },
  { key: ',', action: 'Open settings' },
  { key: 'F', action: 'Toggle fullscreen' },
];

export default function SettingsSidebar({
  open, onClose, settings, presets, onUpdate, onAddPreset, onRemovePreset, history, onClearHistory,
}: SettingsSidebarProps) {
  const [activeNav, setActiveNav] = useState<NavItem>('timer');
  const [presetName, setPresetName] = useState('');
  const [themeCat, setThemeCat] = useState('all');
  const { goals, setGoals } = useGoals();
  const { user } = useAuth();
  const { isPremium, setPremium } = useSubscription();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [videoUrl, setVideoUrl] = useState(settings.videoBg || '');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  const handleAuth = async () => {
    setAuthError(null);
    setAuthMsg(null);
    if (isSignUp) {
      const { error } = await createClient().auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setAuthMsg('Check your email for confirmation!');
    } else {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
  };

  const handleSignOut = () => createClient().auth.signOut();

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please log in to upgrade to Premium');
      setActiveNav('account');
      return;
    }
    
    setIsCheckingOut(true);
    // Simulate Stripe Checkout
    toast.info('Redirecting to Stripe Checkout...', {
      description: 'Preparing your premium experience.'
    });
    
    setTimeout(() => {
      setPremium(true);
      setIsCheckingOut(false);
      toast.success('Welcome to Premium! 🎉', {
        description: 'All exclusive features are now unlocked.'
      });
    }, 2500);
  };

  const navItems: { id: NavItem; label: string; icon: any }[] = [
    { id: 'themes-home', label: 'Home Theme', icon: Home },
    { id: 'themes-focus', label: 'Focus Theme', icon: Target },
    { id: 'themes-ambient', label: 'Ambient Theme', icon: Sparkles },
    { id: 'clock', label: 'Clock', icon: Clock },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'quotes', label: 'Quotes', icon: MessageSquareQuote },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'extras', label: 'Extras', icon: Zap },
    { id: 'account', label: 'Account', icon: User },
    { id: 'share', label: 'Share', icon: Share2 },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'whats-new', label: "What's New", icon: Sparkles },
  ];

  const filteredThemes = themeCat === 'all' ? THEMES : THEMES.filter(t => t.category === themeCat);

  const renderThemeLibrary = (title: string, desc: string, settingKey: 'homeTheme' | 'focusTheme' | 'ambientTheme') => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/40">{desc}</p>
      </div>

      {/* Custom Upload */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Upload size={12} /> Custom Background
        </h4>
        <div className="flex gap-2">
          <input 
            type="file" 
            id="bg-upload"
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 10 * 1024 * 1024) {
                toast.error('File too large', { description: 'Please use an image under 10MB.' });
                return;
              }
              const reader = new FileReader();
              reader.onload = (event) => {
                const base64 = event.target?.result as string;
                onUpdate({ customBg: base64, homeTheme: 'custom' });
                toast.success('Custom background updated!');
              };
              reader.readAsDataURL(file);
            }}
          />
          <label 
            htmlFor="bg-upload"
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-dashed border-white/10 text-white/40 text-xs flex flex-col items-center justify-center gap-2 hover:bg-white/[0.08] cursor-pointer transition-all"
          >
            <Upload size={18} />
            Upload Image
          </label>
          <button 
            onClick={() => onUpdate({ customBg: null })}
            className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/10"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Overlay Opacity</span>
            <span className="text-[10px] text-white/60 font-mono">{settings.bgOverlayOpacity}%</span>
          </div>
          <input 
            type="range" min={0} max={90} step={5} value={settings.bgOverlayOpacity}
            onChange={e => onUpdate({ bgOverlayOpacity: parseInt(e.target.value) })}
            className="w-full accent-primary" 
          />
        </div>
      </div>

      {/* Video Background */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
          Video Background <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">NEW</span>
        </h4>
        <div className="flex gap-2">
...
          <input 
            type="text" 
            placeholder="Paste YouTube URL" 
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            className="flex-1 bg-white/[0.04] rounded-xl px-4 py-2 text-sm text-white outline-none border border-white/[0.05] focus:border-primary/40"
          />
          <button 
            onClick={() => {
              if (!isPremium) {
                toast.error('Premium Feature', { description: 'Video backgrounds require Flocus Plus.', action: { label: 'Upgrade', onClick: handleUpgrade } });
                return;
              }
              onUpdate({ videoBg: videoUrl });
              toast.success('Background updated!');
            }}
            className="px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm font-bold"
          >
            Save
          </button>
        </div>
      </div>

      {/* Library */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">Theme Library</h4>
        <div className="flex flex-wrap gap-1.5">
          {THEME_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setThemeCat(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                themeCat === c.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}>{c.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredThemes.map(theme => (
            <button key={theme.id}
              onClick={() => {
                if (theme.isPremium && !isPremium) {
                  toast.error('Premium Theme', {
                    description: 'Upgrade to unlock all visual themes.',
                    action: { label: 'Upgrade', onClick: handleUpgrade }
                  });
                  return;
                }
                onUpdate({ [settingKey]: theme.id } as any);
              }}
              className={`relative aspect-video rounded-xl overflow-hidden border transition-all group ${
                settings[settingKey] === theme.id ? 'ring-2 ring-purple-500 border-purple-500/50' : 'border-white/10 hover:border-white/30'
              }`}>
              {theme.background && theme.background.startsWith('http') ? (
                <img src={theme.preview} alt={theme.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full" style={{ background: theme.preview }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="text-xs text-white font-medium truncate pr-1">{theme.name}</span>
                {theme.isPremium && (
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">PLUS</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[99]" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="settings-sidebar">
            {/* Nav */}
            <div className="settings-nav scrollbar-thin">
              <button onClick={onClose} className="ml-5 mb-4 text-white/50 hover:text-white transition-all">
                <X size={20} />
              </button>
              {navItems.map(item => (
                <button key={item.id} onClick={() => setActiveNav(item.id)}
                  className={`settings-nav-item ${activeNav === item.id ? 'active' : ''}`}>
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
              <div className="mt-6 mx-5">
                {isPremium ? (
                  <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 bg-white/10 border border-white/5">
                    <Crown size={14} className="text-yellow-400" /> Premium Active
                  </div>
                ) : (
                  <button 
                    onClick={handleUpgrade}
                    disabled={isCheckingOut}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, hsl(270 80% 65%), hsl(300 70% 55%))' }}>
                    <Crown size={14} /> {isCheckingOut ? 'Processing...' : 'Upgrade to Premium'}
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="settings-content scrollbar-thin">
              {/* THEMES */}
              {activeNav === 'themes-home' && renderThemeLibrary('Home Theme', 'Pick your theme to appear in Home.', 'homeTheme')}
              {activeNav === 'themes-focus' && renderThemeLibrary('Focus Theme', 'Pick your theme to appear in Focus Mode.', 'focusTheme')}
              {activeNav === 'themes-ambient' && renderThemeLibrary('Ambient Theme', 'Pick your theme to appear in Ambient Mode.', 'ambientTheme')}

              {/* TIMER */}
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
                          }`}>{m.label}</button>
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
                            <input type="number" min={1} value={v} onChange={e => onUpdate({ [k]: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary/40" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <label className="text-xs text-white/40">Long break after</label>
                        <input type="number" min={1} value={settings.cyclesForLong} onChange={e => onUpdate({ cyclesForLong: Math.max(1, parseInt(e.target.value) || 4) })}
                          className="w-14 bg-white/[0.06] rounded-lg px-2 py-1.5 text-sm text-white outline-none" />
                        <span className="text-xs text-white/40">sessions</span>
                      </div>
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.autoNext} onChange={e => onUpdate({ autoNext: e.target.checked })} className="accent-[hsl(270,80%,65%)] w-4 h-4" />
                    <span className="text-sm text-white/80">Auto-start next session</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.autoPlayAmbient} onChange={e => onUpdate({ autoPlayAmbient: e.target.checked })} className="accent-[hsl(270,80%,65%)] w-4 h-4" />
                    <span className="text-sm text-white/80">Auto-play ambient sound during focus</span>
                  </label>
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Session Tallies</h4>
                    <div className="flex flex-wrap gap-2">
                      {TALLY_STYLES.map(t => (
                        <button key={t.id} onClick={() => onUpdate({ tallyStyle: t.id })}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            settings.tallyStyle === t.id ? 'bg-primary/20 text-white ring-1 ring-primary/40' : 'bg-white/[0.04] text-white/50'
                          }`}>{t.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Alert Sound</h4>
                    <div className="space-y-1">
                      {ALERT_SOUNDS.map(s => (
                        <label key={s} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-all">
                          <input type="radio" name="alertSound" checked={settings.alertSound === s.toLowerCase()} onChange={() => onUpdate({ alertSound: s.toLowerCase() })} className="accent-[hsl(270,80%,65%)]" />
                          <span className="text-sm text-white/70">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Presets</h4>
                    <div className="flex gap-2 mb-2">
                      <input type="text" placeholder="Preset name" value={presetName} onChange={e => setPresetName(e.target.value)}
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

              {/* CLOCK */}
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
                            settings.clockFormat === f ? 'bg-primary/20 text-white ring-1 ring-primary/40' : 'bg-white/[0.04] text-white/50 border border-white/5'
                          }`}>{f === '12h' ? '12-hour Clock' : '24-hour Clock'}</button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3 bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/80">Use flip clock</span>
                          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">NEW</span>
                        </div>
                        <p className="text-[10px] text-white/40">Display the clock with a flip animation.</p>
                      </div>
                      <input type="checkbox" checked={settings.flipClock} onChange={e => onUpdate({ flipClock: e.target.checked })} className="accent-primary w-4 h-4" />
                    </label>
                    <div className="h-px bg-white/5" />
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <span className="text-sm text-white/80">Show clock seconds</span>
                        <p className="text-[10px] text-white/40">Get a detailed time view. Turn off to hide seconds.</p>
                      </div>
                      <input type="checkbox" checked={settings.showSeconds} onChange={e => onUpdate({ showSeconds: e.target.checked })} className="accent-primary w-4 h-4" />
                    </label>
                    <div className="h-px bg-white/5" />
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <span className="text-sm text-white/80">Show dynamic greetings</span>
                        <p className="text-[10px] text-white/40">Turn off for generic greetings.</p>
                      </div>
                      <input type="checkbox" checked={settings.showDynamicGreetings} onChange={e => onUpdate({ showDynamicGreetings: e.target.checked })} className="accent-primary w-4 h-4" />
                    </label>
                    <div className="h-px bg-white/5" />
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <span className="text-sm text-white/80">Show greetings</span>
                        <p className="text-[10px] text-white/40">Turn off to hide dashboard greetings.</p>
                      </div>
                      <input type="checkbox" checked={settings.showGreetings} onChange={e => onUpdate({ showGreetings: e.target.checked })} className="accent-primary w-4 h-4" />
                    </label>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Clock & Timer Style <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">NEW</span></h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'default', label: 'Default' },
                        { id: 'minimal', label: 'Minimal' },
                        { id: 'serif', label: 'Serif' },
                        { id: 'handwritten', label: 'Handwritten' },
                        { id: 'minimal-light', label: 'Minimal Light' },
                        { id: 'serif-condensed', label: 'Serif Condensed' },
                      ].map(f => (
                        <button key={f.id} onClick={() => onUpdate({ clockStyle: f.id as any })}
                          className={`py-3 rounded-xl text-sm transition-all border ${
                            settings.clockStyle === f.id ? 'bg-primary/20 text-white border-primary/40' : 'bg-white/[0.04] text-white/50 border-white/5'
                          }`}>{f.label}</button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-3">Greeting Name</h4>
                    <input type="text" value={settings.displayName} onChange={e => onUpdate({ displayName: e.target.value })}
                      placeholder="Your name" className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none border border-white/5" />
                  </div>
                </div>
              )}

              {/* GOALS */}
              {activeNav === 'goals' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Goals</h3>
                    <p className="text-sm text-white/40">Set your daily and weekly focus targets.</p>
                  </div>
                  {[
                    { label: 'Daily Focus (minutes)', key: 'dailyMinutes' as const, value: goals.dailyMinutes },
                    { label: 'Daily Sessions', key: 'dailySessions' as const, value: goals.dailySessions },
                    { label: 'Weekly Focus (minutes)', key: 'weeklyMinutes' as const, value: goals.weeklyMinutes },
                    { label: 'Weekly Sessions', key: 'weeklySessions' as const, value: goals.weeklySessions },
                  ].map(g => (
                    <div key={g.key}>
                      <label className="text-xs text-white/40 block mb-1">{g.label}</label>
                      <input type="number" min={1} value={g.value}
                        onChange={e => setGoals({ [g.key]: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary/40" />
                    </div>
                  ))}
                </div>
              )}

              {/* STATS */}
              {activeNav === 'stats' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Stats</h3>
                    <p className="text-sm text-white/40">Your focus history and productivity.</p>
                  </div>
                  <StatsPanel history={history} onClearHistory={onClearHistory} />
                </div>
              )}

              {/* QUOTES */}
              {activeNav === 'quotes' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Quotes</h3>
                    <p className="text-sm text-white/40">Pick a quote category to keep you motivated.</p>
                  </div>
                  <select className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    value={settings.quoteCategory} onChange={e => onUpdate({ quoteCategory: e.target.value })}>
                    <option value="all">All Quotes</option>
                    <option value="motivational">Motivational</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="selfcare">Self-care</option>
                    <option value="productivity">Productivity</option>
                    <option value="wisdom">Wisdom</option>
                  </select>
                </div>
              )}

              {/* SHORTCUTS */}
              {activeNav === 'shortcuts' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Keyboard Shortcuts</h3>
                    <p className="text-sm text-white/40">Control everything without a mouse.</p>
                  </div>
                  <div className="space-y-2">
                    {SHORTCUTS.map(s => (
                      <div key={s.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                        <span className="text-sm text-white/70">{s.action}</span>
                        <kbd className="px-2.5 py-1 rounded-lg bg-white/[0.08] text-xs font-mono text-white/80 border border-white/10">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXTRAS */}
              {activeNav === 'extras' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Extras</h3>
                  </div>
                  {[
                    { key: 'disableAnimatedThemes' as const, label: 'Disable animated themes', desc: 'Recommended for older devices', premium: false },
                    { key: 'clearMode' as const, label: 'Clear mode', desc: 'Hide extra UI when inactive', premium: false },
                    { key: 'preventSleep' as const, label: 'Prevent sleep', desc: 'Keep screen awake during sessions', premium: true },
                    { key: 'randomizeTheme' as const, label: 'Theme Randomizer', desc: 'Random theme on each visit', premium: true },
                  ].map(({ key, label, desc, premium }) => (
                    <div key={key} className={`flex items-start justify-between gap-4 p-2 rounded-xl transition-all ${premium && !isPremium ? 'opacity-50 grayscale' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white">{label}</h4>
                          {premium && <Crown size={12} className="text-yellow-400" />}
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={settings[key]} 
                          onChange={e => {
                            if (premium && !isPremium) {
                              toast.error('Premium Feature', {
                                description: `The ${label} feature requires a Premium subscription.`,
                                action: { label: 'Upgrade', onClick: handleUpgrade }
                              });
                              return;
                            }
                            onUpdate({ [key]: e.target.checked });
                          }} 
                          className="sr-only peer" 
                        />
                        <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all
                          after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* ACCOUNT */}
              {activeNav === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Account</h3>
                    <p className="text-sm text-white/40">Sync your progress across devices.</p>
                  </div>
                  
                  {user ? (
                    <div className="bg-white/[0.04] rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <User size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-sm font-medium text-white truncate">{user.email}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-wider">Authenticated</div>
                        </div>
                      </div>
                      <button onClick={handleSignOut}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center gap-2 transition-all border border-white/5">
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {authError && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20">{authError}</div>}
                      {authMsg && <div className="p-3 rounded-lg bg-green-500/10 text-green-400 text-xs border border-green-500/20">{authMsg}</div>}
                      
                      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none border border-white/5" />
                      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white outline-none border border-white/5" />
                      
                      <button onClick={handleAuth} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, hsl(270 80% 65%), hsl(300 70% 55%))' }}>
                        {isSignUp ? 'Create Account' : 'Log in'}
                      </button>
                      
                      <p className="text-xs text-white/40 text-center">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <span onClick={() => setIsSignUp(!isSignUp)} className="text-purple-400 underline cursor-pointer">
                          {isSignUp ? 'Log in' : 'Sign up'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SHARE */}
              {activeNav === 'share' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Share & Community</h3>
                    <p className="text-sm text-white/40">Connect with others and share the focus.</p>
                  </div>
                  
                  <div className="bg-[#5865F2]/10 rounded-xl p-5 border border-[#5865F2]/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Join our Discord</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Productivity Lovers</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/60 mb-4">Connect with like-minded people, share your progress, and get early access to new features.</p>
                    <button 
                      onClick={() => window.open('https://discord.gg/focusflow', '_blank')}
                      className="w-full py-2.5 rounded-xl bg-[#5865F2] text-white text-sm font-bold hover:bg-[#4752C4] transition-all">
                      Join Community
                    </button>
                  </div>

                  <div className="bg-white/[0.04] rounded-xl p-5 border border-white/[0.05]">
                    <h4 className="text-sm font-bold text-white mb-1">Share Flocus with Friends</h4>
                    <p className="text-xs text-white/40 mb-4">Love using Flocus? Share it with a friend and help them get more done!</p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white/[0.04] rounded-xl px-4 py-2.5 text-xs text-white/40 truncate border border-white/5 flex items-center">
                        https://flocus.app/invite/user-123
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('https://flocus.app/invite/user-123');
                          toast.success('Link copied to clipboard!');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/80 transition-all">
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUPPORT */}
              {activeNav === 'support' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Support</h3>
                  </div>
                  <div className="space-y-2">
                    {['Help Center', 'Leave Feedback', 'Contact Support'].map(l => (
                      <button key={l} className="w-full p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm text-white/70 text-left transition-all">{l}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* WHAT'S NEW */}
              {activeNav === 'whats-new' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">What's New</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { v: 'v2.0', title: 'Major Update 🚀', desc: 'Theme library, gamification (XP/levels/badges), daily goals, keyboard shortcuts, task templates, heatmap, and more!' },
                      { v: 'v1.0', title: 'Launch', desc: 'Full Pomodoro system with tasks, sounds, stats, and customization.' },
                    ].map(item => (
                      <div key={item.v} className="bg-white/[0.04] rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-white">{item.v}: {item.title}</h4>
                        <p className="text-xs text-white/40 mt-1">{item.desc}</p>
                      </div>
                    ))}
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
