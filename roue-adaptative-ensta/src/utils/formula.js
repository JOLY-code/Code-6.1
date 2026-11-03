/**
 * Évaluateur d'expressions arithmétiques sécurisé pour les formules de projectData.js
 * (TCO, cinématique). Seuls les nombres, opérateurs arithmétiques/comparaison, parenthèses,
 * les variables fournies et une liste blanche de fonctions mathématiques sont acceptés.
 */
const MATH_FUNCS = {
  min: Math.min,
  max: Math.max,
  abs: Math.abs,
  pow: Math.pow,
  sqrt: Math.sqrt,
  log: Math.log,
  exp: Math.exp,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  PI: Math.PI,
};

const ALLOWED_CHARS = /^[0-9A-Za-z_+\-*/().,%\s<>=?:&|!]*$/;
const cache = new Map();

function assertSafe(expr, names) {
  if (typeof expr !== 'string' || !ALLOWED_CHARS.test(expr)) {
    throw new Error(`Expression non autorisée : "${expr}"`);
  }
  const withoutNumbers = expr.replace(/\d+\.?\d*(e[+-]?\d+)?|\.\d+/gi, ' ');
  const identifiers = withoutNumbers.match(/[A-Za-z_]\w*/g) || [];
  const known = new Set([...names, ...Object.keys(MATH_FUNCS)]);
  for (const id of identifiers) {
    if (!known.has(id)) throw new Error(`Variable inconnue "${id}" dans "${expr}"`);
  }
}

export function evaluate(expr, scope = {}) {
  const fullScope = { ...MATH_FUNCS, ...scope };
  const names = Object.keys(fullScope);
  const key = `${names.join(',')}::${expr}`;
  try {
    let fn = cache.get(key);
    if (!fn) {
      assertSafe(expr, names);
      // eslint-disable-next-line no-new-func
      fn = new Function(...names, `"use strict"; return (${expr});`);
      cache.set(key, fn);
    }
    const result = fn(...names.map((n) => fullScope[n]));
    return Number.isFinite(result) ? result : 0;
  } catch (err) {
    console.warn('[formula]', err.message);
    return 0;
  }
}
