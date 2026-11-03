import { useMemo, useState } from 'react';
import projectData from '../config/projectData.js';
import { useSector } from '../context/SectorContext.jsx';
import { computeTco } from '../utils/tco.js';
import { fmtCompactMoney, fmtMoney, fmtNumber } from '../utils/format.js';
import Icon from './ui/Icon.jsx';
import { Badge, Card, KpiCard, RangeField, Section } from './ui/Primitives.jsx';
import { LineChart } from './ui/Charts.jsx';

const cfg = projectData.tco;

const defaultsOf = (inputs) => Object.fromEntries(inputs.map((i) => [i.id, i.default]));
const smartMoney = (n) => (Math.abs(n) >= 100000 ? fmtCompactMoney(n) : fmtMoney(n));

function LineTable({ title, refHeader, rows, totals }) {
  const maxSaving = Math.max(...rows.map((r) => Math.abs(r.saving)), 1);
  return (
    <div>
      <h4 className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="th">Poste</th>
              <th className="th text-right">{refHeader || 'Référence'}</th>
              <th className="th text-right">Roue R2A ENSTA</th>
              <th className="th text-right">Gain R2A</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="td">{r.label}</td>
                <td className="td whitespace-nowrap text-right font-mono tabular-nums">{fmtMoney(r.baseline)}</td>
                <td className="td whitespace-nowrap text-right font-mono tabular-nums">{fmtMoney(r.ensta)}</td>
                <td className="td w-44 whitespace-nowrap text-right font-mono tabular-nums">
                  <span className={r.saving >= 0 ? 'font-semibold text-emerald-300' : 'font-semibold text-amber-300'}>
                    {r.saving > 0 ? '+' : ''}
                    {fmtMoney(r.saving)}
                  </span>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full ${r.saving >= 0 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${(Math.abs(r.saving) / maxSaving) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-700 font-semibold text-white">
              <td className="td text-white">Total</td>
              <td className="td whitespace-nowrap text-right font-mono tabular-nums text-white">
                {fmtMoney(totals.baseline)}
              </td>
              <td className="td whitespace-nowrap text-right font-mono tabular-nums text-white">
                {fmtMoney(totals.ensta)}
              </td>
              <td className="td whitespace-nowrap text-right font-mono tabular-nums text-white">
                {totals.baseline - totals.ensta > 0 ? '+' : ''}
                {fmtMoney(totals.baseline - totals.ensta)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function TcoInner({ globals, setGlobals }) {
  const { sector } = useSector();
  const sectorCfg = cfg.sectors[sector.id];
  const [values, setValues] = useState(() => defaultsOf(sectorCfg.inputs));
  const [showAccounting, setShowAccounting] = useState(false);

  const result = useMemo(
    () => computeTco(sectorCfg, values, { horizon: globals.horizonYears, discountRatePct: globals.discountRatePct }),
    [sectorCfg, values, globals],
  );

  const groups = ['context', 'hypothesis'];
  const set = (id) => (v) => setValues((s) => ({ ...s, [id]: v }));
  const paybackYears = result.paybackMonths / 12;
  const paybackLabel = !Number.isFinite(result.paybackMonths)
    ? 'Non rentable'
    : result.paybackMonths === 0
      ? 'Immédiat'
      : `${fmtNumber(result.paybackMonths, 0)} mois`;
  const positive = result.npv >= 0;

  const capexHint =
    result.capexBaseline > 0
      ? sector.id === 'agri'
        ? `${smartMoney(result.capexDelta)} net après −${smartMoney(result.capexBaseline)} de lestage évité`
        : `${smartMoney(result.capexDelta)} net après −${smartMoney(result.capexBaseline)} évités à l'achat`
      : `Équipement R2A · ${sector.label}`;

  return (
    <Section
      id="tco"
      eyebrow={`Rentabilité & TCO · ${sector.label}`}
      eyebrowIcon="Calculator"
      title={cfg.title}
      subtitle={sectorCfg.subtitle}
    >
      {/* 1. Les 4 grandes cartes de résultats financiers en premier plan */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Investissement R2A"
          value={smartMoney(result.capexEnsta)}
          hint={capexHint}
          icon="Euro"
          accent="#38bdf8"
        />
        <KpiCard
          label="Économie annuelle"
          value={smartMoney(result.annualSaving)}
          hint={`${fmtNumber(result.annualSavingPct, 1)} % des coûts récurrents`}
          icon="TrendingUp"
          accent="#34d399"
        />
        <KpiCard
          label="Retour sur investissement"
          value={paybackLabel}
          hint={
            Number.isFinite(paybackYears) && paybackYears > 0
              ? `soit ${fmtNumber(paybackYears, 1)} an(s)`
              : undefined
          }
          icon="Gauge"
          accent="#f59e0b"
        />
        <KpiCard
          label={`VAN sur ${result.horizon} ans`}
          value={smartMoney(result.npv)}
          hint={result.roiPct != null ? `ROI net ${fmtNumber(result.roiPct, 0)} %` : 'Gain immédiat'}
          icon="Calculator"
          accent={positive ? '#34d399' : '#f87171'}
        />
      </div>

      {/* 2. Paramètres + Graphique de point mort + Panneau comptable déroulant */}
      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        {/* ----------- entrées ----------- */}
        <Card className="h-fit p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="flex items-center gap-2 font-display text-sm font-bold" style={{ color: sector.color }}>
              <Icon name={sector.icon} size={17} /> {sectorCfg.title}
            </p>
            <button
              type="button"
              className="btn-ghost px-2.5"
              onClick={() => setValues(defaultsOf(sectorCfg.inputs))}
              title="Réinitialiser les valeurs par défaut"
              aria-label="Réinitialiser"
            >
              <Icon name="RotateCcw" size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {groups.map((g) => {
              const inputs = sectorCfg.inputs.filter((i) => (i.group || 'context') === g);
              if (!inputs.length) return null;
              return (
                <fieldset
                  key={g}
                  className={g === 'hypothesis' ? 'rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-4' : ''}
                >
                  <legend
                    className={`mb-2.5 px-1 font-mono text-xs font-semibold uppercase tracking-widest ${
                      g === 'hypothesis' ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {cfg.groupLabels[g]}
                  </legend>
                  <div className="space-y-4">
                    {inputs.map((i) => (
                      <RangeField
                        key={i.id}
                        label={i.label}
                        unit={i.unit}
                        min={i.min}
                        max={i.max}
                        step={i.step}
                        value={values[i.id]}
                        onChange={set(i.id)}
                        decimals={i.step < 1 ? 2 : 0}
                      />
                    ))}
                  </div>
                </fieldset>
              );
            })}

            <fieldset className="border-t border-slate-800/80 pt-4">
              <legend className="mb-2.5 px-1 font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                Analyse financière
              </legend>
              <div className="space-y-4">
                {Object.entries(cfg.global).map(([key, g]) => (
                  <RangeField
                    key={key}
                    label={g.label}
                    unit={g.unit}
                    min={g.min}
                    max={g.max}
                    step={g.step}
                    value={globals[key]}
                    onChange={(v) => setGlobals((s) => ({ ...s, [key]: v }))}
                    decimals={g.step < 1 ? 1 : 0}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        </Card>

        {/* ----------- graphique point mort + accordéon CAPEX / OPEX ----------- */}
        <div className="space-y-6">
          <Card className="p-6 md:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  Trajectoire de point mort & Coûts cumulés sur {result.horizon} ans
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Comparaison cumulée entre la solution de référence ({sector.label}) et l&apos;équipement R2A ENSTA Bretagne.
                </p>
              </div>
              {Number.isFinite(paybackYears) && paybackYears > 0 && paybackYears <= result.horizon && (
                <Badge tone="good">Point mort à {fmtNumber(result.paybackMonths, 0)} mois</Badge>
              )}
            </div>

            <LineChart
              series={[
                {
                  label: sectorCfg.baselineChartLabel,
                  color: '#ef4444',
                  points: result.cumulative.baseline,
                },
                {
                  label: sectorCfg.enstaChartLabel,
                  color: '#34d399',
                  points: result.cumulative.ensta,
                },
              ]}
              xDomain={[0, result.horizon]}
              xLabel="Années"
              yLabel="Coût cumulé (€)"
              xFormat={(v) => fmtNumber(v, 0)}
              yFormat={(v) => fmtCompactMoney(v)}
              markers={
                Number.isFinite(paybackYears) && paybackYears > 0 && paybackYears <= result.horizon
                  ? [{ x: paybackYears, label: 'Point mort', color: '#f59e0b' }]
                  : []
              }
              height={320}
            />
          </Card>

          {/* Panneau déroulant (Divulgation progressive) : Lignes comptables CAPEX / OPEX */}
          <Card className="overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAccounting((v) => !v)}
              aria-expanded={showAccounting}
              className="flex w-full items-center justify-between gap-4 p-6 text-left transition hover:bg-slate-800/40"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
                  <Icon name="Table" size={18} />
                </span>
                <div>
                  <span className="block font-display text-base font-bold text-white">
                    Voir le détail des lignes comptables (CAPEX / OPEX · {sector.label})
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    Année 0 (investissement initial & coûts évités) et postes d&apos;exploitation annuels détaillés
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200">
                <span>{showAccounting ? 'Replier' : 'Déplier'}</span>
                <Icon name={showAccounting ? 'ChevronUp' : 'ChevronDown'} size={15} />
              </span>
            </button>

            {showAccounting && (
              <div className="space-y-8 border-t border-slate-800/80 p-6 md:p-8">
                <LineTable
                  title="Investissement initial & équipements évités (Année 0 — CAPEX)"
                  refHeader={sectorCfg.tableRefHeader}
                  rows={result.capex.map((r) => ({ ...r, saving: r.baseline - r.ensta }))}
                  totals={{ baseline: result.capexBaseline, ensta: result.capexEnsta }}
                />
                <LineTable
                  title="Coûts annuels d'exploitation (par an — OPEX)"
                  refHeader={sectorCfg.tableRefHeader}
                  rows={result.annual}
                  totals={{ baseline: result.annualBaseline, ensta: result.annualEnsta }}
                />
                <p className="flex gap-2 text-xs leading-relaxed text-slate-500">
                  <Icon name="Info" size={15} className="mt-0.5 shrink-0 text-amber-400" />
                  <span>{sectorCfg.disclaimer}</span>
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Section>
  );
}

export default function TcoCalculator() {
  const { sector } = useSector();
  const [globals, setGlobals] = useState(() => ({
    horizonYears: cfg.global.horizonYears.default,
    discountRatePct: cfg.global.discountRatePct.default,
  }));
  return <TcoInner key={sector.id} globals={globals} setGlobals={setGlobals} />;
}
