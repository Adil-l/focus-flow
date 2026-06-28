import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import {
  Timer, Music, Palette, Trophy, BarChart3, Cloud, ArrowRight, Check, Gem,
  ListChecks, Waves, Maximize2, Leaf, Home as HomeIcon, Lightbulb, Brain,
  PictureInPicture2, Sparkles, Flame, Play, CloudRain, Coffee, Star,
  ChevronDown, Mail, Zap, ShieldCheck, MousePointerClick,
} from 'lucide-react';

// --- framer-motion entrance preset (subtle, reused everywhere) ---
const EASE = [0.16, 1, 0.3, 1] as const;
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

// 3-step value band.
const buildSteps = (pt: boolean) => [
  { icon: MousePointerClick, title: pt ? 'Abre um separador' : 'Open a tab', desc: pt ? 'Sem download, sem conta. Abre /app e estás pronto para trabalhar.' : 'No download, no account. Land on /app and you are ready to work.' },
  { icon: Music, title: pt ? 'Define o ambiente' : 'Set the mood', desc: pt ? 'Escolhe um tema, sobrepõe chuva e café a uma faixa binaural e acerta o cronómetro.' : 'Pick a theme, layer rain and café over a binaural track, set the timer.' },
  { icon: Zap, title: pt ? 'Concentra-te' : 'Lock in', desc: pt ? 'Faz um sprint de 25 minutos, marca tarefas concluídas e vê a tua sequência crescer.' : 'Run a 25-minute sprint, check off tasks, and watch your streak grow.' },
];

// Six headline features (showcase grid) — benefit-led copy.
const buildShowcase = (pt: boolean) => [
  { icon: Timer, title: pt ? 'Pomodoro à tua maneira' : 'Pomodoro built your way', desc: pt ? 'Clássico 25/5, trabalho profundo 52/17 ou animedoro — predefinições personalizadas que alternam automaticamente entre foco e pausas.' : 'Classic 25/5, deep-work 52/17, or animedoro — custom presets that auto-cycle through focus and breaks.' },
  { icon: Music, title: pt ? 'Um misturador, não uma playlist' : 'A mixer, not a playlist', desc: pt ? 'Sobrepõe chuva, conversa de café e lareira a crepitar em controlos de volume independentes até o ambiente soar exatamente como queres.' : 'Layer rain, café chatter and crackling fire on independent volume sliders until the room sounds exactly right.' },
  { icon: Brain, title: pt ? 'Batidas binaurais que te envolvem' : 'Binaural beats that pull you under', desc: pt ? 'Frequências alfa e teta ajustadas para o fluxo — o foco que as apps de ruído branco só prometem.' : 'Alpha and theta frequencies tuned for flow — the focus that white-noise apps only promise.' },
  { icon: ListChecks, title: pt ? 'Planeia a sessão, não a tua vida' : 'Plan the session, not your life', desc: pt ? 'Uma lista de tarefas leve, notas rápidas e metas diárias mesmo ao lado do cronómetro — nunca a um separador de distância.' : 'A lightweight task list, quick notes and daily goals that live right beside the timer — never a tab away.' },
  { icon: BarChart3, title: pt ? 'Vê as horas a somar' : 'See the hours add up', desc: pt ? 'A pontuação de foco, o histórico de sessões e as tendências semanais transformam o esforço vago num número que podes mesmo melhorar.' : 'Focus score, session history and weekly trends turn vague effort into a number you can actually move.' },
  { icon: Trophy, title: pt ? 'Um impulso que se sente' : 'Momentum you can feel', desc: pt ? 'XP, níveis, conquistas e um mapa de contribuições que tornam fácil voltar amanhã.' : 'XP, levels, achievements and a contribution heatmap that make showing up tomorrow the easy choice.' },
];

// Deeper feature grid (nine).
const buildDeepDive = (pt: boolean) => [
  { icon: Timer, title: pt ? 'Cronómetro Pomodoro' : 'Pomodoro timer' },
  { icon: Waves, title: pt ? 'Misturador multi-som' : 'Multi-sound mixer' },
  { icon: Brain, title: pt ? 'Batidas binaurais' : 'Binaural beats' },
  { icon: Palette, title: pt ? 'Temas imersivos' : 'Immersive themes' },
  { icon: PictureInPicture2, title: pt ? 'Cronómetro flutuante + PiP' : 'Floating timer + PiP' },
  { icon: ListChecks, title: pt ? 'Tarefas, notas e metas' : 'Tasks, notes & goals' },
  { icon: BarChart3, title: pt ? 'Estatísticas e histórico de foco' : 'Focus stats & history' },
  { icon: Trophy, title: pt ? 'Conquistas e sequências' : 'Achievements & streaks' },
  { icon: Cloud, title: pt ? 'Sincronização entre dispositivos' : 'Cross-device sync' },
];

