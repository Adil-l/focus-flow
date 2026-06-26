import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Timer, BarChart3, MessageSquareQuote, Zap, User, HelpCircle, Sparkles, Target, Keyboard, Home, Share2, ShieldBan } from 'lucide-react';
import type { Settings, TimerPreset, HistoryEntry } from '@/stores/pomodoroStore';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { openBillingPortal } from '@/lib/billing';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

import ThemesSection from './settings/ThemesSection';
import ClockSection from './settings/ClockSection';
import TimerSection from './settings/TimerSection';
import GoalsSection from './settings/GoalsSection';
import StatsSection from './settings/StatsSection';
import QuotesSection from './settings/QuotesSection';
import ExtrasSection from './settings/ExtrasSection';
import ShortcutsSection from './settings/ShortcutsSection';
import AccountSection from './settings/AccountSection';
import ShareSection from './settings/ShareSection';
import SupportSection from './settings/SupportSection';
import WhatsNewSection from './settings/WhatsNewSection';
import BlockerSection from './settings/BlockerSection';

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

type NavItem = 'themes-home' | 'clock' | 'timer' | 'stats' | 'quotes' | 'extras' | 'goals' | 'shortcuts' | 'blocker' | 'account' | 'share' | 'support' | 'whats-new';

// Neutral default timezone derived from the visitor's browser (never a hardcoded person/locale).
const BROWSER_TZ = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';

