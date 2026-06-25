import { HelpCircle, MessageSquareQuote } from 'lucide-react';
import { SectionHeader } from './_shared';

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
  const btnClass = 'w-full p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-[13px] font-bold text-white/70 hover:text-white flex items-center gap-3 transition-all';

  return (
    <div className="space-y-5">
      <SectionHeader title={title} />
      <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5">
        <p className="text-[13px] text-white/70 leading-relaxed mb-4">
          {currentLanguage === 'en' ? 'Thanks for using Focus Flow!' : 'Obrigado por usar o Focus Flow!'}
        </p>
        <p className="text-[13px] text-white/50 leading-relaxed mb-4">
          {currentLanguage === 'en'
            ? "Check out the Help Center for answers to common questions, or share your thoughts via the feedback form below. We're a small team and always improving Focus Flow to make your experience better!"
            : 'Consulta o Help Center para respostas a perguntas frequentes, ou partilha connosco através do formulário de feedback abaixo. Somos uma pequena equipa e estamos sempre a melhorar o Focus Flow para tornar a tua experiência melhor!'}
        </p>
        <p className="text-[13px] text-white/50 leading-relaxed mb-4">
          {currentLanguage === 'en'
            ? 'Need extra help? Reach us via Contact Us below or email support@focusflow.app. For technical issues or bugs, add a brief description along with your device, browser, and operating system. Screenshots or screen recordings are also super helpful.'
            : 'Precisas de mais ajuda? Contacta-nos através do Contact Us abaixo ou envia email para support@focusflow.app. Para problemas técnicos ou bugs, adiciona uma breve descrição junto com o teu dispositivo, navegador e sistema operativo. Screenshots ou gravações de ecrã também são muito úteis.'}
        </p>
        <div className="text-xs font-bold text-white/40 mb-4">
          {currentLanguage === 'en' ? 'Your version number is: v2.0' : 'O teu número de versão é: v2.0'}
        </div>
        <div className="bg-[#5865F2]/10 rounded-xl p-4 border border-[#5865F2]/20 mb-4">
          <p className="text-[13px] text-white/70 mb-3">
            {currentLanguage === 'en'
              ? 'Join our Discord community to connect with likeminded productivity lovers!'
              : 'Junta-te à nossa comunidade Discord para conectar com amantes de produtividade!'}
          </p>
          <button
            onClick={() => window.open('https://discord.gg/focusflow', '_blank')}
            className="py-2.5 px-5 rounded-xl bg-[#5865F2] text-white text-sm font-black hover:bg-[#4752C4] transition-all"
          >
            {joinDiscordLabel}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={() => window.open('https://focusflow.app/help', '_blank')} className={btnClass}>
            <HelpCircle size={18} className="text-primary" />
            {helpCenterLabel}
          </button>
          <button onClick={() => window.open('https://focusflow.app/feedback', '_blank')} className={btnClass}>
            <MessageSquareQuote size={18} className="text-primary" />
            {leaveFeedbackLabel}
          </button>
          <button onClick={() => window.open('mailto:support@focusflow.app', '_blank')} className={btnClass}>
            <HelpCircle size={18} className="text-primary" />
            {contactSupportLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
