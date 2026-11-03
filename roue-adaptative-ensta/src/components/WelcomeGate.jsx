import { useState } from 'react';
import projectData from '../config/projectData.js';
import { useSector } from '../context/SectorContext.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { resolveAssetUrl } from '../utils/assetUrl.js';
import Icon from './ui/Icon.jsx';
import { Badge, Card } from './ui/Primitives.jsx';

export default function WelcomeGate({ onStartSurvey, onOpenPortal, onOpenAdmin }) {
  const { sector, sectors, sectorId, setSectorId } = useSector();
  const { isPrivileged, openValidationModal } = useSecurity();
  const [logoError, setLogoError] = useState(false);

  const logoSrc = resolveAssetUrl(projectData.meta.logoUrl || '/Logo/ENSTA.webp');
  const gate = projectData.welcomeGate;

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-ink-950 px-4 py-6 sm:px-6 lg:px-8">
      {/* Halo ambiant discret adapté à la filière active */}
      <div
        className="pointer-events-none absolute -top-44 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-20 blur-3xl transition-colors duration-500"
        style={{ background: `radial-gradient(circle, ${sector.color} 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Barre supérieure sobre : Logo ENSTA + Validation Professeur/Équipe + Accès Back-Office */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {!logoError && logoSrc ? (
            <img
              src={logoSrc}
              alt="ENSTA Bretagne"
              draggable={false}
              onError={() => setLogoError(true)}
              className="h-11 w-auto select-none rounded-xl bg-white px-3 py-1.5 object-contain shadow-md ring-1 ring-white/20 md:h-12"
            />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/35">
              <Icon name="Cog" size={22} />
            </span>
          )}
          <div>
            <p className="font-display text-sm font-extrabold tracking-tight text-white sm:text-base">
              {projectData.meta.appName}
            </p>
            <p className="font-mono text-[11px] font-semibold text-slate-400">{projectData.meta.navSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-300 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Portail B2B Sécurisé · ENSTA Bretagne
          </span>
          <button
            type="button"
            onClick={openValidationModal}
            className={`btn-ghost border px-3 py-1.5 text-xs ${
              isPrivileged
                ? 'border-emerald-500/45 bg-emerald-500/10 text-emerald-300 hover:text-white'
                : 'border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Validation en ligne réservée au Professeur, aux référents ENSTA et à l'équipe projet"
            aria-label="Validation Professeur et Équipe"
          >
            <Icon name="UserCheck" size={14} className={isPrivileged ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="hidden sm:inline">Validation Professeur / Équipe</span>
          </button>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="btn-ghost border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            title="Espace réservé à l'équipe R2A et aux référents ENSTA"
            aria-label="Espace réservé à l'équipe R2A et aux référents ENSTA"
          >
            <Icon name="Lock" size={14} />
            <span className="hidden sm:inline">Back-Office</span>
          </button>
        </div>
      </header>

      {/* Corps central : Identité R2A + Sélecteur de filière + 2 Grandes Cartes d'Action */}
      <main className="relative z-10 mx-auto my-8 w-full max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">
            <Icon name="ShieldCheck" size={14} />
            <span>{gate.eyebrow}</span>
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            {gate.title}
          </h1>

          {/* Badges des 2 brevets européens */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {gate.patentBadges.map((b, idx) => (
              <span
                key={b.code}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs ${
                  idx === 0
                    ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                    : 'border-sky-500/35 bg-sky-500/10 text-sky-200'
                }`}
              >
                <strong className="font-mono font-bold text-white">{b.code}</strong>
                <span className="text-slate-300">· {b.detail}</span>
              </span>
            ))}
          </div>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {gate.subtitle}
          </p>
        </div>

        {/* Sélecteur rapide de filière en haut */}
        <div className="mx-auto mt-7 max-w-2xl">
          <p className="mb-2.5 text-center font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
            {gate.sectorPrompt}
          </p>
          <div
            className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5 sm:grid-cols-3"
            role="radiogroup"
            aria-label="Filière industrielle"
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
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    active ? 'text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  style={active ? { background: s.color } : undefined}
                >
                  <Icon name={s.icon} size={17} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">
            Filière sélectionnée : <strong className="text-white">{sector.label}</strong> — {sector.headline}
          </p>
        </div>

        {/* Deux grandes cartes d'action côte-à-côte */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* CARTE 1 : QUESTIONNAIRE D'ABORD (Mise en avant entretiens & salons) */}
          <Card
            onClick={onStartSurvey}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onStartSurvey();
              }
            }}
            className="group flex cursor-pointer flex-col justify-between border-amber-500/50 bg-gradient-to-br from-amber-500/[0.11] via-slate-900/95 to-slate-900/90 p-7 transition duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-2xl sm:p-8"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <Badge tone="warn">{gate.cards.surveyFirst.badge}</Badge>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition group-hover:scale-105">
                  <Icon name="ClipboardList" size={23} />
                </span>
              </div>

              <h2 className="mt-5 font-display text-2xl font-extrabold leading-snug text-white">
                {gate.cards.surveyFirst.title}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
                « {gate.cards.surveyFirst.subtitle} »
              </p>

              <ul className="mt-5 space-y-2 border-t border-amber-500/20 pt-4 text-xs text-slate-300">
                {gate.cards.surveyFirst.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <Icon name="CheckCircle2" size={15} className="mt-0.5 shrink-0 text-amber-400" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7">
              <span className="btn-primary w-full justify-between py-3.5 text-sm font-bold">
                <span>
                  {gate.cards.surveyFirst.cta} ({sector.short})
                </span>
                <Icon name="ArrowRight" size={18} />
              </span>
            </div>
          </Card>

          {/* CARTE 2 : PRÉSENTATION INTERACTIVE COMPLÈTE */}
          <Card
            onClick={onOpenPortal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenPortal();
              }
            }}
            className="group flex cursor-pointer flex-col justify-between border-slate-700/80 bg-slate-900/85 p-7 transition duration-200 hover:-translate-y-0.5 hover:border-sky-400/60 hover:shadow-2xl sm:p-8"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <Badge tone="info">{gate.cards.fullPortal.badge}</Badge>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-500/35 bg-sky-500/15 text-sky-300 transition group-hover:scale-105">
                  <Icon name="Play" size={22} />
                </span>
              </div>

              <h2 className="mt-5 font-display text-2xl font-extrabold leading-snug text-white">
                {gate.cards.fullPortal.title}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                « {gate.cards.fullPortal.subtitle} »
              </p>

              <ul className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-xs text-slate-300">
                {gate.cards.fullPortal.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <Icon name="CheckCircle2" size={15} className="mt-0.5 shrink-0 text-sky-400" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7">
              <span className="btn-secondary w-full justify-between border-slate-700 py-3.5 text-sm font-bold group-hover:border-sky-400/50 group-hover:text-white">
                <span>
                  {gate.cards.fullPortal.cta} ({sector.short})
                </span>
                <Icon name="ArrowRight" size={18} />
              </span>
            </div>
          </Card>
        </div>
      </main>

      {/* Pied discret Valorisation DAJV ENSTA */}
      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-slate-800/70 pt-4 text-xs text-slate-500">
        <span>
          {projectData.valorisationContacts.department} · Licences industrielles (redevance 2 à 6 % HT + part fixe)
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Contacts : Caroline PENGAM · Maryline BENARD · Yannick ARGOUARC&apos;H
        </span>
      </footer>
    </div>
  );
}