export default function SettingsSidebar({
  open, onClose, settings, onUpdate, history, onClearHistory, onOpenAuth,
}: SettingsSidebarProps) {
  const { t, currentLanguage, setLanguage, language } = useTranslation();
  const [activeNav, setActiveNav] = useState<NavItem>(() => {
    const tab = settings.defaultSettingsTab;
    const valid: NavItem[] = ['themes-home', 'clock', 'timer', 'stats', 'quotes', 'extras', 'goals', 'shortcuts', 'account', 'share', 'support', 'whats-new'];
    return tab && tab !== 'recently-opened' && valid.includes(tab as NavItem) ? (tab as NavItem) : 'themes-home';
  });
  const { user } = useAuth();

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

  const handleSignOut = async () => {
    const client = createClient();

    try {
      // Try to sign out from Supabase
      await client.auth.signOut();
    } catch (e) {
      // Continue even if signOut fails
      console.warn('Supabase signOut error (ignored):', e);
    }

    // Clear ALL per-user data so the next person on this device can't see (or
    // accidentally seed their cloud row with) the previous user's tasks,
    // history, notes, settings, gamification or recovery data. We keep only the
    // device-level language preference. Without this, the soft remount would
    // re-hydrate the stores from the previous user's residual localStorage.
    try {
      Object.keys(localStorage).forEach((key) => {
        if (
          (key.startsWith('pomo:') && key !== 'pomo:language') ||
          key === 'focus-flow-account-settings' ||
          key.includes('supabase') ||
          key.includes('sb-')
        ) {
          localStorage.removeItem(key);
        }
      });
      // Cloud-sync session baselines live in sessionStorage — clear them too, or
      // a same-session re-login would skip the cloud pull and trust stale data.
      sessionStorage.removeItem('pomo:cloud-synced');
      sessionStorage.removeItem('pomo:cloud-since');
    } catch (e) {
      console.warn('sign-out storage clear failed (ignored):', e);
    }

    setAccountEmail('');
    setAccountFirstName('');
    setAccountLastName('');
    setAccountTimezone((settings.timezone || BROWSER_TZ).replace('/', ' / '));
    onClose();

    // Soft reset instead of a full webview reload: bumping the app's reset key
    // (handled in App.tsx) remounts the routed tree, so every store hook
    // re-initialises from the now-cleared localStorage — clean state, no white
    // flash and without re-running desktop init (kiosk, onboarding checks).
    window.dispatchEvent(new Event('focusflow:signout'));
  };

  const handleSaveAccount = async () => {
    if (!accountEmail.trim() || !accountFirstName.trim()) {
      toast.error(t.missingRequiredFields, {
        description: t.emailFirstNameRequired,
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

      toast.success(t.accountSettingsSaved);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.unableToSaveAccount;
      toast.error(t.saveFailed, { description: message });
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
    toast.success(t.settingsExported);
  };

  const handleManageBilling = () => {
    void openBillingPortal();
  };

  const welcomeName = accountFirstName.trim() || user?.email?.split('@')[0] || (language === 'pt' ? 'Utilizador' : 'User');

  const navItems: { id: NavItem; label: string; icon: typeof Home }[] = [
    { id: 'themes-home', label: t.homeTheme, icon: Home },
    { id: 'clock', label: t.clock, icon: Clock },
    { id: 'timer', label: t.focusTimer, icon: Timer },
    { id: 'goals', label: t.goals, icon: Target },
    { id: 'stats', label: t.stats, icon: BarChart3 },
    { id: 'quotes', label: t.quotesNav, icon: MessageSquareQuote },
    { id: 'shortcuts', label: t.shortcuts, icon: Keyboard },
    { id: 'blocker', label: t.blockerNav, icon: ShieldBan },
    { id: 'extras', label: t.extras, icon: Zap },
    { id: 'account', label: t.account, icon: User },
    { id: 'support', label: t.support, icon: HelpCircle },
  ];

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
              {/* Language toggle (EN / PT) — always visible at the top of the nav */}
              <button
                onClick={() => setLanguage(currentLanguage === 'pt' ? 'en' : 'pt')}
                title={currentLanguage === 'pt' ? 'Switch to English' : 'Mudar para Português'}
                className="mb-2 rounded-xl border border-white/15 px-2 py-1.5 text-[11px] font-black tracking-wider text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                🌐 {currentLanguage === 'pt' ? 'PT' : 'EN'}
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
              {activeNav === 'themes-home' && (
                <ThemesSection
                  settings={settings}
                  onUpdate={onUpdate}
                  checkPremium={checkPremium}
                  customBackgroundLabel={t.customBackground}
                  uploadImageLabel={t.uploadImage}
                  videoBackgroundLabel={t.videoBackground}
                  themeLibraryLabel={t.themeLibrary}
                  saveLabel={t.save}
                />
              )}

              {activeNav === 'clock' && (
                <ClockSection
                  title={t.clock}
                  subtitle={t.clockSubtitle}
                  settings={settings}
                  onUpdate={onUpdate}
                />
              )}

              {activeNav === 'timer' && (
                <TimerSection
                  title={t.focusTimer}
                  subtitle={t.timerSubtitle}
                  settings={settings}
                  onUpdate={onUpdate}
                  onNavigateToClock={() => setActiveNav('clock')}
                  timerModeLabel={t.timerMode}
                />
              )}

              {activeNav === 'goals' && (
                <GoalsSection
                  title={t.goals}
                  subtitle={t.goalsSubtitle}
                  history={history}
                  settings={settings}
                  onUpdate={onUpdate}
                />
              )}

              {activeNav === 'stats' && (
                <StatsSection
                  title={t.stats}
                  subtitle={t.statsSubtitle}
                  history={history}
                  onClearHistory={onClearHistory}
                />
              )}

              {activeNav === 'quotes' && (
                <QuotesSection
                  title={t.quotes}
                  subtitle={t.quotesSubtitle}
                  settings={settings}
                  onUpdate={onUpdate}
                  showGreetingsLabel={t.showGreetings}
                  quoteCategoryLabel={t.quoteCategory}
                />
              )}

              {activeNav === 'extras' && (
                <ExtrasSection
                  settings={settings}
                  onUpdate={onUpdate}
                  checkPremium={checkPremium}
                  currentLanguage={currentLanguage}
                  t={t}
                />
              )}

              {activeNav === 'shortcuts' && (
                <ShortcutsSection
                  title={t.shortcuts}
                  subtitle={t.shortcutsSubtitle}
                />
              )}

              {activeNav === 'blocker' && (
                <BlockerSection
                  title={currentLanguage === 'pt' ? 'Bloqueador de foco' : 'Focus Blocker'}
                  subtitle={language === 'en' ? 'Block distracting, gambling and adult sites by category.' : 'Bloqueia sites distrativos, de apostas e adultos por categoria.'}
                  blocker={settings.blocker}
                  onUpdate={onUpdate}
                />
              )}

              {activeNav === 'account' && (
                <AccountSection
                  title={t.account}
                  isAuthenticated={Boolean(user)}
                  authenticatedLabel={t.authenticated}
                  welcomeName={welcomeName}
                  accountEmail={accountEmail}
                  setAccountEmail={setAccountEmail}
                  accountFirstName={accountFirstName}
                  setAccountFirstName={setAccountFirstName}
                  accountLastName={accountLastName}
                  setAccountLastName={setAccountLastName}
                  accountTimezone={accountTimezone}
                  setAccountTimezone={setAccountTimezone}
                  isSavingAccount={isSavingAccount}
                  onSaveAccount={handleSaveAccount}
                  onDownloadSettings={handleDownloadSettings}
                  onManageBilling={handleManageBilling}
                  onSignOut={handleSignOut}
                  onOpenAuth={onOpenAuth}
                />
              )}

              {activeNav === 'share' && (
                <ShareSection
                  title={t.shareAndCommunity}
                  subtitle={language === 'en' ? 'Join our community.' : 'Junte-se à nossa comunidade.'}
                  joinDiscordLabel={t.joinDiscord}
                  inviteFriendsLabel={t.inviteFriends}
                  copyLinkLabel={t.copyLink}
                  linkCopiedLabel={t.linkCopied}
                />
              )}

              {activeNav === 'support' && (
                <SupportSection
                  title={t.support}
                  currentLanguage={currentLanguage}
                  joinDiscordLabel={t.joinDiscord}
                  helpCenterLabel={t.helpCenter}
                  leaveFeedbackLabel={t.leaveFeedback}
                  contactSupportLabel={t.contactSupport}
                />
              )}

              {activeNav === 'whats-new' && <WhatsNewSection title={t.whatsNew} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
