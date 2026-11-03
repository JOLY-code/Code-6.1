import { useMemo, useState } from 'react';
import { computeVanWestendorp } from '../../utils/vanWestendorp.js';
import { getVwRows } from '../../utils/surveyAnalytics.js';
import { fmtCompactMoney, fmtMoney, fmtNumber } from '../../utils/format.js';
import { LineChart } from '../ui/Charts.jsx';
import Icon from '../ui/Icon.jsx';
import { Card, EmptyState } from '../ui/Primitives.jsx';

const COLORS = {
  tooCheap: '#38bdf8',
  cheap: '#34d399',
  expensive: '#f59e0b',
  tooExpensive: '#ef4444',
};

const POINTS = [
  { id: 'pmc', short: 'PMC', label: 'Seuil plancher (marginalement trop bas)', hint: '« Trop peu cher » = « Pas bonne affaire »', color: '#38bdf8' },
  { id: 'opp', short: 'OPP', label: 'Seuil optimal (résistance minimale)', hint: '« Trop peu cher » = « Trop cher »', color: '#a78bfa' },
  { id: 'ipp', short: 'IPP', label: "Point d'indifférence", hint: '« Très bonne affaire » = « Élevé »', color: '#34d399' },
  { id: 'pme', short: 'PME', label: 'Seuil plafond (marginalement trop cher)', hint: '« Trop cher » = « Pas élevé »', color: '#ef4444' },
];

