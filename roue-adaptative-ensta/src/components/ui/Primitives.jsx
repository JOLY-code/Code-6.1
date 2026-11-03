import Icon from './Icon.jsx';

const TONES = {
  slate: 'bg-slate-800/80 text-slate-300 border-slate-700/90',
  good: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  warn: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  bad: 'bg-red-500/10 text-red-300 border-red-500/30',
  info: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
};
export const toneClass = (tone) => TONES[tone] || TONES.slate;

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Badge({ tone = 'slate', children, className = '', style }) {
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${TONES[tone] || TONES.slate} ${className}`}
    >
      {children}
    </span>
  );
}

export function Section({ id, eyebrow, eyebrowIcon, title, subtitle, children, className = '' }) {
  return (
    <section id={id} className={`scroll-mt-28 border-t border-slate-900/90 py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title) && (
          <header className="mb-12 max-w-3xl md:mb-14">
            {eyebrow && (
              <p className="eyebrow">
                {eyebrowIcon && <Icon name={eyebrowIcon} size={13} />}
                <span>{eyebrow}</span>
              </p>
            )}
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export function KpiCard({ label, value, hint, icon, accent = '#f59e0b' }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        {icon && (
          <span className="rounded-xl p-2" style={{ background: `${accent}1f`, color: accent }}>
            <Icon name={icon} size={18} />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-4xl font-black tracking-tight tabular-nums text-white md:text-5xl">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs leading-relaxed text-slate-400">{hint}</p>}
    </Card>
  );
}

/** Sélecteur d'onglets (Segmented Control) pour la divulgation progressive. */
export function SegmentedTabs({ tabs, activeId, onChange, ariaLabel = 'Sélection de vue', className = '' }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              active
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/25'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            {tab.icon && <Icon name={tab.icon} size={16} />}
            <span>{tab.label}</span>
            {tab.count != null && (
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                  active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Slider + saisie numérique synchronisés. */
export function RangeField({ label, unit, value, min, max, step = 1, onChange, help, decimals = 0 }) {
  const clamp = (v) => Math.min(max, Math.max(min, v));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            className="input w-24 py-1.5 text-right font-mono text-sm tabular-nums"
            value={Number.isFinite(value) ? Number(value.toFixed(decimals + 2)) : ''}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v)) onChange(clamp(v));
            }}
          />
          {unit && <span className="w-14 font-mono text-xs text-slate-400">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
      />
      {help && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{help}</p>}
    </div>
  );
}

export function EmptyState({ icon = 'Info', title, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 px-6 py-12 text-center">
      <Icon name={icon} size={30} className="text-slate-500" />
      <p className="mt-3 font-medium text-slate-200">{title}</p>
      {children && <p className="mt-1.5 max-w-md text-sm text-slate-400">{children}</p>}
    </div>
  );
}
