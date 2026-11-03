/**
 * qrCodeSvg.js — Générateur QR Code ISO/IEC 18004 autonome (zéro dépendance externe).
 *
 * Supporte les Versions 1 à 12 en mode Octet (UTF-8), niveau de correction d'erreur L (7 %),
 * Reed-Solomon GF(256) (polynôme 0x11d) et sélection automatique du meilleur masque (0..7).
 * Produit une matrice booléenne + un chemin SVG `<path d="..." />` net et scannable hors-ligne.
 */

// Table des versions 1..12 (niveau ECC L) : [totalCodewords, ecCodewordsPerBlock, numBlocksGroup1, dataPerBlockG1, numBlocksGroup2, dataPerBlockG2]
const VERSION_TABLE_L = [
  null,
  [26, 7, 1, 19, 0, 0],     // V1  (21x21) - max 17 octets
  [44, 10, 1, 34, 0, 0],    // V2  (25x25) - max 32 octets
  [70, 15, 1, 55, 0, 0],    // V3  (29x29) - max 53 octets
  [100, 20, 1, 80, 0, 0],   // V4  (33x33) - max 78 octets
  [134, 26, 1, 108, 0, 0],  // V5  (37x37) - max 106 octets
  [172, 18, 2, 68, 0, 0],   // V6  (41x41) - max 134 octets
  [196, 20, 2, 78, 0, 0],   // V7  (45x45) - max 154 octets
  [242, 24, 2, 97, 0, 0],   // V8  (49x49) - max 192 octets
  [292, 30, 2, 116, 0, 0],  // V9  (53x53) - max 230 octets
  [346, 18, 2, 68, 2, 69],  // V10 (57x57) - max 271 octets
  [404, 20, 4, 81, 0, 0],   // V11 (61x61) - max 321 octets
  [466, 24, 2, 92, 2, 93],  // V12 (65x65) - max 367 octets
];

const ALIGNMENT_CENTERS = [
  null,
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
];

/* ------------------------ Corps de Galois GF(256) ------------------------ */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) GF_EXP[i] = GF_EXP[i - 255];
})();

const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]]);

function rsGeneratorPoly(degree) {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i += 1) {
    const next = new Uint8Array(poly.length + 1);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function rsRemainder(data, ecLen) {
  const gen = rsGeneratorPoly(ecLen);
  const rem = new Uint8Array(ecLen);
  for (let i = 0; i < data.length; i += 1) {
    const factor = data[i] ^ rem[0];
    rem.copyWithin(0, 1);
    rem[ecLen - 1] = 0;
    if (factor !== 0) {
      for (let j = 0; j < ecLen; j += 1) {
        rem[j] ^= gfMul(gen[j + 1], factor);
      }
    }
  }
  return rem;
}

/* --------------------- Encodage des données & blocs RS ------------------- */
function pickVersion(byteLength) {
  for (let v = 1; v < VERSION_TABLE_L.length; v += 1) {
    const [, , g1, d1, g2, d2] = VERSION_TABLE_L[v];
    const totalDataBytes = g1 * d1 + g2 * d2;
    const countBits = v <= 9 ? 8 : 16;
    const capacity = Math.floor((totalDataBytes * 8 - 4 - countBits) / 8);
    if (byteLength <= capacity) return v;
  }
  throw new Error('URL trop longue pour le générateur QR (max ~365 octets).');
}

function buildCodewords(bytes, version) {
  const [, ecLen, g1, d1, g2, d2] = VERSION_TABLE_L[version];
  const totalData = g1 * d1 + g2 * d2;
  const bits = [];
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i -= 1) bits.push((val >>> i) & 1);
  };

  // Mode Byte = 0100
  pushBits(0b0100, 4);
  pushBits(bytes.length, version <= 9 ? 8 : 16);
  for (let i = 0; i < bytes.length; i += 1) pushBits(bytes[i], 8);

  const maxBits = totalData * 8;
  const terminator = Math.min(4, maxBits - bits.length);
  pushBits(0, terminator);
  while (bits.length % 8 !== 0) bits.push(0);

  const dataBytes = new Uint8Array(totalData);
  for (let i = 0; i < bits.length / 8; i += 1) {
    let b = 0;
    for (let j = 0; j < 8; j += 1) b = (b << 1) | bits[i * 8 + j];
    dataBytes[i] = b;
  }
  const pads = [0xec, 0x11];
  for (let i = bits.length / 8, p = 0; i < totalData; i += 1, p ^= 1) {
    dataBytes[i] = pads[p];
  }

  // Découpage en blocs et calcul Reed-Solomon
  const dataBlocks = [];
  const ecBlocks = [];
  let offset = 0;
  for (let b = 0; b < g1; b += 1) {
    const slice = dataBytes.subarray(offset, offset + d1);
    dataBlocks.push(slice);
    ecBlocks.push(rsRemainder(slice, ecLen));
    offset += d1;
  }
  for (let b = 0; b < g2; b += 1) {
    const slice = dataBytes.subarray(offset, offset + d2);
    dataBlocks.push(slice);
    ecBlocks.push(rsRemainder(slice, ecLen));
    offset += d2;
  }

  // Entrelacement des blocs
  const out = [];
  const maxDataLen = Math.max(d1, d2);
  for (let i = 0; i < maxDataLen; i += 1) {
    for (let b = 0; b < dataBlocks.length; b += 1) {
      if (i < dataBlocks[b].length) out.push(dataBlocks[b][i]);
    }
  }
  for (let i = 0; i < ecLen; i += 1) {
    for (let b = 0; b < ecBlocks.length; b += 1) {
      out.push(ecBlocks[b][i]);
    }
  }
  return out;
}

