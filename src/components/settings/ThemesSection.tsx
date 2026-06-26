import { useState } from 'react';
import { Upload, Music, Trash2, Zap, Gem } from 'lucide-react';
import { toast } from 'sonner';
import type { Settings } from '@/stores/pomodoroStore';
import { THEMES, THEME_CATEGORIES, isThemePremium, type Theme } from '@/data/themes';
import { useTranslation } from '@/lib/i18n';
import { SectionHeader } from './_shared';
import WallpaperBrowser from './WallpaperBrowser';

// Themed fallback gradient shown behind each tile so a slow/failed remote image
// never leaves a broken-image icon — the category colour shows through instead.
const CATEGORY_FALLBACK: Record<Theme['category'], string> = {
  gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
  'ambient-world': 'linear-gradient(135deg,#0f2027,#2c5364)',
  minimal: 'linear-gradient(135deg,#0a0a0a,#1a1a1a)',
  animated: 'linear-gradient(135deg,#302b63,#24243e)',
  special: 'linear-gradient(135deg,#654ea3,#eaafc8)',
  anime: 'linear-gradient(135deg,#ff6a88,#ff99ac)',
  sports: 'linear-gradient(135deg,#1e3c72,#2a5298)',
  cars: 'linear-gradient(135deg,#373b44,#4286f4)',
  movies: 'linear-gradient(135deg,#141e30,#243b55)',
  football: 'linear-gradient(135deg,#11998e,#38ef7d)',
  motogp: 'linear-gradient(135deg,#c31432,#240b36)',
};

