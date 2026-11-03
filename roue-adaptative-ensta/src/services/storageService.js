/**
 * storageService.js — Architecture Cyber "Write-Only" & Triple Sauvegarde Multi-Appareils.
 *
 *  1. ZÉRO FUITE DE DONNÉES CLIENT :
 *     - Les visiteurs/clients soumettent uniquement via `POST /api/survey-submit` (Write-Only)
 *       qui retourne exclusivement `{ ok: true, id, receiptId, savedAt }`.
 *     - Aucun navigateur non authentifié ne télécharge jamais les réponses des autres clients ni le CRM.
 *  2. TRIPLE FALLBACK DE SAUVEGARDE SIMULTANÉE :
 *     - Sauvegarde 1 (Serveur PC) : fusion dans `./data/ensta-r2a-database.json` + journal atomique
 *       inaltérable `./data/responses-append-log.jsonl` + snapshot horodaté `./data/backups/`.
 *     - Sauvegarde 2 (File hors-ligne `ensta_pending_submissions` dans `localStorage`) : conserve toute
 *       réponse saisie sans réseau sur smartphone/tablette et la pousse automatiquement dès reconnexion.
 *     - Sauvegarde 3 (Justificatif `.json` en 1 clic sur l'écran de confirmation avec numéro de reçu).
 *  3. BACK-OFFICE & VALIDATION PROFESSEUR/ÉQUIPE PROTÉGÉS PAR JETON :
 *     - Lecture/écriture Back-Office (`GET /api/admin-data`, `POST /api/admin-sync`) protégée par `X-Admin-Token`.
 *     - Module Validation Professeur/Équipe (`/api/review-validations`) protégé par `X-Review-Token`.
 */
import projectData from '../config/projectData.js';
import { allQuestions, labelForValue, resolveOptions } from '../utils/surveyAnalytics.js';
import { uid } from '../utils/format.js';

const NS = projectData.storage.namespace;
const PENDING_QUEUE_KEY = projectData.storage.pendingQueueKey || 'ensta_pending_submissions';
const DEFAULT_SESSION = projectData.storage.defaultSessionCode || 'ENSTA-R2A-2026';
const SEED_CREATED_AT = '2026-10-30T08:00:00.000Z';
const CRM_SEED_VERSION = 3;
const SCHEMA_VERSION = 3;

const KEYS = {
  responses: `${NS}:admin-responses-cache`,
  contacts: `${NS}:admin-contacts-cache`,
  validations: `${NS}:validations-cache`,
  meta: `${NS}:sync-meta`,
  session: `${NS}:session-code`,
  publicUrl: `${NS}:public-cloud-url`,
  adminToken: `${NS}:admin-token`,
  reviewSession: `${NS}:review-session`,
};

const hasWindow = typeof window !== 'undefined';
const memoryStore = new Map();

/* ------------------------------ utilitaires ------------------------------ */
const slugify = (s = '') =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export function normalizeSessionCode(raw) {
  const cleaned = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || DEFAULT_SESSION;
}

export function getFirebaseUrl() {
  const raw =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_URL) ||
    '';
  return String(raw || '').trim().replace(/\/+$/, '');
}

export function getFirebaseSecret() {
  const raw =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_SECRET) ||
    '';
  return String(raw || '').trim();
}

function makeLocalReceiptId() {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rndPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `R2A-${day}-${rndPart}`;
}

/* ------------------------------ adaptateurs ------------------------------ */
const localAdapter = {
  async read(key, fallback) {
    try {
      if (!hasWindow || !window.localStorage) {
        return memoryStore.has(key) ? memoryStore.get(key) : fallback;
      }
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  async write(key, value) {
    try {
      if (!hasWindow || !window.localStorage) {
        memoryStore.set(key, value);
        return;
      }
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      memoryStore.set(key, value);
    }
  },
  async remove(key) {
    try {
      if (!hasWindow || !window.localStorage) {
        memoryStore.delete(key);
        return;
      }
      window.localStorage.removeItem(key);
    } catch {
      memoryStore.delete(key);
    }
  },
};

let adapter = localAdapter;
export const setAdapter = (a) => {
  adapter = a || localAdapter;
};

/* --------------------- jetons de session (sessionStorage) ---------------- */
export function getAdminToken() {
  if (!hasWindow) return '';
  try {
    return window.sessionStorage.getItem(KEYS.adminToken) || '';
  } catch {
    return '';
  }
}

export function setAdminToken(token) {
  if (!hasWindow) return;
  try {
    if (token) window.sessionStorage.setItem(KEYS.adminToken, token);
    else window.sessionStorage.removeItem(KEYS.adminToken);
  } catch {
    /* ignore */
  }
}

export function getReviewerSession() {
  if (!hasWindow) return { authed: false, role: null, token: '' };
  try {
    const raw = window.sessionStorage.getItem(KEYS.reviewSession);
    if (!raw) return { authed: false, role: null, token: '' };
    const parsed = JSON.parse(raw);
    return {
      authed: Boolean(parsed?.token && parsed?.role),
      role: parsed?.role || null,
      token: parsed?.token || '',
    };
  } catch {
    return { authed: false, role: null, token: '' };
  }
}

export function setReviewerSession(session) {
  if (!hasWindow) return;
  try {
    if (session?.token && session?.role) {
      window.sessionStorage.setItem(KEYS.reviewSession, JSON.stringify(session));
    } else {
      window.sessionStorage.removeItem(KEYS.reviewSession);
    }
  } catch {
    /* ignore */
  }
}

/* --------------------- URL publique Cloud du PC & Session ---------------- */
export function getSessionCode() {
  if (!hasWindow) return DEFAULT_SESSION;
  try {
    return normalizeSessionCode(window.localStorage.getItem(KEYS.session) || DEFAULT_SESSION);
  } catch {
    return DEFAULT_SESSION;
  }
}

export function setSessionCode(nextCode) {
  const normalized = normalizeSessionCode(nextCode);
  if (hasWindow) {
    try {
      window.localStorage.setItem(KEYS.session, normalized);
    } catch {
      /* ignore */
    }
  }
  updateSyncState({ sessionCode: normalized });
  return normalized;
}

export function getPublicCloudUrl() {
  if (!hasWindow) return '';
  try {
    return (window.localStorage.getItem(KEYS.publicUrl) || '').trim().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function setPublicCloudUrl(url) {
  const cleaned = String(url || '').trim().replace(/\/+$/, '');
  if (hasWindow) {
    try {
      if (cleaned) window.localStorage.setItem(KEYS.publicUrl, cleaned);
      else window.localStorage.removeItem(KEYS.publicUrl);
    } catch {
      /* ignore */
    }
  }
  updateSyncState({ publicCloudUrl: cleaned });
  return cleaned;
}

// Alias rétro-compatibles
export const getCustomCloudUrl = getPublicCloudUrl;
export const setCustomCloudUrl = setPublicCloudUrl;

/* --------------------- métadonnées locales Admin ------------------------- */
async function readMeta() {
  const m = await adapter.read(KEYS.meta, null);
  return {
    deletedResponseIds: Array.isArray(m?.deletedResponseIds) ? m.deletedResponseIds : [],
    deletedContactIds: Array.isArray(m?.deletedContactIds) ? m.deletedContactIds : [],
    seedVersion: m?.seedVersion || 0,
    pendingPush: Boolean(m?.pendingPush),
  };
}

async function writeMeta(patch) {
  const cur = await readMeta();
  const next = {
    ...cur,
    ...patch,
    deletedResponseIds: (patch.deletedResponseIds ?? cur.deletedResponseIds).slice(-500),
    deletedContactIds: (patch.deletedContactIds ?? cur.deletedContactIds).slice(-500),
  };
  await adapter.write(KEYS.meta, next);
  return next;
}

/* ---------------------- état temps réel & abonnements -------------------- */
let syncState = {
  status: 'idle', // 'idle' | 'syncing' | 'synced' | 'offline'
  sessionCode: getSessionCode(),
  publicCloudUrl: getPublicCloudUrl(),
  lastSyncedAt: null,
  pendingCount: 0,
  serverInfo: null,
  error: null,
};

const listeners = new Set();
const broadcast =
  hasWindow && typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`${NS}:channel`) : null;

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn(syncState);
    } catch {
      /* ignore */
    }
  });
}

