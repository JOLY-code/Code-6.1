import { useCallback, useEffect, useState } from 'react';
import projectData from '../config/projectData.js';
import { useSecurity } from '../context/SecurityContext.jsx';
import storage from '../services/storageService.js';
import { fmtDate } from '../utils/format.js';
import Icon from './ui/Icon.jsx';
import { Card, Section } from './ui/Primitives.jsx';
import OverviewPanel from './admin/OverviewPanel.jsx';
import VanWestendorpPanel from './admin/VanWestendorpPanel.jsx';
import ResponsesPanel from './admin/ResponsesPanel.jsx';
import CrmPanel from './admin/CrmPanel.jsx';
import DataPanel from './admin/DataPanel.jsx';

const { admin } = projectData;
const LOCK_SECONDS = 30;
const MAX_ATTEMPTS = admin.maxAttempts || 5;
const POLL_MS = projectData.storage.pollIntervalMs || 8000;

/* ----------------------------- écran d'accès sécurisé ----------------------------- */
function LoginGate({ onLogin, onCancel }) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [lockedUntil]);

  const locked = lockedUntil > now;

  const submit = async (e) => {
    e.preventDefault();
    if (locked || submitting || !code.trim()) return;
    setSubmitting(true);
    const res = await onLogin(code.trim());
    setSubmitting(false);

    if (res.ok) {
      setCode('');
      setError('');
      setAttempts(0);
      return;
    }

    setCode('');
    if (res.locked) {
      const waitSec = res.remainingSec || LOCK_SECONDS;
      setLockedUntil(Date.now() + waitSec * 1000);
      setNow(Date.now());
      setAttempts(0);
      setError(res.error || `Trop de tentatives. Pause de sécurité de ${waitSec} secondes.`);
      return;
    }

    const n = attempts + 1;
    setAttempts(n);
    if (n >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
      setNow(Date.now());
      setAttempts(0);
      setError(`Trop de tentatives (${MAX_ATTEMPTS} erreurs). Pause de sécurité de ${LOCK_SECONDS} secondes.`);
    } else {
      setError(res.error || 'Code d’accès incorrect.');
    }
  };

  return (
    <Section className="!py-20">
      <Card className="mx-auto max-w-md p-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
          <Icon name="Lock" size={24} />
        </span>
        <h2 className="mt-4 text-center font-display text-xl font-bold text-white">Back-Office R2A Protégé</h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Espace réservé à l&apos;équipe R2A et aux référents ENSTA. Authentification requise pour consulter les réponses et le CRM.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-code" className="label">
              Code d&apos;accès confidentiel
            </label>
            <input
              id="admin-code"
              type="password"
              autoFocus
              autoComplete="off"
              className="input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              disabled={locked || submitting}
              aria-invalid={!!error}
            />
            {(error || locked) && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-400">
                {locked ? `Verrouillage anti-bruteforce actif (${Math.ceil((lockedUntil - now) / 1000)} s).` : error}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
              Retour
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={locked || submitting || !code.trim()}>
              {submitting ? 'Vérification…' : 'Déverrouiller'}
            </button>
          </div>
        </form>
      </Card>
    </Section>
  );
}

