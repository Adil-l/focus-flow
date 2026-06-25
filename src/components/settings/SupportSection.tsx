import { HelpCircle, MessageSquareQuote } from 'lucide-react';

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
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      </div>
      <div className="bg-white/[0.03] rounded-[32px] p-8 border border-white/5">
        <p className="text-sm text-white/70 leading-relaxed mb-6">
          {currentLanguage === 'en' ? 'Thanks for using Flocus!' : 'Obrigado por usar Flocus!'}
        </p>
        <p className="text-sm text-white/50 leading-relaxed mb-6">
          {currentLanguage === 'en'
            ? "Check out the Help Center for answers to common questions, or share your thoughts with us via the feedback form below. We're a small team and always improving Flocus to make your experience better!"
            : 'Consulta o Help Center para respostas a perguntas frequentes, ou partilha connosco através do formulário de feedback abaixo. Somos uma pequena equipa e estamos sempre a melhorar o Flocus para tornar a tua experiência melhor!'}
        </p>
        <p className="text-sm text-white/50 leading-relaxed mb-6">
          {currentLanguage === 'en'
            ? 'If you need extra help, you can also reach out using Contact Us below or email support@flocus.com. For technical issues or bugs, add a brief description of the problem along with your device, browser, and operating system. Screenshots or screen recordings are also super helpful.'
            : 'Se precisares de mais ajuda, podes contactar-nos através do Contact Us abaixo ou enviar email para support@flocus.com. Para problemas técnicos ou bugs, adiciona uma breve descrição do problema junto com o teu dispositivo, navegador e sistema operativo. Screenshots ou gravações de ecrã também são muito úteis.'}
        </p>
        <div className="text-sm font-bold text-white/40 mb-6">
          {currentLanguage === 'en' ? 'Your version number is: v1.9.1' : 'O teu número de versão é: v1.9.1'}
        </div>
        <div className="bg-[#5865F2]/10 rounded-[24px] p-6 border border-[#5865F2]/20 mb-6">
          <p className="text-sm text-white/70 mb-4">
            {currentLanguage === 'en'
              ? 'Join our Discord community to connect with likeminded productivity lovers!'
              : 'Junta-te à nossa comunidade Discord para conectar com amantes de produtividade!'}
          </p>
          <button
            onClick={() => window.open('https://discord.gg/focusflow', '_blank')}
            className="py-3 px-6 rounded-2xl bg-[#5865F2] text-white text-sm font-black hover:bg-[#4752C4] transition-all"
          >
            {joinDiscordLabel}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => window.open('https://flocus.com/help', '_blank')}
            className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-sm font-bold text-white/70 hover:text-white flex items-center gap-4 transition-all"
          >
            <HelpCircle size={20} className="text-primary" />
            {helpCenterLabel}
          </button>
          <button
            onClick={() => window.open('https://flocus.com/feedback', '_blank')}
            className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-sm font-bold text-white/70 hover:text-white flex items-center gap-4 transition-all"
          >
            <MessageSquareQuote size={20} className="text-primary" />
            {leaveFeedbackLabel}
          </button>
          <button
            onClick={() => window.open('mailto:support@flocus.com', '_blank')}
            className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-sm font-bold text-white/70 hover:text-white flex items-center gap-4 transition-all"
          >
            <HelpCircle size={20} className="text-primary" />
            {contactSupportLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
