import { useEffect, useMemo, useRef, useState } from 'react';
import projectData from '../../config/projectData.js';
import storage from '../../services/storageService.js';
import { buildQrSvgPath } from '../../utils/qrCodeSvg.js';
import { fmtDate } from '../../utils/format.js';
import Icon from '../ui/Icon.jsx';
import { Badge, Card } from '../ui/Primitives.jsx';

const TUNNEL_HOST_RE = /(trycloudflare\.com|ngrok(-free)?\.app|ngrok\.io|loca\.lt|cloudflare|vercel\.app|netlify\.app)$/i;
const LAN_IP_RE = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

function normalizeBaseUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  return s.replace(/\/+$/, '');
}

function QrLinkCard({ badge, badgeTone = 'good', title, description, url, onCopy, copied }) {
  const qr = useMemo(() => {
    try {
      return buildQrSvgPath(url, 3);
    } catch {
      return null;
    }
  }, [url]);

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={badgeTone}>{badge}</Badge>
        </div>
        <h4 className="font-display text-base font-bold text-white">{title}</h4>
        <p className="text-xs leading-relaxed text-slate-400">{description}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <code className="block max-w-full truncate rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-mono text-[11px] text-amber-300">
            {url}
          </code>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" onClick={onCopy} className="btn-secondary py-1.5 text-xs">
            <Icon name={copied ? 'Check' : 'Copy'} size={14} className={copied ? 'text-emerald-400' : 'text-amber-400'} />
            <span>{copied ? 'Lien copié !' : 'Copier le lien en 1 clic'}</span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost border border-slate-800 py-1.5 text-xs"
          >
            <Icon name="ExternalLink" size={14} />
            <span>Tester</span>
          </a>
        </div>
      </div>

      {qr && (
        <div className="flex shrink-0 flex-col items-center gap-1.5 self-center">
          <div className="rounded-xl bg-white p-2 shadow-md ring-1 ring-slate-200">
            <svg
              viewBox={`0 0 ${qr.viewBoxSize} ${qr.viewBoxSize}`}
              width="128"
              height="128"
              shapeRendering="crispEdges"
              role="img"
              aria-label={`QR Code pour ${title}`}
            >
              <rect width={qr.viewBoxSize} height={qr.viewBoxSize} fill="#ffffff" />
              <path d={qr.pathD} fill="#05080f" />
            </svg>
          </div>
          <span className="font-mono text-[10px] text-slate-500">Scanner (4G / 5G / Wi-Fi)</span>
        </div>
      )}
    </div>
  );
}

