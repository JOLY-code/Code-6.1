import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import projectData from '../src/config/projectData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');

const DATA_DIR = process.env.R2A_DATA_DIR
  ? path.resolve(process.env.R2A_DATA_DIR)
  : path.join(APP_ROOT, 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'ensta-r2a-database.json');
const APPEND_LOG_FILE = path.join(DATA_DIR, 'responses-append-log.jsonl');
const TUNNEL_URL_FILE = path.join(DATA_DIR, 'active-tunnel-url.txt');

const SEED_CREATED_AT = '2026-10-30T08:00:00.000Z';
const MAX_BODY_BYTES = 512 * 1024;
const LOCKOUT_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

/* Sessions en mémoire du serveur Node */
const adminTokens = new Map(); // token -> expiresAt
const reviewTokens = new Map(); // token -> { role, expiresAt }
const failedAttemptsByIp = new Map(); // key -> { count, lockedUntil }

const slugify = (s = '') =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function getAdminPasscode() {
  return (
    process.env.R2A_ADMIN_PASSCODE ||
    process.env.VITE_ADMIN_PASSCODE ||
    projectData.admin?.accessCode ||
    'ENSTA2026'
  );
}

function getProfessorCode() {
  return (
    process.env.R2A_PROFESSOR_CODE ||
    process.env.VITE_PROFESSOR_CODE ||
    projectData.reviewValidation?.professorCode ||
    'R2A-PROF-2026'
  );
}

function getTeamCode() {
  return (
    process.env.R2A_TEAM_CODE ||
    process.env.VITE_TEAM_CODE ||
    projectData.reviewValidation?.teamCode ||
    'ENSTA-R2A-2026'
  );
}

function extractAdminToken(req) {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  return req.headers['x-admin-token'] || req.headers['x-admin-key'] || bearerToken || null;
}

function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

function buildSeedContacts() {
  return (projectData.crm.seedContacts || []).map((c) => ({
    id: c.id || `seed_${slugify(c.company)}`,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
    ...c,
  }));
}

function buildInitialValidations() {
  const sections = {};
  (projectData.reviewValidation?.sections || []).forEach((s) => {
    sections[s.id] = {
      status: 'pending',
      updatedBy: '',
      updatedAt: null,
    };
  });
  return { sections, comments: [] };
}

function readAppendLogEntries() {
  ensureDataDirs();
  if (!fs.existsSync(APPEND_LOG_FILE)) return { entries: [], lineCount: 0 };
  try {
    const raw = fs.readFileSync(APPEND_LOG_FILE, 'utf8');
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const entries = [];
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed && parsed.id) entries.push(parsed);
      } catch {
        /* ignore malformed line */
      }
    }
    return { entries, lineCount: lines.length };
  } catch {
    return { entries: [], lineCount: 0 };
  }
}

function mergeRecordsById(listA = [], listB = [], deletedIds = []) {
  const deleted = new Set(deletedIds);
  const map = new Map();
  const put = (item) => {
    if (!item || !item.id || deleted.has(item.id)) return;
    const prev = map.get(item.id);
    if (!prev) {
      map.set(item.id, item);
      return;
    }
    const tNew = String(item.updatedAt || item.createdAt || '');
    const tOld = String(prev.updatedAt || prev.createdAt || '');
    if (tNew >= tOld) map.set(item.id, { ...prev, ...item });
  };
  listA.forEach(put);
  listB.forEach(put);
  return [...map.values()];
}

function deduplicateContactsWithSeeds(contacts = [], deletedContactIds = []) {
  const deleted = new Set(deletedContactIds);
  const seeds = buildSeedContacts();
  const byId = new Map();
  const seenCompanies = new Set();

  contacts.forEach((c) => {
    if (!c || !c.id || deleted.has(c.id)) return;
    byId.set(c.id, c);
    if (c.company) seenCompanies.add(slugify(c.company));
  });

  seeds.forEach((seed) => {
    const compKey = slugify(seed.company);
    if (!byId.has(seed.id) && !seenCompanies.has(compKey) && !deleted.has(seed.id)) {
      byId.set(seed.id, seed);
      seenCompanies.add(compKey);
    }
  });

  return [...byId.values()];
}

