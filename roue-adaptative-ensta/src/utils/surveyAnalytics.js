import projectData from '../config/projectData.js';

/** Utilitaires partagés sur la structure de l'enquête (config -> logique & agrégation Back-Office). */

export const allQuestions = () => projectData.survey.steps.flatMap((s) => s.questions);

export const normalizeOptions = (opts = []) =>
  opts.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

export function resolveOptions(q, sectorId) {
  return normalizeOptions(q.optionsBySector?.[sectorId] ?? q.options ?? []);
}

export function isVisible(q, answers, sectorId) {
  if (q.sectors && !q.sectors.includes(sectorId)) return false;
  const c = q.showIf;
  if (!c) return true;
  const v = answers[c.id];
  if (c.notEmpty) return !isEmpty(v);
  if (c.equals !== undefined) return v === c.equals;
  if (c.in) return c.in.includes(v);
  return true;
}

export function isEmpty(v) {
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'boolean') return !v;
  if (v && typeof v === 'object') return Object.keys(v).length === 0;
  return v === undefined || v === null || String(v).trim() === '';
}

export function labelForValue(q, value, sectorId) {
  const opts = resolveOptions(q, sectorId);
  const find = (v) => opts.find((o) => o.value === v)?.label ?? v;
  if (q?.type === 'ranking' && value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value)
      .filter(([, r]) => Number.isFinite(Number(r)))
      .sort((a, b) => Number(a[1]) - Number(b[1]))
      .map(([k, r]) => `#${r} ${find(k)}`);
  }
  if (Array.isArray(value)) return value.map(find);
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return opts.length ? find(value) : value;
}

/** Détermine si une réponse a exprimé ses 4 seuils Van Westendorp en '%' ou en 'eur'. */
export function detectResponseVwUnit(response) {
  const explicit = response?.answers?.vwPriceMode;
  if (explicit === 'eur' || explicit === 'percent') return explicit;
  const maxThreshold = Number(response?.answers?.vwTooExpensive);
  return Number.isFinite(maxThreshold) && maxThreshold > 100 ? 'eur' : 'percent';
}

/** Retourne le prix de référence machine/essieu (€ HT) associé à une réponse pour la conversion croisée % <-> € HT. */
export function resolveReferenceAssetPrice(response) {
  const custom = Number(response?.answers?.referenceAssetPriceEur);
  if (Number.isFinite(custom) && custom > 0) return custom;
  const defaults = projectData.survey.defaultReferencePriceBySector || {};
  return defaults[response?.sector] || defaults.agri || 85000;
}

/**
 * Lignes Van Westendorp `{ tooCheap, cheap, expensive, tooExpensive }` converties
 * dans l'unité demandée (`'percent'` par défaut, ou `'eur'`).
 */
export function getVwRows(responses, targetUnit = 'percent') {
  const vwQuestions = allQuestions().filter((q) => q.vw);
  return responses.map((r) => {
    const sourceUnit = detectResponseVwUnit(r);
    const refEur = resolveReferenceAssetPrice(r);
    const row = {};
    vwQuestions.forEach((q) => {
      const raw = r.answers?.[q.id];
      const num = raw === '' || raw === undefined || raw === null ? NaN : Number(raw);
      if (!Number.isFinite(num)) {
        row[q.vw] = NaN;
      } else if (sourceUnit === targetUnit) {
        row[q.vw] = num;
      } else if (sourceUnit === 'percent' && targetUnit === 'eur') {
        row[q.vw] = (num / 100) * refEur;
      } else {
        row[q.vw] = (num / refEur) * 100;
      }
    });
    return row;
  });
}

/** Agrège les questions marquées `analytics: true` (y compris matrice de rang 1–5 et champ « Autre »). */
export function aggregateQuestion(q, responses) {
  const answered = responses.filter((r) => !isEmpty(r.answers?.[q.id]));

  if (q.type === 'ranking') {
    const statsByLabel = new Map();
    let validRespondents = 0;

    answered.forEach((r) => {
      const map = r.answers?.[q.id];
      if (!map || typeof map !== 'object' || Array.isArray(map)) return;
      const opts = resolveOptions(q, r.sector);
      let contributed = false;
      Object.entries(map).forEach(([optKey, rankRaw]) => {
        const rank = Number(rankRaw);
        if (!Number.isFinite(rank) || rank < 1 || rank > 5) return;
        contributed = true;
        const label = opts.find((o) => o.value === optKey)?.label ?? optKey;
        const cur = statsByLabel.get(label) || { label, sumRank: 0, count: 0, rank1Count: 0 };
        cur.sumRank += rank;
        cur.count += 1;
        if (rank === 1) cur.rank1Count += 1;
        statsByLabel.set(label, cur);
      });
      if (contributed) validRespondents += 1;
    });

    const maxRank = (q.ranks?.length || 5) + 1;
    const items = [...statsByLabel.values()]
      .map((entry) => {
        const avgRank = entry.sumRank / Math.max(1, entry.count);
        return {
          label: entry.label,
          avgRank,
          count: entry.count,
          rank1Count: entry.rank1Count,
          // Score visuel inversé (rang 1 -> barre maximale 5, rang 5 -> barre 1)
          value: +(maxRank - avgRank).toFixed(2),
        };
      })
      .sort((a, b) => a.avgRank - b.avgRank);

    return { kind: 'ranking', n: validRespondents, items };
  }

  if (q.type === 'other_pain') {
    const prioField = q.priorityFieldId || 'otherPainPriority';
    const items = answered
      .map((r) => ({
        id: r.id,
        sector: r.sector,
        company: r.answers?.company || '',
        text: String(r.answers?.[q.id] || '').trim(),
        priority: Number(r.answers?.[prioField]) || null,
      }))
      .filter((x) => x.text.length > 0)
      .sort((a, b) => (a.priority || 99) - (b.priority || 99));
    return { kind: 'other_pain', n: items.length, items };
  }

  if (q.type === 'single' || q.type === 'multi' || q.type === 'sector') {
    const counts = new Map();
    answered.forEach((r) => {
      const vals = Array.isArray(r.answers[q.id]) ? r.answers[q.id] : [r.answers[q.id]];
      vals.forEach((v) => {
        const label = labelForValue(q, v, r.sector);
        counts.set(label, (counts.get(label) || 0) + 1);
      });
    });
    const items = [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    return { kind: 'frequency', n: answered.length, items };
  }

  if (q.type === 'scale' || q.type === 'number') {
    const nums = answered.map((r) => Number(r.answers[q.id])).filter(Number.isFinite);
    const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : NaN;
    let items = [];
    if (q.type === 'scale') {
      items = [];
      for (let v = q.min; v <= q.max; v += 1) {
        items.push({ label: String(v), value: nums.filter((x) => x === v).length });
      }
    }
    return { kind: 'numeric', n: nums.length, avg, items };
  }

  return { kind: 'none', n: answered.length, items: [] };
}
