import { User, LogOut, Download, Save, CreditCard } from 'lucide-react';
import { SectionHeader } from './_shared';

export default function AccountSection({
  title,
  isAuthenticated,
  authenticatedLabel,
  welcomeName,
  accountEmail,
  setAccountEmail,
  accountFirstName,
  setAccountFirstName,
  accountLastName,
  setAccountLastName,
  accountTimezone,
  setAccountTimezone,
  isSavingAccount,
  onSaveAccount,
  onDownloadSettings,
  onManageBilling,
  onSignOut,
}: {
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
}) {
  return (
    <div className="space-y-8">
      <SectionHeader title={title} subtitle="Manage your profile and account preferences." />

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

          {isAuthenticated && (
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.25em]">
              {authenticatedLabel}
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
                onClick={onSaveAccount}
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
                onClick={onDownloadSettings}
                className="py-4 px-5 rounded-2xl text-sm font-black text-white bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center gap-3 transition-all border border-white/10"
              >
                <Download size={18} /> Download settings
              </button>

              <button
                onClick={onManageBilling}
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
              onClick={onSignOut}
              className="w-full md:w-auto py-4 px-6 rounded-2xl text-sm font-black text-white bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center gap-3 transition-all border border-red-500/10"
            >
              <LogOut size={18} /> Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