export default function VanWestendorpPanel({ responses, sectorFilter }) {
  const [unitMode, setUnitMode] = useState('percent'); // 'percent' (défaut) | 'eur'

  const result = useMemo(
    () => computeVanWestendorp(getVwRows(responses, unitMode)),
    [responses, unitMode],
  );
  const altResult = useMemo(
    () => computeVanWestendorp(getVwRows(responses, unitMode === 'percent' ? 'eur' : 'percent')),
    [responses, unitMode],
  );
  const sectorsPresent = new Set(responses.map((r) => r.sector)).size;

  const fmtVal = (v) => (unitMode === 'percent' ? `${fmtNumber(v, 1)} %` : fmtMoney(v));
  const fmtAltVal = (v) => (unitMode === 'percent' ? fmtMoney(v) : `${fmtNumber(v, 1)} %`);

  const modeSwitcher = (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Unité d&apos;analyse Van Westendorp (% ou € HT)
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          Basculez entre la lecture en <strong>% de surcoût</strong> (par défaut) et la projection en{' '}
          <strong>€ HT par essieu équipé</strong> (calculée via le prix de référence machine/essieu de chaque répondant).
        </p>
      </div>
      <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1" role="radiogroup" aria-label="Unité Van Westendorp">
        <button
          type="button"
          role="radio"
          aria-checked={unitMode === 'percent'}
          onClick={() => setUnitMode('percent')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            unitMode === 'percent' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="Percent" size={13} />
          <span>En % de surcoût (défaut)</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={unitMode === 'eur'}
          onClick={() => setUnitMode('eur')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            unitMode === 'eur' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="Euro" size={13} />
          <span>En montant brut (€ HT)</span>
        </button>
      </div>
    </div>
  );

  if (!result.curves) {
    return (
      <div className="space-y-4">
        {modeSwitcher}
        <EmptyState icon="TrendingUp" title="Données insuffisantes pour l'analyse Van Westendorp">
          Il faut au moins 3 réponses valides (4 valeurs strictement positives et croissantes). Actuellement : {result.n} valide(s), {result.invalid} écartée(s).
        </EmptyState>
      </div>
    );
  }

  const { curves, points } = result;
  const altPoints = altResult.points || {};
  const series = [
    { label: 'Trop peu cher', color: COLORS.tooCheap, points: curves.tooCheap },
    { label: 'Très bonne affaire', color: COLORS.cheap, points: curves.cheap },
    { label: 'Élevé (envisageable)', color: COLORS.expensive, points: curves.expensive },
    { label: 'Trop cher (rédhibitoire)', color: COLORS.tooExpensive, points: curves.tooExpensive },
    { label: 'Pas bonne affaire (1 − bonne affaire)', color: COLORS.cheap, points: curves.notCheap, dashed: true, thin: true },
    { label: 'Pas élevé (1 − élevé)', color: COLORS.expensive, points: curves.notExpensive, dashed: true, thin: true },
  ];
  const markers = POINTS.filter((p) => points[p.id]).map((p) => ({ x: points[p.id].x, label: p.short, color: p.color }));
  const lo = points.pmc?.x;
  const hi = points.pme?.x;

  return (
    <div className="space-y-6">
      {modeSwitcher}

      {sectorFilter === 'all' && sectorsPresent > 1 && unitMode === 'eur' && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0" />
          En montant brut (€ HT), les ordres de grandeur diffèrent fortement entre secteurs : utilisez la vue en <strong>%</strong> ou filtrez par secteur en haut à droite.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white">
              Courbes de sensibilité prix ({unitMode === 'percent' ? '% du prix machine / essieu' : '€ HT par essieu équipé'})
            </h3>
            <span className="text-xs text-slate-500">
              n = {result.n} valides{result.invalid ? ` · ${result.invalid} écartées` : ''}
            </span>
          </div>
          <LineChart
            series={series}
            markers={markers}
            band={lo != null && hi != null ? { from: lo, to: hi, color: '#f59e0b', label: 'Plage acceptable' } : undefined}
            xDomain={[curves.tooCheap[0].x, curves.tooCheap[curves.tooCheap.length - 1].x]}
            yDomain={[0, 100]}
            xFormat={(v) => (unitMode === 'percent' ? `${fmtNumber(v, 1)} %` : fmtCompactMoney(v))}
            yFormat={(v) => `${v} %`}
            xLabel={
              unitMode === 'percent'
                ? "Surcoût acceptable en % du prix de la machine / de l'essieu (%)"
                : 'Surcoût par essieu équipé complet (€ HT)'
            }
            yLabel="Part des répondants"
            height={360}
          />
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-white">Points d&apos;équilibre Van Westendorp</h3>
            <ul className="mt-3 space-y-3">
              {POINTS.map((p) => (
                <li key={p.id} className="flex items-start gap-3">
                  <span className="mt-0.5 rounded px-1.5 py-0.5 text-xs font-bold text-slate-950" style={{ background: p.color }}>
                    {p.short}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.hint}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums text-white">
                      {points[p.id] ? fmtVal(points[p.id].x) : '—'}
                    </p>
                    {altPoints[p.id] && (
                      <p className="font-mono text-[11px] tabular-nums text-slate-400">
                        ≈ {fmtAltVal(altPoints[p.id].x)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="border-amber-500/30 bg-amber-500/5 p-5">
            <h3 className="flex items-center gap-2 font-semibold text-amber-300">
              <Icon name={unitMode === 'percent' ? 'Percent' : 'Euro'} size={16} /> Lecture stratégique DAJV ENSTA
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {lo != null && hi != null ? (
                <>
                  Plage acceptable : <strong>{fmtVal(lo)}</strong> à <strong>{fmtVal(hi)}</strong>
                  {points.opp ? (
                    <>
                      , seuil optimal (OPP) autour de <strong>{fmtVal(points.opp.x)}</strong>
                      {altPoints.opp ? <> (soit env. <strong>{fmtAltVal(altPoints.opp.x)}</strong>)</> : null}
                    </>
                  ) : null}
                  .
                </>
              ) : (
                'Les courbes ne se croisent pas clairement : collectez davantage de réponses.'
              )}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Les réponses incohérentes (non croissantes ou nulles) sont écartées automatiquement ({fmtNumber(result.n)} répondants valides).
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
