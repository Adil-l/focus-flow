import { useEffect, useState } from 'react';

interface ClockDisplayProps {
  format: '12h' | '24h';
  showSeconds: boolean;
  displayName: string;
}

const QUOTES = [
  "O foco é a arte de saber o que ignorar.",
  "Cada pomodoro é um passo mais perto do teu objetivo.",
  "A disciplina é a ponte entre metas e realizações.",
  "Trabalha em silêncio, deixa o sucesso fazer barulho.",
  "O segredo do sucesso é começar.",
  "Acredita que podes e já estás a meio caminho.",
  "Hoje é um bom dia para ser produtivo.",
  "Faz o teu melhor, um pomodoro de cada vez.",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
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
    <div className="text-center mb-8">
      <div className="font-mono-timer text-3xl md:text-4xl font-light text-foreground/60 mb-2">
        {timeStr}
      </div>
      <h2 className="text-xl md:text-2xl font-semibold text-foreground">
        {getGreeting()}{displayName ? `, ${displayName}` : ''} 👋
      </h2>
      <p className="text-sm text-muted-foreground mt-2 italic max-w-md mx-auto">
        "{quote}"
      </p>
    </div>
  );
}
