import { useEffect, useMemo, useState } from 'react';
import projectData from '../config/projectData.js';
import { useSector } from '../context/SectorContext.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { evaluate } from '../utils/formula.js';
import { fmtNumber } from '../utils/format.js';
import Icon from './ui/Icon.jsx';
import { Badge, Card, RangeField, Section, SegmentedTabs } from './ui/Primitives.jsx';
import { LineChart } from './ui/Charts.jsx';

const cfg = projectData.kinematics;

/* ------------------------------ modèle ------------------------------ */
function buildScope(params, controls) {
  const scope = { ...cfg.constants };
  controls.forEach((c) => {
    scope[c.variable] = Number(params[c.id] ?? 0);
  });
  cfg.derived.forEach((d) => {
    scope[d.id] = evaluate(d.expr, scope);
  });
  return scope;
}

/**
 * Calcule la réponse physique du concurrent sélectionné face à un obstacle asymétrique H.
 */
function computeCompetitorState(scope, competitor) {
  if (!competitor) {
    return {
      outerShare: scope.rigidOuterShare,
      innerShare: scope.rigidInnerShare,
      outerLoadT: scope.rigidOuterLoadT,
      innerLoadT: scope.rigidInnerLoadT,
      peakLoadT: scope.rigidPeakLoadT,
      liftCm: scope.liftRigidCm,
      alphaDeg: scope.alphaRigidDeg,
      gpsDriftCm: scope.gpsRigidCm,
      buckling: false,
    };
  }

  const isPuncture = scope.puncture > 0;
  const isAirlessOrSolid =
    competitor.visualType === 'solid_chained' || competitor.visualType === 'airless_tweel';
  const buckling = Boolean(competitor.maxLoadTonnes && scope.F > competitor.maxLoadTonnes);

  if (isPuncture) {
    if (isAirlessOrSolid) {
      return {
        outerShare: 100,
        innerShare: 0,
        outerLoadT: scope.F,
        innerLoadT: 0,
        peakLoadT: scope.F,
        liftCm: scope.H * competitor.liftFactor,
        alphaDeg: (Math.atan(((scope.H * competitor.liftFactor) / 100) / scope.trackM) * 180) / Math.PI,
        gpsDriftCm: scope.H * competitor.liftFactor * (scope.Hgps / scope.trackM),
        buckling,
      };
    }
    const single = Boolean(competitor.singleWheel);
    return {
      outerShare: 0,
      innerShare: single ? 0 : 100,
      outerLoadT: 0,
      innerLoadT: single ? 0 : scope.F,
      peakLoadT: scope.F,
      liftCm: 0,
      alphaDeg: 0,
      gpsDriftCm: 0,
      buckling: false,
    };
  }

  const effLiftFactor = buckling ? Math.min(1, competitor.liftFactor + 0.15) : competitor.liftFactor;
  const liftCm = scope.H * effLiftFactor;
  const alphaDeg = (Math.atan((liftCm / 100) / scope.trackM) * 180) / Math.PI;
  const gpsDriftCm = liftCm * (scope.Hgps / scope.trackM);

  let outerShare;
  let innerShare;
  if (competitor.singleWheel) {
    if (competitor.peakShareAtObstacle < 100) {
      const ramp = scope.H <= 0 ? 0 : Math.min(1, scope.H / scope.deflCm);
      outerShare = 50 + (competitor.peakShareAtObstacle - 50) * ramp;
      innerShare = 100 - outerShare;
    } else {
      outerShare = 100;
      innerShare = 0;
    }
  } else if (scope.H <= 0) {
    outerShare = 50;
    innerShare = 50;
  } else {
    const ramp = Math.min(1, scope.H / scope.deflCm);
    outerShare = Math.min(100, 50 + (competitor.peakShareAtObstacle - 50) * ramp);
    innerShare = Math.max(0, 100 - outerShare);
  }

  const outerLoadT = (scope.F * outerShare) / 100;
  const innerLoadT = (scope.F * innerShare) / 100;
  const peakLoadT = (scope.F * Math.max(outerShare, innerShare)) / 100;

  return {
    outerShare,
    innerShare,
    outerLoadT,
    innerLoadT,
    peakLoadT,
    liftCm,
    alphaDeg,
    gpsDriftCm,
    buckling,
  };
}

function toneFor(metric, value) {
  if (!metric.thresholds) return null;
  return metric.thresholds.find((t) => value <= t.max) || metric.thresholds[metric.thresholds.length - 1];
}

