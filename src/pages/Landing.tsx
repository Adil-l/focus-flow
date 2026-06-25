import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Timer, Music, Palette, Trophy, BarChart3, Cloud, ArrowRight, Check, Gem,
  ListChecks, Waves, Maximize2, Leaf, Home as HomeIcon, Lightbulb, Brain,
  PictureInPicture2, Quote, Sparkles, Flame,
} from 'lucide-react';

// Six headline features (showcase grid).
const SHOWCASE = [
  { icon: Timer, title: 'Pomodoro & timers', desc: 'Focus/break cycles, custom presets, 52/17 and animedoro.' },
  { icon: Music, title: 'Ambient sound mixer', desc: 'Layer rain, café and fire with independent volumes.' },
  { icon: Palette, title: 'Themes & modes', desc: 'Immersive animated backgrounds and Home/Focus/Ambient modes.' },
  { icon: ListChecks, title: 'Tasks, notes & goals', desc: 'Plan the session and track what matters.' },
  { icon: BarChart3, title: 'Focus stats', desc: 'Sessions, focus score, trends and history.' },
  { icon: Trophy, title: 'Streaks & rewards', desc: 'XP, levels, achievements and a contribution heatmap.' },
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
  { icon: Leaf, name: 'Ambient', desc: 'Unwind to a calm, animated scene with a floating timer.', grad: 'from-emerald-500/30 to-teal-600/20' },
  { icon: HomeIcon, name: 'Home', desc: 'A clock, a greeting and a quote — your day at a glance.', grad: 'from-primary/30 to-fuchsia-600/20' },
  { icon: Lightbulb, name: 'Focus', desc: 'A timer-first layout built to help you lock in.', grad: 'from-amber-500/30 to-orange-600/20' },
];

