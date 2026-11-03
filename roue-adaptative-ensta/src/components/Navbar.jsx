import { useEffect, useState } from 'react';
import projectData from '../config/projectData.js';
import { useSector } from '../context/SectorContext.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { resolveAssetUrl } from '../utils/assetUrl.js';
import Icon from './ui/Icon.jsx';

export default function Navbar({ isAdminView, onNavigate, onOpenWelcome, onOpenAdmin, onExitAdmin }) {
  const { sector, sectors, sectorId, setSectorId } = useSector();
  const { isPrivileged, openValidationModal } = useSecurity();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('pitch');
  const [logoError, setLogoError] = useState(false);

  const logoSrc = resolveAssetUrl(projectData.meta.logoUrl || '/Logo/ENSTA.webp');

  useEffect(() => {
    if (isAdminView || typeof IntersectionObserver === 'undefined') return undefined;
    const ids = projectData.navigation.map((n) => n.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-22% 0px -60% 0px', threshold: [0.05, 0.2, 0.4] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isAdminView]);

  const go = (id) => {
    setOpen(false);
    setActiveSection(id);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      {/* Barre principale : Logo Officiel ENSTA + Identité R2A + Sélecteur de secteur + Actions rapides */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => go('pitch')}
          className="flex shrink-0 items-center gap-3 text-left"
          aria-label="Retour en haut de la présentation"
        >
          {!logoError && logoSrc ? (
            <img
              src={logoSrc}
              alt="ENSTA Bretagne"
              draggable={false}
              onError={() => setLogoError(true)}
              className="h-10 w-auto select-none rounded-lg bg-white px-2.5 py-1 object-contain shadow-sm ring-1 ring-white/20 md:h-11"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/35">
              <Icon name="Cog" size={20} />
            </span>
          )}
          <span className="leading-tight">
            <span className="block font-display text-sm font-extrabold tracking-tight text-white sm:text-base">
              {projectData.meta.appName}
            </span>
            <span className="block font-mono text-[10px] font-semibold tracking-wider text-slate-400 sm:text-[11px]">
              {projectData.meta.navSubtitle}
            </span>
          </span>
        </button>

        {/* Sélecteur global de secteur */}
        <div
          className="hidden items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1 md:flex"
          role="radiogroup"
          aria-label="Secteur d'application"
        >
          {sectors.map((s) => {
            const active = s.id === sectorId;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSectorId(s.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  active ? 'text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                style={active ? { background: s.color } : undefined}
                title={s.headline}
              >
                <Icon name={s.icon} size={14} />
                <span className="hidden xl:inline">{s.label}</span>
                <span className="xl:hidden">{s.short}</span>
              </button>
            );
          })}
        </div>

        {/* Boutons d'action rapide à droite */}
        <div className="flex items-center gap-2">
          {onOpenWelcome && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenWelcome();
              }}
              className="btn-ghost hidden border border-slate-800 px-2.5 py-2 text-xs text-slate-300 hover:text-white md:inline-flex"
              title="Accueil / Mode Enquête Seule (sans biais)"
              aria-label="Accueil / Mode Enquête Seule"
            >
              <Icon name="Home" size={15} className="text-amber-400" />
              <span className="hidden 2xl:inline">Accueil</span>
            </button>
          )}

          {!isAdminView && (
            <>
              <button
                type="button"
                onClick={() => go('enquete')}
                className="btn-primary hidden px-3.5 py-2 text-xs sm:inline-flex"
              >
                <Icon name="ClipboardList" size={14} />
                <span>Répondre à l&apos;Enquête</span>
              </button>
            </>
          )}

          {/* Bouton discret : Module en ligne Validation Professeur / Équipe */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openValidationModal();
            }}
            className={`btn-ghost hidden border px-2.5 py-2 text-xs md:inline-flex ${
              isPrivileged
                ? 'border-emerald-500/45 bg-emerald-500/10 text-emerald-300 hover:text-white'
                : 'border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Validation en ligne réservée au Professeur, aux référents ENSTA et à l'équipe projet"
            aria-label="Validation Professeur et Équipe"
          >
            <Icon name="UserCheck" size={15} className={isPrivileged ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="hidden xl:inline">Validation Professeur / Équipe</span>
          </button>

          {isAdminView ? (
            <button type="button" onClick={onExitAdmin} className="btn-secondary px-3 py-2 text-xs">
              <Icon name="LogOut" size={15} />
              <span>Quitter Back-Office</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="btn-ghost border border-slate-800 px-2.5 py-2 text-xs text-slate-400"
              title="Espace réservé à l'équipe R2A et aux référents ENSTA"
              aria-label="Espace réservé à l'équipe R2A et aux référents ENSTA"
            >
              <Icon name="Lock" size={15} />
              <span className="hidden 2xl:inline">Back-Office</span>
            </button>
          )}

          <button
            type="button"
            className="btn-ghost lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Ouvrir le menu"
          >
            <Icon name={open ? 'X' : 'Menu'} size={21} />
          </button>
        </div>
      </div>

      {/* Sous-barre de navigation fluide par section (Desktop) */}
      {!isAdminView && (
        <div className="hidden border-t border-slate-800/60 bg-slate-950/60 lg:block">
          <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1" aria-label="Sections de la page">
              {projectData.navigation.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <Icon name={item.icon} size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <span className="hidden font-mono text-[11px] text-slate-500 xl:inline">{sector.navSummary}</span>
          </div>
        </div>
      )}

      {/* Tiroir mobile / tablette */}
      {open && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 pb-5 pt-4 lg:hidden">
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400" htmlFor="sector-mobile">
            Filière industrielle active
          </label>
          <select
            id="sector-mobile"
            className="input mb-4"
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value)}
          >
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} — {s.headline}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-1.5">
            {projectData.navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className="btn-ghost justify-start text-xs"
              >
                <Icon name={item.icon} size={15} className="text-amber-400" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 border-t border-slate-800 pt-4 sm:grid-cols-2">
            {onOpenWelcome && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenWelcome();
                }}
                className="btn-secondary py-2.5 text-xs"
              >
                <Icon name="Home" size={14} className="text-amber-400" />
                <span>Accueil / Mode Enquête Seule</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openValidationModal();
              }}
              className="btn-secondary py-2.5 text-xs"
            >
              <Icon name="UserCheck" size={14} className={isPrivileged ? 'text-emerald-400' : 'text-amber-400'} />
              <span>Validation Professeur / Équipe</span>
            </button>
            {!isAdminView && (
              <>
                <button type="button" onClick={() => go('demo')} className="btn-secondary py-2.5 text-xs">
                  <Icon name="Play" size={14} className="text-amber-400" />
                  <span>Vidéos, Slides & PDF</span>
                </button>
                <button type="button" onClick={() => go('enquete')} className="btn-primary py-2.5 text-xs">
                  <Icon name="ClipboardList" size={14} />
                  <span>Répondre à l&apos;Enquête</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
