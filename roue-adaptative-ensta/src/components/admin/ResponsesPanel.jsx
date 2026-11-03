import { useMemo, useState } from 'react';
import projectData from '../../config/projectData.js';
import storage from '../../services/storageService.js';
import { allQuestions, detectResponseVwUnit, isEmpty, labelForValue } from '../../utils/surveyAnalytics.js';
import { fmtDate, fmtMoney, fmtNumber } from '../../utils/format.js';
import Icon from '../ui/Icon.jsx';
import Modal from '../ui/Modal.jsx';
import { Badge, EmptyState } from '../ui/Primitives.jsx';

const qs = allQuestions();
const sectorOf = (id) => projectData.sectors.find((s) => s.id === id);
const qById = (id) => qs.find((q) => q.id === id);
const vwId = Object.fromEntries(qs.filter((q) => q.vw).map((q) => [q.vw, q.id]));

function formatVwValue(num, unit) {
  if (!Number.isFinite(num)) return '—';
  return unit === 'eur' ? fmtMoney(num) : `${fmtNumber(num, 1)} %`;
}

function Detail({ response }) {
  const unit = detectResponseVwUnit(response);
  const a = response.answers || {};

  return (
    <dl className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-500">Date</dt>
          <dd className="text-slate-200">{fmtDate(response.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Durée</dt>
          <dd className="text-slate-200">{response.durationSec ? `${response.durationSec} s` : '—'}</dd>
        </div>
        {response.receiptId && (
          <div>
            <dt className="text-xs text-slate-500">N° de reçu</dt>
            <dd className="font-mono text-xs text-amber-300">{response.receiptId}</dd>
          </div>
        )}
      </div>

      {qs.map((q) => {
        const v = a[q.id];
        if (isEmpty(v) || q.type === 'consent') {
          return q.type === 'consent' && v ? (
            <div key={q.id}>
              <dt className="text-xs text-slate-500">Consentement RGPD</dt>
              <dd className="text-emerald-300">Donné</dd>
            </div>
          ) : null;
        }

        let shown;
        if (q.vw) {
          shown = formatVwValue(Number(v), unit);
        } else if (q.type === 'price' || q.unit?.includes('€')) {
          shown = fmtMoney(Number(v));
        } else if (q.type === 'other_pain') {
          const prio = a[q.priorityFieldId || 'otherPainPriority'];
          shown = prio ? `${v} (Priorité n°${prio})` : String(v);
        } else {
          shown = labelForValue(q, v, response.sector);
        }

        const qTitle = q.vw
          ? unit === 'eur'
            ? q.labelEur || q.label
            : q.labelPercent || q.label
          : q.labelBySector?.[response.sector] || q.label;

        return (
          <div key={q.id}>
            <dt className="text-xs text-slate-500">{qTitle}</dt>
            <dd className="text-sm text-slate-100">{Array.isArray(shown) ? shown.join(' · ') : String(shown)}</dd>
          </div>
        );
      })}
    </dl>
  );
}

export default function ResponsesPanel({ responses, onChanged }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return responses;
    return responses.filter((r) => JSON.stringify({ answers: r.answers, receiptId: r.receiptId }).toLowerCase().includes(t));
  }, [responses, query]);

  const remove = async (r) => {
    if (!window.confirm('Supprimer définitivement cette réponse ?')) return;
    await storage.deleteResponse(r.id);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Icon name="Search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-9"
            placeholder="Rechercher (entreprise, contact, reçu…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher"
          />
        </div>
        <button
          className="btn-secondary"
          onClick={() =>
            storage.downloadFile(`reponses-enquete-${storage.stamp()}.csv`, storage.responsesToCSV(rows), 'text/csv')
          }
          disabled={!rows.length}
        >
          <Icon name="FileSpreadsheet" size={16} /> Export CSV ({rows.length})
        </button>
      </div>

      {!rows.length ? (
        <EmptyState icon="FileText" title="Aucune réponse">
          Aucun résultat pour ce filtre.
        </EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="th">Date</th>
                <th className="th">Secteur</th>
                <th className="th">Organisation &amp; Contact</th>
                <th className="th text-right">Intérêt</th>
                <th className="th">Essai</th>
                <th className="th text-right">Bonne affaire → Élevé</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {rows.map((r) => {
                const s = sectorOf(r.sector);
                const pilot = qById(projectData.admin.kpis.pilotQuestionId);
                const a = r.answers || {};
                const unit = detectResponseVwUnit(r);
                const companyName = a[projectData.survey.fieldMap.company] || '—';
                const contactName = a[projectData.survey.fieldMap.name] || '';
                const alreadyMentionsDemo = /\bd[eé]mo\b/i.test(String(companyName));
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="td whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                    <td className="td">
                      <Badge style={{ color: s?.color, borderColor: `${s?.color}55` }}>{s?.short || r.sector}</Badge>
                    </td>
                    <td className="td">
                      <div className="font-medium text-white">
                        {companyName}{' '}
                        {r.demo && !alreadyMentionsDemo && <Badge tone="warn" className="ml-1">démo</Badge>}
                      </div>
                      {contactName && <div className="text-xs text-slate-400">{contactName}</div>}
                    </td>
                    <td className="td text-right tabular-nums">{a[projectData.admin.kpis.interestQuestionId] ?? '—'}</td>
                    <td className="td">
                      {pilot && a[pilot.id]
                        ? labelForValue(pilot, a[pilot.id], r.sector).toString().split(',')[0].slice(0, 24)
                        : '—'}
                    </td>
                    <td className="td whitespace-nowrap text-right font-mono text-xs tabular-nums">
                      {a[vwId.cheap] !== undefined && a[vwId.expensive] !== undefined
                        ? `${formatVwValue(+a[vwId.cheap], unit)} → ${formatVwValue(+a[vwId.expensive], unit)}`
                        : '—'}
                    </td>
                    <td className="td whitespace-nowrap text-right">
                      <button className="btn-ghost px-2" onClick={() => setSelected(r)} aria-label="Voir le détail">
                        <Icon name="FileText" size={15} />
                      </button>
                      <button
                        className="btn-ghost px-2 hover:text-red-300"
                        onClick={() => remove(r)}
                        aria-label="Supprimer"
                      >
                        <Icon name="Trash2" size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal
          title={selected.answers?.[projectData.survey.fieldMap.company] || 'Détail de la réponse'}
          onClose={() => setSelected(null)}
          wide
        >
          <Detail response={selected} />
        </Modal>
      )}
    </div>
  );
}
