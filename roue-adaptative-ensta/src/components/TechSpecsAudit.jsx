import { useMemo, useState } from 'react';
import projectData from '../config/projectData.js';
import { useSector } from '../context/SectorContext.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import Icon from './ui/Icon.jsx';
import { Badge, Card, Section, SegmentedTabs } from './ui/Primitives.jsx';

const cfg = projectData.techSpecs;

function CadView({ active, setActive, category, wheelLeftLabel, wheelRightLabel }) {
  const compById = useMemo(() => Object.fromEntries(cfg.components.map((c) => [c.id, c])), []);
  const catById = useMemo(() => Object.fromEntries(cfg.categories.map((c) => [c.id, c])), []);
  const { width, height, shapes } = cfg.view;

  const isDim = (comp) => (active && active !== comp.id) || (category && comp.category !== category);

  const draw = (s, i, mirrored) => {
    const key = `${i}${mirrored ? 'm' : ''}`;
    if (s.decor) {
      return (
        <rect
          key={key}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx={s.rx || 0}
          fill={s.fill || '#0f172a'}
          stroke={s.stroke || '#334155'}
          strokeDasharray="4 3"
          opacity={active || category ? 0.35 : 0.75}
        />
      );
    }
    const comp = compById[s.ref];
    if (!comp) return null;
    const baseColor = s.fill || comp.color || catById[comp.category]?.color || '#94a3b8';
    const dim = isDim(comp);
    const isFocused = active === comp.id || (category && comp.category === category);
    const common = {
      fill: baseColor,
      fillOpacity: dim ? 0.14 : 0.9,
      stroke: isFocused ? '#ffffff' : baseColor,
      strokeWidth: isFocused ? 2 : 1,
      onClick: () => setActive(active === comp.id ? null : comp.id),
      style: { cursor: 'pointer', transition: 'fill-opacity .2s, stroke-width .15s' },
    };
    if (s.type === 'circle') return <circle key={key} cx={s.cx} cy={s.cy} r={s.r} {...common} />;
    if (s.type === 'polygon') return <polygon key={key} points={s.points} {...common} />;
    if (s.type === 'path') return <path key={key} d={s.d} {...common} />;
    return <rect key={key} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx || 0} {...common} />;
  };

  if (cfg.cadImage) {
    return (
      <img
        src={cfg.cadImage}
        alt="Vue CAO de la roue auto-adaptative R2A"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full select-none rounded-xl"
      />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full select-none rounded-2xl border border-slate-800/80 bg-[#070b14]"
      role="img"
      aria-label="Coupe axiale CAO par code couleur de la roue auto-adaptative R2A ENSTA"
    >
      <defs>
        <pattern id="cad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#111827" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#cad-grid)" />
      {/* Axe de rotation central */}
      <line x1="10" x2={width - 10} y1={height / 2} y2={height / 2} stroke="#334155" strokeDasharray="10 4 2 4" />
      <g>{shapes.map((s, i) => draw(s, i, false))}</g>
      <g transform={`translate(0 ${height}) scale(1 -1)`}>
        {shapes.filter((s) => s.mirror).map((s, i) => draw(s, i, true))}
      </g>
      <text x="14" y="20" fontSize="9.5" fontWeight="600" className="fill-slate-400" fontFamily="JetBrains Mono, monospace">
        COUPE AXIALE · CODE COULEUR CAO R2A
      </text>
      <text x="18" y={height - 12} fontSize="9" className="fill-emerald-400">
        ← Côté moyeu entraîneur
      </text>
      <text x="165" y={height - 12} textAnchor="middle" fontSize="9" className="fill-slate-400">
        {wheelLeftLabel || 'Roue int.'}
      </text>
      <text x="375" y={height - 12} textAnchor="middle" fontSize="9" className="fill-slate-400">
        {wheelRightLabel || 'Roue ext.'}
      </text>
    </svg>
  );
}

/* Schéma dédié à la Variante Roue Magnétique Déformable (affiché en Robotique mobile) */
function MagneticWheelVariantCard({ variant }) {
  // 9 disques d'acier empilés épousant la courbure d'une conduite forcée + cordon de soudure
  const discOffsets = [18, 11, 6, 3, -5, 2, 5, 10, 17];
  return (
    <Card className="mt-8 border-cyan-500/35 bg-gradient-to-br from-cyan-500/[0.06] via-slate-900/90 to-slate-950 p-6 md:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3.5 py-1 font-mono text-xs font-semibold text-cyan-300">
            <Icon name="ShieldCheck" size={14} />
            <span>{variant.badge}</span>
          </span>
          <h3 className="mt-3 font-display text-2xl font-bold text-white">{variant.title}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-300">{variant.description}</p>

          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            {variant.specs.map((sp) => (
              <div key={sp.label} className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5">
                <dt className="font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                  {sp.label}
                </dt>
                <dd className="mt-1 text-xs leading-relaxed text-slate-300">{sp.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Schéma vectoriel : empilement de disques d'acier découpés au laser épousant une conduite courbe + soudure */}
        <div className="rounded-2xl border border-slate-800 bg-[#060a13] p-4">
          <svg
            viewBox="0 0 380 230"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full select-none"
            role="img"
            aria-label="Schéma de la roue magnétique déformable à disques d'acier sur paroi courbe"
          >
            {/* Paroi acier courbe d'une conduite forcée */}
            <path
              d="M 28 194 Q 190 158 352 194 L 352 214 Q 190 178 28 214 Z"
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* Cordon de soudure en relief au centre */}
            <ellipse cx="190" cy="175" rx="11" ry="6" fill="#f59e0b" stroke="#fde68a" strokeWidth="1.2" />

            {/* Axe d'entrée central + aimant interne */}
            <line x1="56" y1="98" x2="324" y2="98" stroke="#22c55e" strokeWidth="7" strokeLinecap="round" />
            <rect x="116" y="76" width="148" height="44" rx="8" fill="#b45309" opacity="0.85" />

            {/* Empilement de 9 disques d'acier mobiles entre eux */}
            {discOffsets.map((dy, idx) => {
              const x = 114 + idx * 18;
              const yBottom = 176 + dy;
              const hDisc = 128;
              const yTop = yBottom - hDisc;
              const onWeld = idx === 4;
              return (
                <g key={x}>
                  <rect
                    x={x}
                    y={yTop}
                    width="12"
                    height={hDisc}
                    rx="3"
                    fill={onWeld ? '#38bdf8' : '#cbd5e1'}
                    fillOpacity="0.88"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                  />
                  {/* Flux magnétique au point de contact intime */}
                  <circle cx={x + 6} cy={yBottom - 1} r="2.6" fill="#22d3ee" />
                </g>
              );
            })}

            <text x="16" y="22" fontSize="9.5" fontWeight="700" fill="#22d3ee" fontFamily="JetBrains Mono, monospace">
              DISQUES ACIER LASER MOBILES · CIRCUIT MAGNÉTIQUE CONTINU
            </text>
            <text x="190" y="223" textAnchor="middle" fontSize="9.5" fill="#94a3b8">
              Paroi courbe de conduite forcée + franchissement cordon de soudure
            </text>
          </svg>
        </div>
      </div>
    </Card>
  );
}

function EvidenceBadge({ id }) {
  const level = cfg.evidenceLevels.find((e) => e.id === id);
  return level ? <Badge tone={level.tone}>{level.label}</Badge> : null;
}

function AuditCardGrid({ items, tone }) {
  const isGood = tone === 'good';
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it, idx) => (
        <Card
          key={it.title}
          className={`flex flex-col justify-between p-6 ${
            isGood ? 'border-emerald-500/25' : 'border-amber-500/25'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${
                  isGood ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                <Icon name={isGood ? 'CheckCircle2' : 'Wrench'} size={19} />
              </span>
              <span className="font-mono text-xs font-bold text-slate-500">0{idx + 1}</span>
            </div>

            <div className="mt-4">
              <EvidenceBadge id={it.evidence} />
            </div>

            <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{it.detail}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function TechSpecsAudit() {
  const { sector } = useSector();
  const { isPrivileged } = useSecurity();
  const sectorCfg = cfg.bySector[sector.id] || cfg.bySector.agri;

  const [tab, setTab] = useState('cad');
  const [active, setActive] = useState('rocker_axles');
  const [category, setCategory] = useState(null);

  const activeComp = cfg.components.find((c) => c.id === active);
  const activeSectorNote = activeComp?.noteBySector?.[sector.id] || activeComp?.note;
  const { maturity } = sectorCfg;

  const techTabs = [
    { id: 'cad', label: 'Architecture CAO (6 sous-ensembles)', icon: 'Layers', count: 6 },
    { id: 'strengths', label: sectorCfg.strengthsTabLabel, icon: 'ShieldCheck', count: sectorCfg.strengths.length },
    { id: 'limits', label: sectorCfg.limitsTabLabel, icon: 'Wrench', count: sectorCfg.limits.length },
  ];

  return (
    <Section
      id="technologie"
      eyebrow={`Technologie & Brevets R2A · ${sector.label}`}
      eyebrowIcon="Cog"
      title={sectorCfg.title}
      subtitle={sectorCfg.subtitle}
    >
      <div className={!isPrivileged ? 'select-none' : ''}>
      {/* Sélecteur par Onglets (Segmented Control) */}
      <div className="mb-8">
        <SegmentedTabs
          tabs={techTabs}
          activeId={tab}
          onChange={setTab}
          ariaLabel="Sous-sections Technologie et Audit"
        />
      </div>

      {/* ONGLET A : ARCHITECTURE CAO (+ VARIANTE ROUE MAGNÉTIQUE EN ROBOTIQUE) */}
      {tab === 'cad' && (
        <>
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
            <Card className="p-6 md:p-7">
              <CadView
                active={active}
                setActive={setActive}
                category={category}
                wheelLeftLabel={sectorCfg.wheelLeftLabel}
                wheelRightLabel={sectorCfg.wheelRightLabel}
              />
              <p className="mt-3 text-xs leading-relaxed text-slate-400">{sectorCfg.cadDisclaimer}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cfg.categories.map((c) => {
                  const on = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategory(on ? null : c.id);
                        setActive(null);
                      }}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                        on ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                      style={{ borderColor: on ? c.color : '#334155' }}
                      aria-pressed={on}
                    >
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="flex flex-col justify-between p-6 md:p-7">
              <div>
                <h3 className="font-display text-xl font-bold text-white">Nomenclature CAO (6 sous-ensembles)</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Sélectionnez une pièce pour inspecter son rôle cinématique et son adaptation à la filière{' '}
                  <strong className="text-slate-200">{sector.label}</strong>.
                </p>
                <ul className="mt-4 space-y-2">
                  {cfg.components.map((c) => {
                    const color = c.color || cfg.categories.find((x) => x.id === c.category)?.color;
                    const on = active === c.id;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setCategory(null);
                            setActive(on ? null : c.id);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition ${
                            on
                              ? 'border-amber-500/50 bg-slate-800 text-white'
                              : 'border-slate-800/60 bg-slate-950/30 text-slate-200 hover:bg-slate-800/60'
                          }`}
                        >
                          {c.id === 'guiding_jaws' ? (
                            <span className="flex shrink-0 items-center gap-0.5">
                              <span className="h-3.5 w-2 rounded-l-sm bg-orange-500" />
                              <span className="h-3.5 w-1.5 rounded-r-sm bg-yellow-400" />
                            </span>
                          ) : (
                            <span className="h-3.5 w-3.5 shrink-0 rounded-sm" style={{ background: color }} />
                          )}
                          <span>{c.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-5 min-h-[124px] rounded-2xl border border-slate-800 bg-slate-950/75 p-5 text-sm">
                {activeComp ? (
                  <>
                    <p className="font-display text-base font-bold text-white">{activeComp.label}</p>
                    <p className="mt-1.5 leading-relaxed text-slate-300">{activeComp.role}</p>
                    {activeSectorNote && (
                      <p className="mt-2.5 border-t border-slate-800 pt-2 text-xs font-medium text-amber-300">
                        <span className="font-mono uppercase tracking-wider text-slate-400">
                          Spécificité {sector.short} :{' '}
                        </span>
                        {activeSectorNote}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-slate-400">
                    Cliquez sur un sous-ensemble du schéma ou de la nomenclature pour afficher sa fonction mécanique et son adaptation métier.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Carte dédiée à la Variante Roue Magnétique Déformable en mode Robotique mobile */}
          {sectorCfg.magneticVariant && <MagneticWheelVariantCard variant={sectorCfg.magneticVariant} />}
        </>
      )}

      {/* ONGLET B : 5 FORCES VALIDÉES */}
      {tab === 'strengths' && <AuditCardGrid items={sectorCfg.strengths} tone="good" />}

      {/* ONGLET C : 5 DÉFIS R&D & INDUSTRIALISATION */}
      {tab === 'limits' && <AuditCardGrid items={sectorCfg.limits} tone="warn" />}

      {/* Bandeau synthétique TRL 6 / 9 adapté à la filière en pied de section */}
      <Card className="mt-10 p-6 md:p-8">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-display text-xl font-bold text-white">{maturity.title}</h3>
            <div className="mt-4 flex gap-1.5" role="img" aria-label={`TRL ${maturity.trl} sur ${maturity.trlMax}`}>
              {Array.from({ length: maturity.trlMax }, (_, i) => (
                <div
                  key={i}
                  className={`flex h-10 flex-1 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                    i < maturity.trl ? 'bg-amber-500 text-slate-950' : 'bg-slate-800/90 text-slate-500'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              <strong className="font-mono text-amber-400">
                TRL {maturity.trl} / {maturity.trlMax}
              </strong>{' '}
              — {maturity.trlNote}
            </p>
          </div>

          <ol className="space-y-3">
            {maturity.roadmap.map((step) => {
              const tone = step.status === 'done' ? 'good' : step.status === 'next' ? 'warn' : 'slate';
              const label =
                step.badge || (step.status === 'done' ? 'Réalisé' : step.status === 'next' ? 'En cours' : 'Planifié');
              return (
                <li key={step.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2.5 text-slate-200">
                    <Icon
                      name={step.status === 'done' ? 'CheckCircle2' : 'ChevronRight'}
                      size={17}
                      className={step.status === 'done' ? 'shrink-0 text-emerald-400' : 'shrink-0 text-amber-400'}
                    />
                    <span>{step.label}</span>
                  </span>
                  <Badge tone={tone} className="shrink-0">
                    {label}
                  </Badge>
                </li>
              );
            })}
          </ol>
        </div>
      </Card>
      </div>
    </Section>
  );
}
