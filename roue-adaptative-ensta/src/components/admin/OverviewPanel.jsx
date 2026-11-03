import { useMemo } from 'react';
import projectData from '../../config/projectData.js';
import { aggregateQuestion, allQuestions, getVwRows } from '../../utils/surveyAnalytics.js';
import { computeVanWestendorp } from '../../utils/vanWestendorp.js';
import { fmtMoney, fmtNumber } from '../../utils/format.js';
import { BarList } from '../ui/Charts.jsx';
import { Badge, Card, EmptyState, KpiCard } from '../ui/Primitives.jsx';

export default function OverviewPanel({ responses }) {
  const { kpis } = projectData.admin;
  const qs = allQuestions();
  const find = (id) => qs.find((q) => q.id === id);
  const sectorOf = (id) => projectData.sectors.find((s) => s.id === id);

  const stats = useMemo(() => {
    const interest = find(kpis.interestQuestionId) && aggregateQuestion(find(kpis.interestQuestionId), responses);
    const severity = find(kpis.severityQuestionId) && aggregateQuestion(find(kpis.severityQuestionId), responses);
    const pilotAnswers = responses.filter((r) => r.answers?.[kpis.pilotQuestionId]);
    const pilotPositive = pilotAnswers.filter((r) => kpis.pilotPositiveValues.includes(r.answers[kpis.pilotQuestionId])).length;
    const vwPct = computeVanWestendorp(getVwRows(responses, 'percent'));
    const vwEur = computeVanWestendorp(getVwRows(responses, 'eur'));
    const bySector = projectData.sectors.map((s) => ({
      label: s.label,
      color: s.color,
      value: responses.filter((r) => r.sector === s.id).length,
    }));
    return { interest, severity, pilotPositive, pilotTotal: pilotAnswers.length, vwPct, vwEur, bySector };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses]);

  const analyticsQs = qs.filter((q) => q.analytics);
  const demoCount = responses.filter((r) => r.demo).length;
  const oppPct = stats.vwPct.points?.opp?.x;
  const oppEur = stats.vwEur.points?.opp?.x;

  if (!responses.length) {
    return (
      <EmptyState icon="FileText" title="Aucune réponse pour le moment">
        Partagez les QR Codes de l&apos;enquête ou générez des données de démonstration dans l&apos;onglet « Données &amp; Exports ».
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Réponses"
          value={responses.length}
          hint={demoCount ? `dont ${demoCount} de démonstration` : 'réelles'}
          icon="FileText"
          accent="#38bdf8"
        />
        <KpiCard
          label="Intérêt moyen"
          value={stats.interest ? `${fmtNumber(stats.interest.avg, 1)} / ${find(kpis.interestQuestionId).max}` : '—'}
          icon="Target"
          accent="#f59e0b"
        />
        <KpiCard
          label="Candidats essai terrain"
          value={stats.pilotTotal ? `${fmtNumber((stats.pilotPositive / stats.pilotTotal) * 100, 0)} %` : '—'}
          hint={`${stats.pilotPositive} / ${stats.pilotTotal} (oui ou dossier)`}
          icon="Users"
          accent="#34d399"
        />
        <KpiCard
          label="Gravité perçue"
          value={stats.severity ? `${fmtNumber(stats.severity.avg, 1)} / ${find(kpis.severityQuestionId).max}` : '—'}
          icon="AlertTriangle"
          accent="#f87171"
        />
        <KpiCard
          label="Surcoût optimal (OPP)"
          value={oppPct != null ? `${fmtNumber(oppPct, 1)} %` : '—'}
          hint={
            oppEur != null
              ? `≈ ${fmtMoney(oppEur)} · ${stats.vwPct.n} rép. valides`
              : stats.vwPct.n
                ? `${stats.vwPct.n} réponses valides`
                : 'Données insuffisantes'
          }
          icon="Percent"
          accent="#a78bfa"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h4 className="mb-3 text-sm font-semibold text-white">Répartition par secteur</h4>
          <BarList items={stats.bySector.map((s) => ({ ...s, display: `${s.value}` }))} />
        </Card>

        {analyticsQs.map((q) => {
          const agg = aggregateQuestion(q, responses);
          const isWide = agg.kind === 'ranking' || agg.kind === 'other_pain';

          return (
            <Card key={q.id} className={`p-5 ${isWide ? 'lg:col-span-2' : ''}`}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {q.type === 'ranking'
                      ? 'Classement moyen des contraintes terrain (1 = Priorité n°1 à 5 = Priorité n°5)'
                      : q.type === 'other_pain'
                        ? 'Autres contraintes ou points de douleur signalés (champ libre « Autre »)'
                        : q.label}
                  </h4>
                  {q.type === 'ranking' && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      Plus le rang moyen est proche de <strong className="text-amber-300">1,0</strong>, plus la contrainte est jugée prioritaire par les répondants.
                    </p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-xs text-slate-500">n = {agg.n}</span>
              </div>

              {agg.kind === 'ranking' && (
                agg.items.length > 0 ? (
                  <BarList
                    color="#f59e0b"
                    max={5}
                    items={agg.items.map((item, idx) => ({
                      label: `${idx + 1}. ${item.label}`,
                      value: item.value,
                      display: `Rang moy. ${fmtNumber(item.avgRank, 2)} / 5${item.rank1Count ? ` · n°1 (${item.rank1Count}×)` : ''}`,
                    }))}
                  />
                ) : (
                  <p className="text-xs text-slate-500">Aucun classement 1–5 enregistré pour ce filtre.</p>
                )
              )}

              {agg.kind === 'other_pain' && (
                agg.items.length > 0 ? (
                  <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {agg.items.map((entry) => {
                      const sec = sectorOf(entry.sector);
                      return (
                        <li
                          key={entry.id}
                          className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {sec && (
                                <Badge style={{ color: sec.color, borderColor: `${sec.color}55` }}>{sec.short}</Badge>
                              )}
                              {entry.company && <span className="font-semibold text-slate-200">{entry.company}</span>}
                            </div>
                            <p className="text-sm text-white">« {entry.text} »</p>
                          </div>
                          {entry.priority && (
                            <Badge tone="warn">Priorité n°{entry.priority}</Badge>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">Aucune autre contrainte saisie dans le champ « Autre » pour le moment.</p>
                )
              )}

              {agg.kind === 'frequency' && (
                <BarList
                  items={agg.items.slice(0, 8).map((i) => ({
                    ...i,
                    display: `${i.value} · ${fmtNumber((i.value / Math.max(1, agg.n)) * 100, 0)} %`,
                  }))}
                />
              )}

              {agg.kind === 'numeric' && (
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Number.isFinite(agg.avg) ? fmtNumber(agg.avg, 1) : '—'}
                    <span className="ml-1 text-sm font-normal text-slate-500">
                      moyenne{q.unit ? ` (${q.unit})` : ''}
                    </span>
                  </p>
                  {agg.items.length > 0 && (
                    <div className="mt-3">
                      <BarList items={agg.items} color="#38bdf8" />
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