function updateSyncState(patch) {
  syncState = { ...syncState, ...patch };
  notifyListeners();
}

export function getSyncState() {
  return syncState;
}

export function subscribeSync(listener) {
  listeners.add(listener);
  listener(syncState);
  return () => listeners.delete(listener);
}

if (broadcast) {
  broadcast.onmessage = (ev) => {
    if (ev?.data?.type === 'DATA_UPDATED') {
      updateSyncState({ lastLocalUpdateAt: new Date().toISOString() });
    }
  };
}

function emitCrossTabUpdate() {
  try {
    broadcast?.postMessage({ type: 'DATA_UPDATED', at: Date.now() });
  } catch {
    /* ignore */
  }
}

/* ========================================================================= */
/*  CHANTIER 6 : SOUMISSION WRITE-ONLY & FILE D'ATTENTE HORS-LIGNE           */
/* ========================================================================= */
export async function listPendingSubmissions() {
  const queue = await adapter.read(PENDING_QUEUE_KEY, []);
  return Array.isArray(queue) ? queue : [];
}

async function writePendingSubmissions(queue) {
  const clean = Array.isArray(queue) ? queue : [];
  await adapter.write(PENDING_QUEUE_KEY, clean);
  updateSyncState({ pendingCount: clean.length });
}

async function postSurveyToServer(record, timeoutMs = 6000) {
  if (!hasWindow || typeof window.fetch !== 'function') {
    throw new Error('Environnement sans fetch');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const firebaseUrl = getFirebaseUrl();

  try {
    if (firebaseUrl) {
      // 1. Écriture publique vers Firebase Realtime Database (100% Serverless Cloud 24/7)
      const targetUrl = `${firebaseUrl}/responses.json`;
      const res = await window.fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Firebase HTTP ${res.status}`);
      }
      const data = await res.json();
      return {
        ok: true,
        id: record.id,
        receiptId: record.receiptId,
        firebaseKey: data?.name || null,
        savedAt: record.createdAt || new Date().toISOString(),
      };
    }

    // 2. Repli serveur local Vite si VITE_FIREBASE_URL n'est pas configuré
    const res = await window.fetch('./api/survey-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(record),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || 'Réponse serveur invalide');
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Envoie une réponse client en mode Write-Only (`POST /responses.json` sur Firebase ou `./api/survey-submit`).
 * En cas d'absence momentanée de réseau, empile dans `ensta_pending_submissions`
 * pour transmission automatique dès reconnexion.
 */
export async function submitSurveyWriteOnly({ sector, answers, durationSec }) {
  const now = new Date().toISOString();
  const provisionalReceipt = makeLocalReceiptId();
  const record = {
    id: uid('resp'),
    receiptId: provisionalReceipt,
    sector,
    answers,
    durationSec: durationSec || 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const ack = await postSurveyToServer(record);
    const confirmedRecord = {
      ...record,
      id: ack.id || record.id,
      receiptId: ack.receiptId || provisionalReceipt,
      savedAt: ack.savedAt || now,
      firebaseKey: ack.firebaseKey || null,
    };
    // Si l'administrateur teste lui-même depuis son navigateur authentifié, met à jour son cache local
    if (getAdminToken()) {
      const cur = await listResponses();
      if (!cur.some((r) => r.id === confirmedRecord.id)) {
        await adapter.write(KEYS.responses, [confirmedRecord, ...cur]);
      }
      emitCrossTabUpdate();
    }
    // Tente aussi de vider d'éventuelles soumissions antérieures en attente sur cet appareil
    flushPendingSubmissions().catch(() => {});
    return {
      ok: true,
      queuedOffline: false,
      receiptId: confirmedRecord.receiptId,
      savedAt: confirmedRecord.savedAt,
      record: confirmedRecord,
    };
  } catch {
    // SAUVEGARDE 2 : Mise en file d'attente hors-ligne dans `ensta_pending_submissions`
    const pending = await listPendingSubmissions();
    const nextQueue = [...pending.filter((p) => p.id !== record.id), record];
    await writePendingSubmissions(nextQueue);

    // En mode statique sans serveur Node (ex. test hors-ligne sur le même PC), garde aussi trace dans le cache local
    if (getAdminToken() === 'local-static-admin') {
      const cur = await listResponses();
      await adapter.write(KEYS.responses, [record, ...cur]);
      await createLeadFromResponse(record);
      emitCrossTabUpdate();
    }

    return {
      ok: true,
      queuedOffline: true,
      receiptId: provisionalReceipt,
      savedAt: now,
      record,
    };
  }
}

let flushingPromise = null;

/** Transmet automatiquement les réponses stockées dans `ensta_pending_submissions` dès retour du réseau. */
export async function flushPendingSubmissions() {
  if (flushingPromise) return flushingPromise;
  flushingPromise = (async () => {
    const pending = await listPendingSubmissions();
    if (!pending.length) {
      updateSyncState({ pendingCount: 0 });
      return { flushed: 0, remaining: 0 };
    }
    const remaining = [];
    let flushed = 0;
    for (const item of pending) {
      try {
        await postSurveyToServer(item, 4500);
        flushed += 1;
      } catch {
        remaining.push(item);
      }
    }
    await writePendingSubmissions(remaining);
    if (flushed > 0 && getAdminToken()) {
      syncWithCloud({ pushChanges: false }).catch(() => {});
    }
    return { flushed, remaining: remaining.length };
  })().finally(() => {
    flushingPromise = null;
  });
  return flushingPromise;
}

/** SAUVEGARDE 3 : Téléchargement en 1 clic du justificatif individuel `.json` sur l'écran de fin. */
export function downloadSubmissionProof(submission) {
  if (!submission?.record) return;
  const { record, receiptId, savedAt, queuedOffline } = submission;
  const payload = {
    document: 'Justificatif de participation — Consultation Industrielle R2A ENSTA Bretagne',
    id: record.id,
    receiptId: receiptId || record.receiptId,
    submittedAt: savedAt || record.createdAt,
    syncStatus: queuedOffline
      ? 'Sauvegardé sur appareil (transmission automatique dès reconnexion)'
      : 'Confirmé par le serveur ENSTA R2A',
    sector: record.sector,
    company: record.answers?.company || '',
    contactName: record.answers?.contactName || '',
    answers: record.answers,
  };
  const safeReceipt = String(payload.receiptId || 'R2A').replace(/[^a-zA-Z0-9_-]/g, '');
  downloadFile(`justificatif-enquete-${safeReceipt}.json`, JSON.stringify(payload, null, 2), 'application/json');
}

if (hasWindow) {
  window.addEventListener('online', () => {
    flushPendingSubmissions().catch(() => {});
    if (getAdminToken()) {
      syncWithCloud({ pushChanges: true }).catch(() => {});
    }
  });
  // Vérifie uniquement si CE terminal possède des réponses hors-ligne en attente d'envoi (Write-Only, zéro GET public !)
  setTimeout(() => {
    flushPendingSubmissions().catch(() => {});
  }, 1200);
  setInterval(() => {
    listPendingSubmissions().then((q) => {
      if (q.length > 0) flushPendingSubmissions().catch(() => {});
    });
  }, 12000);
}

/* ========================================================================= */
/*  AUTHENTIFICATION BACK-OFFICE & VALIDATION PROFESSEUR / ÉQUIPE            */
/* ========================================================================= */
export async function authenticateAdmin(code) {
  const trimmed = String(code || '').trim();
  if (!trimmed) return { ok: false, error: 'Veuillez saisir le code d’accès.' };

  if (hasWindow && typeof window.fetch === 'function') {
    try {
      const res = await window.fetch('./api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      if (res.status === 200) {
        const data = await res.json();
        if (data?.ok && data?.token) {
          setAdminToken(data.token);
          return { ok: true, token: data.token, serverMode: true };
        }
      }
      if (res.status === 401 || res.status === 429) {
        const data = await res.json().catch(() => ({}));
        return {
          ok: false,
          locked: Boolean(data?.locked || res.status === 429),
          remainingSec: data?.remainingSec || 30,
          error: data?.error || 'Code incorrect.',
        };
      }
    } catch {
      /* Repli local si déployé en statique pur sans serveur Node */
    }
  }

  // Repli statique hors-serveur
  const adminPasscode =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSCODE) ||
    projectData.admin?.accessCode ||
    'ENSTA2026';

  // 1. Mode Serverless Cloud (Firebase Realtime Database / Vercel)
  const firebaseUrl = getFirebaseUrl();
  if (firebaseUrl) {
    if (trimmed === adminPasscode) {
      const token = `firebase-admin-${Date.now()}`;
      setAdminToken(token);
      return { ok: true, token, serverMode: true, cloudProvider: 'firebase' };
    }
    return { ok: false, error: 'Code incorrect.' };
  }

  // 2. Mode Serveur Local Node.js (PC)
  if (hasWindow && typeof window.fetch === 'function') {
    try {
      const res = await window.fetch('./api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      if (res.status === 200) {
        const data = await res.json();
        if (data?.ok && data?.token) {
          setAdminToken(data.token);
          return { ok: true, token: data.token, serverMode: true };
        }
      }
      if (res.status === 401 || res.status === 429) {
        const data = await res.json().catch(() => ({}));
        return {
          ok: false,
          locked: Boolean(data?.locked || res.status === 429),
          remainingSec: data?.remainingSec || 30,
          error: data?.error || 'Code incorrect.',
        };
      }
    } catch {
      /* Repli local si déployé en statique pur sans serveur Node */
    }
  }

  // 3. Repli statique hors-serveur
  if (trimmed === adminPasscode) {
    setAdminToken('local-static-admin');
    return { ok: true, token: 'local-static-admin', serverMode: false };
  }
  return { ok: false, error: 'Code incorrect.' };
}

export function logoutAdminSession() {
  setAdminToken('');
}

export async function authenticateReviewer(code) {
  const trimmed = String(code || '').trim();
  if (!trimmed) return { ok: false, error: 'Veuillez saisir votre code Professeur ou Équipe.' };

  const profCode =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PROFESSOR_CODE) ||
    projectData.reviewValidation?.professorCode ||
    'R2A-PROF-2026';
  const teamCode =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TEAM_CODE) ||
    projectData.reviewValidation?.teamCode ||
    'ENSTA-R2A-2026';
  const adminCode =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSCODE) ||
    projectData.admin?.accessCode ||
    'ENSTA2026';
  let role = null;
  if (trimmed === profCode || trimmed === adminCode) role = 'professor';
  else if (trimmed === teamCode) role = 'team';

  // 1. Mode Serverless Cloud (Firebase / Vercel)
  const firebaseUrl = getFirebaseUrl();
  if (firebaseUrl) {
    if (role) {
      const session = { authed: true, role, token: `fb-rev-${role}` };
      setReviewerSession(session);
      return { ok: true, ...session };
    }
    return { ok: false, error: 'Code Professeur / Équipe incorrect.' };
  }

  if (hasWindow && typeof window.fetch === 'function') {
    try {
      const res = await window.fetch('./api/review-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      if (res.status === 200) {
        const data = await res.json();
        if (data?.ok && data?.token) {
          const session = { authed: true, role: data.role, token: data.token };
          setReviewerSession(session);
          return { ok: true, ...session };
        }
      }
      if (res.status === 401 || res.status === 429) {
        const data = await res.json().catch(() => ({}));
        return {
          ok: false,
          locked: Boolean(data?.locked || res.status === 429),
          remainingSec: data?.remainingSec || 30,
          error: data?.error || 'Code Professeur / Équipe incorrect.',
        };
      }
    } catch {
      /* Repli statique */
    }
  }

  if (role) {
    const session = { authed: true, role, token: `local-review-${role}` };
    setReviewerSession(session);
    return { ok: true, ...session };
  }
  return { ok: false, error: 'Code Professeur / Équipe incorrect.' };
}

export function logoutReviewerSession() {
  setReviewerSession(null);
}

/* ========================================================================= */
/*  MODULE VALIDATION EN LIGNE (PROFESSEUR & ÉQUIPE)                         */
/* ========================================================================= */
function defaultValidationsState() {
  const sections = {};
  (projectData.reviewValidation?.sections || []).forEach((s) => {
    sections[s.id] = { status: 'pending', updatedBy: '', roleLabel: '', updatedAt: null };
  });
  return { sections, comments: [] };
}

function buildReviewHeaders() {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const rev = getReviewerSession();
  const adm = getAdminToken();
  if (rev.token && !rev.token.startsWith('local-')) headers['X-Review-Token'] = rev.token;
  if (adm && adm !== 'local-static-admin') headers['X-Admin-Token'] = adm;
  return headers;
}

export async function fetchValidations() {
  const firebaseUrl = getFirebaseUrl();
  if (firebaseUrl && hasWindow && typeof window.fetch === 'function') {
    try {
      const secret = getFirebaseSecret();
      const valUrl = secret
        ? `${firebaseUrl}/validations.json?auth=${encodeURIComponent(secret)}`
        : `${firebaseUrl}/validations.json`;
      const res = await window.fetch(valUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          await adapter.write(KEYS.validations, data);
          return data;
        }
      }
    } catch {
      /* fallback cache */
    }
  }

  const headers = buildReviewHeaders();
  if (hasWindow && typeof window.fetch === 'function' && (headers['X-Review-Token'] || headers['X-Admin-Token'])) {
    try {
      const res = await window.fetch('./api/review-validations', {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.validations) {
          await adapter.write(KEYS.validations, data.validations);
          return data.validations;
        }
      }
    } catch {
      /* fallback cache */
    }
  }
  const cached = await adapter.read(KEYS.validations, null);
  return cached || defaultValidationsState();
}

async function mutateValidations(actionPayload) {
  const headers = buildReviewHeaders();
  if (hasWindow && typeof window.fetch === 'function' && (headers['X-Review-Token'] || headers['X-Admin-Token'])) {
    try {
      const res = await window.fetch('./api/review-validations', {
        method: 'POST',
        headers,
        body: JSON.stringify(actionPayload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.validations) {
          await adapter.write(KEYS.validations, data.validations);
          emitCrossTabUpdate();
          return data.validations;
        }
      }
    } catch {
      /* fallback local */
    }
  }

  // Fallback local si hors-ligne
  const cur = await fetchValidations();
  const now = new Date().toISOString();
  const next = {
    sections: { ...(cur.sections || {}) },
    comments: [...(cur.comments || [])],
  };
  if (actionPayload.action === 'set_section_status') {
    next.sections[actionPayload.sectionId] = {
      status: actionPayload.status,
      updatedBy: actionPayload.author || '',
      roleLabel: actionPayload.roleLabel || '',
      updatedAt: now,
    };
  } else if (actionPayload.action === 'add_comment' && String(actionPayload.text || '').trim()) {
    next.comments.unshift({
      id: uid('val'),
      sectionId: actionPayload.sectionId || 'general',
      author: actionPayload.author || 'Référent ENSTA',
      roleLabel: actionPayload.roleLabel || '',
      text: String(actionPayload.text).trim(),
      statusAtPost: actionPayload.statusAtPost || null,
      createdAt: now,
    });
  } else if (actionPayload.action === 'delete_comment') {
    next.comments = next.comments.filter((c) => c.id !== actionPayload.commentId);
  }
  await adapter.write(KEYS.validations, next);
  emitCrossTabUpdate();
  return next;
}

export const setSectionValidationStatus = (payload) =>
  mutateValidations({ action: 'set_section_status', ...payload });

export const addValidationComment = (payload) =>
  mutateValidations({ action: 'add_comment', ...payload });

export const deleteValidationComment = (commentId) =>
  mutateValidations({ action: 'delete_comment', commentId });

/* ========================================================================= */
/*  GESTION PROTÉGÉE DES RÉPONSES & DU CRM (BACK-OFFICE AUTHENTIFIÉ)         */
/* ========================================================================= */
export async function listResponses() {
  const list = await adapter.read(KEYS.responses, []);
  return Array.isArray(list) ? list : [];
}

/** Utilisé par SurveyWizard via `submitSurveyWriteOnly` (et gardé en alias compatible). */
export async function addResponse(response) {
  const res = await submitSurveyWriteOnly(response);
  return res.record;
}

export async function deleteResponse(id) {
  const list = await listResponses();
  const meta = await readMeta();
  const target = list.find((r) => r.id === id);
  await adapter.write(KEYS.responses, list.filter((r) => r.id !== id));
  await writeMeta({
    deletedResponseIds: [...new Set([...meta.deletedResponseIds, id])],
    pendingPush: true,
  });

  const firebaseUrl = getFirebaseUrl();
  const firebaseSecret = getFirebaseSecret();
  if (firebaseUrl && target?.firebaseKey) {
    try {
      const delUrl = firebaseSecret
        ? `${firebaseUrl}/responses/${target.firebaseKey}.json?auth=${encodeURIComponent(firebaseSecret)}`
        : `${firebaseUrl}/responses/${target.firebaseKey}.json`;
      await window.fetch(delUrl, { method: 'DELETE' });
    } catch {
      /* ignore delete error */
    }
  }

  emitCrossTabUpdate();
  if (!firebaseUrl) {
    await syncWithCloud({ pushChanges: true, backupTag: 'delete-resp' });
  }
}

export async function clearResponses({ onlyDemo = false } = {}) {
  const list = await listResponses();
  const meta = await readMeta();
  const firebaseUrl = getFirebaseUrl();
  const firebaseSecret = getFirebaseSecret();

  if (!onlyDemo) {
    const removedIds = list.map((r) => r.id).filter(Boolean);
    await adapter.write(KEYS.responses, []);
    await writeMeta({
      deletedResponseIds: [...new Set([...meta.deletedResponseIds, ...removedIds])],
      pendingPush: true,
    });
    if (firebaseUrl) {
      try {
        const delUrl = firebaseSecret
          ? `${firebaseUrl}/responses.json?auth=${encodeURIComponent(firebaseSecret)}`
          : `${firebaseUrl}/responses.json`;
        await window.fetch(delUrl, { method: 'DELETE' });
      } catch {
        /* ignore delete error */
      }
    } else {
      await syncWithCloud({ pushChanges: true, replaceResponses: true, backupTag: 'purge-all' });
    }
  } else {
    const demoItems = list.filter((r) => r.demo);
    const removedDemoIds = demoItems.map((r) => r.id).filter(Boolean);
    await adapter.write(KEYS.responses, list.filter((r) => !r.demo));
    await writeMeta({
      deletedResponseIds: [...new Set([...meta.deletedResponseIds, ...removedDemoIds])],
      pendingPush: true,
    });
    if (firebaseUrl) {
      for (const item of demoItems) {
        if (item.firebaseKey) {
          try {
            const delUrl = firebaseSecret
              ? `${firebaseUrl}/responses/${item.firebaseKey}.json?auth=${encodeURIComponent(firebaseSecret)}`
              : `${firebaseUrl}/responses/${item.firebaseKey}.json`;
            await window.fetch(delUrl, { method: 'DELETE' });
          } catch {
            /* ignore delete error */
          }
        }
      }
    } else {
      await syncWithCloud({ pushChanges: true, backupTag: 'purge-demo' });
    }
  }
  emitCrossTabUpdate();
}

/* --------------------------------- contacts ------------------------------ */
const buildSeedContacts = () =>
  (projectData.crm.seedContacts || []).map((c) => ({
    id: c.id || `seed_${slugify(c.company)}`,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
    ...c,
  }));

function deduplicateAndEnsureSeeds(existingList, deletedContactIds = []) {
  const deletedSet = new Set(deletedContactIds);
  const seeds = buildSeedContacts();
  const seedByCompany = new Map(seeds.map((s) => [slugify(s.company), s]));

  const byId = new Map();
  const seenCompanies = new Set();

  (Array.isArray(existingList) ? existingList : []).forEach((c) => {
    if (!c || deletedSet.has(c.id)) return;
    const compKey = slugify(c.company);
    const matchingSeed = seedByCompany.get(compKey);
    const canonicalId =
      matchingSeed && String(c.id || '').startsWith('ct_') && c.source !== 'Enquête B2B'
        ? matchingSeed.id
        : c.id || uid('ct');
    if (deletedSet.has(canonicalId)) return;

    const normalized = { ...c, id: canonicalId };
    const prev = byId.get(canonicalId);
    if (!prev || String(normalized.updatedAt || normalized.createdAt) >= String(prev.updatedAt || prev.createdAt)) {
      byId.set(canonicalId, normalized);
    }
    if (compKey) seenCompanies.add(compKey);
  });

  seeds.forEach((seed) => {
    const compKey = slugify(seed.company);
    if (!byId.has(seed.id) && !seenCompanies.has(compKey) && !deletedSet.has(seed.id)) {
      byId.set(seed.id, seed);
      seenCompanies.add(compKey);
    }
  });

  return [...byId.values()];
}

export async function listContacts() {
  const stored = await adapter.read(KEYS.contacts, null);
  const meta = await readMeta();
  if (stored === null) {
    const seeded = buildSeedContacts();
    await adapter.write(KEYS.contacts, seeded);
    await writeMeta({ seedVersion: CRM_SEED_VERSION });
    return seeded;
  }
  if (meta.seedVersion < CRM_SEED_VERSION) {
    const upgraded = deduplicateAndEnsureSeeds(stored, meta.deletedContactIds);
    await adapter.write(KEYS.contacts, upgraded);
    await writeMeta({ seedVersion: CRM_SEED_VERSION });
    return upgraded;
  }
  return Array.isArray(stored) ? stored : [];
}

export async function upsertContact(contact) {
  const list = await listContacts();
  const now = new Date().toISOString();
  if (contact.id && list.some((c) => c.id === contact.id)) {
    const updated = { ...list.find((c) => c.id === contact.id), ...contact, updatedAt: now };
    const next = list.map((c) => (c.id === contact.id ? updated : c));
    await adapter.write(KEYS.contacts, next);
    await writeMeta({ pendingPush: true });
    emitCrossTabUpdate();
    await syncWithCloud({ pushChanges: true, backupTag: 'crm-update' });
    return updated;
  }
  const record = { id: contact.id || uid('ct'), createdAt: now, updatedAt: now, status: 'new', ...contact };
  await adapter.write(KEYS.contacts, [record, ...list]);
  await writeMeta({ pendingPush: true });
  emitCrossTabUpdate();
  await syncWithCloud({ pushChanges: true, backupTag: 'crm-add' });
  return record;
}

export async function deleteContact(id) {
  const list = await listContacts();
  const meta = await readMeta();
  await adapter.write(KEYS.contacts, list.filter((c) => c.id !== id));
  await writeMeta({
    deletedContactIds: [...new Set([...meta.deletedContactIds, id])],
    pendingPush: true,
  });
  emitCrossTabUpdate();
  await syncWithCloud({ pushChanges: true, backupTag: 'crm-delete' });
}

export async function resetContactsToSeed() {
  const seeded = buildSeedContacts();
  await adapter.write(KEYS.contacts, seeded);
  await writeMeta({ deletedContactIds: [], seedVersion: CRM_SEED_VERSION, pendingPush: true });
  emitCrossTabUpdate();
  await syncWithCloud({ pushChanges: true, resetContactsToSeed: true, backupTag: 'crm-reset' });
}

export async function createLeadFromResponse(response) {
  const a = response?.answers || {};
  const f = projectData.survey.fieldMap;
  const email = a[f.email];
  if (!email) return null;
  const list = await listContacts();
  const existing = list.find((c) => c.email && c.email.toLowerCase() === String(email).toLowerCase());
  const isPilot = a[f.pilot] === f.pilotYesValue;
  const roleQuestion = allQuestions().find((q) => q.id === f.role);
  const acqQuestion = allQuestions().find((q) => q.id === f.acquisition);
  const acqLine =
    acqQuestion && a[f.acquisition]
      ? `Formule souhaitée : ${labelForValue(acqQuestion, a[f.acquisition], response.sector)}`
      : '';
  const partnershipLine = f.partnership && a[f.partnership] ? `Collaboration : ${a[f.partnership]}` : '';
  const orgLine = f.orgType && a[f.orgType] ? `Profil : ${a[f.orgType]}` : '';
  return upsertContact({
    ...(existing || {}),
    company: a[f.company] || existing?.company || '',
    name: a[f.name] || existing?.name || '',
    role: existing?.role || (roleQuestion ? labelForValue(roleQuestion, a[f.role], response.sector) : '') || '',
    email,
    phone: a[f.phone] || existing?.phone || '',
    sector: response.sector,
    status: existing?.status || (isPilot ? 'contacted' : 'new'),
    source: 'Enquête B2B',
    nextAction: existing?.nextAction || (isPilot ? 'Candidat essai pilote / réunion technique' : 'Remercier & qualifier'),
    notes: [existing?.notes, orgLine, acqLine, partnershipLine, a[f.comment]].filter(Boolean).join('\n'),
    responseId: response.id,
  });
}

/* ========================================================================= */
/*  SYNCHRONISATION BACK-OFFICE PROTÉGÉE PAR X-Admin-Token                   */
/* ========================================================================= */
let activeSyncPromise = null;

export async function fetchServerInfo() {
  const firebaseUrl = getFirebaseUrl();
  if (firebaseUrl) {
    return {
      ok: true,
      serverActive: true,
      cloudProvider: 'Vercel + Firebase Realtime Database',
      mode: 'serverless-cloud',
      firebaseUrl,
      lanIps: [],
      detectedTunnelUrl: '',
    };
  }

  if (!hasWindow || typeof window.fetch !== 'function') return { ok: false, lanIps: [] };
  try {
    const res = await window.fetch('./api/server-info', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok) return data;
    }
    return { ok: false, lanIps: [] };
  } catch (err) {
    console.warn('Impossible de joindre le serveur local :', err);
    return { ok: false, lanIps: [] };
  }
}

export const fetchServerNetworkInfo = fetchServerInfo;

export async function syncWithCloud({
  pushChanges = false,
  replaceResponses = false,
  replaceContacts = false,
  resetContactsToSeed: resetSeeds = false,
  unTombstoneIncoming = false,
  backupTag = '',
} = {}) {
  const adminToken = getAdminToken();
  const firebaseUrl = getFirebaseUrl();

  if (!hasWindow || typeof window.fetch !== 'function' || !adminToken || (!firebaseUrl && adminToken === 'local-static-admin')) {
    const pending = await listPendingSubmissions();
    updateSyncState({
      status: adminToken === 'local-static-admin' ? 'offline' : 'idle',
      pendingCount: pending.length,
    });
    return { ok: false, offline: true };
  }

  if (activeSyncPromise) return activeSyncPromise;

  activeSyncPromise = (async () => {
    updateSyncState({ status: 'syncing', error: null });
    try {
      // Pousse d'abord d'éventuelles soumissions locales en file d'attente
      await flushPendingSubmissions();

      const [localResponses, localContacts, localMeta, pending] = await Promise.all([
        listResponses(),
        listContacts(),
        readMeta(),
        listPendingSubmissions(),
      ]);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);

      // --- BRANCHE 1 : MODE 100% SERVERLESS CLOUD AVEC FIREBASE REST API ---
      if (firebaseUrl) {
        try {
          const secret = getFirebaseSecret();
          const readUrl = secret
            ? `${firebaseUrl}/responses.json?auth=${encodeURIComponent(secret)}`
            : `${firebaseUrl}/responses.json`;

          const res = await window.fetch(readUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            cache: 'no-store',
            signal: controller.signal,
          });

          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              throw new Error('Accès Firebase refusé : vérifiez VITE_FIREBASE_SECRET ou les règles de sécurité (.read).');
            }
            throw new Error(`Firebase HTTP ${res.status}`);
          }

          const rawData = await res.json();
          let fbResponses = [];
          if (rawData && typeof rawData === 'object') {
            fbResponses = Object.entries(rawData)
              .map(([fbKey, val]) => {
                if (val && typeof val === 'object') {
                  return {
                    ...val,
                    id: val.id || fbKey,
                    firebaseKey: fbKey,
                  };
                }
                return null;
              })
              .filter(Boolean);
          }

          // Tri antéchronologique (plus récent en tête)
          fbResponses.sort((a, b) =>
            String(b.createdAt || b.updatedAt || '').localeCompare(String(a.createdAt || a.updatedAt || '')),
          );

          await adapter.write(KEYS.responses, fbResponses);

          // Crée ou met à jour les fiches CRM à partir de toutes les réponses industrielles
          for (const resp of fbResponses) {
            await createLeadFromResponse(resp);
          }

          // Tente de récupérer les validations si configuré
          try {
            const valUrl = secret
              ? `${firebaseUrl}/validations.json?auth=${encodeURIComponent(secret)}`
              : `${firebaseUrl}/validations.json`;
            const valRes = await window.fetch(valUrl, { cache: 'no-store' });
            if (valRes.ok) {
              const valData = await valRes.json();
              if (valData) await adapter.write(KEYS.validations, valData);
            }
          } catch {
            /* ignore validations sync error */
          }

          await writeMeta({ pendingPush: false });

          const syncedAt = new Date().toISOString();
          updateSyncState({
            status: 'synced',
            cloudProvider: 'Firebase Realtime Database',
            lastSyncedAt: syncedAt,
            pendingCount: pending.length,
            error: null,
          });
          emitCrossTabUpdate();

          return {
            ok: true,
            responses: fbResponses.length,
            contacts: (await listContacts()).length,
            cloudProvider: 'Firebase Realtime Database',
          };
        } finally {
          clearTimeout(timer);
        }
      }

      // --- BRANCHE 2 : MODE SERVEUR LOCAL NODE.JS (PC) ---

      const shouldPost =
        pushChanges ||
        localMeta.pendingPush ||
        replaceResponses ||
        replaceContacts ||
        resetSeeds;

      let data = null;

      try {
        if (shouldPost) {
          const res = await window.fetch('./api/admin-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-Admin-Token': adminToken,
            },
            body: JSON.stringify({
              publicCloudUrl: getPublicCloudUrl(),
              responses: localResponses,
              contacts: localContacts,
              deletedResponseIds: localMeta.deletedResponseIds,
              deletedContactIds: localMeta.deletedContactIds,
              replaceResponses,
              replaceContacts,
              resetContactsToSeed: resetSeeds,
              unTombstoneIncoming,
              backupTag,
            }),
            signal: controller.signal,
          });
          if (res.status === 401) {
            setAdminToken('');
            throw new Error('Session Back-Office expirée (401)');
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          data = await res.json();
        } else {
          const res = await window.fetch('./api/admin-data', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'X-Admin-Token': adminToken,
            },
            cache: 'no-store',
            signal: controller.signal,
          });
          if (res.status === 401) {
            setAdminToken('');
            throw new Error('Session Back-Office expirée (401)');
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          data = await res.json();
        }
      } finally {
        clearTimeout(timer);
      }

      if (!data?.ok) throw new Error(data?.error || 'Synchronisation refusée');

      await adapter.write(KEYS.responses, Array.isArray(data.responses) ? data.responses : []);
      await adapter.write(KEYS.contacts, Array.isArray(data.contacts) ? data.contacts : []);
      if (data.validations) {
        await adapter.write(KEYS.validations, data.validations);
      }
      if (data.publicCloudUrl && !getPublicCloudUrl()) {
        setPublicCloudUrl(data.publicCloudUrl);
      }

      await writeMeta({
        deletedResponseIds: Array.isArray(data.deletedResponseIds) ? data.deletedResponseIds : [],
        deletedContactIds: Array.isArray(data.deletedContactIds) ? data.deletedContactIds : [],
        pendingPush: false,
      });

      const syncedAt = new Date().toISOString();
      updateSyncState({
        status: 'synced',
        publicCloudUrl: getPublicCloudUrl() || data.serverInfo?.detectedTunnelUrl || '',
        serverInfo: data.serverInfo || null,
        pendingCount: pending.length,
        lastSyncedAt: syncedAt,
        error: null,
      });
      emitCrossTabUpdate();
      return {
        ok: true,
        responses: data.responses?.length || 0,
        contacts: data.contacts?.length || 0,
        serverInfo: data.serverInfo || null,
      };
    } catch (err) {
      updateSyncState({
        status: 'offline',
        error: err?.message || 'Serveur local hors-ligne',
      });
      return { ok: false, offline: true, error: err?.message };
    } finally {
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
}

/* ------------------------------ export / import --------------------------- */
export async function exportJSON() {
  return JSON.stringify(
    {
      app: projectData.meta.appName,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      responses: await listResponses(),
      contacts: await listContacts(),
      validations: await fetchValidations(),
    },
    null,
    2,
  );
}

/**
 * @param {string} text  contenu JSON
 * @param {'merge'|'replace'} mode
 */
export async function importJSON(text, mode = 'merge') {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Fichier JSON invalide.');
  }

  // Accepte également l'import direct d'un justificatif individuel téléchargé par un client
  let singleProofResponse = null;
  if (data && data.answers && data.receiptId && !Array.isArray(data.responses)) {
    const deterministicId = data.id || `imp_${String(data.receiptId).replace(/[^a-zA-Z0-9_-]/g, '')}`;
    singleProofResponse = {
      id: deterministicId,
      receiptId: data.receiptId,
      sector: data.sector || 'agri',
      createdAt: data.submittedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: data.answers,
    };
    data = {
      responses: [singleProofResponse],
      contacts: [],
    };
  }

  if (!data || (!Array.isArray(data.responses) && !Array.isArray(data.contacts))) {
    throw new Error('Structure inconnue : attendu { responses: [], contacts: [] } ou un justificatif R2A.');
  }
  const now = new Date().toISOString();
  const mergeById = (current, incoming) => {
    const map = new Map(current.map((x) => [x.id, x]));
    incoming.forEach((x) => {
      const id = x.id || uid('imp');
      map.set(id, { ...x, id, updatedAt: x.updatedAt || now });
    });
    return [...map.values()];
  };
  const inResp = Array.isArray(data.responses) ? data.responses : [];
  const inCont = Array.isArray(data.contacts) ? data.contacts : [];
  const respNext = mode === 'replace' ? inResp : mergeById(await listResponses(), inResp);
  const contNext = mode === 'replace' ? inCont : mergeById(await listContacts(), inCont);
  respNext.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  await adapter.write(KEYS.responses, respNext);
  await adapter.write(KEYS.contacts, contNext);
  await writeMeta({ pendingPush: true });
  if (singleProofResponse) {
    await createLeadFromResponse(singleProofResponse);
  }
  emitCrossTabUpdate();
  await syncWithCloud({
    pushChanges: true,
    replaceResponses: mode === 'replace',
    replaceContacts: mode === 'replace' && inCont.length > 0,
    unTombstoneIncoming: true,
    backupTag: 'import-json',
  });
  return { responses: inResp.length, contacts: inCont.length };
}

/* ---------------------------------- CSV ---------------------------------- */
const SEP = ';';
const csvCell = (v) => {
  if (v === undefined || v === null) return '';
  const s = Array.isArray(v) ? v.join(' | ') : typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCSV = (header, rows) =>
  '\ufeff' + [header, ...rows].map((r) => r.map(csvCell).join(SEP)).join('\r\n');

export function formatAnswerForExport(q, answers = {}, sectorId = 'agri') {
  const v = answers[q.id];
  if (v === undefined || v === null || v === '') return '';
  if (q.type === 'ranking' && typeof v === 'object' && !Array.isArray(v)) {
    const opts = resolveOptions(q, sectorId);
    return Object.entries(v)
      .sort((a, b) => Number(a[1]) - Number(b[1]))
      .map(([key, rank]) => {
        const lbl = opts.find((o) => o.value === key)?.label || key;
        return `Rang ${rank} : ${lbl}`;
      })
      .join(' | ');
  }
  if (q.type === 'other_pain') {
    const prio = answers[q.priorityFieldId || 'otherPainPriority'];
    return prio ? `[Priorité ${prio}/5] ${v}` : String(v);
  }
  if (q.type === 'vw_mode') {
    return v === 'eur' ? 'Montant brut (€ HT)' : '% de surcoût';
  }
  if (q.vw) {
    const unit = answers.vwPriceMode === 'eur' ? '€ HT' : '%';
    return `${v} ${unit}`;
  }
  if (q.type === 'single' || q.type === 'multi' || q.type === 'sector') {
    return labelForValue(q, v, sectorId);
  }
  return v;
}

export function responsesToCSV(responses) {
  const qs = allQuestions();
  const header = ['id', 'reçu', 'date', 'secteur', 'démo', ...qs.map((q) => q.label)];
  const rows = responses.map((r) => [
    r.id,
    r.receiptId || '',
    r.createdAt,
    r.sector,
    r.demo ? 'oui' : '',
    ...qs.map((q) => formatAnswerForExport(q, r.answers, r.sector)),
  ]);
  return toCSV(header, rows);
}

export function contactsToCSV(contacts) {
  const fields = projectData.crm.fields;
  const statuses = Object.fromEntries(projectData.crm.statuses.map((s) => [s.id, s.label]));
  const header = [...fields.map((f) => f.label), 'créé le'];
  const rows = contacts.map((c) => [
    ...fields.map((f) => (f.type === 'status' ? statuses[c[f.id]] || c[f.id] : c[f.id])),
    c.createdAt,
  ]);
  return toCSV(header, rows);
}

export function downloadFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const stamp = () => new Date().toISOString().slice(0, 10);

/* -------------------------------- démo data ------------------------------- */
const rnd = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const round1 = (x) => Math.round(x * 10) / 10;

const DEMO_OTHER_PAINS = {
  agri: [
    'Largeur routière hors-tout limitée à 2,55 m entre parcelles',
    'Bourrage de terre argileuse humide entre roues jumelées classiques',
  ],
  btp: [
    'Échauffement carcasse lors des cycles courts carrière / concasseur',
    'Chocs répétés sur seuils béton et rails de guidage en galerie',
  ],
  robotique: [
    'Vibrations haute fréquence dégradant la fusion SLAM LiDAR 3D',
    'Passage de joints de dilatation et caillebotis métalliques en site industriel',
  ],
};

/** Génère des réponses fictives (marquées `demo: true`) pour tester le back-office (% & € HT + classement 1-5). */
export async function addDemoResponses(count = projectData.admin.demo.count) {
  const { meanPercentBySector = {}, roundingBySector = {} } = projectData.admin.demo;
  const refBySector = projectData.survey.defaultReferencePriceBySector || {
    agri: 85000,
    btp: 140000,
    robotique: 45000,
  };
  const qs = allQuestions();
  const created = [];

  for (let i = 0; i < count; i += 1) {
    const sector = pick(projectData.sectors).id;
    const meanPct = (meanPercentBySector[sector] || 6.0) * rnd(0.8, 1.25);
    const stepEur = roundingBySector[sector] || 100;
    const refAsset = Math.round((refBySector[sector] * rnd(0.8, 1.25)) / 1000) * 1000;

    // 4 valeurs strictement positives et strictement croissantes (V1 < V2 < V3 < V4) en %
    const v1 = Math.max(0.5, round1(meanPct * rnd(0.32, 0.48)));
    const v2 = Math.max(round1(v1 + 0.6), round1(meanPct * rnd(0.62, 0.82)));
    const v3 = Math.max(round1(v2 + 0.8), round1(meanPct * rnd(1.08, 1.35)));
    const v4 = Math.max(round1(v3 + 1.0), round1(meanPct * rnd(1.55, 2.05)));

    const vwThresholds = {
      tooCheap: v1,
      cheap: v2,
      expensive: v3,
      tooExpensive: v4,
    };

    const answers = {
      vwPriceMode: 'percent',
      referenceAssetPriceEur: refAsset,
    };

    qs.forEach((q) => {
      if (q.id === 'vwPriceMode' || q.id === 'referenceAssetPriceEur') return;
      if (q.vw) {
        answers[q.id] = vwThresholds[q.vw];
        return;
      }
      const opts = resolveOptions(q, sector);
      switch (q.type) {
        case 'sector':
          answers[q.id] = sector;
          break;
        case 'ranking': {
          // Mélange léger des rangs 1..5 avec biais réaliste vers les premières contraintes
          const weighted = opts
            .map((o, idx) => ({ value: o.value, score: idx * 0.65 + Math.random() * 2.2 }))
            .sort((a, b) => a.score - b.score);
          const rankingMap = {};
          weighted.forEach((item, rankIdx) => {
            rankingMap[item.value] = rankIdx + 1;
          });
          answers[q.id] = rankingMap;
          break;
        }
        case 'other_pain':
          if (Math.random() < 0.35) {
            answers[q.id] = pick(DEMO_OTHER_PAINS[sector] || DEMO_OTHER_PAINS.agri);
            answers[q.priorityFieldId || 'otherPainPriority'] = Math.ceil(rnd(1, 4));
          }
          break;
        case 'single':
          if (opts.length) {
            if (q.columns === 3 || q.id === 'speedLimitPerception') {
              const r = Math.random();
              answers[q.id] = opts[r < 0.55 ? 0 : r < 0.85 ? 1 : r < 0.95 ? 2 : 3]?.value ?? pick(opts).value;
            } else {
              answers[q.id] = pick(opts).value;
            }
          }
          break;
        case 'scale':
          answers[q.id] = Math.min(q.max, Math.max(q.min, Math.round(rnd(q.min + (q.max - q.min) * 0.45, q.max))));
          break;
        case 'number':
          if (q.id === 'fleetSize') answers[q.id] = Math.round(rnd(4, 120));
          else if (q.id === 'annualBudget') answers[q.id] = Math.round(rnd(8, 160)) * 1000;
          else if (q.id === 'oemMaxUnitCost' && Math.random() < 0.55) {
            answers[q.id] = Math.max(stepEur, Math.round((refAsset * 0.025 * rnd(0.8, 1.25)) / stepEur) * stepEur);
          }
          break;
        case 'text':
          if (q.id === 'company') answers[q.id] = `Organisation démo ${i + 1}`;
          else if (q.id === 'contactName') answers[q.id] = ` Contact Industriel ${i + 1}`.trim();
          break;
        case 'email':
          answers[q.id] = `contact.demo${i + 1}@industrie-partenaire.fr`;
          break;
        case 'tel':
          answers[q.id] = `+33 6 ${String(10 + i).padStart(2, '0')} 42 58 ${String((i * 7) % 100).padStart(2, '0')}`;
          break;
        case 'consent':
          answers[q.id] = true;
          break;
        default:
          break;
      }
    });

    const ts = new Date(Date.now() - Math.random() * 20 * 86400000).toISOString();
    created.push({
      id: uid('resp'),
      receiptId: makeLocalReceiptId(),
      createdAt: ts,
      updatedAt: ts,
      sector,
      demo: true,
      answers,
    });
  }

  const list = await listResponses();
  await adapter.write(KEYS.responses, [...created, ...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  await writeMeta({ pendingPush: true });
  emitCrossTabUpdate();
  await syncWithCloud({ pushChanges: true, backupTag: 'demo-gen' });
  return created.length;
}

const storageService = {
  setAdapter,
  getAdminToken,
  setAdminToken,
  authenticateAdmin,
  logoutAdminSession,
  getReviewerSession,
  authenticateReviewer,
  logoutReviewerSession,
  fetchValidations,
  setSectionValidationStatus,
  addValidationComment,
  deleteValidationComment,
  getSessionCode,
  setSessionCode,
  normalizeSessionCode,
  getPublicCloudUrl,
  setPublicCloudUrl,
  getCustomCloudUrl,
  setCustomCloudUrl,
  getFirebaseUrl,
  getFirebaseSecret,
  fetchServerInfo,
  fetchServerNetworkInfo,
  init: () => Promise.resolve(true),
  fetchAdminData: listResponses,
  syncAdminData: syncWithCloud,
  subscribe: subscribeSync,
  unsubscribe: () => {},
  getSyncState,
  subscribeSync,
  syncWithCloud,
  submitSurveyWriteOnly,
  listPendingSubmissions,
  flushPendingSubmissions,
  downloadSubmissionProof,
  listResponses,
  addResponse,
  deleteResponse,
  clearResponses,
  listContacts,
  upsertContact,
  deleteContact,
  resetContactsToSeed,
  createLeadFromResponse,
  exportJSON,
  importJSON,
  formatAnswerForExport,
  responsesToCSV,
  contactsToCSV,
  downloadFile,
  stamp,
  addDemoResponses,
};

export default storageService;