export default function Landing() {
  const [email, setEmail] = useState('');
  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Enter a valid email'); return; }
    toast.success("You're on the list!");
    setEmail('');
  };

  return (
    <div className="min-h-screen w-full text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-animated" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Limited-time banner */}
      <div className="w-full bg-primary/90 text-white text-center text-xs font-bold py-2 px-4">
        ✨ Limited time — get Focus Flow Plus for life for $79.{' '}
        <Link to="/app" className="underline underline-offset-2">Claim the deal →</Link>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-md">
        <span className="text-2xl font-extrabold tracking-tighter">Focus Flow</span>
        <div className="flex items-center gap-3">
          <a href="#features" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">Pricing</a>
          <a href="#newsletter" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">Newsletter</a>
          <Link to="/app" className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.35)]">
            Open in browser
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 pt-16 pb-10 md:pt-24 max-w-5xl mx-auto text-center">
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-6">
          Free forever · No credit card
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
          A beautiful place to focus and get more done.
        </h1>
        <p className="text-lg md:text-xl text-white/70 font-medium max-w-2xl mx-auto mb-8">
          Focus Flow is a free, browser-based focus dashboard — Pomodoro timer, ambient sounds, immersive
          themes, tasks and stats, all in one calm space for studying and deep work.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/app" className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black flex items-center gap-2 transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.4)]">
            Start focusing — free <ArrowRight size={20} />
          </Link>
        </div>
        <p className="text-xs text-white/40 font-bold mt-5 flex items-center justify-center gap-2">
          <Flame size={13} className="text-orange-400" /> Loved by focused students and makers everywhere
        </p>

        {/* Hero mockup */}
        <div className="mt-14 mx-auto max-w-3xl">
          <div className="glass-panel p-2 shadow-2xl">
            <div className="rounded-2xl overflow-hidden bg-gradient-animated aspect-video flex flex-col items-center justify-center gap-3">
              <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Focus</span>
              <span className="font-mono-timer text-6xl md:text-7xl font-black text-white drop-shadow-lg">25:00</span>
              <span className="px-6 py-2 rounded-xl bg-white/15 backdrop-blur text-sm font-bold">Start</span>
            </div>
          </div>
        </div>
      </header>

      {/* Feature showcase (6) */}
      <section id="features" className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">Everything you need to lock in.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHOWCASE.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-panel p-6 flex flex-col gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-black tracking-tight">{title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-12 max-w-4xl mx-auto text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Built for deep work, everywhere</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/40">
          {['Students', 'Designers', 'Developers', 'Writers', 'Founders'].map((g) => (
            <span key={g} className="text-lg font-black tracking-tight">{g}</span>
          ))}
        </div>
      </section>

      {/* Features deep-dive (9) */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">One tab. Your whole focus toolkit.</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DEEP_DIVE.map(({ icon: Icon, title }) => (
            <div key={title} className="glass-panel p-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <span className="text-sm font-bold">{title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Three modes */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">Three modes, one click away.</h2>
        <p className="text-white/50 text-center mb-12">Switch between unwinding, planning your day and deep focus.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {MODES.map(({ icon: Icon, name, desc, grad }) => (
            <div key={name} className="glass-panel p-5 flex flex-col gap-4">
              <div className={`rounded-xl aspect-video bg-gradient-to-br ${grad} flex items-center justify-center`}>
                <Icon size={32} className="text-white/80" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">{name} mode</h3>
                <p className="text-sm text-white/60 leading-relaxed mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">Free forever. Plus when you want more.</h2>
        <p className="text-white/50 text-center mb-12">Upgrade unlocks premium sounds, advanced stats, premium themes and cloud sync.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="glass-panel p-7 flex flex-col gap-4">
            <h3 className="text-2xl font-black">Free</h3>
            <div className="text-3xl font-black">$0<span className="text-sm font-bold text-white/30"> forever</span></div>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {['Pomodoro timer & breaks', 'Tasks, notes & goals', 'Core ambient sounds', 'Streaks & achievements'].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check size={15} className="text-white/40" /> {f}</li>
              ))}
            </ul>
            <Link to="/app" className="mt-2 w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-bold text-center transition-all">Get started</Link>
          </div>
          <div className="glass-panel p-7 flex flex-col gap-4 border border-primary/30">
            <div className="flex items-center gap-2"><Gem size={18} className="text-primary" /><h3 className="text-2xl font-black">Plus</h3></div>
            <div>
              <div className="text-3xl font-black">$4.99<span className="text-sm font-bold text-white/30">/month</span></div>
              <span className="text-[11px] font-bold text-emerald-400">or $29.99/yr — save 50% · $79 lifetime</span>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {['Everything in Free', 'Premium soundscapes + binaural', 'Sound mixer', 'Advanced stats & history', 'Premium themes', 'Cross-device cloud sync'].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check size={15} className="text-primary" /> {f}</li>
              ))}
            </ul>
            <Link to="/app" className="mt-2 w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-center transition-all">Upgrade to Plus</Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8">Your focus space awaits.</h2>
        <Link to="/app" className="inline-flex px-9 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black items-center gap-2 transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.4)]">
          Start focusing — free <ArrowRight size={20} />
        </Link>
        <p className="text-xs text-white/40 font-bold mt-5">Free forever · No credit card · Works in your browser</p>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="px-6 py-16 max-w-2xl mx-auto text-center">
        <div className="glass-panel p-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Quote size={22} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Weekly focus tips</h2>
          <p className="text-white/60 text-sm mb-6">A short, useful email on focus, study habits and deep work. No spam.</p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" aria-label="Email address"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary placeholder:text-white/25"
            />
            <button type="submit" className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold transition-all flex items-center justify-center gap-2">
              <Sparkles size={15} /> Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pt-12 pb-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <span className="text-lg font-extrabold tracking-tighter">Focus Flow</span>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">Your aesthetic focus & study space.</p>
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
              <li><a href="#newsletter" className="hover:text-white transition-colors">Newsletter</a></li>
              <li><a href="mailto:hello@focusflow.app" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Maximize</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><Maximize2 size={13} /> Fullscreen focus</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-xs text-white/30">© {new Date().getFullYear()} Focus Flow. Built for deep work.</p>
      </footer>
    </div>
  );
}
