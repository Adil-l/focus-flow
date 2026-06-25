export default function WhatsNewSection({ title }: { title: string }) {
  const items = [
    { v: 'v2.0', title: 'Major Update 🚀', desc: 'Theme library, gamification (XP/levels/badges), daily goals, keyboard shortcuts, task templates, heatmap, and more!' },
    { v: 'v1.0', title: 'Launch', desc: 'Full Pomodoro system with tasks, sounds, stats, and customization.' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.v}
            className="bg-white/[0.03] rounded-[32px] p-8 border border-white/5 space-y-3 transition-all hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full tracking-widest">{item.v}</span>
              <h4 className="text-base font-black text-white">{item.title}</h4>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
