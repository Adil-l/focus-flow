import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Clock, Timer, BarChart3, MessageSquareQuote, Zap, User, HelpCircle, Sparkles, Target, Keyboard, LogOut, Home, Share2, Upload, Trash2, Users, Bell, Volume2, Type, Music, Shield, Info, Plus, RotateCcw, Download, Save, CreditCard, Gem, Settings as SettingsIcon } from 'lucide-react';
import type { Settings, TimerMode, TimerPreset, HistoryEntry } from '@/stores/pomodoroStore';
import StatsPanel from './StatsPanel';
import { THEMES, THEME_CATEGORIES, isThemePremium } from '@/data/themes';
import { useGoals } from '@/stores/goalsStore';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { useTranslation } from '@/lib/i18n';
import { soundManager, ALERT_SOUNDS as SOUND_URLS } from '@/lib/audio';
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
  onOpenAuth: () => void;
}

type NavItem = 'themes-home' | 'clock' | 'timer' | 'stats' | 'quotes' | 'extras' | 'goals' | 'shortcuts' | 'account' | 'share' | 'support' | 'whats-new';

// Neutral default timezone derived from the visitor's browser (never a hardcoded person/locale).
const BROWSER_TZ = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';

const TIMER_MODES: { id: TimerMode; label: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro' }, { id: 'countdown', label: 'Countdown' },
  { id: 'stopwatch', label: 'Stopwatch' }, { id: 'animedoro', label: 'Animedoro' }, { id: '52/17', label: '52/17' },
];

const TALLY_STYLES = [
  { id: 'dots', label: '● Dots' }, { id: 'hearts', label: '❤️ Hearts' },
  { id: 'stars', label: '⭐ Stars' }, { id: 'tomatoes', label: '🍅 Tomatoes' },
  { id: 'lightning', label: '⚡ Lightning' }, { id: 'trees', label: '🌳 Trees' },
];

const ALERT_SOUNDS = [
  { id: 'chime', label: 'Chime' }, { id: 'bell', label: 'Digital Bell' },
  { id: 'glass', label: 'Glass' }, { id: 'bird', label: 'Birds' },
  { id: 'piano', label: 'Piano' }, { id: 'none', label: 'Silent' }
];

const AMBIENT_SOUNDS = [
  { id: 'none', label: 'None' }, { id: 'rain', label: 'Rain' },
  { id: 'waves', label: 'Ocean Waves' }, { id: 'forest', label: 'Forest' },
  { id: 'cafe', label: 'Coffee Shop' }, { id: 'white_noise', label: 'White Noise' },
  { id: 'fire', label: 'Fireplace' }, { id: 'lofi', label: 'Lo-Fi Beats' }
];

const CLOCK_FONTS = ['Default', 'Minimal', 'Serif', 'Handwritten', 'Mono'];
const CLOCK_STYLES = [
  { id: 'default', label: 'Standard' }, { id: 'minimal', label: 'Ultra Minimal' },
  { id: 'serif', label: 'Classic Serif' }, { id: 'handwritten', label: 'Handwritten' }
];

const SHORTCUTS = [
  { key: 'Space', action: 'Start / Pause timer' },
  { key: 'R', action: 'Reset timer' },
  { key: 'S', action: 'Skip break' },
  { key: 'T', action: 'Toggle tasks' },
  { key: 'N', action: 'Toggle notepad' },
  { key: ',', action: 'Open settings' },
  { key: 'F', action: 'Toggle fullscreen' },
  { key: '1-3', action: 'Switch timer modes' },
];