// Three dashboard modes.
const buildModes = (pt: boolean) => [
  { icon: Leaf, name: pt ? 'Ambiente' : 'Ambient', desc: pt ? 'Uma cena animada e calma com um cronómetro flutuante — para ler, escrever no diário e manhãs tranquilas.' : 'A calm animated scene with a floating timer — for reading, journaling and slow mornings.', grad: 'from-emerald-500/30 to-teal-600/20' },
  { icon: HomeIcon, name: pt ? 'Início' : 'Home', desc: pt ? 'Um relógio grande, uma saudação e uma citação diária. O dia num relance assim que abres um novo separador.' : 'A big clock, a greeting and a daily quote. The day at a glance the moment a new tab opens.', grad: 'from-primary/30 to-fuchsia-600/20' },
  { icon: Lightbulb, name: pt ? 'Foco' : 'Focus', desc: pt ? 'Uma disposição centrada no cronómetro que remove tudo o resto, para que só te reste começar.' : 'A timer-first layout that strips everything else away so the only thing left to do is start.', grad: 'from-amber-500/30 to-orange-600/20' },
];

// Illustrative / sample testimonials — generic first name + role, no real people, no invented metrics.
const buildTestimonials = (pt: boolean) => [
  { quote: pt ? 'Antes mantinha um separador de música, um de cronómetro e uma app de tarefas abertos ao mesmo tempo. Agora é um só separador e começo mesmo a trabalhar.' : 'I used to keep a music tab, a timer tab and a to-do app open at once. Now it is one tab and I actually start working.', name: 'Maria', role: pt ? 'estudante de medicina' : 'medical student' },
  { quote: pt ? 'O misturador de sons é o que faz a diferença. Chuva mais uma faixa binaural suave e o resto do escritório simplesmente desaparece.' : 'The sound mixer is the thing. Rain plus a low binaural track and the rest of the office just disappears.', name: 'Daniel', role: pt ? 'programador frontend' : 'frontend developer' },
  { quote: pt ? 'Ver o mapa de sequências a preencher-se é estranhamente motivador. Apareço em dias em que antes teria desistido.' : 'Watching the streak heatmap fill in is weirdly motivating. I show up on days I would have skipped before.', name: 'Priya', role: pt ? 'a escrever a tese' : 'thesis writer' },
];

// Objection-handling FAQ.
const buildFaq = (pt: boolean) => [
  { q: pt ? 'O Kipto é mesmo gratuito?' : 'Is Kipto really free?', a: pt ? 'Sim. O cronómetro Pomodoro, as tarefas, os sons ambientes principais, as sequências e as conquistas são gratuitos para sempre — sem período de teste, sem cartão de crédito. O Plus é uma atualização opcional, não uma barreira em torno do básico.' : 'Yes. The Pomodoro timer, tasks, core ambient sounds, streaks and achievements are free forever — no trial clock, no credit card. Plus is an optional upgrade, not a paywall around the basics.' },
  { q: pt ? 'Preciso de criar uma conta?' : 'Do I need to create an account?', a: pt ? 'Não. Abre /app e começa uma sessão de imediato. Uma conta só importa se quiseres que as tuas estatísticas e definições te acompanhem em vários dispositivos.' : 'No. Open /app and start a session right away. An account only matters if you want your stats and settings to follow you across devices.' },
  { q: pt ? 'Funciona offline?' : 'Does it work offline?', a: pt ? 'O Kipto corre no teu navegador, por isso uma sessão ativa continua mesmo com uma ligação instável. As paisagens sonoras premium e a sincronização na nuvem precisam de rede, mas o cronómetro nunca para.' : 'Kipto runs in your browser, so an active session keeps going on a flaky connection. Premium soundscapes and cloud sync need the network, but the timer never stops on you.' },
  { q: pt ? 'O que é que o Plus desbloqueia exatamente?' : 'What exactly does Plus unlock?', a: pt ? 'Paisagens sonoras premium e faixas binaurais, o misturador de som multicanal completo, estatísticas e histórico avançados, temas premium e sincronização na nuvem entre dispositivos. Tudo o que já podes fazer continua gratuito.' : 'Premium soundscapes and binaural tracks, the full multi-channel sound mixer, advanced stats and history, premium themes, and cross-device cloud sync. Everything you can already do stays free.' },
  { q: pt ? 'Os meus dados são privados?' : 'Is my data private?', a: pt ? 'O teu histórico de foco é teu. Usa a app sem qualquer conta e nada sobre as tuas sessões é alguma vez vendido. Inicia sessão apenas para sincronizar — e só aquilo que escolheres.' : 'Your focus history is yours. Use the app with no account at all, and nothing about your sessions is ever sold. Sign in only to sync — and only what you choose to.' },
  { q: pt ? 'Funciona no meu telemóvel?' : 'Will it work on my phone?', a: pt ? 'Sim. O painel é responsivo e corre em qualquer navegador móvel moderno, por isso o mesmo espaço de foco está a um toque de distância no sofá ou no comboio.' : 'Yes. The dashboard is responsive and runs in any modern mobile browser, so the same focus space is one tap away on the couch or the train.' },
];

