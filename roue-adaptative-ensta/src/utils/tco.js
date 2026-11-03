import { evaluate } from './formula.js';

/**
 * Calcule le TCO comparatif (jumelage rigide vs roue ENSTA) à partir de la config d'un secteur.
 * @param {object} sectorCfg  projectData.tco.sectors[id]
 * @param {object} values     valeurs des inputs { [inputId]: number }
 * @param {{horizon:number, discountRatePct:number}} globals
 */
export function computeTco(sectorCfg, values, globals) {
  const horizon = Math.max(1, Math.round(globals.horizon));
  const rate = globals.discountRatePct / 100;
  const scope = { ...values, horizon };

  const calc = (list) =>
    list.map((l) => {
      const baseline = evaluate(l.baseline, scope);
      const ensta = evaluate(l.ensta, scope);
      return { id: l.id, label: l.label, baseline, ensta, saving: baseline - ensta };
    });

  const capex = calc(sectorCfg.capex || []);
  const annual = calc(sectorCfg.annual || []);

  const sum = (arr, k) => arr.reduce((a, x) => a + x[k], 0);
  const capexBaseline = sum(capex, 'baseline');
  const capexEnsta = sum(capex, 'ensta');
  const capexDelta = capexEnsta - capexBaseline;
  const annualBaseline = sum(annual, 'baseline');
  const annualEnsta = sum(annual, 'ensta');
  const annualSaving = annualBaseline - annualEnsta;

  let npv = -capexDelta;
  for (let t = 1; t <= horizon; t += 1) npv += annualSaving / (1 + rate) ** t;

  const paybackMonths = capexDelta <= 0 ? 0 : annualSaving > 0 ? (capexDelta / annualSaving) * 12 : Infinity;
  const totalSaving = annualSaving * horizon - capexDelta;
  const roiPct = capexDelta > 0 ? (totalSaving / capexDelta) * 100 : null;

  const cumulative = { baseline: [], ensta: [] };
  for (let t = 0; t <= horizon; t += 1) {
    cumulative.baseline.push({ x: t, y: capexBaseline + annualBaseline * t });
    cumulative.ensta.push({ x: t, y: capexEnsta + annualEnsta * t });
  }

  return {
    horizon,
    capex,
    annual,
    capexBaseline,
    capexEnsta,
    capexDelta,
    annualBaseline,
    annualEnsta,
    annualSaving,
    annualSavingPct: annualBaseline > 0 ? (annualSaving / annualBaseline) * 100 : 0,
    npv,
    paybackMonths,
    totalSaving,
    roiPct,
    cumulative,
  };
}