function readDatabase() {
  ensureDataDirs();
  let db = null;
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch {
      db = null;
    }
  }

  const baseValidations = buildInitialValidations();
  const deletedResponseIds = Array.isArray(db?.deletedResponseIds) ? db.deletedResponseIds : [];
  const deletedContactIds = Array.isArray(db?.deletedContactIds) ? db.deletedContactIds : [];
  const storedResponses = Array.isArray(db?.responses) ? db.responses : [];
  const storedContacts = Array.isArray(db?.contacts) ? db.contacts : buildSeedContacts();

  // Réconciliation automatique avec le journal append-only .jsonl (aucune réponse ne peut jamais être perdue)
  const { entries: logEntries, lineCount } = readAppendLogEntries();
  const reconciledResponses = mergeRecordsById(storedResponses, logEntries, deletedResponseIds).sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
  );
  const reconciledContacts = deduplicateContactsWithSeeds(storedContacts, deletedContactIds);

  const mergedSections = {
    ...baseValidations.sections,
    ...(db?.validations?.sections || {}),
  };
  const mergedComments = Array.isArray(db?.validations?.comments) ? db.validations.comments : [];

  return {
    schemaVersion: 3,
    updatedAt: db?.updatedAt || new Date().toISOString(),
    publicCloudUrl: typeof db?.publicCloudUrl === 'string' ? db.publicCloudUrl : '',
    responses: reconciledResponses,
    contacts: reconciledContacts,
    deletedResponseIds,
    deletedContactIds,
    validations: {
      sections: mergedSections,
      comments: mergedComments,
    },
    _appendLogLines: lineCount,
  };
}

function writeDatabaseAtomic(db, { backupTag = '' } = {}) {
  ensureDataDirs();
  const cleanDb = {
    app: projectData.meta.appName,
    schemaVersion: 3,
    updatedAt: new Date().toISOString(),
    publicCloudUrl: db.publicCloudUrl || '',
    responses: db.responses || [],
    contacts: db.contacts || [],
    deletedResponseIds: (db.deletedResponseIds || []).slice(-1000),
    deletedContactIds: (db.deletedContactIds || []).slice(-1000),
    validations: db.validations || buildInitialValidations(),
  };

  const serialized = JSON.stringify(cleanDb, null, 2);
  const tmpFile = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpFile, serialized, 'utf8');
  fs.renameSync(tmpFile, DB_FILE);

  if (backupTag) {
    try {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const safeTag = String(backupTag).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
      const backupFile = path.join(BACKUPS_DIR, `backup-${ts}-${safeTag}.json`);
      fs.writeFileSync(backupFile, serialized, 'utf8');

      // Garde les 200 sauvegardes horodatées les plus récentes
      const files = fs
        .readdirSync(BACKUPS_DIR)
        .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
        .sort();
      if (files.length > 200) {
        files.slice(0, files.length - 200).forEach((old) => {
          try {
            fs.unlinkSync(path.join(BACKUPS_DIR, old));
          } catch {
            /* ignore */
          }
        });
      }
    } catch {
      /* ignore backup non-fatal error */
    }
  }

  return cleanDb;
}

