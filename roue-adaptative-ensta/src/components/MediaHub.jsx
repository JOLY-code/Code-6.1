import { useEffect, useMemo, useRef, useState } from 'react';
import projectData from '../config/projectData.js';
import { useSector } from '../context/SectorContext.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { resolveAssetUrl } from '../utils/assetUrl.js';
import { triggerDownload } from '../utils/pdfGenerator.js';
import PitchDeckViewer from './PitchDeckViewer.jsx';
import Icon from './ui/Icon.jsx';
import { Badge, Card, Section } from './ui/Primitives.jsx';

const cfg = projectData.mediaHub;

/* Poster SVG neutre haute résolution encodé en data-URI pour l'attribut poster="..." du <video> */
function buildPosterDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#05080f"/>
        <stop offset="55%" stop-color="#0b1324"/>
        <stop offset="100%" stop-color="#070b14"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <line x1="120" y1="560" x2="1160" y2="560" stroke="#334155" stroke-width="3"/>
    <polygon points="780,560 825,492 915,492 955,560" fill="#b45309" opacity="0.85"/>
    <rect x="650" y="376" width="68" height="184" rx="18" fill="#0f172a" stroke="#34d399" stroke-width="4"/>
    <rect x="836" y="308" width="68" height="184" rx="18" fill="#0f172a" stroke="#34d399" stroke-width="4"/>
    <line x1="684" y1="468" x2="870" y2="400" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>
    <circle cx="777" cy="434" r="18" fill="#f59e0b"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* Modale d'aperçu PDF intégré (Data Room officielle /Plaquette/ FR & US) */
