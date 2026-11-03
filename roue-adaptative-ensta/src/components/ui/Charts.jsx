import { useMemo } from 'react';

export function niceTicks(min, max, count = 5) {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const norm = step0 / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const start = Math.ceil(min / step - 1e-9) * step;
  const ticks = [];
  for (let v = start; v <= max + step * 1e-6; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

/**
 * Graphique en lignes SVG générique.
 * series: [{ label, color, points:[{x,y}], dashed?, width?, thin? }]
 * markers: [{ x, label, color }] — lignes verticales ; band: { from, to, color, label }
 * hover: valeur x courante (curseur vertical optionnel via `cursorX`)
 */
export function LineChart({
  series, xDomain, yDomain, xFormat = String, yFormat = String, xLabel, yLabel,
  markers = [], band, cursorX, height = 300, legend = true,
}) {
  const W = 640;
  const H = height;
  const m = { t: 20, r: 20, b: 46, l: 58 };

  const dom = useMemo(() => {
    const pts = series.flatMap((s) => s.points);
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const x0 = xDomain?.[0] ?? Math.min(...xs);
    const x1 = xDomain?.[1] ?? Math.max(...xs);
    const y0 = yDomain?.[0] ?? Math.min(0, ...ys);
    const y1 = yDomain?.[1] ?? Math.max(...ys) * 1.05;
    return { x0, x1: x1 === x0 ? x0 + 1 : x1, y0, y1: y1 === y0 ? y0 + 1 : y1 };
  }, [series, xDomain, yDomain]);

  const sx = (x) => m.l + ((x - dom.x0) / (dom.x1 - dom.x0)) * (W - m.l - m.r);
  const sy = (y) => H - m.b - ((y - dom.y0) / (dom.y1 - dom.y0)) * (H - m.t - m.b);
  const xt = niceTicks(dom.x0, dom.x1, 6);
  const yt = niceTicks(dom.y0, dom.y1, 5);
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={yLabel || 'graphique'}>
        {yt.map((v) => (
          <g key={`y${v}`}>
            <line x1={m.l} x2={W - m.r} y1={sy(v)} y2={sy(v)} stroke="#1e293b" />
            <text x={m.l - 8} y={sy(v) + 4} textAnchor="end" className="fill-slate-500" fontSize="11">{yFormat(v)}</text>
          </g>
        ))}
        {xt.map((v) => (
          <g key={`x${v}`}>
            <line x1={sx(v)} x2={sx(v)} y1={H - m.b} y2={H - m.b + 4} stroke="#475569" />
            <text x={sx(v)} y={H - m.b + 18} textAnchor="middle" className="fill-slate-500" fontSize="11">{xFormat(v)}</text>
          </g>
        ))}
        <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke="#475569" />
        <line x1={m.l} x2={m.l} y1={m.t} y2={H - m.b} stroke="#475569" />

        {band && band.from != null && band.to != null && (
          <g>
            <rect x={sx(band.from)} y={m.t} width={Math.max(0, sx(band.to) - sx(band.from))} height={H - m.t - m.b} fill={band.color || '#f59e0b'} opacity="0.12" />
            {band.label && <text x={(sx(band.from) + sx(band.to)) / 2} y={m.t + 12} textAnchor="middle" fontSize="10" fill={band.color || '#f59e0b'}>{band.label}</text>}
          </g>
        )}

        {series.map((s) => (
          <path
            key={s.label}
            d={path(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.thin ? 1.2 : s.width || 2.4}
            strokeDasharray={s.dashed ? '5 4' : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={s.thin ? 0.6 : 1}
          />
        ))}

        {markers.filter((mk) => mk.x != null).map((mk, i) => (
          <g key={mk.label}>
            <line x1={sx(mk.x)} x2={sx(mk.x)} y1={m.t} y2={H - m.b} stroke={mk.color || '#e2e8f0'} strokeDasharray="3 3" />
            <text x={sx(mk.x)} y={m.t + 24 + (i % 2) * 12} textAnchor="middle" fontSize="10" fontWeight="600" fill={mk.color || '#e2e8f0'}>
              {mk.label}
            </text>
          </g>
        ))}

        {cursorX != null && cursorX >= dom.x0 && cursorX <= dom.x1 && (
          <line x1={sx(cursorX)} x2={sx(cursorX)} y1={m.t} y2={H - m.b} stroke="#f8fafc" strokeOpacity="0.5" strokeDasharray="2 3" />
        )}

        {xLabel && <text x={(m.l + W - m.r) / 2} y={H - 6} textAnchor="middle" fontSize="11" className="fill-slate-400">{xLabel}</text>}
        {yLabel && (
          <text transform={`translate(14 ${(m.t + H - m.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" className="fill-slate-400">{yLabel}</text>
        )}
      </svg>
      {legend && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          {series.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5" style={{ background: s.color, opacity: s.thin ? 0.6 : 1, borderTop: s.dashed ? `2px dashed ${s.color}` : undefined }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Liste de barres horizontales. items: [{label, value, display?}] */
export function BarList({ items, color = '#f59e0b', max, emptyLabel = 'Aucune donnée' }) {
  if (!items.length) return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.label}>
          <div className="mb-0.5 flex justify-between gap-3 text-xs">
            <span className="truncate text-slate-300">{it.label}</span>
            <span className="tabular-nums text-slate-400">{it.display ?? it.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(it.value / top) * 100}%`, background: it.color || color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

