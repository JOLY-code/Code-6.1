/**
 * Générateur PDF 1.4 autonome (zéro dépendance externe) encodé en WinAnsi (Windows-1252)
 * permettant de télécharger immédiatement une synthèse exécutive A4 propre pour chaque
 * document de la Data Room B2B lorsqu'aucun fichier PDF externe n'est encore lié.
 */

const WIN1252_EXTRAS = {
  0x20ac: 0x80, // €
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85, // …
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c, // Œ
  0x017d: 0x8e,
  0x2018: 0x91, // ‘
  0x2019: 0x92, // ’
  0x201c: 0x93, // “
  0x201d: 0x94, // ”
  0x2022: 0x95, // •
  0x2013: 0x96, // –
  0x2014: 0x97, // —
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c, // œ
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function normalizeText(input = '') {
  return String(input)
    .replace(/\u2212/g, '-') // −
    .replace(/α/g, 'alpha')
    .replace(/Δ/g, 'Delta ')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/→/g, '->')
    .replace(/\u00a0/g, ' ');
}

function pdfString(raw) {
  const str = normalizeText(raw);
  let out = '(';
  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i);
    if (code === 0x28 || code === 0x29 || code === 0x5c) {
      out += `\\${String.fromCharCode(code)}`;
    } else if (code >= 0x20 && code <= 0x7e) {
      out += String.fromCharCode(code);
    } else if (code >= 0xa0 && code <= 0xff) {
      out += `\\${code.toString(8).padStart(3, '0')}`;
    } else if (WIN1252_EXTRAS[code]) {
      out += `\\${WIN1252_EXTRAS[code].toString(8).padStart(3, '0')}`;
    } else {
      out += ' ';
    }
  }
  out += ')';
  return out;
}

function wrapLines(text, maxChars = 84) {
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach((w) => {
    const next = current ? `${current} ${w}` : w;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = w;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

export function buildExecutivePdfBlob(doc, meta, patents = []) {
  const W = 595; // A4 points
  const H = 842;
  const cmds = [];

  // Bandeau supérieur ENSTA Bretagne (Slate-950 + liseré Ambre)
  cmds.push('0.04 0.06 0.11 rg');
  cmds.push(`0 ${H - 108} ${W} 108 re f`);
  cmds.push('0.96 0.62 0.04 rg');
  cmds.push(`0 ${H - 112} ${W} 4 re f`);

  // Sur-titre et titre dans le bandeau
  cmds.push('BT /F2 9 Tf 0.96 0.62 0.04 rg');
  cmds.push(`44 ${H - 36} Td ${pdfString(`${meta.school}  |  ${meta.course}  |  DATA ROOM B2B`)} Tj ET`);

  const titleLines = wrapLines(doc.title, 54);
  let yHeader = H - 60;
  titleLines.slice(0, 2).forEach((line) => {
    cmds.push('BT /F2 16 Tf 1 1 1 rg');
    cmds.push(`44 ${yHeader} Td ${pdfString(line)} Tj ET`);
    yHeader -= 20;
  });

  cmds.push('BT /F1 9.5 Tf 0.78 0.82 0.88 rg');
  cmds.push(`44 ${H - 96} Td ${pdfString(`${doc.badge}  •  ${doc.pages}  •  TRL 6 (Tracteur 155 cv)`)} Tj ET`);

  let y = H - 142;

  // Encadré Brevets Européens ENSTA Bretagne
  cmds.push('0.95 0.96 0.98 rg');
  cmds.push(`44 ${y - 44} ${W - 88} 54 re f`);
  cmds.push('0.82 0.85 0.90 RG 1 w');
  cmds.push(`44 ${y - 44} ${W - 88} 54 re S`);
  cmds.push('BT /F2 9.5 Tf 0.08 0.11 0.18 rg');
  cmds.push(`56 ${y - 8} Td ${pdfString('PROPRIETE INTELLECTUELLE EXCLUSIVE ENSTA BRETAGNE')} Tj ET`);
  patents.slice(0, 2).forEach((p, idx) => {
    cmds.push('BT /F1 8.8 Tf 0.20 0.25 0.33 rg');
    cmds.push(`56 ${y - 22 - idx * 13} Td ${pdfString(`${p.id} (${p.status}) : ${p.title}`)} Tj ET`);
  });

  y -= 74;

  // Résumé exécutif
  cmds.push('BT /F2 11.5 Tf 0.06 0.09 0.16 rg');
  cmds.push(`44 ${y} Td ${pdfString('Resume executif')} Tj ET`);
  y -= 16;
  wrapLines(doc.summary, 86).forEach((line) => {
    cmds.push('BT /F1 10 Tf 0.18 0.22 0.30 rg');
    cmds.push(`44 ${y} Td ${pdfString(line)} Tj ET`);
    y -= 14;
  });

  y -= 12;

  // Points clés à retenir
  if (Array.isArray(doc.highlights) && doc.highlights.length) {
    cmds.push('BT /F2 11.5 Tf 0.06 0.09 0.16 rg');
    cmds.push(`44 ${y} Td ${pdfString('Points cles valides')} Tj ET`);
    y -= 16;
    doc.highlights.forEach((h) => {
      wrapLines(`• ${h}`, 84).forEach((line, idx) => {
        cmds.push('BT /F1 9.8 Tf 0.15 0.20 0.28 rg');
        cmds.push(`${idx === 0 ? 48 : 58} ${y} Td ${pdfString(line)} Tj ET`);
        y -= 13.5;
      });
      y -= 3;
    });
    y -= 10;
  }

  // Sections détaillées
  (doc.sections || []).forEach((sec) => {
    if (y < 120) return;
    cmds.push('0.96 0.62 0.04 rg');
    cmds.push(`44 ${y - 1} 3 12 re f`);
    cmds.push('BT /F2 11.5 Tf 0.06 0.09 0.16 rg');
    cmds.push(`54 ${y} Td ${pdfString(sec.heading)} Tj ET`);
    y -= 16;
    wrapLines(sec.body, 86).forEach((line) => {
      if (y < 85) return;
      cmds.push('BT /F1 9.8 Tf 0.18 0.22 0.30 rg');
      cmds.push(`44 ${y} Td ${pdfString(line)} Tj ET`);
      y -= 14;
    });
    y -= 14;
  });

  // Pied de page
  cmds.push('0.85 0.87 0.91 RG 0.8 w');
  cmds.push(`44 54 ${W - 88} 0 re S`);
  cmds.push('BT /F1 8.5 Tf 0.38 0.43 0.52 rg');
  cmds.push(`44 38 Td ${pdfString(`${meta.shortName} — ${meta.course} (${meta.year}) — Document de synthese B2B`)} Tj ET`);

  const stream = cmds.join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`,
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += obj;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'document-ensta.pdf';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

