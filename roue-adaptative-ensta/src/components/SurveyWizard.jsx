import { useEffect, useMemo, useRef, useState } from 'react';
import projectData from '../config/projectData.js';
import { useSector } from '../context/SectorContext.jsx';
import { resolveAssetUrl } from '../utils/assetUrl.js';
import storage from '../services/storageService.js';
import { fmtDate } from '../utils/format.js';
import { isEmpty, isVisible, resolveOptions } from '../utils/surveyAnalytics.js';
import Icon from './ui/Icon.jsx';
import { Badge, Card, Section } from './ui/Primitives.jsx';

const cfg = projectData.survey;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const stripStepNumber = (title = '') => String(title).replace(/^\s*\d+\s*[.)-]?\s*/, '');

const parseDecimal = (raw) => {
  if (raw === '' || raw === null || raw === undefined) return NaN;
  const n = Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

const countDigits = (raw = '') => String(raw).replace(/\D/g, '').length;

function radioAccent(val, on) {
  if (!on) return { card: 'border-slate-700 text-slate-300 hover:bg-slate-800/60', ring: 'border-slate-600', dot: 'bg-amber-500' };
  if (val === 'Acceptable' || val === 'compatible_50') {
    return { card: 'border-emerald-500 bg-emerald-500/10 text-white', ring: 'border-emerald-400', dot: 'bg-emerald-400' };
  }
  if (val === 'Bloquant') return { card: 'border-red-500 bg-red-500/10 text-white', ring: 'border-red-400', dot: 'bg-red-400' };
  return { card: 'border-amber-500 bg-amber-500/10 text-white', ring: 'border-amber-500', dot: 'bg-amber-500' };
}

/* ------ Encart visuel synthétique du concept R2A (+H/2 / -H/2) pour l'Étape 2 ------ */
function ConceptRecapBox({ sectorId }) {
  const recap = cfg.conceptRecapBySector?.[sectorId] || cfg.conceptRecapBySector?.agri;
  if (!recap) return null;

  return (
    <div className="mb-6 rounded-2xl border border-sky-500/35 bg-gradient-to-r from-sky-500/10 via-slate-900/90 to-slate-950/90 p-4 sm:p-5">
      <div className="grid items-center gap-5 md:grid-cols-[1fr_210px]">
        <div>
          <Badge tone="info">{recap.badge}</Badge>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-200 sm:text-sm">
            {recap.lines.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Icon name="CheckCircle2" size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Micro-schéma SVG du balancier +H/2 / -H/2 */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5">
          <svg
            viewBox="0 0 200 116"
            draggable={false}
            className="w-full select-none"
            role="img"
            aria-label="Schéma du balancier R2A +H/2 et -H/2 sur obstacle"
          >
            {/* Sol + obstacle H */}
            <line x1="10" y1="92" x2="190" y2="92" stroke="#475569" strokeWidth="2" />
            <polygon points="118,92 128,70 162,70 172,92" fill="#475569" stroke="#94a3b8" strokeWidth="1.2" />
            <text x="145" y="85" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fde68a">
              H
            </text>

            {/* Roue interne au sol (-H/2 relatif) */}
            <rect x="44" y="36" width="26" height="56" rx="6" fill="#0f172a" stroke="#34d399" strokeWidth="1.8" />
            {/* Roue externe sur obstacle (+H/2 relatif) */}
            <rect x="132" y="14" width="26" height="56" rx="6" fill="#0f172a" stroke="#34d399" strokeWidth="1.8" />

            {/* Axes balanciers bleus + moyeu central marron/ambre */}
            <line x1="57" y1="54" x2="145" y2="32" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <line x1="57" y1="72" x2="145" y2="50" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <rect x="91" y="37" width="20" height="32" rx="5" fill="#b45309" stroke="#f59e0b" strokeWidth="1.3" />
            <circle cx="101" cy="53" r="4" fill="#22c55e" />

            {/* Annotations +H/2, -H/2 et 50%/50% */}
            <text x="57" y="29" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#38bdf8">
              −H/2 (50 %)
            </text>
            <text x="145" y="10" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#34d399">
              +H/2 (50 %)
            </text>
            <text x="100" y="108" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#cbd5e1">
              Pression ÷ 2 · Inclinaison α / 2 · 0 W
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ------ Matrice de Classement de 1 à 5 à Choix Unique par Colonne de Rang ------ */
function PriorityRankingMatrix({ q, options, value, onChange, describedBy }) {
  const ranks = q.ranks || [1, 2, 3, 4, 5];
  const rankingMap = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const assignedCount = options.filter((o) => ranks.includes(Number(rankingMap[o.value]))).length;

  const selectRank = (optValue, rank) => {
    const next = { ...rankingMap };
    const prevRank = next[optValue];

    // Re-clic sur le même rang -> libère la case
    if (prevRank === rank) {
      delete next[optValue];
      onChange(next);
      return;
    }

    // Unicité stricte par colonne : si une autre ligne occupait déjà `rank`, on permute (si la ligne courante avait un rang) ou on libère l'ancienne ligne
    const conflictingKey = Object.keys(next).find((k) => k !== optValue && Number(next[k]) === rank);
    if (conflictingKey) {
      if (ranks.includes(Number(prevRank))) {
        next[conflictingKey] = prevRank;
      } else {
        delete next[conflictingKey];
      }
    }
    next[optValue] = rank;
    onChange(next);
  };

  return (
    <div id={q.id} tabIndex={-1} aria-describedby={describedBy} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Badge tone={assignedCount === options.length ? 'good' : 'warn'}>
            {assignedCount} / {options.length} rangs attribués
          </Badge>
          <span>1 = Priorité n°1 (la plus critique) → 5 = Priorité n°5 (un seul choix par rang)</span>
        </div>

        <button
          type="button"
          onClick={() => onChange({})}
          disabled={assignedCount === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:border-amber-500/50 hover:text-white disabled:opacity-40"
        >
          <Icon name="RotateCcw" size={12} className="text-amber-400" />
          <span>Réinitialiser les rangs</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {options.map((opt, rowIdx) => {
          const currentRank = Number(rankingMap[opt.value]) || null;
          return (
            <div
              key={opt.value}
              className={`flex flex-col justify-between gap-3 rounded-xl border p-3 transition sm:flex-row sm:items-center ${currentRank
                ? 'border-amber-500/35 bg-amber-500/[0.06]'
                : 'border-slate-800/90 bg-slate-900/45 hover:border-slate-700'
                }`}
            >
              <div className="flex items-start gap-2.5 text-sm text-slate-200">
                <span className="mt-0.5 font-mono text-xs font-bold text-slate-500">{rowIdx + 1}.</span>
                <span className="leading-snug">{opt.label}</span>
              </div>

              <div
                className="flex shrink-0 items-center gap-1.5 self-end sm:self-center"
                role="radiogroup"
                aria-label={`Rang de priorité pour : ${opt.label}`}
              >
                {ranks.map((r) => {
                  const isSelected = currentRank === r;
                  const usedElsewhere =
                    !isSelected && Object.entries(rankingMap).some(([k, v]) => k !== opt.value && Number(v) === r);
                  return (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => selectRank(opt.value, r)}
                      title={
                        isSelected
                          ? `Rang ${r} attribué (cliquer pour retirer)`
                          : usedElsewhere
                            ? `Rang ${r} déjà attribué à une autre ligne (cliquer pour permuter / réattribuer)`
                            : `Attribuer le rang ${r}`
                      }
                      className={`grid h-9 w-9 place-items-center rounded-lg border font-mono text-xs font-bold transition ${isSelected
                        ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-sm'
                        : usedElsewhere
                          ? 'border-slate-800 bg-slate-950/70 text-slate-500 hover:border-amber-500/50 hover:text-amber-300'
                          : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-amber-500/60 hover:bg-slate-800'
                        }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ champ générique ------------------------------ */
function Field({ q, value, onChange, effective, onExtraChange, error, sectorId, sectors, onSectorChange }) {
  const options = resolveOptions(q, sectorId);
  const vwMode = effective?.vwPriceMode || 'percent';

  const qLabel = useMemo(() => {
    if (q.vw) {
      return vwMode === 'eur' ? q.labelEur || q.label : q.labelPercent || q.label;
    }
    return q.labelBySector?.[sectorId] || q.label;
  }, [q, sectorId, vwMode]);

  const qPlaceholder =
    q.placeholderBySector?.[sectorId] !== undefined ? q.placeholderBySector[sectorId] : (q.placeholder ?? '');
  const hint = q.contextBySector?.[sectorId];
  const describedBy = error ? `${q.id}-err` : undefined;
  const dynamicUnit = q.vw ? (vwMode === 'eur' ? '€ HT' : '%') : q.unit;

  const body = (() => {
    switch (q.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            id={q.id}
            type={q.type === 'email' ? 'email' : q.type === 'tel' ? 'tel' : 'text'}
            inputMode={q.type === 'tel' ? 'tel' : q.type === 'email' ? 'email' : undefined}
            className={`input ${error ? 'border-red-500/70 focus:border-red-400' : ''}`}
            value={value ?? ''}
            placeholder={qPlaceholder}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={describedBy}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={q.id}
            rows={3}
            className="input"
            value={value ?? ''}
            placeholder={qPlaceholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'number':
      case 'price':
        return (
          <div className="relative max-w-md">
            <input
              id={q.id}
              type="number"
              step={q.step ?? 'any'}
              inputMode="decimal"
              className={`input pr-24 ${error ? 'border-red-500/70 focus:border-red-400' : ''}`}
              value={value ?? ''}
              min={q.positiveOnly ? undefined : q.min}
              max={q.max}
              placeholder={qPlaceholder}
              onChange={(e) => onChange(e.target.value === '' ? '' : e.target.value)}
              aria-invalid={!!error}
              aria-describedby={describedBy}
            />
            {dynamicUnit && (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs font-semibold text-amber-300">
                {dynamicUnit}
              </span>
            )}
          </div>
        );
      case 'ranking':
        return (
          <PriorityRankingMatrix
            q={q}
            options={options}
            value={value}
            onChange={onChange}
            describedBy={describedBy}
          />
        );
      case 'other_pain': {
        const prioField = q.priorityFieldId || 'otherPainPriority';
        const prioVal = effective?.[prioField] ?? '';
        return (
          <div className="rounded-2xl border border-slate-800/90 bg-slate-950/45 p-3.5">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <input
                id={q.id}
                type="text"
                className="input"
                value={value ?? ''}
                placeholder={qPlaceholder}
                onChange={(e) => onChange(e.target.value)}
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Priorité (optionnel) :</span>
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const active = Number(prioVal) === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => onExtraChange(prioField)(active ? '' : lvl)}
                      className={`grid h-8 w-8 place-items-center rounded-lg border font-mono text-xs font-bold transition ${active
                        ? 'border-amber-400 bg-amber-500 text-slate-950'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                        }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
      case 'vw_mode': {
        const currentMode = value || q.defaultValue || 'percent';
        return (
          <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label={qLabel}>
            {options.map((o) => {
              const on = currentMode === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onChange(o.value)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-xs font-semibold transition sm:text-sm ${on
                    ? 'border-amber-500 bg-amber-500/15 text-white shadow-sm'
                    : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800/70'
                    }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold ${on ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                      }`}
                  >
                    {o.value === 'percent' ? '%' : '€'}
                  </span>
                  <span className="leading-snug">{o.label}</span>
                </button>
              );
            })}
          </div>
        );
      }
      case 'sector':
        return (
          <div id={q.id} tabIndex={-1} className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={qLabel}>
            {sectors.map((s) => {
              const on = s.id === sectorId;
              return (
                <button
                  type="button"
                  key={s.id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSectorChange(s.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${on ? 'bg-slate-800 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  style={on ? { borderColor: s.color } : undefined}
                >
                  <Icon name={s.icon} size={16} style={{ color: s.color }} /> {s.label}
                </button>
              );
            })}
          </div>
        );
      case 'single': {
        const gridCols = q.columns === 3 ? 'sm:grid-cols-3' : q.columns === 1 ? 'grid-cols-1' : 'sm:grid-cols-2';
        return (
          <div id={q.id} tabIndex={-1} className={`grid gap-2 ${gridCols}`} role="radiogroup" aria-label={qLabel}>
            {options.map((o) => {
              const on = value === o.value;
              const acc = radioAccent(o.value, on);
              return (
                <button
                  type="button"
                  key={o.value}
                  role="radio"
                  aria-checked={on}
                  onClick={() => onChange(o.value)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition ${acc.card}`}
                >
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${acc.ring}`}>
                    {on && <span className={`h-2 w-2 rounded-full ${acc.dot}`} />}
                  </span>
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>
        );
      }
      case 'multi': {
        const list = Array.isArray(value) ? value : [];
        const full = q.max && list.length >= q.max;
        return (
          <div id={q.id} tabIndex={-1} className="grid gap-2 sm:grid-cols-2" role="group" aria-label={qLabel}>
            {options.map((o) => {
              const on = list.includes(o.value);
              const disabled = !on && full;
              return (
                <button
                  type="button"
                  key={o.value}
                  role="checkbox"
                  aria-checked={on}
                  disabled={disabled}
                  onClick={() => onChange(on ? list.filter((v) => v !== o.value) : [...list, o.value])}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition disabled:opacity-40 ${on ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800/60'
                    }`}
                >
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${on ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-600'
                      }`}
                  >
                    {on && <Icon name="Check" size={12} strokeWidth={3} />}
                  </span>
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>
        );
      }
      case 'scale': {
        const nums = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i);
        return (
          <div id={q.id} tabIndex={-1}>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={qLabel}>
              {nums.map((n) => (
                <button
                  type="button"
                  key={n}
                  role="radio"
                  aria-checked={value === n}
                  onClick={() => onChange(n)}
                  className={`h-10 min-w-[2.5rem] flex-1 rounded-lg border text-sm font-semibold transition ${value === n ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>{q.minLabel}</span>
              <span>{q.maxLabel}</span>
            </div>
          </div>
        );
      }
      case 'consent':
      case 'checkbox':
        return (
          <label
            htmlFor={q.id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm text-slate-300 ${error ? 'border-red-500/70 bg-red-500/5' : 'border-slate-700'
              }`}
          >
            <input
              id={q.id}
              type="checkbox"
              className="mt-1 h-4 w-4 accent-amber-500"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              aria-invalid={!!error}
              aria-describedby={describedBy}
            />
            <span>
              {cfg.consentText || qLabel}
              {q.required && <span className="ml-1 font-bold text-amber-400">*</span>}
            </span>
          </label>
        );
      default:
        return null;
    }
  })();

  const isCheckbox = q.type === 'consent' || q.type === 'checkbox';

  return (
    <div>
      {q.sectionTitle && (
        <div className="mb-3 border-t border-slate-800 pt-5">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400">{q.sectionTitle}</h4>
          {q.sectionSubtitle && <p className="mt-0.5 text-xs text-slate-400">{q.sectionSubtitle}</p>}
        </div>
      )}
      {!isCheckbox && (
        <label htmlFor={q.id} className="label">
          {qLabel}
          {q.required && (
            <span className="ml-1 text-amber-400" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {hint && <p className="-mt-1 mb-2 text-xs text-slate-400">{hint}</p>}
      {body}
      {q.help && !error && <p className="mt-1.5 text-xs text-slate-500">{q.help}</p>}
      {error && (
        <p id={`${q.id}-err`} role="alert" className="mt-1.5 text-xs font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* --------------------------------- wizard --------------------------------- */
export default function SurveyWizard({ standalone = false, onExplorePresentation, onBackToWelcome }) {
  const { sector, sectors, sectorId, setSectorId } = useSector();
  const [answers, setAnswers] = useState({ vwPriceMode: 'percent' });
  const [stepIdx, setStepIdx] = useState(0);
  const [errors, setErrors] = useState({});
  const [missingList, setMissingList] = useState([]);
  const [stepError, setStepError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const startedAt = useRef(Date.now());
  const topRef = useRef(null);

  const logoSrc = resolveAssetUrl(projectData.meta.logoUrl || '/Logo/ENSTA.webp');
  const step = cfg.steps[stepIdx];
  const isLast = stepIdx === cfg.steps.length - 1;
  const effective = useMemo(
    () => ({ vwPriceMode: 'percent', ...answers, sector: sectorId, sectorConfirm: sectorId }),
    [answers, sectorId],
  );

  // Purge des réponses spécifiques à un secteur lors d'un changement de filière
  useEffect(() => {
    setAnswers((prev) => {
      let changed = false;
      const next = { ...prev };
      cfg.steps
        .flatMap((s) => s.questions)
        .forEach((q) => {
          if (!q.optionsBySector || isEmpty(next[q.id])) return;
          const valid = resolveOptions(q, sectorId).map((o) => o.value);
          const val = next[q.id];
          if (q.type === 'ranking' && val && typeof val === 'object' && !Array.isArray(val)) {
            const keysOk = Object.keys(val).every((k) => valid.includes(k));
            if (!keysOk) {
              delete next[q.id];
              changed = true;
            }
            return;
          }
          const ok = Array.isArray(val) ? val.every((v) => valid.includes(v)) : valid.includes(val);
          if (!ok) {
            delete next[q.id];
            changed = true;
          }
        });
      return changed ? next : prev;
    });
  }, [sectorId]);

  const visibleQuestions = step.questions.filter((q) => isVisible(q, effective, sectorId));

  const setAnswer = (id) => (value) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setErrors((e) => (e[id] ? { ...e, [id]: undefined } : e));
    setMissingList((prev) => prev.filter((item) => item.id !== id));
    setStepError('');
  };

  const focusField = (fieldId) => {
    if (!fieldId || typeof document === 'undefined') return;
    const el = document.getElementById(fieldId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
    }
  };

  const validate = () => {
    const errs = {};
    const missingDetails = [];
    const vwMode = effective.vwPriceMode || 'percent';

    const pushErr = (q, msg) => {
      errs[q.id] = msg;
      const shortLabel =
        q.type === 'consent'
          ? 'Consentement RGPD'
          : q.vw
            ? vwMode === 'eur'
              ? q.labelEur || q.label
              : q.labelPercent || q.label
            : q.labelBySector?.[sectorId] || q.label;
      missingDetails.push({ id: q.id, label: shortLabel, message: msg });
    };

    visibleQuestions.forEach((q) => {
      const v = effective[q.id];

      if (q.type === 'ranking') {
        const opts = resolveOptions(q, sectorId);
        const ranks = q.ranks || [1, 2, 3, 4, 5];
        const map = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
        const assigned = opts.map((o) => Number(map[o.value])).filter((n) => ranks.includes(n));
        const unique = new Set(assigned);
        if (q.required && (assigned.length !== opts.length || unique.size !== opts.length)) {
          pushErr(
            q,
            `Veuillez classer chacune des ${opts.length} contraintes avec un rang unique de 1 à 5 (${unique.size}/${opts.length} renseignées).`,
          );
        }
        return;
      }

      if (q.required && isEmpty(v)) {
        if (q.type === 'consent' || q.type === 'checkbox') {
          pushErr(q, 'Le consentement RGPD est obligatoire pour valider et transmettre votre évaluation.');
        } else {
          pushErr(q, 'Ce champ obligatoire doit être renseigné.');
        }
        return;
      }

      if (!isEmpty(v)) {
        if (q.minLength && String(v).trim().length < q.minLength) {
          pushErr(q, `Veuillez saisir au moins ${q.minLength} caractères.`);
          return;
        }
        if (q.type === 'email' && !EMAIL_RE.test(String(v).trim())) {
          pushErr(q, 'Format d’adresse e-mail professionnel invalide (ex. nom@entreprise.fr).');
          return;
        }
        if (q.type === 'tel') {
          const minDigits = q.minDigits || 8;
          if (countDigits(v) < minDigits) {
            pushErr(q, `Numéro de téléphone invalide (au moins ${minDigits} chiffres requis).`);
            return;
          }
        }
        if (q.type === 'number' || q.type === 'price') {
          const num = parseDecimal(v);
          if (!Number.isFinite(num)) {
            pushErr(q, 'Veuillez saisir une valeur numérique valide.');
          } else if (q.positiveOnly && num <= 0) {
            pushErr(q, 'Veuillez saisir une valeur strictement positive (> 0).');
          } else if (!q.positiveOnly && q.min !== undefined && num < q.min) {
            pushErr(q, `Valeur invalide (minimum ${q.min}).`);
          } else if (q.max !== undefined && num > q.max) {
            pushErr(q, `Valeur invalide (maximum ${q.max}).`);
          }
        }
      }
    });

    let vwMsg = '';
    const vwQs = visibleQuestions.filter((q) => q.vw);

    // On ne vérifie l'ordre croissant QUE si les 4 questions sont présentes ET remplies
    if (vwQs.length === 4) {
      const order = ['tooCheap', 'cheap', 'expensive', 'tooExpensive'];
      const orderedQs = order.map((k) => vwQs.find((q) => q.vw === k));

      // Vérifier si toutes les cases sont remplies
      const allFilled = orderedQs.every(q => !isEmpty(effective[q.id]));

      if (allFilled) {
        const vals = orderedQs.map((q) => parseDecimal(effective[q.id]));

        // Vérifier si toutes les valeurs sont des nombres valides (pas NaN)
        const allValidNumbers = vals.every(val => Number.isFinite(val));

        if (!allValidNumbers) {
          vwMsg = 'Veuillez saisir uniquement des chiffres dans les 4 cases de prix.';
        }
      } else {
        // Si l'étape 3 est soumise mais que les champs sont vides, on force l'erreur
        vwMsg = 'Veuillez remplir les 4 cases de sensibilité au prix avant de continuer.';
      }
    }

    setErrors(errs);
    setMissingList(missingDetails);
    setStepError(vwMsg);

    const firstInvalidId =
      missingDetails[0]?.id || (vwMsg ? vwQs[0]?.id : null);
    if (firstInvalidId) {
      setTimeout(() => focusField(firstInvalidId), 30);
    }

    return missingDetails.length === 0 && !vwMsg;
  };

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const next = () => {
    if (validate()) {
      setStepIdx((i) => i + 1);
      setTimeout(scrollTop, 0);
    }
  };
  const prev = () => {
    setErrors({});
    setMissingList([]);
    setStepError('');
    setStepIdx((i) => Math.max(0, i - 1));
    setTimeout(scrollTop, 0);
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const allConfiguredQuestions = cfg.steps.flatMap((s) => s.questions);
    const visibleQs = allConfiguredQuestions.filter((q) => isVisible(q, effective, sectorId));
    const clean = {};

    visibleQs.forEach((q) => {
      const val = effective[q.id];
      if (isEmpty(val)) return;
      if (q.type === 'number' || q.type === 'price') {
        const num = parseDecimal(val);
        if (Number.isFinite(num)) clean[q.id] = num;
      } else if (typeof val === 'string') {
        clean[q.id] = val.trim();
      } else {
        clean[q.id] = val;
      }

      if (q.type === 'other_pain' && q.priorityFieldId) {
        const prio = Number(effective[q.priorityFieldId]);
        if (!isEmpty(val) && Number.isFinite(prio) && prio >= 1 && prio <= 5) {
          clean[q.priorityFieldId] = prio;
        }
      }
    });

    // Toujours mémoriser l'unité choisie (% ou € HT) pour l'analyse Van Westendorp en Back-Office
    clean.vwPriceMode = effective.vwPriceMode === 'eur' ? 'eur' : 'percent';

    const result = await storage.submitSurveyWriteOnly({
      sector: sectorId,
      answers: clean,
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
    });

    setSubmissionResult(result);
    setSubmitting(false);
    setDone(true);
    setTimeout(scrollTop, 0);
  };

  const restart = () => {
    setAnswers({ vwPriceMode: 'percent' });
    setErrors({});
    setMissingList([]);
    setStepError('');
    setStepIdx(0);
    setDone(false);
    setSubmissionResult(null);
    startedAt.current = Date.now();
  };

  const handleExplore = () => {
    if (onExplorePresentation) {
      onExplorePresentation();
    } else {
      const el = document.getElementById('pitch');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const sectionIntro = cfg.introBySector?.[sectorId] || cfg.intro;
  const stepIntro = step.introBySector?.[sectorId] || step.intro;

  const wizardCard = (
    <>
      <div ref={topRef} className="scroll-mt-28" />
      <Card className="mx-auto max-w-4xl p-6 sm:p-10">
        {done ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Icon name="CheckCircle2" size={34} />
            </span>
            <h3 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">{cfg.thankYou?.title}</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
              {cfg.thankYou?.message}
            </p>

            {/* Accusé de réception individuel + Téléchargement 1-clic du justificatif .json (Sauvegarde 3) */}
            {submissionResult && (
              <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-emerald-500/35 bg-slate-950/85 p-5 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Accusé de réception individuel
                  </span>
                  <Badge tone={submissionResult.queuedOffline ? 'warn' : 'good'}>
                    {submissionResult.queuedOffline
                      ? 'File hors-ligne activée (envoi auto dès réseau)'
                      : 'Archivé sur le serveur ENSTA R2A'}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                      Numéro de reçu de confirmation
                    </span>
                    <code className="font-mono text-base font-extrabold text-amber-300">
                      {submissionResult.receiptId}
                    </code>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <span className="block">Horodatage</span>
                    <span className="font-mono text-slate-200">{fmtDate(submissionResult.savedAt)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => storage.downloadSubmissionProof(submissionResult)}
                  className="btn-secondary mt-4 w-full justify-center border-emerald-500/40 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
                >
                  <Icon name="FileCheck" size={16} />
                  <span>Télécharger mon justificatif de confirmation (.json)</span>
                </button>
              </div>
            )}

            <div className="mx-auto mt-7 flex max-w-xl flex-col items-stretch justify-center gap-3">
              <button
                type="button"
                className="btn-primary justify-center py-3.5 text-sm font-bold"
                onClick={handleExplore}
              >
                <span>
                  {cfg.thankYou?.exploreCta ||
                    'Explorer maintenant la Présentation Complète, les Vidéos & le Simulateur R2A →'}
                </span>
              </button>
              <button type="button" className="btn-secondary justify-center py-3 text-xs sm:text-sm" onClick={restart}>
                <Icon name="RotateCcw" size={15} />
                <span>
                  {cfg.thankYou?.resetCta ||
                    'Nouvelle réponse (Réinitialiser le formulaire pour un autre interlocuteur)'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <ol className="mb-8 flex items-center gap-2" aria-label="Progression">
              {cfg.steps.map((s, i) => {
                const state = i < stepIdx ? 'done' : i === stepIdx ? 'current' : 'todo';
                const cleanTitle = stripStepNumber(s.title);
                return (
                  <li key={s.id} className="flex flex-1 items-center gap-2">
                    <button
                      type="button"
                      disabled={i > stepIdx}
                      onClick={() => setStepIdx(i)}
                      aria-current={state === 'current' ? 'step' : undefined}
                      className="flex items-center gap-2 text-left disabled:cursor-default"
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-bold transition ${state === 'done'
                          ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                          : state === 'current'
                            ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                            : 'border-slate-700 text-slate-500'
                          }`}
                      >
                        {state === 'done' ? <Icon name="Check" size={16} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="hidden md:block">
                        <span className={`block text-sm font-semibold ${state === 'todo' ? 'text-slate-500' : 'text-white'}`}>
                          {cleanTitle}
                        </span>
                        <span className="block text-xs text-slate-500">{s.subtitle}</span>
                      </span>
                    </button>
                    {i < cfg.steps.length - 1 && (
                      <span className={`h-px flex-1 ${i < stepIdx ? 'bg-emerald-500/60' : 'bg-slate-800'}`} />
                    )}
                  </li>
                );
              })}
            </ol>

            {/* En mode "Questionnaire seul" (Focus), rappel synthétique du principe R2A en haut de l'Étape 2 */}
            {standalone && step.id === 'besoins' && <ConceptRecapBox sectorId={sectorId} />}

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Étape {stepIdx + 1} / {cfg.steps.length} · Filière {sector.label}
              </p>
              <h3 className="mt-1 flex items-center gap-2 font-display text-xl font-bold text-white">
                <Icon name={step.icon || 'ClipboardList'} size={20} className="text-slate-400" />
                <span>{stripStepNumber(step.title)}</span>
              </h3>
              {stepIntro && (
                <p className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-slate-300">
                  {stepIntro}
                </p>
              )}
            </div>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (isLast) submit();
                else next();
              }}
              noValidate
            >
              {visibleQuestions.map((q) => (
                <Field
                  key={q.id}
                  q={q}
                  value={effective[q.id]}
                  onChange={setAnswer(q.id)}
                  effective={effective}
                  onExtraChange={setAnswer}
                  error={errors[q.id]}
                  sectorId={sectorId}
                  sectors={sectors}
                  onSectorChange={setSectorId}
                />
              ))}

              {/* Encadré d'alerte rouge détaillant exactement les champs obligatoires manquants ou mal formatés */}
              {(missingList.length > 0 || stepError) && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200 shadow-lg"
                >
                  <div className="flex items-start gap-2.5">
                    <Icon name="ShieldAlert" size={19} className="mt-0.5 shrink-0 text-red-400" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-red-200">
                        {isLast
                          ? 'Envoi bloqué — veuillez compléter vos coordonnées obligatoires :'
                          : 'Étape incomplète — veuillez vérifier les points suivants :'}
                      </p>
                      {missingList.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-red-200/95">
                          {missingList.map((item) => (
                            <li key={item.id} className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              <button
                                type="button"
                                onClick={() => focusField(item.id)}
                                className="text-left underline-offset-2 hover:underline"
                              >
                                <strong className="font-semibold text-white">{item.label} :</strong> {item.message}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {stepError && <p className="mt-2 text-xs font-medium text-red-200">{stepError}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5">
                <button type="button" className="btn-ghost" onClick={prev} disabled={stepIdx === 0}>
                  <Icon name="ChevronLeft" size={16} /> Précédent
                </button>
                <span className="hidden text-xs text-slate-500 sm:inline">{cfg.confidentialityNote}</span>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {isLast ? (submitting ? 'Transmission sécurisée…' : 'Envoyer mon évaluation') : 'Continuer'}
                  <Icon name={isLast ? 'Check' : 'ChevronRight'} size={16} />
                </button>
              </div>
            </form>
          </>
        )}
      </Card>
    </>
  );

  if (standalone) {
    return (
      <div className="min-h-screen bg-ink-950">
        {/* Bandeau minimaliste en mode Focus Plein Écran (sans biais de la présentation) */}
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {!logoError && logoSrc ? (
                <img
                  src={logoSrc}
                  alt="ENSTA Bretagne"
                  draggable={false}
                  onError={() => setLogoError(true)}
                  className="h-9 w-auto rounded-lg bg-white px-2 py-1 object-contain"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
                  <Icon name="ClipboardList" size={18} />
                </span>
              )}
              <div>
                <p className="font-display text-sm font-bold text-white">{projectData.meta.appName}</p>
                <p className="font-mono text-[10px] text-amber-400">
                  Mode Focus Consultation (~3 min) · Évaluation confidentielle ENSTA Bretagne
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1 md:flex">
              {sectors.map((s) => {
                const active = s.id === sectorId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSectorId(s.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${active ? 'text-slate-950' : 'text-slate-300 hover:text-white'
                      }`}
                    style={active ? { background: s.color } : undefined}
                  >
                    <Icon name={s.icon} size={13} />
                    <span>{s.short}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {onBackToWelcome && (
                <button type="button" onClick={onBackToWelcome} className="btn-ghost border border-slate-800 px-3 py-1.5 text-xs">
                  <Icon name="Home" size={14} />
                  <span className="hidden sm:inline">Accueil</span>
                </button>
              )}
              {onExplorePresentation && (
                <button type="button" onClick={onExplorePresentation} className="btn-secondary px-3 py-1.5 text-xs">
                  <Icon name="Play" size={13} className="text-amber-400" />
                  <span className="hidden sm:inline">Présentation complète</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <Section
          id="enquete-focus"
          className="!py-10 sm:!py-14"
          eyebrow={`Consultation B2B sans biais · ${sector.label}`}
          eyebrowIcon="ClipboardList"
          title={cfg.title}
          subtitle={sectionIntro}
        >
          {wizardCard}
        </Section>
      </div>
    );
  }

  return (
    <Section
      id="enquete"
      eyebrow={`Consultation B2B · ${sector.label}`}
      eyebrowIcon="ClipboardList"
      title={cfg.title}
      subtitle={sectionIntro}
    >
      {wizardCard}
    </Section>
  );
}
