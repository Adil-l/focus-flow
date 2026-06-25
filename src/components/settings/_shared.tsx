import type { ReactNode } from 'react';

/**
 * A reusable on/off toggle switch matching the settings panel styling.
 * Renders a labeled row (optional icon / badge / status / description) with a
 * peer-driven checkbox switch on the right.
 */
export function Toggle({
  label,
  desc,
  checked,
  onChange,
  icon,
  badge,
  status,
  disabled,
}: {
  label: ReactNode;
  desc?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: ReactNode;
  badge?: ReactNode;
  status?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="group flex items-start justify-between gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          {icon && (
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary transition-colors shrink-0">
              {icon}
            </div>
          )}
          <span className="text-[13px] font-bold text-white/80">{label}</span>
          {badge}
          {status}
        </div>
        {desc && <p className="text-[11px] text-white/40 mt-1 leading-relaxed">{desc}</p>}
      </div>
      <label className="relative inline-flex cursor-pointer mt-1">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
      </label>
    </div>
  );
}

/**
 * A glass card container with an optional uppercase header (icon + title + badge)
 * used to group related settings controls.
 */
export function SettingCard({
  title,
  icon,
  badge,
  children,
  className = '',
}: {
  title?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white/[0.04] rounded-xl p-4 border border-white/[0.05] ${className}`}>
      {title && (
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
          {icon}
          {title}
          {badge}
        </h4>
      )}
      {children}
    </div>
  );
}

/**
 * Standard section heading (title + optional subtitle) shown at the top of each
 * settings section.
 */
export function SectionHeader({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-bold text-white mb-0.5">{title}</h3>
      {subtitle && <p className="text-[13px] text-white/40 leading-snug">{subtitle}</p>}
    </div>
  );
}