function PdfPreviewModal({ preview, isPrivileged, onClose, onDownload }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!preview) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={preview.badgeTone || 'info'}>{preview.badge}</Badge>
              <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-300">
                {preview.langLabel}
              </span>
            </div>
            <h3 id="pdf-modal-title" className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
              {preview.title}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost p-2" aria-label="Fermer l'aperçu">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-4">
          {preview.url && (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              <iframe title={preview.title} src={preview.url} className="h-[58vh] w-full" />
            </div>
          )}

          {preview.summary && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
                Synthèse de la plaquette officielle ENSTA Bretagne
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{preview.summary}</p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <span className="font-mono text-xs text-slate-400">
            {isPrivileged ? preview.filename : 'Plaquette officielle R2A · ENSTA Bretagne'}
          </span>
          <div className="flex flex-wrap gap-2.5">
            {preview.url && (
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-2 text-xs"
              >
                <Icon name="ExternalLink" size={14} />
                <span>Ouvrir dans un nouvel onglet</span>
              </a>
            )}
            <button type="button" onClick={() => onDownload(preview)} className="btn-primary py-2 text-xs">
              <Icon name="Download" size={15} />
              <span>Télécharger le PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MediaHub() {
  const { sector } = useSector();
  const { isPrivileged } = useSecurity();
  const header = cfg.headerBySector[sector.id] || cfg.headerBySector.agri;
  const playlist = useMemo(() => cfg.videosBySector[sector.id] || [], [sector.id]);
  const pitchDeck = cfg.pitchDeckBySector[sector.id] || cfg.pitchDeckBySector.agri;
  const sectorPlaquettes = cfg.plaquettes.bySector[sector.id] || [];

  const [selectedVideoId, setSelectedVideoId] = useState(() => playlist[0]?.id || '');
  const [useFallbackPath, setUseFallbackPath] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(() => playlist[0]?.chapters?.[0]?.id || '');
  const [localVideo, setLocalVideo] = useState(null); // { url, name }
  const [draggingVideo, setDraggingVideo] = useState(false);

  const [pdfLang, setPdfLang] = useState('fr'); // 'fr' | 'us'
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const [customPdfsBySector, setCustomPdfsBySector] = useState({}); // { [sectorId]: [{ id, title, url, filename }] }
  const [previewPdf, setPreviewPdf] = useState(null);

  const videoRef = useRef(null);
  const videoInputRef = useRef(null);
  const addPdfInputRef = useRef(null);
  const posterUri = useMemo(() => buildPosterDataUri(), []);

  // Réinitialisation propre de la playlist lorsqu'on change de secteur
  useEffect(() => {
    const first = playlist[0];
    setSelectedVideoId(first?.id || '');
    setUseFallbackPath(false);
    setPlaybackFailed(false);
    setActiveChapterId(first?.chapters?.[0]?.id || '');
    setLocalVideo((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, [sector.id, playlist]);

  // Nettoyage mémoire au démontage
  useEffect(
    () => () => {
      if (localVideo?.url) URL.revokeObjectURL(localVideo.url);
    },
    [localVideo],
  );

  const activeVideo = playlist.find((v) => v.id === selectedVideoId) || playlist[0];
  const chapters = activeVideo?.chapters || [];
  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0] || null;

  const isYouTube = Boolean(
    !localVideo &&
      activeVideo &&
      (String(activeVideo.url || activeVideo.src || '').includes('youtube.com') ||
        String(activeVideo.url || activeVideo.src || '').includes('youtu.be')),
  );

  const isNativeContainer = Boolean(
    !localVideo &&
      !isYouTube &&
      activeVideo &&
      (activeVideo.nativeFormat || /\.(mts|mov)$/i.test(activeVideo.src || '')),
  );

  const primaryResolvedSrc = activeVideo ? resolveAssetUrl(activeVideo.url || activeVideo.src) : '';
  const fallbackResolvedSrc = activeVideo?.fallbackSrc ? resolveAssetUrl(activeVideo.fallbackSrc) : '';
  const effectiveVideoSrc =
    localVideo?.url || (useFallbackPath && fallbackResolvedSrc ? fallbackResolvedSrc : primaryResolvedSrc);
  const [youtubeTimestamp, setYoutubeTimestamp] = useState(0);

  const baseYoutubeUrl = activeVideo?.url || activeVideo?.src || effectiveVideoSrc;
  const iframeSrc =
    youtubeTimestamp > 0
      ? `${baseYoutubeUrl}${baseYoutubeUrl.includes('?') ? '&' : '?'}start=${youtubeTimestamp}&autoplay=1`
      : baseYoutubeUrl;

  const selectVideo = (vid) => {
    setSelectedVideoId(vid.id);
    setUseFallbackPath(false);
    setPlaybackFailed(false);
    setYoutubeTimestamp(0);
    setActiveChapterId(vid.chapters?.[0]?.id || '');
    if (localVideo?.url) {
      URL.revokeObjectURL(localVideo.url);
      setLocalVideo(null);
    }
  };

  const handleVideoError = () => {
    if (!localVideo && !useFallbackPath && fallbackResolvedSrc && fallbackResolvedSrc !== primaryResolvedSrc) {
      setUseFallbackPath(true);
      return;
    }
    setPlaybackFailed(true);
  };

  const handleVideoFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPlaybackFailed(false);
    setLocalVideo((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return { url, name: file.name };
    });
  };

  const seekToChapter = (ch) => {
    setActiveChapterId(ch.id);
    if (isYouTube) {
      setYoutubeTimestamp(ch.seconds);
      return;
    }
    if (videoRef.current && effectiveVideoSrc && !playbackFailed) {
      try {
        videoRef.current.currentTime = ch.seconds;
        const p = videoRef.current.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch {
        /* ignore avant métadonnées */
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !chapters.length) return;
    const t = videoRef.current.currentTime;
    let current = chapters[0];
    chapters.forEach((ch) => {
      if (t >= ch.seconds) current = ch;
    });
    if (current && current.id !== activeChapterId) {
      setActiveChapterId(current.id);
    }
  };

  const handleAddCustomPdf = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ');
    const entry = {
      id: `custom-${Date.now()}`,
      title: cleanTitle,
      badge: `Document ajouté · ${sector.label}`,
      badgeTone: 'info',
      summary: `Document PDF importé en session pour la filière ${sector.label}.`,
      url,
      filename: file.name,
      isCustom: true,
    };
    setCustomPdfsBySector((prev) => ({
      ...prev,
      [sector.id]: [...(prev[sector.id] || []), entry],
    }));
  };

  const buildPlaquetteActionPayload = (doc, forceLang) => {
    if (doc.isCustom) {
      return {
        title: doc.title,
        badge: doc.badge,
        badgeTone: doc.badgeTone || 'info',
        summary: doc.summary,
        url: doc.url,
        filename: doc.filename,
        langLabel: 'PDF Local',
      };
    }
    const langKey = forceLang || pdfLang;
    const rawPath = doc.files?.[langKey] || doc[langKey];
    const filename =
      doc.filenames?.[langKey] ||
      (rawPath ? rawPath.split('/').pop() : `${doc.code || 'plaquette'}-${langKey}.pdf`);
    return {
      title: doc.title,
      badge: doc.badge || `Plaquette R2A ${doc.code || ''}`,
      badgeTone: doc.badgeTone || 'good',
      summary: doc.summary || '',
      url: resolveAssetUrl(rawPath),
      filename,
      langLabel: langKey === 'us' ? 'EN · English (US)' : 'FR · Français',
    };
  };

  const handleDownloadPayload = (payload) => {
    if (!payload?.url) return;
    triggerDownload(payload.url, payload.filename);
  };

  const customSectorPdfs = customPdfsBySector[sector.id] || [];
  const mp4Alternatives = playlist.filter((v) => v.id !== activeVideo?.id && /\.mp4$/i.test(v.src || ''));

  return (
    <Section id="demo" eyebrow={header.eyebrow} eyebrowIcon="Film" title={header.title} subtitle={header.subtitle}>
      <div className="space-y-12">
        {/* ================= 2.1 LECTEUR & PLAYLIST VIDÉO PAR SECTEUR (/Video/) ================= */}
        <Card className="p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                {activeVideo && <Badge tone="good">{activeVideo.badge}</Badge>}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-mono text-xs font-semibold"
                  style={{ borderColor: `${sector.color}55`, color: sector.color }}
                >
                  <Icon name={sector.icon} size={13} />
                  <span>
                    Playlist {sector.label} ({playlist.length} vidéo{playlist.length > 1 ? 's' : ''})
                  </span>
                </span>
                {localVideo && (
                  <Badge tone="info">
                    <Icon name="Film" size={12} /> Fichier local : {localVideo.name}
                  </Badge>
                )}
              </div>
              <h3 className="mt-2.5 font-display text-2xl font-bold text-white">
                {localVideo ? localVideo.name : activeVideo?.title}
              </h3>
              {activeVideo?.description && (
                <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-300">{activeVideo.description}</p>
              )}
            </div>

            {isPrivileged ? (
              <div className="flex flex-wrap items-center gap-2">
                {isYouTube ? (
                  <a
                    href={(activeVideo?.url || activeVideo?.src || '').replace('/embed/', '/watch?v=')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary py-2 text-xs"
                    title="Ouvrir la vidéo sur YouTube dans un nouvel onglet"
                  >
                    <Icon name="ExternalLink" size={14} className="text-red-400" />
                    <span>Ouvrir sur YouTube</span>
                  </a>
                ) : (
                  primaryResolvedSrc && !localVideo && (
                    <a
                      href={primaryResolvedSrc}
                      download
                      className="btn-secondary py-2 text-xs"
                      title="Télécharger le fichier vidéo original"
                    >
                      <Icon name="Download" size={14} className="text-emerald-400" />
                      <span>Télécharger la vidéo</span>
                    </a>
                  )
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  className="sr-only"
                  onChange={(e) => {
                    handleVideoFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="btn-secondary py-2 text-xs"
                >
                  <Icon name="Upload" size={14} className="text-amber-400" />
                  <span>{cfg.loadButtonLabel}</span>
                </button>
                {localVideo && (
                  <button
                    type="button"
                    onClick={() => setLocalVideo(null)}
                    className="btn-ghost py-2 text-xs text-slate-400"
                    title="Revenir à la vidéo officielle du serveur"
                  >
                    <Icon name="RotateCcw" size={14} />
                  </button>
                )}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[11px] font-semibold text-emerald-300">
                <Icon name="ShieldCheck" size={13} />
                <span>Consultation protégée · ENSTA Bretagne</span>
              </span>
            )}
          </div>

          {/* Bandeau d'information discret pour les formats natifs caméra (.MTS / .mov) */}
          {isNativeContainer && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
              <div className="flex items-start gap-2.5">
                <Icon name="Info" size={16} className="mt-0.5 shrink-0 text-amber-400" />
                <span>
                  {isPrivileged
                    ? cfg.nativeVideoNotice
                    : 'Format vidéo natif banc d’essai ENSTA (.MTS). Si votre navigateur ne décode pas ce flux directement, sélectionnez une démonstration .MP4 dans la playlist ci-contre.'}
                </span>
              </div>
              {isPrivileged && primaryResolvedSrc && (
                <a href={primaryResolvedSrc} download className="font-semibold text-amber-300 underline hover:text-white">
                  Télécharger ({activeVideo.src.split('/').pop()})
                </a>
              )}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.45fr_1fr]">
            {/* Zone lecteur vidéo 16:9 */}
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  if (!isPrivileged) return;
                  e.preventDefault();
                  setDraggingVideo(true);
                }}
                onDragLeave={() => {
                  if (!isPrivileged) return;
                  setDraggingVideo(false);
                }}
                onDrop={(e) => {
                  if (!isPrivileged) return;
                  e.preventDefault();
                  setDraggingVideo(false);
                  const file = e.dataTransfer?.files?.[0];
                  if (file) handleVideoFile(file);
                }}
                onContextMenu={(e) => e.preventDefault()}
                className={`relative overflow-hidden rounded-2xl border bg-slate-950 transition ${
                  draggingVideo ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800'
                }`}
              >
                {isYouTube ? (
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
                    <iframe
                      key={iframeSrc}
                      src={iframeSrc}
                      title={activeVideo?.title || 'Démonstration R2A ENSTA'}
                      className="h-full w-full rounded-2xl border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : !playbackFailed ? (
                  <video
                    key={effectiveVideoSrc}
                    ref={videoRef}
                    controls
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    playsInline
                    preload="metadata"
                    poster={posterUri}
                    src={effectiveVideoSrc || undefined}
                    onTimeUpdate={handleTimeUpdate}
                    onError={handleVideoError}
                    className="aspect-video w-full select-none bg-black object-contain"
                  >
                    Votre navigateur ne prend pas en charge la lecture directe de ce conteneur vidéo.
                  </video>
                ) : (
                  <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-400">
                      <Icon name="Film" size={24} />
                    </span>
                    <div className="max-w-lg">
                      <p className="font-display text-base font-bold text-white">
                        Conteneur vidéo natif ({activeVideo?.src?.split('.').pop()?.toUpperCase()}) non décodé directement par ce navigateur
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                        {isPrivileged
                          ? 'Téléchargez le fichier original pour le lire avec VLC / Lecteur Windows, chargez une version convertie en .mp4 ou sélectionnez une autre vidéo .mp4 de la playlist ci-contre.'
                          : 'Ce flux brut issu des caméras d’essais ENSTA requiert un décodeur spécifique. Sélectionnez une démonstration native .MP4 dans la playlist ci-contre.'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      {isPrivileged && primaryResolvedSrc && (
                        <a href={primaryResolvedSrc} download className="btn-primary py-2 text-xs">
                          <Icon name="Download" size={15} />
                          <span>Télécharger le fichier original</span>
                        </a>
                      )}
                      {isPrivileged && (
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="btn-secondary py-2 text-xs"
                        >
                          <Icon name="Upload" size={14} />
                          <span>Charger une version .mp4</span>
                        </button>
                      )}
                      {mp4Alternatives[0] && (
                        <button
                          type="button"
                          onClick={() => selectVideo(mp4Alternatives[0])}
                          className="btn-secondary py-2 text-xs"
                        >
                          <Icon name="Play" size={14} className="text-emerald-400" />
                          <span>Lire une démo .mp4 de la filière</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Chapitrage temporel rapide lorsque la vidéo active possède des chapitres */}
              {chapters.length > 0 && (
                <div className="rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Chapitrage temporel de la démonstration
                    </span>
                    {activeChapter && (
                      <span className="font-mono text-xs font-semibold text-emerald-400">
                        {activeChapter.time} · {activeChapter.metric}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {chapters.map((ch) => {
                      const active = ch.id === activeChapter?.id;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => seekToChapter(ch)}
                          className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                            active
                              ? 'border-amber-500/60 bg-amber-500/10 text-white'
                              : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-bold ${
                              active ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                            }`}
                          >
                            {ch.time}
                          </span>
                          <span className="truncate text-xs font-medium">{ch.title}</span>
                        </button>
                      );
                    })}
                  </div>
                  {activeChapter?.detail && (
                    <p className="mt-3 border-t border-slate-800/80 pt-2.5 text-xs leading-relaxed text-slate-300">
                      <strong className="text-emerald-300">Observation ({activeChapter.time}) :</strong> {activeChapter.detail}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sélecteur de Playlist Vidéo de la filière active */}
            <div className="flex flex-col justify-between gap-4">
              <div>
                <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Vidéos disponibles · Filière {sector.label}
                </p>
                <div className="space-y-2.5">
                  {playlist.map((vid, idx) => {
                    const active = vid.id === activeVideo?.id && !localVideo;
                    const isVidYouTube = Boolean(
                      (vid.src || vid.url || '').includes('youtube.com') ||
                      (vid.src || vid.url || '').includes('youtu.be')
                    );
                    const ext = isVidYouTube
                      ? 'YouTube HD'
                      : (vid.src.split('.').pop() || 'mp4').toUpperCase();
                    return (
                      <button
                        key={vid.id}
                        type="button"
                        onClick={() => selectVideo(vid)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                          active
                            ? 'border-amber-500/65 bg-amber-500/10 text-white shadow-sm'
                            : 'border-slate-800/90 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold ${
                            active ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                          }`}
                        >
                          {active ? <Icon name="Play" size={14} /> : `0${idx + 1}`}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-mono text-[11px] font-semibold text-amber-300">
                              {vid.badge}
                            </span>
                            <span
                              className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                isVidYouTube
                                  ? 'border border-red-500/30 bg-red-500/15 text-red-300'
                                  : ext === 'MP4'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {ext}
                            </span>
                          </div>
                          <p className="mt-1 font-display text-sm font-bold leading-snug text-white">
                            {vid.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs leading-relaxed text-slate-400">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Source média officielle ENSTA Bretagne
                </p>
                {isPrivileged ? (
                  <p className="mt-1">
                    Fichier actif :{' '}
                    <code className="font-mono text-amber-300">
                      {localVideo ? localVideo.name : activeVideo?.src}
                    </code>
                  </p>
                ) : (
                  <p className="mt-1 text-slate-400">
                    Diffusion en lecture protégée (téléchargement désactivé · Propriété intellectuelle ENSTA Bretagne).
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ================= 2.2 PITCH DECK EXÉCUTIF 16:9 PAR SECTEUR ================= */}
        <PitchDeckViewer key={sector.id} deck={pitchDeck} />

        {/* ================= 2.3 DATA ROOM PLAQUETTES PDF OFFICIELLES (FR / US) ================= */}
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-400">
                {cfg.plaquettes.eyebrow} · Filière {sector.label}
              </p>
              <h3 className="mt-1.5 font-display text-2xl font-bold text-white">
                {cfg.plaquettes.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">{cfg.plaquettes.subtitle}</p>
            </div>

            {/* Sélecteur de langue FR / EN (US) + Ajout d'un PDF local réservé à l'équipe */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1"
                role="radiogroup"
                aria-label="Langue des plaquettes PDF"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={pdfLang === 'fr'}
                  onClick={() => setPdfLang('fr')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    pdfLang === 'fr'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  FR 🇫🇷 Français
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={pdfLang === 'us'}
                  onClick={() => setPdfLang('us')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    pdfLang === 'us'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  EN 🇺🇸 English (US)
                </button>
              </div>

              {isPrivileged && (
                <>
                  <input
                    ref={addPdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                      handleAddCustomPdf(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addPdfInputRef.current?.click()}
                    className="btn-secondary py-2 text-xs"
                  >
                    <Icon name="Plus" size={14} className="text-amber-400" />
                    <span>{cfg.plaquettes.addCustomLabel}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Cartes PDF filtrées pour le secteur actif (+ PDF ajoutés en session) */}
          <div
            className={`grid gap-6 ${
              sectorPlaquettes.length + customSectorPdfs.length === 1
                ? 'md:grid-cols-1 max-w-3xl'
                : sectorPlaquettes.length + customSectorPdfs.length >= 3
                  ? 'md:grid-cols-2 lg:grid-cols-3'
                  : 'md:grid-cols-2'
            }`}
          >
            {[...sectorPlaquettes, ...customSectorPdfs].map((doc) => {
              const payload = buildPlaquetteActionPayload(doc);
              return (
                <Card key={doc.id} className="flex flex-col justify-between p-6">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge tone={doc.badgeTone || 'good'}>{doc.badge}</Badge>
                      <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-300">
                        {payload.langLabel}
                      </span>
                    </div>

                    <div className="mt-4 flex items-start gap-3.5">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
                        <Icon name="FileText" size={20} />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-display text-lg font-bold leading-snug text-white">{doc.title}</h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{doc.summary}</p>
                        {isPrivileged && (
                          <p className="mt-2 truncate font-mono text-[11px] text-slate-500">
                            {payload.filename}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-slate-800/80 pt-4">
                    <button
                      type="button"
                      onClick={() => setPreviewPdf(payload)}
                      className="btn-secondary flex-1 py-2 text-xs"
                    >
                      <Icon name="Eye" size={15} />
                      <span>Aperçu PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPayload(payload)}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      <Icon name="Download" size={15} />
                      <span>Télécharger ({pdfLang.toUpperCase()})</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bouton discret : Afficher l'ensemble des 8 plaquettes du portefeuille R2A (Tous secteurs) */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAllPortfolio((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <Icon name="FolderOpen" size={15} className="text-amber-400" />
              <span>{showAllPortfolio ? cfg.plaquettes.hideAllLabel : cfg.plaquettes.showAllLabel}</span>
              <Icon name={showAllPortfolio ? 'ChevronUp' : 'ChevronDown'} size={15} />
            </button>

            {showAllPortfolio && (
              <Card className="mt-4 overflow-x-auto p-5">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="th">Réf.</th>
                      <th className="th">Plaquette officielle ENSTA Bretagne</th>
                      <th className="th">Filières</th>
                      <th className="th text-right">Version FR 🇫🇷</th>
                      <th className="th text-right">Version US 🇺🇸</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {cfg.plaquettes.allPortfolio.map((item) => {
                      const frPayload = buildPlaquetteActionPayload(item, 'fr');
                      const usPayload = buildPlaquetteActionPayload(item, 'us');
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30">
                          <td className="td font-mono text-xs font-bold text-amber-400">{item.code}</td>
                          <td className="td font-medium text-white">{item.title}</td>
                          <td className="td text-xs text-slate-400">{item.sectorTag}</td>
                          <td className="td whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => setPreviewPdf(frPayload)}
                              className="mr-2 text-xs font-semibold text-slate-300 hover:text-white"
                            >
                              Aperçu
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPayload(frPayload)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-slate-700"
                            >
                              <Icon name="Download" size={12} /> FR
                            </button>
                          </td>
                          <td className="td whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => setPreviewPdf(usPayload)}
                              className="mr-2 text-xs font-semibold text-slate-300 hover:text-white"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPayload(usPayload)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-sky-300 hover:bg-slate-700"
                            >
                              <Icon name="Download" size={12} /> US
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        </div>
      </div>

      <PdfPreviewModal
        preview={previewPdf}
        isPrivileged={isPrivileged}
        onClose={() => setPreviewPdf(null)}
        onDownload={handleDownloadPayload}
      />
    </Section>
  );
}