function upsertLeadInContacts(contacts, response) {
  const a = response?.answers || {};
  const f = projectData.survey.fieldMap;
  const email = String(a[f.email] || '').trim();
  const company = String(a[f.company] || '').trim();
  if (!email && !company) return contacts;

  const now = new Date().toISOString();
  const idx = contacts.findIndex(
    (c) =>
      (email && c.email && c.email.toLowerCase() === email.toLowerCase()) ||
      (!email && company && slugify(c.company) === slugify(company) && c.source === 'Enquête B2B'),
  );

  const isPilot = a[f.pilot] === f.pilotYesValue;
  const acqLine = f.acquisition && a[f.acquisition] ? `Modèle préféré : ${a[f.acquisition]}` : '';
  const partLine = f.partnership && a[f.partnership] ? `Collaboration : ${a[f.partnership]}` : '';
  const noteParts = [acqLine, partLine, a[f.comment]].filter(Boolean).join('\n');

  if (idx >= 0) {
    const prev = contacts[idx];
    const updated = {
      ...prev,
      company: company || prev.company,
      name: a[f.name] || prev.name || '',
      email: email || prev.email || '',
      phone: a[f.phone] || prev.phone || '',
      sector: response.sector || prev.sector,
      updatedAt: now,
      notes: [prev.notes, noteParts].filter(Boolean).join('\n').slice(0, 2500),
      responseId: response.id,
    };
    return contacts.map((c, i) => (i === idx ? updated : c));
  }

  const newLead = {
    id: `ct_lead_${response.id}`,
    company: company || 'Entreprise répondante',
    name: a[f.name] || '',
    role: a[f.role] || '',
    sector: response.sector || 'agri',
    status: isPilot ? 'contacted' : 'new',
    email,
    phone: a[f.phone] || '',
    source: 'Enquête B2B',
    nextAction: isPilot ? 'Candidat essai pilote / réunion technique' : 'Transmettre dossier technique R2A',
    notes: noteParts,
    responseId: response.id,
    createdAt: now,
    updatedAt: now,
  };
  return [newLead, ...contacts];
}

function getLanIps() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const [name, list] of Object.entries(nets)) {
    if (!Array.isArray(list)) continue;
    // Ignore les interfaces virtuelles courantes (WSL, Docker, Hyper-V, VirtualBox)
    if (/vethernet|wsl|docker|vbox|vmware|loopback/i.test(name)) continue;
    for (const net of list) {
      const family = typeof net.family === 'string' ? net.family : net.family === 4 ? 'IPv4' : '';
      if (family === 'IPv4' && !net.internal && net.address) {
        ips.push(net.address);
      }
    }
  }
  // Priorise les adresses Wi-Fi / LAN locales 192.168.x.x et 10.x.x.x
  ips.sort((a, b) => {
    const score = (ip) => (ip.startsWith('192.168.') ? 0 : ip.startsWith('10.') ? 1 : 2);
    return score(a) - score(b);
  });
  return [...new Set(ips)];
}

function readDetectedTunnelUrl(dbPublicUrl = '') {
  if (fs.existsSync(TUNNEL_URL_FILE)) {
    try {
      const raw = fs.readFileSync(TUNNEL_URL_FILE, 'utf8');
      const match = raw.match(/https:\/\/[a-zA-Z0-9.-]+\.(?:trycloudflare\.com|loca\.lt|ngrok-free\.app|ngrok\.io)/i);
      if (match) return match[0].replace(/\/+$/, '');
    } catch {
      /* ignore */
    }
  }
  return dbPublicUrl ? dbPublicUrl.replace(/\/+$/, '') : '';
}

function countBackups() {
  ensureDataDirs();
  try {
    return fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Payload trop volumineux'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('JSON invalide'));
      }
    });
    req.on('error', reject);
  });
}

function getClientKey(req, scope) {
  const ip =
    String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  return `${scope}:${ip}`;
}

function checkRateLimit(key) {
  const entry = failedAttemptsByIp.get(key);
  if (!entry) return { locked: false, remainingSec: 0 };
  const now = Date.now();
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return { locked: true, remainingSec: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    failedAttemptsByIp.delete(key);
  }
  return { locked: false, remainingSec: 0 };
}