export default function SettingsSidebar({
  open, onClose, settings, presets, onUpdate, onAddPreset, onRemovePreset, history, onClearHistory, onOpenAuth,
}: SettingsSidebarProps) {
  const { t, currentLanguage } = useTranslation();
  const [activeNav, setActiveNav] = useState<NavItem>('themes-home');
  const [themeCat, setThemeCat] = useState('all');
  const [fontCategory, setFontCategory] = useState('all');
  const { goals, setGoals } = useGoals();
  const { user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [videoUrl, setVideoUrl] = useState(settings.videoBg || '');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountFirstName, setAccountFirstName] = useState('');
  const [accountLastName, setAccountLastName] = useState('');
  const [accountTimezone, setAccountTimezone] = useState((settings.timezone || BROWSER_TZ).replace('/', ' / '));
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const { checkPremium } = usePremium();

  useEffect(() => {
    if (!user) {
      setAccountTimezone((settings.timezone || BROWSER_TZ).replace('/', ' / '));
      return;
    }
    const userMetadata = user.user_metadata ?? {};
    const fullName =
      typeof userMetadata.full_name === 'string' ? userMetadata.full_name :
      typeof userMetadata.name === 'string' ? userMetadata.name :
      '';
    const firstName =
      typeof userMetadata.first_name === 'string' ? userMetadata.first_name :
      fullName || '';
    const lastName =
      typeof userMetadata.last_name === 'string' ? userMetadata.last_name :
      '';
    const timezone =
      typeof userMetadata.timezone === 'string' ? userMetadata.timezone :
      (settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || BROWSER_TZ).replace('/', ' / ');

    setAccountEmail(user.email ?? '');
    setAccountFirstName(firstName);
    setAccountLastName(lastName);
    setAccountTimezone(timezone || BROWSER_TZ);
  }, [user, settings.timezone]);

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

  const handleSignOut = async () => {
    const client = createClient();
    
    try {
      // Try to sign out from Supabase
      await client.auth.signOut();
    } catch (e) {
      // Continue even if signOut fails
      console.log('Supabase signOut error (ignored):', e);
    }

    // Clear ALL localStorage items related to auth
    localStorage.removeItem('pomo:gamification');
    localStorage.removeItem('focus-flow-account-settings');
    
    // Also clear Supabase session data from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    setAccountEmail('');
    setAccountFirstName('');
    setAccountLastName('');
    setAccountTimezone((settings.timezone || BROWSER_TZ).replace('/', ' / '));
    onClose();
    
    // Force complete page reload to ensure clean state
    window.location.reload();
  };

  const handleSaveAccount = async () => {
    if (!accountEmail.trim() || !accountFirstName.trim()) {
      toast.error('Missing required fields', {
        description: 'Email and first name are required.',
      });
      return;
    }

    setIsSavingAccount(true);
    try {
      const client = createClient();
      const payload = {
        email: accountEmail.trim(),
        data: {
          first_name: accountFirstName.trim(),
          last_name: accountLastName.trim(),
          full_name: [accountFirstName.trim(), accountLastName.trim()].filter(Boolean).join(' '),
          timezone: accountTimezone,
        },
      };

      if (user) {
        const { error } = await client.auth.updateUser(payload);
        if (error) throw error;
      }

      const normalizedTimezone = accountTimezone.replace(' / ', '/');

      onUpdate({
        displayName: accountFirstName.trim(),
        timezone: normalizedTimezone,
      });

      localStorage.setItem(
        'focus-flow-account-settings',
        JSON.stringify({
          email: accountEmail.trim(),
          firstName: accountFirstName.trim(),
          lastName: accountLastName.trim(),
          timezone: normalizedTimezone,
        }),
      );

      toast.success('Account settings saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save account settings.';
      toast.error('Save failed', { description: message });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleDownloadSettings = () => {
    const accountData = {
      email: accountEmail.trim(),
      firstName: accountFirstName.trim(),
      lastName: accountLastName.trim(),
      timezone: accountTimezone,
      exportedAt: new Date().toISOString(),
      appSettings: settings,
    };

    const blob = new Blob([JSON.stringify(accountData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'focus-flow-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const handleManageBilling = () => {
    window.open('https://supabase.com/dashboard/account/billing', '_blank', 'noopener,noreferrer');
  };

  const welcomeName = accountFirstName.trim() || user?.email?.split('@')[0] || 'User';

  const navItems: { id: NavItem; label: string; icon: typeof Home }[] = [
    { id: 'themes-home', label: t.homeTheme, icon: Home },
    { id: 'clock', label: t.clock, icon: Clock },
    { id: 'timer', label: t.focusTimer, icon: Timer },
    { id: 'goals', label: t.goals, icon: Target },
    { id: 'stats', label: t.stats, icon: BarChart3 },
    { id: 'quotes', label: 'Citações & Relógio', icon: MessageSquareQuote },
    { id: 'shortcuts', label: t.shortcuts, icon: Keyboard },
    { id: 'extras', label: t.extras, icon: Zap },
    { id: 'account', label: t.account, icon: User },
    { id: 'share', label: t.share, icon: Share2 },
    { id: 'support', label: t.support, icon: HelpCircle },
    { id: 'whats-new', label: t.whatsNew, icon: Sparkles },
  ];

  const filteredThemes = themeCat === 'all' ? THEMES : THEMES.filter(the => the.category === themeCat);

  const renderThemeLibrary = (title: string, desc: string, settingKey: 'homeTheme') => (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-black text-white mb-3">Home Theme</h1>
        <p className="text-xl text-white/50">Pick your theme to appear in Home. To see a live preview, ensure your dashboard toggle is set to Home, then come back to this Settings tab.</p>
      </div>

      {/* Custom Upload */}
      <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.05]">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Upload size={12} /> {t.customBackground}
        </h4>
        <div className="flex gap-3">
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
            className="flex-1 py-4 rounded-2xl bg-white/[0.04] border border-dashed border-white/10 text-white/40 text-xs font-bold flex flex-col items-center justify-center gap-2 hover:bg-white/[0.08] cursor-pointer transition-all"
          >
            <Upload size={20} />
            {t.uploadImage}
          </label>
          <button 
            onClick={() => onUpdate({ customBg: null })}
            className="p-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/10"
          >
            <Trash2 size={20} />
          </button>
        </div>
        
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Overlay Opacity</span>
            <span className="text-[10px] text-primary font-black bg-primary/10 px-2 py-0.5 rounded">{settings.bgOverlayOpacity}%</span>
          </div>
          <input 
            type="range" min={0} max={90} step={5} value={settings.bgOverlayOpacity}
            onChange={e => onUpdate({ bgOverlayOpacity: parseInt(e.target.value) })}
            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
      </div>

      {/* Video Background */}
      <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.05]">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Music size={12} /> {t.videoBackground}
        </h4>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Paste YouTube URL" 
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            className="flex-1 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/40 transition-all"
          />
          <button 
            onClick={() => {
              onUpdate({ videoBg: videoUrl });
              toast.success('Background updated!');
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all"
          >
            {t.save}
          </button>
        </div>
      </div>

      {/* Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">{t.themeLibrary}</h4>
          <span className="text-[10px] text-white/20 font-bold">{THEMES.length} total</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {THEME_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setThemeCat(c.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                themeCat === c.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/[0.04] text-white/40 hover:text-white/60'
              }`}>{c.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
              {filteredThemes.map(the => {
                const premium = isThemePremium(the);
                return (
                <button key={the.id}
                  onClick={() => {
                    if (premium && !checkPremium('premium themes')) return;
                    onUpdate({ [settingKey]: the.id } as Pick<Settings, 'homeTheme'>);
                  }}
              className={`relative aspect-video rounded-[20px] overflow-hidden border transition-all group ${
                settings[settingKey] === the.id ? 'ring-2 ring-primary border-transparent scale-[1.02]' : 'border-white/5 hover:border-white/20'
              }`}>
              {the.background && the.background.startsWith('http') ? (
                <img src={the.preview} alt={the.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full" style={{ background: the.preview }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              {premium && (
                <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/30 text-primary border border-primary/40">
                  <Gem size={8} /> Plus
                </span>
              )}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] text-white font-black uppercase tracking-widest truncate pr-1">{the.name}</span>
                {the.isAnimated && (
                  <Zap size={10} className="text-primary fill-current" />
                )}
              </div>
            </button>
                );
              })}
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 350 }} className="settings-sidebar overflow-hidden flex">
            
            {/* Nav */}
            <div className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-4 bg-black/20">
              <button onClick={onClose} className="p-3 rounded-2xl text-white/30 hover:text-white hover:bg-white/5 transition-all mb-4">
                <X size={20} />
              </button>
              {navItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveNav(item.id)}
                  title={item.label}
                  className={`p-3.5 rounded-2xl transition-all ${
                    activeNav === item.id 
                      ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' 
                      : 'text-white/20 hover:text-white/50 hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} strokeWidth={activeNav === item.id ? 2.5 : 2} />
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 settings-content scrollbar-thin p-8">
              {/* THEMES */}
              {activeNav === 'themes-home' && renderThemeLibrary(t.themes, currentLanguage === 'en' ? 'Personalize your dashboard.' : 'Personalize seu painel de controle.', 'homeTheme')}

              {/* CLOCK */}
              {activeNav === 'clock' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.clock}</h3>
                    <p className="text-sm text-white/40">{t.language === 'en' ? 'Personalize your time display.' : 'Personalize a exibição do tempo.'}</p>
                  </div>
                  
                    <div className="space-y-8">

                       {/* Clock Format */}
                       <div className="space-y-3">
                         <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⏰ CLOCK FORMAT</div>
                         <p className="text-[11px] text-white/40 ml-1 mb-3">Choose between 12-hour or 24-hour clock format.</p>
                         <div className="grid grid-cols-2 gap-4">
                           {[
                             { id: '12h', label: '12-hour Clock', preview: '2:24' },
                             { id: '24h', label: '24-hour Clock', preview: '14:24' },
                           ].map(mode => (
                             <button key={mode.id} onClick={() => onUpdate({ clockFormat: mode.id as Settings['clockFormat'] })}
                               className={`aspect-video rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                                 settings.clockFormat === mode.id ? 'ring-2 ring-primary border-transparent scale-[1.02]' : 'border-white/5 hover:border-white/20'
                               }`}
                               style={{
                                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                                 opacity: settings.clockFormat === mode.id ? 1 : 0.7
                               }}>
                               <div className="text-4xl font-black text-white drop-shadow-lg">{mode.preview}</div>
                               <div className="text-[11px] font-bold text-white/80 mt-2">{mode.label}</div>
                             </button>
                           ))}
                         </div>
                       </div>

                      {/* Toggle Options */}
                      <div className="space-y-3">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⚙️ OPÇÕES</div>
                        
                        {[
                          { key: 'flipClock', label: 'Use flip clock', desc: 'Display the clock with a flip animation.', badge: 'NEW' },
                          { key: 'showSeconds', label: 'Show clock seconds', desc: 'Get a detailed time view. Turn off to hide seconds.' },
                          { key: 'showDynamicGreetings', label: 'Show dynamic greetings', desc: 'Turn off for generic greetings.' },
                          { key: 'showGreetings', label: 'Show greetings', desc: 'Turn off to hide dashboard greetings.' },
                        ].map((opt, i) => (
                          <div key={i} className="flex items-start justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-white/80">{opt.label}</span>
                                {opt.badge && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{opt.badge}</span>}
                              </div>
                              {opt.desc && <p className="text-[11px] text-white/40 mt-1">{opt.desc}</p>}
                            </div>
                            <label className="relative inline-flex cursor-pointer mt-1">
                              <input type="checkbox" checked={Boolean(settings[opt.key as keyof Settings] ?? false)} 
                                onChange={e => onUpdate({ [opt.key]: e.target.checked } as Partial<Settings>)}
                                className="sr-only peer" />
                              <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                            </label>
                          </div>
                        ))}
                      </div>

                       {/* Clock & Timer Style */}
                       <div className="space-y-3">
                         <div className="flex items-center gap-3 mb-2">
                           <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">🎨 CLOCK & TIMER FONTS</div>
                           <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">+90 FONTS</span>
                         </div>
                         <p className="text-[11px] text-white/40 ml-1 mb-4">Escolha entre +90 fontes organizadas por categorias.</p>
                         
                         {/* Font Categories */}
                         <div className="flex flex-wrap gap-2 mb-5">
                           {[
                             { id: 'all', label: '✓ Todos', emoji: '📚' },
                             { id: 'cartoon', label: 'Cartoon', emoji: '🎨' },
                             { id: 'retro', label: 'Retro', emoji: '🎮' },
                             { id: 'techno', label: 'Techno', emoji: '🤖' },
                             { id: 'gothic', label: 'Gothic', emoji: '🏰' },
                             { id: 'basic', label: 'Basic', emoji: '📝' },
                             { id: 'script', label: 'Script', emoji: '✍️' },
                             { id: 'decorative', label: 'Decorative', emoji: '✨' },
                             { id: 'foreign', label: 'Foreign', emoji: '🌍' },
                             { id: 'dingbats', label: 'Dingbats', emoji: '🎭' },
                             { id: 'holiday', label: 'Holiday', emoji: '🎄' },
                           ].map(cat => (
                             <button key={cat.id} onClick={() => setFontCategory(cat.id)}
                               className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                 fontCategory === cat.id 
                                   ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                   : 'bg-white/[0.04] text-white/40 hover:text-white/60'
                               }`}>
                               {cat.emoji} {cat.label}
                             </button>
                           ))}
                         </div>
                         
                         {/* Font Grid */}
                         <div className="grid grid-cols-4 gap-3">
                           {[
                             // DEFAULT & BASIC
                             { id: 'default', label: 'Default', font: 'font-inter font-black tracking-tighter', category: ['all', 'basic'] },
                             { id: 'minimal', label: 'Minimal', font: 'font-inter tracking-tighter font-light font-extralight', category: ['all', 'basic'] },
                             { id: 'serif', label: 'Serif', font: 'font-serif italic font-medium', category: ['all', 'basic'] },
                             { id: 'handwritten', label: 'Handwritten', font: 'font-handwritten font-normal', category: ['all', 'script'] },
                             { id: 'minimallight', label: 'Minimal Light', font: 'font-inter tracking-tighter font-thin', category: ['all', 'basic'] },
                             { id: 'serifcondensed', label: 'Serif Condensed', font: 'font-serif tracking-tighter font-semibold', category: ['all', 'basic'] },
                             
                             // TECHNO / SCI-FI
                             { id: 'robotic', label: '🤖 Robotic', font: 'font-robotic tracking-[0.3em] font-bold', category: ['all', 'techno'] },
                             { id: 'digital', label: '📟 Digital', font: 'font-digital tracking-tighter font-black', category: ['all', 'techno'] },
                             { id: 'techmono', label: 'Tech Mono', font: 'font-techmono tracking-wide font-normal', category: ['all', 'techno'] },
                             { id: 'lcd', label: 'LCD', font: 'font-digital tracking-tighter', category: ['all', 'techno'] },
                             { id: 'square', label: 'Square', font: 'font-bebas tracking-widest', category: ['all', 'techno'] },
                             { id: 'michroma', label: 'Michroma', font: 'font-michroma tracking-[0.2em] font-normal', category: ['all', 'techno'] },
                             { id: 'quantico', label: 'Quantico', font: 'font-quantico font-medium tracking-wide', category: ['all', 'techno'] },
                             { id: 'audiowide', label: 'Audiowide', font: 'font-audiowide tracking-[0.15em] font-normal', category: ['all', 'techno'] },
                             { id: 'exo2', label: 'Exo 2', font: 'font-exo2 font-semibold tracking-wide', category: ['all', 'techno'] },
                             
                             // RETRO / OLD SCHOOL
                             { id: 'retro', label: '🎮 Retro', font: 'font-retro tracking-wide text-[0.8em]', category: ['all', 'retro'] },
                             { id: 'typewriter', label: '⌨️ Typewriter', font: 'font-spacemono tracking-wide font-medium', category: ['all', 'retro'] },
                             { id: 'groovy', label: '🌼 Groovy', font: 'font-poppins font-semibold italic', category: ['all', 'retro'] },
                             { id: 'oldschool', label: '🎱 Old School', font: 'font-bebas tracking-widest', category: ['all', 'retro'] },
                             { id: 'stencil', label: '⚔️ Stencil', font: 'font-anton tracking-wider', category: ['all', 'retro'] },
                             { id: 'army', label: '🎖️ Army', font: 'font-staatliches tracking-wide', category: ['all', 'retro'] },
                             
                             // CARTOON / COMIC
                             { id: 'comic', label: '💬 Comic', font: 'font-poppins font-bold', category: ['all', 'cartoon'] },
                             { id: 'cartoon', label: '🎨 Cartoon', font: 'font-handwritten font-bold', category: ['all', 'cartoon'] },
                             { id: 'curly', label: '🌀 Curly', font: 'font-serif italic', category: ['all', 'cartoon'] },
                             { id: 'playful', label: '🎈 Playful', font: 'font-poppins', category: ['all', 'cartoon'] },
                             
                             // GOTHIC / MEDIEVAL
                             { id: 'gothic', label: '🏰 Gothic', font: 'font-serif font-black', category: ['all', 'gothic'] },
                             { id: 'medieval', label: '⚔️ Medieval', font: 'font-serif italic', category: ['all', 'gothic'] },
                             { id: 'celtic', label: '🍀 Celtic', font: 'font-serif', category: ['all', 'gothic'] },
                             
                             // SCRIPT / CALLIGRAPHY
                             { id: 'calligraphy', label: '🖋️ Calligraphy', font: 'font-handwritten', category: ['all', 'script'] },
                             { id: 'brush', label: '🖌️ Brush', font: 'font-handwritten font-bold', category: ['all', 'script'] },
                             { id: 'graffiti', label: '🎨 Graffiti', font: 'font-anton', category: ['all', 'script'] },
                             
                             // FOREIGN LOOK
                             { id: 'chinese', label: '🇨🇳 Chinese', font: 'font-inter font-black', category: ['all', 'foreign'] },
                             { id: 'japanese', label: '🇯🇵 Japanese', font: 'font-inter', category: ['all', 'foreign'] },
                             { id: 'arabic', label: '🇸🇦 Arabic', font: 'font-serif', category: ['all', 'foreign'] },
                             { id: 'mexican', label: '🇲🇽 Mexican', font: 'font-bebas', category: ['all', 'foreign'] },
                             { id: 'russian', label: '🇷🇺 Russian', font: 'font-rajdhani', category: ['all', 'foreign'] },
                             { id: 'greek', label: '🇬🇷 Greek', font: 'font-serif', category: ['all', 'foreign'] },
                             
                             // OTHERS
                             { id: 'poppins', label: 'Poppins', font: 'font-poppins font-semibold', category: ['all', 'basic'] },
                             { id: 'bebas', label: 'Bebas', font: 'font-bebas tracking-widest font-normal', category: ['all', 'basic'] },
                             { id: 'rajdhani', label: 'Rajdhani', font: 'font-rajdhani font-medium tracking-wide', category: ['all', 'basic'] },
                             { id: 'teko', label: 'Teko', font: 'font-teko font-semibold tracking-wide', category: ['all', 'basic'] },
                             { id: 'anton', label: 'Anton', font: 'font-anton tracking-wider font-normal', category: ['all', 'basic'] },
                             { id: 'staatliches', label: 'Staatliches', font: 'font-staatliches tracking-wide font-normal', category: ['all', 'basic'] },
                           ].filter(style => style.category.includes(fontCategory)).map(style => (
                             <button key={style.id} onClick={() => onUpdate({ clockStyle: style.id as Settings['clockStyle'] })}
                               className={`aspect-video rounded-2xl border transition-all flex flex-col items-center justify-center bg-gradient-to-br from-sky-500/20 to-cyan-600/10 ${
                                 settings.clockStyle === style.id ? 'ring-2 ring-primary border-transparent scale-[1.02]' : 'border-white/5 hover:border-white/20'
                               }`}>
                               <div className="absolute top-2 left-2 text-[8px] font-bold text-white/30">flocus</div>
                               <div className="absolute top-2 right-2 text-[6px] text-white/20">Success all depends on the second letter</div>
                               
                               <div className={`text-3xl text-white drop-shadow-md ${style.font}`}>9:24</div>
                               
                               <div className="absolute bottom-4 left-2 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[6px]">⚙️</div>
                               <div className="absolute bottom-4 right-2 flex gap-1">
                                 <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                                 <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                 <div className="w-3 h-3 rounded-full bg-white/10"></div>
                               </div>
                               
                               <div className="text-[11px] font-bold text-white/80 mt-2">{style.label}</div>
                             </button>
                           ))}
                         </div>
                       </div>

                      {/* FONT SIZE SCALE */}
                      <div className="space-y-4 bg-white/[0.04] p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">
                          <Type size={12} /> FONT SIZE SCALE
                        </div>
                        <p className="text-[11px] text-white/40 ml-1 mb-3">Ajuste o tamanho geral das fontes do relógio e timer.</p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Tamanho</span>
                            <span className="text-[10px] text-primary font-black bg-primary/10 px-2 py-0.5 rounded">{Math.round((settings.fontScale || 1) * 100)}%</span>
                          </div>
                          <input 
                            type="range" min={0.6} max={3} step={0.05} value={settings.fontScale || 1}
                            onChange={e => onUpdate({ fontScale: parseFloat(e.target.value) })}
                            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                          />
                        </div>
                      </div>

                      {/* VERTICAL SPACING */}
                      <div className="space-y-4 bg-white/[0.04] p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">
                          <Type size={12} /> VERTICAL SPACING
                        </div>
                        <p className="text-[11px] text-white/40 ml-1 mb-3">Ajuste o espaço acima do contador de tempo.</p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Espaçamento</span>
                            <span className="text-[10px] text-primary font-black bg-primary/10 px-2 py-0.5 rounded">{Math.round((settings.timerVerticalOffset || 1) * 100)}%</span>
                          </div>
                          <input 
                            type="range" min={0} max={2} step={0.05} value={settings.timerVerticalOffset || 1}
                            onChange={e => onUpdate({ timerVerticalOffset: parseFloat(e.target.value) })}
                            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                          />
                        </div>
                      </div>

                      {/* Display Name */}
                      <div className="space-y-4 bg-white/[0.04] p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">
                          <Type size={12} /> Display Name
                        </div>
                        <input 
                          type="text" 
                          value={settings.displayName} 
                          onChange={e => onUpdate({ displayName: e.target.value })}
                          placeholder="Seu nome..."
                          className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold"
                        />
                      </div>

                    </div>
                </div>
              )}

              {/* TIMER */}
              {activeNav === 'timer' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.focusTimer}</h3>
                    <p className="text-sm text-white/40">Customize your timer to match your workflow.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⏱️ {t.timerMode}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {TIMER_MODES.map(mode => (
                          <button key={mode.id} onClick={() => onUpdate({ timerMode: mode.id })}
                            className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              settings.timerMode === mode.id ? 'bg-primary/20 border-primary/40 text-white' : 'bg-white/[0.04] border-white/5 text-white/30 hover:border-white/20'
                            }`}>{mode.label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Task ETA Mode */}
                    <div className="flex items-start justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Target size={16} />
                          </div>
                          <span className="text-sm font-bold text-white/80">Use Task ETA Mode timer <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">BETA</span></span>
                        </div>
                        <p className="text-[11px] text-white/40 mt-2 ml-11">Runs your timer according to task estimates.</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer mt-1">
                        <input type="checkbox" checked={false} className="sr-only peer" />
                        <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>

                    {/* Timer Lengths */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⏲️ Timer Lengths</div>
                      <p className="text-[11px] text-white/40 ml-1 mb-3">For Task ETA Mode, adjust your timer settings in the tasks list.</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: 'work' as const, label: 'Focus' },
                          { key: 'short' as const, label: 'Short Break' },
                          { key: 'long' as const, label: 'Long Break' },
                        ].map(({ key, label }) => (
                          <div key={key} className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.05] transition-all hover:bg-white/[0.06]">
                            <div className="text-[10px] text-white/30 font-black mb-3 uppercase tracking-widest">{label}</div>
                            <div className="flex items-baseline gap-1">
                              <input type="number" value={settings[key]} 
                                min={1} max={120}
                                onChange={e => onUpdate({ [key]: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                                className="bg-transparent text-3xl font-black text-white outline-none tabular-nums w-16" />
                              <span className="text-sm text-white/40">mins</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom Timer Font */}
                    <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.05]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white/80">Custom Timer Font</div>
                          <p className="text-[11px] text-white/40 mt-1">Go to Clock settings to customize your timer and clock style.</p>
                        </div>
                        <button onClick={() => setActiveNav('clock')} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black">Open Settings</button>
                      </div>
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⚙️ OPÇÕES</div>
                      
                      {[
                        { label: 'Use flip clock timer', desc: 'Display the clock with a flip animation.', badge: 'NEW', key: 'flipClock' },
                        { label: 'Show timer progress bar', desc: 'Display a visual progress bar beneath the timer.', key: 'showProgressBar' },
                        { label: 'Show notification', desc: 'Beta feature: Show a browser notification when the timer ends.', badge: 'BETA', key: 'showNotifications' },
                        { label: 'Auto start timer on segment end', desc: 'This will run through the full focus sequence automatically.', key: 'autoNext' },
                        { label: 'Show in-dashboard streak counter', desc: '', key: 'showStreakCounter' },
                        { label: 'Show task in picture-in-picture', desc: '', key: 'pictureInPicture' },
                      ].map((opt, i) => (
                        <div key={i} className="flex items-start justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-white/80">{opt.label}</span>
                              {opt.badge && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{opt.badge}</span>}
                            </div>
                            {opt.desc && <p className="text-[11px] text-white/40 mt-1">{opt.desc}</p>}
                          </div>
                          <label className="relative inline-flex cursor-pointer mt-1">
                            <input type="checkbox" checked={opt.key ? Boolean(settings[opt.key as keyof Settings] ?? false) : false} 
                              onChange={e => opt.key && onUpdate({ [opt.key]: e.target.checked } as Partial<Settings>)}
                              className="sr-only peer" />
                            <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Alert Sound */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">🔔 Alert Sound</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'sparkle', label: '✨ Sparkle' },
                          { id: 'train', label: '🚈 Train Arrival' },
                          { id: 'commuter', label: '🚉 Commuter Jingle' },
                          { id: 'gameshow', label: '🎲 Game Show' },
                          { id: 'airport', label: '🛫 Airport' },
                          { id: 'soft', label: '☁️ Soft' },
                          { id: 'chime', label: '🔔 Chime' },
                          { id: 'piano', label: '🎹 Piano' },
                          { id: 'success', label: '🏆 Success' },
                          { id: 'levelup', label: '👾 Level Up' },
                          { id: 'applause', label: '👏 Applause' },
                          { id: 'none', label: '🔕 No Alert' },
                        ].map(s => (
                          <button key={s.id} onClick={() => onUpdate({ alertSound: s.id })}
                            className={`p-3 rounded-xl text-[11px] font-bold border transition-all ${
                              settings.alertSound === s.id ? 'bg-primary/20 border-primary/40 text-white' : 'bg-white/[0.04] border-white/5 text-white/40 hover:border-white/20'
                            }`}>{s.label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Session Tallies */}
                    <div className="space-y-4">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">📊 Session Tallies</div>
                      <p className="text-[11px] text-white/40 ml-1 mb-3">Each tally represents one complete focus session.</p>
                      
                      {/* Static Session Tally */}
                      <div>
                        <div className="text-[11px] font-bold text-white/60 mb-2">Static Session Tally</div>
                        <p className="text-[11px] text-white/30 mb-4">The same icon repeats for each session.</p>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'dots', label: 'Dots', emoji: '⚪' },
                            { id: 'hearts', label: 'Hearts', emoji: '🤍' },
                            { id: 'stars', label: '⭐️ Stars', emoji: '⭐' },
                            { id: 'tomatoes', label: '🍅 Tomatoes', emoji: '🍅' },
                            { id: 'bolts', label: '⚡️ Bolts', emoji: '⚡' },
                            { id: 'graduation', label: '🎓 Graduation', emoji: '🎓' },
                            { id: 'snowflake', label: '❄️ Snowflake', emoji: '❄️' },
                            { id: 'snowman', label: '☃️ Snowman', emoji: '☃️' },
                            { id: 'christmas', label: '🎄 Christmas Tree', emoji: '🎄' },
                          ].map(tally => (
                            <button key={tally.id} onClick={() => onUpdate({ tallyStyle: tally.id })}
                              className={`relative p-3.5 rounded-2xl text-[11px] font-bold border transition-all ${
                                settings.tallyStyle === tally.id ? 'bg-primary/20 border-primary/40 text-white scale-[1.02]' : 'bg-white/[0.04] border-white/5 text-white/40 hover:border-white/20'
                              }`}>
                              <div className="text-2xl mb-2">{tally.emoji}</div>
                              <div>{tally.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Session Tally */}
                      <div className="mt-8">
                        <div className="text-[11px] font-bold text-white/60 mb-2">Dynamic Session Tally</div>
                        <p className="text-[11px] text-white/30 mb-4">Icons that evolve with each session.</p>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'growingtree', label: 'Growing Tree', emojis: '🌰🌱🌿🌳' },
                            { id: 'flowerbloom', label: 'Flower Bloom', emojis: '🌱☀️🌷🌸' },
                            { id: 'studygrind', label: 'Study Grind', emojis: '📚✏️🎓💼' },
                            { id: 'spacetrip', label: 'Going To Space', emojis: '🚀🌙🛸🪐' },
                            { id: 'nyc', label: 'NYC Vacation', emojis: '✈️🗽🍎🏙️' },
                            { id: 'tokyo', label: 'Tokyo Vacation', emojis: '✈️🗾🍣🗼' },
                            { id: 'beach', label: 'Beach Vacation', emojis: '✈️🌊🏖️🌴' },
                            { id: 'mountain', label: 'Mountain Climb', emojis: '🧗⛰️🏔️🏕️' },
                            { id: 'selfcare', label: 'Self Care Evening', emojis: '🛁🕯️🧖💆' },
                            { id: 'mealprep', label: 'Meal Prep', emojis: '🥬🍳🥘🍽️' },
                            { id: 'rainbow', label: 'Rain to Rainbow', emojis: '🌧️⛈️🌤️🌈' },
                            { id: 'stem', label: 'STEM', emojis: '🔬🧪⚛️🧮' },
                            { id: 'medical', label: 'Medical', emojis: '🩺💊💉🏥' },
                            { id: 'law', label: 'Law', emojis: '⚖️📜🏛️👨‍⚖️' },
                            { id: 'art', label: 'Art', emojis: '🎨✏️🖼️🖌️' },
                          ].map(tally => (
                            <button key={tally.id} onClick={() => onUpdate({ tallyStyle: tally.id })}
                              className={`relative p-3.5 rounded-2xl text-[11px] font-bold border transition-all ${
                                settings.tallyStyle === tally.id ? 'bg-primary/20 border-primary/40 text-white scale-[1.02]' : 'bg-white/[0.04] border-white/5 text-white/40 hover:border-white/20'
                              }`}>
                              <div className="text-xl mb-2 tracking-widest">{tally.emojis}</div>
                              <div>{tally.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* GOALS */}
              {activeNav === 'goals' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.goals}</h3>
                    <p className="text-sm text-white/40">{t.language === 'en' ? 'Configure your focus targets and track your progress.' : 'Configure suas metas de foco e acompanhe o seu progresso.'}</p>
                  </div>

                  {/* Cards de Progresso Atual */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-purple-500/15 to-violet-500/5 rounded-[24px] p-5 border border-purple-500/20">
                      <div className="text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em] mb-2">HOJE</div>
                      <div className="text-4xl font-black text-white mb-1">0/{goals.dailySessions}</div>
                      <div className="text-xs text-white/40">sessões concluídas</div>
                      <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-500/15 to-green-500/5 rounded-[24px] p-5 border border-emerald-500/20">
                      <div className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] mb-2">ESTA SEMANA</div>
                      <div className="text-4xl font-black text-white mb-1">0/{goals.weeklySessions}</div>
                      <div className="text-xs text-white/40">sessões concluídas</div>
                      <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Configuração das Metas */}
                  <div className="space-y-6">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⚙️ DEFINIR OBJETIVOS</div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'dailySessions' as const, label: 'Sessões Diárias', min: 1, max: 20, unit: '', color: 'purple', icon: '🎯' },
                        { key: 'dailyMinutes' as const, label: 'Minutos Diários', min: 15, max: 480, unit: 'm', color: 'blue', icon: '⏱️' },
                        { key: 'weeklySessions' as const, label: 'Sessões Semanais', min: 5, max: 100, unit: '', color: 'emerald', icon: '📅' },
                        { key: 'weeklyMinutes' as const, label: 'Minutos Semanais', min: 60, max: 2400, unit: 'm', color: 'orange', icon: '🔥' },
                      ].map(goal => (
                        <div key={goal.key} className="bg-white/[0.04] rounded-[20px] p-4 border border-white/[0.05] transition-all hover:bg-white/[0.06] hover:scale-[1.02] group">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{goal.icon}</span>
                              <div>
                                <div className="text-sm font-black text-white/80">{goal.label}</div>
                                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">OBJETIVO</div>
                              </div>
                            </div>
                            <div className="text-2xl font-black text-white">{goals[goal.key]}{goal.unit}</div>
                          </div>
                          <input type="range" min={goal.min} max={goal.max} step={goal.key.includes('Minutes') ? 15 : 1}
                            value={goals[goal.key]}
                            onChange={e => setGoals({ [goal.key]: parseInt(e.target.value) })}
                            className="w-full accent-primary h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metas Mensais */}
                  <div className="bg-white/[0.04] rounded-[24px] p-6 border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-[10px] font-black text-yellow-400/70 uppercase tracking-[0.2em] mb-1">⭐ META MENSAL</div>
                        <div className="text-base font-black text-white/90">Desafio do Mês</div>
                      </div>
                      <div className="text-3xl">🏆</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                        <span className="text-sm text-white/60">Dias consecutivos</span>
                        <span className="text-sm font-black text-yellow-400">30 dias</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                        <span className="text-sm text-white/60">Horas totais</span>
                        <span className="text-sm font-black text-yellow-400">50 horas</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                        <span className="text-sm text-white/60">Consistência</span>
                        <span className="text-sm font-black text-yellow-400">90%</span>
                      </div>
                    </div>
                  </div>

                  {/* Opções Adicionais */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⚡ OPÇÕES</div>
                    
                    {[
                      { label: 'Notificar quando meta for atingida', desc: 'Receber aviso quando completar o objetivo diário', checked: true },
                      { label: 'Resetar automaticamente', desc: 'Zerar progresso no começo de cada dia', checked: true },
                      { label: 'Mostrar contador no dashboard', desc: 'Exibir progresso na página principal', checked: false },
                      { label: 'Celebração ao completar', desc: 'Efeito especial quando meta for alcançada', checked: true },
                    ].map((opt, i) => (
                      <div key={i} className="flex items-start justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white/80">{opt.label}</div>
                          <div className="text-[11px] text-white/40 mt-1">{opt.desc}</div>
                        </div>
                        <label className="relative inline-flex cursor-pointer mt-1">
                          <input type="checkbox" checked={opt.checked} className="sr-only peer" />
                          <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STATS */}
              {activeNav === 'stats' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.stats}</h3>
                    <p className="text-sm text-white/40">{t.language === 'en' ? 'View your focus history and productivity trends.' : 'Visualiza o teu histórico de foco e tendências de produtividade.'}</p>
                  </div>
                  <StatsPanel history={history} onClearHistory={onClearHistory} />
                </div>
              )}
              
              {/* QUOTES */}
              {activeNav === 'quotes' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.quotes}</h3>
                    <p className="text-sm text-white/40">{t.language === 'en' ? 'Control inspiration settings.' : 'Controle a inspiração do seu ambiente.'}</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <MessageSquareQuote size={16} />
                        </div>
                        <span className="text-sm font-bold text-white/80">{t.showGreetings}</span>
                      </div>
                      <label className="relative inline-flex cursor-pointer">
                        <input type="checkbox" checked={settings.showGreetings} 
                          onChange={e => onUpdate({ showGreetings: e.target.checked })} className="sr-only peer" />
                        <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>

                     <div className="space-y-3">
                       <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                             <Clock size={16} />
                           </div>
                           <span className="text-sm font-bold text-white/80">Mostrar Relógio</span>
                         </div>
                         <label className="relative inline-flex cursor-pointer">
                           <input type="checkbox" checked={settings.showClock} 
                             onChange={e => onUpdate({ showClock: e.target.checked })} className="sr-only peer" />
                           <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                         </label>
                       </div>

                       <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                             <MessageSquareQuote size={16} />
                           </div>
                           <span className="text-sm font-bold text-white/80">Mostrar Frase Motivacional</span>
                         </div>
                         <label className="relative inline-flex cursor-pointer">
                           <input type="checkbox" checked={settings.showQuote} 
                             onChange={e => onUpdate({ showQuote: e.target.checked })} className="sr-only peer" />
                           <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                         </label>
                       </div>

                       <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                             <Sparkles size={16} />
                           </div>
                           <span className="text-sm font-bold text-white/80">Mostrar Logotipo Focus Flow</span>
                         </div>
                         <label className="relative inline-flex cursor-pointer">
                           <input type="checkbox" checked={settings.showLogo} 
                             onChange={e => onUpdate({ showLogo: e.target.checked })} className="sr-only peer" />
                           <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                         </label>
                       </div>
                     </div>

                     <div className="space-y-4 bg-white/[0.04] p-6 rounded-2xl border border-white/5">
                       <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">{t.quoteCategory}</div>
                       <div className="grid grid-cols-1 gap-2">
                         {['motivational', 'inspirational', 'selfcare', 'productivity', 'wisdom'].map(cat => (
                           <button 
                             key={cat}
                             onClick={() => onUpdate({ quoteCategory: cat })}
                             className={`px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all text-left flex items-center justify-between ${
                               settings.quoteCategory === cat ? 'bg-primary/20 border-primary/40 text-white scale-[1.02]' : 'bg-black/20 border-white/5 text-white/30 hover:border-white/20'
                             }`}
                           >
                             <span>{cat}</span>
                             {settings.quoteCategory === cat && <Sparkles size={12} className="text-primary fill-current" />}
                           </button>
                         ))}
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {/* EXTRAS */}
              {activeNav === 'extras' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.extras}</h3>
                    <p className="text-sm text-white/40">{currentLanguage === 'en' ? 'Supercharge your experience with these advanced settings.' : 'Potencialize a sua experiência com estas configurações avançadas.'}</p>
                  </div>

                  {/* Dashboard Display Name */}
                  <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.05]">
                    <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User size={12} /> {t.dashboardDisplayName}
                    </h4>
                    <p className="text-[11px] text-white/30 mb-3">{currentLanguage === 'en' ? "Update your name that appears in the Home dashboard." : "Atualize o seu nome que aparece no dashboard."}</p>
                    <input 
                      type="text" 
                      value={settings.displayName} 
                      onChange={e => onUpdate({ displayName: e.target.value })}
                      placeholder={currentLanguage === 'en' ? "Your name..." : "O seu nome..."}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold"
                    />
                  </div>

                  {/* Default Settings Tab */}
                  <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.05]">
                    <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <SettingsIcon size={12} /> {t.defaultSettingsTab}
                      <span className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                        <Gem size={9} /> Plus
                      </span>
                    </h4>
                    <p className="text-[11px] text-white/30 mb-3">{currentLanguage === 'en' ? "Choose which tab shows when you open the Settings Panel." : "Escolha qual aba mostra quando abre o painel de configurações."}</p>
                    <select
                      value={settings.defaultSettingsTab}
                      onChange={e => { if (!checkPremium(t.defaultSettingsTab)) return; onUpdate({ defaultSettingsTab: e.target.value }); }}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold"
                    >
                      <option value="recently-opened">{t.recentlyOpened}</option>
                      <option value="themes-home">{t.themes}</option>
                      <option value="clock">{t.clock}</option>
                      <option value="timer">{t.focusTimer}</option>
                      <option value="goals">{t.goals}</option>
                      <option value="stats">{t.stats}</option>
                    </select>
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-3">
                    {[
                      { key: 'disableAnimatedThemes' as const, label: t.disableAnimatedThemes, desc: currentLanguage === 'en' ? 'Recommended for older devices, especially if you are experiencing lag or timer interruptions. Refresh to take effect.' : 'Recomendado para dispositivos antigos, especialmente se estiver a experiencing lag or timer interruptions. Atualize para aplicar.', icon: Zap },
                      { key: 'clearMode' as const, label: t.clearMode, desc: currentLanguage === 'en' ? 'Hide extra UI elements when your mouse is not over the browser window. May not work on tablets.' : 'Ocultar elementos de interface extra quando o mouse não está sobre a janela do navegador. Pode não funcionar em tablets.', icon: Shield, plus: true },
                      { key: 'preventSleep' as const, label: t.preventSleep, desc: currentLanguage === 'en' ? "Prevent your device from dimming or turning the screen off. May impact battery life." : "Evitar que o seu dispositivo diminua ou desligue o ecrã. Pode impactar a bateria.", icon: Info, showStatus: true, plus: true },
                      { key: 'showShareButton' as const, label: t.showShareButton, desc: currentLanguage === 'en' ? 'Show or hide the share button next to settings.' : 'Mostrar ou ocultar o botão de compartilhar ao lado das configurações.', icon: Share2, plus: true },
                      { key: 'randomizeTheme' as const, label: t.themeRandomizer, desc: currentLanguage === 'en' ? 'Show a different, random home theme when loading Flocus.' : 'Mostrar um tema inicial diferente e aleatório ao carregar o Flocus.', icon: Palette },
                      { key: 'forceBreakLock' as const, label: t.lockDuringBreaks, desc: currentLanguage === 'en' ? 'Prevent app use during break time' : 'Evitar uso do app durante o descanso', icon: Shield },
                    ].map(({ key, label, desc, icon: Icon, showStatus, plus }) => (
                      <div key={key} className={`group flex items-start justify-between gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.06]`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary transition-colors">
                               <Icon size={16} />
                            </div>
                            <h4 className="text-sm font-black text-white/90">{label}</h4>
                            {plus && (
                              <span className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                                <Gem size={9} /> Plus
                              </span>
                            )}
                            {showStatus && (
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${settings[key as keyof typeof settings] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                                {settings[key as keyof typeof settings] ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/30 mt-2 leading-relaxed ml-11">{desc}</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer mt-1">
                          <input type="checkbox" checked={Boolean(settings[key as keyof Settings])} onChange={e => { if (plus && !checkPremium(label)) return; onUpdate({ [key]: e.target.checked }); }} className="sr-only peer" />
                          <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SHORTCUTS */}
              {activeNav === 'shortcuts' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.shortcuts}</h3>
                    <p className="text-sm text-white/40">{t.language === 'en' ? 'Quick keyboard actions.' : 'Ações rápidas de teclado.'}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {SHORTCUTS.map(s => (
                      <div key={s.key} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-all">
                        <span className="text-sm font-bold text-white/60 group-hover:text-white/90">{s.action}</span>
                        <kbd className="px-4 py-2 rounded-xl bg-black/40 text-xs font-black font-mono text-primary border border-white/10 shadow-2xl shadow-black/40">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACCOUNT */}
              {activeNav === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.account}</h3>
                    <p className="text-sm text-white/40">Manage your profile and account preferences.</p>
                  </div>

                  <div className="bg-white/[0.04] rounded-[32px] p-8 border border-white/5 space-y-8">
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/20">
                          <User size={40} />
                        </div>
                        <div>
                          <div className="text-[10px] text-primary uppercase font-black tracking-[0.3em] mb-2">
                            Account
                          </div>
                          <h4 className="text-2xl font-black text-white leading-tight">
                            Welcome {welcomeName} 👋
                          </h4>
                        </div>
                      </div>

                      {user && (
                        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.25em]">
                          {t.authenticated}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">
                          Email
                        </label>
                        <input
                          type="email"
                          value={accountEmail}
                          onChange={(e) => setAccountEmail(e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">
                          First name
                        </label>
                        <input
                          type="text"
                          value={accountFirstName}
                          onChange={(e) => setAccountFirstName(e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">
                          Last name (optional)
                        </label>
                        <input
                          type="text"
                          value={accountLastName}
                          onChange={(e) => setAccountLastName(e.target.value)}
                          placeholder="Add your surname"
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold placeholder:text-white/20"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">
                          Account timezone:
                        </label>
                        <select
                          value={accountTimezone}
                          onChange={(e) => setAccountTimezone(e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold"
                        >
                          <option value="Africa / Abidjan">Africa / Abidjan</option>
                          <option value="Africa / Maputo">Africa / Maputo</option>
                          <option value="Africa / Johannesburg">Africa / Johannesburg</option>
                          <option value="Europe / Lisbon">Europe / Lisbon</option>
                          <option value="Europe / London">Europe / London</option>
                          <option value="America / New_York">America / New_York</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[28px] border border-primary/15 bg-primary/[0.07] p-5 md:p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="space-y-1">
                            <div className="text-[10px] text-primary uppercase font-black tracking-[0.28em]">
                              Primary action
                            </div>
                            <h5 className="text-lg font-black text-white">
                              Save your account changes
                            </h5>
                            <p className="text-sm text-white/50 max-w-md">
                              Update your profile details and apply the selected timezone to the dashboard.
                            </p>
                          </div>

                          <button
                            onClick={handleSaveAccount}
                            disabled={isSavingAccount}
                            className="w-full md:w-auto md:min-w-[240px] py-4 px-6 rounded-2xl text-sm font-black text-white bg-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all shadow-2xl shadow-primary/20"
                          >
                            <Save size={18} /> {isSavingAccount ? 'Saving...' : 'Save changes'}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-white/5 bg-white/[0.03] p-5 md:p-6 space-y-4">
                        <div>
                          <div className="text-[10px] text-white/35 uppercase font-black tracking-[0.25em] mb-1">
                            Secondary actions
                          </div>
                          <p className="text-sm text-white/45">
                            Export your configuration or manage subscription and billing details.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button
                            onClick={handleDownloadSettings}
                            className="py-4 px-5 rounded-2xl text-sm font-black text-white bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center gap-3 transition-all border border-white/10"
                          >
                            <Download size={18} /> Download settings
                          </button>

                          <button
                            onClick={handleManageBilling}
                            className="py-4 px-5 rounded-2xl text-sm font-black text-white bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center gap-3 transition-all border border-white/10"
                          >
                            <CreditCard size={18} /> Manage account & billing
                          </button>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-red-500/10 bg-red-500/[0.04] p-5 md:p-6 space-y-4">
                        <div>
                          <div className="text-[10px] text-red-300/80 uppercase font-black tracking-[0.25em] mb-1">
                            Danger zone
                          </div>
                          <p className="text-sm text-white/45">
                            Sign out of the current session on this device.
                          </p>
                        </div>

                        <button
                          onClick={handleSignOut}
                          className="w-full md:w-auto py-4 px-6 rounded-2xl text-sm font-black text-white bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center gap-3 transition-all border border-red-500/10"
                        >
                          <LogOut size={18} /> Log out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SHARE */}
              {activeNav === 'share' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.shareAndCommunity}</h3>
                    <p className="text-sm text-white/40">{t.language === 'en' ? 'Join our community.' : 'Junte-se à nossa comunidade.'}</p>
                  </div>
                  
                  <div className="bg-[#5865F2]/10 rounded-[32px] p-8 border border-[#5865F2]/20 shadow-2xl shadow-[#5865F2]/10">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 rounded-3xl bg-[#5865F2] flex items-center justify-center text-white shadow-2xl shadow-[#5865F2]/30">
                        <Users size={32} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white">{t.joinDiscord}</h4>
                        <p className="text-[10px] text-[#5865F2] font-black uppercase tracking-[0.3em] mt-1">Productivity Lovers</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open('https://discord.gg/focusflow', '_blank')}
                      className="w-full py-5 rounded-2xl bg-[#5865F2] text-white text-sm font-black hover:bg-[#4752C4] transition-all shadow-xl shadow-[#5865F2]/20">
                      Join Community
                    </button>
                  </div>

                  <div className="bg-white/[0.03] rounded-[32px] p-8 border border-white/5 transition-all hover:bg-white/[0.05]">
                    <h4 className="text-sm font-black text-white/90 mb-2">{t.inviteFriends}</h4>
                    <p className="text-xs text-white/30 mb-6 leading-relaxed">Share Focus Flow with your friends and focus together!</p>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-black/40 rounded-2xl px-5 py-5 text-[10px] text-white/20 truncate border border-white/5 flex items-center font-mono italic">
                        https://focusflow.app/invite/user-123
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('https://focusflow.app/invite/user-123');
                          toast.success(t.linkCopied);
                        }}
                        className="px-8 py-5 rounded-2xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all shadow-2xl shadow-primary/30">
                        {t.copyLink}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUPPORT */}
              {activeNav === 'support' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.support}</h3>
                  </div>
                  <div className="bg-white/[0.03] rounded-[32px] p-8 border border-white/5">
                    <p className="text-sm text-white/70 leading-relaxed mb-6">
                      {currentLanguage === 'en' 
                        ? "Thanks for using Flocus!"
                        : "Obrigado por usar Flocus!"}
                    </p>
                    <p className="text-sm text-white/50 leading-relaxed mb-6">
                      {currentLanguage === 'en'
                        ? "Check out the Help Center for answers to common questions, or share your thoughts with us via the feedback form below. We're a small team and always improving Flocus to make your experience better!"
                        : "Consulta o Help Center para respostas a perguntas frequentes, ou partilha connosco através do formulário de feedback abaixo. Somos uma pequena equipa e estamos sempre a melhorar o Flocus para tornar a tua experiência melhor!"}
                    </p>
                    <p className="text-sm text-white/50 leading-relaxed mb-6">
                      {currentLanguage === 'en'
                        ? "If you need extra help, you can also reach out using Contact Us below or email support@flocus.com. For technical issues or bugs, add a brief description of the problem along with your device, browser, and operating system. Screenshots or screen recordings are also super helpful."
                        : "Se precisares de mais ajuda, podes contactar-nos através do Contact Us abaixo ou enviar email para support@flocus.com. Para problemas técnicos ou bugs, adiciona uma breve descrição do problema junto com o teu dispositivo, navegador e sistema operativo. Screenshots ou gravações de ecrã também são muito úteis."}
                    </p>
                    <div className="text-sm font-bold text-white/40 mb-6">
                      {currentLanguage === 'en' ? "Your version number is: v1.9.1" : "O teu número de versão é: v1.9.1"}
                    </div>
                    <div className="bg-[#5865F2]/10 rounded-[24px] p-6 border border-[#5865F2]/20 mb-6">
                      <p className="text-sm text-white/70 mb-4">
                        {currentLanguage === 'en'
                          ? "Join our Discord community to connect with likeminded productivity lovers!"
                          : "Junta-te à nossa comunidade Discord para conectar com amantes de produtividade!"}
                      </p>
                      <button 
                        onClick={() => window.open('https://discord.gg/focusflow', '_blank')}
                        className="py-3 px-6 rounded-2xl bg-[#5865F2] text-white text-sm font-black hover:bg-[#4752C4] transition-all"
                      >
                        {t.joinDiscord}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => window.open('https://flocus.com/help', '_blank')}
                        className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-sm font-bold text-white/70 hover:text-white flex items-center gap-4 transition-all"
                      >
                        <HelpCircle size={20} className="text-primary" />
                        {t.helpCenter}
                      </button>
                      <button 
                        onClick={() => window.open('https://flocus.com/feedback', '_blank')}
                        className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-sm font-bold text-white/70 hover:text-white flex items-center gap-4 transition-all"
                      >
                        <MessageSquareQuote size={20} className="text-primary" />
                        {t.leaveFeedback}
                      </button>
                      <button 
                        onClick={() => window.open('mailto:support@flocus.com', '_blank')}
                        className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-sm font-bold text-white/70 hover:text-white flex items-center gap-4 transition-all"
                      >
                        <HelpCircle size={20} className="text-primary" />
                        {t.contactSupport}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* WHAT'S NEW */}
              {activeNav === 'whats-new' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{t.whatsNew}</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { v: 'v2.0', title: 'Major Update 🚀', desc: 'Theme library, gamification (XP/levels/badges), daily goals, keyboard shortcuts, task templates, heatmap, and more!' },
                      { v: 'v1.0', title: 'Launch', desc: 'Full Pomodoro system with tasks, sounds, stats, and customization.' },
                    ].map(item => (
                      <div key={item.v} className="bg-white/[0.03] rounded-[32px] p-8 border border-white/5 space-y-3 transition-all hover:bg-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full tracking-widest">{item.v}</span>
                          <h4 className="text-base font-black text-white">{item.title}</h4>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
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