/* -------------------------------- tableau de bord ------------------------------ */
export default function AdminDashboard({ onExit }) {
  const { isAdminAuthed, loginAdmin, logoutAdmin, openValidationModal } = useSecurity();
  const [tab, setTab] = useState(admin.tabs[0].id);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [responses, setResponses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState(() => storage.getSyncState());

  const refresh = useCallback(async () => {
    const [r, c] = await Promise.all([storage.listResponses(), storage.listContacts()]);
    setResponses(r);
    setContacts(c);
    setLoading(false);
  }, []);

  const manualCloudSync = useCallback(async () => {
    await storage.flushPendingSubmissions();
    await storage.syncWithCloud({ pushChanges: true });
    await refresh();
  }, [refresh]);

  useEffect(() => {
    const unsub = storage.subscribeSync((nextState) => {
      setSyncState(nextState);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!isAdminAuthed) return undefined;
    refresh();
    if (typeof storage.fetchServerInfo === 'function') {
      storage.fetchServerInfo().catch(() => {});
    }
    storage.syncWithCloud({ pushChanges: false }).then(refresh);

    const interval = setInterval(async () => {
      await storage.syncWithCloud({ pushChanges: false });
      await refresh();
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [isAdminAuthed, refresh]);

  useEffect(() => {
    if (isAdminAuthed && syncState.lastLocalUpdateAt) {
      refresh();
    }
  }, [isAdminAuthed, syncState.lastLocalUpdateAt, refresh]);

  const logout = () => {
    logoutAdmin();
    onExit();
  };

  if (!isAdminAuthed) return <LoginGate onLogin={loginAdmin} onCancel={onExit} />;

  const byFilter = (list) => (sectorFilter === 'all' ? list : list.filter((x) => x.sector === sectorFilter));
  const fResponses = byFilter(responses);
  const fContacts = byFilter(contacts);

  const isOffline = syncState.status === 'offline';
  const isSyncing = syncState.status === 'syncing';

  return (
    <Section className="!py-10">
      {/* Bandeau d'état Cyber Write-Only & Synchronisation Serveur PC */}
      <div
        className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs sm:px-5 ${
          isOffline
            ? 'border-amber-500/35 bg-amber-500/10 text-amber-200'
            : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm leading-none" aria-hidden="true">
            {isOffline ? '🟠' : '🟢'}
          </span>
          <span className="font-semibold text-white">
            {isOffline
              ? 'Cache Local Actif — Synchronisation automatique dès connexion au Serveur PC'
              : 'Serveur PC Cloud Actif · Isolation Cyber Write-Only (X-Admin-Token vérifié)'}
          </span>
          {syncState.lastSyncedAt && !isOffline && (
            <span className="font-mono text-[11px] text-emerald-300/80">
              · Dernière sync : {fmtDate(syncState.lastSyncedAt)} (auto 8 s)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openValidationModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
          >
            <Icon name="GraduationCap" size={13} />
            <span>Validation Prof. / Équipe</span>
          </button>
          <button
            type="button"
            onClick={manualCloudSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white disabled:opacity-60"
          >
            <Icon name="RefreshCw" size={13} className={isSyncing ? 'animate-spin text-amber-400' : 'text-amber-400'} />
            <span>{isSyncing ? 'Synchronisation…' : 'Actualiser Serveur'}</span>
          </button>
          {tab !== 'data' && (
            <button
              type="button"
              onClick={() => setTab('data')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/35 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/25"
            >
              <Icon name="QrCode" size={13} />
              <span>Serveur Cloud &amp; QR Codes</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Back-Office Sécurisé</p>
          <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Pilotage de l&apos;enquête &amp; du CRM</h2>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="admin-sector" className="sr-only">
            Filtrer par secteur
          </label>
          <select
            id="admin-sector"
            className="input w-auto"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
          >
            <option value="all">Tous les secteurs</option>
            {projectData.sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button className="btn-secondary" onClick={logout}>
            <Icon name="LogOut" size={16} /> Verrouiller
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-800" role="tablist">
        {admin.tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? 'border-amber-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : (
        <div role="tabpanel">
          {tab === 'overview' && <OverviewPanel responses={fResponses} />}
          {tab === 'vanwestendorp' && <VanWestendorpPanel responses={fResponses} sectorFilter={sectorFilter} />}
          {tab === 'responses' && <ResponsesPanel responses={fResponses} onChanged={refresh} />}
          {tab === 'crm' && <CrmPanel contacts={fContacts} onChanged={refresh} />}
          {tab === 'data' && (
            <DataPanel
              responses={responses}
              contacts={contacts}
              syncState={syncState}
              onSyncCloud={manualCloudSync}
              onChanged={refresh}
            />
          )}
        </div>
      )}
    </Section>
  );
}
