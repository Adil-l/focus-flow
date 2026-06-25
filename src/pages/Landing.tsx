import { Link } from 'react-router-dom';
import { Timer, Music, Palette, Trophy, BarChart3, Cloud, ArrowRight, Check, Gem } from 'lucide-react';

const FEATURES = [
  { icon: Timer, title: 'A Pomodoro that keeps you honest', desc: 'Focus / break cycles, custom presets, keyboard shortcuts and a floating timer you can pop out of the browser.' },
  { icon: Music, title: 'Sound you can disappear into', desc: 'Layer rain, café, fire and white/pink/brown noise — plus binaural beats — each with its own volume.' },
  { icon: Palette, title: 'A space you’ll want to stare at', desc: 'Immersive animated themes, Home / Focus / Ambient modes, a big clock and gorgeous gradients.' },
  { icon: Trophy, title: 'Progress you can feel', desc: 'Streaks, XP and levels, achievements and a contribution heatmap that rewards showing up.' },
  { icon: BarChart3, title: 'Insight into your focus', desc: 'Sessions, focus score, trends and history — understand when you actually do your best work.' },
  { icon: Cloud, title: 'Never lose your flow', desc: 'Sign in to sync your themes, stats and streaks across every device (Plus).' },
];

export default function Landing() {
  return (
    <div className="min-h-screen w-full text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-animated" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-10 py-5 backdrop-blur-md">
        <span className="text-2xl font-extrabold tracking-tighter">Focus Flow</span>
        <div className="flex items-center gap-3">
          <a href="#features" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hidden sm:inline text-sm font-bold text-white/60 hover:text-white transition-colors">Pricing</a>
          <Link to="/app" className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.35)]">
            Open app
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 pt-16 pb-20 md:pt-28 md:pb-28 max-w-4xl mx-auto text-center">
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-6">
          Free forever · No credit card
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
          Turn a noisy afternoon into your deepest focus session yet.
        </h1>
        <p className="text-lg md:text-xl text-white/70 font-medium max-w-2xl mx-auto mb-10">
          A Pomodoro timer, immersive themes, an ambient sound mixer and lofi, streaks and achievements —
          all in one calm, gorgeous space built for studying and deep work.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/app" className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black flex items-center gap-2 transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.4)]">
            Start focusing — free <ArrowRight size={20} />
          </Link>
          <a href="#features" className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-lg font-bold transition-all">
            Take a look
          </a>
        </div>
        <p className="text-xs text-white/40 font-bold mt-5">8 soundscapes · binaural beats · 21 achievements · works in your browser</p>
      </header>

      {/* Features */}
      <section id="features" className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">Everything you need to lock in.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
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
              <span className="text-[11px] font-bold text-emerald-400">or $29.99/yr — save 50%</span>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {['Everything in Free', 'Premium soundscapes + binaural', 'Sound mixer', 'Advanced stats & history', 'Premium themes', 'Cross-device cloud sync'].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check size={15} className="text-primary" /> {f}</li>
              ))}
            </ul>
            <Link to="/app" className="mt-2 w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-center transition-all">Upgrade to Plus</Link>
          </div>
        </div>
        <p className="text-[11px] text-white/30 text-center mt-6">Secure payments via Stripe. Cancel anytime.</p>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8">Your next focus session starts now.</h2>
        <Link to="/app" className="inline-flex px-9 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black items-center gap-2 transition-all shadow-[0_8px_30px_hsl(258_90%_66%/0.4)]">
          Start focusing — free <ArrowRight size={20} />
        </Link>
        <p className="text-xs text-white/40 font-bold mt-5">Free forever · No credit card · Works in your browser</p>
      </section>

      <footer className="px-6 py-10 border-t border-white/10 text-center text-sm text-white/40">
        <span className="font-extrabold text-white/70">Focus Flow</span> · Built for deep work.
      </footer>
    </div>
  );
}