export default function DataPanel({ responses, contacts, syncState, onSyncCloud, onChanged }) {
  const fileRef = useRef(null);
  const [mode, setMode] = useState('merge');
  const [message, setMessage] = useState(null); // { tone, text }

  const currentSync = syncState || storage.getSyncState();
  const [publicUrlDraft, setPublicUrlDraft] = useState(() => storage.getPublicCloudUrl());
  const [serverInfo, setServerInfo] = useState(() => currentSync.serverInfo || null);
  const [cloudTunnelUrl, setCloudTunnelUrl] = useState('');
  const [shareSector, setShareSector] = useState(projectData.sectors[0].id);
  const [copiedKey, setCopiedKey] = useState('');

  // 1. Détection initiale du serveur local / réseau LAN
  useEffect(() => {
    let alive = true;
    const fetchInfo =
      typeof storage.fetchServerInfo === 'function'
        ? storage.fetchServerInfo()
        : typeof storage.fetchServerNetworkInfo === 'function'
          ? storage.fetchServerNetworkInfo()
          : Promise.resolve(null);

    fetchInfo
      .then((info) => {
        if (alive && info) setServerInfo(info);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  // 2. Polling régulier de l'URL Cloudflare Tunnel (/api/tunnel-url) toutes les 3s
  useEffect(() => {
    let alive = true;
    let timer = null;

    const queryTunnel = async () => {
      try {
        const res = await fetch('./api/tunnel-url', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (alive && data?.ok && data?.url) {
            const cleanUrl = normalizeBaseUrl(data.url);
            setCloudTunnelUrl((prev) => {
              if (prev !== cleanUrl) {
                // Met à jour automatiquement le draft d'affichage sans écraser une URL sur-mesure non-tunnel
                setPublicUrlDraft((draft) =>
                  !draft || draft.includes('trycloudflare') || draft === prev ? cleanUrl : draft,
                );
              }
              return cleanUrl;
            });
            return true;
          }
        }
      } catch {
        /* ignore fetch errors */
      }
      return false;
    };

    const poll = async () => {
      const found = await queryTunnel();
      if (alive) {
        timer = setTimeout(poll, found ? 10000 : 3000);
      }
    };

    poll();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const demoCount = responses.filter((r) => r.demo).length;
  const notify = (text, tone = 'good') => setMessage({ text, tone });

  const savedPublicUrl = normalizeBaseUrl(currentSync.publicCloudUrl || storage.getPublicCloudUrl());
  const isOffline = currentSync.status === 'offline';
  const isSyncing = currentSync.status === 'syncing';

  // Détection automatique de l'URL publique (Tunnel Cloudflare/ngrok/localtunnel) ou IP Wi-Fi LAN du PC (192.168.x.x)
  const detectedNetwork = useMemo(() => {
    const winOrigin =
      typeof window !== 'undefined'
        ? normalizeBaseUrl(`${window.location.origin}${window.location.pathname === '/' ? '' : window.location.pathname}`)
        : 'http://localhost:5173';
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const port =
      typeof window !== 'undefined' && window.location.port
        ? window.location.port
        : serverInfo?.port || '5173';

    const isBrowserOnTunnel = TUNNEL_HOST_RE.test(host) || (host !== 'localhost' && host !== '127.0.0.1' && !LAN_IP_RE.test(host));
    const isBrowserOnLan = LAN_IP_RE.test(host);
    const activeTunnel = cloudTunnelUrl || normalizeBaseUrl(serverInfo?.detectedTunnelUrl || serverInfo?.tunnelUrl || '');
    const lanIps = Array.isArray(serverInfo?.lanIps) ? serverInfo.lanIps : [];
    const preferredLanIp = lanIps.find((ip) => ip.startsWith('192.168.')) || lanIps[0] || '';
    const lanUrl = preferredLanIp ? `http://${preferredLanIp}:${port}` : '';
    const firebaseUrl = typeof storage.getFirebaseUrl === 'function' ? storage.getFirebaseUrl() : '';
    const isVercel = host.includes('vercel.app');

    // Priorité 0 : Déploiement Cloud 24/7 (Vercel ou nom de domaine de production avec Firebase)
    if (isVercel || (firebaseUrl && !activeTunnel && host !== 'localhost' && host !== '127.0.0.1')) {
      return {
        effectiveBase: winOrigin,
        sourceLabel: isVercel
          ? '🟢 Hébergement Cloud 24/7 Actif (Vercel + Firebase)'
          : '🟢 Base Cloud Firebase Connectée (24/7)',
        sourceTone: 'good',
        isVercel: true,
        cloudUrl: winOrigin,
        lanUrl,
        lanIps,
        serverTunnel: '',
        winOrigin,
      };
    }

    // Priorité 1 : Tunnel Cloudflare actif (détection automatique sans copier-coller)
    if (activeTunnel) {
      return {
        effectiveBase: activeTunnel,
        sourceLabel: '🟢 Tunnel Cloud Actif : QR Codes synchronisés',
        sourceTone: 'good',
        isCloudTunnel: true,
        cloudUrl: activeTunnel,
        lanUrl,
        lanIps,
        serverTunnel: activeTunnel,
        winOrigin,
      };
    }
    if (savedPublicUrl) {
      return {
        effectiveBase: savedPublicUrl,
        sourceLabel: 'URL Publique Cloud personnalisée',
        sourceTone: 'good',
        lanUrl,
        lanIps,
        serverTunnel: activeTunnel,
        winOrigin,
      };
    }
    if (isBrowserOnTunnel) {
      return {
        effectiveBase: winOrigin,
        sourceLabel: `Tunnel HTTPS public détecté (${host})`,
        sourceTone: 'good',
        lanUrl,
        lanIps,
        serverTunnel: activeTunnel,
        winOrigin,
      };
    }
    if (isBrowserOnLan) {
      return {
        effectiveBase: winOrigin,
        sourceLabel: `Réseau Wi-Fi / LAN détecté (${host})`,
        sourceTone: 'info',
        lanUrl,
        lanIps,
        serverTunnel: activeTunnel,
        winOrigin,
      };
    }
    if (lanUrl) {
      return {
        effectiveBase: lanUrl,
        sourceLabel: `IP Wi-Fi locale du PC détectée (${preferredLanIp}:${port})`,
        sourceTone: 'info',
        lanUrl,
        lanIps,
        serverTunnel: activeTunnel,
        winOrigin,
      };
    }
    return {
      effectiveBase: winOrigin,
      sourceLabel: 'Localhost uniquement — lancez Lancer_Serveur_Cloud_PC.bat ou renseignez une URL Cloud ci-dessous',
      sourceTone: 'warn',
      lanUrl: '',
      lanIps: [],
      serverTunnel: '',
      winOrigin,
    };
  }, [cloudTunnelUrl, savedPublicUrl, serverInfo]);

  const baseForShare =
    cloudTunnelUrl ||
    (publicUrlDraft && publicUrlDraft !== savedPublicUrl ? normalizeBaseUrl(publicUrlDraft) : null) ||
    detectedNetwork.effectiveBase;
  const surveyDirectUrl = `${baseForShare}/?view=survey&sector=${encodeURIComponent(shareSector)}`;
  const fullPortalUrl = `${baseForShare}/`;

  const copyLink = async (key, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2200);
    } catch {
      notify(`Lien à copier : ${url}`, 'info');
    }
  };

  const applyPublicUrl = (e) => {
    e.preventDefault();
    const saved = storage.setPublicCloudUrl(publicUrlDraft);
    setPublicUrlDraft(saved);
    notify(
      saved
        ? `URL Publique Cloud du PC enregistrée (${saved}) — QR Codes mis à jour instantanément.`
        : 'Retour à la détection automatique de l’URL Cloud / Wi-Fi du PC.',
    );
  };

  const exportJson = async () => {
    storage.downloadFile(
      `roue-adaptative-sauvegarde-${storage.stamp()}.json`,
      await storage.exportJSON(),
      'application/json',
    );
    notify('Sauvegarde JSON complète téléchargée.');
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (mode === 'replace' && !window.confirm('Le mode « remplacer » écrase toutes les données actuelles. Continuer ?'))
      return;
    try {
      const res = await storage.importJSON(await file.text(), mode);
      notify(`Import réussi : ${res.responses} réponse(s), ${res.contacts} contact(s).`);
      onChanged();
    } catch (err) {
      notify(err.message, 'bad');
    }
  };

  const demo = async () => {
    const n = await storage.addDemoResponses();
    notify(`${n} réponses de démonstration ajoutées et synchronisées sur le serveur PC.`);
    onChanged();
  };
  const purgeDemo = async () => {
    await storage.clearResponses({ onlyDemo: true });
    notify('Données de démonstration supprimées.');
    onChanged();
  };
  const purgeAll = async () => {
    if (
      !window.confirm(
        `Supprimer définitivement les ${responses.length} réponses ? Pensez à exporter une sauvegarde JSON avant.`,
      )
    )
      return;
    await storage.clearResponses();
    notify('Toutes les réponses ont été supprimées.', 'warn');
    onChanged();
  };
  const resetCrm = async () => {
    if (
      !window.confirm(
        'Remplacer le CRM par les 15 cibles industrielles de départ (crm.seedContacts) ? Les contacts actuels seront réinitialisés.',
      )
    )
      return;
    await storage.resetContactsToSeed();
    notify('CRM réinitialisé avec les 15 cibles industrielles clés.', 'warn');
    onChanged();
  };

  const tones = {
    good: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    warn: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    bad: 'border-red-500/30 bg-red-500/10 text-red-200',
    info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  };

  return (
    <div className="space-y-6">
      {message && (
        <p role="status" className={`rounded-lg border p-3 text-sm ${tones[message.tone] || tones.good}`}>
          {message.text}
        </p>
      )}

      {/* ======== CHANTIER 6 & 7 : SERVEUR CLOUD PC À ACCÈS RESTREINT & QR CODES AUTOMATIQUES ======== */}
      <Card className="border-amber-500/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={detectedNetwork.sourceTone}>{detectedNetwork.sourceLabel}</Badge>
              {cloudTunnelUrl && (
                <a
                  href={cloudTunnelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-semibold text-emerald-300 shadow-sm transition hover:bg-emerald-500/25"
                  title="Ouvrir le tunnel Cloudflare dans un nouvel onglet"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{cloudTunnelUrl}</span>
                  <Icon name="ExternalLink" size={12} className="text-emerald-400" />
                </a>
              )}
              {currentSync.lastSyncedAt && !isOffline && (
                <span className="font-mono text-xs text-slate-400">
                  Sync serveur : {fmtDate(currentSync.lastSyncedAt)}
                </span>
              )}
            </div>
            <h3 className="mt-3 flex items-center gap-2 font-display text-xl font-bold text-white">
              <Icon name="Server" size={20} className="text-amber-400" />
              <span>Serveur Cloud PC à Accès Restreint · Liens Externes &amp; QR Codes</span>
            </h3>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Diffusez les 2 QR Codes ci-dessous aux partenaires (smartphones 4G/5G, tablettes, PC). Grâce à
              l&apos;architecture <strong className="text-emerald-300">Write-Only</strong>, chaque participant envoie ses
              réponses sur le PC serveur sans jamais pouvoir lire les réponses des autres entreprises ni accéder au CRM.
            </p>
          </div>

          <button
            type="button"
            onClick={onSyncCloud}
            disabled={isSyncing}
            className="btn-secondary shrink-0 text-xs"
          >
            <Icon name="RefreshCw" size={15} className={isSyncing ? 'animate-spin text-amber-400' : 'text-amber-400'} />
            <span>{isSyncing ? 'Synchronisation…' : 'Actualiser Serveur PC'}</span>
          </button>
        </div>

        {(cloudTunnelUrl || detectedNetwork.isVercel) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-200">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
              <div>
                <p className="font-bold text-white">
                  {detectedNetwork.isVercel
                    ? '🟢 Hébergement Cloud 24/7 Actif (Vercel + Firebase) : QR Codes synchronisés'
                    : '🟢 Tunnel Cloud Actif : QR Codes synchronisés'}
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  {detectedNetwork.isVercel
                    ? 'Plateforme hébergée 24h/24. Les participants scannent les QR codes et enregistrent leurs réponses directement dans Firebase.'
                    : 'Génération automatique en temps réel. Les participants scannent directement avec leurs smartphones en 4G/5G.'}
                </p>
              </div>
            </div>
            <a
              href={detectedNetwork.effectiveBase}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-3 py-1.5 font-mono text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
            >
              <span>{detectedNetwork.effectiveBase}</span>
              <Icon name="ExternalLink" size={13} />
            </a>
          </div>
        )}

        {/* Champ URL Publique Cloud du PC + Sélection rapide Tunnel / IP Wi-Fi + Filière Lien 1 */}
        <div className="mt-5 grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 lg:grid-cols-[1.35fr_1fr]">
          <form onSubmit={applyPublicUrl} className="space-y-2.5">
            <label htmlFor="pc-public-cloud-url" className="label text-xs">
              URL Publique Cloud du PC (https://...trycloudflare.com, ngrok, loca.lt ou http://192.168.x.x:5173)
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id="pc-public-cloud-url"
                type="url"
                className="input min-w-[230px] flex-1 font-mono text-xs"
                value={publicUrlDraft}
                onChange={(e) => setPublicUrlDraft(e.target.value)}
                placeholder={detectedNetwork.effectiveBase}
              />
              <button type="submit" className="btn-primary py-2 text-xs">
                <Icon name="QrCode" size={14} />
                <span>Appliquer aux QR</span>
              </button>
              {savedPublicUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPublicUrlDraft('');
                    storage.setPublicCloudUrl('');
                    notify('Détection automatique restaurée.');
                  }}
                  className="btn-ghost border border-slate-800 py-2 text-xs"
                >
                  Auto
                </button>
              )}
            </div>

            {/* Pastilles de sélection en 1 clic des adresses détectées sur le PC */}
            {(detectedNetwork.serverTunnel || detectedNetwork.lanIps.length > 0) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                <span>Détecté sur ce PC :</span>
                {detectedNetwork.serverTunnel && (
                  <button
                    type="button"
                    onClick={() => {
                      setPublicUrlDraft(detectedNetwork.serverTunnel);
                      storage.setPublicCloudUrl(detectedNetwork.serverTunnel);
                    }}
                    className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-emerald-300 hover:bg-emerald-500/20"
                  >
                    Tunnel HTTPS ({detectedNetwork.serverTunnel})
                  </button>
                )}
                {detectedNetwork.lanIps.map((ip) => {
                  const candidate = `http://${ip}:${serverInfo?.port || 5173}`;
                  return (
                    <button
                      key={ip}
                      type="button"
                      onClick={() => {
                        setPublicUrlDraft(candidate);
                        storage.setPublicCloudUrl(candidate);
                      }}
                      className="rounded-lg border border-sky-500/35 bg-sky-500/10 px-2 py-0.5 font-mono text-sky-300 hover:bg-sky-500/20"
                    >
                      Wi-Fi {ip}
                    </button>
                  );
                })}
              </div>
            )}
          </form>

          <div>
            <span className="label text-xs">Filière pré-sélectionnée pour le Lien 1 (Enquête directe)</span>
            <div className="flex flex-wrap gap-1.5">
              {projectData.sectors.map((s) => {
                const active = s.id === shareSector;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShareSector(s.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? 'text-slate-950'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                    style={active ? { background: s.color, borderColor: s.color } : undefined}
                  >
                    <Icon name={s.icon} size={13} />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Astuce : double-cliquez sur <code className="font-mono text-amber-300">Lancer_Serveur_Cloud_PC.bat</code> à
              la racine du projet pour ouvrir automatiquement le serveur et son tunnel HTTPS 4G/5G.
            </p>
          </div>
        </div>

        {/* Les 2 QR Codes SVG et les 2 liens partagés */}
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <QrLinkCard
            badge={`Lien 1 · Enquête directe sans biais (${projectData.sectors.find((s) => s.id === shareSector)?.label})`}
            badgeTone="good"
            title="Questionnaire seul en 4 étapes (Mode Focus)"
            description="Ouvre directement l'enquête industrielle en 4 étapes avec rappel neutre (+H/2 / −H/2), sans exposer les hypothèses de prix ni les vidéos."
            url={surveyDirectUrl}
            copied={copiedKey === 'survey'}
            onCopy={() => copyLink('survey', surveyDirectUrl)}
          />
          <QrLinkCard
            badge="Lien 2 · Portail complet (Consultation protégée)"
            badgeTone="info"
            title="Choix Questionnaire ou Présentation Interactive Protégée"
            description="Ouvre l'écran double entrée (Consultation ou Présentation interactive en mode Anti-Copie : vidéos non téléchargeables, zéro fuite de données)."
            url={fullPortalUrl}
            copied={copiedKey === 'portal'}
            onCopy={() => copyLink('portal', fullPortalUrl)}
          />
        </div>

        {/* Bandeau d'audit Triple Fallback de Sauvegarde */}
        <div className="mt-5 grid gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4 text-xs sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <Icon name="Database" size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold text-white">1. Base JSON + Journal .jsonl atomique</p>
              <p className="mt-0.5 text-slate-400">
                Écriture simultanée dans <code className="font-mono text-slate-300">./data/ensta-r2a-database.json</code>,{' '}
                <code className="font-mono text-slate-300">responses-append-log.jsonl</code> et <code className="font-mono text-slate-300">./data/backups/</code>.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Icon name="ShieldCheck" size={16} className="mt-0.5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-white">2. File hors-ligne multi-appareils</p>
              <p className="mt-0.5 text-slate-400">
                File locale <code className="font-mono text-slate-300">ensta_pending_submissions</code> sur chaque mobile/tablette avec renvoi automatique dès retour réseau.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Icon name="FileCheck" size={16} className="mt-0.5 shrink-0 text-sky-400" />
            <div>
              <p className="font-semibold text-white">3. Reçu individuel &amp; Preuve JSON</p>
              <p className="mt-0.5 text-slate-400">
                Route <code className="font-mono text-slate-300">POST /api/survey-submit</code> Write-Only retournant un numéro de reçu unique téléchargeable en 1 clic.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ======== EXPORT / IMPORT / DÉMO / ZONE SENSIBLE ======== */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Icon name="Download" size={17} /> Exporter les données consolidées
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {responses.length} réponse(s) · {contacts.length} contact(s). Les CSV sont compatibles Excel FR (BOM UTF-8,
            séparateur « ; »).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={exportJson}>
              <Icon name="FileJson" size={16} /> Sauvegarde JSON
            </button>
            <button
              className="btn-secondary"
              disabled={!responses.length}
              onClick={() =>
                storage.downloadFile(
                  `reponses-enquete-${storage.stamp()}.csv`,
                  storage.responsesToCSV(responses),
                  'text/csv',
                )
              }
            >
              <Icon name="FileSpreadsheet" size={16} /> Réponses CSV
            </button>
            <button
              className="btn-secondary"
              disabled={!contacts.length}
              onClick={() =>
                storage.downloadFile(
                  `crm-contacts-${storage.stamp()}.csv`,
                  storage.contactsToCSV(contacts),
                  'text/csv',
                )
              }
            >
              <Icon name="FileSpreadsheet" size={16} /> Contacts CSV
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Icon name="Upload" size={17} /> Importer une sauvegarde JSON ou un justificatif client
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Fusionnez une sauvegarde JSON complète ou un justificatif individuel <code className="font-mono text-xs">.json</code> transmis par un répondant.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
            {[
              ['merge', 'Fusionner (recommandé)'],
              ['replace', 'Remplacer'],
            ].map(([v, l]) => (
              <label key={v} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="import-mode"
                  className="accent-amber-500"
                  checked={mode === v}
                  onChange={() => setMode(v)}
                />{' '}
                {l}
              </label>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
          <button className="btn-secondary mt-4" onClick={() => fileRef.current?.click()}>
            <Icon name="Upload" size={16} /> Choisir un fichier JSON
          </button>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Icon name="Sparkles" size={17} /> Données de démonstration
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Génère {projectData.admin.demo.count} réponses fictives calibrées (classement 1–5 + Van Westendorp en %) pour
            tester les graphiques (actuellement {demoCount}).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={demo}>
              <Icon name="Plus" size={16} /> Générer
            </button>
            <button className="btn-ghost" onClick={purgeDemo} disabled={!demoCount}>
              Supprimer les données démo
            </button>
          </div>
        </Card>

        <Card className="border-red-500/20 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-red-300">
            <Icon name="AlertTriangle" size={17} /> Zone sensible
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Actions irréversibles : exportez une sauvegarde JSON avant toute suppression.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-danger" onClick={purgeAll} disabled={!responses.length}>
              <Icon name="Trash2" size={16} /> Supprimer toutes les réponses
            </button>
            <button className="btn-danger" onClick={resetCrm}>
              <Icon name="RotateCcw" size={16} /> Réinitialiser le CRM (15 cibles)
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
