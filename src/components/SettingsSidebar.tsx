import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Timer, BarChart3, MessageSquareQuote, Zap, User, HelpCircle, Sparkles, Target, Keyboard, Home, Share2 } from 'lucide-react';
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

export default function SettingsSidebar({
  open, onClose, settings, onUpdate, history, onClearHistory,
}: SettingsSidebarProps) {
  const { t, currentLanguage } = useTranslation();
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
    void openBillingPortal();
  };

  const welcomeName = accountFirstName.trim() || user?.email?.split('@')[0] || 'User';

  const navItems: { id: NavItem; label: string; icon: typeof Home }[] = [
    { id: 'themes-home', label: t.homeTheme, icon: Home },
    { id: 'clock', label: t.clock, icon: Clock },
    { id: 'timer', label: t.focusTimer, icon: Timer },
    { id: 'goals', label: t.goals, icon: Target },
    { id: 'stats', label: t.stats, icon: BarChart3 },
    { id: 'quotes', label: currentLanguage === 'pt' ? 'Citações' : 'Quotes', icon: MessageSquareQuote },
    { id: 'shortcuts', label: t.shortcuts, icon: Keyboard },
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
                  subtitle={t.language === 'en' ? 'Personalize your time display.' : 'Personalize a exibição do tempo.'}
                  settings={settings}
                  onUpdate={onUpdate}
                />
              )}

              {activeNav === 'timer' && (
                <TimerSection
                  title={t.focusTimer}
                  subtitle="Customize your timer to match your workflow."
                  settings={settings}
                  onUpdate={onUpdate}
                  onNavigateToClock={() => setActiveNav('clock')}
                  timerModeLabel={t.timerMode}
                />
              )}

              {activeNav === 'goals' && (
                <GoalsSection
                  title={t.goals}
                  subtitle={t.language === 'en' ? 'Configure your focus targets and track your progress.' : 'Configure suas metas de foco e acompanhe o seu progresso.'}
                  history={history}
                  settings={settings}
                  onUpdate={onUpdate}
                />
              )}

              {activeNav === 'stats' && (
                <StatsSection
                  title={t.stats}
                  subtitle={t.language === 'en' ? 'View your focus history and productivity trends.' : 'Visualiza o teu histórico de foco e tendências de produtividade.'}
                  history={history}
                  onClearHistory={onClearHistory}
                />
              )}

              {activeNav === 'quotes' && (
                <QuotesSection
                  title={t.quotes}
                  subtitle={t.language === 'en' ? 'Control inspiration settings.' : 'Controle a inspiração do seu ambiente.'}
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
                  subtitle={t.language === 'en' ? 'Quick keyboard actions.' : 'Ações rápidas de teclado.'}
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
                />
              )}

              {activeNav === 'share' && (
                <ShareSection
                  title={t.shareAndCommunity}
                  subtitle={t.language === 'en' ? 'Join our community.' : 'Junte-se à nossa comunidade.'}
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
