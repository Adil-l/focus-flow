import { Palette, Zap, User, Shield, Info, Share2, Gem, Settings as SettingsIcon } from 'lucide-react';
import type { Settings } from '@/stores/pomodoroStore';
import { SectionHeader } from './_shared';

export default function ExtrasSection({
  settings,
  onUpdate,
  checkPremium,
  currentLanguage,
  t,
}: {
  settings: Settings;
  onUpdate: (update: Partial<Settings>) => void;
  checkPremium: (feature: string) => boolean;
  currentLanguage: string;
  t: Record<string, string>;
}) {
  const toggleOptions: {
    key: keyof Settings;
    label: string;
    desc: string;
    icon: typeof Zap;
    showStatus?: boolean;
    plus?: boolean;
  }[] = [
    { key: 'disableAnimatedThemes', label: t.disableAnimatedThemes, desc: currentLanguage === 'en' ? 'Recommended for older devices, especially if you are experiencing lag or timer interruptions. Refresh to take effect.' : 'Recomendado para dispositivos antigos, especialmente se notar lentidão ou interrupções no timer. Atualize para aplicar.', icon: Zap },
    { key: 'clearMode', label: t.clearMode, desc: currentLanguage === 'en' ? 'Hide extra UI elements when your mouse is not over the browser window. May not work on tablets.' : 'Ocultar elementos de interface extra quando o mouse não está sobre a janela do navegador. Pode não funcionar em tablets.', icon: Shield, plus: true },
    { key: 'preventSleep', label: t.preventSleep, desc: currentLanguage === 'en' ? "Prevent your device from dimming or turning the screen off. May impact battery life." : "Evitar que o seu dispositivo diminua ou desligue o ecrã. Pode impactar a bateria.", icon: Info, showStatus: true, plus: true },
    { key: 'showShareButton', label: t.showShareButton, desc: currentLanguage === 'en' ? 'Show or hide the share button next to settings.' : 'Mostrar ou ocultar o botão de compartilhar ao lado das configurações.', icon: Share2, plus: true },
    { key: 'randomizeTheme', label: t.themeRandomizer, desc: currentLanguage === 'en' ? 'Show a different, random home theme each time you load Kipto.' : 'Mostrar um tema inicial diferente e aleatório ao carregar o Kipto.', icon: Palette },
    { key: 'forceBreakLock', label: t.lockDuringBreaks, desc: currentLanguage === 'en' ? 'Prevent app use during break time' : 'Evitar uso do app durante o descanso', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.extras}
        subtitle={currentLanguage === 'en' ? 'Supercharge your experience with these advanced settings.' : 'Potencialize a sua experiência com estas configurações avançadas.'}
      />

      {/* Dashboard Display Name */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 flex items-center gap-2">
          <User size={12} /> {t.dashboardDisplayName}
        </h4>
        <p className="text-[11px] text-white/30 mb-2.5">{currentLanguage === 'en' ? 'Update your name that appears in the Home dashboard.' : 'Atualize o seu nome que aparece no dashboard.'}</p>
        <input
          type="text"
          value={settings.displayName}
          onChange={e => onUpdate({ displayName: e.target.value })}
          placeholder={currentLanguage === 'en' ? 'Your name...' : 'O seu nome...'}
          className="w-full bg-black/20 border border-white/5 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold"
        />
      </div>

      {/* Default Settings Tab */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 flex items-center gap-2">
          <SettingsIcon size={12} /> {t.defaultSettingsTab}
          <span className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
            <Gem size={9} /> Plus
          </span>
        </h4>
        <p className="text-[11px] text-white/30 mb-2.5">{currentLanguage === 'en' ? 'Choose which tab shows when you open the Settings Panel.' : 'Escolha qual aba mostra quando abre o painel de configurações.'}</p>
        <select
          value={settings.defaultSettingsTab}
          onChange={e => { if (!checkPremium(t.defaultSettingsTab)) return; onUpdate({ defaultSettingsTab: e.target.value }); }}
          className="w-full bg-black/20 border border-white/5 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold"
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
      <div className="space-y-2">
        {toggleOptions.map(({ key, label, desc, icon: Icon, showStatus, plus }) => (
          <div key={key} className="group flex items-start justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.06]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary transition-colors shrink-0">
                  <Icon size={15} />
                </div>
                <h4 className="text-[13px] font-black text-white/90">{label}</h4>
                {plus && (
                  <span className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    <Gem size={9} /> Plus
                  </span>
                )}
                {showStatus && (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${settings[key] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                    {settings[key] ? (currentLanguage === 'pt' ? 'Ativo' : 'Active') : (currentLanguage === 'pt' ? 'Inativo' : 'Inactive')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/30 mt-1.5 leading-relaxed ml-[38px]">{desc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer mt-1">
              <input type="checkbox" checked={Boolean(settings[key])} onChange={e => { if (plus && !checkPremium(label)) return; onUpdate({ [key]: e.target.checked }); }} className="sr-only peer" />
              <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
