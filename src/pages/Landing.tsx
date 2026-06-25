import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
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
const STEPS = [
  { icon: MousePointerClick, title: 'Open a tab', desc: 'No download, no account. Land on /app and you are ready to work.' },
  { icon: Music, title: 'Set the mood', desc: 'Pick a theme, layer rain and café over a binaural track, set the timer.' },
  { icon: Zap, title: 'Lock in', desc: 'Run a 25-minute sprint, check off tasks, and watch your streak grow.' },
];

// Six headline features (showcase grid) — benefit-led copy.
const SHOWCASE = [
  { icon: Timer, title: 'Pomodoro built your way', desc: 'Classic 25/5, deep-work 52/17, or animedoro — custom presets that auto-cycle through focus and breaks.' },
  { icon: Music, title: 'A mixer, not a playlist', desc: 'Layer rain, café chatter and crackling fire on independent volume sliders until the room sounds exactly right.' },
  { icon: Brain, title: 'Binaural beats that pull you under', desc: 'Alpha and theta frequencies tuned for flow — the focus that white-noise apps only promise.' },
  { icon: ListChecks, title: 'Plan the session, not your life', desc: 'A lightweight task list, quick notes and daily goals that live right beside the timer — never a tab away.' },
  { icon: BarChart3, title: 'See the hours add up', desc: 'Focus score, session history and weekly trends turn vague effort into a number you can actually move.' },
  { icon: Trophy, title: 'Momentum you can feel', desc: 'XP, levels, achievements and a contribution heatmap that make showing up tomorrow the easy choice.' },
];

// Deeper feature grid (nine).
const DEEP_DIVE = [
  { icon: Timer, title: 'Pomodoro timer' },
  { icon: Waves, title: 'Multi-sound mixer' },
  { icon: Brain, title: 'Binaural beats' },
  { icon: Palette, title: 'Immersive themes' },
  { icon: PictureInPicture2, title: 'Floating timer + PiP' },
  { icon: ListChecks, title: 'Tasks, notes & goals' },
  { icon: BarChart3, title: 'Focus stats & history' },
  { icon: Trophy, title: 'Achievements & streaks' },
  { icon: Cloud, title: 'Cross-device sync' },
];

// Three dashboard modes.
const MODES = [
  { icon: Leaf, name: 'Ambient', desc: 'A calm animated scene with a floating timer — for reading, journaling and slow mornings.', grad: 'from-emerald-500/30 to-teal-600/20' },
  { icon: HomeIcon, name: 'Home', desc: 'A big clock, a greeting and a daily quote. The day at a glance the moment a new tab opens.', grad: 'from-primary/30 to-fuchsia-600/20' },
  { icon: Lightbulb, name: 'Focus', desc: 'A timer-first layout that strips everything else away so the only thing left to do is start.', grad: 'from-amber-500/30 to-orange-600/20' },
];

// Illustrative / sample testimonials — generic first name + role, no real people, no invented metrics.
const TESTIMONIALS = [
  { quote: 'I used to keep a music tab, a timer tab and a to-do app open at once. Now it is one tab and I actually start working.', name: 'Maria', role: 'medical student' },
  { quote: 'The sound mixer is the thing. Rain plus a low binaural track and the rest of the office just disappears.', name: 'Daniel', role: 'frontend developer' },
  { quote: 'Watching the streak heatmap fill in is weirdly motivating. I show up on days I would have skipped before.', name: 'Priya', role: 'thesis writer' },
];

// Objection-handling FAQ.
const FAQ = [
  { q: 'Is Focus Flow really free?', a: 'Yes. The Pomodoro timer, tasks, core ambient sounds, streaks and achievements are free forever — no trial clock, no credit card. Plus is an optional upgrade, not a paywall around the basics.' },
  { q: 'Do I need to create an account?', a: 'No. Open /app and start a session right away. An account only matters if you want your stats and settings to follow you across devices.' },
  { q: 'Does it work offline?', a: 'Focus Flow runs in your browser, so an active session keeps going on a flaky connection. Premium soundscapes and cloud sync need the network, but the timer never stops on you.' },
  { q: 'What exactly does Plus unlock?', a: 'Premium soundscapes and binaural tracks, the full multi-channel sound mixer, advanced stats and history, premium themes, and cross-device cloud sync. Everything you can already do stays free.' },
  { q: 'Is my data private?', a: 'Your focus history is yours. Use the app with no account at all, and nothing about your sessions is ever sold. Sign in only to sync — and only what you choose to.' },
  { q: 'Will it work on my phone?', a: 'Yes. The dashboard is responsive and runs in any modern mobile browser, so the same focus space is one tap away on the couch or the train.' },
];