/* --------------------- Construction de la matrice QR --------------------- */
function bchFormat(ecLevelBits, mask) {
  const data = (ecLevelBits << 3) | mask;
  let rem = data << 10;
  for (let i = 14; i >= 10; i -= 1) {
    if ((rem >>> i) & 1) rem ^= 0x537 << (i - 10);
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function bchVersion(version) {
  let rem = version << 12;
  for (let i = 17; i >= 12; i -= 1) {
    if ((rem >>> i) & 1) rem ^= 0x1f25 << (i - 12);
  }
  return (version << 12) | rem;
}

const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function penaltyScore(modules, size) {
  let score = 0;
  // Règle 1 : séquences >= 5 modules identiques
  for (let r = 0; r < size; r += 1) {
    let runH = 1;
    let runV = 1;
    for (let c = 1; c < size; c += 1) {
      if (modules[r][c] === modules[r][c - 1]) {
        runH += 1;
        if (runH === 5) score += 3;
        else if (runH > 5) score += 1;
      } else runH = 1;

      if (modules[c][r] === modules[c - 1][r]) {
        runV += 1;
        if (runV === 5) score += 3;
        else if (runV > 5) score += 1;
      } else runV = 1;
    }
  }
  // Règle 2 : blocs 2x2
  for (let r = 0; r < size - 1; r += 1) {
    for (let c = 0; c < size - 1; c += 1) {
      const v = modules[r][c];
      if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) {
        score += 3;
      }
    }
  }
  return score;
}

export function encodeQrMatrix(text) {
  const bytes = new TextEncoder().encode(String(text || ''));
  const version = pickVersion(bytes.length);
  const size = version * 4 + 17;
  const codewords = buildCodewords(bytes, version);

  const base = Array.from({ length: size }, () => new Uint8Array(size));
  const isFunc = Array.from({ length: size }, () => new Uint8Array(size));

  const setFunc = (r, c, dark) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    base[r][c] = dark ? 1 : 0;
    isFunc[r][c] = 1;
  };

  // Finder patterns (3 coins) + séparateurs blancs
  const drawFinder = (r0, c0) => {
    for (let dr = -1; dr <= 7; dr += 1) {
      for (let dc = -1; dc <= 7; dc += 1) {
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunc(r0 + dr, c0 + dc, inOuter && (onBorder || inCore));
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i += 1) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const centers = ALIGNMENT_CENTERS[version];
  for (let i = 0; i < centers.length; i += 1) {
    for (let j = 0; j < centers.length; j += 1) {
      const cr = centers[i];
      const cc = centers[j];
      const clashesFinder =
        (cr <= 8 && cc <= 8) || (cr <= 8 && cc >= size - 9) || (cr >= size - 9 && cc <= 8);
      if (clashesFinder) continue;
      for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setFunc(cr + dr, cc + dc, dark);
        }
      }
    }
  }

  // Module sombre fixe + réservation des zones Format Info
  setFunc(size - 8, 8, true);
  for (let i = 0; i <= 8; i += 1) {
    if (!isFunc[8][i]) setFunc(8, i, false);
    if (!isFunc[i][8]) setFunc(i, 8, false);
  }
  for (let i = 0; i < 8; i += 1) {
    if (!isFunc[8][size - 1 - i]) setFunc(8, size - 1 - i, false);
    if (i < 7 && !isFunc[size - 1 - i][8]) setFunc(size - 1 - i, 8, false);
  }

  // Version info (V7+)
  if (version >= 7) {
    const vBits = bchVersion(version);
    for (let i = 0; i < 18; i += 1) {
      const dark = ((vBits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunc(b, a, dark);
      setFunc(a, b, dark);
    }
  }

  // Placement en zig-zag des bits de données + RS
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // saute la colonne timing x=6
    for (let step = 0; step < size; step += 1) {
      const r = upward ? size - 1 - step : step;
      for (let dx = 0; dx < 2; dx += 1) {
        const c = right - dx;
        if (!isFunc[r][c]) {
          let dark = false;
          if (bitIdx < totalBits) {
            const byte = codewords[bitIdx >>> 3];
            dark = ((byte >>> (7 - (bitIdx & 7))) & 1) === 1;
            bitIdx += 1;
          }
          base[r][c] = dark ? 1 : 0;
        }
      }
    }
    upward = !upward;
  }

  const writeFormatBits = (grid, mask) => {
    // Niveau ECC L = 01 en encodage format ISO/IEC 18004
    const fmt = bchFormat(0b01, mask);
    for (let i = 0; i <= 5; i += 1) grid[8][i] = (fmt >>> (14 - i)) & 1;
    grid[8][7] = (fmt >>> 8) & 1;
    grid[8][8] = (fmt >>> 7) & 1;
    grid[7][8] = (fmt >>> 6) & 1;
    for (let i = 9; i < 15; i += 1) grid[14 - i][8] = (fmt >>> (14 - i)) & 1;

    for (let i = 0; i < 7; i += 1) grid[size - 1 - i][8] = (fmt >>> (14 - i)) & 1;
    for (let i = 7; i < 15; i += 1) grid[8][size - 15 + i] = (fmt >>> (14 - i)) & 1;
  };

  // Sélection du meilleur masque (0..7)
  let bestGrid = null;
  let bestScore = Infinity;
  for (let m = 0; m < 8; m += 1) {
    const grid = base.map((row) => new Uint8Array(row));
    const fn = MASKS[m];
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (!isFunc[r][c] && fn(r, c)) grid[r][c] ^= 1;
      }
    }
    writeFormatBits(grid, m);
    const sc = penaltyScore(grid, size);
    if (sc < bestScore) {
      bestScore = sc;
      bestGrid = grid;
    }
  }

  return { version, size, modules: bestGrid };
}

/** Construit un chemin SVG compact (`M x y h 1 v 1 h -1 z`) avec zone calme (margin). */
export function buildQrSvgPath(text, margin = 3) {
  const { size, modules, version } = encodeQrMatrix(text);
  const parts = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (modules[r][c]) {
        parts.push(`M${c + margin} ${r + margin}h1v1h-1z`);
      }
    }
  }
  return {
    version,
    size,
    viewBoxSize: size + margin * 2,
    pathD: parts.join(''),
  };
}

