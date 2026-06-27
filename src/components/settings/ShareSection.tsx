import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { SectionHeader } from './_shared';
import { openExternal } from '@/platform/openExternal';
import { webOrigin } from '@/platform';
import { useTranslation } from '@/lib/i18n';

export default function ShareSection({
  title,
  subtitle,
  joinDiscordLabel,
  inviteFriendsLabel,
  copyLinkLabel,
  linkCopiedLabel,
}: {
  title: string;
  subtitle: string;
  joinDiscordLabel: string;
  inviteFriendsLabel: string;
  copyLinkLabel: string;
  linkCopiedLabel: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="bg-[#5865F2]/10 rounded-2xl p-5 border border-[#5865F2]/20">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/30 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h4 className="text-base font-black text-white">{joinDiscordLabel}</h4>
            <p className="text-[10px] text-[#5865F2] font-black uppercase tracking-[0.3em] mt-0.5">{t.productivityLovers}</p>
          </div>
        </div>
        <button
          onClick={() => openExternal('https://discord.gg/focusflow')}
          className="w-full py-3 rounded-xl bg-[#5865F2] text-white text-sm font-black hover:bg-[#4752C4] transition-all"
        >
          {t.joinCommunity}
        </button>
      </div>

      <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 transition-all hover:bg-white/[0.05]">
        <h4 className="text-sm font-black text-white/90 mb-1">{inviteFriendsLabel}</h4>
        <p className="text-xs text-white/30 mb-4 leading-relaxed">{t.shareWithFriendsDesc}</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 text-[11px] text-white/20 truncate border border-white/5 flex items-center font-mono italic">
            {webOrigin()}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(webOrigin());
              toast.success(linkCopiedLabel);
            }}
            className="px-5 py-3 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all shrink-0"
          >
            {copyLinkLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