export default function ThemesSection({
  settings,
  onUpdate,
  checkPremium,
  customBackgroundLabel,
  uploadImageLabel,
  videoBackgroundLabel,
  themeLibraryLabel,
  saveLabel,
}: {
  settings: Settings;
  onUpdate: (update: Partial<Settings>) => void;
  checkPremium: (feature: string) => boolean;
  customBackgroundLabel: string;
  uploadImageLabel: string;
  videoBackgroundLabel: string;
  themeLibraryLabel: string;
  saveLabel: string;
}) {
  const { t, language } = useTranslation();
  const [themeCat, setThemeCat] = useState('all');
  const [videoUrl, setVideoUrl] = useState(settings.videoBg || '');
  const settingKey = 'homeTheme' as const;

  const filteredThemes = themeCat === 'all' ? THEMES : THEMES.filter(the => the.category === themeCat);
  const namedCategories = THEME_CATEGORIES.filter(c => c.id !== 'all');

  const renderTile = (the: Theme) => {
    const premium = isThemePremium(the);
    const isImage = Boolean(the.background) && (the.background.startsWith('http') || the.background.startsWith('/'));
    return (
      <button key={the.id}
        onClick={() => {
          if (premium && !checkPremium('premium themes')) return;
          onUpdate({ [settingKey]: the.id } as Pick<Settings, 'homeTheme'>);
        }}
        className={`relative aspect-video rounded-2xl overflow-hidden border transition-all group ${
          settings[settingKey] === the.id ? 'ring-2 ring-primary border-transparent scale-[1.02]' : 'border-white/5 hover:border-white/20'
        }`}
        style={{ background: isImage ? CATEGORY_FALLBACK[the.category] : the.preview }}>
        {isImage && (
          <img src={the.preview} alt={the.name} loading="lazy"
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        {premium && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/30 text-primary border border-primary/40">
            <Gem size={8} /> Plus
          </span>
        )}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] text-white font-black uppercase tracking-widest truncate pr-1">{the.name}</span>
          {the.isAnimated && <Zap size={10} className="text-primary fill-current" />}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={language === 'pt' ? 'Tema Inicial' : 'Home Theme'}
        subtitle={language === 'pt' ? 'Escolha o tema que aparece na tela inicial. Para uma pré-visualização ao vivo, defina o painel como Início e volte aqui.' : 'Pick the theme that appears in Home. For a live preview, set your dashboard to Home, then come back here.'}
      />

      {/* Custom Upload */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Upload size={12} /> {customBackgroundLabel}
        </h4>
        <div className="flex gap-3">
          <input
            type="file"
            id="bg-upload"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 10 * 1024 * 1024) {
                toast.error(language === 'pt' ? 'Arquivo muito grande' : 'File too large', { description: language === 'pt' ? 'Use uma imagem com menos de 10MB.' : 'Please use an image under 10MB.' });
                return;
              }
              // Downscale to a sane resolution and re-encode as JPEG so the data
              // URL stays small enough for localStorage (raw uploads blow the quota).
              const objectUrl = URL.createObjectURL(file);
              const img = new Image();
              img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                const maxDim = 1920;
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                  const scale = maxDim / Math.max(width, height);
                  width = Math.round(width * scale);
                  height = Math.round(height * scale);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { toast.error(language === 'pt' ? 'Não foi possível processar essa imagem' : 'Could not process that image'); return; }
                ctx.drawImage(img, 0, 0, width, height);
                const base64 = canvas.toDataURL('image/jpeg', 0.82);
                onUpdate({ customBg: base64, homeTheme: 'custom' });
                toast.success(language === 'pt' ? 'Fundo personalizado atualizado!' : 'Custom background updated!');
              };
              img.onerror = () => { URL.revokeObjectURL(objectUrl); toast.error(language === 'pt' ? 'Não foi possível carregar essa imagem' : 'Could not load that image'); };
              img.src = objectUrl;
            }}
          />
          <label
            htmlFor="bg-upload"
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-dashed border-white/10 text-white/40 text-xs font-bold flex flex-col items-center justify-center gap-1.5 hover:bg-white/[0.08] cursor-pointer transition-all"
          >
            <Upload size={18} />
            {uploadImageLabel}
          </label>
          <button
            onClick={() => onUpdate({ customBg: null })}
            className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/10"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{language === 'pt' ? 'Opacidade da Sobreposição' : 'Overlay Opacity'}</span>
            <span className="text-[10px] text-primary font-black bg-primary/10 px-2 py-0.5 rounded">{settings.bgOverlayOpacity}%</span>
          </div>
          <input
            type="range" min={0} max={90} step={5} value={settings.bgOverlayOpacity}
            onChange={e => onUpdate({ bgOverlayOpacity: parseInt(e.target.value) })}
            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Video Background */}
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Music size={12} /> {videoBackgroundLabel}
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={language === 'pt' ? 'Cole a URL do YouTube' : 'Paste YouTube URL'}
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            className="flex-1 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/40 transition-all"
          />
          <button
            onClick={() => {
              onUpdate({ videoBg: videoUrl });
              toast.success(language === 'pt' ? 'Fundo atualizado!' : 'Background updated!');
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all"
          >
            {saveLabel}
          </button>
        </div>
      </div>

      {/* Live wallpapers (Unsplash / Pexels / Picsum) */}
      <WallpaperBrowser
        activeUrl={settings.homeTheme === 'custom' ? settings.customBg : null}
        onApply={(fullUrl) => {
          onUpdate({ customBg: fullUrl, homeTheme: 'custom' });
          toast.success(language === 'pt' ? 'Papel de parede aplicado!' : 'Wallpaper applied!');
        }}
      />

      {/* Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">{themeLibraryLabel}</h4>
          <span className="text-[10px] text-white/20 font-bold">{THEMES.length} {language === 'pt' ? 'no total' : 'total'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {THEME_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setThemeCat(c.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                themeCat === c.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/[0.04] text-white/40 hover:text-white/60'
              }`}>{c.label}</button>
          ))}
        </div>
        {themeCat === 'all' ? (
          // Show ALL themes, grouped under a heading per category.
          <div className="space-y-5">
            {namedCategories.map(cat => {
              const items = THEMES.filter(the => the.category === cat.id);
              if (items.length === 0) return null;
              return (
                <div key={cat.id} className="space-y-2">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                    {cat.label} <span className="text-white/20">· {items.length}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">{items.map(renderTile)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">{filteredThemes.map(renderTile)}</div>
        )}
      </div>
    </div>
  );
}
