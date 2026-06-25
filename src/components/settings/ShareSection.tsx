import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { SectionHeader } from './_shared';

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
  return (
    <div className="space-y-8">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="bg-[#5865F2]/10 rounded-[32px] p-8 border border-[#5865F2]/20 shadow-2xl shadow-[#5865F2]/10">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-3xl bg-[#5865F2] flex items-center justify-center text-white shadow-2xl shadow-[#5865F2]/30">
            <Users size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black text-white">{joinDiscordLabel}</h4>
            <p className="text-[10px] text-[#5865F2] font-black uppercase tracking-[0.3em] mt-1">Productivity Lovers</p>
          </div>
        </div>
        <button
          onClick={() => window.open('https://discord.gg/focusflow', '_blank')}
          className="w-full py-5 rounded-2xl bg-[#5865F2] text-white text-sm font-black hover:bg-[#4752C4] transition-all shadow-xl shadow-[#5865F2]/20"
        >
          Join Community
        </button>
      </div>

      <div className="bg-white/[0.03] rounded-[32px] p-8 border border-white/5 transition-all hover:bg-white/[0.05]">
        <h4 className="text-sm font-black text-white/90 mb-2">{inviteFriendsLabel}</h4>
        <p className="text-xs text-white/30 mb-6 leading-relaxed">Share Focus Flow with your friends and focus together!</p>
        <div className="flex gap-3">
          <div className="flex-1 bg-black/40 rounded-2xl px-5 py-5 text-[10px] text-white/20 truncate border border-white/5 flex items-center font-mono italic">
            {typeof window !== 'undefined' ? window.location.origin : ''}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin);
              toast.success(linkCopiedLabel);
            }}
            className="px-8 py-5 rounded-2xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all shadow-2xl shadow-primary/30"
          >
            {copyLinkLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