/* ---------------- scène SVG en coupe frontale (vue de face) ---------------- */
function FrontalObstacleScene({ uid, mode, scope, compState, competitor, labels }) {
  const W = 460;
  const Hsvg = 324;
  const groundY = 258;
  const rTire = 50;
  const isCompetitor = mode === 'competitor';
  const isPuncture = scope.puncture > 0;
  const sensorTag = labels?.svgSensorTag || 'CAPTEUR';
  const vType = isCompetitor ? competitor?.visualType || 'rigid_twin' : 'ensta_r2a';

  const xPivot = 54;
  const xIn = 278;
  const xOut = 366;
  const xc = (xIn + xOut) / 2; // 322
  const xSingle = 330;

  const hObsPx = isPuncture ? Math.min(18, (scope.H / 25) * 26) : (scope.H / 25) * 42;
  const xObsCenter = isCompetitor && competitor?.singleWheel ? xSingle : xOut;

  let yCenterOut;
  let yCenterIn;
  let yHub;

  const squishPx =
    isCompetitor && !isPuncture && scope.H > 0
      ? Math.min(16, hObsPx * (competitor?.squishRatio ?? 0.08))
      : 0;

  if (isPuncture) {
    yCenterIn = groundY - rTire + 3;
    yCenterOut = isCompetitor ? groundY - rTire + 14 : groundY - rTire - 8;
    yHub = isCompetitor ? groundY - rTire + 6 : groundY - rTire + 1;
  } else if (isCompetitor) {
    const liftPx = hObsPx * (compState.liftCm / Math.max(0.001, scope.H || 1));
    yCenterOut = groundY - hObsPx - rTire + squishPx;
    yHub = groundY - rTire - liftPx;
    const slope = (groundY - rTire - yHub) / (xc - xPivot);
    yCenterIn =
      vType === 'hydropneumatic'
        ? groundY - rTire
        : groundY - rTire - slope * (xIn - xPivot);
  } else {
    yCenterOut = groundY - hObsPx - rTire;
    yCenterIn = groundY - rTire;
    yHub = (yCenterOut + yCenterIn) / 2;
  }

  const yPivotAxle = groundY - rTire;
  const chassisAngleRad = Math.atan2(yHub - yPivotAxle, xc - xPivot);
  const chassisAngleDeg = (chassisAngleRad * 180) / Math.PI;

  const xCabLocal = 96;
  const cabRoofH = 148;
  const xGpsRef = xPivot + xCabLocal;
  const cosA = Math.cos(chassisAngleRad);
  const sinA = Math.sin(chassisAngleRad);
  const xGps = xPivot + xCabLocal * cosA + cabRoofH * sinA;
  const yGps = yPivotAxle + xCabLocal * sinA - cabRoofH * cosA;

  const outerShare = isCompetitor ? compState.outerShare : scope.enstaOuterShare;
  const innerShare = isCompetitor ? compState.innerShare : scope.enstaInnerShare;
  const outerLoadT = isCompetitor ? compState.outerLoadT : scope.enstaOuterLoadT;
  const innerLoadT = isCompetitor ? compState.innerLoadT : scope.enstaInnerLoadT;
  const gpsDriftCm = isCompetitor ? compState.gpsDriftCm : scope.gpsEnstaCm;
  const alphaDeg = isCompetitor ? compState.alphaDeg : scope.alphaEnstaDeg;
  const liftCm = isCompetitor ? compState.liftCm : scope.liftEnstaCm;
  const innerGapPx = Math.max(0, groundY - (yCenterIn + rTire));

  const renderStandardTire = ({ x, yC, loadPct, loadT, punctured, lifted, side }) => {
    const overloaded = loadPct > 65 && !isPuncture;
    const strokeCol = punctured ? '#ef4444' : overloaded ? '#ef4444' : loadPct > 0 ? '#34d399' : '#64748b';
    const tireH = punctured ? rTire * 1.68 : overloaded ? rTire * 1.92 : rTire * 2;
    const tireW = punctured ? 40 : overloaded ? 38 : 34;
    const yTop = punctured ? yC - rTire + 6 : yC - tireH / 2;

    return (
      <g key={side}>
        <rect
          x={x - tireW / 2}
          y={yTop}
          width={tireW}
          height={tireH}
          rx={10}
          fill={punctured ? '#1f1218' : '#0f172a'}
          stroke={strokeCol}
          strokeWidth={overloaded || punctured ? 2.2 : 1.6}
          strokeDasharray={punctured ? '5 3' : undefined}
        />
        {[-28, -14, 0, 14, 28].map((dy) => (
          <g key={dy} opacity={punctured ? 0.35 : 0.75}>
            <rect x={x - tireW / 2 - 2} y={yC + dy - 3} width="3" height="6" rx="1" fill={strokeCol} />
            <rect x={x + tireW / 2 - 1} y={yC + dy - 3} width="3" height="6" rx="1" fill={strokeCol} />
          </g>
        ))}
        <rect
          x={x - 10}
          y={yC - 22}
          width="20"
          height="44"
          rx="4"
          fill="#1e293b"
          stroke={isCompetitor ? '#94a3b8' : '#cbd5e1'}
          strokeWidth="1.5"
        />

        {!lifted && !punctured && (
          <ellipse
            cx={x}
            cy={yTop + tireH}
            rx={overloaded ? 22 : 15}
            ry={overloaded ? 5 : 3.5}
            fill={overloaded ? '#ef4444' : '#34d399'}
            opacity="0.75"
          />
        )}

        <text
          x={x}
          y={groundY + 20}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={punctured ? '#f87171' : overloaded ? '#f87171' : loadPct > 0 ? '#34d399' : '#94a3b8'}
        >
          {punctured ? 'AVARIE (0 %)' : `${fmtNumber(loadPct, 0)} % · ${fmtNumber(loadT, 1)} t`}
        </text>
        <text x={x} y={groundY + 34} textAnchor="middle" fontSize="9.5" className="fill-slate-400">
          {side === 'in'
            ? lifted
              ? 'Dans le vide !'
              : isPuncture
                ? isCompetitor
                  ? 'Porte-à-faux'
                  : 'Run-Flat actif'
                : 'Roue intérieure'
            : punctured
              ? isCompetitor
                ? 'Jante exposée'
                : 'Jante relevée'
              : overloaded
                ? 'Surcharge ×2 !'
                : 'Roue extérieure'}
        </text>
      </g>
    );
  };

  /* Rendu spécialisé du train roulant concurrent selon visualType */
  const renderCompetitorAssembly = () => {
    // 1. Pneu basse pression large (IF/VF 0,8 bar + CTIS ou Pneu Géant OTR)
    if (vType === 'vf_ctis' || vType === 'giant_otr') {
      const isOtr = vType === 'giant_otr';
      const baseW = isOtr ? 86 : 74;
      const bulge = isPuncture ? 14 : Math.min(16, squishPx * 1.15 + 4);
      const yBottom = groundY - hObsPx;
      const yTop = isPuncture ? yBottom - rTire * 1.45 : yBottom - rTire * 2 + squishPx * 1.1;
      const yMid = (yTop + yBottom) / 2;

      return (
        <g>
          {/* Flanc bombé sous contrainte à basse pression */}
          <path
            d={`M ${xSingle - baseW / 2} ${yTop + 10}
                Q ${xSingle - baseW / 2 - bulge} ${yMid} ${xSingle - baseW / 2 + 2} ${yBottom - 4}
                L ${xSingle + baseW / 2 - 2} ${yBottom - 4}
                Q ${xSingle + baseW / 2 + bulge} ${yMid} ${xSingle + baseW / 2} ${yTop + 10}
                Q ${xSingle} ${yTop - 4} ${xSingle - baseW / 2} ${yTop + 10} Z`}
            fill={isPuncture ? '#1f1218' : '#0f172a'}
            stroke="#ef4444"
            strokeWidth="2.3"
            strokeDasharray={isPuncture ? '5 3' : undefined}
          />
          {/* Jante centrale */}
          <rect
            x={xSingle - 22}
            y={yMid - 20}
            width="44"
            height="40"
            rx="6"
            fill="#1e293b"
            stroke="#94a3b8"
            strokeWidth="1.6"
          />
          {!isOtr && (
            <path
              d={`M ${xSingle} ${yMid} L ${xSingle - 26} ${yMid - 26}`}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="3 2"
            />
          )}
          {!isPuncture && (
            <ellipse cx={xSingle} cy={yBottom} rx={34} ry={5} fill="#ef4444" opacity="0.8" />
          )}
          <rect x={xSingle - 64} y={yTop - 22} width="128" height="17" rx="4" fill="#450a0a" stroke="#ef4444" />
          <text x={xSingle} y={yTop - 10} textAnchor="middle" fontSize="8.8" fontWeight="700" fill="#fecaca">
            {isOtr ? 'FLANC OTR BOMBÉ EXPOSÉ' : '0,8 BAR : FLANC ÉCRASÉ (−35 %)'}
          </text>
          <text x={xSingle} y={groundY + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f87171">
            {isPuncture ? 'IMMOBILISÉ (0 RUN-FLAT)' : `100 % sur 1 pneu · ${fmtNumber(scope.F, 1)} t`}
          </text>
          <text x={xSingle} y={groundY + 34} textAnchor="middle" fontSize="9.5" className="fill-slate-400">
            {isOtr ? 'Coupure flanc = 35 k€ + arrêt piste' : 'Essieu rigide : ~68 % du déport RTK subi'}
          </text>
        </g>
      );
    }

    // 2. Chenilles caoutchouc (Terra Trac / Soucy ou Micro-chenilles robotique)
    if (vType === 'rubber_track' || vType === 'micro_track') {
      const isMicro = vType === 'micro_track';
      const yBottom = groundY - hObsPx;
      const trackH = isMicro ? 76 : 94;
      const yTop = yBottom - trackH;

      return (
        <g>
          {/* Bande caoutchouc triangulaire vue de face / 3/4 */}
          <rect
            x={xSingle - 44}
            y={yTop}
            width="88"
            height={trackH}
            rx="16"
            fill="#0f172a"
            stroke="#fb923c"
            strokeWidth="3"
          />
          {[-26, -10, 6, 22].map((dy) => (
            <line
              key={dy}
              x1={xSingle - 42}
              y1={yBottom - trackH / 2 + dy}
              x2={xSingle + 42}
              y2={yBottom - trackH / 2 + dy}
              stroke="#475569"
              strokeWidth="2.5"
            />
          ))}
          {/* Barbotin supérieur + galets inférieurs */}
          <circle cx={xSingle} cy={yTop + 22} r="13" fill="#1e293b" stroke="#fb923c" strokeWidth="2" />
          <circle cx={xSingle - 20} cy={yBottom - 15} r="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.6" />
          <circle cx={xSingle + 20} cy={yBottom - 15} r="10" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
          <ellipse cx={xSingle + 12} cy={yBottom} rx={26} ry={4.5} fill="#ef4444" opacity="0.8" />

          <rect x={xSingle - 64} y={yTop - 22} width="128" height="17" rx="4" fill="#431407" stroke="#fb923c" />
          <text x={xSingle} y={yTop - 10} textAnchor="middle" fontSize="8.8" fontWeight="700" fill="#fed7aa">
            {isMicro ? 'VIBRATIONS HF · −20 % BATTERIE' : 'POINT DUR GALET · 35 À 80 k€'}
          </text>
          <text x={xSingle} y={groundY + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fb923c">
            {isPuncture ? 'DÉCHENILLEMENT / ARRÊT' : `Pic galet ${fmtNumber(outerShare, 0)} % · ${fmtNumber(outerLoadT, 1)} t`}
          </text>
          <text x={xSingle} y={groundY + 34} textAnchor="middle" fontSize="9.5" className="fill-slate-400">
            {isMicro ? 'Basculement arête + bruitage LiDAR' : 'Surconso +15 à +25 % GNR · Ripage'}
          </text>
        </g>
      );
    }

    // 3. Pneu plein / mousse / chaîné (0 % amortissement, ondes de choc)
    if (vType === 'solid_chained') {
      const yBottom = groundY - hObsPx;
      const yC = yBottom - rTire;

      return (
        <g>
          <rect
            x={xSingle - 32}
            y={yC - rTire}
            width="64"
            height={rTire * 2}
            rx="9"
            fill="#1e293b"
            stroke="#ef4444"
            strokeWidth="2.6"
          />
          {/* Maillons de chaîne de protection / gomme pleine hachurée */}
          {[-34, -17, 0, 17, 34].map((dy) => (
            <line
              key={dy}
              x1={xSingle - 31}
              y1={yC + dy}
              x2={xSingle + 31}
              y2={yC + dy + 6}
              stroke="#94a3b8"
              strokeWidth="2"
            />
          ))}
          <rect x={xSingle - 14} y={yC - 20} width="28" height="40" rx="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.6" />
          {/* Ondes de choc rouges remontant dans l'essieu */}
          {scope.H > 0.5 && (
            <g stroke="#ef4444" fill="none" strokeWidth="2">
              <path d={`M ${xSingle - 22} ${yC - rTire - 6} Q ${xSingle} ${yC - rTire - 18} ${xSingle + 22} ${yC - rTire - 6}`} />
              <path d={`M ${xSingle - 32} ${yC - rTire - 14} Q ${xSingle} ${yC - rTire - 28} ${xSingle + 32} ${yC - rTire - 14}`} opacity="0.7" />
            </g>
          )}
          <rect x={xSingle - 68} y={yC - rTire - 42} width="136" height="17" rx="4" fill="#450a0a" stroke="#ef4444" />
          <text x={xSingle} y={yC - rTire - 30} textAnchor="middle" fontSize="8.8" fontWeight="700" fill="#fecaca">
            0 % AMORTISSEMENT · CHOC 100 %
          </text>
          <text x={xSingle} y={groundY + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f87171">
            Choc intégral · {fmtNumber(scope.F, 1)} t
          </text>
          <text x={xSingle} y={groundY + 34} textAnchor="middle" fontSize="9.5" className="fill-slate-400">
            Casse réducteurs/essieu · TMS · Max 25 km/h
          </text>
        </g>
      );
    }

    // 4. Pneu sans air (Airless / Tweel à rayons polyuréthane ouverts)
    if (vType === 'airless_tweel') {
      const yBottom = groundY - hObsPx;
      const sq = compState.buckling ? Math.min(20, squishPx + 8) : squishPx;
      const yTop = yBottom - rTire * 2 + sq;
      const yC = (yTop + yBottom) / 2;

      return (
        <g>
          {/* Bande de roulement externe fine + moyeu central + rayons PU déformés */}
          <rect
            x={xSingle - 30}
            y={yTop}
            width="60"
            height={yBottom - yTop}
            rx="12"
            fill="rgba(15, 23, 42, 0.35)"
            stroke={compState.buckling ? '#ef4444' : '#fb923c'}
            strokeWidth="3.5"
          />
          {[-26, -13, 0, 13, 26].map((dy) => {
            const bend = dy > 0 ? (compState.buckling ? 12 : 6) : 2;
            return (
              <g key={dy}>
                <path
                  d={`M ${xSingle - 10} ${yC + dy * 0.45} Q ${xSingle - 20} ${yC + dy + bend} ${xSingle - 29} ${yC + dy}`}
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  fill="none"
                />
                <path
                  d={`M ${xSingle + 10} ${yC + dy * 0.45} Q ${xSingle + 20} ${yC + dy + bend} ${xSingle + 29} ${yC + dy}`}
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  fill="none"
                />
              </g>
            );
          })}
          <rect x={xSingle - 11} y={yC - 18} width="22" height="36" rx="4" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x={xSingle - 68} y={yTop - 22} width="136" height="17" rx="4" fill="#450a0a" stroke="#ef4444" />
          <text x={xSingle} y={yTop - 10} textAnchor="middle" fontSize="8.6" fontWeight="700" fill="#fecaca">
            {compState.buckling ? 'FLAMBEMENT RAYONS (> 3 t) !' : 'RAYONS OUVERTS · REBOND'}
          </text>
          <text x={xSingle} y={groundY + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f87171">
            {compState.buckling ? `Surcharge ${fmtNumber(scope.F, 1)} t (> 3 t)` : `100 % sur rayons · ${fmtNumber(scope.F, 1)} t`}
          </text>
          <text x={xSingle} y={groundY + 34} textAnchor="middle" fontSize="9.5" className="fill-slate-400">
            Bourrage boue/graviers · Rebond non amorti
          </text>
        </g>
      );
    }

    // 5. Châssis articulé actif (Rocker-Bogie motorisé / servomoteurs)
    if (vType === 'active_rocker') {
      const yBottom = groundY - hObsPx;
      const yC = yBottom - rTire;

      return (
        <g>
          {/* Bras articulé motorisé + servomoteur + câble */}
          <line x1={xc - 36} y1={yHub} x2={xSingle} y2={yC} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
          <rect x={xc - 50} y={yHub - 16} width="32" height="28" rx="5" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.8" />
          <circle cx={xc - 34} cy={yHub - 2} r="6" fill="#f59e0b" />
          <rect
            x={xSingle - 22}
            y={yC - rTire}
            width="44"
            height={rTire * 2}
            rx="10"
            fill="#0f172a"
            stroke="#fb923c"
            strokeWidth="2"
          />
          <rect x={xSingle - 10} y={yC - 18} width="20" height="36" rx="4" fill="#1e293b" stroke="#cbd5e1" />
          <rect x={xc - 64} y={yHub - 44} width="152" height="18" rx="4" fill="#431407" stroke="#f59e0b" />
          <text x={xc + 12} y={yHub - 32} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fde68a">
            ⚡ SERVO ACTIF · DÉTRUIT PAR γ
          </text>
          <text x={xSingle} y={groundY + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fb923c">
            {isPuncture ? 'PANNE ACTIONNEUR / CODEUR' : `Asservi (${fmtNumber(outerShare, 0)} %) · Conso > 0 W`}
          </text>
          <text x={xSingle} y={groundY + 34} textAnchor="middle" fontSize="9.5" className="fill-slate-400">
            Incompatible CNPE/nucléaire · Fragile eau/boue
          </text>
        </g>
      );
    }

    // 6. Suspension Hydropneumatique / Essieu Pendulaire Hydraulique (fort encombrement sous châssis)
    if (vType === 'hydropneumatic') {
      return (
        <g>
          {/* Vérin hydraulique haut + sphère d'azote dépassant au-dessus de l'essieu (sous châssis) */}
          <rect
            x={xc - 46}
            y={yHub - 88}
            width="92"
            height="74"
            rx="6"
            fill="rgba(239, 68, 68, 0.10)"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <rect x={xc - 9} y={yHub - 72} width="18" height="58" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx={xc + 22} cy={yHub - 58} r="13" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
          <text x={xc + 22} y={yHub - 55} textAnchor="middle" fontSize="8" fontWeight="700" fill="#d1fae5">
            N₂
          </text>
          <line x1={xIn} y1={yCenterIn} x2={xOut} y2={yCenterOut} stroke="#64748b" strokeWidth="9" />
          <rect x={xc - 72} y={yHub - 108} width="144" height="17" rx="4" fill="#450a0a" stroke="#ef4444" />
          <text x={xc} y={yHub - 96} textAnchor="middle" fontSize="8.4" fontWeight="700" fill="#fecaca">
            HORS-GABARIT MINES LHD / GSE
          </text>

          {renderStandardTire({
            x: xIn,
            yC: yCenterIn,
            loadPct: innerShare,
            loadT: innerLoadT,
            punctured: false,
            lifted: false,
            side: 'in',
          })}
          {renderStandardTire({
            x: xOut,
            yC: yCenterOut,
            loadPct: outerShare,
            loadT: outerLoadT,
            punctured: isPuncture,
            lifted: false,
            side: 'out',
          })}
        </g>
      );
    }

    // 7. Jumelage classique rigide / Jumelage TP avec roche piégée / Bogie tandem rigide en dévers
    return (
      <g>
        {vType === 'bogie_tandem' && (
          <g>
            <rect x={xIn - 8} y={yCenterIn - 64} width={xOut - xIn + 16} height="16" rx="4" fill="#334155" stroke="#fb923c" />
            <text x={xc} y={yCenterIn - 53} textAnchor="middle" fontSize="8.3" fontWeight="700" fill="#fed7aa">
              BOGIE +2 t · 100 % RIGIDE EN DÉVERS
            </text>
          </g>
        )}
        <line x1={xIn} y1={yCenterIn} x2={xOut} y2={yCenterOut} stroke="#64748b" strokeWidth="14" />
        <line x1={xIn} y1={yCenterIn} x2={xOut} y2={yCenterOut} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />

        {renderStandardTire({
          x: xIn,
          yC: yCenterIn,
          loadPct: innerShare,
          loadT: innerLoadT,
          punctured: false,
          lifted: !isPuncture && innerShare <= 1,
          side: 'in',
        })}
        {renderStandardTire({
          x: xOut,
          yC: yCenterOut,
          loadPct: outerShare,
          loadT: outerLoadT,
          punctured: isPuncture,
          lifted: false,
          side: 'out',
        })}

        {/* Roche coincée entre les deux flancs en mode BTP Jumelage Rigide */}
        {vType === 'rigid_twin_rock' && !isPuncture && scope.H > 1.5 && (
          <g>
            <polygon
              points={`${xc - 13},${yHub + 16} ${xc + 2},${yHub + 4} ${xc + 14},${yHub + 18} ${xc + 5},${yHub + 32} ${xc - 10},${yHub + 29}`}
              fill="#b45309"
              stroke="#fde68a"
              strokeWidth="1.5"
            />
            <rect x={xc - 42} y={yHub - 16} width="84" height="16" rx="4" fill="#450a0a" stroke="#ef4444" />
            <text x={xc} y={yHub - 5} textAnchor="middle" fontSize="8.3" fontWeight="700" fill="#fecaca">
              ROCHE PIÉGÉE !
            </text>
          </g>
        )}

        {!isPuncture && innerGapPx > 4 && (
          <g>
            <line x1={xIn} y1={yCenterIn + rTire + 2} x2={xIn} y2={groundY - 2} stroke="#f87171" strokeWidth="1.8" strokeDasharray="2 2" />
            <rect x={xIn - 36} y={yCenterIn - 10} width="72" height="18" rx="4" fill="#450a0a" stroke="#ef4444" />
            <text x={xIn} y={yCenterIn + 3} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fecaca">
              DÉCOLLÉ !
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${Hsvg}`}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full select-none"
      role="img"
      aria-label={
        isCompetitor
          ? `Coupe frontale ${competitor?.label || 'concurrent'} sur obstacle`
          : 'Coupe frontale roue auto-adaptative R2A ENSTA sur obstacle'
      }
    >
      <defs>
        <pattern id={`${uid}-soil`} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 14L14 0" stroke="#1e293b" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width={W} height={Hsvg} rx="12" fill="#070b14" />

      {/* Axe vertical de référence */}
      <line x1={xGpsRef} y1={16} x2={xGpsRef} y2={groundY} stroke="#334155" strokeDasharray="4 4" />
      <text x={xGpsRef + 4} y={26} fontSize="9.5" className="fill-slate-500">
        Axe réf. {sensorTag}
      </text>

      {/* Sol de référence */}
      <rect x="0" y={groundY} width={W} height={Hsvg - groundY} rx="4" fill="#0b1220" />
      <rect x="0" y={groundY} width={W} height="10" fill={`url(#${uid}-soil)`} />
      <line x1="12" x2={W - 12} y1={groundY} y2={groundY} stroke="#475569" strokeWidth="2" />

      {/* Obstacle de hauteur H */}
      {hObsPx > 0.5 && (
        <g>
          <polygon
            points={`${xObsCenter - 36},${groundY} ${xObsCenter - 22},${groundY - hObsPx} ${xObsCenter + 22},${groundY - hObsPx} ${xObsCenter + 36},${groundY}`}
            fill="#475569"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <text
            x={Math.min(W - 56, xObsCenter + 38)}
            y={groundY - hObsPx / 2 + 3}
            fontSize="10"
            fontWeight="600"
            className="fill-amber-300"
          >
            H={fmtNumber(scope.H, 0)}cm
          </text>
        </g>
      )}

      {/* Roue opposée d'appui gauche de l'essieu */}
      <rect
        x={xPivot - 14}
        y={groundY - rTire * 2}
        width="28"
        height={rTire * 2}
        rx="8"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="1.5"
      />
      <circle cx={xPivot} cy={yPivotAxle} r="5" fill="#475569" />

      {/* Châssis + structure supérieure inclinés selon α_concurrent (ou α/2 R2A) */}
      <g transform={`translate(${xPivot} ${yPivotAxle}) rotate(${chassisAngleDeg.toFixed(2)})`}>
        <line
          x1="0"
          y1="0"
          x2={xc - xPivot}
          y2="0"
          stroke={isCompetitor ? '#64748b' : '#22c55e'}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect x={xCabLocal - 40} y="-38" width="80" height="36" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <polygon
          points={`${xCabLocal - 34},-38 ${xCabLocal - 26},-${cabRoofH - 8} ${xCabLocal + 26},-${cabRoofH - 8} ${xCabLocal + 34},-38`}
          fill="rgba(30, 41, 59, 0.55)"
          stroke={isCompetitor ? '#64748b' : '#38bdf8'}
          strokeWidth="1.5"
        />
        <polygon
          points={`${xCabLocal - 24},-${cabRoofH - 22} ${xCabLocal + 24},-${cabRoofH - 22} ${xCabLocal + 28},-52 ${xCabLocal - 28},-52`}
          fill="rgba(56, 189, 248, 0.08)"
          stroke="#334155"
        />
        <rect x={xCabLocal - 30} y={-cabRoofH - 4} width="60" height="7" rx="3" fill="#cbd5e1" />
        <path
          d={`M${xCabLocal - 10},${-cabRoofH - 4} C${xCabLocal - 10},${-cabRoofH - 16} ${xCabLocal + 10},${-cabRoofH - 16} ${xCabLocal + 10},${-cabRoofH - 4} Z`}
          fill="#f59e0b"
          stroke="#fef3c7"
          strokeWidth="1.2"
        />
      </g>

      {/* Vecteur de déport latéral ΔX au sommet */}
      {Math.abs(xGps - xGpsRef) > 1.5 && (
        <g>
          <line
            x1={xGpsRef}
            y1={yGps - 14}
            x2={xGps}
            y2={yGps - 14}
            stroke={isCompetitor ? '#ef4444' : '#34d399'}
            strokeWidth="2.5"
          />
          <circle cx={xGps} cy={yGps - 14} r="3.5" fill={isCompetitor ? '#ef4444' : '#34d399'} />
        </g>
      )}
      <rect
        x="14"
        y="34"
        width="196"
        height="36"
        rx="7"
        fill="#0f172a"
        stroke={isCompetitor && gpsDriftCm > 3.5 ? '#ef444466' : '#334155'}
      />
      <text x="22" y="49" fontSize="10" fontWeight="700" fill={isCompetitor ? '#fca5a5' : '#6ee7b7'}>
        {sensorTag} : ΔX = {fmtNumber(gpsDriftCm, 1)} cm {!isCompetitor && scope.H > 0 && !isPuncture ? '(÷ 2)' : ''}
      </text>
      <text x="22" y="63" fontSize="9.5" className="fill-slate-400">
        Inclinaison α = {fmtNumber(alphaDeg, 1)}° · Essieu +{fmtNumber(liftCm, 1)} cm
      </text>

      {/* Train roulant : Concurrent sélectionné VS Mécanisme à balanciers R2A ENSTA */}
      {isCompetitor ? (
        renderCompetitorAssembly()
      ) : (
        <g>
          <rect x={xIn + 11} y={yCenterIn - 32} width="5" height="64" rx="2" fill="#cbd5e1" />
          <rect x={xOut - 16} y={yCenterOut - 32} width="5" height="64" rx="2" fill="#cbd5e1" />
          <rect x={xIn + 16} y={yHub - 26} width="7" height="14" rx="1.5" fill="#f97316" />
          <rect x={xOut - 23} y={yHub - 26} width="7" height="14" rx="1.5" fill="#f97316" />
          <rect x={xIn + 15} y={yHub - 23} width="2.5" height="9" fill="#facc15" />
          <rect x={xOut - 17.5} y={yHub - 23} width="2.5" height="9" fill="#facc15" />
          <line x1={xIn + 13} y1={yCenterIn - 14} x2={xOut - 13} y2={yCenterOut - 14} stroke="#38bdf8" strokeWidth="4" />
          <line x1={xIn + 13} y1={yCenterIn + 14} x2={xOut - 13} y2={yCenterOut + 14} stroke="#38bdf8" strokeWidth="4" />
          <rect x={xc - 13} y={yHub - 24} width="26" height="48" rx="7" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx={xc} cy={yHub} r="6" fill="#22c55e" stroke="#052e16" strokeWidth="1.5" />
          <circle cx={xc} cy={yHub - 14} r="4" fill="#e0f2fe" />
          <circle cx={xc} cy={yHub + 14} r="4" fill="#e0f2fe" />
          <circle cx={xIn + 13} cy={yCenterIn - 14} r="3.5" fill="#38bdf8" />
          <circle cx={xOut - 13} cy={yCenterOut - 14} r="3.5" fill="#38bdf8" />

          {renderStandardTire({
            x: xIn,
            yC: yCenterIn,
            loadPct: innerShare,
            loadT: innerLoadT,
            punctured: false,
            lifted: false,
            side: 'in',
          })}
          {renderStandardTire({
            x: xOut,
            yC: yCenterOut,
            loadPct: outerShare,
            loadT: outerLoadT,
            punctured: isPuncture,
            lifted: false,
            side: 'out',
          })}

          {!isPuncture && scope.H > 1 && (
            <g>
              <text x={xOut} y={yCenterOut - rTire - 7} textAnchor="middle" fontSize="10" fontWeight="700" fill="#34d399">
                ↑ +{fmtNumber(scope.H / 2, 1)} cm (+H/2)
              </text>
              <text x={xIn} y={yCenterIn - rTire - 7} textAnchor="middle" fontSize="10" fontWeight="700" fill="#38bdf8">
                ↓ −{fmtNumber(scope.H / 2, 1)} cm (−H/2)
              </text>
            </g>
          )}
        </g>
      )}

      {isPuncture && (
        <g>
          <rect
            x="214"
            y="34"
            width="232"
            height="36"
            rx="7"
            fill={isCompetitor ? '#450a0a' : '#064e3b'}
            stroke={isCompetitor ? '#ef4444' : '#34d399'}
          />
          <text x="330" y="49" textAnchor="middle" fontSize="9.8" fontWeight="700" fill={isCompetitor ? '#fecaca' : '#a7f3d0'}>
            {isCompetitor ? '0 REDONDANCE RUN-FLAT PASSIVE' : 'RUN-FLAT MÉCANIQUE R2A ACTIF'}
          </text>
          <text x="330" y="63" textAnchor="middle" fontSize="9" fill={isCompetitor ? '#fca5a5' : '#d1fae5'}>
            {isCompetitor ? 'Arrêt terrain ou surcharge critique' : 'La roue intacte reprend la charge → continuité'}
          </text>
        </g>
      )}
    </svg>
  );
}

/* ------------------------ bouton toggle crevaison ----------------------- */
function ToggleField({ label, value, onChange, onLabel = 'Actif', offLabel = 'Inactif', help }) {
  const active = value > 0;
  return (
    <div
      className={`rounded-xl border p-3 transition ${
        active ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-800 bg-slate-950/50'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => onChange(active ? 0 : 1)}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            active
              ? 'bg-amber-500 text-slate-950'
              : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${active ? 'bg-slate-950' : 'bg-slate-500'}`} />
          {active ? onLabel : offLabel}
        </button>
      </div>
      {help && <p className="mt-1.5 text-xs text-slate-400">{help}</p>}
    </div>
  );
}

/* ------------------------------ composant ------------------------------ */
function SimulatorInner() {
  const { sector } = useSector();
  const { isPrivileged } = useSecurity();
  const labels = sector.kinematicsLabels || {};
  const callout = sector.simulatorCallout || {};
  const competitors = useMemo(
    () => cfg.competitorsBySector?.[sector.id] || cfg.competitorsBySector?.agri || [],
    [sector.id],
  );

  const [competitorId, setCompetitorId] = useState(() => competitors[0]?.id || '');
  const competitor = useMemo(
    () => competitors.find((c) => c.id === competitorId) || competitors[0],
    [competitors, competitorId],
  );

  const controls = useMemo(
    () =>
      cfg.controls.map((c) => ({
        ...c,
        ...(sector.kinematicsRanges?.[c.id] || {}),
        label: c.id === 'gpsHeightM' && labels.sensorHeightControl ? labels.sensorHeightControl : c.label,
      })),
    [sector, labels.sensorHeightControl],
  );
  const [params, setParams] = useState(() => ({ ...cfg.defaults, ...sector.kinematicsPreset }));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [detailTab, setDetailTab] = useState('charts');

  useEffect(() => {
    if (!animating) return undefined;
    let raf;
    const start = performance.now();
    const peak = Math.max(6, params.obstacleCm || 14);
    const loop = (now) => {
      const t = ((now - start) / 3200) % 1;
      const wave = 0.5 - 0.5 * Math.cos(t * 2 * Math.PI);
      setParams((p) => ({ ...p, obstacleCm: +(peak * wave).toFixed(1) }));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating]);

  const scope = useMemo(() => buildScope(params, controls), [params, controls]);
  const compState = useMemo(() => computeCompetitorState(scope, competitor), [scope, competitor]);

  const metrics = useMemo(() => {
    const compMap = {
      outerLoad: compState.outerLoadT,
      outerSharePct: compState.outerShare,
      innerSharePct: compState.innerShare,
      axleLift: compState.liftCm,
      tiltAngle: compState.alphaDeg,
      gpsDrift: compState.gpsDriftCm,
    };
    return cfg.metrics.map((m) => ({
      ...m,
      label: m.id === 'gpsDrift' && labels.sensorDriftMetric ? labels.sensorDriftMetric : m.label,
      rigidValue: compMap[m.id] ?? evaluate(m.rigid, scope),
      enstaValue: evaluate(m.ensta, scope),
    }));
  }, [scope, compState, labels.sensorDriftMetric]);

  const isPuncture = scope.puncture > 0;
  const loadGainPct =
    compState.outerLoadT > 0 ? Math.round((1 - scope.enstaOuterLoadT / compState.outerLoadT) * 100) : 50;
  const driftGainPct =
    compState.gpsDriftCm > 0 ? Math.round((1 - scope.gpsEnstaCm / compState.gpsDriftCm) * 100) : 0;

  const set = (id) => (value) => {
    if (id === 'obstacleCm' && animating) setAnimating(false);
    setParams((p) => ({ ...p, [id]: value }));
  };
  const reset = () => {
    setAnimating(false);
    setCompetitorId(competitors[0]?.id || '');
    setParams({ ...cfg.defaults, ...sector.kinematicsPreset });
  };

  const charts = useMemo(() => {
    const ctl = controls.find((c) => c.id === cfg.chart.xControl);
    if (!ctl) return null;
    const loadComp = [];
    const loadEnsta = [];
    const gpsComp = [];
    const gpsEnsta = [];
    const n = 50;
    for (let i = 0; i <= n; i += 1) {
      const x = ctl.min + ((ctl.max - ctl.min) * i) / n;
      const s = buildScope({ ...params, puncture: 0, [ctl.id]: x }, controls);
      const cs = computeCompetitorState(s, competitor);
      loadComp.push({ x, y: cs.outerLoadT });
      loadEnsta.push({ x, y: s.enstaOuterLoadT });
      gpsComp.push({ x, y: cs.gpsDriftCm });
      gpsEnsta.push({ x, y: s.gpsEnstaCm });
    }
    return { ctl, loadComp, loadEnsta, gpsComp, gpsEnsta };
  }, [params, controls, competitor]);

  const visible = controls.filter((c) => showAdvanced || !c.advanced);

  const simTabs = [
    { id: 'charts', label: 'Vue Graphique & Courbes (0 à 25 cm)', icon: 'TrendingUp' },
    { id: 'table', label: 'Tableau de Synthèse Mécanique', icon: 'Table' },
  ];

  const sectionSubtitle = cfg.subtitleBySector?.[sector.id] || cfg.subtitleBySector?.agri;
  const chartTitle = cfg.chart.titleBySector?.[sector.id] || cfg.chart.titleBySector?.agri;

  return (
    <Section
      id="simulateur"
      eyebrow={`Simulation coupe frontale multi-concurrents · ${sector.label}`}
      eyebrowIcon="Gauge"
      title={cfg.title}
      subtitle={sectionSubtitle}
    >
      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        {/* ------- panneau de contrôle ------- */}
        <Card className="h-fit p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="flex items-center gap-2 font-display text-sm font-bold text-white" style={{ color: sector.color }}>
              <Icon name={sector.icon} size={17} /> {sector.label}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                className="btn-ghost px-3 text-xs"
                onClick={() => setAnimating((a) => !a)}
                aria-label={animating ? 'Arrêter le cycle' : 'Animer un franchissement'}
                title="Animer la montée sur l'obstacle (0 → H)"
              >
                <Icon name={animating ? 'Pause' : 'Play'} size={15} className="text-amber-400" />
                <span>{animating ? 'Pause' : 'Animer'}</span>
              </button>
              <button
                type="button"
                className="btn-ghost px-2.5"
                onClick={reset}
                aria-label="Réinitialiser"
                title="Valeurs par défaut"
              >
                <Icon name="RotateCcw" size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {visible.map((c) =>
              c.type === 'toggle' ? (
                <ToggleField
                  key={c.id}
                  label={c.label}
                  value={params[c.id]}
                  onChange={set(c.id)}
                  onLabel={c.onLabel}
                  offLabel={c.offLabel}
                  help={c.help}
                />
              ) : (
                <RangeField
                  key={c.id}
                  label={c.label}
                  unit={c.unit}
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  decimals={c.decimals}
                  value={params[c.id]}
                  onChange={set(c.id)}
                  help={c.help}
                />
              ),
            )}
          </div>

          <button
            type="button"
            className="mt-5 text-xs font-semibold text-amber-400 hover:underline"
            onClick={() => setShowAdvanced((s) => !s)}
          >
            {showAdvanced ? 'Masquer' : 'Afficher'} le réglage de voie d&apos;essieu
          </button>

          {/* Encadré contextuel adapté à 100 % au secteur actif */}
          {callout.title && (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/65 p-4 text-xs leading-relaxed text-slate-300">
              <p className="font-display font-bold text-white" style={{ color: sector.color }}>
                {callout.title}
              </p>
              <p className="mt-1 text-slate-400">{callout.text}</p>
            </div>
          )}
        </Card>

        {/* ------- sélecteur de technologie concurrente + scènes coupe frontale ------- */}
        <div className="space-y-6">
          {/* SÉLECTEUR DE TECHNOLOGIE CONCURRENTE À COMPARER FACE À R2A */}
          <Card className="border-slate-800 bg-slate-900/75 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
                Sélecteur de Technologie Concurrente à comparer ({sector.label}) :
              </p>
              <span className="font-mono text-[11px] text-slate-400">4 solutions de référence du marché</span>
            </div>

            <div
              className="mt-3 grid gap-2 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Technologie concurrente à comparer"
            >
              {competitors.map((comp, idx) => {
                const active = comp.id === competitor?.id;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCompetitorId(comp.id)}
                    className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${
                      active
                        ? 'border-red-400/60 bg-red-500/10 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md font-mono text-[11px] font-bold ${
                        active ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-semibold leading-snug">{comp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Badge d'alerte spécifique au concurrent sélectionné */}
            {competitor?.alertBadge && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-100">
                <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0 text-amber-400" />
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    Limite critique concurrent :{' '}
                  </span>
                  <span className="font-medium">{competitor.alertBadge}</span>
                </div>
              </div>
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* PANNEAU GAUCHE : CONCURRENT SÉLECTIONNÉ */}
            <Card className="p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-white sm:text-lg">
                  {competitor?.shortLabel || 'Jumelage rigide'}
                </h3>
                {isPuncture ? (
                  <Badge tone="bad">0 Run-Flat passif · Arrêt / Risque</Badge>
                ) : compState.buckling ? (
                  <Badge tone="bad">Flambement (&gt; 3 t) !</Badge>
                ) : compState.outerShare >= 85 ? (
                  <Badge tone="bad">Surcharge / Choc {fmtNumber(compState.outerShare, 0)} %</Badge>
                ) : (
                  <Badge tone="warn">{competitor?.architectureSummary || `Charge ${fmtNumber(compState.outerShare, 0)} %`}</Badge>
                )}
              </div>
              <FrontalObstacleScene
                uid="competitor-front"
                mode="competitor"
                scope={scope}
                compState={compState}
                competitor={competitor}
                labels={labels}
              />
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                {isPuncture ? competitor?.punctureText : competitor?.behaviorText}
              </p>
            </Card>

            {/* PANNEAU DROIT : ROUE R2A ENSTA BRETAGNE (RÉFÉRENCE BREVETÉE) */}
            <Card className="p-5 sm:p-6" style={{ borderColor: '#f59e0b55' }}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-white sm:text-lg">Roue R2A ENSTA Bretagne</h3>
                {isPuncture ? (
                  <Badge tone="good">Run-Flat : continuité sur 1 roue</Badge>
                ) : (
                  <Badge tone="good">50 % / 50 % · α / 2 · 0 W · Intra-jante</Badge>
                )}
              </div>
              <FrontalObstacleScene
                uid="ensta-front"
                mode="ensta"
                scope={scope}
                compState={compState}
                competitor={competitor}
                labels={labels}
              />
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                {isPuncture
                  ? `La roue intacte reprend la charge pour permettre de rentrer en sécurité ${labels.returnTarget || "à l'atelier"} sans assistance lourde.`
                  : `Par effet de balancier (+H/2 / −H/2) logé dans la jante (0 Watt), les deux roues restent au sol : charge répartie 50 % / 50 % et déport (${labels.svgSensorTag || 'sommet'}) divisé par 2.`}
              </p>
            </Card>
          </div>

          {/* Bandeau d'analyse comparative synthétique */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 px-5 py-4">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                {cfg.legend.pressureOk}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                Surcharge / contrainte ({competitor?.shortLabel})
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" />
                {cfg.legend.balancier}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                {cfg.legend.gps}
              </li>
            </ul>
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-2xl font-black tabular-nums text-emerald-400 sm:text-3xl">
                {isPuncture
                  ? 'Run-Flat Natif'
                  : driftGainPct > 0
                    ? `−${fmtNumber(loadGainPct, 0)} % charge · −${fmtNumber(driftGainPct, 0)} % déport`
                    : '0 Watt · 100 % Intra-jante'}
              </span>
              <span className="text-xs text-slate-400">face à {competitor?.shortLabel}</span>
            </div>
          </div>

          {/* Divulgation progressive : 2 Onglets (Courbes 0-25 cm vs Tableau de Synthèse) */}
          <div className="space-y-5">
            <SegmentedTabs
              tabs={simTabs}
              activeId={detailTab}
              onChange={setDetailTab}
              ariaLabel="Analyse détaillée du franchissement"
            />

            {detailTab === 'charts' && charts && (
              <Card className="p-6 md:p-7">
                <h3 className="font-display text-xl font-bold text-white">{chartTitle}</h3>
                <div className="mt-5 grid gap-8 lg:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-300">
                      1. Charge unitaire maximale sur l&apos;obstacle (tonnes) —{' '}
                      <span className="font-mono text-amber-300">F = {fmtNumber(scope.F, 1)} t</span>
                    </p>
                    <LineChart
                      series={[
                        {
                          label: `${competitor?.shortLabel || 'Concurrent'} (${fmtNumber(competitor?.peakShareAtObstacle ?? 100, 0)} %)`,
                          color: '#ef4444',
                          points: charts.loadComp,
                        },
                        { label: 'Roue R2A ENSTA (50 % constant)', color: '#34d399', points: charts.loadEnsta },
                      ]}
                      xDomain={[charts.ctl.min, charts.ctl.max]}
                      yDomain={[0, Math.max(scope.F * 1.1, 2)]}
                      xLabel="Hauteur de l'obstacle H (cm)"
                      yLabel="Charge roue (t)"
                      xFormat={(v) => `${fmtNumber(v, 0)}`}
                      yFormat={(v) => `${fmtNumber(v, 1)} t`}
                      cursorX={params[charts.ctl.id]}
                      height={220}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-300">
                      {labels.sensorChartTitle || '2. Déport latéral au sommet (cm)'} —{' '}
                      <span className="font-mono text-amber-300">H = {fmtNumber(scope.Hgps, 1)} m</span>
                    </p>
                    <LineChart
                      series={[
                        { label: `Déport ${competitor?.shortLabel || 'Concurrent'}`, color: '#ef4444', points: charts.gpsComp },
                        { label: 'Déport R2A ENSTA (ΔX / 2)', color: '#34d399', points: charts.gpsEnsta },
                      ]}
                      xDomain={[charts.ctl.min, charts.ctl.max]}
                      xLabel="Hauteur de l'obstacle H (cm)"
                      yLabel="Déport (cm)"
                      xFormat={(v) => fmtNumber(v, 0)}
                      yFormat={(v) => fmtNumber(v, 0)}
                      cursorX={params[charts.ctl.id]}
                      height={220}
                    />
                  </div>
                </div>
              </Card>
            )}

            {detailTab === 'table' && (
              <Card className={`p-6 md:p-7 ${!isPrivileged ? 'select-none' : ''}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-white">
                    Tableau de Synthèse : {competitor?.shortLabel} vs Roue R2A ({sector.label})
                  </h3>
                  <Badge tone="good">
                    {isPuncture
                      ? 'Mode Run-Flat actif'
                      : `H = ${fmtNumber(scope.H, 1)} cm · F = ${fmtNumber(scope.F, 1)} t`}
                  </Badge>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="th">Indicateur</th>
                        <th className="th text-right">{competitor?.shortLabel || 'Concurrent'}</th>
                        <th className="th text-right">Roue R2A ENSTA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {metrics.map((m) => {
                        const tRigid = !isPuncture ? toneFor(m, m.rigidValue) : null;
                        const tEnsta = !isPuncture ? toneFor(m, m.enstaValue) : null;
                        return (
                          <tr key={m.id}>
                            <td className="td font-medium text-slate-200">{m.label}</td>
                            <td className="td text-right font-mono tabular-nums">
                              <span className="font-semibold text-red-300">{fmtNumber(m.rigidValue, m.decimals)}</span>{' '}
                              <span className="text-xs text-slate-500">{m.unit}</span>
                              {tRigid && (
                                <Badge tone={tRigid.tone} className="ml-2 font-sans">
                                  {tRigid.label}
                                </Badge>
                              )}
                            </td>
                            <td className="td text-right font-mono tabular-nums">
                              <span className="font-semibold text-emerald-300">
                                {fmtNumber(m.enstaValue, m.decimals)}
                              </span>{' '}
                              <span className="text-xs text-slate-500">{m.unit}</span>
                              {tEnsta && (
                                <Badge tone={tEnsta.tone} className="ml-2 font-sans">
                                  {tEnsta.label}
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td className="td font-medium text-slate-200">Architecture, Énergie & Intégration</td>
                        <td className="td text-right text-xs font-semibold text-amber-300">
                          {competitor?.architectureSummary}
                        </td>
                        <td className="td text-right text-xs font-semibold text-emerald-300">
                          0 Watt · 100 % passif logé dans la jante
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 flex gap-2 text-xs leading-relaxed text-slate-400">
                  <Icon name="Info" size={15} className="mt-0.5 shrink-0 text-amber-400" />
                  <span>{cfg.modelNote}</span>
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function KinematicSimulator() {
  const { sector } = useSector();
  return <SimulatorInner key={sector.id} />;
}
