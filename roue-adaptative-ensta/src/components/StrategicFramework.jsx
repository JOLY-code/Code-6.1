import { useState } from 'react';
import projectData from '../config/projectData.js';
import { useSector } from '../context/SectorContext.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import Icon from './ui/Icon.jsx';
import { Badge, Card, Section } from './ui/Primitives.jsx';

const cfg = projectData.strategicFramework;

export default function StrategicFramework({ onNavigate }) {
  const { sector, setSectorId } = useSector();
  const { isPrivileged } = useSecurity();
  const [showAcademic, setShowAcademic] = useState(false);

  const { agreements, patentCoverage, scope, academicAccordion } = cfg;
  const subtitle = cfg.subtitleBySector?.[sector.id] || cfg.subtitleBySector?.agri;

  return (
    <Section
      id="cadre"
      eyebrow={cfg.eyebrow}
      eyebrowIcon="Handshake"
      title={cfg.title}
      subtitle={subtitle}
    >
      <div className={`space-y-16 ${!isPrivileged ? 'select-none' : ''}`}>
        {/* ================= 1. LES 3 MODÈLES D'ACCORDS COMMERCIAUX & LICENCES ================= */}
        <div className="space-y-8">
          <div className="max-w-3xl">
            <h3 className="font-display text-2xl font-bold text-white md:text-3xl">{agreements.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-slate-300">{agreements.subtitle}</p>
          </div>

          {/* Bandeau officiel des conditions de licence ENSTA Bretagne & contacts DAJV */}
          <Card className="border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900/95 to-slate-900/85 p-6 sm:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-[1.25fr_1fr]">
              <div>
                <Badge tone="warn">{agreements.royaltyBanner.badge}</Badge>
                <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {agreements.royaltyBanner.headline}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {agreements.royaltyBanner.detail}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {agreements.royaltyBanner.contactsLabel}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {agreements.royaltyBanner.contacts.map((ct) => (
                    <li key={ct.name} className="flex items-start gap-2.5 text-xs">
                      <Icon name="ShieldCheck" size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                      <div>
                        <span className="font-display font-bold text-white">{ct.name}</span>
                        <span className="block text-slate-400">{ct.role}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* 3 Cartes Modèles d'accords */}
          <div className="grid gap-8 lg:grid-cols-3">
            {agreements.models.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between p-7">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone="info">{item.badge}</Badge>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-950/70 text-amber-400">
                      <Icon name={item.icon} size={19} />
                    </span>
                  </div>

                  <h4 className="mt-5 font-display text-xl font-bold leading-snug text-white">
                    {item.title}
                  </h4>

                  <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2 font-mono text-xs font-semibold text-amber-300">
                    {item.terms}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-slate-300">{item.description}</p>

                  <ul className="mt-4 space-y-2 border-t border-slate-800/80 pt-4 text-xs text-slate-300">
                    {item.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2">
                        <Icon name="CheckCircle2" size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('enquete')}
                    className="btn-secondary mt-6 w-full justify-between text-xs"
                  >
                    <span>Qualifier ce partenariat</span>
                    <Icon name="ArrowRight" size={15} />
                  </button>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* ================= 2. COUVERTURE GÉOGRAPHIQUE DES 2 BREVETS ================= */}
        <div>
          <div className="mb-8 max-w-3xl">
            <h3 className="font-display text-2xl font-bold text-white md:text-3xl">{patentCoverage.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-slate-300">{patentCoverage.subtitle}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {patentCoverage.patents.map((pat, idx) => {
              const isExclusiveEnsta = idx === 0;
              return (
                <Card
                  key={pat.id}
                  className={`flex flex-col justify-between p-7 ${
                    isExclusiveEnsta ? 'border-emerald-500/35 bg-emerald-500/[0.03]' : 'border-sky-500/30'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge tone={isExclusiveEnsta ? 'good' : 'info'}>{pat.priorityTag}</Badge>
                      <Icon name="Globe" size={18} className="text-amber-400" />
                    </div>

                    <p className="mt-4 font-mono text-sm font-bold text-amber-300">{pat.codes}</p>
                    <h4 className="mt-1.5 font-display text-xl font-bold text-white">{pat.title}</h4>

                    <div className="mt-4 grid gap-3 rounded-xl border border-slate-800 bg-slate-950/65 p-4 text-xs sm:grid-cols-2">
                      <div>
                        <span className="block font-mono uppercase tracking-wider text-slate-500">Titularité</span>
                        <span className="mt-0.5 block font-semibold text-white">{pat.holders}</span>
                      </div>
                      <div>
                        <span className="block font-mono uppercase tracking-wider text-slate-500">Statut & Portée</span>
                        <span className="mt-0.5 block font-semibold text-emerald-300">{pat.status}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Juridictions protégées :
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {pat.territories.map((t) => (
                          <span
                            key={t}
                            className="rounded-lg border border-slate-700/80 bg-slate-900 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ul className="mt-5 space-y-2 border-t border-slate-800/80 pt-4 text-xs leading-relaxed text-slate-300">
                      {pat.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <Icon name="ShieldCheck" size={15} className="mt-0.5 shrink-0 text-amber-400" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ================= 3. PÉRIMÈTRE D'INGÉNIERIE (CŒUR DE CIBLE VS EXCLUSIONS) ================= */}
        <div>
          <div className="mb-8 max-w-3xl">
            <h3 className="font-display text-2xl font-bold text-white md:text-3xl">{scope.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-slate-300">{scope.subtitle}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
            {/* Cœur de cible */}
            <Card className="border-emerald-500/35 bg-emerald-500/[0.03] p-7">
              <Badge tone="good">Cœur de cible industriel R2A</Badge>
              <h4 className="mt-3 font-display text-xl font-bold text-white">{scope.inScopeTitle}</h4>
              <ul className="mt-6 space-y-4">
                {scope.inScope.map((it) => {
                  const isActiveSector = it.sectorId === sector.id;
                  return (
                    <li
                      key={it.title}
                      onClick={() => it.sectorId && setSectorId(it.sectorId)}
                      className={`flex cursor-pointer gap-3.5 rounded-xl border p-3.5 transition ${
                        isActiveSector
                          ? 'border-emerald-400/50 bg-emerald-500/10'
                          : 'border-slate-800/70 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
                        <Icon name={it.icon} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-display text-base font-bold text-emerald-300">{it.title}</p>
                          {isActiveSector && <Badge tone="good">Filière active</Badge>}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-300">{it.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* Exclusions assumées */}
            <Card className="border-amber-500/30 bg-slate-900/75 p-7">
              <Badge tone="warn">Hors périmètre nominal</Badge>
              <h4 className="mt-3 font-display text-xl font-bold text-white">{scope.outOfScopeTitle}</h4>
              <ul className="mt-6 space-y-5">
                {scope.outOfScope.map((it) => (
                  <li key={it.title} className="flex gap-3.5">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
                      <Icon name="AlertTriangle" size={18} />
                    </span>
                    <div>
                      <p className="font-display text-base font-bold text-amber-200">{it.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">{it.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs leading-relaxed text-slate-400">
                <strong className="text-slate-200">Rigueur d&apos;ingénierie ENSTA Bretagne :</strong> cibler les
                vitesses jusqu&apos;à 50 km/h concentre l&apos;architecture passive R2A sur les véhicules, porteurs et
                robots où la compacité intra-jante, la robustesse sans électronique et la division par 2 de
                l&apos;inclinaison procurent un avantage compétitif décisif.
              </div>
            </Card>
          </div>
        </div>

        {/* ================= 4. ACCORDÉON RÉSERVÉ AU MODE PROFESSEUR / ÉQUIPE : ÉQUIPE PROJET 6.1 & GANTT ================= */}
        {isPrivileged && (
        <Card className="overflow-hidden border-slate-800/90 bg-slate-900/50">
          <button
            type="button"
            onClick={() => setShowAcademic((v) => !v)}
            aria-expanded={showAcademic}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-800/40"
          >
            <div className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-950 text-slate-300">
                <Icon name="Users" size={18} />
              </span>
              <div>
                <span className="block font-display text-sm font-bold text-slate-200 sm:text-base">
                  {showAcademic ? academicAccordion.hideLabel : academicAccordion.toggleLabel}
                </span>
                <span className="mt-0.5 block font-mono text-[11px] text-slate-500">
                  {academicAccordion.badge}
                </span>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <span>{showAcademic ? 'Replier' : 'Déplier'}</span>
              <Icon name={showAcademic ? 'ChevronUp' : 'ChevronDown'} size={15} />
            </span>
          </button>

          {showAcademic && (
            <div className="space-y-8 border-t border-slate-800 p-6 sm:p-8">
              {/* Problématique d'étude */}
              <div className="rounded-2xl border border-amber-500/25 bg-slate-950/70 p-6">
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-400">
                  {academicAccordion.problematic.label}
                </p>
                <blockquote className="mt-2 font-display text-lg font-bold leading-snug text-white sm:text-xl">
                  {academicAccordion.problematic.question}
                </blockquote>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {academicAccordion.problematic.pillars.map((p, idx) => (
                    <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                      <span className="font-mono text-[11px] font-bold text-amber-400">0{idx + 1}</span>
                      <p className="mt-1 font-display text-sm font-bold text-white">{p.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{p.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Répartition par Lots */}
              <div>
                <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Organisation de l&apos;équipe projet ENSTA Bretagne (Lots 1, 2 & 3)
                </p>
                <div className="grid gap-5 lg:grid-cols-3">
                  {academicAccordion.lots.map((lot) => (
                    <div key={lot.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
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

              {/* Frise chronologique Oct. 2026 -> Mars 2027 */}
              <div>
                <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Calendrier de déploiement (Octobre 2026 → Mars 2027)
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {academicAccordion.gantt.map((g) => {
                    const tone = g.status === 'done' ? 'good' : g.status === 'active' ? 'warn' : 'slate';
                    const statusLabel =
                      g.status === 'done' ? 'Réalisé' : g.status === 'active' ? 'En cours' : 'Planifié';
                    return (
                      <div key={g.period} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
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
        </Card>
        )}
      </div>
    </Section>
  );
}
