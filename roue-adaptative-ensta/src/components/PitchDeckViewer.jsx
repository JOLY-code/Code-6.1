import { useCallback, useEffect, useRef, useState } from 'react';
import { useSecurity } from '../context/SecurityContext.jsx';
import Icon from './ui/Icon.jsx';
import { Card } from './ui/Primitives.jsx';

export default function PitchDeckViewer({ deck }) {
  const { isPrivileged } = useSecurity();
  const slides = deck.slides || [];
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const containerRef = useRef(null);

  const slide = slides[index] || slides[0];
  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : total - 1)), [total]);
  const next = useCallback(() => setIndex((i) => (i < total - 1 ? i + 1 : 0)), [total]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    if (!isFullscreen && !pseudoFullscreen) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Escape' && pseudoFullscreen) {
        setPseudoFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen, pseudoFullscreen, next, prev]);

  const toggleFullscreen = async () => {
    if (pseudoFullscreen) {
      setPseudoFullscreen(false);
      return;
    }
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { /* ignore */ }
      return;
    }
    if (containerRef.current?.requestFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        return;
      } catch {
        // Repli CSS plein écran si l'API navigateur est restreinte
      }
    }
    setPseudoFullscreen(true);
  };

  const expanded = isFullscreen || pseudoFullscreen;

  return (
    <Card
      className={`p-6 md:p-8 ${!isPrivileged ? 'select-none' : ''}`}
      onContextMenu={(e) => {
        if (!isPrivileged) e.preventDefault();
      }}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-amber-400">
            <Icon name="Presentation" size={15} /> Pitch Deck B2B Intégré
          </p>
          <h3 className="mt-1.5 font-display text-2xl font-bold text-white">{deck.title}</h3>
          <p className="mt-1 text-sm text-slate-400">{deck.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 font-mono text-xs font-semibold text-slate-300">
            Slide {index + 1} / {total}
          </span>
          <button type="button" onClick={toggleFullscreen} className="btn-secondary py-2 text-xs">
            <Icon name={expanded ? 'Minimize2' : 'Maximize2'} size={15} />
            <span>{expanded ? 'Quitter plein écran' : 'Plein écran'}</span>
          </button>
        </div>
      </div>

      {/* Conteneur Slide 16:9 */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') next();
          if (e.key === 'ArrowLeft') prev();
        }}
        aria-label={`Pitch Deck — Slide ${index + 1} sur ${total} : ${slide.title}`}
        className={
          expanded
            ? 'fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-slate-950 p-6 sm:p-12 outline-none'
            : 'relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#070b14] via-[#0b1222] to-[#070b14] p-6 sm:p-8 lg:aspect-video lg:p-10 outline-none'
        }
      >
        {/* Lueur d'accent dynamique par slide */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-15 blur-3xl transition-colors duration-500"
          style={{ background: slide.accent || '#f59e0b' }}
        />

        {/* En-tête de la slide */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span
              className="rounded-lg px-2.5 py-1 font-mono text-xs font-bold text-slate-950"
              style={{ background: slide.accent || '#f59e0b' }}
            >
              SLIDE {slide.number}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
              {slide.kicker}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] tracking-wider text-slate-500 sm:inline">
              {deck.deckTag}
            </span>
            {expanded && (
              <button type="button" onClick={toggleFullscreen} className="btn-secondary px-3 py-1.5 text-xs">
                <Icon name="Minimize2" size={14} /> Fermer
              </button>
            )}
          </div>
        </div>

        {/* Corps visuel de la slide */}
        <div className="relative z-10 my-auto py-5 lg:py-6">
          <h4 className={`max-w-4xl font-display font-extrabold tracking-tight text-white ${expanded ? 'text-3xl md:text-5xl' : 'text-2xl sm:text-3xl lg:text-[2.1rem] leading-tight'}`}>
            {slide.title}
          </h4>
          <p className={`mt-2.5 max-w-3xl leading-relaxed text-slate-300 ${expanded ? 'text-lg md:text-xl' : 'text-sm sm:text-base'}`}>
            {slide.lead}
          </p>

          {/* Bandeau de 3 KPIs visuels */}
          {Array.isArray(slide.kpis) && (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {slide.kpis.map((k) => (
                <div
                  key={k.value + k.label}
                  className="rounded-xl border border-slate-800/90 bg-slate-900/75 px-4 py-3.5"
                >
                  <p
                    className={`font-mono font-extrabold tracking-tight ${expanded ? 'text-3xl md:text-4xl' : 'text-xl sm:text-2xl'}`}
                    style={{ color: slide.accent || '#f59e0b' }}
                  >
                    {k.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-slate-300 sm:text-[13px]">{k.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* 3 Cartes synthétiques */}
          {Array.isArray(slide.cards) && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {slide.cards.map((c) => (
                <div
                  key={c.title}
                  className="rounded-xl border border-slate-800/70 bg-slate-950/65 p-4"
                >
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {c.tag}
                  </p>
                  <p className="mt-1 font-display text-base font-bold text-white">{c.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300 sm:text-[13px]">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barre inférieure de navigation dans la slide */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
          <button type="button" onClick={prev} className="btn-secondary px-3.5 py-2 text-xs">
            <Icon name="ChevronLeft" size={16} />
            <span>Slide précédente</span>
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Accès direct aux slides">
            {slides.map((s, i) => {
              const active = i === index;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setIndex(i)}
                  title={`Slide ${i + 1} : ${s.kicker}`}
                  className={`h-2.5 rounded-full transition-all ${
                    active ? 'w-8 bg-amber-400' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              );
            })}
          </div>

          <button type="button" onClick={next} className="btn-primary px-4 py-2 text-xs">
            <span>Slide suivante</span>
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>

      {/* Sommaire cliquable des 6 slides sous la visionneuse */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                active
                  ? 'border-amber-500/60 bg-amber-500/10 text-white'
                  : 'border-slate-800/80 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="block font-mono text-[11px] font-bold text-amber-400">Slide {i + 1}</span>
              <span className="mt-0.5 block truncate text-xs font-medium">{s.kicker}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

