import { useEffect, useState } from 'react';
import { getRandomQuote } from '@/data/quotes';

interface ClockDisplayProps {
  format: '12h' | '24h';
  showSeconds: boolean;
  displayName: string;
}

export default function ClockDisplay({ format, showSeconds, displayName }: ClockDisplayProps) {
  const [now, setNow] = useState(new Date());
  const [quote] = useState(() => getRandomQuote());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  if (format === '12h') hours = hours % 12 || 12;

  return (
    <div className="absolute top-6 left-0 right-0 flex items-start justify-between px-8 z-20 pointer-events-none">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">pomodoro</h1>
        <p className="text-xs text-white/40 -mt-0.5">focus & flow</p>
      </div>
      <div className="text-right max-w-xs">
        <p className="text-sm font-medium text-white/70 italic leading-snug">
          "{quote.text}"
        </p>
        <p className="text-xs text-white/30 mt-0.5">— {quote.author}</p>
      </div>
    </div>
  );
}