// Free / Plus plan data.
const FREE_FEATURES = ['Pomodoro timer & breaks', 'Tasks, notes & daily goals', 'Core ambient sounds', 'Streaks & achievements', 'Three dashboard modes'];
const PLUS_FEATURES = ['Everything in Free', 'Premium soundscapes + binaural beats', 'Full multi-channel sound mixer', 'Advanced stats & full history', 'Premium animated themes', 'Cross-device cloud sync'];

export default function Landing() {
  const [email, setEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('That email looks off — mind checking it?');
      return;
    }
    toast.success("You're in. First focus tip lands this week.");
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
        Limited time — Focus Flow Plus for life, one payment of $79.{' '}
        <Link to="/app" className="underline underline-offset-2">Claim it before it&apos;s gone &rarr;</Link>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 glass-bar">
        <span className="text-2xl font-extrabold tracking-tighter">Focus Flow</span>
        <div className="flex items-center gap-3">
          <a href="#features" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">FAQ</a>
          <a href="#newsletter" className="hidden md:inline text-sm font-bold text-white/60 hover:text-white transition-colors">Newsletter</a>
          <Link to="/app" className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.35)]">
            Open the app
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 pt-16 pb-10 md:pt-24 max-w-5xl mx-auto text-center">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Free forever · No account needed
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
            Turn any browser tab into a<br className="hidden md:block" />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent"> deep-work studio.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/70 font-medium max-w-2xl mx-auto mb-8">
            A Pomodoro timer, a layerable sound mixer, binaural beats, immersive themes and focus stats —
            all in one calm space built for studying and deep work. Open it and start in seconds.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/app" className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black flex items-center gap-2 transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.4)]">
              Start a focus session <ArrowRight size={20} />
            </Link>
            <a href="#features" className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-lg font-bold flex items-center gap-2 transition-all">
              See what&apos;s inside
            </a>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs text-white/40 font-bold mt-5 flex items-center justify-center gap-2">
            <Flame size={13} className="text-orange-400" /> Loved by students, makers and writers who needed one place to focus
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
                focusflow.app/app
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="rounded-2xl overflow-hidden bg-gradient-animated relative aspect-[16/10] flex flex-col items-center justify-center gap-4 p-6">
              <div className="absolute inset-0 bg-black/25" />
              <span className="relative text-white/70 text-[11px] font-bold uppercase tracking-[0.3em]">Focus · Session 3</span>
              <span className="relative font-mono-timer text-6xl md:text-8xl font-black text-white drop-shadow-lg tabular-nums">24:13</span>
              <span className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/20 backdrop-blur text-sm font-bold">
                <Play size={14} className="fill-white" /> Running
              </span>
              {/* Ambient sound chips */}
              <div className="relative flex flex-wrap items-center justify-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
                  <CloudRain size={13} /> Rain · 70%
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
                  <Coffee size={13} /> Café · 35%
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
                  <Brain size={13} /> Theta · on
                </span>
              </div>
              {/* Mini stat */}
              <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 backdrop-blur border border-white/10">
                <Flame size={15} className="text-orange-400" />
                <div className="text-left leading-tight">
                  <div className="text-sm font-black">12-day streak</div>
                  <div className="text-[10px] text-white/50 font-bold">3h 40m focused today</div>
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
          Everything a focus app should be. Nothing it shouldn&apos;t.
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
          Six tools that work together, so you stop juggling apps and just get into the work.
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
        <p className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">One calm tab for every kind of deep work</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/40">
          {['Students', 'Designers', 'Developers', 'Writers', 'Founders', 'Researchers'].map((g) => (
            <span key={g} className="text-lg font-black tracking-tight">{g}</span>
          ))}
        </div>
      </section>

      {/* Features deep-dive (9) */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">
          One tab. Your whole focus toolkit.
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
          Three modes, one click away.
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-white/50 text-center mb-12">
          Wind down, plan the day, or lock in — the dashboard reshapes itself around what you need right now.
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
                <h3 className="text-lg font-black tracking-tight">{name} mode</h3>
                <p className="text-sm text-white/60 leading-relaxed mt-1">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials (illustrative samples) */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">
          What focus feels like with one tab.
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-white/40 text-center mb-12 text-sm">
          Illustrative examples of the kind of sessions Focus Flow is built for.
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
          Free forever. Plus when you want the room to yourself.
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-white/50 text-center mb-12">
          Start free, upgrade only if the premium sounds, deeper stats and cloud sync earn it.
        </motion.p>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid sm:grid-cols-2 gap-5">
          <motion.div variants={fadeUp} className="glass-panel p-7 flex flex-col gap-4">
            <h3 className="text-2xl font-black">Free</h3>
            <div className="text-3xl font-black">$0<span className="text-sm font-bold text-white/30"> forever</span></div>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2"><Check size={15} className="text-white/40" /> {f}</li>
              ))}
            </ul>
            <Link to="/app" className="mt-auto w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-bold text-center transition-all">Start free — no account</Link>
          </motion.div>
          <motion.div variants={fadeUp} className="glass-panel p-7 flex flex-col gap-4 border border-primary/40 relative">
            <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest shadow-lg">Most popular</span>
            <div className="flex items-center gap-2"><Gem size={18} className="text-primary" /><h3 className="text-2xl font-black">Plus</h3></div>
            <div>
              <div className="text-3xl font-black">$4.99<span className="text-sm font-bold text-white/30">/month</span></div>
              <span className="text-[11px] font-bold text-emerald-400">or $29.99/yr — save 50% · $79 lifetime</span>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {PLUS_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2"><Check size={15} className="text-primary" /> {f}</li>
              ))}
            </ul>
            <Link to="/app" className="mt-auto w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-center transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.35)]">Upgrade to Plus</Link>
          </motion.div>
        </motion.div>
        <p className="text-center text-xs text-white/40 font-bold mt-6 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" /> Cancel anytime · Free plan never expires
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-16 max-w-3xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">
          Questions, answered.
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
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Your next focus session is one tab away.</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">No setup, no sign-up, no excuse. Open Focus Flow and start the timer.</p>
          <Link to="/app" className="inline-flex px-9 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black items-center gap-2 transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.4)]">
            Start a focus session <ArrowRight size={20} />
          </Link>
          <p className="text-xs text-white/40 font-bold mt-5">Free forever · No credit card · Runs in your browser</p>
        </motion.div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="px-6 py-16 max-w-2xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="glass-panel p-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">One focus tip a week. Nothing else.</h2>
          <p className="text-white/60 text-sm mb-6">A short, practical email on study habits, deep work and getting more from Focus Flow. Unsubscribe in one click.</p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" aria-label="Email address"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary placeholder:text-white/25"
            />
            <button type="submit" className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold transition-all flex items-center justify-center gap-2">
              <Sparkles size={15} /> Send me tips
            </button>
          </form>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 pt-12 pb-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <span className="text-lg font-extrabold tracking-tighter">Focus Flow</span>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">One calm tab for studying and deep work.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link to="/app" className="hover:text-white transition-colors">Open app</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#newsletter" className="hover:text-white transition-colors">Newsletter</a></li>
              <li><a href="mailto:hello@focusflow.app" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Focus tools</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><Maximize2 size={13} /> Fullscreen focus</li>
              <li className="flex items-center gap-2"><PictureInPicture2 size={13} /> Floating timer</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-xs text-white/30">© {new Date().getFullYear()} Focus Flow. Built for deep work.</p>
      </footer>
    </div>
  );
}
