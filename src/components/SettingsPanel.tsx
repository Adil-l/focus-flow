import { Settings as SettingsIcon, Timer, Bell, User, Palette, Zap } from 'lucide-react';
import { useState } from 'react';
import type { Settings, TimerMode, TimerPreset } from '@/stores/pomodoroStore';

interface SettingsPanelProps {
  settings: Settings;
  presets: TimerPreset[];
  onUpdate: (update: Partial<Settings>) => void;
  onAddPreset: (preset: TimerPreset) => void;
  onRemovePreset: (name: string) => void;
}

const TIMER_MODES: { id: TimerMode; label: string; desc: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro', desc: 'Clássico: ciclos de foco e pausa' },
  { id: 'countdown', label: 'Countdown', desc: 'Contagem decrescente fixa' },
  { id: 'stopwatch', label: 'Cronómetro', desc: 'Contagem progressiva' },
  { id: 'animedoro', label: 'Animedoro', desc: '40min foco + 20min pausa' },
  { id: '52/17', label: '52/17', desc: '52min foco + 17min pausa' },
];

const TALLY_STYLES = [
  { id: 'dots', label: '● Pontos' },
  { id: 'hearts', label: '❤️ Corações' },
  { id: 'stars', label: '⭐ Estrelas' },
  { id: 'tomatoes', label: '🍅 Tomates' },
  { id: 'lightning', label: '⚡ Raios' },
  { id: 'trees', label: '🌳 Árvores' },
];

const ALERT_SOUNDS = ['chime', 'sparkle', 'piano', 'bell', 'success', 'applause'];
const CLOCK_FONTS = ['default', 'minimal', 'serif', 'handwritten', 'mono'];

type Tab = 'timer' | 'display' | 'audio' | 'extras';

