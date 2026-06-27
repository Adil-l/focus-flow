import { HelpCircle, MessageSquareQuote } from 'lucide-react';
import { SectionHeader } from './_shared';
import { openExternal } from '@/platform/openExternal';
import { useTranslation } from '@/lib/i18n';

export default function SupportSection({
  title,
  currentLanguage,
  joinDiscordLabel,
  helpCenterLabel,
  leaveFeedbackLabel,
  contactSupportLabel,
}: {
  title: string;
  currentLanguage: string;
  joinDiscordLabel: string;
  helpCenterLabel: string;
  leaveFeedbackLabel: string;
  contactSupportLabel: string;
}) {
  const { t } = useTranslation();
  const btnClass = 'w-full p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-[13px] font-bold text-white/70 hover:text-white flex items-center gap-3 transition-all';

  return (
    <div className="space-y-5">
      <SectionHeader title={title} />
      <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5">
        <p className="text-[13px] text-white/70 leading-relaxed mb-4">
          {t.supportThanks}
        </p>
        <p className="text-[13px] text-white/50 leading-relaxed mb-4">
          {t.supportHelpIntro}
        </p>
        <p className="text-[13px] text-white/50 leading-relaxed mb-4">
          {t.supportExtraHelp}
        </p>
        <div className="text-xs font-bold text-white/40 mb-4">
          {t.supportVersion}
        </div>
        <div className="bg-[#5865F2]/10 rounded-xl p-4 border border-[#5865F2]/20 mb-4">
          <p className="text-[13px] text-white/70 mb-3">
            {t.supportDiscordInvite}
          </p>
          <button
            onClick={() => openExternal('https://discord.gg/focusflow')}
            className="py-2.5 px-5 rounded-xl bg-[#5865F2] text-white text-sm font-black hover:bg-[#4752C4] transition-all"
          >
            {joinDiscordLabel}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={() => openExternal('https://focusflow.app/help')} className={btnClass}>
            <HelpCircle size={18} className="text-primary" />
            {helpCenterLabel}
          </button>
          <button onClick={() => openExternal('https://focusflow.app/feedback')} className={btnClass}>
            <MessageSquareQuote size={18} className="text-primary" />
            {leaveFeedbackLabel}
          </button>
          <button onClick={() => openExternal('mailto:support@focusflow.app')} className={btnClass}>
            <HelpCircle size={18} className="text-primary" />
            {contactSupportLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