// Free / Plus plan data.
const buildFreeFeatures = (pt: boolean) => pt
  ? ['Cronómetro Pomodoro e pausas', 'Tarefas, notas e metas diárias', 'Sons ambientes principais', 'Sequências e conquistas', 'Três modos de painel']
  : ['Pomodoro timer & breaks', 'Tasks, notes & daily goals', 'Core ambient sounds', 'Streaks & achievements', 'Three dashboard modes'];
const buildPlusFeatures = (pt: boolean) => pt
  ? ['Tudo o que há no Gratuito', 'Paisagens sonoras premium + batidas binaurais', 'Misturador de som multicanal completo', 'Estatísticas avançadas e histórico completo', 'Temas animados premium', 'Sincronização na nuvem entre dispositivos']
  : ['Everything in Free', 'Premium soundscapes + binaural beats', 'Full multi-channel sound mixer', 'Advanced stats & full history', 'Premium animated themes', 'Cross-device cloud sync'];

export default function Landing() {
  const { language } = useTranslation();
  const pt = language === 'pt';
  const STEPS = buildSteps(pt);
  const SHOWCASE = buildShowcase(pt);
  const DEEP_DIVE = buildDeepDive(pt);
  const MODES = buildModes(pt);
  const TESTIMONIALS = buildTestimonials(pt);
  const FAQ = buildFaq(pt);
  const FREE_FEATURES = buildFreeFeatures(pt);
  const PLUS_FEATURES = buildPlusFeatures(pt);
  const [email, setEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(pt ? 'Esse email parece estranho — podes verificá-lo?' : 'That email looks off — mind checking it?');
      return;
    }
    toast.success(pt ? 'Estás dentro. A primeira dica de foco chega esta semana.' : "You're in. First focus tip lands this week.");
    setEmail('');
  };

  return (
    <div className="min-h-screen w-full text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-animated" />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Limited-time banner */}
      <div className="w-full bg-primary/90 text-white text-center text-xs font-bold py-2 px-4">
        <Sparkles size={13} className="inline -mt-0.5 mr-1" />
        {pt ? 'Tempo limitado — Kipto Plus para sempre, um pagamento de 79 $.' : 'Limited time — Kipto Plus for life, one payment of $79.'}{' '}
        <Link to="/app" className="underline underline-offset-2">{pt ? 'Garante já antes que acabe' : 'Claim it before it’s gone'} &rarr;</Link>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 glass-bar">
        <span className="text-2xl font-extrabold tracking-tighter">Kipto</span>
        <div className="flex items-center gap-3">
          <a href="#features" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">{pt ? 'Funcionalidades' : 'Features'}</a>
          <a href="#pricing" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">{pt ? 'Preços' : 'Pricing'}</a>
          <a href="#faq" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">FAQ</a>
          <a href="#newsletter" className="hidden md:inline text-sm font-bold text-white/60 hover:text-white transition-colors">{pt ? 'Newsletter' : 'Newsletter'}</a>
          <Link to="/app" className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.35)]">
            {pt ? 'Abrir a app' : 'Open the app'}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 pt-16 pb-10 md:pt-24 max-w-5xl mx-auto text-center">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {pt ? 'Gratuito para sempre · Sem conta necessária' : 'Free forever · No account needed'}
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
            {pt ? 'Transforma qualquer separador do navegador num' : 'Turn any browser tab into a'}<br className="hidden md:block" />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent"> {pt ? 'estúdio de trabalho profundo.' : 'deep-work studio.'}</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/70 font-medium max-w-2xl mx-auto mb-8">
            {pt
              ? 'Um cronómetro Pomodoro, um misturador de som por camadas, batidas binaurais, temas imersivos e estatísticas de foco — tudo num espaço calmo feito para estudar e trabalho profundo. Abre e começa em segundos.'
              : 'A Pomodoro timer, a layerable sound mixer, binaural beats, immersive themes and focus stats — all in one calm space built for studying and deep work. Open it and start in seconds.'}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/app" className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black flex items-center gap-2 transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.4)]">
              {pt ? 'Iniciar uma sessão de foco' : 'Start a focus session'} <ArrowRight size={20} />
            </Link>
            <a href="#features" className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-lg font-bold flex items-center gap-2 transition-all">
              {pt ? 'Vê o que está incluído' : "See what's inside"}
            </a>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs text-white/40 font-bold mt-5 flex items-center justify-center gap-2">
            <Flame size={13} className="text-orange-400" /> {pt ? 'Adorado por estudantes, criadores e escritores que precisavam de um único lugar para se concentrar' : 'Loved by students, makers and writers who needed one place to focus'}
          </motion.p>
        </motion.div>

        {/* Hero mockup — browser frame with timer, sound chips and a mini stat */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          className="mt-14 mx-auto max-w-3xl"
        >
          <div className="glass-panel p-2 shadow-2xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <div className="ml-3 flex-1 h-6 rounded-lg bg-white/10 flex items-center px-3 text-[10px] text-white/40 font-mono-timer">
                kipto.xyz/app
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="rounded-2xl overflow-hidden bg-gradient-animated relative aspect-[16/10] flex flex-col items-center justify-center gap-4 p-6">
              <div className="absolute inset-0 bg-black/25" />
              <span className="relative text-white/70 text-[11px] font-bold uppercase tracking-[0.3em]">{pt ? 'Foco · Sessão 3' : 'Focus · Session 3'}</span>
              <span className="relative font-mono-timer text-6xl md:text-8xl font-black text-white drop-shadow-lg tabular-nums">24:13</span>
              <span className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/20 backdrop-blur text-sm font-bold">
                <Play size={14} className="fill-white" /> {pt ? 'A correr' : 'Running'}
              </span>
              {/* Ambient sound chips */}
              <div className="relative flex flex-wrap items-center justify-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
                  <CloudRain size={13} /> {pt ? 'Chuva · 70%' : 'Rain · 70%'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
                  <Coffee size={13} /> {pt ? 'Café · 35%' : 'Café · 35%'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
                  <Brain size={13} /> {pt ? 'Teta · ligado' : 'Theta · on'}
                </span>
              </div>
              {/* Mini stat */}
              <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 backdrop-blur border border-white/10">
                <Flame size={15} className="text-orange-400" />
                <div className="text-left leading-tight">
                  <div className="text-sm font-black">{pt ? 'Sequência de 12 dias' : '12-day streak'}</div>
                  <div className="text-[10px] text-white/50 font-bold">{pt ? '3h 40m de foco hoje' : '3h 40m focused today'}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* How it works — 3 steps */}
      <section className="px-6 py-14 max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="grid md:grid-cols-3 gap-5">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} variants={fadeUp} className="glass-panel p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-primary">0{i + 1}</span>
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Icon size={18} className="text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-black tracking-tight">{title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Feature showcase (6) */}
      <section id="features" className="px-6 py-16 max-w-6xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">
          {pt ? 'Tudo o que uma app de foco deve ser. Nada do que não deve.' : "Everything a focus app should be. Nothing it shouldn't."}
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
          {pt ? 'Seis ferramentas que funcionam em conjunto, para deixares de fazer malabarismos com apps e simplesmente mergulhares no trabalho.' : 'Six tools that work together, so you stop juggling apps and just get into the work.'}
        </motion.p>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHOWCASE.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp} className="glass-panel p-6 flex flex-col gap-3 hover:border-white/20 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-black tracking-tight">{title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Social proof strip */}
      <section className="px-6 py-12 max-w-4xl mx-auto text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">{pt ? 'Um separador calmo para todo o tipo de trabalho profundo' : 'One calm tab for every kind of deep work'}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/40">
          {(pt ? ['Estudantes', 'Designers', 'Programadores', 'Escritores', 'Fundadores', 'Investigadores'] : ['Students', 'Designers', 'Developers', 'Writers', 'Founders', 'Researchers']).map((g) => (
            <span key={g} className="text-lg font-black tracking-tight">{g}</span>
          ))}
        </div>
      </section>

      {/* Features deep-dive (9) */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">
          {pt ? 'Um separador. Todo o teu kit de foco.' : 'One tab. Your whole focus toolkit.'}
        </motion.h2>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DEEP_DIVE.map(({ icon: Icon, title }) => (
            <motion.div key={title} variants={fadeUp} className="glass-panel p-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <span className="text-sm font-bold">{title}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Three modes */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">
          {pt ? 'Três modos, a um clique de distância.' : 'Three modes, one click away.'}
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-white/50 text-center mb-12">
          {pt ? 'Relaxa, planeia o dia ou concentra-te — o painel reorganiza-se em torno daquilo de que precisas agora mesmo.' : 'Wind down, plan the day, or lock in — the dashboard reshapes itself around what you need right now.'}
        </motion.p>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid md:grid-cols-3 gap-5">
          {MODES.map(({ icon: Icon, name, desc, grad }) => (
            <motion.div key={name} variants={fadeUp} className="glass-panel p-5 flex flex-col gap-4">
              {/* CSS mock tile */}
              <div className={`rounded-xl aspect-video bg-gradient-to-br ${grad} relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute top-3 left-3 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon size={28} className="text-white/85" />
                  <span className="font-mono-timer text-lg font-bold text-white/80 tabular-nums">25:00</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">{pt ? `Modo ${name}` : `${name} mode`}</h3>
                <p className="text-sm text-white/60 leading-relaxed mt-1">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials (illustrative samples) */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">
          {pt ? 'Como é o foco com um único separador.' : 'What focus feels like with one tab.'}
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-white/40 text-center mb-12 text-sm">
          {pt ? 'Exemplos ilustrativos do tipo de sessões para que o Kipto foi criado.' : 'Illustrative examples of the kind of sessions Kipto is built for.'}
        </motion.p>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <motion.figure key={name} variants={fadeUp} className="glass-panel p-6 flex flex-col gap-4">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} className="fill-amber-400" />)}
              </div>
              <blockquote className="text-sm text-white/80 leading-relaxed">&ldquo;{quote}&rdquo;</blockquote>
              <figcaption className="flex items-center gap-3 mt-auto">
                <span className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-sm font-black">{name[0]}</span>
                <span className="text-sm font-bold">{name}<span className="text-white/40 font-medium">, {role}</span></span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 max-w-4xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">
          {pt ? 'Gratuito para sempre. Plus quando quiseres a sala só para ti.' : 'Free forever. Plus when you want the room to yourself.'}
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-white/50 text-center mb-12">
          {pt ? 'Começa grátis e só atualiza se os sons premium, as estatísticas mais profundas e a sincronização na nuvem o justificarem.' : 'Start free, upgrade only if the premium sounds, deeper stats and cloud sync earn it.'}
        </motion.p>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid sm:grid-cols-2 gap-5">
          <motion.div variants={fadeUp} className="glass-panel p-7 flex flex-col gap-4">
            <h3 className="text-2xl font-black">{pt ? 'Gratuito' : 'Free'}</h3>
            <div className="text-3xl font-black">$0<span className="text-sm font-bold text-white/30"> {pt ? 'para sempre' : 'forever'}</span></div>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2"><Check size={15} className="text-white/40" /> {f}</li>
              ))}
            </ul>
            <Link to="/app" className="mt-auto w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-bold text-center transition-all">{pt ? 'Começar grátis — sem conta' : 'Start free — no account'}</Link>
          </motion.div>
          <motion.div variants={fadeUp} className="glass-panel p-7 flex flex-col gap-4 border border-primary/40 relative">
            <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest shadow-lg">{pt ? 'Mais popular' : 'Most popular'}</span>
            <div className="flex items-center gap-2"><Gem size={18} className="text-primary" /><h3 className="text-2xl font-black">Plus</h3></div>
            <div>
              <div className="text-3xl font-black">$4.99<span className="text-sm font-bold text-white/30">{pt ? '/mês' : '/month'}</span></div>
              <span className="text-[11px] font-bold text-emerald-400">{pt ? 'ou 29,99 $/ano — poupa 50% · 79 $ vitalício' : 'or $29.99/yr — save 50% · $79 lifetime'}</span>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {PLUS_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2"><Check size={15} className="text-primary" /> {f}</li>
              ))}
            </ul>
            <Link to="/app" className="mt-auto w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-center transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.35)]">{pt ? 'Mudar para Plus' : 'Upgrade to Plus'}</Link>
          </motion.div>
        </motion.div>
        <p className="text-center text-xs text-white/40 font-bold mt-6 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" /> {pt ? 'Cancela quando quiseres · O plano gratuito nunca expira' : 'Cancel anytime · Free plan never expires'}
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-16 max-w-3xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">
          {pt ? 'Perguntas, respondidas.' : 'Questions, answered.'}
        </motion.h2>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="flex flex-col gap-3">
          {FAQ.map(({ q, a }, i) => {
            const isOpen = openFaq === i;
            return (
              <motion.div key={q} variants={fadeUp} className="glass-panel overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-base font-bold">{q}</span>
                  <ChevronDown size={18} className={`flex-shrink-0 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 -mt-1 text-sm text-white/60 leading-relaxed">{a}</p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">{pt ? 'A tua próxima sessão de foco está a um separador de distância.' : 'Your next focus session is one tab away.'}</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">{pt ? 'Sem configuração, sem registo, sem desculpas. Abre o Kipto e inicia o cronómetro.' : 'No setup, no sign-up, no excuse. Open Kipto and start the timer.'}</p>
          <Link to="/app" className="inline-flex px-9 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black items-center gap-2 transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.4)]">
            {pt ? 'Iniciar uma sessão de foco' : 'Start a focus session'} <ArrowRight size={20} />
          </Link>
          <p className="text-xs text-white/40 font-bold mt-5">{pt ? 'Gratuito para sempre · Sem cartão de crédito · Corre no teu navegador' : 'Free forever · No credit card · Runs in your browser'}</p>
        </motion.div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="px-6 py-16 max-w-2xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="glass-panel p-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">{pt ? 'Uma dica de foco por semana. Nada mais.' : 'One focus tip a week. Nothing else.'}</h2>
          <p className="text-white/60 text-sm mb-6">{pt ? 'Um email curto e prático sobre hábitos de estudo, trabalho profundo e como tirar mais partido do Kipto. Cancela a subscrição num clique.' : 'A short, practical email on study habits, deep work and getting more from Kipto. Unsubscribe in one click.'}</p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={pt ? 'tu@exemplo.com' : 'you@example.com'} aria-label={pt ? 'Endereço de email' : 'Email address'}
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary placeholder:text-white/25"
            />
            <button type="submit" className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold transition-all flex items-center justify-center gap-2">
              <Sparkles size={15} /> {pt ? 'Enviem-me dicas' : 'Send me tips'}
            </button>
          </form>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 pt-12 pb-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <span className="text-lg font-extrabold tracking-tighter">Kipto</span>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">{pt ? 'Um separador calmo para estudar e trabalho profundo.' : 'One calm tab for studying and deep work.'}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">{pt ? 'Produto' : 'Product'}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#features" className="hover:text-white transition-colors">{pt ? 'Funcionalidades' : 'Features'}</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">{pt ? 'Preços' : 'Pricing'}</a></li>
              <li><Link to="/app" className="hover:text-white transition-colors">{pt ? 'Abrir app' : 'Open app'}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">{pt ? 'Apoio' : 'Support'}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#newsletter" className="hover:text-white transition-colors">Newsletter</a></li>
              <li><a href="mailto:hello@kipto.xyz" className="hover:text-white transition-colors">{pt ? 'Contacto' : 'Contact'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">{pt ? 'Ferramentas de foco' : 'Focus tools'}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><Maximize2 size={13} /> {pt ? 'Foco em ecrã inteiro' : 'Fullscreen focus'}</li>
              <li className="flex items-center gap-2"><PictureInPicture2 size={13} /> {pt ? 'Cronómetro flutuante' : 'Floating timer'}</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-xs text-white/30">© {new Date().getFullYear()} Kipto. {pt ? 'Feito para trabalho profundo.' : 'Built for deep work.'}</p>
      </footer>
    </div>
  );
}
