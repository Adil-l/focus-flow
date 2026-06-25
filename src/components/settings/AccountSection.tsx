import { User, LogOut, Download, Save, CreditCard, Cloud, ArrowRight } from 'lucide-react';
import { SectionHeader } from './_shared';

interface AccountSectionProps {
  title: string;
  isAuthenticated: boolean;
  authenticatedLabel: string;
  welcomeName: string;
  accountEmail: string;
  setAccountEmail: (value: string) => void;
  accountFirstName: string;
  setAccountFirstName: (value: string) => void;
  accountLastName: string;
  setAccountLastName: (value: string) => void;
  accountTimezone: string;
  setAccountTimezone: (value: string) => void;
  isSavingAccount: boolean;
  onSaveAccount: () => void;
  onDownloadSettings: () => void;
  onManageBilling: () => void;
  onSignOut: () => void;
  onOpenAuth: () => void;
}

const TIMEZONES = [
  'Africa / Abidjan', 'Africa / Maputo', 'Africa / Johannesburg',
  'Europe / Lisbon', 'Europe / London', 'America / New_York',
];

export default function AccountSection(props: AccountSectionProps) {
  const {
    title, isAuthenticated, authenticatedLabel, welcomeName,
    accountEmail, setAccountEmail, accountFirstName, setAccountFirstName,
    accountLastName, setAccountLastName, accountTimezone, setAccountTimezone,
    isSavingAccount, onSaveAccount, onDownloadSettings, onManageBilling, onSignOut, onOpenAuth,
  } = props;

  const fieldClass = 'w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/40 transition-all font-medium';
  const labelClass = 'text-[10px] font-black text-white/40 uppercase tracking-[0.2em]';

  // Signed-out: a clear sign-in CTA instead of a profile form + log-out button.
  if (!isAuthenticated) {
    return (
      <div className="space-y-5">
        <SectionHeader title={title} subtitle="Sign in to sync across your devices." />

        <div className="bg-white/[0.04] rounded-3xl p-7 border border-white/5 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <Cloud size={26} />
          </div>
          <div>
            <h4 className="text-lg font-black text-white">You're signed out</h4>
            <p className="text-sm text-white/50 mt-1 max-w-sm">
              Your data lives on this device. Sign in to keep your themes, stats and streaks across devices.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="py-3 px-6 rounded-xl text-sm font-black text-white bg-primary hover:bg-primary/90 flex items-center gap-2 transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.35)]"
          >
            Sign in / Create account <ArrowRight size={16} />
          </button>
        </div>

        <button
          onClick={onDownloadSettings}
          className="w-full py-3 px-5 rounded-xl text-sm font-bold text-white/80 bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center gap-2 transition-all border border-white/10"
        >
          <Download size={16} /> Export my settings
        </button>
      </div>
    );
  }

  // Signed-in: profile + billing + sign out.
  return (
    <div className="space-y-5">
      <SectionHeader title={title} subtitle="Manage your profile and account." />

      <div className="bg-white/[0.04] rounded-3xl p-6 border border-white/5 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
              <User size={28} />
            </div>
            <div>
              <div className="text-[10px] text-primary uppercase font-black tracking-[0.3em] mb-1">Account</div>
              <h4 className="text-xl font-black text-white leading-tight">Welcome {welcomeName} 👋</h4>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em]">
            {authenticatedLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className={labelClass}>Email</label>
            <input type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className={fieldClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>First name</label>
            <input type="text" value={accountFirstName} onChange={(e) => setAccountFirstName(e.target.value)} className={fieldClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Last name (optional)</label>
            <input type="text" value={accountLastName} onChange={(e) => setAccountLastName(e.target.value)} placeholder="Add your surname" className={`${fieldClass} placeholder:text-white/20`} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className={labelClass}>Timezone</label>
            <select value={accountTimezone} onChange={(e) => setAccountTimezone(e.target.value)} className={fieldClass}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz} className="bg-[#15101e]">{tz}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={onSaveAccount}
          disabled={isSavingAccount}
          className="w-full py-3 px-6 rounded-xl text-sm font-black text-white bg-primary hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
        >
          <Save size={16} /> {isSavingAccount ? 'Saving…' : 'Save changes'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5">
          <button onClick={onDownloadSettings} className="py-3 px-5 rounded-xl text-sm font-bold text-white/80 bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center gap-2 transition-all border border-white/10">
            <Download size={16} /> Export settings
          </button>
          <button onClick={onManageBilling} className="py-3 px-5 rounded-xl text-sm font-bold text-white/80 bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center gap-2 transition-all border border-white/10">
            <CreditCard size={16} /> Manage billing
          </button>
        </div>

        <button onClick={onSignOut} className="w-full py-3 px-6 rounded-xl text-sm font-bold text-red-300 bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center gap-2 transition-all border border-red-500/10">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}
