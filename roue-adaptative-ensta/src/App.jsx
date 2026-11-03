import { useEffect, useState } from 'react';
import projectData from './config/projectData.js';
import { useSector } from './context/SectorContext.jsx';
import { useSecurity } from './context/SecurityContext.jsx';
import { resolveAssetUrl } from './utils/assetUrl.js';
import WelcomeGate from './components/WelcomeGate.jsx';
import Navbar from './components/Navbar.jsx';
import HeroPitch from './components/HeroPitch.jsx';
import MediaHub from './components/MediaHub.jsx';
import KinematicSimulator from './components/KinematicSimulator.jsx';
import TcoCalculator from './components/TcoCalculator.jsx';
import TechSpecsAudit from './components/TechSpecsAudit.jsx';
import StrategicFramework from './components/StrategicFramework.jsx';
import SurveyWizard from './components/SurveyWizard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ReviewerValidationModal from './components/ReviewerValidationModal.jsx';

function resolveInitialView() {
  if (typeof window === 'undefined') return 'welcome';
  try {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view')?.trim().toLowerCase();
    if (v === 'presentation' || v === 'site') return 'site';
    if (v === 'survey' || v === 'enquete') return 'survey';
    if (v === 'admin') return 'admin';
  } catch {
    /* ignore */
  }
  return 'welcome';
}

function isEditableElement(target) {
  if (!target || typeof target.closest !== 'function') return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [data-allow-copy="true"]'));
}

function Footer({ onNavigate }) {
  const { sector } = useSector();
  const { meta, patents, valorisationContacts } = projectData;
  const [logoError, setLogoError] = useState(false);
  const logoSrc = resolveAssetUrl(meta.logoUrl || '/Logo/ENSTA.webp');
  const disclaimer = meta.disclaimerBySector?.[sector.id] || meta.disclaimer;

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-sm text-slate-400 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            {!logoError && logoSrc && (
              <img
                src={logoSrc}
                alt="ENSTA Bretagne"
                draggable={false}
                onError={() => setLogoError(true)}
                className="h-9 w-auto select-none rounded-lg bg-white px-2 py-1 object-contain"
              />
            )}
            <div>
              <p className="font-display text-base font-bold text-white">{meta.appName}</p>
              <p className="font-mono text-[11px] text-amber-400">
                {meta.school} · {meta.course}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{disclaimer}</p>
        </div>

        <div>
          <p className="font-display text-base font-bold text-white">Propriété intellectuelle & Brevets R2A</p>
          <ul className="mt-2 space-y-2.5">
            {patents.map((p) => (
              <li key={p.id} className="text-xs leading-relaxed">
                <span className="font-mono font-semibold text-slate-200">{p.id}</span>{' '}
                <span className="text-amber-400">· {p.status}</span>
                <span className="block text-emerald-300/90">{p.holders}</span>
                <span className="block text-slate-500">{p.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-base font-bold text-white">Valorisation & Licences B2B</p>
          <p className="mt-1 font-mono text-[11px] text-slate-400">{valorisationContacts.department}</p>
          <ul className="mt-2.5 space-y-1.5 text-xs text-slate-300">
            {valorisationContacts.negotiators.map((n) => (
              <li key={n.name}>
                <strong className="text-white">{n.name}</strong> — <span className="text-slate-400">{n.role}</span>
              </li>
            ))}
            <li>
              <strong className="text-white">{valorisationContacts.inventor.name}</strong> —{' '}
              <span className="text-slate-400">{valorisationContacts.inventor.role}</span>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <button type="button" onClick={() => onNavigate('demo')} className="font-semibold text-amber-400 hover:underline">
              Vidéos, Slides & Plaquettes PDF
            </button>
            <span className="text-slate-700">•</span>
            <button type="button" onClick={() => onNavigate('cadre')} className="font-semibold text-amber-400 hover:underline">
              Licences & Brevets (2 à 6 %)
            </button>
            <span className="text-slate-700">•</span>
            <button type="button" onClick={() => onNavigate('enquete')} className="font-semibold text-amber-400 hover:underline">
              Enquête Industrielle B2B
            </button>
          </div>
          {meta.contactEmail && (
            <a className="mt-2 inline-block text-xs text-amber-400 hover:underline" href={`mailto:${meta.contactEmail}`}>
              {meta.contactEmail}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  // 'welcome' | 'survey' | 'site' | 'admin'
  const [view, setView] = useState(resolveInitialView);
  const [pendingScroll, setPendingScroll] = useState(null);
  const { isPrivileged } = useSecurity();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (id) => {
    if (view !== 'site') {
      setPendingScroll(id);
      setView('site');
    } else {
      scrollToSection(id);
    }
  };

  // Synchronise discrètement le paramètre ?view= dans l'URL sans recharger la page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (view === 'site') url.searchParams.set('view', 'presentation');
      else if (view === 'survey') url.searchParams.set('view', 'survey');
      else url.searchParams.delete('view');
      window.history.replaceState({}, '', url.toString());
    } catch {
      /* ignore */
    }
  }, [view]);

  useEffect(() => {
    if (view === 'site' && pendingScroll) {
      const t = setTimeout(() => {
        scrollToSection(pendingScroll);
        setPendingScroll(null);
      }, 60);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [view, pendingScroll]);

  useEffect(() => {
    if (view === 'admin' || view === 'welcome' || view === 'survey') {
      window.scrollTo({ top: 0 });
    }
  }, [view]);

  // Protection Anti-Copie en Mode Consultation Client (!isPrivileged)
  const antiCopyHandlers = !isPrivileged
    ? {
        onContextMenu: (e) => {
          if (!isEditableElement(e.target)) e.preventDefault();
        },
        onDragStart: (e) => {
          if (!isEditableElement(e.target)) e.preventDefault();
        },
        onCopy: (e) => {
          if (!isEditableElement(e.target)) e.preventDefault();
        },
      }
    : {};

  if (view === 'welcome') {
    return (
      <>
        <WelcomeGate
          onStartSurvey={() => setView('survey')}
          onOpenPortal={() => setView('site')}
          onOpenAdmin={() => setView('admin')}
        />
        <ReviewerValidationModal onNavigateSection={navigate} />
      </>
    );
  }

  if (view === 'survey') {
    return (
      <>
        <SurveyWizard
          standalone
          onExplorePresentation={() => setView('site')}
          onBackToWelcome={() => setView('welcome')}
        />
        <ReviewerValidationModal onNavigateSection={navigate} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" {...(view === 'site' ? antiCopyHandlers : {})}>
      <Navbar
        isAdminView={view === 'admin'}
        onNavigate={navigate}
        onOpenWelcome={() => setView('welcome')}
        onOpenAdmin={() => setView('admin')}
        onExitAdmin={() => setView('site')}
      />
      <main className="flex-1">
        {view === 'admin' ? (
          <AdminDashboard onExit={() => setView('site')} />
        ) : (
          <>
            <HeroPitch onNavigate={navigate} />
            <MediaHub />
            <KinematicSimulator />
            <TcoCalculator />
            <TechSpecsAudit />
            <StrategicFramework onNavigate={navigate} />
            <SurveyWizard onExplorePresentation={() => scrollToSection('pitch')} />
          </>
        )}
      </main>
      <Footer onNavigate={navigate} />
      <ReviewerValidationModal onNavigateSection={navigate} />
    </div>
  );
}
