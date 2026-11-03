import { useState } from 'react';
import { useSector } from '../context/SectorContext.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import Icon from './ui/Icon.jsx';
import { Badge, Card } from './ui/Primitives.jsx';

/* --------- Triangle du trilemme : positionnement barycentrique --------- */
const CENTER = { x: 220, y: 230 };
const VERTICES = [
  { x: 220, y: 54 },
  { x: 64, y: 318 },
  { x: 376, y: 318 },
];

function toPoint(scores) {
  const w = scores.map((s) => s * s);
  const total = w.reduce((a, b) => a + b, 0) || 1;
  return {
    x: VERTICES.reduce((acc, v, i) => acc + v.x * (w[i] / total), 0),
    y: VERTICES.reduce((acc, v, i) => acc + v.y * (w[i] / total), 0),
  };
}

function splitLines(axis) {
  if (Array.isArray(axis.lines) && axis.lines.length) return axis.lines;
  const idx = axis.label.indexOf(' (');
  if (idx > 0) return [axis.label.slice(0, idx), axis.label.slice(idx + 1)];
  const amp = axis.label.indexOf(' & ');
  if (amp > 0) return [axis.label.slice(0, amp), `& ${axis.label.slice(amp + 3)}`];
  return [axis.label];
}

function TrilemmaChart({ trilemma, isPrivileged }) {
  const [hover, setHover] = useState(null);
  const active = hover ?? 'ensta';
  const labelPos = [
    { x: 220, y: 18, anchor: 'middle' },
    { x: 14, y: 342, anchor: 'start' },
    { x: 426, y: 342, anchor: 'end' },
  ];

  return (
    <Card className={`p-6 sm:p-8 ${!isPrivileged ? 'select-none' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-white">{trilemma.title}</h2>
        <Badge tone="warn">Positionnement / 10</Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{trilemma.subtitle}</p>

      <svg
        viewBox="0 0 440 374"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className="mx-auto mt-4 w-full max-w-md select-none"
        role="img"
        aria-label={`Positionnement des solutions — ${trilemma.title}`}
      >
        <polygon
          points={VERTICES.map((v) => `${v.x},${v.y}`).join(' ')}
          fill="rgba(15,23,42,0.65)"
          stroke="#334155"
          strokeWidth="1.5"
        />
        {[0.33, 0.66].map((k) => (
          <polygon
            key={k}
            points={VERTICES.map((v) => `${CENTER.x + (v.x - CENTER.x) * k},${CENTER.y + (v.y - CENTER.y) * k}`).join(' ')}
            fill="none"
            stroke="#1e293b"
            strokeDasharray="3 4"
          />
        ))}
        {VERTICES.map((v, i) => (
          <line key={i} x1={v.x} y1={v.y} x2={CENTER.x} y2={CENTER.y} stroke="#1e293b" />
        ))}
        {trilemma.axes.map((a, i) => {
          const lines = splitLines(a);
          return (
            <text
              key={a.id}
              x={labelPos[i].x}
              y={labelPos[i].y}
              textAnchor={labelPos[i].anchor}
              fontSize="10.5"
              fontWeight="600"
              className="fill-slate-300"
            >
              {lines.map((line, li) => (
                <tspan key={li} x={labelPos[i].x} dy={li === 0 ? 0 : 13}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
        {trilemma.solutions.map((s) => {
          const p = toPoint(s.scores);
          const isActive = s.id === active;
          return (
            <g
              key={s.id}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(s.id)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              className="cursor-pointer outline-none"
            >
              {s.highlight && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10"
                  fill={s.color}
                  opacity="0.5"
                  className="origin-center animate-ping-slow"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={s.highlight ? 9 : 7}
                fill={s.color}
                stroke="#020617"
                strokeWidth="2"
                opacity={isActive ? 1 : 0.75}
              />
              {isActive && (
                <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={s.color}>
                  {s.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {trilemma.solutions.map((s) => (
          <li
            key={s.id}
            onMouseEnter={() => setHover(s.id)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 transition ${
              s.id === active
                ? 'border-slate-700 bg-slate-800/90 text-white'
                : 'border-transparent bg-slate-950/40 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="truncate font-medium">{s.label}</span>
            </span>
            <span className="shrink-0 font-mono text-xs text-slate-400">{s.scores.join(' / ')}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">{trilemma.note}</p>
    </Card>
  );
}

export default function HeroPitch({ onNavigate }) {
  const { sector, sectors, setSectorId } = useSector();
  const { isPrivileged } = useSecurity();
  const [showPainDetails, setShowPainDetails] = useState(false);

  const hero = sector.hero;
  const accentIdx = hero.titleAccent ? hero.title.lastIndexOf(hero.titleAccent) : -1;
  const before = accentIdx >= 0 ? hero.title.slice(0, accentIdx) : hero.title;
  const after = accentIdx >= 0 ? hero.title.slice(accentIdx) : '';

  return (
    <section id="pitch" className="scroll-mt-28 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= BLOC HÉRO PRINCIPAL (100 % DYNAMIQUE PAR SECTEUR) ================= */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="animate-fade-up">
            <p className="eyebrow">
              <Icon name={sector.icon || 'Target'} size={13} />
              <span>{hero.eyebrow}</span>
            </p>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl">
              {before}
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                {after}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              {hero.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <button type="button" className="btn-primary text-base" onClick={() => onNavigate(hero.ctaPrimary.target)}>
                <span>{hero.ctaPrimary.label}</span>
                <Icon name="ArrowRight" size={18} />
              </button>
              <button type="button" className="btn-secondary text-base" onClick={() => onNavigate(hero.ctaSecondary.target)}>
                <Icon name="Play" size={16} className="text-amber-400" />
                <span>{hero.ctaSecondary.label}</span>
              </button>
            </div>

            {/* 3 Chiffres Clés (KPIs grand format par secteur) */}
            <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-slate-800/80 pt-8">
              {hero.stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl font-black tracking-tight tabular-nums text-white sm:text-4xl md:text-[2.65rem]">
                    {s.value}
                  </dt>
                  <dd className="mt-1.5 text-xs font-medium leading-snug text-slate-400 sm:text-sm">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Badges Brevets adaptés à la filière en JetBrains Mono */}
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {(hero.patentBadges || []).map((p) => (
                <li
                  key={p.code}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-200"
                >
                  <Icon name="ShieldCheck" size={14} className="text-amber-400" />
                  <span className="font-mono font-semibold text-white">{p.code}</span>
                  <span className="text-slate-400">· {p.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
            <TrilemmaChart key={sector.id} trilemma={sector.trilemma} isPrivileged={isPrivileged} />
          </div>
        </div>

        {/* ================= 3 CARTES VISUELLES CÔTE-À-CÔTE (DIVULGATION PROGRESSIVE) ================= */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3 md:mt-20">
          {hero.visionCards.map((card) => {
            const isGood = card.tone === 'good';
            return (
              <Card
                key={card.id}
                className={`flex flex-col justify-between p-7 ${
                  isGood ? 'border-emerald-500/30' : 'border-red-500/25'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-xl ${
                        isGood ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      <Icon name={card.icon} size={20} />
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">0{card.step.slice(-1)} / 03</span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-white">{card.title}</h3>

                  <ul className="mt-4 space-y-3.5 text-sm leading-relaxed text-slate-300">
                    {card.bullets.map((b) => (
                      <li key={b.bold} className="flex gap-2.5">
                        <Icon
                          name={isGood ? 'CheckCircle2' : 'AlertTriangle'}
                          size={16}
                          className={`mt-1 shrink-0 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}
                        />
                        <span>
                          <strong className="font-semibold text-white">{b.bold}</strong> {b.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}

          {/* Carte 3 : Les Gains Terrain par Secteur (dynamique selon secteur actif) */}
          <Card className="flex flex-col justify-between p-7" style={{ borderColor: `${sector.color}55` }}>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl"
                  style={{ background: `${sector.color}22`, color: sector.color }}
                >
                  <Icon name={sector.icon} size={20} />
                </span>

                {/* Mini-sélecteur rapide de secteur sur la carte */}
                <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/70 p-0.5">
                  {sectors.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSectorId(s.id)}
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                        s.id === sector.id ? 'text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                      style={s.id === sector.id ? { background: s.color } : undefined}
                    >
                      {s.short}
                    </button>
                  ))}
                </div>
              </div>

              <h3 className="mt-5 font-display text-xl font-bold text-white">
                Gains Terrain Validés · <span style={{ color: sector.color }}>{sector.label}</span>
              </h3>

              <ul className="mt-4 space-y-3.5 text-sm leading-relaxed text-slate-300">
                {(sector.highlights || []).map((b) => (
                  <li key={b.bold} className="flex gap-2.5">
                    <Icon name="CheckCircle2" size={16} className="mt-1 shrink-0" style={{ color: sector.color }} />
                    <span>
                      <strong className="font-semibold text-white">{b.bold}</strong> {b.text}
                    </span>
                  </li>
                ))}
              </ul>

              {showPainDetails && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-red-300">
                    Points de douleur résolus ({sector.label})
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-300">
                    {sector.painPoints.map((pt) => (
                      <li key={pt} className="flex gap-2">
                        <span className="text-red-400">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPainDetails((v) => !v)}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              <Icon name={showPainDetails ? 'ChevronUp' : 'ChevronDown'} size={15} />
              <span>
                {showPainDetails ? 'Masquer les points de douleur détaillés' : `Voir les 4 points de douleur (${sector.label})`}
              </span>
            </button>
          </Card>
        </div>
      </div>
    </section>
  );
}
