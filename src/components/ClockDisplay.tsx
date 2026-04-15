import { useEffect, useState } from 'react';

interface ClockDisplayProps {
  format: '12h' | '24h';
  showSeconds: boolean;
  displayName: string;
}

const QUOTES = [
  "Success comes to those who never stop learning",
  "A goal without a plan is just a wish",
  "It always seems impossible until it's done",
  "The secret of getting ahead is getting started",
  "Focus on being productive instead of busy",
  "Small steps every day lead to big results",
  "Your future is created by what you do today",
  "Discipline is choosing between what you want now and what you want most",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function ClockDisplay({ format, showSeconds, displayName }: ClockDisplayProps) {
  const [now, setNow] = useState(new Date());
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  if (format === '12h') hours = hours % 12 || 12;

  const timeStr = `${String(hours).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}${
    showSeconds ? `:${String(now.getSeconds()).padStart(2, '0')}` : ''
  }${format === '12h' ? ` ${ampm}` : ''}`;

  return (
    <div className="absolute top-6 left-0 right-0 flex items-start justify-between px-8 z-20 pointer-events-none">
      {/* Logo + greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">pomodoro</h1>
        <p className="text-xs text-white/40 -mt-0.5">focus & flow</p>
      </div>

      {/* Quote */}
      <div className="text-right max-w-xs">
        <p className="text-sm font-medium text-white/70 italic leading-snug">
          "{quote}"
        </p>
      </div>
    </div>
  );
}