function recordFailedAttempt(key) {
  const prev = failedAttemptsByIp.get(key) || { count: 0, lockedUntil: 0 };
  const count = prev.count + 1;
  if (count >= MAX_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_MS;
    failedAttemptsByIp.set(key, { count: 0, lockedUntil });
    return { locked: true, remainingSec: Math.ceil(LOCKOUT_MS / 1000) };
  }
  failedAttemptsByIp.set(key, { count, lockedUntil: 0 });
  return { locked: false, remainingAttempts: MAX_ATTEMPTS - count };
}

function clearFailedAttempts(key) {
  failedAttemptsByIp.delete(key);
}

function isValidAdminToken(token) {
  if (!token) return false;
  const exp = adminTokens.get(token);
  if (!exp) return false;
  if (Date.now() > exp) {
    adminTokens.delete(token);
    return false;
  }
  return true;
}

function getReviewerRoleFromToken(reviewToken, adminToken) {
  if (isValidAdminToken(adminToken)) return 'admin';
  if (!reviewToken) return null;
  const session = reviewTokens.get(reviewToken);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    reviewTokens.delete(reviewToken);
    return null;
  }
  return session.role;
}

function generateReceiptId(id = '') {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hash = crypto
    .createHash('sha256')
    .update(`${id}:${Date.now()}:${Math.random()}`)
    .digest('hex')
    .slice(0, 6)
    .toUpperCase();
  return `R2A-${day}-${hash}`;
}

