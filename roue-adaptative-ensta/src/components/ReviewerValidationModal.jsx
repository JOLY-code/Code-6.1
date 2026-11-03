import { useCallback, useEffect, useMemo, useState } from 'react';
import projectData from '../config/projectData.js';
import { useSecurity } from '../context/SecurityContext.jsx';
import storage from '../services/storageService.js';
import { fmtDate } from '../utils/format.js';
import Icon from './ui/Icon.jsx';
import { Badge, Card } from './ui/Primitives.jsx';

const cfg = projectData.reviewValidation;
const academic = projectData.strategicFramework.academicAccordion;
const LOCK_SECONDS = cfg.lockoutSeconds || 30;
const MAX_ATTEMPTS = cfg.maxAttempts || 5;

const STATUS_STYLES = {
  validated: {
    pillActive: 'border-emerald-400 bg-emerald-500 text-slate-950 font-bold shadow-sm',
    pillIdle: 'border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-200',
    badgeTone: 'good',
    label: 'Validé ✅',
  },
  adjust: {
    pillActive: 'border-amber-400 bg-amber-500 text-slate-950 font-bold shadow-sm',
    pillIdle: 'border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-500/50 hover:text-amber-200',
    badgeTone: 'warn',
    label: 'À ajuster 🛠️',
  },
  pending: {
    pillActive: 'border-slate-400 bg-slate-200 text-slate-950 font-bold shadow-sm',
    pillIdle: 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-200',
    badgeTone: 'slate',
    label: 'En attente ⏳',
  },
};

