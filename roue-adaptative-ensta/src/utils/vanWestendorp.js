/**
 * Analyse de sensibilité au prix de Van Westendorp (Price Sensitivity Meter).
 * Compatible aussi bien avec le mode en % de surcoût (ex. 1,5 % à 15 %)
 * qu'avec le mode en montant brut (€ HT par essieu équipé).
 *
 * Courbes (part des répondants, 0..1) :
 *  - tooCheap(p)      = part dont le seuil « trop peu cher » >= p       (décroissante)
 *  - cheap(p)         = part dont le seuil « très bonne affaire » >= p  (décroissante)
 *  - expensive(p)     = part dont le seuil « élevé » <= p               (croissante)
 *  - tooExpensive(p)  = part dont le seuil « trop cher » <= p           (croissante)
 *  - notCheap = 1 - cheap ; notExpensive = 1 - expensive
 *
 * Points clés :
 *  - PMC (seuil plancher)    : tooCheap x notCheap
 *  - PME (seuil plafond)     : tooExpensive x notExpensive
 *  - OPP (seuil optimal)     : tooCheap x tooExpensive
 *  - IPP (indifférence)      : cheap x expensive
 */
const KEYS = ['tooCheap', 'cheap', 'expensive', 'tooExpensive'];

export function isValidRow(r) {
  if (!r) return false;
  const v = KEYS.map((k) => Number(r[k]));
  if (!v.every((x) => Number.isFinite(x) && x > 0)) return false;
  return v[0] <= v[1] && v[1] <= v[2] && v[2] <= v[3];
}

function crossing(xs, a, b) {
  for (let i = 0; i < xs.length - 1; i += 1) {
    const d0 = a[i] - b[i];
    const d1 = a[i + 1] - b[i + 1];
    if (d0 === 0) return { x: xs[i], y: a[i] };
    if (d0 * d1 < 0) {
      const t = d0 / (d0 - d1);
      return { x: xs[i] + t * (xs[i + 1] - xs[i]), y: a[i] + t * (a[i + 1] - a[i]) };
    }
  }
  return null;
}

export function computeVanWestendorp(rows, steps = 240) {
  const valid = rows.filter(isValidRow);
  const invalid = rows.length - valid.length;
  if (valid.length < 3) return { n: valid.length, invalid, curves: null, points: null };

  const all = valid.flatMap((r) => KEYS.map((k) => Number(r[k])));
  const minVal = Math.min(...all);
  const maxVal = Math.max(...all);
  const lo = Math.max(0, minVal * 0.85);
  const hi = maxVal > lo ? maxVal * 1.08 : lo + 1;
  const xs = Array.from({ length: steps + 1 }, (_, i) => lo + ((hi - lo) * i) / steps);
  const n = valid.length;
  const share = (fn) => xs.map((p) => valid.filter((r) => fn(r, p)).length / n);

  const tooCheap = share((r, p) => r.tooCheap >= p);
  const cheap = share((r, p) => r.cheap >= p);
  const expensive = share((r, p) => r.expensive <= p);
  const tooExpensive = share((r, p) => r.tooExpensive <= p);
  const notCheap = cheap.map((v) => 1 - v);
  const notExpensive = expensive.map((v) => 1 - v);

  const to = (ys) => xs.map((x, i) => ({ x, y: ys[i] * 100 }));
  return {
    n,
    invalid,
    curves: {
      tooCheap: to(tooCheap),
      cheap: to(cheap),
      expensive: to(expensive),
      tooExpensive: to(tooExpensive),
      notCheap: to(notCheap),
      notExpensive: to(notExpensive),
    },
    points: {
      pmc: crossing(xs, tooCheap, notCheap),
      pme: crossing(xs, tooExpensive, notExpensive),
      opp: crossing(xs, tooCheap, tooExpensive),
      ipp: crossing(xs, cheap, expensive),
    },
  };
}