function attachMiddleware(server, defaultPort = 5173) {
  ensureDataDirs();

  server.middlewares.use(async (req, res, next) => {
    const rawUrl = req.url || '/';
    const pathname = rawUrl.split('?')[0];

    // 1. CYBERSÉCURITÉ : Interdiction absolue d'accéder aux fichiers de données bruts par HTTP
    if (
      pathname === '/data' ||
      pathname.startsWith('/data/') ||
      pathname === '/server' ||
      pathname.startsWith('/server/') ||
      pathname.endsWith('.jsonl')
    ) {
      return sendJson(res, 403, {
        ok: false,
        error: 'Accès interdit — Base de données protégée côté serveur.',
      });
    }

    if (!pathname.startsWith('/api/')) {
      return next();
    }

    try {
      /* ----------- ROUTE PUBLIQUE WRITE-ONLY : POST /api/survey-submit ----------- */
      if (pathname === '/api/survey-submit' && req.method === 'POST') {
        const body = await readJsonBody(req);
        if (!body || typeof body.answers !== 'object' || body.answers === null) {
          return sendJson(res, 400, { ok: false, error: 'Réponses manquantes ou invalides.' });
        }

        const savedAt = new Date().toISOString();
        const id =
          typeof body.id === 'string' && body.id.trim()
            ? body.id.trim().slice(0, 80)
            : `resp_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
        const receiptId =
          typeof body.receiptId === 'string' && body.receiptId.startsWith('R2A-')
            ? body.receiptId
            : generateReceiptId(id);

        const record = {
          id,
          receiptId,
          sector: ['agri', 'btp', 'robotique'].includes(body.sector) ? body.sector : 'agri',
          answers: body.answers,
          durationSec: Number.isFinite(Number(body.durationSec)) ? Number(body.durationSec) : 0,
          createdAt: body.createdAt || savedAt,
          updatedAt: savedAt,
          savedAt,
        };

        // SAUVEGARDE 1A : Écriture atomique en fin de journal inaltérable (.jsonl append-only)
        ensureDataDirs();
        fs.appendFileSync(APPEND_LOG_FILE, `${JSON.stringify(record)}\n`, 'utf8');

        // SAUVEGARDE 1B : Fusion par ID dans ./data/ensta-r2a-database.json + création fiche CRM + backup horodaté
        const db = readDatabase();
        const nextDeletedResp = db.deletedResponseIds.filter((delId) => delId !== record.id);
        const mergedResponses = mergeRecordsById(db.responses, [record], nextDeletedResp).sort((a, b) =>
          String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
        );
        const updatedContacts = upsertLeadInContacts(db.contacts, record);

        writeDatabaseAtomic(
          {
            ...db,
            responses: mergedResponses,
            contacts: updatedContacts,
            deletedResponseIds: nextDeletedResp,
          },
          { backupTag: receiptId },
        );

        // WRITE-ONLY : ne renvoie JAMAIS les réponses des autres clients ni le CRM
        return sendJson(res, 200, {
          ok: true,
          id: record.id,
          receiptId,
          savedAt,
        });
      }

      /* ----------- ROUTE STATUT RÉSEAU (ZÉRO DONNÉE CLIENT) : GET /api/server-info ----------- */
      if (pathname === '/api/server-info' && req.method === 'GET') {
        const db = readDatabase();
        const port = server.config?.server?.port || defaultPort;
        return sendJson(res, 200, {
          ok: true,
          serverActive: true,
          port,
          lanIps: getLanIps(),
          detectedTunnelUrl: readDetectedTunnelUrl(db.publicCloudUrl),
        });
      }

      /* ----------- ROUTE STATUT TUNNEL CLOUD : GET /api/tunnel-url ----------- */
      if (pathname === '/api/tunnel-url' && req.method === 'GET') {
        ensureDataDirs();
        if (fs.existsSync(TUNNEL_URL_FILE)) {
          try {
            const raw = fs.readFileSync(TUNNEL_URL_FILE, 'utf8').trim();
            const match = raw.match(/https:\/\/[a-zA-Z0-9.-]+\.(?:trycloudflare\.com|loca\.lt|ngrok-free\.app|ngrok\.io)/i);
            if (match) {
              return sendJson(res, 200, { ok: true, url: match[0].replace(/\/+$/, '') });
            }
          } catch {
            /* ignore read errors */
          }
        }
        return sendJson(res, 200, { ok: false, url: null });
      }

      /* ----------- AUTHENTIFICATION BACK-OFFICE : POST /api/admin-login ----------- */
      if (pathname === '/api/admin-login' && req.method === 'POST') {
        const rlKey = getClientKey(req, 'admin');
        const rl = checkRateLimit(rlKey);
        if (rl.locked) {
          return sendJson(res, 429, {
            ok: false,
            locked: true,
            remainingSec: rl.remainingSec,
            error: `Trop de tentatives. Réessayez dans ${rl.remainingSec} s.`,
          });
        }

        const body = await readJsonBody(req);
        const code = String(body?.code || '').trim();
        if (safeEqual(code, getAdminPasscode())) {
          clearFailedAttempts(rlKey);
          const token = crypto.randomBytes(32).toString('hex');
          adminTokens.set(token, Date.now() + TOKEN_TTL_MS);
          return sendJson(res, 200, { ok: true, token });
        }

        const failState = recordFailedAttempt(rlKey);
        return sendJson(res, failState.locked ? 429 : 401, {
          ok: false,
          locked: Boolean(failState.locked),
          remainingSec: failState.remainingSec || 0,
          error: failState.locked
            ? `Accès verrouillé pendant ${failState.remainingSec} secondes après 5 erreurs.`
            : 'Code d’accès incorrect.',
        });
      }

      /* ----------- LECTURE PROTÉGÉE BACK-OFFICE : GET /api/admin-data ----------- */
      if (pathname === '/api/admin-data' && req.method === 'GET') {
        const token = extractAdminToken(req);
        if (!isValidAdminToken(token)) {
          return sendJson(res, 401, {
            ok: false,
            error: 'Accès refusé — Jeton d’authentification administrateur (X-Admin-Token, X-Admin-Key ou Bearer) valide requis.',
          });
        }

        const db = readDatabase();
        const port = server.config?.server?.port || defaultPort;
        return sendJson(res, 200, {
          ok: true,
          responses: db.responses,
          contacts: db.contacts,
          deletedResponseIds: db.deletedResponseIds,
          deletedContactIds: db.deletedContactIds,
          validations: db.validations,
          publicCloudUrl: db.publicCloudUrl,
          serverInfo: {
            port,
            lanIps: getLanIps(),
            detectedTunnelUrl: readDetectedTunnelUrl(db.publicCloudUrl),
            dbFile: './data/ensta-r2a-database.json',
            appendLogFile: './data/responses-append-log.jsonl',
            appendLogLines: db._appendLogLines,
            backupsCount: countBackups(),
          },
        });
      }

      /* ----------- SYNCHRONISATION PROTÉGÉE CRM & ADMIN : POST /api/admin-sync ----------- */
      if (pathname === '/api/admin-sync' && req.method === 'POST') {
        const token = extractAdminToken(req);
        if (!isValidAdminToken(token)) {
          return sendJson(res, 401, {
            ok: false,
            error: 'Accès refusé — Jeton d’authentification administrateur (X-Admin-Token, X-Admin-Key ou Bearer) valide requis.',
          });
        }

        const body = await readJsonBody(req);
        const db = readDatabase();

        const nextPublicUrl =
          typeof body.publicCloudUrl === 'string' ? body.publicCloudUrl.trim() : db.publicCloudUrl;

        let nextDeletedResp = [
          ...new Set([
            ...db.deletedResponseIds,
            ...(Array.isArray(body.deletedResponseIds) ? body.deletedResponseIds : []),
          ]),
        ];
        let nextDeletedCont = [
          ...new Set([
            ...db.deletedContactIds,
            ...(Array.isArray(body.deletedContactIds) ? body.deletedContactIds : []),
          ]),
        ];

        if (body.resetContactsToSeed) {
          nextDeletedCont = [];
        }

        const incomingResp = Array.isArray(body.responses) ? body.responses : [];
        const incomingCont = Array.isArray(body.contacts) ? body.contacts : [];

        // Si un admin réimporte des réponses explicitement, les retirer des tombstones
        if (incomingResp.length > 0 && body.unTombstoneIncoming) {
          const incomingIds = new Set(incomingResp.map((r) => r.id));
          nextDeletedResp = nextDeletedResp.filter((id) => !incomingIds.has(id));
        }

        const mergedResponses =
          body.replaceResponses === true
            ? incomingResp
            : mergeRecordsById(db.responses, incomingResp, nextDeletedResp).sort((a, b) =>
                String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
              );

        const mergedContacts = body.resetContactsToSeed
          ? buildSeedContacts()
          : body.replaceContacts === true
            ? incomingCont
            : deduplicateContactsWithSeeds(
                mergeRecordsById(db.contacts, incomingCont, nextDeletedCont),
                nextDeletedCont,
              );

        const saved = writeDatabaseAtomic(
          {
            ...db,
            publicCloudUrl: nextPublicUrl,
            responses: mergedResponses,
            contacts: mergedContacts,
            deletedResponseIds: nextDeletedResp,
            deletedContactIds: nextDeletedCont,
          },
          { backupTag: body.backupTag || 'admin-sync' },
        );

        const port = server.config?.server?.port || defaultPort;
        return sendJson(res, 200, {
          ok: true,
          responses: saved.responses,
          contacts: saved.contacts,
          deletedResponseIds: saved.deletedResponseIds,
          deletedContactIds: saved.deletedContactIds,
          validations: saved.validations,
          publicCloudUrl: saved.publicCloudUrl,
          serverInfo: {
            port,
            lanIps: getLanIps(),
            detectedTunnelUrl: readDetectedTunnelUrl(saved.publicCloudUrl),
            dbFile: './data/ensta-r2a-database.json',
            appendLogFile: './data/responses-append-log.jsonl',
            appendLogLines: readAppendLogEntries().lineCount,
            backupsCount: countBackups(),
          },
        });
      }

      /* ----------- AUTH VALIDATION PROFESSEUR & ÉQUIPE : POST /api/review-auth ----------- */
      if (pathname === '/api/review-auth' && req.method === 'POST') {
        const rlKey = getClientKey(req, 'review');
        const rl = checkRateLimit(rlKey);
        if (rl.locked) {
          return sendJson(res, 429, {
            ok: false,
            locked: true,
            remainingSec: rl.remainingSec,
            error: `Trop de tentatives. Réessayez dans ${rl.remainingSec} s.`,
          });
        }

        const body = await readJsonBody(req);
        const code = String(body?.code || '').trim();
        const profCode = getProfessorCode();
        const teamCode = getTeamCode();
        const adminCode = getAdminPasscode();

        let role = null;
        if (safeEqual(code, profCode) || safeEqual(code, adminCode)) {
          role = 'professor';
        } else if (safeEqual(code, teamCode)) {
          role = 'team';
        }

        if (role) {
          clearFailedAttempts(rlKey);
          const token = crypto.randomBytes(32).toString('hex');
          reviewTokens.set(token, { role, expiresAt: Date.now() + TOKEN_TTL_MS });
          return sendJson(res, 200, { ok: true, role, token });
        }

        const failState = recordFailedAttempt(rlKey);
        return sendJson(res, failState.locked ? 429 : 401, {
          ok: false,
          locked: Boolean(failState.locked),
          remainingSec: failState.remainingSec || 0,
          error: failState.locked
            ? `Accès verrouillé pendant ${failState.remainingSec} secondes après 5 erreurs.`
            : 'Code Professeur / Équipe incorrect.',
        });
      }

      /* ----------- LECTURE / ÉCRITURE VALIDATION EN LIGNE : /api/review-validations ----------- */
      if (pathname === '/api/review-validations' && (req.method === 'GET' || req.method === 'POST')) {
        const role = getReviewerRoleFromToken(req.headers['x-review-token'], req.headers['x-admin-token']);
        if (!role) {
          return sendJson(res, 401, {
            ok: false,
            error: 'Accès refusé — Authentification Professeur ou Équipe requise.',
          });
        }

        const db = readDatabase();
        if (req.method === 'GET') {
          return sendJson(res, 200, { ok: true, role, validations: db.validations });
        }

        const body = await readJsonBody(req);
        const now = new Date().toISOString();
        const nextSections = { ...(db.validations?.sections || {}) };
        let nextComments = [...(db.validations?.comments || [])];

        if (body.action === 'set_section_status' && body.sectionId) {
          const validStatuses = ['pending', 'validated', 'adjust'];
          const status = validStatuses.includes(body.status) ? body.status : 'pending';
          nextSections[body.sectionId] = {
            status,
            updatedBy: String(body.author || '').slice(0, 80),
            roleLabel: String(body.roleLabel || '').slice(0, 120),
            updatedAt: now,
          };
        } else if (body.action === 'add_comment' && String(body.text || '').trim()) {
          const comment = {
            id: `val_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`,
            sectionId: String(body.sectionId || 'general'),
            author: String(body.author || 'Référent ENSTA').slice(0, 80),
            roleLabel: String(body.roleLabel || '').slice(0, 120),
            roleGroup: role,
            text: String(body.text).trim().slice(0, 2000),
            statusAtPost: body.statusAtPost || null,
            createdAt: now,
          };
          nextComments = [comment, ...nextComments];
        } else if (body.action === 'delete_comment' && body.commentId) {
          nextComments = nextComments.filter((c) => c.id !== body.commentId);
        }

        const saved = writeDatabaseAtomic(
          {
            ...db,
            validations: {
              sections: nextSections,
              comments: nextComments,
            },
          },
          { backupTag: 'validation' },
        );

        return sendJson(res, 200, { ok: true, role, validations: saved.validations });
      }

      return sendJson(res, 404, { ok: false, error: 'Route API introuvable.' });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err?.message || 'Erreur interne du serveur.' });
    }
  });
}

export default function r2aServerPlugin() {
  return {
    name: 'ensta-r2a-cyber-server',
    configureServer(server) {
      attachMiddleware(server, 5173);
    },
    configurePreviewServer(server) {
      attachMiddleware(server, 4173);
    },
  };
}