export default function SettingsPanel({
  settings, presets, onUpdate, onAddPreset, onRemovePreset,
}: SettingsPanelProps) {
  const [tab, setTab] = useState<Tab>('timer');
  const [presetName, setPresetName] = useState('');

  const tabs: { id: Tab; label: string; icon: typeof Timer }[] = [
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'display', label: 'Visual', icon: Palette },
    { id: 'audio', label: 'Áudio', icon: Bell },
    { id: 'extras', label: 'Extras', icon: Zap },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground text-sm">Configurações</h3>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary/50 rounded-lg p-1 mb-5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs font-medium transition-all ${
              tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Timer tab */}
      {tab === 'timer' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Modo</p>
            <div className="space-y-2">
              {TIMER_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => onUpdate({ timerMode: m.id })}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    settings.timerMode === m.id
                      ? 'bg-primary/10 ring-1 ring-primary/30'
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {settings.timerMode === 'pomodoro' && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Durações (minutos)</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Foco', key: 'work' as const, value: settings.work },
                  { label: 'Pausa Curta', key: 'short' as const, value: settings.short },
                  { label: 'Pausa Longa', key: 'long' as const, value: settings.long },
                ].map(({ label, key, value }) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <input
                      type="number"
                      min={1}
                      value={value}
                      onChange={e => onUpdate({ [key]: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full mt-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs text-muted-foreground">Longa após</label>
                <input
                  type="number"
                  min={1}
                  value={settings.cyclesForLong}
                  onChange={e => onUpdate({ cyclesForLong: Math.max(1, parseInt(e.target.value) || 4) })}
                  className="w-16 bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                />
                <span className="text-xs text-muted-foreground">sessões</span>
              </div>
            </div>
          )}

          {settings.timerMode === 'countdown' && (
            <div>
              <label className="text-xs text-muted-foreground">Duração (minutos)</label>
              <input
                type="number"
                min={1}
                value={settings.countdownMinutes}
                onChange={e => onUpdate({ countdownMinutes: Math.max(1, parseInt(e.target.value) || 30) })}
                className="w-full mt-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoNext}
              onChange={e => onUpdate({ autoNext: e.target.checked })}
              className="accent-primary"
            />
            <span className="text-sm text-foreground">Avanço automático</span>
          </label>

          {/* Presets */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Presets</p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nome do preset"
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground outline-none"
              />
              <button
                onClick={() => {
                  if (presetName.trim()) {
                    onAddPreset({
                      name: presetName.trim(),
                      work: settings.work,
                      short: settings.short,
                      long: settings.long,
                      cyclesForLong: settings.cyclesForLong,
                    });
                    setPresetName('');
                  }
                }}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Salvar
              </button>
            </div>
            {presets.map(p => (
              <div key={p.name} className="flex items-center justify-between bg-secondary/30 rounded-lg p-2 mb-1">
                <button
                  onClick={() => onUpdate({ work: p.work, short: p.short, long: p.long, cyclesForLong: p.cyclesForLong })}
                  className="text-sm text-foreground hover:text-primary transition-all"
                >
                  {p.name} ({p.work}/{p.short}/{p.long})
                </button>
                <button onClick={() => onRemovePreset(p.name)} className="text-xs text-muted-foreground hover:text-destructive">×</button>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Estilo dos Tallies</p>
          <div className="flex flex-wrap gap-2">
            {TALLY_STYLES.map(t => (
              <button
                key={t.id}
                onClick={() => onUpdate({ tallyStyle: t.id })}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  settings.tallyStyle === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Display tab */}
      {tab === 'display' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Nome de Exibição</label>
            <input
              type="text"
              value={settings.displayName}
              onChange={e => onUpdate({ displayName: e.target.value })}
              placeholder="Teu nome"
              className="w-full mt-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Relógio</p>
            <div className="flex gap-2 mb-3">
              {['12h', '24h'].map(f => (
                <button
                  key={f}
                  onClick={() => onUpdate({ clockFormat: f as '12h' | '24h' })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    settings.clockFormat === f ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input type="checkbox" checked={settings.showSeconds} onChange={e => onUpdate({ showSeconds: e.target.checked })} className="accent-primary" />
              <span className="text-sm text-foreground">Mostrar segundos</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.flipClock} onChange={e => onUpdate({ flipClock: e.target.checked })} className="accent-primary" />
              <span className="text-sm text-foreground">Flip Clock</span>
            </label>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Fonte do Relógio</p>
            <div className="flex flex-wrap gap-2">
              {CLOCK_FONTS.map(f => (
                <button
                  key={f}
                  onClick={() => onUpdate({ clockFont: f })}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                    settings.clockFont === f ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audio tab */}
      {tab === 'audio' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Som de Alerta</p>
            <div className="flex flex-wrap gap-2">
              {ALERT_SOUNDS.map(s => (
                <button
                  key={s}
                  onClick={() => onUpdate({ alertSound: s })}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                    settings.alertSound === s ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Volume do Alerta</label>
            <input
              type="range" min={0} max={1} step={0.05}
              value={settings.alertVolume}
              onChange={e => onUpdate({ alertVolume: parseFloat(e.target.value) })}
              className="w-full accent-primary mt-1"
            />
          </div>
        </div>
      )}

      {/* Extras tab */}
      {tab === 'extras' && (
        <div className="space-y-3">
          {[
            { key: 'preventSleep' as const, label: 'Prevenção de Suspensão', desc: 'Impede o ecrã de desligar' },
            { key: 'clearMode' as const, label: 'Modo Transparente', desc: 'Oculta UI quando inativo' },
            { key: 'disableAnimatedThemes' as const, label: 'Desativar Animações', desc: 'Recomendado para dispositivos lentos' },
            { key: 'randomizeTheme' as const, label: 'Tema Aleatório', desc: 'Muda o tema ao abrir' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer p-3 bg-secondary/30 rounded-xl">
              <div>
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={e => onUpdate({ [key]: e.target.checked })}
                className="accent-primary"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