export default function ReviewerValidationModal({ onNavigateSection }) {
  const {
    isAdminAuthed,
    reviewerSession,
    isReviewerAuthed,
    loginReviewer,
    logoutReviewer,
    validationModalOpen,
    closeValidationModal,
  } = useSecurity();

  const unlocked = isReviewerAuthed || isAdminAuthed;
  const activeRole = reviewerSession?.role || (isAdminAuthed ? 'professor' : null);

  // État d'authentification anti-bruteforce
  const [code, setCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [checking, setChecking] = useState(false);

  // État du tableau de bord de validation
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'governance'
  const [validations, setValidations] = useState({ sections: {}, comments: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const defaultSignatory = useMemo(() => {
    const list = cfg.signatories || [];
    if (activeRole === 'team') {
      return list.find((s) => s.group === 'team')?.id || list[0]?.id || 'magda';
    }
    return list.find((s) => s.group === 'professor')?.id || list[0]?.id || 'yannick';
  }, [activeRole]);

  const [signatoryId, setSignatoryId] = useState(defaultSignatory);
  const [commentSectionId, setCommentSectionId] = useState('general');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    setSignatoryId(defaultSignatory);
  }, [defaultSignatory]);

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [lockedUntil]);

  const refreshValidations = useCallback(async () => {
    if (!unlocked) return;
    setLoading(true);
    const data = await storage.fetchValidations();
    setValidations(data || { sections: {}, comments: [] });
    setLoading(false);
  }, [unlocked]);

  useEffect(() => {
    if (validationModalOpen && unlocked) {
      refreshValidations();
    }
  }, [validationModalOpen, unlocked, refreshValidations]);

  useEffect(() => {
    if (!validationModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeValidationModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [validationModalOpen, closeValidationModal]);

  if (!validationModalOpen) return null;

  const locked = lockedUntil > now;
  const activeSignatory =
    (cfg.signatories || []).find((s) => s.id === signatoryId) || cfg.signatories?.[0] || {
      name: "Yannick ARGOUARC'H",
      role: 'Référent ENSTA',
    };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (locked || !code.trim()) return;
    setChecking(true);
    const res = await loginReviewer(code);
    setChecking(false);

    if (res.ok) {
      setCode('');
      setAuthError('');
      setAttempts(0);
      return;
    }

    setCode('');
    if (res.locked) {
      const waitSec = res.remainingSec || LOCK_SECONDS;
      setLockedUntil(Date.now() + waitSec * 1000);
      setNow(Date.now());
      setAttempts(0);
      setAuthError(`Trop de tentatives. Réessayez dans ${waitSec} secondes.`);
      return;
    }

    const nextAttempts = attempts + 1;
    if (nextAttempts >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
      setNow(Date.now());
      setAttempts(0);
      setAuthError(`Trop de tentatives. Pause de sécurité de ${LOCK_SECONDS} secondes.`);
    } else {
      setAttempts(nextAttempts);
      setAuthError(res.error || 'Code non reconnu.');
    }
  };

  const handleStatusChange = async (sectionId, status) => {
    setSaving(true);
    const next = await storage.setSectionValidationStatus({
      sectionId,
      status,
      author: activeSignatory.name,
      roleLabel: activeSignatory.role,
    });
    setValidations(next);
    setSaving(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSaving(true);
    const currentSecStatus = validations.sections?.[commentSectionId]?.status || null;
    const next = await storage.addValidationComment({
      sectionId: commentSectionId,
      author: activeSignatory.name,
      roleLabel: activeSignatory.role,
      text: commentText.trim(),
      statusAtPost: currentSecStatus,
    });
    setValidations(next);
    setCommentText('');
    setSaving(false);
  };

  const handleDeleteComment = async (commentId) => {
    setSaving(true);
    const next = await storage.deleteValidationComment(commentId);
    setValidations(next);
    setSaving(false);
  };

  const validatedCount = (cfg.sections || []).filter(
    (s) => (validations.sections?.[s.id]?.status || 'pending') === 'validated',
  ).length;
  const adjustCount = (cfg.sections || []).filter(
    (s) => (validations.sections?.[s.id]?.status || 'pending') === 'adjust',
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reviewer-modal-title"
      onClick={closeValidationModal}
    >
      <div
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-700/90 bg-slate-900 shadow-2xl ${
          unlocked ? 'max-w-5xl' : 'max-w-md'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <Icon name={unlocked ? 'UserCheck' : 'Lock'} size={20} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="reviewer-modal-title" className="font-display text-lg font-bold text-white sm:text-xl">
                  {cfg.title}
                </h2>
                {unlocked && (
                  <Badge tone={activeRole === 'team' ? 'info' : 'good'}>
                    {activeRole === 'team' ? 'Accès Équipe Projet 6.1' : 'Accès Professeur / Référents ENSTA'}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {unlocked
                  ? 'Validation des sections en temps réel sur le serveur du PC & déverrouillage du mode Équipe.'
                  : 'Espace réservé aux référents ENSTA Bretagne et aux membres de l’équipe projet R2A.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeValidationModal}
            className="btn-ghost p-2"
            aria-label="Fermer la fenêtre de validation"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* CORPS 1 : FORMULAIRE DE CODE MASQUÉ (ZÉRO MOT DE PASSE EXPOSÉ) */}
        {!unlocked ? (
          <form onSubmit={handleLogin} className="space-y-4 p-6 sm:p-7">
            <div>
              <label htmlFor="reviewer-secret-code" className="label">
                Code d&apos;accès Professeur ou Équipe
              </label>
              <input
                id="reviewer-secret-code"
                type="password"
                autoFocus
                autoComplete="off"
                className="input"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setAuthError('');
                }}
                disabled={locked || checking}
                aria-invalid={Boolean(authError || locked)}
              />
              {(authError || locked) && (
                <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                  <Icon name="AlertTriangle" size={14} className="shrink-0" />
                  <span>
                    {locked
                      ? `Protection anti-bruteforce active : réessayez dans ${Math.ceil((lockedUntil - now) / 1000)} s.`
                      : authError}
                  </span>
                </p>
              )}
            </div>

            <p className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-relaxed text-slate-400">
              Déverrouille la grille de validation des 6 sections, le fil de consignes horodatées, la gouvernance{' '}
              <strong className="text-slate-200">Projet 6.1 &amp; Gantt</strong> ainsi que les outils internes de la
              présentation.
            </p>

            <div className="flex gap-2.5 pt-1">
              <button type="button" onClick={closeValidationModal} className="btn-ghost flex-1">
                Annuler
              </button>
              <button type="submit" disabled={locked || checking || !code.trim()} className="btn-primary flex-1">
                <Icon name="Unlock" size={15} />
                <span>{checking ? 'Vérification…' : 'Déverrouiller'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* CORPS 2 : TABLEAU DE BORD DE VALIDATION EN LIGNE + GOUVERNANCE PROJET 6.1 */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Barre de contrôle : Signataire actif + Progression + Onglets */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/65 px-5 py-3.5 sm:px-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <label htmlFor="signatory-select" className="font-mono text-xs font-semibold text-amber-400">
                  Signataire actif :
                </label>
                <select
                  id="signatory-select"
                  className="input w-auto py-1.5 text-xs font-semibold"
                  value={signatoryId}
                  onChange={(e) => setSignatoryId(e.target.value)}
                >
                  {(cfg.signatories || []).map((sig) => (
                    <option key={sig.id} value={sig.id}>
                      {sig.name} — {sig.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="good">
                  {validatedCount} / {cfg.sections.length} Validées ✅
                </Badge>
                {adjustCount > 0 && <Badge tone="warn">{adjustCount} À ajuster 🛠️</Badge>}
                <button
                  type="button"
                  onClick={refreshValidations}
                  disabled={loading}
                  className="btn-ghost border border-slate-800 px-2.5 py-1.5 text-xs"
                >
                  <Icon name="RefreshCw" size={13} className={loading ? 'animate-spin text-amber-400' : 'text-amber-400'} />
                  <span>Actualiser</span>
                </button>
                {isReviewerAuthed && (
                  <button
                    type="button"
                    onClick={() => {
                      logoutReviewer();
                      closeValidationModal();
                    }}
                    className="btn-ghost border border-slate-800 px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-300"
                  >
                    <Icon name="LogOut" size={13} />
                    <span>Verrouiller mode client</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sous-onglets : 1. Validation & Consignes | 2. Gouvernance Projet 6.1 & Planning Gantt */}
            <div className="flex gap-1 border-b border-slate-800 bg-slate-900 px-5 pt-2 sm:px-7" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'sections'}
                onClick={() => setActiveTab('sections')}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
                  activeTab === 'sections'
                    ? 'border-amber-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon name="FileCheck" size={16} className="text-amber-400" />
                <span>Validation des 6 Sections &amp; Consignes ({validations.comments?.length || 0})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'governance'}
                onClick={() => setActiveTab('governance')}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
                  activeTab === 'governance'
                    ? 'border-amber-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon name="Users" size={16} className="text-emerald-400" />
                <span>Gouvernance Projet 6.1 &amp; Planning Gantt</span>
              </button>
            </div>

            {/* Contenu défilant */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              {activeTab === 'sections' ? (
                <div className="space-y-7">
                  {/* Grille des 6 sections à valider individuellement */}
                  <div className="grid gap-3.5 md:grid-cols-2">
                    {cfg.sections.map((sec) => {
                      const entry = validations.sections?.[sec.id] || { status: 'pending' };
                      const currentStatus = entry.status || 'pending';

                      return (
                        <div
                          key={sec.id}
                          className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/75 p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-amber-400">
                                <Icon name={sec.icon || 'FileText'} size={15} />
                              </span>
                              <div>
                                <h3 className="font-display text-sm font-bold text-white">{sec.label}</h3>
                                {entry.updatedAt ? (
                                  <p className="font-mono text-[10px] text-slate-400">
                                    Par <strong className="text-slate-200">{entry.updatedBy}</strong> ·{' '}
                                    {fmtDate(entry.updatedAt)}
                                  </p>
                                ) : (
                                  <p className="font-mono text-[10px] text-slate-500">Aucun visa enregistré</p>
                                )}
                              </div>
                            </div>

                            {onNavigateSection && sec.targetId && (
                              <button
                                type="button"
                                onClick={() => {
                                  closeValidationModal();
                                  onNavigateSection(sec.targetId);
                                }}
                                className="text-xs font-semibold text-amber-400 hover:underline"
                              >
                                Inspecter →
                              </button>
                            )}
                          </div>

                          {/* 3 boutons de statut : Validé / À ajuster / En attente */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {['validated', 'adjust', 'pending'].map((st) => {
                              const active = currentStatus === st;
                              const meta = STATUS_STYLES[st];
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  disabled={saving}
                                  onClick={() => handleStatusChange(sec.id, st)}
                                  className={`rounded-xl border px-2 py-2 text-center text-[11px] transition ${
                                    active ? meta.pillActive : meta.pillIdle
                                  }`}
                                >
                                  {meta.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Formulaire d'ajout de commentaire / consigne de modification horodatée */}
                  <Card className="border-amber-500/30 bg-slate-950/70 p-5">
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-white">
                      <Icon name="MessageSquare" size={17} className="text-amber-400" />
                      <span>Ajouter un commentaire ou une consigne de modification horodatée</span>
                    </h3>
                    <form onSubmit={handleAddComment} className="mt-3.5 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor="comment-section" className="label text-xs">
                            Section concernée
                          </label>
                          <select
                            id="comment-section"
                            className="input text-xs"
                            value={commentSectionId}
                            onChange={(e) => setCommentSectionId(e.target.value)}
                          >
                            <option value="general">Général — Ensemble du portail R2A</option>
                            {cfg.sections.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="comment-author-readonly" className="label text-xs">
                            Signataire enregistré
                          </label>
                          <input
                            id="comment-author-readonly"
                            type="text"
                            readOnly
                            className="input bg-slate-900/60 text-xs text-slate-300"
                            value={`${activeSignatory.name} (${activeSignatory.role})`}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="validation-comment-input" className="label text-xs">
                          Commentaire, validation ou consigne d&apos;ajustement
                        </label>
                        <textarea
                          id="validation-comment-input"
                          rows={3}
                          className="input text-sm"
                          placeholder="Saisissez votre remarque technique, validation ou consigne pour l'équipe..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving || !commentText.trim()}
                          className="btn-primary py-2 text-xs"
                        >
                          <Icon name="Check" size={15} />
                          <span>Enregistrer la consigne horodatée sur le serveur</span>
                        </button>
                      </div>
                    </form>
                  </Card>

                  {/* Historique des commentaires horodatés */}
                  <div className="space-y-3">
                    <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Journal des validations &amp; consignes ({validations.comments?.length || 0})
                    </h4>
                    {!validations.comments?.length ? (
                      <p className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs text-slate-400">
                        Aucun commentaire enregistré pour le moment. Les validations et consignes saisies ici sont
                        sauvegardées en temps réel dans <code className="font-mono text-amber-300">./data/ensta-r2a-database.json</code>.
                      </p>
                    ) : (
                      <ul className="space-y-2.5">
                        {validations.comments.map((c) => {
                          const secLabel =
                            c.sectionId === 'general'
                              ? 'Général'
                              : cfg.sections.find((s) => s.id === c.sectionId)?.label || c.sectionId;
                          return (
                            <li
                              key={c.id}
                              className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-display font-bold text-white">{c.author}</span>
                                  {c.roleLabel && (
                                    <span className="text-xs text-slate-400">· {c.roleLabel}</span>
                                  )}
                                  <Badge tone="info">{secLabel}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[11px] text-slate-400">
                                    {fmtDate(c.createdAt)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-slate-500 transition hover:text-red-400"
                                    aria-label="Supprimer ce commentaire"
                                  >
                                    <Icon name="Trash2" size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-200">
                                {c.text}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                /* ONGLET 2 : GOUVERNANCE PROJET 6.1 & PLANNING GANTT (CACHÉ AUX CLIENTS) */
                <div className="space-y-7">
                  <div className="rounded-2xl border border-amber-500/25 bg-slate-950/75 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-400">
                        {academic.problematic.label}
                      </p>
                      <Badge tone="info">Confidentiel Équipe &amp; Référents ENSTA</Badge>
                    </div>
                    <blockquote className="mt-2 font-display text-lg font-bold leading-snug text-white sm:text-xl">
                      {academic.problematic.question}
                    </blockquote>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {academic.problematic.pillars.map((p, idx) => (
                        <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                          <span className="font-mono text-[11px] font-bold text-amber-400">0{idx + 1}</span>
                          <p className="mt-1 font-display text-sm font-bold text-white">{p.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">{p.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Répartition par Lots — Équipe Projet 6.1 ENSTA Bretagne
                    </p>
                    <div className="grid gap-4 lg:grid-cols-3">
                      {academic.lots.map((lot) => (
                        <div key={lot.id} className="rounded-2xl border border-slate-800 bg-slate-950/75 p-5">
                          <div className="flex items-center justify-between gap-2">
                            <Badge tone="warn">{lot.code}</Badge>
                            <span className="font-display text-sm font-bold text-white">{lot.owner}</span>
                          </div>
                          <h5 className="mt-3 font-display text-base font-bold text-slate-100">{lot.title}</h5>
                          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-400">
                            {lot.items.map((it) => (
                              <li key={it} className="flex gap-2">
                                <span className="text-amber-400">•</span>
                                <span>{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Planning Gantt de Déploiement (Octobre 2026 → Mars 2027)
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {academic.gantt.map((g) => {
                        const tone = g.status === 'done' ? 'good' : g.status === 'active' ? 'warn' : 'slate';
                        const statusLabel =
                          g.status === 'done' ? 'Réalisé' : g.status === 'active' ? 'En cours' : 'Planifié';
                        return (
                          <div key={g.period} className="rounded-xl border border-slate-800 bg-slate-950/75 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-amber-300">{g.period}</span>
                              <Badge tone={tone}>{statusLabel}</Badge>
                            </div>
                            <p className="mt-2 font-display text-sm font-semibold text-white">{g.phase}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

