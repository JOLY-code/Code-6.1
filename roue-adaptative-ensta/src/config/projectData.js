/* ============================================================================
 *  projectData.js  —  FICHIER UNIQUE DE CONFIGURATION DU PORTAIL B2B R2A
 *  (Technologie R2A — Roues Auto-Adaptatives ENSTA)
 * ----------------------------------------------------------------------------
 *  100 % piloté par la donnée et personnalisé dynamiquement selon les 3 filières :
 *    - `agri`      : Machinisme Agricole & Remorques Lourdes
 *    - `btp`       : BTP, Carrières, Mines, Convois Lourds & Manutention
 *    - `robotique` : Robotique Terrestre (UGV), Inspection Magnétique & AGV
 * ========================================================================== */

const getEnvVar = (viteKey, fallback = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env && process.env[viteKey]) {
    return process.env[viteKey];
  }
  return fallback;
};

const projectData = {
  /* --------------------------------------------------------------------- */
  /*  MÉTA, IDENTITÉ OFFICIELLE ENSTA & VALORISATION B2B          */
  /* --------------------------------------------------------------------- */
  meta: {
    logoUrl: '/Logo/ENSTA.webp',
    appName: 'Technologie R2A · Roues Auto-Adaptatives',
    navSubtitle: 'ENSTA · Transfert Technologique & Licences B2B',
    shortName: 'Technologie R2A · ENSTA',
    school: 'ENSTA',
    course: 'Direction des Affaires Juridiques et Valorisation',
    academicCourse: 'Projet Application Système (6.1)',
    year: '2026',
    locale: 'fr-FR',
    currency: 'EUR',
    contactEmail: '',
    disclaimer:
      'Portail officiel de valorisation industrielle de la technologie R2A (ENSTA). Les ordres de grandeur du calculateur TCO sont configurables pour structurer les études de rentabilité avec les constructeurs (OEM), équipementiers et intégrateurs.',
    disclaimerBySector: {
      agri: "Prototype échelle 1 (Ø 1,80 m) validé à TRL 6 sur tracteur John Deere 6155R de 155 cv (16 jours d'essais à Pencran, 3 agriculteurs et 5 chauffeurs). Paramètres TCO configurables pour les constructeurs (OEM) et équipementiers agricoles.",
      btp: "Cinématique R2A validée à TRL 6 sur porteur lourd (Ø 1,80 m, course verticale de 16 cm) et déclinée en roulettes industrielles forte charge. Paramètres TCO configurables pour les constructeurs d'engins TP, miniers, convois SPMT et manutention lourde.",
      robotique:
        "Portefeuille R2A validé sur 4 démonstrateurs fonctionnels (robot terrestre UGV, crawler à roues magnétiques déformables en conduite forcée EDF, robot sous-marin et roulette industrielle AGV). Paramètres TCO configurables pour les intégrateurs robotiques.",
    },
  },

  valorisationContacts: {
    department: 'Direction des Affaires Juridiques et Valorisation — ENSTA',
    negotiators: [
      { name: 'Caroline PENGAM', role: 'Direction des Affaires Juridiques & Valorisation (Accords & Licences)' },
      { name: 'Maryline BENARD', role: 'Référente Valorisation Industrielle & Transfert Technologique' },
    ],
    inventor: {
      name: "Yannick ARGOUARC'H",
      role: 'Inventeur & Référent Technique R2A · ENSTA (co-inventeur avec H. Trébaol)',
    },
  },

  team: {
    students: [
      { name: 'Magda BIHAN', role: 'Responsable Lot 1 · Technique & Description de l’offre' },
      { name: 'Mathéo JOLY', role: 'Responsable Lot 2 · Business Plan & Stratégie' },
      { name: 'Marc BONNAFOUX', role: 'Responsable Lot 3 · Communication & Prospection' },
    ],
    supervisors: [
      { name: 'Maryline BENARD', role: 'Commanditaire / Sponsor & Référente École' },
      { name: "Yannick ARGOUARC'H", role: 'Référent Technique & Co-inventeur des Brevets' },
    ],
  },

  patents: [
    {
      id: 'FR2111969 · EP 4 180 239',
      shortId: 'EP 4 180 239 (Unitaire 17 pays)',
      title:
        "Roue terrestre auto-adaptative : système de rappel élastique, centrage dynamique et contrôle anti-vibration (validé jusqu'à 50 km/h)",
      status: 'Brevet Unitaire (17 pays EU) + FR',
      holders: '100 % ENSTA',
      inventors: "Y. Argouarc'h, H. Trébaol",
      note: 'Propriété exclusive 100 % ENSTA sur la roue terrestre — liberté totale de licence industrielle.',
    },
    {
      id: 'FR3110111 · EP 4 153 434 B1 · CA 3 183 669 A1',
      shortId: 'EP 4 153 434 B1 / CA 3 183 669 A1',
      title:
        'Dispositif de roulement auto-adaptatif à répartition de charge équilibrée (roue terrestre et roue magnétique déformable à disques)',
      status: 'Délivré (FR, EU, UK, CH) & Canada',
      holders: 'Copropriété ENSTA / EDF',
      inventors: "Y. Argouarc'h, H. Trébaol",
      note: 'Couvre l’Europe (dont Royaume-Uni et Suisse) et le Canada, incluant la roue magnétique et la roue terrestre.',
    },
  ],

  /* --------------------------------------------------------------------- */
  /*  PORTAIL D'ACCUEIL EXÉCUTIF À DOUBLE ENTRÉE (WelcomeGate)              */
  /* --------------------------------------------------------------------- */
  welcomeGate: {
    eyebrow: 'Portail Industriel B2B · Transfert Technologique & Licences ENSTA',
    title: 'Technologie R2A · Roues Auto-Adaptatives',
    subtitle:
      "Sélectionnez votre filière industrielle puis choisissez votre parcours : évaluez d'abord vos contraintes et seuils de prix sans biais, ou explorez directement les démonstrateurs, vidéos et simulateurs.",
    patentBadges: [
      { code: 'EP 4 180 239', detail: '100 % ENSTA · Brevet Unitaire 17 pays UE + FR' },
      { code: 'EP 4 153 434 B1', detail: 'Délivré Europe, UK, Suisse & Canada (ENSTA / EDF)' },
    ],
    sectorPrompt: '1. Choisissez votre filière industrielle :',
    cards: {
      surveyFirst: {
        badge: 'Recommandé en entretien & salon B2B',
        title: '1. Répondre directement à la Consultation Industrielle (~3 min)',
        subtitle:
          "Évaluez vos contraintes de liaison au sol et vos seuils de rentabilité avant de découvrir nos démonstrations et résultats d'essais.",
        cta: 'Démarrer la consultation en mode Focus',
        highlights: [
          'Recueil objectif des besoins et du prix psychologique (sans biais)',
          'Rappel synthétique du principe mécanique R2A (+H/2 / −H/2) intégré',
          'Accès immédiat aux vidéos et au simulateur dès validation',
        ],
      },
      fullPortal: {
        badge: 'Dossier interactif complet · TRL 6',
        title: '2. Accéder à la Présentation Interactive, aux Vidéos & aux Simulateurs',
        subtitle:
          "Découvrez les vidéos d'essais (John Deere 155 cv, UGV, Roue Magnétique EDF), le Pitch Deck 16:9, le simulateur multi-concurrents, le calculateur TCO et les plaquettes PDF.",
        cta: 'Ouvrir le portail interactif complet',
        highlights: [
          'Vidéos terrain (.mp4) & 8 plaquettes officielles bilingues FR / US',
          'Simulateur cinématique multi-concurrents & calculateur TCO par secteur',
          'Conditions de licences DAJV ENSTA (redevance 2 à 6 % + part fixe)',
        ],
      },
    },
  },

  /* --------------------------------------------------------------------- */
  /*  NAVIGATION PRINCIPALE                                                 */
  /* --------------------------------------------------------------------- */
  navigation: [
    { id: 'pitch', label: 'Vision', icon: 'Target' },
    { id: 'demo', label: 'Démo & Supports', icon: 'Film' },
    { id: 'simulateur', label: 'Simulateur', icon: 'Gauge' },
    { id: 'tco', label: 'TCO', icon: 'Calculator' },
    { id: 'technologie', label: 'Technologie', icon: 'Cog' },
    { id: 'cadre', label: 'Cadre & Partenariat', icon: 'Handshake' },
    { id: 'enquete', label: 'Enquête', icon: 'ClipboardList' },
  ],

  /* --------------------------------------------------------------------- */
  /*  SECTEURS — PERSONNALISATION INTÉGRALE DE TOUTE LA PAGE PAR FILIÈRE    */
  /* --------------------------------------------------------------------- */
  sectors: [
    /* ============================ 1. AGRICOLE ============================ */
    {
      id: 'agri',
      label: 'Agricole',
      short: 'Agri',
      icon: 'Tractor',
      color: '#84cc16',
      navSummary: 'TRL 6 (John Deere 6155R · Ø 1,80 m) · EP 4 180 239 (100 % ENSTA) · EP 4 153 434 B1',
      headline: 'Tracteurs de forte puissance, remorques agricoles & automoteurs',
      pitch:
        "Sur chemins empierrés et parcelles irrégulières, le balancier R2A supprime la surcharge sur un seul pneu, préserve le guidage GPS RTK et remplace les masses de lestage en fonte.",
      hero: {
        eyebrow: 'ENSTA · Technologie R2A · Machinisme Agricole & Remorques Lourdes',
        title:
          'La roue jumelée auto-adaptative qui préserve vos sols, stabilise le GPS RTK et divise vos coûts pneus.',
        titleAccent: 'préserve vos sols, stabilise le GPS RTK et divise vos coûts pneus.',
        subtitle:
          "Par effet de balancier 100 % mécanique (+H/2 / −H/2), les deux pneus restent au sol sur chemin défoncé ou en champ : pression d'impact et inclinaison cabine sont divisées par 2 (α/2), avec des pneus standards 2× moins chers que les pneus VF ou chenilles.",
        ctaPrimary: { label: "Simuler un franchissement d'obstacle", target: 'simulateur' },
        ctaSecondary: { label: 'Voir la Vidéo JD 6155R & les Slides', target: 'demo' },
        stats: [
          { value: '100 % ENSTA', label: 'Brevet terrestre EP 4 180 239 (17 pays) + EP 4 153 434 B1' },
          { value: '÷ 2', label: 'Pression au sol & déport GPS RTK (α/2)' },
          { value: 'TRL 6', label: 'Validé sur John Deere 6155R de 155 cv · Ø 1,80 m' },
        ],
        patentBadges: [
          { code: 'EP 4 180 239 · FR2111969', detail: '100 % ENSTA · Brevet Unitaire 17 pays EU' },
          { code: 'EP 4 153 434 B1 · CA 3 183 669', detail: 'Délivré Europe, UK, Suisse & Canada' },
        ],
        visionCards: [
          {
            id: 'agri-prob',
            step: '01',
            title: 'Le Problème du Rigide, des VF & Chenilles',
            icon: 'AlertTriangle',
            tone: 'bad',
            bullets: [
              {
                bold: 'Éclatement sur chemins empierrés :',
                text: 'en jumelage rigide, un seul pneu encaisse 100 % de la charge sur un caillou pendant que la roue jumelle décolle.',
              },
              {
                bold: 'Dérive du sillon GPS RTK & secousses :',
                text: "l'essieu se soulève de H, le toit cabine penche d'un angle α et perturbe l'autoguidage centimétrique.",
              },
              {
                bold: 'Surcoût VF & chenilles en moisson :',
                text: 'les pneus basse pression VF géants et trains chenillés explosent le budget d’achat et de renouvellement.',
              },
            ],
          },
          {
            id: 'agri-sol',
            step: '02',
            title: "L'Effet Balancier R2A Breveté ENSTA",
            icon: 'Sparkles',
            tone: 'good',
            bullets: [
              {
                bold: 'Anti-tassement 50 % / 50 % (+H/2 / −H/2) :',
                text: 'les deux pneus restent plaqués au sol sur obstacle jusqu’à 16 cm de course mécanique.',
              },
              {
                bold: 'Inclinaison divisée par 2 (α / 2) :',
                text: 'antenne GPS RTK, rampes de pulvérisation et bennes stabilisées jusqu’à 50 km/h (validé à Pencran).',
              },
              {
                bold: 'Pneus standards 2× moins chers & Run-Flat :',
                text: 'la mécanique absorbe le choc à la place du caoutchouc, et 1 pneu suffit pour rentrer en moisson.',
              },
            ],
          },
        ],
      },
      trilemma: {
        title: 'Le trilemme du machinisme agricole',
        subtitle:
          'Aucune solution agricole actuelle ne réconcilie anti-tassement en champ, stabilité GPS RTK à 50 km/h et sobriété pneumatique. La roue R2A ENSTA occupe le centre du triangle.',
        axes: [
          {
            id: 'flotation',
            label: 'Portance, Franchissement & Anti-tassement',
            lines: ['Portance, Franchissement', '& Anti-tassement'],
            shortLabel: 'Portance',
          },
          {
            id: 'stability',
            label: 'Vitesse routière (50 km/h) & Stabilité GPS RTK',
            lines: ['Vitesse routière (50 km/h)', '& Stabilité GPS RTK'],
            shortLabel: 'Stabilité GPS',
          },
          {
            id: 'economy',
            label: 'Sobriété économique (Pneus standards & MCO réduit)',
            lines: ['Sobriété économique', '(Pneus standards & MCO réduit)'],
            shortLabel: 'Sobriété éco.',
          },
        ],
        solutions: [
          { id: 'rigid', label: 'Jumelage rigide', scores: [6, 7, 9], color: '#94a3b8' },
          { id: 'tracks', label: 'Chenilles caoutchouc', scores: [9, 3, 2], color: '#fb923c' },
          { id: 'vf_ctis', label: 'Pneus VF + Télégonflage CTIS', scores: [7, 8, 4], color: '#38bdf8' },
          { id: 'ensta', label: 'Roue R2A ENSTA', scores: [9, 8, 8], color: '#84cc16', highlight: true },
        ],
        note: 'Scores comparatifs / 10 (campagne TRL 6 sur John Deere 6155R — 16 jours d’essais & retours utilisateurs).',
      },
      highlights: [
        {
          bold: 'Stabilité GPS RTK & confort (α / 2) :',
          text: 'inclinaison et secousses divisées par 2, validées par 3 agriculteurs et 5 chauffeurs sur JD 6155R.',
        },
        {
          bold: 'Pneus standards 2× moins chers :',
          text: 'alternative durable aux pneus basse pression VF géants et aux chenilles caoutchouc.',
        },
        {
          bold: 'Lestage utile 400 kg & Run-Flat :',
          text: 'remplace ~1 800 € de masses fonte sur tracteur et évite toute immobilisation en pleine moisson.',
        },
      ],
      painPoints: [
        "Éclatement des pneus jumelés sur les cailloux des chemins d'accès et lors des moissons (remorques/tracteurs)",
        'Perturbation du GPS RTK en haut de cabine et secousses quand le tracteur franchit un obstacle ou une ornière',
        'Coût prohibitif et usure rapide des chenilles caoutchouc et des pneus basse pression (VF)',
        'Compaction des sols agricoles et pollution aux microplastiques de pneus lessivés vers les cours d’eau',
      ],
      valueProps: [
        "Angle d'inclinaison et pression d'impact divisés par 2 sur obstacle (stabilité GPS & confort validé par 5 chauffeurs)",
        'Utilisation de pneus standards plus petits, moins chers et préservés en carcasse',
        'Masse utile de 400 kg assurant la motricité sur tracteur (remplace les masses de roues en fonte)',
        'Roulage sécurisé sur 1 pneu en cas de crevaison pour regagner l’exploitation',
      ],
      simulatorCallout: {
        title: 'Lestage utile intégré (Tracteurs)',
        text: '~400 kg / roue — assure directement la traction sans patinage à la place des masses en fonte.',
      },
      kinematicsLabels: {
        sensorHeightControl: 'Hauteur du capteur GPS RTK sur le toit cabine',
        sensorDriftMetric: 'Déport latéral antenne GPS RTK (toit cabine)',
        sensorChartTitle: "2. Déviation latérale de l'antenne GPS RTK en haut de cabine (cm)",
        svgSensorTag: 'GPS RTK',
        vehicleLabel: 'la cabine du tracteur',
        returnTarget: "à l'exploitation",
      },
      kinematicsPreset: {
        obstacleCm: 14,
        loadTonnes: 5.0,
        gpsHeightM: 3.2,
        puncture: 0,
        axleTrackM: 2.0,
      },
      kinematicsRanges: {
        obstacleCm: { min: 0, max: 25, step: 0.5 },
        loadTonnes: { min: 2, max: 8, step: 0.1 },
        gpsHeightM: { min: 2.5, max: 4.0, step: 0.1 },
        axleTrackM: { min: 1.6, max: 2.6, step: 0.1 },
      },
    },

    /* ======================== 2. BTP & CARRIÈRES ======================== */
    {
      id: 'btp',
      label: 'BTP & Carrières',
      short: 'BTP',
      icon: 'HardHat',
      color: '#fb923c',
      navSummary: 'TRL 6 (Porteur Lourd Ø 1,80 m · Course 16 cm) · EP 4 180 239 · EP 4 153 434 B1',
      headline: 'Tombereaux, camions TP, carrières, mines, convois SPMT & manutention lourde',
      pitch:
        'Sur pistes enrochées, galeries souterraines et chantiers éoliens/nucléaires, les deux pneus restent en appui équilibré 50/50 sans éclatement ni dévers brutal de la benne.',
      hero: {
        eyebrow: 'ENSTA · Technologie R2A · Génie Civil, Carrières, Mines & Convois Lourds',
        title:
          'La roue jumelée auto-adaptative qui élimine les éclatements sur roche et stabilise vos bennes TP.',
        titleAccent: 'élimine les éclatements sur roche et stabilise vos bennes TP.',
        subtitle:
          "Sur piste enrochée ou chantier, l'effet de balancier (+H/2 / −H/2) maintient 50 % / 50 % de charge sur chaque pneu : zéro surcharge unitaire, éjection naturelle des pierres, roulis divisé par 2 et retour atelier sur 1 pneu (Run-Flat mécanique).",
        ctaPrimary: { label: 'Simuler un franchissement sur bloc rocheux', target: 'simulateur' },
        ctaSecondary: { label: 'Voir la Démo Porteur Lourd & les Slides', target: 'demo' },
        stats: [
          { value: '÷ 2', label: "Pression d'impact sur roche & roulis de benne (α/2)" },
          { value: 'Run-Flat', label: 'Continuité de chantier sur 1 pneu sans arrêt piste' },
          { value: 'TRL 6', label: 'Validé sur porteur lourd Ø 1,80 m · Course 16 cm' },
        ],
        patentBadges: [
          { code: 'EP 4 180 239 · FR2111969', detail: '100 % ENSTA · Brevet Unitaire 17 pays EU' },
          { code: 'EP 4 153 434 B1 · CA 3 183 669', detail: 'Porteurs lourds & Roulettes industrielles (EU, UK, CH, CA)' },
        ],
        visionCards: [
          {
            id: 'btp-prob',
            step: '01',
            title: 'Le Risque sur Pistes Enrochées & Mines',
            icon: 'AlertTriangle',
            tone: 'bad',
            bullets: [
              {
                bold: 'Coupures & éclatements sur blocs :',
                text: 'un jumelage rigide concentre 100 % de la charge sur un seul pneu au passage d’une roche et coince les pierres.',
              },
              {
                bold: 'Instabilité des bennes & charges hautes :',
                text: 'le soulèvement complet H déstabilise les tombereaux, camions de chantier et convois exceptionnels.',
              },
              {
                bold: 'Coût critique des pneus OTR & du Downtime :',
                text: 'une crevaison sur piste de carrière ou en galerie souterraine immobilise toute la chaîne d’extraction.',
              },
            ],
          },
          {
            id: 'btp-sol',
            step: '02',
            title: 'Cinématique R2A Haute Charge & Anti-Pierre',
            icon: 'Sparkles',
            tone: 'good',
            bullets: [
              {
                bold: 'Course 16 cm & éjection des pierres :',
                text: 'répartition 50 % / 50 % maintenue sur bloc dur et chasse naturelle des cailloux par mouvement relatif des flasques.',
              },
              {
                bold: 'Roulis de benne divisé par 2 (α / 2) :',
                text: 'franchissement fluide jusqu’à 50 km/h et suspension logée dans la jante pour engins miniers surbaissés.',
              },
              {
                bold: 'Continuité Run-Flat & pneus compacts :',
                text: 'retour atelier sur le pneu intact sans détruire la jante et remplacement des pneus géants OTR hors de prix.',
              },
            ],
          },
        ],
      },
      trilemma: {
        title: 'Le trilemme Génie Civil, Carrières & Mines',
        subtitle:
          'Entre jumelages rigides exposés aux éclatements, pneus géants OTR hors de prix et chenilles lentes, la roue R2A ENSTA sécurise la disponibilité chantier.',
        axes: [
          {
            id: 'flotation',
            label: 'Franchissement rocheux & Anti-éclatement',
            lines: ['Franchissement rocheux', '& Anti-éclatement'],
            shortLabel: 'Anti-éclatement',
          },
          {
            id: 'stability',
            label: 'Stabilité benne (50 km/h) & Continuité Run-Flat',
            lines: ['Stabilité benne (50 km/h)', '& Continuité Run-Flat'],
            shortLabel: 'Stabilité 50 km/h',
          },
          {
            id: 'economy',
            label: 'Sobriété TCO chantier (Pneus compacts & zéro arrêt)',
            lines: ['Sobriété TCO chantier', '(Pneus compacts & zéro arrêt)'],
            shortLabel: 'TCO chantier',
          },
        ],
        solutions: [
          { id: 'rigid_tp', label: 'Jumelage rigide TP', scores: [5, 6, 8], color: '#94a3b8' },
          { id: 'otr', label: 'Pneus Génie Civil Géants (OTR)', scores: [7, 7, 3], color: '#38bdf8' },
          { id: 'tracks_tp', label: 'Chenilles acier / caoutchouc', scores: [9, 2, 2], color: '#ef4444' },
          { id: 'ensta', label: 'Roue R2A ENSTA', scores: [9, 8, 8], color: '#fb923c', highlight: true },
        ],
        note: 'Scores comparatifs / 10 (porteurs lourds Ø 1,80 m, tombereaux, mines souterraines & roulettes GSE).',
      },
      highlights: [
        {
          bold: 'Zéro éclatement sur blocs (50 / 50) :',
          text: 'pression d’impact divisée par 2 sur 16 cm de course et éjection naturelle des pierres coincées.',
        },
        {
          bold: 'Bennes & convois stabilisés (α / 2) :',
          text: 'roulis divisé par 2 jusqu’à 50 km/h sur tombereaux, camions TP, SPMT et roulettes industrielles.',
        },
        {
          bold: 'Zéro arrêt piste (Run-Flat mécanique) :',
          text: 'retour direct à l’atelier chantier sur le pneu intact et montage de pneus standards compacts.',
        },
      ],
      painPoints: [
        'Éclatement des pneumatiques sur blocs rocheux et pierres coincées entre roues jumelées rigides',
        'Inclinaison brutale des bennes TP / convois lourds et secousses sévères sur pistes dégradées',
        'Coût prohibitif et délais d’approvisionnement des pneumatiques géants Génie Civil (OTR)',
        'Coût critique des heures d’immobilisation (*Downtime*) lors d’une crevaison sur piste ou en galerie',
      ],
      valueProps: [
        'Répartition 50 % / 50 % maintenue sur obstacle rocheux et éjection naturelle des pierres',
        'Soulèvement d’essieu et angle de dévers de la benne divisés par 2 (α / 2) jusqu’à 50 km/h',
        'Intégration de la fonction suspension dans le moyeu (idéal engins miniers surbaissés & roulettes GSE)',
        'Fonction Run-Flat mécanique : retour à l’atelier chantier sur 1 pneu sans immobiliser la piste',
      ],
      simulatorCallout: {
        title: 'Protection Carcasse & Anti-Pierre (BTP / Mines)',
        text: 'Course verticale de 16 cm absorbant les blocs rocheux et chasse naturelle des pierres par mouvement relatif des flasques.',
      },
      kinematicsLabels: {
        sensorHeightControl: 'Hauteur du haut de benne / charge transportée',
        sensorDriftMetric: 'Déport latéral haut de benne / charge haute',
        sensorChartTitle: '2. Déport latéral du haut de benne / convoi en franchissement (cm)',
        svgSensorTag: 'HAUT BENNE',
        vehicleLabel: 'la benne du porteur',
        returnTarget: "à l'atelier chantier",
      },
      kinematicsPreset: {
        obstacleCm: 16,
        loadTonnes: 6.5,
        gpsHeightM: 3.4,
        puncture: 0,
        axleTrackM: 2.2,
      },
      kinematicsRanges: {
        obstacleCm: { min: 0, max: 25, step: 0.5 },
        loadTonnes: { min: 2, max: 8, step: 0.1 },
        gpsHeightM: { min: 2.5, max: 4.2, step: 0.1 },
        axleTrackM: { min: 1.8, max: 2.8, step: 0.1 },
      },
    },

    /* ======================= 3. ROBOTIQUE MOBILE ======================== */
    {
      id: 'robotique',
      label: 'Robotique mobile',
      short: 'Robotique',
      icon: 'Bot',
      color: '#22d3ee',
      navSummary: '4 Prototypes R2A (UGV Terrestre, Crawler Magnétique EDF, Sous-Marin & AGV)',
      headline: 'Robots terrestres tout-terrain (UGV), crawlers magnétiques EDF/nucléaire & AGV lourds',
      pitch:
        'Stabilise passivement les capteurs (LiDAR, caméras, RTK) sur obstacles ou seuils et maximise l’adhérence magnétique sur parois courbes — avec zéro électronique et 0 Watt consommé.',
      hero: {
        eyebrow: 'ENSTA · Technologie R2A · Robotique Terrestre (UGV), Inspection Magnétique & AGV',
        title:
          'La liaison au sol auto-adaptative 100 % passive qui stabilise les capteurs et franchit les obstacles.',
        titleAccent: 'stabilise les capteurs et franchit les obstacles.',
        subtitle:
          'Sans capteur, vérin ni ligne de code, la cinématique R2A maintient les roues au contact sur rochers, seuils ou conduites courbes : dépointage du mât LiDAR/RTK divisé par 2 (α/2), autonomie batterie préservée et déclinaison magnétique pour parois courbes.',
        ctaPrimary: { label: 'Simuler la stabilité du mât capteurs', target: 'simulateur' },
        ctaSecondary: { label: 'Voir les 5 Vidéos Robots & les Slides', target: 'demo' },
        stats: [
          { value: '4 Prototypes', label: 'Robot terrestre, Crawler magnétique EDF, Sous-marin & Roulette' },
          { value: '÷ 2', label: 'Dépointage angulaire mât LiDAR / Caméras / RTK' },
          { value: '0 Watt', label: '100 % mécanique passif · Zéro électronique embarquée' },
        ],
        patentBadges: [
          { code: 'EP 4 153 434 B1 · FR3110111', detail: 'Copropriété ENSTA / EDF · Roue Magnétique & Terrestre (EU, UK, CH, CA)' },
          { code: 'EP 4 180 239 · FR2111969', detail: '100 % ENSTA · Rappel élastique UGV (17 pays EU)' },
        ],
        visionCards: [
          {
            id: 'rob-prob',
            step: '01',
            title: 'Limites des Suspensions Actives & Chenilles',
            icon: 'AlertTriangle',
            tone: 'bad',
            bullets: [
              {
                bold: 'Dépointage LiDAR / caméras en rigide :',
                text: 'dès qu’une roue franchit un galet ou un seuil, une roue décolle et le mât capteurs bascule d’un angle α.',
              },
              {
                bold: 'Batterie pénalisée par les micro-chenilles :',
                text: 'les frottements internes réduisent fortement l’autonomie des UGV autonomes de plein champ ou de défense.',
              },
              {
                bold: 'Électronique vulnérable & parois courbes :',
                text: 'les suspensions pilotées craignent l’eau/les radiations (CNPE) et une roue rigide décroche sur conduite courbe.',
              },
            ],
          },
          {
            id: 'rob-sol',
            step: '02',
            title: 'Liaison R2A Passive (Terrestre & Magnétique)',
            icon: 'Sparkles',
            tone: 'good',
            bullets: [
              {
                bold: 'Suspension logée dans la jante (0 Watt) :',
                text: 'maintient toutes les roues au contact du sol et divise par 2 l’inclinaison du mât capteurs (α / 2).',
              },
              {
                bold: 'Durcissement total (milieux sévères / nucléaire) :',
                text: '100 % mécanique passif, insensible aux radiations, à l’immersion sous-marine et à la poussière.',
              },
              {
                bold: 'Déclinaison Roue Magnétique à disques :',
                text: 'disques d’acier mobiles épousant la courbure des conduites forcées EDF et franchissant les soudures.',
              },
            ],
          },
        ],
      },
      trilemma: {
        title: 'Le trilemme de la robotique mobile & d’inspection',
        subtitle:
          'Face aux suspensions pilotées énergivores/fragiles et aux micro-chenilles, l’architecture R2A réunit franchissement passif, stabilité capteurs et sobriété batterie.',
        axes: [
          {
            id: 'flotation',
            label: 'Franchissement passif & Adhérence paroi courbe',
            lines: ['Franchissement passif', '& Adhérence paroi courbe'],
            shortLabel: 'Franchissement',
          },
          {
            id: 'stability',
            label: 'Stabilité mât LiDAR / Caméras & Durcissement (0 élec.)',
            lines: ['Stabilité mât LiDAR / Caméras', '& Durcissement (0 élec.)'],
            shortLabel: 'Stabilité capteurs',
          },
          {
            id: 'economy',
            label: 'Autonomie batterie (0 W) & Compacité intra-jante',
            lines: ['Autonomie batterie (0 W)', '& Compacité intra-jante'],
            shortLabel: 'Autonomie 0 W',
          },
        ],
        solutions: [
          { id: 'rigid_ugv', label: 'Train jumelé rigide', scores: [4, 5, 9], color: '#94a3b8' },
          { id: 'active_susp', label: 'Suspensions actives pilotées', scores: [8, 7, 3], color: '#38bdf8' },
          { id: 'micro_tracks', label: 'Micro-chenilles caoutchouc', scores: [8, 4, 3], color: '#fb923c' },
          {
            id: 'ensta',
            label: 'Roue R2A ENSTA (Terrestre & Magnétique)',
            scores: [9, 9, 8],
            color: '#22d3ee',
            highlight: true,
          },
        ],
        note: 'Scores comparatifs / 10 (essais UGV plage/galets, crawler magnétique en conduite forcée EDF & AGV).',
      },
      highlights: [
        {
          bold: 'Mât LiDAR / Caméras stabilisé (α / 2) :',
          text: 'divise par 2 le dépointage angulaire sur galets, trottoirs ou joints de dilatation d’usine.',
        },
        {
          bold: '0 Watt & durcissement nucléaire/marin :',
          text: 'aucun actionneur ni électronique, autonomie batterie préservée face aux chenilles.',
        },
        {
          bold: 'Variante Magnétique validée avec EDF :',
          text: 'disques d’acier mobiles épousant les conduites forcées courbes et cordons de soudure sans décrocher.',
        },
      ],
      painPoints: [
        'Dépointage latéral du mât LiDAR / caméras / RTK dès qu’une roue d’UGV franchit un obstacle ou un seuil',
        'Surconsommation énergétique des micro-chenilles réduisant l’autonomie batterie des robots autonomes',
        'Fragilité des suspensions actives électroniques en milieu humide, poussiéreux ou irradié (nucléaire)',
        'Perte de contact et décrochage des roues magnétiques rigides sur parois courbes et cordons de soudure',
      ],
      valueProps: [
        'Stabilisation angulaire passive (α / 2) du mât capteurs sans vérin, capteur ni loi de commande',
        'Intégration ultra-compacte dans le volume de la jante avec 0 Watt de consommation électrique',
        'Continuité de mission (Run-Flat mécanique) évitant les récupérations humaines sur le terrain',
        'Déclinaison Roue Magnétique à disques d’acier déformables pour crawlers d’inspection (barrages, EPR, coques)',
      ],
      simulatorCallout: {
        title: 'Intégration Compacte dans le Moyeu (Robotique)',
        text: "Loge toute la fonction suspension à l'intérieur de la jante (gain de place critique sur UGV/AGV) sans consommer d'énergie batterie.",
      },
      kinematicsLabels: {
        sensorHeightControl: 'Hauteur du mât capteurs (LiDAR / Caméras / RTK)',
        sensorDriftMetric: 'Déport latéral du mât capteurs (LiDAR / RTK)',
        sensorChartTitle: '2. Déport latéral du mât LiDAR / Caméras / RTK selon l’obstacle (cm)',
        svgSensorTag: 'MÂT LiDAR',
        vehicleLabel: 'la plateforme robotisée',
        returnTarget: 'à la station de base',
      },
      kinematicsPreset: {
        obstacleCm: 10,
        loadTonnes: 2.0,
        gpsHeightM: 1.6,
        puncture: 0,
        axleTrackM: 1.4,
      },
      kinematicsRanges: {
        obstacleCm: { min: 0, max: 25, step: 0.5 },
        loadTonnes: { min: 0.5, max: 6, step: 0.1 },
        gpsHeightM: { min: 0.8, max: 3.0, step: 0.1 },
        axleTrackM: { min: 0.8, max: 2.2, step: 0.1 },
      },
    },
  ],

  /* --------------------------------------------------------------------- */
  /*  SIMULATEUR CINÉMATIQUE EN COUPE FRONTALE (FRANCHISSEMENT D'OBSTACLE)  */
  /* --------------------------------------------------------------------- */
  kinematics: {
    title: "Simulateur cinématique temps réel · Franchissement d'obstacle",
    subtitleBySector: {
      agri: "Vue en coupe frontale de l'essieu agricole : comparez un jumelage rigide et la roue R2A ENSTA lorsqu'un pneu franchit une pierre de hauteur H sur chemin d'accès ou en parcelle.",
      btp: "Vue en coupe frontale de l'essieu porteur : comparez un jumelage rigide TP et la roue R2A ENSTA lors du franchissement d'un bloc rocheux de hauteur H sur piste ou chantier.",
      robotique:
        "Vue en coupe frontale du train robotisé : comparez un montage jumelé rigide et la liaison passive R2A ENSTA lors du franchissement asymétrique d'un obstacle ou d'un seuil de hauteur H.",
    },
    defaults: {
      obstacleCm: 14,
      loadTonnes: 5.0,
      gpsHeightM: 3.2,
      puncture: 0,
      axleTrackM: 2.0,
    },
    controls: [
      {
        id: 'obstacleCm',
        variable: 'H',
        type: 'range',
        label: "Hauteur de l'obstacle sous une roue (H)",
        unit: 'cm',
        min: 0,
        max: 25,
        step: 0.5,
        decimals: 1,
      },
      {
        id: 'loadTonnes',
        variable: 'F',
        type: 'range',
        label: 'Charge verticale sur l’ensemble jumelé (F)',
        unit: 'tonnes',
        min: 0.5,
        max: 8,
        step: 0.1,
        decimals: 1,
      },
      {
        id: 'gpsHeightM',
        variable: 'Hgps',
        type: 'range',
        label: 'Hauteur du point stabilisé (capteur / benne)',
        unit: 'm',
        min: 0.8,
        max: 4.2,
        step: 0.1,
        decimals: 1,
      },
      {
        id: 'puncture',
        variable: 'puncture',
        type: 'toggle',
        label: "Simuler l'avarie / crevaison d'un bandage ou pneu",
        onLabel: 'Actif (Mode Run-Flat)',
        offLabel: 'Inactif',
        help: 'Simule la perte du pneu externe : la roue intacte R2A reprend la charge sans immobiliser le véhicule.',
      },
      {
        id: 'axleTrackM',
        variable: 'trackM',
        type: 'range',
        label: "Voie de l'essieu (largeur entre appuis G/D)",
        unit: 'm',
        min: 0.8,
        max: 2.8,
        step: 0.1,
        decimals: 1,
        advanced: true,
        help: 'Utilisée dans ΔX_rigide ≈ H × (Hauteur / Voie essieu) et α ≈ arctan(H / Voie).',
      },
    ],
    constants: { deflCm: 2.5, wheelMassKg: 400 },
    derived: [
      { id: 'rigidOuterShare', expr: 'puncture > 0 ? 0 : (H <= 0 ? 50 : min(100, 50 + 50 * (H / deflCm)))' },
      { id: 'rigidInnerShare', expr: 'puncture > 0 ? 100 : (100 - rigidOuterShare)' },
      { id: 'enstaOuterShare', expr: 'puncture > 0 ? 0 : 50' },
      { id: 'enstaInnerShare', expr: 'puncture > 0 ? 100 : 50' },
      { id: 'rigidPeakLoadT', expr: 'F * max(rigidOuterShare, rigidInnerShare) / 100' },
      { id: 'enstaPeakLoadT', expr: 'F * max(enstaOuterShare, enstaInnerShare) / 100' },
      { id: 'rigidOuterLoadT', expr: 'F * rigidOuterShare / 100' },
      { id: 'enstaOuterLoadT', expr: 'F * enstaOuterShare / 100' },
      { id: 'rigidInnerLoadT', expr: 'F * rigidInnerShare / 100' },
      { id: 'enstaInnerLoadT', expr: 'F * enstaInnerShare / 100' },
      { id: 'liftRigidCm', expr: 'puncture > 0 ? 0 : H' },
      { id: 'liftEnstaCm', expr: 'puncture > 0 ? 0 : H / 2' },
      { id: 'alphaRigidDeg', expr: 'atan((liftRigidCm / 100) / trackM) * 180 / PI' },
      { id: 'alphaEnstaDeg', expr: 'alphaRigidDeg / 2' },
      { id: 'gpsRigidCm', expr: 'liftRigidCm * (Hgps / trackM)' },
      { id: 'gpsEnstaCm', expr: 'gpsRigidCm / 2' },
    ],
    metrics: [
      {
        id: 'outerLoad',
        label: 'Charge roue extérieure (sur obstacle)',
        unit: 't',
        decimals: 2,
        rigid: 'rigidOuterLoadT',
        ensta: 'enstaOuterLoadT',
      },
      {
        id: 'outerSharePct',
        label: 'Répartition roue extérieure',
        unit: '%',
        decimals: 0,
        rigid: 'rigidOuterShare',
        ensta: 'enstaOuterShare',
        thresholds: [
          { max: 55, label: 'Équilibré 50/50', tone: 'good' },
          { max: 80, label: 'Surcharge', tone: 'warn' },
          { max: 999, label: 'Surcharge 100 %', tone: 'bad' },
        ],
      },
      {
        id: 'innerSharePct',
        label: 'Répartition roue intérieure',
        unit: '%',
        decimals: 0,
        rigid: 'rigidInnerShare',
        ensta: 'enstaInnerShare',
        thresholds: [
          { max: 5, label: 'Dans le vide', tone: 'bad' },
          { max: 44, label: 'Délestée', tone: 'warn' },
          { max: 999, label: 'Au contact', tone: 'good' },
        ],
      },
      {
        id: 'axleLift',
        label: "Soulèvement vertical de l'essieu",
        unit: 'cm',
        decimals: 1,
        rigid: 'liftRigidCm',
        ensta: 'liftEnstaCm',
      },
      {
        id: 'tiltAngle',
        label: "Angle d'inclinaison du châssis (α)",
        unit: '°',
        decimals: 2,
        rigid: 'alphaRigidDeg',
        ensta: 'alphaEnstaDeg',
      },
      {
        id: 'gpsDrift',
        label: 'Déport latéral au sommet',
        unit: 'cm',
        decimals: 1,
        rigid: 'gpsRigidCm',
        ensta: 'gpsEnstaCm',
        thresholds: [
          { max: 3, label: 'Nominal', tone: 'good' },
          { max: 13, label: 'Trajectoire préservée', tone: 'info' },
          { max: 999, label: 'Fort déport', tone: 'bad' },
        ],
      },
    ],
    headlineMetric: 'gpsDrift',
    headlineLabel: "d'impact, d'inclinaison (α/2) et de déport latéral",
    chart: {
      titleBySector: {
        agri: "Surcharge sur le pneu et Déviation GPS RTK selon la hauteur de l'obstacle (0 à 25 cm)",
        btp: "Surcharge unitaire sur bloc rocheux et Déport de benne selon l'obstacle (0 à 25 cm)",
        robotique: "Surcharge de roue et Dépointage du mât LiDAR / RTK selon l'obstacle (0 à 25 cm)",
      },
      xControl: 'obstacleCm',
      loadMetricId: 'peakLoad',
      gpsMetricId: 'gpsDrift',
    },
    legend: {
      balancier: 'Axes balanciers & flasques (+H/2 / −H/2)',
      pressureOk: 'Contact équilibré 50 % / 50 %',
      overload: 'Surcharge 100 % (roue jumelle décollée)',
      gps: 'Déport latéral (capteur / benne)',
    },
    modelNote:
      "Modèle géométrique en coupe frontale : ΔX_rigide ≈ H × (Hauteur / Voie essieu), ΔX_R2A = ΔX_rigide / 2. Les deux jantes tournent à la même vitesse angulaire que l'essieu ; l'adaptation est purement verticale et angulaire par balancier.",

    /* --- Technologies concurrentes comparées face à la Roue R2A par filière --- */
    competitorsBySector: {
      agri: [
        {
          id: 'agri_rigid_twin',
          label: 'Jumelage Classique Rigide',
          shortLabel: 'Jumelage Rigide',
          visualType: 'rigid_twin',
          liftFactor: 1.0,
          squishRatio: 0.08,
          singleWheel: false,
          peakShareAtObstacle: 100,
          innerShareAtObstacle: 0,
          architectureSummary: '0 W · Rigide (0 course)',
          alertBadge:
            '100 % de surcharge sur 1 seul pneu (roue jumelle décollée) · Risque d’éclatement sur silex · Déport GPS RTK maximal',
          behaviorText:
            "Sur obstacle H, la roue externe monte de +H et la roue interne décolle dans le vide (0 % de charge) : 100 % de surcharge sur un seul pneu, soulèvement essieu = H et déport maximal de l'antenne GPS RTK.",
          punctureText:
            'Sans balancier, la jante en avarie talonne sur les pierres et la roue restante travaille en porte-à-faux sévère.',
        },
        {
          id: 'agri_vf_ctis',
          label: 'Pneus Basse Pression (IF/VF à 0,8 bar) + Télégonflage CTIS',
          shortLabel: 'Pneus IF/VF 0,8 bar + CTIS',
          visualType: 'vf_ctis',
          liftFactor: 0.68,
          squishRatio: 0.35,
          singleWheel: true,
          peakShareAtObstacle: 100,
          innerShareAtObstacle: 0,
          architectureSummary: 'Compresseur CTIS · ~24 k€',
          alertBadge: 'Flanc à 0,8 bar vulnérable aux silex · Latence regonflage route 5–15 min · Surcoût ~24 000 €',
          behaviorText:
            "Le flanc ultra-souple s'écrase d'environ 35 % de H, mais l'essieu reste rigide : le châssis subit encore 65 à 70 % de l'inclinaison α et du déport GPS RTK, avec fatigue sévère de la carcasse et risque de talonnage jante.",
          punctureText:
            'En monte simple basse pression IF/VF, une perforation de flanc sur silex entraîne l’immobilisation immédiate au champ (0 Run-Flat).',
        },
        {
          id: 'agri_rubber_track',
          label: 'Chenilles Caoutchouc (type Terra Trac / Soucy)',
          shortLabel: 'Chenilles Caoutchouc',
          visualType: 'rubber_track',
          liftFactor: 0.65,
          squishRatio: 0.2,
          singleWheel: true,
          peakShareAtObstacle: 85,
          innerShareAtObstacle: 15,
          architectureSummary: '+15 à +25 % GNR · 35–80 k€',
          alertBadge:
            'CAPEX prohibitif (35 à 80 k€) · Surconsommation GNR +15 à +25 % · Ripage destructeur en fourrière & échauffement route > 40 km/h',
          behaviorText:
            "Excellente portance sur sol plat, mais sur un obstacle dur ponctuel ou chemin empierré, le galet/barbotin subit un point dur et un basculement au passage du centre de gravité (soulèvement ~0,65 H).",
          punctureText:
            'Une rupture de bande caoutchouc ou avarie de galet immobilise totalement la machine et nécessite un dépannage lourd sur site.',
        },
        {
          id: 'agri_bogie_tandem',
          label: 'Essieu Bogie / Tandem Longitudinal',
          shortLabel: 'Bogie / Tandem Longitudinal',
          visualType: 'bogie_tandem',
          liftFactor: 1.0,
          squishRatio: 0.1,
          singleWheel: false,
          peakShareAtObstacle: 100,
          innerShareAtObstacle: 0,
          architectureSummary: '+1,5 à 2,5 t · Rigide en dévers',
          alertBadge:
            '100 % rigide en dévers latéral · Ripage massif en virage (arrache les prairies) · Surpoids +1,5 à 2,5 t',
          behaviorText:
            'Compense une marche prise par les deux côtés à la fois, mais sur un obstacle asymétrique (sous un seul côté de la piste) ou en dévers latéral, le bogie est 100 % rigide latéralement (inclinaison α non corrigée !).',
          punctureText:
            'Sans adaptation transversale, l’éclatement d’un pneumatique surcharge immédiatement le train sur les aspérités latérales.',
        },
      ],

      btp: [
        {
          id: 'btp_rigid_twin',
          label: 'Jumelage Rigide TP / Mine',
          shortLabel: 'Jumelage Rigide TP',
          visualType: 'rigid_twin_rock',
          liftFactor: 1.0,
          squishRatio: 0.08,
          singleWheel: false,
          peakShareAtObstacle: 100,
          innerShareAtObstacle: 0,
          architectureSummary: '0 W · Piégeage de roches',
          alertBadge:
            '100 % de la charge sur 1 seul pneu sur bloc rocheux · Piégeage mortel de roches entre flancs (> 40 % des rebuts en carrière/mine)',
          behaviorText:
            '100 % de la charge repose sur un seul pneu au passage d’un bloc rocheux (roue jumelle décollée), avec roulis complet α de la benne et coincement destructeur de pierres cisaillant les flancs.',
          punctureText:
            'Éclatement franc sur piste : jante exposée aux blocs rocheux et immobilisation critique du tombereau.',
        },
        {
          id: 'btp_solid_chained',
          label: 'Pneus Pleins (Solid Tires) / Gonflés Mousse ou Chaînés',
          shortLabel: 'Pneus Pleins / Mousse / Chaînés',
          visualType: 'solid_chained',
          liftFactor: 1.0,
          squishRatio: 0.0,
          singleWheel: true,
          peakShareAtObstacle: 100,
          innerShareAtObstacle: 0,
          architectureSummary: '0 amortissement · Choc 100 %',
          alertBadge:
            'Choc mécanique violent (casse essieu & TMS) · Surchauffe thermique dès 25 km/h · Chaînes = +2 t/roue',
          behaviorText:
            "Increvables aux coupures, mais rigidité verticale quasi-infinie (0 % d'amortissement pneumatique) : 100 % du choc vertical H et de l'inclinaison α sont transmis brutalement aux réducteurs planétaires, au châssis et à l'opérateur (TMS).",
          punctureText:
            'Pas de crevaison, mais transmission intégrale des chocs aux ponts/roulements et plafond thermique sévère dès 25 km/h.',
        },
        {
          id: 'btp_giant_otr',
          label: 'Pneus Génie Civil Géants (OTR Basse Pression)',
          shortLabel: 'Pneus Géants OTR',
          visualType: 'giant_otr',
          liftFactor: 0.7,
          squishRatio: 0.3,
          singleWheel: true,
          peakShareAtObstacle: 100,
          innerShareAtObstacle: 0,
          architectureSummary: '35 k€/pneu · 0 Run-Flat',
          alertBadge:
            'Exposé aux coupures de flancs · 0 continuité Run-Flat (arrêt piste immédiat) · CAPEX & pénurie OTR',
          behaviorText:
            "Le pneu géant s'écrase partiellement (~30 %) sur le bloc rocheux, mais expose son flanc bombé sous contrainte aux coupures franches (en mine : 1 pneu OTR détruit = 35 000 € + 6 h de Downtime à 8 000 €/h).",
          punctureText:
            'Monte simple OTR sans redondance : toute coupure franche du flanc bloque l’engin au milieu de la piste ou de la galerie.',
        },
        {
          id: 'btp_hydropneumatic',
          label: 'Suspension Hydropneumatique / Essieu Pendulaire Hydraulique',
          shortLabel: 'Suspension Hydropneumatique',
          visualType: 'hydropneumatic',
          liftFactor: 0.3,
          squishRatio: 0.15,
          singleWheel: false,
          peakShareAtObstacle: 62,
          innerShareAtObstacle: 38,
          architectureSummary: 'Encombrement châssis · Hydraulique',
          alertBadge:
            'Incompatible engins surbaissés (Mines LHD / GSE) · Fuite hydraulique = immobilisation totale · Coût très élevé',
          behaviorText:
            'Absorbe bien l’obstacle verticalement grâce aux vérins, MAIS exige un fort encombrement sous châssis (impossible à loger sur chargeuses minières surbaissées LHD ou chariots lourds GSE) et dépend de sphères d’azote et joints.',
          punctureText:
            'Une rupture flexible/joint hydraulique ou une crevaison sous haute charge met le circuit en défaut et immobilise le convoi.',
        },
      ],

      robotique: [
        {
          id: 'rob_rigid_train',
          label: 'Train Rigide (UGV / AGV) ou Roue Magnétique Rigide',
          shortLabel: 'Train / Roue Rigide',
          visualType: 'rigid_twin',
          liftFactor: 1.0,
          squishRatio: 0.06,
          singleWheel: false,
          peakShareAtObstacle: 100,
          innerShareAtObstacle: 0,
          architectureSummary: '0 W · Perte contact / aimantation',
          alertBadge:
            'Dépointage complet α du mât LiDAR/Caméras · Contact ponctuel & perte d’aimantation sur cordon de soudure (conduite courbe EDF)',
          behaviorText:
            'Décollement immédiat d’une roue sur galet ou seuil d’atelier, basculement complet α du mât LiDAR/Caméras, et sur conduite forcée courbe (EDF) : contact ponctuel et perte d’aimantation au passage d’un cordon de soudure.',
          punctureText:
            'En cas d’avarie d’un bandage sur essieu rigide, la perte de garde au sol bloque le robot à distance.',
        },
        {
          id: 'rob_micro_tracks',
          label: 'Micro-Chenilles Caoutchouc',
          shortLabel: 'Micro-Chenilles',
          visualType: 'micro_track',
          liftFactor: 0.68,
          squishRatio: 0.15,
          singleWheel: true,
          peakShareAtObstacle: 85,
          innerShareAtObstacle: 15,
          architectureSummary: '−15 à −25 % autonomie batterie',
          alertBadge:
            "Surconsommation batterie −15 à −25 % d'autonomie · Vibrations LiDAR/Caméras · Risque de déchenillement sur galets",
          behaviorText:
            'Franchit l’obstacle mais génère des vibrations hautes fréquences sur sol dur qui bruitent le SLAM LiDAR/Caméras et un basculement brusque à l’arête de l’obstacle (~0,68 H).',
          punctureText:
            'Un déchenillement sur galets ou débris bloque instantanément la plateforme et impose une récupération humaine.',
        },
        {
          id: 'rob_active_rocker',
          label: 'Châssis Articulé Actif (Rocker-Bogie Motorisé / Servomoteurs)',
          shortLabel: 'Châssis Actif Motorisé',
          visualType: 'active_rocker',
          liftFactor: 0.35,
          squishRatio: 0.1,
          singleWheel: true,
          peakShareAtObstacle: 58,
          innerShareAtObstacle: 42,
          architectureSummary: 'Conso continue · Sensible radiations γ',
          alertBadge:
            "Électronique & codeurs détruits par les radiations gamma (Nucléaire CNPE/EPR) · Vulnérable à l'eau/boue · Coût élevé",
          behaviorText:
            "Compense l'obstacle par actionneurs électriques asservis, mais consomme de l'énergie batterie et du calcul en continu, tout en exposant moteurs, codeurs et cartes aux radiations ou à l'immersion.",
          punctureText:
            'La défaillance d’un servomoteur, codeur ou câble exposé fige l’articulation et compromet le retour autonome.',
        },
        {
          id: 'rob_airless_tweel',
          label: 'Pneus Sans Air (Airless / Tweel à Rayons Polyuréthane)',
          shortLabel: 'Airless / Tweel Rayons PU',
          visualType: 'airless_tweel',
          liftFactor: 0.75,
          squishRatio: 0.25,
          singleWheel: true,
          peakShareAtObstacle: 100,
          innerShareAtObstacle: 0,
          maxLoadTonnes: 3.0,
          architectureSummary: 'Plafond < 3 t · Rebond non amorti',
          alertBadge:
            'Plafond de charge très bas (< 3 t) · Bourrage de boue/graviers dans les rayons ouverts (balourd) · Rebond non amorti',
          behaviorText:
            "Les rayons souples s'écrasent localement (environ 25 %), mais flambent sous charge lourde (> 3 t) et restituent l'énergie avec un effet de rebond non amorti perturbant les capteurs embarqués.",
          punctureText:
            'Increvable à l’air, mais la déchirure de rayons polyuréthane ou le bourrage de pierres crée un balourd permanent.',
        },
      ],
    },
  },

  /* --------------------------------------------------------------------- */
  /*  CALCULATEUR TCO — 100 % SECTORIEL (ZÉRO FUITE ENTRE FILIÈRES)         */
  /* --------------------------------------------------------------------- */
  tco: {
    title: 'Calculateur de coût total de possession (TCO)',
    global: {
      horizonYears: { label: "Horizon d'analyse", unit: 'ans', min: 1, max: 15, step: 1, default: 7 },
      discountRatePct: { label: "Taux d'actualisation", unit: '%', min: 0, max: 15, step: 0.5, default: 5 },
    },
    groupLabels: {
      context: 'Contexte opérationnel du parc',
      hypothesis: 'Paramètres économiques & gains R2A',
    },
    sectors: {
      /* ------------------------------ AGRICOLE ------------------------- */
      agri: {
        title: 'Tracteur / machine agricole (1 essieu équipé par défaut)',
        subtitle:
          "Estimez la rentabilité d'un essieu équipé R2A (surcoût cible de 9 500 € / machine en série emboutie, utilisant des pneus standards 2× moins chers et remplaçant les masses de lestage en fonte).",
        tableRefHeader: 'Réf. (Rigide / VF)',
        baselineChartLabel: 'Référence actuelle (Jumelage rigide / pneus VF + lestage fonte)',
        enstaChartLabel: 'Roue R2A ENSTA (investissement + pneus standards)',
        disclaimer:
          "Ordres de grandeur basés sur l'industrialisation série (châssis central en 2 coques embouties-soudées + pneus standards) et la campagne d'essais TRL 6 sur John Deere 6155R (155 cv). Ajustez librement chaque curseur à votre exploitation.",
        inputs: [
          { id: 'fleet', group: 'context', label: 'Nombre de machines équipées', unit: 'machine(s)', min: 1, max: 30, step: 1, default: 1 },
          { id: 'hoursPerYear', group: 'context', label: "Heures d'utilisation / machine / an", unit: 'h', min: 200, max: 2000, step: 50, default: 850 },
          { id: 'fuelLph', group: 'context', label: 'Consommation moyenne', unit: 'L/h', min: 10, max: 55, step: 1, default: 24 },
          { id: 'fuelPrice', group: 'context', label: 'Prix du GNR', unit: '€/L', min: 0.8, max: 2.2, step: 0.05, default: 1.3 },
          { id: 'vfTireSetCost', group: 'context', label: 'Prix train pneus réf. (VF basse pression / jumelage exposé)', unit: '€ HT', min: 3000, max: 20000, step: 250, default: 7800 },
          { id: 'stdTireSetCost', group: 'context', label: 'Prix train pneus standards petits (montage R2A)', unit: '€ HT', min: 1500, max: 12000, step: 250, default: 3900 },
          { id: 'tireLifeHours', group: 'context', label: 'Durée de vie pneus de référence', unit: 'h', min: 1200, max: 6000, step: 100, default: 2800 },
          { id: 'seasonalRiskCost', group: 'context', label: 'Coût annuel moyen casse cailloux / immobilisation moisson & tassement', unit: '€/an', min: 0, max: 6000, step: 100, default: 1400 },
          { id: 'retrofitCost', group: 'hypothesis', label: "Surcoût d'équipement cible R2A / machine", unit: '€ HT', min: 4000, max: 20000, step: 250, default: 9500 },
          { id: 'ballastSaved', group: 'hypothesis', label: 'Économie de lestage fonte évité (2 × 400 kg utiles)', unit: '€ HT', min: 0, max: 4000, step: 100, default: 1800 },
          { id: 'tireLifeGainPct', group: 'hypothesis', label: 'Allongement durée de vie des pneus (le mécanisme absorbe le choc)', unit: '%', min: 0, max: 80, step: 5, default: 30 },
          { id: 'fuelSavingPct', group: 'hypothesis', label: 'Économie de carburant (motricité optimisée sans frottement chenille)', unit: '%', min: 0, max: 15, step: 0.5, default: 4 },
          { id: 'downtimeSavingPct', group: 'hypothesis', label: 'Réduction immobilisations moisson (Run-Flat 1 pneu) & préservation sols', unit: '%', min: 0, max: 100, step: 5, default: 75 },
        ],
        capex: [
          { id: 'wheels', label: 'Surcoût essieu équipé R2A ENSTA (série emboutie)', baseline: '0', ensta: 'fleet * retrofitCost' },
          { id: 'ballast', label: 'Économie de lestage initial (masses fonte remplacées par 2 × 400 kg)', baseline: 'fleet * ballastSaved', ensta: '0' },
        ],
        annual: [
          {
            id: 'tires',
            label: 'Renouvellement pneumatiques (pneus standards 2× moins chers + longévité accrue + zéro éclatement)',
            baseline: 'fleet * hoursPerYear / tireLifeHours * vfTireSetCost',
            ensta: 'fleet * hoursPerYear / (tireLifeHours * (1 + tireLifeGainPct / 100)) * stdTireSetCost',
          },
          {
            id: 'fuel',
            label: 'Carburant GNR (motricité optimisée sans surpoids ni frottements de chenille)',
            baseline: 'fleet * hoursPerYear * fuelLph * fuelPrice',
            ensta: 'fleet * hoursPerYear * fuelLph * fuelPrice * (1 - fuelSavingPct / 100)',
          },
          {
            id: 'productivity',
            label: 'Productivité & zéro immobilisation en moisson (retour sur 1 pneu + sols & GPS RTK préservés)',
            baseline: 'fleet * seasonalRiskCost',
            ensta: 'fleet * seasonalRiskCost * (1 - downtimeSavingPct / 100)',
          },
        ],
      },

      /* ------------------------------ BTP ------------------------------ */
      btp: {
        title: 'Porteur lourd / tombereau / carrière (1 engin par défaut)',
        subtitle:
          "Évaluez le retour sur investissement d'un essieu porteur équipé R2A sur chantier, piste enrochée ou mine : remplacement des pneus Génie Civil OTR exposés, suppression des arrêts sur piste (Run-Flat) et baisse du MCO.",
        tableRefHeader: 'Réf. (Rigide TP / OTR)',
        baselineChartLabel: 'Référence actuelle (Jumelage rigide TP / Pneus Génie Civil OTR)',
        enstaChartLabel: 'Roue R2A ENSTA (investissement + pneus standards compacts)',
        disclaimer:
          "Ordres de grandeur configurables pour tombereaux, camions TP, chargeuses minières et convois lourds. Ajustez librement le coût horaire d'immobilisation chantier (*Downtime*) et la durée de vie pneumatique à vos pistes.",
        inputs: [
          { id: 'fleet', group: 'context', label: "Nombre d'engins équipés", unit: 'engin(s)', min: 1, max: 30, step: 1, default: 1 },
          { id: 'hoursPerYear', group: 'context', label: "Heures d'utilisation / engin / an", unit: 'h', min: 500, max: 3500, step: 50, default: 1500 },
          { id: 'fuelLph', group: 'context', label: 'Consommation moyenne', unit: 'L/h', min: 10, max: 70, step: 1, default: 26 },
          { id: 'fuelPrice', group: 'context', label: 'Prix du carburant chantier', unit: '€/L', min: 0.8, max: 2.2, step: 0.05, default: 1.4 },
          { id: 'refTireSetCost', group: 'context', label: 'Coût train pneus Génie Civil OTR / jumelage exposé', unit: '€ HT', min: 4000, max: 40000, step: 500, default: 12000 },
          { id: 'stdTireSetCost', group: 'context', label: 'Coût train pneus standards compacts (montage R2A)', unit: '€ HT', min: 2000, max: 25000, step: 500, default: 6800 },
          { id: 'tireLifeHours', group: 'context', label: 'Durée de vie pneus sur pistes enrochées', unit: 'h', min: 1000, max: 6000, step: 100, default: 2600 },
          { id: 'downtimeHours', group: 'context', label: 'Immobilisation crevaison / éclatement / engin / an', unit: 'h', min: 0, max: 150, step: 2, default: 24 },
          { id: 'downtimeCost', group: 'context', label: "Coût complet d'une heure d'arrêt chantier (Downtime)", unit: '€/h', min: 40, max: 500, step: 10, default: 130 },
          { id: 'retrofitCost', group: 'hypothesis', label: "Surcoût d'équipement cible R2A / essieu engin", unit: '€ HT', min: 5000, max: 25000, step: 500, default: 11000 },
          { id: 'tireLifeGainPct', group: 'hypothesis', label: 'Gain de longévité pneus (charge ÷ 2 + éjection pierres)', unit: '%', min: 0, max: 80, step: 5, default: 30 },
          { id: 'fuelSavingPct', group: 'hypothesis', label: 'Économie de carburant (franchissement fluide)', unit: '%', min: 0, max: 12, step: 0.5, default: 3.5 },
          { id: 'downtimeReductionPct', group: 'hypothesis', label: 'Réduction des arrêts sur piste (Run-Flat retour atelier)', unit: '%', min: 0, max: 95, step: 5, default: 75 },
        ],
        capex: [
          { id: 'wheels', label: 'Surcoût essieu porteur équipé R2A ENSTA', baseline: '0', ensta: 'fleet * retrofitCost' },
        ],
        annual: [
          {
            id: 'tires',
            label: 'Renouvellement pneumatiques (pneus compacts moins coûteux + zéro éclatement sur blocs)',
            baseline: 'fleet * hoursPerYear / tireLifeHours * refTireSetCost',
            ensta: 'fleet * hoursPerYear / (tireLifeHours * (1 + tireLifeGainPct / 100)) * stdTireSetCost',
          },
          {
            id: 'downtime',
            label: 'Coûts d’immobilisation chantier évités (continuité Run-Flat vers atelier)',
            baseline: 'fleet * downtimeHours * downtimeCost',
            ensta: 'fleet * downtimeHours * downtimeCost * (1 - downtimeReductionPct / 100)',
          },
          {
            id: 'fuel',
            label: 'Carburant (franchissement fluide sans ripage sur enrochement)',
            baseline: 'fleet * hoursPerYear * fuelLph * fuelPrice',
            ensta: 'fleet * hoursPerYear * fuelLph * fuelPrice * (1 - fuelSavingPct / 100)',
          },
        ],
      },

      /* ---------------------------- ROBOTIQUE -------------------------- */
      robotique: {
        title: 'Plateforme robotisée UGV / Crawler / AGV (1 robot par défaut)',
        subtitle:
          "Comparez une liaison au sol passive R2A (0 Watt, logée dans la jante, zéro électronique) face à une suspension active pilotée ou un train micro-chenillé coûteux en énergie et en maintenance.",
        tableRefHeader: 'Réf. (Susp. active / Chenilles)',
        baselineChartLabel: 'Référence actuelle (Suspension active pilotée / Micro-chenilles)',
        enstaChartLabel: 'Liaison passive R2A ENSTA (100 % mécanique · 0 Watt)',
        disclaimer:
          'Ordres de grandeur configurables pour robots mobiles tout-terrain (UGV), crawlers magnétiques d’inspection industrielle et AGV/AMR forte charge.',
        inputs: [
          { id: 'fleet', group: 'context', label: 'Nombre de robots équipés', unit: 'robot(s)', min: 1, max: 100, step: 1, default: 1 },
          { id: 'missionsPerYear', group: 'context', label: 'Missions annuelles / robot', unit: 'missions', min: 100, max: 3000, step: 50, default: 900 },
          { id: 'rescuesPerRobot', group: 'context', label: 'Interventions humaines (blocage / décrochage / dérive LiDAR) / an', unit: 'interv.', min: 0, max: 40, step: 1, default: 8 },
          { id: 'rescueCost', group: 'context', label: "Coût complet d'une récupération terrain / arrêt d'inspection", unit: '€', min: 30, max: 500, step: 10, default: 120 },
          { id: 'activeSuspMaint', group: 'context', label: 'MCO train chenillé ou suspension active électronique / an', unit: '€/an', min: 0, max: 3000, step: 50, default: 550 },
          { id: 'activeSuspCapex', group: 'hypothesis', label: 'Surcoût suspension pilotée / actionneurs évité à l’achat', unit: '€ HT', min: 0, max: 4000, step: 100, default: 600 },
          { id: 'retrofitCost', group: 'hypothesis', label: 'Coût train roulant passif R2A / robot', unit: '€ HT', min: 300, max: 5000, step: 100, default: 1500 },
          { id: 'rescueReductionPct', group: 'hypothesis', label: 'Réduction des interruptions de mission (stabilité capteurs + Run-Flat)', unit: '%', min: 0, max: 95, step: 5, default: 70 },
          { id: 'maintSavingPct', group: 'hypothesis', label: 'Réduction MCO & usure batteries (0 Watt, zéro actionneur)', unit: '%', min: 0, max: 80, step: 5, default: 50 },
        ],
        capex: [
          { id: 'wheels', label: 'Équipement roues auto-adaptatives passives R2A', baseline: '0', ensta: 'fleet * retrofitCost' },
          { id: 'activeAvoided', label: 'Suspension pilotée & électronique d’asservissement évitées', baseline: 'fleet * activeSuspCapex', ensta: '0' },
        ],
        annual: [
          {
            id: 'rescues',
            label: 'Interventions de récupération terrain & reprises de mission autonome',
            baseline: 'fleet * rescuesPerRobot * rescueCost',
            ensta: 'fleet * rescuesPerRobot * rescueCost * (1 - rescueReductionPct / 100)',
          },
          {
            id: 'mco',
            label: 'Maintien en condition opérationnelle du train roulant & autonomie batterie',
            baseline: 'fleet * activeSuspMaint',
            ensta: 'fleet * activeSuspMaint * (1 - maintSavingPct / 100)',
          },
        ],
      },
    },
  },

  /* --------------------------------------------------------------------- */
  /*  TECHNOLOGIE & CAO — ADAPTÉE PAR SECTEUR + VARIANTE MAGNÉTIQUE        */
  /* --------------------------------------------------------------------- */
  techSpecs: {
    cadImage: '',
    categories: [
      { id: 'axe_entree', label: "Axe d'entrée (Vert)", color: '#22c55e' },
      { id: 'chassis_lobes', label: 'Châssis central à lobes (Marron)', color: '#b45309' },
      { id: 'balanciers', label: 'Axes balanciers & Rotules', color: '#38bdf8' },
      { id: 'plaques', label: 'Flasques / Plaques mobiles', color: '#cbd5e1' },
      { id: 'machoires', label: 'Mâchoires (Orange) & Patins bronze (Jaunes)', color: '#f97316' },
      { id: 'ressorts', label: 'Ressorts & Butées élastomères', color: '#a855f7' },
    ],
    components: [
      {
        id: 'input_shaft',
        category: 'axe_entree',
        color: '#22c55e',
        label: "1. Axe d'entrée (Vert)",
        role: 'Fixé au moyeu moteur ou porteur : transmet intégralement le couple de rotation aux deux roues (même vitesse angulaire) et reprend la charge verticale.',
        noteBySector: {
          agri: 'Interface standardisée avec les trompettes d’essieux de tracteurs (> 150 cv) et de remorques agricoles.',
          btp: 'Dimensionné pour fusées d’essieux de tombereaux, camions TP, remorques SPMT et chapes de roulettes lourdes.',
          robotique: 'S’accouple directement aux motoréducteurs électriques d’UGV, d’AGV ou de crawlers d’inspection.',
        },
      },
      {
        id: 'lobed_chassis',
        category: 'chassis_lobes',
        color: '#b45309',
        label: '2. Châssis central à lobes (Marron)',
        role: 'Corps central solidaire de l’axe d’entrée portant les articulations centrales des axes balanciers tout en logeant le mécanisme dans le volume de la jante.',
        noteBySector: {
          agri: 'Industrialisation grande série : 2 demi-coques à 2 lobes embouties à la presse et soudées au centre.',
          btp: 'Structure haute résistance logée à l’intérieur de la jante — idéal pour chargeuses minières surbaissées.',
          robotique: 'Usinable en alliage léger (aluminium/titane) pour UGV ou en acier inoxydable pour milieux marins et nucléaires.',
        },
      },
      {
        id: 'rocker_axles',
        category: 'balanciers',
        color: '#38bdf8',
        label: '3. Axes balanciers maîtres & Rotules',
        role: 'Axes en acier traité thermiquement articulés sur rotules centrales et externes : lorsqu’une roue monte de +H/2 sur l’obstacle, la roue jumelle descend de −H/2.',
        noteBySector: {
          agri: 'Rotules graissées à vie protégeables par soufflets élastomères contre la boue et les chaumes.',
          btp: 'Course verticale de 16 cm validée sur porteur Ø 1,80 m absorbant les blocs rocheux sans surcharge.',
          robotique: 'Cinématique 100 % passive (0 Watt) fonctionnant sans capteur, vérin ni électronique embarquée.',
        },
      },
      {
        id: 'carrier_plates',
        category: 'plaques',
        color: '#cbd5e1',
        label: '4. Grandes plaques / disques mobiles',
        role: 'Deux flasques parallèles portant les jantes ou bandages ; ils coulissent verticalement et s’inclinent angulairement pour épouser le profil du terrain.',
        noteBySector: {
          agri: 'Permettent de monter des pneus standards plus petits et 2× moins chers que des pneus basse pression VF.',
          btp: 'Le mouvement relatif permanent des deux flasques chasse naturellement les pierres coincées entre les pneus.',
          robotique: 'En version Roue Magnétique, multipliés en un empilement de disques d’acier mobiles épousant les parois courbes.',
        },
      },
      {
        id: 'guiding_jaws',
        category: 'machoires',
        color: '#f97316',
        label: '5. Mâchoires de guidage (Orange) & Patins (Jaunes)',
        role: 'Prennent les plaques mobiles en sandwich via des patins de frottement en bronze (jaunes) afin de garantir un écartement inter-roues rigoureusement constant.',
        noteBySector: {
          agri: 'Maintien strict de l’écartement inter-rang (atout décisif en maraîchage et cultures en lignes) + déflecteurs anti-terre.',
          btp: 'Guidage robuste encaissant les efforts transversaux de ripage sur pistes de carrières et chantiers.',
          robotique: 'Matériaux auto-lubrifiants compatibles vide, immersion sous-marine ou ambiance irradiée (CNPE).',
        },
      },
      {
        id: 'springs_stops',
        category: 'ressorts',
        color: '#a855f7',
        label: '6. Ressorts de rappel & Butées élastomères',
        role: 'Exercent un effort de centrage élastique à vide ou sur piste roulante et amortissent souplement les fins de course sans choc métal contre métal.',
        noteBySector: {
          agri: 'Objet du brevet 100 % ENSTA EP 4 180 239 : roulage routier agricole validé sans vibration jusqu’à 40–50 km/h.',
          btp: 'Stabilise les bennes et remorques TP lors des liaisons rapides sur piste jusqu’à 50 km/h.',
          robotique: 'Supprime les oscillations parasites du mât LiDAR / caméras lors des phases d’accélération et de freinage.',
        },
      },
    ],
    view: {
      width: 540,
      height: 320,
      shapes: [
        { decor: true, type: 'rect', x: 122, y: 12, w: 86, h: 38, rx: 14, fill: '#0f172a', stroke: '#334155', mirror: true },
        { decor: true, type: 'rect', x: 332, y: 12, w: 86, h: 38, rx: 14, fill: '#0f172a', stroke: '#334155', mirror: true },
        { decor: true, type: 'rect', x: 138, y: 48, w: 54, h: 10, rx: 2, fill: '#1e293b', stroke: '#475569', mirror: true },
        { decor: true, type: 'rect', x: 348, y: 48, w: 54, h: 10, rx: 2, fill: '#1e293b', stroke: '#475569', mirror: true },
        { ref: 'input_shaft', type: 'rect', x: 24, y: 144, w: 236, h: 32, rx: 4 },
        { ref: 'input_shaft', type: 'rect', x: 18, y: 124, w: 18, h: 72, rx: 3 },
        { ref: 'carrier_plates', type: 'rect', x: 157, y: 58, w: 16, h: 204, rx: 3 },
        { ref: 'carrier_plates', type: 'rect', x: 367, y: 58, w: 16, h: 204, rx: 3 },
        { ref: 'lobed_chassis', type: 'rect', x: 232, y: 74, w: 76, h: 172, rx: 12 },
        { ref: 'lobed_chassis', type: 'rect', x: 214, y: 124, w: 112, h: 72, rx: 8 },
        { ref: 'guiding_jaws', type: 'rect', x: 139, y: 66, w: 14, h: 42, rx: 3, fill: '#ea580c', mirror: true },
        { ref: 'guiding_jaws', type: 'rect', x: 177, y: 66, w: 14, h: 42, rx: 3, fill: '#ea580c', mirror: true },
        { ref: 'guiding_jaws', type: 'rect', x: 349, y: 66, w: 14, h: 42, rx: 3, fill: '#ea580c', mirror: true },
        { ref: 'guiding_jaws', type: 'rect', x: 387, y: 66, w: 14, h: 42, rx: 3, fill: '#ea580c', mirror: true },
        { ref: 'guiding_jaws', type: 'rect', x: 152, y: 72, w: 5, h: 30, rx: 1, fill: '#facc15', mirror: true },
        { ref: 'guiding_jaws', type: 'rect', x: 173, y: 72, w: 5, h: 30, rx: 1, fill: '#facc15', mirror: true },
        { ref: 'guiding_jaws', type: 'rect', x: 362, y: 72, w: 5, h: 30, rx: 1, fill: '#facc15', mirror: true },
        { ref: 'guiding_jaws', type: 'rect', x: 383, y: 72, w: 5, h: 30, rx: 1, fill: '#facc15', mirror: true },
        { ref: 'rocker_axles', type: 'polygon', points: '165,88 375,112 375,122 165,98' },
        { ref: 'rocker_axles', type: 'polygon', points: '165,222 375,198 375,208 165,232' },
        { ref: 'rocker_axles', type: 'circle', cx: 270, cy: 105, r: 11 },
        { ref: 'rocker_axles', type: 'circle', cx: 165, cy: 93, r: 9 },
        { ref: 'rocker_axles', type: 'circle', cx: 375, cy: 117, r: 9 },
        { ref: 'rocker_axles', type: 'circle', cx: 270, cy: 215, r: 11 },
        { ref: 'rocker_axles', type: 'circle', cx: 165, cy: 227, r: 9 },
        { ref: 'rocker_axles', type: 'circle', cx: 375, cy: 203, r: 9 },
        { ref: 'springs_stops', type: 'rect', x: 176, y: 148, w: 38, h: 10, rx: 4, mirror: true },
        { ref: 'springs_stops', type: 'rect', x: 326, y: 148, w: 38, h: 10, rx: 4, mirror: true },
        { ref: 'springs_stops', type: 'circle', cx: 270, cy: 66, r: 7, fill: '#c084fc', mirror: true },
      ],
    },
    evidenceLevels: [
      { id: 'patented_validated', label: 'Breveté & Validé', tone: 'good' },
      { id: 'jd_validated', label: 'Validé terrain (JD 6155R · 8 testeurs)', tone: 'good' },
      { id: 'carrier_validated', label: 'Validé porteur Ø 1,80 m (Course 16 cm)', tone: 'good' },
      { id: 'edf_validated', label: 'Validé en conduite forcée EDF', tone: 'good' },
      { id: 'ugv_validated', label: 'Validé sur démonstrateurs UGV', tone: 'good' },
      { id: 'rse_impact', label: 'Impact RSE & Sobriété', tone: 'info' },
      { id: 'known_limit', label: 'Plafond nominal', tone: 'warn' },
      { id: 'solution_identified', label: 'Solution identifiée', tone: 'info' },
      { id: 'to_optimize', label: 'Industrialisation R&D', tone: 'warn' },
      { id: 'oem_integration', label: 'Intégration OEM', tone: 'slate' },
    ],

    bySector: {
      /* ------------------------ TECH : AGRICOLE ------------------------ */
      agri: {
        title: 'Architecture CAO R2A & Audit Technique (Machinisme Agricole)',
        subtitle:
          "Les 6 sous-ensembles mécaniques du prototype Ø 1,80 m validé sur tracteur John Deere 6155R (155 cv), suivis des forces mesurées en champ et des pistes d'industrialisation grande série.",
        cadDisclaimer:
          'Coupe axiale interactive selon le code couleur CAO R2A (Axe vert, Châssis à lobes marron, Balanciers & rotules, Plaques porte-jantes, Mâchoires orange & Patins bronze jaunes, Ressorts & butées).',
        wheelLeftLabel: 'Pneu standard int.',
        wheelRightLabel: 'Pneu standard ext.',
        strengthsTabLabel: '5 Forces Validées (Essais JD 6155R)',
        limitsTabLabel: "5 Défis R&D & Pistes d'Industrialisation",
        strengths: [
          {
            title: "Angle d'inclinaison et pression au sol divisés par 2",
            detail: 'Répartition 50 % / 50 % maintenue sur obstacle jusqu’à 16 cm : stabilise le GPS RTK en haut de cabine (sillon droit), les rampes et préserve la structure des sols.',
            evidence: 'patented_validated',
          },
          {
            title: 'Forte réduction des secousses à Pencran (40–50 km/h)',
            detail: "Campagne de 16 jours en 6 sessions validée par 3 agriculteurs et 5 chauffeurs : confort nettement accru sur chemins empierrés et tenue routière sans vibration.",
            evidence: 'jd_validated',
          },
          {
            title: 'Pneus standards 2× moins chers & Lestage utile (400 kg)',
            detail: 'La mécanique absorbe le choc à la place du caoutchouc (évite les pneus VF géants ou chenilles) ; les 400 kg/roue remplacent directement les masses en fonte.',
            evidence: 'jd_validated',
          },
          {
            title: 'Continuité Run-Flat en moisson & Éjection des pierres',
            detail: 'Le mouvement relatif des plaques chasse les cailloux coincés ; en cas de crevaison, le pneu intact permet de rentrer à l’exploitation sans immobiliser le chantier de récolte.',
            evidence: 'patented_validated',
          },
          {
            title: 'Réduction de la pollution aux microplastiques de pneus',
            detail: 'Moins de surcharge unitaire et d’abrasion de gomme lessivée vers les parcelles agricoles et les rivières.',
            evidence: 'rse_impact',
          },
        ],
        limits: [
          {
            title: 'Plafond dynamique homologué à 50 km/h',
            detail: 'Le centrage élastique est calibré jusqu’à 50 km/h : couvre 100 % des tracteurs et remorques agricoles en France/Europe, hors tracteurs routiers rapides (> 60 km/h).',
            evidence: 'known_limit',
          },
          {
            title: 'Extraction rapide du pneu interne',
            detail: "Sur le prototype, il faut déposer la roue externe ; ajout prévu d'une couronne interne dentée à créneaux pour extraire le pneu intérieur en tournant.",
            evidence: 'solution_identified',
          },
          {
            title: 'Déflecteurs anti-boue sur pistes des patins bronze',
            detail: 'Les pistes de glissement non peintes recevront des racleurs/déflecteurs pour protéger les patins bronze de la terre séchée et des poussières abrasives.',
            evidence: 'to_optimize',
          },
          {
            title: 'Passage au châssis embouti-soudé grande série',
            detail: 'Remplacement du moyeu mécano-soudé à 3 lobes par 2 demi-coquilles à 2 lobes embouties à la presse pour diviser le coût de revient unitaire OEM.',
            evidence: 'to_optimize',
          },
          {
            title: 'Garde sous ailes & passage de roue constructeur',
            detail: 'Même largeur hors-tout qu’un jumelage classique ; vérification CAO de la course supérieure (+8 cm) sous garde-boue ou réduction légère du diamètre pneu.',
            evidence: 'oem_integration',
          },
        ],
        maturity: {
          title: 'Maturité technologique & feuille de route Machinisme Agricole',
          trl: 6,
          trlMax: 9,
          trlNote: 'Prototype échelle 1 (Ø 1,80 m) fabriqué, monté sur tracteur John Deere 6155R (155 cv) et validé durant 16 jours d’essais par 3 agriculteurs et 5 chauffeurs.',
          roadmap: [
            { label: 'Brevets délivrés/publiés EP 4 153 434 B1 & EP 4 180 239 (100 % ENSTA)', status: 'done', badge: 'Acquis' },
            { label: 'Essais TRL 6 sur John Deere 6155R (Pencran, 16 jours, course 16 cm, 50 km/h)', status: 'done', badge: 'Validé' },
            { label: 'Chiffrage série emboutie & qualification constructeurs remorques/tracteurs', status: 'next', badge: 'En cours' },
            { label: "Licences d'exploitation OEM / Équipementiers (Europe & Canada)", status: 'planned', badge: 'Ouvert' },
          ],
        },
      },

      /* --------------------- TECH : BTP & CARRIÈRES -------------------- */
      btp: {
        title: 'Architecture CAO R2A & Audit Technique (BTP, Mines & Manutention)',
        subtitle:
          "Cinématique haute charge (course 16 cm validée sur porteur Ø 1,80 m) logeant la suspension à l'intérieur de la jante pour tombereaux, engins miniers surbaissés, convois SPMT et roulettes lourdes.",
        cadDisclaimer:
          'Coupe axiale CAO R2A : le mécanisme à balanciers tient intégralement dans le cylindre de la jante, offrant une suspension passive aux engins dépourvus de débattement sous châssis.',
        wheelLeftLabel: 'Pneu / bandage int.',
        wheelRightLabel: 'Pneu / bandage ext.',
        strengthsTabLabel: '5 Forces Validées (Porteurs & Mines)',
        limitsTabLabel: "5 Défis R&D & Intégration Génie Civil",
        strengths: [
          {
            title: 'Suppression de la surcharge 100 % sur blocs rocheux',
            detail: 'Maintien de la répartition 50 % / 50 % jusqu’à 16 cm de franchissement asymétrique : élimine la cause principale d’éclatement sur pistes de carrières.',
            evidence: 'carrier_validated',
          },
          {
            title: 'Suspension logée dans la jante (engins miniers surbaissés)',
            detail: 'Apporte un débattement mécanique là où aucune suspension classique ne tient sous le châssis (chargeuses souterraines, remorques SPMT, outillages GSE).',
            evidence: 'patented_validated',
          },
          {
            title: 'Chasse naturelle des pierres & Continuité Run-Flat',
            detail: 'Le cisaillement relatif entre les deux flasques expulse les cailloux coincés ; en cas de crevaison, l’engin regagne l’atelier chantier sur le pneu intact.',
            evidence: 'carrier_validated',
          },
          {
            title: 'Stabilité des bennes TP & convois jusqu’à 50 km/h',
            detail: 'Soulèvement d’essieu et angle de dévers divisés par 2 (α / 2), sécurisant le transport de charges hautes (transformateurs, pales éoliennes, bennes pleines).',
            evidence: 'carrier_validated',
          },
          {
            title: 'Remplacement des pneus géants OTR par des pneus compacts',
            detail: 'Réduit fortement le coût d’achat pneumatique, les délais d’approvisionnement miniers et l’émission de particules d’usure de gomme.',
            evidence: 'rse_impact',
          },
        ],
        limits: [
          {
            title: 'Vitesse maximale de liaison à 50 km/h',
            detail: 'Parfaitement adaptée aux pistes de carrières, galeries minières, convois SPMT et tombereaux, mais non destinée aux camions routiers autoroutiers (80–90 km/h).',
            evidence: 'known_limit',
          },
          {
            title: 'Étanchéité renforcée contre poussières abrasives de silice/roche',
            detail: 'Intégration de soufflets sur rotules et de racleurs métalliques/élastomères autour des patins bronze pour les environnements miniers sévères.',
            evidence: 'to_optimize',
          },
          {
            title: 'Couronne à créneaux pour maintenance rapide du pneu interne',
            detail: 'Conception d’une couronne interne dentée permettant aux équipes de maintenance chantier d’extraire le pneu intérieur sans déposer la roue externe.',
            evidence: 'solution_identified',
          },
          {
            title: 'Dimensionnement fonderie / emboutissage forte épaisseur',
            detail: 'Adaptation métallurgique du châssis à lobes (moulé GS ou coques embouties haute limite élastique) pour les charges par essieu > 16 tonnes.',
            evidence: 'to_optimize',
          },
          {
            title: 'Encombrement axial sur ponts rigides TP & chapes GSE',
            detail: 'Adaptation de l’interface de moyeu aux entraxes constructeurs (tombereaux, modules SPMT Nicolas/TII, chariots lourds et roulettes industrielles).',
            evidence: 'oem_integration',
          },
        ],
        maturity: {
          title: 'Maturité technologique & feuille de route BTP / Mines / Manutention',
          trl: 6,
          trlMax: 9,
          trlNote: 'Mécanisme validé à TRL 6 sur porteur lourd (roues Ø 1,80 m, course 16 cm) et prototypé en roulette industrielle forte charge.',
          roadmap: [
            { label: 'Brevets EP 4 153 434 B1 / CA 3 183 669 & EP 4 180 239 (17 pays EU)', status: 'done', badge: 'Acquis' },
            { label: 'Validation porteur lourd Ø 1,80 m (course 16 cm) & prototype roulette industrielle', status: 'done', badge: 'Validé' },
            { label: 'Études d’adaptation sur essieux TP, miniers surbaissés & chariots GSE', status: 'next', badge: 'En cours' },
            { label: 'Licences équipementiers essieux / OEM Génie Civil (Europe & Canada)', status: 'planned', badge: 'Ouvert' },
          ],
        },
      },

      /* -------------------- TECH : ROBOTIQUE MOBILE -------------------- */
      robotique: {
        title: 'Architecture CAO R2A Terrestre & Variante Roue Magnétique Déformable',
        subtitle:
          "Cinématique 100 % passive (0 Watt, zéro électronique) validée sur 4 démonstrateurs ENSTA : robot terrestre UGV, crawler magnétique EDF en conduite forcée, robot sous-marin et roulette AGV.",
        cadDisclaimer:
          'Coupe axiale du moyeu passif R2A : toute la suspension est logée dans la jante sans vérin ni capteur. Voir ci-dessous la déclinaison Roue Magnétique à disques d’acier déformables.',
        wheelLeftLabel: 'Bandage / disque int.',
        wheelRightLabel: 'Bandage / disque ext.',
        strengthsTabLabel: '5 Forces Validées (4 Prototypes Robots)',
        limitsTabLabel: '5 Pistes R&D & Intégration Robotique',
        magneticVariant: {
          badge: 'Variante Brevetée EP 4 153 434 B1 · Copropriété ENSTA / EDF',
          title: 'Variante Roue Magnétique Déformable (Crawlers d’Inspection Industrielle & Nucléaire)',
          description:
            "Empilement de disques en acier découpés au laser mobiles entre eux et entraînés par des axes balanciers internes : la roue se déforme radialement de façon continue pour épouser parfaitement la courbure des conduites forcées, cuves ou coques navales et franchir les cordons de soudure sans jamais briser le circuit magnétique.",
          specs: [
            { label: 'Historique R&D', value: 'Co-développée avec EDF (2016–2021) pour l’inspection autonome de conduites forcées de barrages et ouvrages CNPE/EPR.' },
            { label: 'Gain physique', value: 'Surface de contact ferromagnétique maximale sur paroi convexe ou concave → force d’arrachement multipliée face à une roue rigide.' },
            { label: 'Durcissement', value: '100 % mécanique passif (0 électronique dans la roue) : insensible aux radiations, à l’humidité et aux champs électromagnétiques.' },
          ],
        },
        strengths: [
          {
            title: 'Stabilisation passive (α / 2) des mâts LiDAR, caméras & RTK',
            detail: 'Divise par 2 les basculements angulaires de la charge utile lors du franchissement asymétrique de galets, bordures ou seuils d’atelier, sans asservissement logiciel.',
            evidence: 'ugv_validated',
          },
          {
            title: '0 Watt consommé & Autonomie batterie préservée',
            detail: 'Contrairement aux micro-chenilles énergivores ou aux suspensions actives, la liaison R2A est purement mécanique et maximise le rayon d’action des UGV.',
            evidence: 'rse_impact',
          },
          {
            title: 'Adhérence magnétique continue sur parois courbes & soudures',
            detail: 'La variante à disques d’acier mobiles maintient le contact intime sur l’intrados ou l’extrados des conduites forcées EDF sans décrochage.',
            evidence: 'edf_validated',
          },
          {
            title: 'Durcissement total (Nucléaire, Marin & Défense)',
            detail: 'Absence totale de capteur, joint hydraulique ou carte électronique : opère sous radiation (CNPE), en immersion sous-marine ou dans le sable/boue.',
            evidence: 'patented_validated',
          },
          {
            title: 'Compacité intra-jante & Continuité de mission',
            detail: 'Libère le volume intérieur du châssis robotisé pour les batteries/capteurs et évite l’échouage de mission en cas d’avarie sur un bandage.',
            evidence: 'ugv_validated',
          },
        ],
        limits: [
          {
            title: 'Allègement masse non suspendue pour petits UGV (< 150 kg)',
            detail: 'Substitution de l’acier par des flasques en aluminium aéronautique, composites carbone ou polymères techniques selon la classe de masse du robot.',
            evidence: 'to_optimize',
          },
          {
            title: 'Plage de vitesse nominale ≤ 50 km/h',
            detail: 'Couvre l’intégralité des crawlers d’inspection, AGV logistiques, robots agricoles et UGV tactiques d’observation.',
            evidence: 'known_limit',
          },
          {
            title: 'Protection contre particules ferromagnétiques (Roue Magnétique)',
            detail: 'Ajout de racleurs non magnétiques pour éviter l’accumulation de limaille entre les disques d’acier lors des inspections de conduites.',
            evidence: 'solution_identified',
          },
          {
            title: 'Tarage des ressorts selon la masse embarquée',
            detail: 'Adaptation modulaire de la raideur élastique lorsque le robot change d’outil ou de charge utile embarquée.',
            evidence: 'to_optimize',
          },
          {
            title: 'Couplage direct aux moteurs-roues (In-Wheel Motors)',
            detail: 'Intégration CAO de l’axe d’entrée R2A autour ou en sortie des réducteurs planétaires standards des constructeurs d’UGV et d’AGV.',
            evidence: 'oem_integration',
          },
        ],
        maturity: {
          title: 'Maturité technologique & feuille de route Robotique & Inspection',
          trl: 6,
          trlMax: 9,
          trlNote: '4 démonstrateurs fonctionnels fabriqués et testés : robot terrestre tout-terrain (plage/galets), crawler magnétique en conduite forcée EDF, robot sous-marin et roulette AGV.',
          roadmap: [
            { label: 'Co-développement roue magnétique EDF (2016–2021) & Brevet EP 4 153 434 B1', status: 'done', badge: 'Acquis' },
            { label: 'Essais robot terrestre (plage/obstacles), conduite forcée EDF & sous-marin', status: 'done', badge: 'Validé' },
            { label: 'Co-dimensionnement PoC avec fabricants d’UGV, AgBots, AGV & crawlers CNPE', status: 'next', badge: 'En cours' },
            { label: 'Licences sectorielles Robotique & Inspection (Europe, UK, Suisse & Canada)', status: 'planned', badge: 'Ouvert' },
          ],
        },
      },
    },
  },

  /* --------------------------------------------------------------------- */
  /*  HUB DÉMO & SUPPORTS (PLAYLIST VIDÉO /Video/ + PLAQUETTES /Plaquette/) */
  /* --------------------------------------------------------------------- */
  mediaHub: {
    nativeVideoNotice:
      'Format natif caméra (.MTS / .mov) — Si votre navigateur ne lance pas la lecture directe, cliquez sur « Télécharger la vidéo » pour l’ouvrir (VLC / lecteur système) ou chargez une version .mp4.',
    loadButtonLabel: 'Charger un fichier vidéo local (.mp4 / .webm)',
    headerBySector: {
      agri: {
        eyebrow: 'Démo Terrain Agricole & Data Room R2A',
        title: 'Démonstration Tracteur 155 cv (John Deere 6155R) & Supports B2B',
        subtitle:
          "Visionnez la campagne d'essais de 16 jours à Pencran (roues Ø 1,80 m), parcourez le Pitch Deck Machinisme Agricole 16:9 ou téléchargez la plaquette officielle Porteur Lourd (FR / US).",
      },
      btp: {
        eyebrow: 'Démo Porteurs Lourds & Data Room R2A',
        title: 'Démonstration Franchissement Haute Charge & Supports BTP / Mines',
        subtitle:
          'Observez le maintien de contact 50 % / 50 % sur course de 16 cm (porteur Ø 1,80 m), parcourez le Pitch Deck Génie Civil 16:9 ou téléchargez les plaquettes Porteur Lourd & Roulette Industrielle (FR / US).',
      },
      robotique: {
        eyebrow: 'Démonstrateurs Robotiques & Data Room R2A',
        title: 'Démonstrations Robots Terrestres, Roue Magnétique EDF & Supports B2B',
        subtitle:
          "Explorez les 5 vidéos d'essais (UGV tout-terrain, plage de galets, roue magnétique déformable en conduite forcée EDF), le Pitch Deck Robotique 16:9 et les 3 plaquettes officielles (FR / US).",
      },
    },

    /* ---------------- PLAYLISTS VIDÉO FILTRÉES PAR SECTEUR --------------- */
    videosBySector: {
      agri: [
        {
          id: 'agri-vid-1',
          title: 'Démonstration Tracteur 155 cv (John Deere 6155R)',
          src: '/Video/Reinvent_the_wheel.mp4',
          fallbackSrc: '/Vidéo/Reinvent_the_wheel.mp4',
          badge: 'TRL 6 · John Deere 6155R (155 cv) · Ø 1,80 m',
          nativeFormat: false,
          description:
            "Campagne de 16 jours d'essais réels en 6 sessions : franchissement d'obstacles jusqu'aux butées mécaniques (16 cm), maintien de l'assiette GPS RTK (α/2), test en virage et roulage routier à Pencran jusqu'à 40–50 km/h sans aucune vibration (validé par 3 agriculteurs et 5 chauffeurs).",
          chapters: [
            {
              id: 'ag-c1',
              time: '00:00',
              seconds: 0,
              title: 'Le problème du jumelage rigide',
              metric: 'Surcharge 100 % sur 1 pneu',
              detail: 'Sur obstacle asymétrique, la roue jumelle rigide décolle et reporte toute la charge et le roulis α sur un seul pneumatique.',
            },
            {
              id: 'ag-c2',
              time: '00:20',
              seconds: 20,
              title: 'Cinématique R2A (+H/2 / -H/2)',
              metric: 'Répartition 50 % / 50 %',
              detail: 'Les axes balanciers sur rotules maintiennent les deux pneus standards au contact du sol avec un écartement constant.',
            },
            {
              id: 'ag-c3',
              time: '00:45',
              seconds: 45,
              title: 'Franchissement 16 cm sur JD 6155R',
              metric: 'Angle α / 2 · GPS RTK droit',
              detail: 'Franchissement jusqu’aux butées mécaniques (16 cm) sur tracteur John Deere 6155R (Ø 1,80 m) : cabine stabilisée et confort validé.',
            },
            {
              id: 'ag-c4',
              time: '01:10',
              seconds: 70,
              title: 'Roulage routier sans vibration',
              metric: '40–50 km/h à Pencran',
              detail: 'Validation sur route à Pencran du système de rappel élastique anti-vibration (brevet 100 % ENSTA EP 4 180 239).',
            },
          ],
        },
        {
          id: 'agri-vid-2',
          title: "Présentation Technique Complète du Projet R2A (Par Y. Argouarc'h)",
          src: '/Video/Roues auto_adaptatives.mov',
          fallbackSrc: '/Vidéo/Roues auto_adaptatives.mov',
          badge: 'Conférence Technique Complète · ENSTA',
          nativeFormat: true,
          description:
            "Présentation détaillée par l'inventeur (Yannick Argouarc'h) de la genèse du concept R2A, de l'architecture mécanique interne, des campagnes d'essais et des déclinaisons multi-sectorielles.",
          chapters: [],
        },
      ],

      btp: [
        {
          id: 'btp-vid-1',
          title: 'Démonstration Porteur Lourd & Franchissement Haute Charge',
          src: '/Video/Reinvent_the_wheel.mp4',
          fallbackSrc: '/Vidéo/Reinvent_the_wheel.mp4',
          badge: 'Porteurs Lourds & Chantiers · Course 16 cm',
          nativeFormat: false,
          description:
            "Démonstration sur porteur lourd (roues Ø 1,80 m) du maintien de contact 50 % / 50 % sur obstacle dur de 16 cm : suppression de la surcharge unitaire sur bloc rocheux, éjection des pierres et stabilisation de la benne (α/2).",
          chapters: [
            {
              id: 'btp-c1',
              time: '00:00',
              seconds: 0,
              title: 'Surcharge unitaire en jumelage rigide TP',
              metric: 'Risque éclatement sur roche',
              detail: 'Au passage d’un bloc dur, un pneu de jumelage rigide encaisse 100 % de la charge tandis que le pneu jumelé décolle.',
            },
            {
              id: 'btp-c2',
              time: '00:20',
              seconds: 20,
              title: 'Balancier R2A intra-jante (+H/2 / -H/2)',
              metric: 'Suspension logée dans la roue',
              detail: 'Le mécanisme R2A loge 16 cm de course verticale à l’intérieur de la jante, idéal pour porteurs TP et engins miniers surbaissés.',
            },
            {
              id: 'btp-c3',
              time: '00:45',
              seconds: 45,
              title: 'Franchissement haute charge (Ø 1,80 m)',
              metric: '50 % / 50 % · Anti-pierre',
              detail: 'Les deux pneus restent en appui équilibré sur l’obstacle de 16 cm et le mouvement relatif des flasques chasse les pierres.',
            },
            {
              id: 'btp-c4',
              time: '01:10',
              seconds: 70,
              title: 'Tenue de piste & stabilité de benne',
              metric: 'Roulis α / 2 jusqu’à 50 km/h',
              detail: 'Le centrage élastique stabilise le châssis et la benne lors des liaisons rapides sur piste.',
            },
          ],
        },
        {
          id: 'btp-vid-2',
          title: "Présentation Technique Complète du Projet R2A (Par Y. Argouarc'h)",
          src: '/Video/Roues auto_adaptatives.mov',
          fallbackSrc: '/Vidéo/Roues auto_adaptatives.mov',
          badge: 'Ingénierie & Brevets · ENSTA',
          nativeFormat: true,
          description:
            'Exposé technique complet du mécanisme R2A pour porteurs lourds, remorques TP et roulettes industrielles de manutention lourde.',
          chapters: [],
        },
      ],

      robotique: [
        {
          id: 'rob-vid-2',
          title: 'Essais Robot Mobile en Environnement Naturel (Plage & Galets)',
          src: '/Video/Robotique_mobile-test-plage.mp4',
          fallbackSrc: '/Vidéo/Robotique_mobile-test-plage.mp4',
          badge: 'Essais Terrain · Mobilité Tout-Terrain (.mp4)',
          nativeFormat: false,
          description:
            'Campagne de roulage du démonstrateur robotisé sur sol meuble et galets démontrant la motricité continue sans électronique ni consommation énergétique additionnelle.',
          chapters: [],
        },
        {
          id: 'rob-vid-3',
          title: 'Roue Magnétique Auto-Adaptative (Concept & Déformation)',
          src: '/Video/Roue Magnetique.mp4',
          fallbackSrc: '/Vidéo/Roue Magnetique.mp4',
          badge: 'Inspection Industrielle & Nucléaire · Brevet EDF/ENSTA (.mp4)',
          nativeFormat: false,
          description:
            "Roue métallique déformable composée d'un empilement de disques d'acier découpés au laser mobiles entre eux : épouse parfaitement la courbure des parois métalliques et les cordons de soudure pour maximiser l'attraction magnétique.",
          chapters: [],
        },
        {
          id: 'rob-vid-4',
          title: 'Robot à Roues Magnétiques en Conduite Forcée (Barrage EDF)',
          src: '/Video/Roue Magnetique dans conduite .mp4',
          fallbackSrc: '/Vidéo/Roue Magnetique dans conduite .mp4',
          badge: 'Essais en Conduite Forcée · Inspection Barrages & EPR (.mp4)',
          nativeFormat: false,
          description:
            "Évolution du robot d'inspection autonome à l'intérieur d'une conduite courbe : adhérence magnétique maximale maintenue malgré la courbure de la paroi.",
          chapters: [],
        },
        {
          id: 'rob-vid-1',
          title: "Robot Terrestre Tout-Terrain : Franchissement d'Obstacles",
          src: '/Video/Roue Terrestre.MTS',
          fallbackSrc: '/Vidéo/Roue Terrestre.MTS',
          badge: 'Démonstrateur Robot Terrestre · ENSTA (.MTS)',
          nativeFormat: true,
          description:
            "Franchissement passif d'obstacles asymétriques par un robot mobile équipé de roues auto-adaptatives R2A : maintien des 4 roues au contact du sol et division par 2 de l'inclinaison du châssis (mât LiDAR / caméras stabilisé sans suspension active).",
          chapters: [],
        },
        {
          id: 'rob-vid-5',
          title: "Présentation Globale des 4 Prototypes R2A (Par Y. Argouarc'h)",
          src: '/Video/Roues auto_adaptatives.mov',
          fallbackSrc: '/Vidéo/Roues auto_adaptatives.mov',
          badge: 'Synthèse Complète · Terrestre, Magnétique & Sous-Marin (.mov)',
          nativeFormat: true,
          description:
            "Présentation complète par Yannick Argouarc'h incluant l'historique EDF (2016–2021), le robot terrestre, le robot sous-marin et la roulette industrielle.",
          chapters: [],
        },
      ],
    },

    /* ---------------- PITCH DECK 6 SLIDES PAR SECTEUR -------------------- */
    pitchDeckBySector: {
      agri: {
        title: 'Pitch Deck Exécutif · Machinisme Agricole (6 Slides — 16:9)',
        subtitle: 'Support de présentation destiné aux constructeurs de tracteurs, remorques, pulvérisateurs et équipementiers agricoles.',
        deckTag: 'ENSTA · TECHNOLOGIE R2A · MACHINISME AGRICOLE',
        slides: [
          {
            id: 'ag-s1',
            number: '01',
            kicker: 'Le Constat Terrain Agricole',
            title: 'Chemins empierrés, dérive GPS RTK & coût prohibitif des pneus VF / chenilles',
            lead: 'En transport de récolte comme au champ, les trains roulants agricoles actuels imposent un compromis coûteux entre tassement, casse sur cailloux et précision RTK.',
            accent: '#f87171',
            kpis: [
              { value: '100 %', label: 'de surcharge sur 1 seul pneu en jumelage rigide sur cailloux (roue jumelle décollée)' },
              { value: 'ΔX RTK', label: 'déport latéral de l’antenne GPS en haut de cabine et secousses chauffeur' },
              { value: '×2 à ×4', label: 'surcoût d’achat et de MCO des pneus basse pression VF géants ou des chenilles' },
            ],
            cards: [
              { tag: 'Jumelage rigide', title: 'Éclatements & tassement', text: 'Pics de pression sur pierres, cailloux coincés entre jantes et roulis complet de cabine (angle α).' },
              { tag: 'Pneus VF + CTIS', title: 'Carcasse onéreuse', text: 'Fatigue rapide des flancs souples sur route, compresseur et joints tournants complexes.' },
              { tag: 'Chenilles caoutchouc', title: 'Coût & usure routière', text: 'Investissement lourd, échauffement sur liaisons routières et consommation GNR accrue.' },
            ],
          },
          {
            id: 'ag-s2',
            number: '02',
            kicker: 'La Rupture Mécanique R2A',
            title: 'Balancier passif breveté : pression ÷ 2, inclinaison α / 2 & pneus standards',
            lead: 'Brevet Unitaire EP 4 180 239 (100 % ENSTA, 17 pays EU) + EP 4 153 434 B1 / CA 3 183 669 — 100 % mécanique.',
            accent: '#84cc16',
            kpis: [
              { value: '+H/2 / −H/2', label: 'course verticale jusqu’à 16 cm maintenant les 2 pneus plaqués au sol' },
              { value: '50 % / 50 %', label: 'pression de contact divisée par 2 et écartement inter-rang strictement fixe' },
              { value: 'α / 2', label: 'roulis de cabine et déviation de l’antenne GPS RTK divisés par 2 jusqu’à 50 km/h' },
            ],
            cards: [
              { tag: 'Sobriété pneumatique', title: 'Pneus standards 2× moins chers', text: 'Le mécanisme travaille à la place des fibres du pneu : monte standard plus petite et durable.' },
              { tag: 'EP 4 153 434 B1', title: 'Balanciers & patins bronze', text: 'Moyeu à lobes, axes en acier traité sur rotules et mâchoires garantissant l’écartement constant.' },
              { tag: 'EP 4 180 239 (100 % ENSTA)', title: 'Centrage anti-vibration 50 km/h', text: 'Ressorts de rappel et butées élastomères assurant une tenue routière stable sans shimmy.' },
            ],
          },
          {
            id: 'ag-s3',
            number: '03',
            kicker: 'Preuve de Concept TRL 6',
            title: '16 jours d’essais validés sur tracteur John Deere 6155R (155 cv · Ø 1,80 m)',
            lead: 'Campagne complète en 6 sessions (franchissement 16 cm, champs, virages et route à Pencran jusqu’à 40–50 km/h).',
            accent: '#34d399',
            kpis: [
              { value: '8 testeurs', label: '3 agriculteurs exploitants & 5 chauffeurs ayant validé le gain de confort cabine' },
              { value: '400 kg', label: 'lestage utile par roue sur tracteur remplaçant ~1 800 € de masses en fonte' },
              { value: 'Run-Flat', label: 'retour sécurisé à l’exploitation sur 1 seul pneu sans arrêt de moisson' },
            ],
            cards: [
              { tag: 'Guidage & Rampes', title: 'Sillon GPS RTK préservé', text: 'Forte atténuation des coups de raquette en cabine et stabilisation des rampes de pulvérisation.' },
              { tag: 'Traction & Sols', title: 'Motricité & anti-tassement', text: 'Masse fonctionnelle assurant l’adhérence sans patinage et baisse des microplastiques de gomme.' },
              { tag: 'Fiabilité champ', title: 'Auto-nettoyage des pierres', text: 'Le mouvement relatif des deux plaques expulse naturellement les cailloux engagés dans le jumelage.' },
            ],
          },
          {
            id: 'ag-s4',
            number: '04',
            kicker: "Cas d'Usage Agricoles Prioritaires",
            title: 'Segments cibles Machinisme Agricole (Europe & Canada ≤ 50 km/h)',
            lead: 'Intégration première monte (OEM) ou option essieu équipé sur véhicules agricoles lourds non suspendus.',
            accent: '#38bdf8',
            kpis: [
              { value: '24 à 32 t', label: 'bennes de moisson & tonnes à lisier lourdes exposées aux chemins caillouteux' },
              { value: '> 150 cv', label: 'tracteurs de forte puissance valorisant directement les 2 × 400 kg de lestage' },
              { value: 'Inter-rang', label: 'maintien rigoureux de l’écartement entre pneus pour maraîchage et cultures en lignes' },
            ],
            cards: [
              { tag: 'Remorques & Lisier', title: 'Bennes & Tonnes lourdes', text: 'Cibles types Rolland, Pichon, Mauguin, Joskin : zéro éclatement sur chemin et stabilité en dévers.' },
              { tag: 'Tracteurs & Récolte', title: 'Tracteurs >150 cv & Automoteurs', text: 'Cibles types Claas, John Deere, CNH, Fendt : traction, confort cabine et préservation des sols.' },
              { tag: 'Pulvérisation & Rangs', title: 'Pulvérisateurs & Maraîchage', text: 'Cibles types Kuhn, Berthoud, Horsch : stabilité horizontale des rampes grandes largeurs et GPS.' },
            ],
          },
          {
            id: 'ag-s5',
            number: '05',
            kicker: 'Industrialisation Série & TCO Exploitant',
            title: 'Moyeu embouti-soudé grande série & amortissement en ~26 mois',
            lead: 'Conception Design-to-Cost adaptée aux presses des équipementiers de jantes et d’essieux agricoles.',
            accent: '#a78bfa',
            kpis: [
              { value: '9 500 €', label: 'surcoût cible / machine (soit 7 700 € net après 1 800 € de masses fonte évitées)' },
              { value: '~26 mois', label: 'retour sur investissement via pneus standards 2× moins chers et +30 % durables' },
              { value: '+12,9 k€', label: 'VAN nette sur 7 ans pour 1 tracteur (850 h/an) avec zéro arrêt moisson' },
            ],
            cards: [
              { tag: 'Série Emboutie', title: '2 demi-coquilles soudées', text: 'Remplace le moyeu proto 3 lobes mécano-soudé par 2 coques embouties à coût unitaire réduit.' },
              { tag: 'Maintenance Ferme', title: 'Couronne interne à créneaux', text: 'Extraction rapide du pneu intérieur par rotation sans démonter la roue externe.' },
              { tag: 'Durabilité', title: 'Déflecteurs anti-terre', text: 'Protection des patins bronze contre la boue séchée et tarage progressif des butées caoutchouc.' },
            ],
          },
          {
            id: 'ag-s6',
            number: '06',
            kicker: 'Transfert & Licences B2B',
            title: "Conditions de partenariat industriel avec l'ENSTA",
            lead: 'Brevet terrestre EP 4 180 239 détenu à 100 % par ENSTA (17 pays EU) + couverture Canada CA 3 183 669.',
            accent: '#f59e0b',
            kpis: [
              { value: '2 à 6 %', label: 'redevance type sur prix de vente + part fixe (licence exclusive ou non)' },
              { value: 'Prêt PoC', label: 'prêt/location du démonstrateur Ø 1,80 m ou contrat de R&D sur votre machine' },
              { value: 'DAJV', label: 'interlocuteurs officiels : Caroline PENGAM, Maryline BENARD & Y. ARGOUARC’H' },
            ],
            cards: [
              { tag: 'Voie 1 · OEM & Rang 1', title: "Licence d'Exploitation", text: 'Licence exclusive sur votre segment agricole ou non-exclusive auprès d’un équipementier essieux/jantes.' },
              { tag: 'Voie 2 · Essai & Adaptation', title: 'Prêt Démonstrateur / R&D', text: 'Test du train Ø 1,80 m existant ou co-dimensionnement CAO d’un essieu remorque/tracteur dédié.' },
              { tag: 'Voie 3 · Exclusivité', title: 'Cession / Spin-off', text: 'Option d’acquisition ou partenariat capitalistique autour d’une entité dédiée aux trains R2A.' },
            ],
          },
        ],
      },

      btp: {
        title: 'Pitch Deck Exécutif · BTP, Mines & Convois Lourds (6 Slides — 16:9)',
        subtitle: "Support de présentation pour constructeurs d'engins de chantier, miniers, convois SPMT et manutention industrielle.",
        deckTag: 'ENSTA · TECHNOLOGIE R2A · GÉNIE CIVIL, MINES & MANUTENTION',
        slides: [
          {
            id: 'btp-s1',
            number: '01',
            kicker: 'Le Constat Chantier & Carrières',
            title: 'Éclatements sur roche, arrêts de piste critiques & engins sans place pour suspension',
            lead: 'En carrière, mine souterraine ou convoi exceptionnel, chaque surcharge unitaire sur bloc rocheux menace l’intégrité des pneus et la stabilité de la charge.',
            accent: '#f87171',
            kpis: [
              { value: '100 %', label: 'de la charge concentrée sur 1 seul pneu en jumelage rigide TP sur un bloc dur' },
              { value: 'Downtime', label: 'immobilisation coûteuse de la chaîne d’extraction lors d’un éclatement sur piste' },
              { value: '0 place', label: 'sous châssis sur chargeuses minières surbaissées, SPMT et chariots lourds GSE' },
            ],
            cards: [
              { tag: 'Jumelage rigide TP', title: 'Coupures & pierres coincées', text: 'Écrasement unitaire de la carcasse et pierres enchâssées détruisant les flancs internes.' },
              { tag: 'Pneus Géants OTR', title: 'CAPEX & délais critiques', text: 'Coût unitaire très élevé, pénurie d’approvisionnement et échauffement sous forte charge.' },
              { tag: 'Bennes & Convois', title: 'Dévers brutal (angle α)', text: 'Risque de basculement des bennes levées ou des colis lourds éoliens/nucléaires sur piste.' },
            ],
          },
          {
            id: 'btp-s2',
            number: '02',
            kicker: 'La Rupture Mécanique R2A',
            title: 'Une suspension passive de 16 cm logée directement dans le moyeu de roue',
            lead: 'Brevets européens & canadiens EP 4 180 239 (100 % ENSTA, 17 pays EU) et EP 4 153 434 B1 / CA 3 183 669.',
            accent: '#fb923c',
            kpis: [
              { value: '16 cm', label: 'de course verticale (+H/2 / −H/2) absorbant les blocs rocheux sans vérin hydraulique' },
              { value: '50 % / 50 %', label: 'charge divisée par 2 sur chaque pneu/bandage et chasse naturelle des pierres' },
              { value: 'Run-Flat', label: 'retour direct à l’atelier chantier sur le pneu intact sans immobiliser la piste' },
            ],
            cards: [
              { tag: 'Architecture Intra-Jante', title: 'Zéro encombrement châssis', text: 'Idéal pour engins surbaissés de mines souterraines et roulettes industrielles ultra-compactes.' },
              { tag: 'Sobriété OTR', title: 'Pneus standards compacts', text: 'Substitue deux pneus standards économiques et disponibles à un pneu géant Génie Civil.' },
              { tag: 'Stabilité 50 km/h', title: 'Roulis divisé par 2 (α / 2)', text: 'Rappel élastique et butées amortissantes stabilisant le porteur jusqu’à 50 km/h.' },
            ],
          },
          {
            id: 'btp-s3',
            number: '03',
            kicker: 'Preuve de Concept TRL 6',
            title: 'Validé sur porteur lourd (Ø 1,80 m · Course 16 cm) & roulette industrielle',
            lead: 'Essais échelle 1 sous forte charge verticale jusqu’en butée mécanique et maquettage roulette métallique/bandage.',
            accent: '#34d399',
            kpis: [
              { value: 'Ø 1,80 m', label: 'démonstrateur porteur lourd testé sur obstacles durs jusqu’à 16 cm et route 50 km/h' },
              { value: '÷ 2', label: 'réduction mesurée du soulèvement d’essieu, du roulis châssis et des chocs transmis' },
              { value: '2 variantes', label: 'essieu porteur pneumatique haute charge & roulette industrielle à bandage/acier' },
            ],
            cards: [
              { tag: 'Protection Carcasse', title: 'Éjection active des cailloux', text: 'Le mouvement relatif vertical des deux flasques empêche tout coincement durable de roche.' },
              { tag: 'Sécurité Opérateur', title: 'Baisse drastique des chocs', text: 'Réduction des vibrations corps entier (WBV) pour les conducteurs d’engins sur pistes défoncées.' },
              { tag: 'Manutention Usine', title: 'Franchissement de seuils', text: 'En roulette industrielle, franchit rails, joints de dilatation et sols dégradés sans secouer la charge.' },
            ],
          },
          {
            id: 'btp-s4',
            number: '04',
            kicker: "Cas d'Usage BTP, Mines & Convois",
            title: '5 segments industriels prioritaires (Europe, Royaume-Uni, Suisse & Canada)',
            lead: 'Ciblage des engins lourds (≤ 50 km/h) où l’absence de suspension ou l’usure pneumatique pénalise l’exploitation.',
            accent: '#38bdf8',
            kpis: [
              { value: 'Carrières', label: 'tombereaux articulés/rigides & camions TP lourds sur pistes enrochées' },
              { value: 'Mines', label: 'chargeuses souterraines surbaissées (LHD) sans volume disponible sous châssis' },
              { value: 'SPMT & GSE', label: 'convois éoliens/nucléaires & chariots lourds / outillages aéronautiques au sol' },
            ],
            cards: [
              { tag: 'Terrassement & Mines', title: 'Tombereaux, Camions K & LHD', text: 'Cibles types Caterpillar, Liebherr, Renault Trucks (Gamme K), Sandvik et Aramine.' },
              { tag: 'Transport Exceptionnel', title: 'Modules SPMT Éolien / Nucléaire', text: 'Cibles types Nicolas / TII Group, Faymonville : accès parcs éoliens et nivellement passif.' },
              { tag: 'Manutention & GSE', title: 'Chariots Lourds & Outillages', text: 'Cibles types Manitou (gamme MHT) et outillages aéroportuaires/industriels Airbus GSE.' },
            ],
          },
          {
            id: 'btp-s5',
            number: '05',
            kicker: 'Industrialisation & TCO Chantier',
            title: 'Amortissement en ~16 mois par réduction des arrêts piste et du budget pneus',
            lead: 'Architecture robuste (coques acier HLE embouties ou fonderie GS) adaptée aux équipementiers d’essieux lourds.',
            accent: '#a78bfa',
            kpis: [
              { value: '11 000 €', label: 'surcoût cible / essieu porteur équipé en série avec monte standard compacte' },
              { value: '~16 mois', label: 'point mort type sur engin de carrière (1 500 h/an) grâce au gain pneus + Run-Flat' },
              { value: '−75 %', label: 'd’heures d’arrêt critique sur piste grâce au retour atelier sur 1 seul pneu' },
            ],
            cards: [
              { tag: 'Série Haute Charge', title: 'Coques HLE ou Fonderie GS', text: 'Conception industrialisable sur lignes d’essieux TP et chapes de roulettes forte charge.' },
              { tag: 'Maintenance Piste', title: 'Couronne dentée rapide', text: 'Dépose du pneumatique intérieur sans démontage complet du flasque externe.' },
              { tag: 'Protection Mines', title: 'Racleurs & soufflets', text: 'Étanchéité des rotules et protection des patins bronze contre la poussière de roche abrasive.' },
            ],
          },
          {
            id: 'btp-s6',
            number: '06',
            kicker: 'Transfert & Licences B2B',
            title: "Modèles de licence et co-développement avec l'ENSTA",
            lead: 'Portefeuille protégé en Europe (17 pays Brevet Unitaire + UK + Suisse) et au Canada (secteur minier majeur).',
            accent: '#f59e0b',
            kpis: [
              { value: '2 à 6 %', label: 'redevance industrielle sur prix de vente + part fixe (exclusivité sectorielle possible)' },
              { value: 'PoC R&D', label: 'dimensionnement sur-mesure (essieu TP, LHD minier ou roulette GSE) avec l’ENSTA' },
              { value: 'EU + CA', label: 'couverture brevet idéale pour les marchés Génie Civil européens et miniers canadiens' },
            ],
            cards: [
              { tag: 'Voie 1 · Équipementiers & OEM', title: "Licence d'Exploitation", text: 'Licence par segment (TP, Mines, SPMT ou Manutention/GSE) négociée avec la DAJV ENSTA.' },
              { tag: 'Voie 2 · Bureau d’Études', title: 'Contrat R&D / Prêt Proto', text: 'Adaptation CAO aux charges/entraxes de votre porteur et essais avec Yannick Argouarc’h.' },
              { tag: 'Contacts Officiels', title: 'DAJV ENSTA', text: 'Caroline PENGAM & Maryline BENARD (Valorisation & Contrats) · Yannick ARGOUARC’H (Technique).' },
            ],
          },
        ],
      },

      robotique: {
        title: 'Pitch Deck Exécutif · Robotique Mobile & Inspection (6 Slides — 16:9)',
        subtitle: "Support de présentation pour fabricants d'UGV, AgBots, robots de défense, AGV lourds et crawlers d'inspection nucléaire/industrielle.",
        deckTag: 'ENSTA · TECHNOLOGIE R2A · UGV, ROUES MAGNÉTIQUES & AGV',
        slides: [
          {
            id: 'rob-s1',
            number: '01',
            kicker: 'Le Défi de la Mobilité Robotique',
            title: 'Instabilité des capteurs, coût énergétique des chenilles & décrochage sur parois courbes',
            lead: 'Les plateformes autonomes (UGV, crawlers, AGV) subissent un arbitrage sévère entre franchissement, autonomie batterie et durcissement environnemental.',
            accent: '#f87171',
            kpis: [
              { value: 'Dépointage', label: 'basculement angulaire α des mâts LiDAR, caméras et RTK au moindre obstacle' },
              { value: 'Batterie', label: 'perte d’autonomie élevée sur micro-chenilles ou suspensions actives motorisées' },
              { value: 'Paroi courbe', label: 'perte d’entrefer et décrochage des roues magnétiques rigides sur conduites & soudures' },
            ],
            cards: [
              { tag: 'Trains rigides UGV/AGV', title: 'Perte de contact & chocs', text: 'Une roue décolle sur galet ou joint de sol : patinage, secousses charge utile et flou capteurs.' },
              { tag: 'Suspensions pilotées', title: 'Complexité & fragilité', text: 'Actionneurs, capteurs et électronique vulnérables à l’immersion, à la boue et aux radiations CNPE.' },
              { tag: 'Crawlers magnétiques', title: 'Contact ponctuel limitant', text: 'Une roue acier rigide touche mal un tube courbe et perd son aimantation sur un cordon de soudure.' },
            ],
          },
          {
            id: 'rob-s2',
            number: '02',
            kicker: 'La Rupture R2A (Terrestre & Magnétique)',
            title: 'Franchissement et conformation 100 % passifs : 0 Watt, 0 capteur, 0 ligne de code',
            lead: 'Deux déclinaisons brevetées (EP 4 153 434 B1 ENSTA/EDF & EP 4 180 239 100 % ENSTA) logées au cœur de la roue.',
            accent: '#22d3ee',
            kpis: [
              { value: '0 Watt', label: 'adaptation purement mécanique préservant 100 % de l’énergie batterie pour la mission' },
              { value: 'α / 2', label: 'inclinaison du châssis et dépointage du mât LiDAR / Caméras / RTK divisés par 2' },
              { value: 'Multi-disques', label: 'variante magnétique à disques d’acier mobiles épousant les conduites courbes' },
            ],
            cards: [
              { tag: 'UGV & AgBots Terrestres', title: 'Suspension intra-jante', text: 'Deux bandages/pneus sur balanciers internes libérant tout le volume du châssis pour les batteries.' },
              { tag: 'Crawlers Magnétiques', title: 'Disques acier déformables', text: 'Empilement de disques découpés laser maximisant la surface de contact magnétique sur tube.' },
              { tag: 'Milieux Extrêmes', title: 'Durcissement nucléaire & marin', text: 'Aucune électronique dans la liaison au sol : opère sous radiation, sous l’eau ou en zone ATEX.' },
            ],
          },
          {
            id: 'rob-s3',
            number: '03',
            kicker: '4 Démonstrateurs Fonctionnels Validés',
            title: 'De la plage de galets aux conduites forcées de barrages EDF',
            lead: 'Technologie éprouvée sur 4 prototypes physiques couvrant la mobilité terrestre, verticale magnétique, sous-marine et industrielle.',
            accent: '#34d399',
            kpis: [
              { value: 'UGV Plage', label: 'essais tout-terrain sur galets, sable et obstacles asymétriques (4 roues au contact)' },
              { value: 'Barrage EDF', label: 'crawler magnétique testé avec succès dans une conduite forcée courbe (2016–2021)' },
              { value: 'Sous-Marin & AGV', label: 'prototypes validés en environnement immergé et en roulette industrielle forte charge' },
            ],
            cards: [
              { tag: 'Qualité Perception', title: 'Nuages LiDAR & vidéo stables', text: 'Réduction de moitié des saccades angulaires facilitant le SLAM et l’inspection visuelle.' },
              { tag: 'Sécurité Inspection', title: 'Franchissement de soudures', text: 'Les disques magnétiques franchissent progressivement le cordon sans rupture brutale d’adhérence.' },
              { tag: 'Résilience Mission', title: 'Zéro récupération humaine', text: 'Continuité de roulage en cas d’avarie d’un bandage externe pour regagner la base en autonomie.' },
            ],
          },
          {
            id: 'rob-s4',
            number: '04',
            kicker: "Cas d'Usage Robotiques Prioritaires",
            title: '4 marchés robotiques à forte valeur ajoutée (Europe & Amérique du Nord)',
            lead: 'Intégration sur robots mobiles non suspendus ou crawlers opérant en environnements complexes.',
            accent: '#38bdf8',
            kpis: [
              { value: 'AgBots', label: 'plateformes autonomes extérieures & cultures spécialisées (stabilité capteurs/outils)' },
              { value: 'Défense / Sécu.', label: 'UGV tactiques, reconnaissance & pompiers (franchissement silencieux 0 W)' },
              { value: 'CNPE & Barrages', label: 'crawlers magnétiques d’inspection nucléaire, hydraulique, éolien & naval' },
            ],
            cards: [
              { tag: 'Agri-Robotique', title: 'Robots autonomes des champs', text: 'Cibles types Kuhn (Karl), Exxact Robotics, Sitia, Naïo : précision d’outil et sobriété batterie.' },
              { tag: 'Défense & Intervention', title: 'UGV Tout-Terrain & Sécurité', text: 'Cibles types Arquus, Exail, Shark Robotics : mobilité robuste sans électronique exposée.' },
              { tag: 'Inspection & Logistique', title: 'Crawlers CND & AGV Lourds', text: 'Cibles types EDF, Framatome, prestataires CND navals/éoliens et fabricants d’AGV/AMR lourds.' },
            ],
          },
          {
            id: 'rob-s5',
            number: '05',
            kicker: 'Industrialisation & TCO Opérateur Robot',
            title: 'Moins cher, plus compact et plus fiable qu’une suspension active pilotée',
            lead: 'Architecture modulaire adaptable en échelle (du crawler de 15 kg à l’UGV lourd de plusieurs tonnes).',
            accent: '#a78bfa',
            kpis: [
              { value: '~1 500 €', label: 'ordre de grandeur cible / train passif R2A d’UGV (soit ~900 € net hors susp. active évitée)' },
              { value: '< 12 mois', label: 'amortissement via la baisse des récupérations terrain et du MCO train roulant' },
              { value: 'Sur-mesure', label: 'usinage alliage léger, polymères techniques ou empilement laser acier magnétique' },
            ],
            cards: [
              { tag: 'Intégration Motoréducteur', title: 'Montage direct en bout d’arbre', text: 'Se boulonne en sortie des réducteurs planétaires standards sans modifier l’architecture logicielle.' },
              { tag: 'Légèreté UGV', title: 'Flasques Alu / Composite', text: 'Optimisation masse non suspendue pour plateformes électriques légères et rapides.' },
              { tag: 'Série Magnétique', title: 'Découpe laser standardisée', text: 'Disques acier identiques empilables selon la largeur et l’effort magnétique requis.' },
            ],
          },
          {
            id: 'rob-s6',
            number: '06',
            kicker: 'Licences & Co-Développement R2A',
            title: "Partenariats industriels & R&D avec l'ENSTA",
            lead: 'Accès aux 4 démonstrateurs existants et à l’expertise mécanique des inventeurs pour accélérer votre mise sur le marché.',
            accent: '#f59e0b',
            kpis: [
              { value: '2 à 6 %', label: 'redevance de licence sur prix de vente + part fixe (exclusivité par niche robotique)' },
              { value: '4 Protos', label: 'disponibles pour essais, prêt conventionné ou contrat de R&D sur votre plateforme' },
              { value: 'EU + CA', label: 'couverture brevet EP 4 153 434 B1 (ENSTA/EDF) & EP 4 180 239 (100 % ENSTA)' },
            ],
            cards: [
              { tag: 'Voie 1 · Constructeurs UGV/AGV', title: 'Licence Sectorielle', text: 'Droit d’intégration série sur vos gammes d’AgBots, d’UGV défense ou d’AGV logistiques.' },
              { tag: 'Voie 2 · Inspection Nucléaire/Énergie', title: 'Licence & PoC Magnétique', text: 'Adaptation de la roue magnétique déformable à vos crawlers CND (accord cadre ENSTA/EDF).' },
              { tag: 'Contacts Valorisation', title: 'DAJV ENSTA', text: 'Caroline PENGAM & Maryline BENARD (Accords & Licences) · Yannick ARGOUARC’H (Inventeur).' },
            ],
          },
        ],
      },
    },

    /* ---------------- PLAQUETTES PDF OFFICIELLES (/Plaquette/) ----------- */
    plaquettes: {
      eyebrow: 'Data Room Officielle · Plaquettes Bilingues (FR / US)',
      title: 'Plaquettes Techniques R2A · ENSTA Bretagne',
      subtitle:
        'Consultez ou téléchargez les brochures officielles bilingues Français / English (US) correspondant à votre filière industrielle.',
      addCustomLabel: 'Ajouter un PDF local',
      showAllLabel: 'Afficher l’ensemble des 8 plaquettes du portefeuille R2A (FR & US)',
      hideAllLabel: 'Replier le catalogue complet des 8 plaquettes PDF',
      languages: [
        { id: 'fr', label: 'FR 🇫🇷 Français', short: 'FR 🇫🇷' },
        { id: 'us', label: 'EN 🇺🇸 English (US)', short: 'EN 🇺🇸' },
      ],
      bySector: {
        agri: [
          {
            id: 'plaq-agri-lourd',
            familyId: '02-3',
            badge: 'Plaquette Officielle R2A · Porteurs Lourds',
            badgeTone: 'good',
            icon: 'Tractor',
            pages: 'Brochure officielle ENSTA (PDF)',
            title: 'Plaquette R2A — Roue Terrestre pour Porteurs Lourds (Tracteurs, Remorques & Récolte)',
            titleUs: 'R2A Brochure — Terrestrial Wheel for Heavy Vehicles (Tractors, Trailers & Harvesters)',
            summary:
              'Spécifications de la roue jumelée auto-adaptative pour véhicules agricoles lourds : préservation des sols, stabilité GPS RTK, utilisation de pneus standards et validation sur tracteur John Deere 6155R (155 cv).',
            files: {
              fr: '/Plaquette/02-3-roue-terrestre-porteur-lourd.pdf',
              us: '/Plaquette/02-3-roue-terrestre-porteur-lourd-US.pdf',
            },
            filenames: {
              fr: '02-3-roue-terrestre-porteur-lourd.pdf',
              us: '02-3-roue-terrestre-porteur-lourd-US.pdf',
            },
          },
        ],

        btp: [
          {
            id: 'plaq-btp-lourd',
            familyId: '02-3',
            badge: 'Plaquette Officielle R2A · Génie Civil & Mines',
            badgeTone: 'warn',
            icon: 'HardHat',
            pages: 'Brochure officielle ENSTA (PDF)',
            title: 'Plaquette R2A — Roue Terrestre pour Porteurs Lourds (Tombereaux, Bennes TP & Convois)',
            titleUs: 'R2A Brochure — Terrestrial Wheel for Heavy Carriers (Dumpers, Mining & Heavy Haulage)',
            summary:
              'Répartition de charge 50/50 sur pistes enrochées, suppression des éclatements pneumatiques, continuité de service Run-Flat et réduction du TCO chantier.',
            files: {
              fr: '/Plaquette/02-3-roue-terrestre-porteur-lourd.pdf',
              us: '/Plaquette/02-3-roue-terrestre-porteur-lourd-US.pdf',
            },
            filenames: {
              fr: '02-3-roue-terrestre-porteur-lourd.pdf',
              us: '02-3-roue-terrestre-porteur-lourd-US.pdf',
            },
          },
          {
            id: 'plaq-btp-roulette',
            familyId: '02-2',
            badge: 'Plaquette Officielle R2A · Manutention & GSE',
            badgeTone: 'info',
            icon: 'Cog',
            pages: 'Brochure officielle ENSTA (PDF)',
            title: 'Plaquette R2A — Roulette Industrielle Auto-Adaptative (Manutention Lourde & Chariots)',
            titleUs: 'R2A Brochure — Self-Adaptive Industrial Caster (Heavy Handling & Aerospace GSE)',
            summary:
              "Application du balancier mécanique aux roulettes industrielles métalliques ou à bandages pour chariots lourds d'usine (type outillages Airbus GSE) et manutention sur sols irréguliers.",
            files: {
              fr: '/Plaquette/02-2-roue-terrestre-roulette-industrielle.pdf',
              us: '/Plaquette/02-2-roue-terrestre-roulette-industrielle-US.pdf',
            },
            filenames: {
              fr: '02-2-roue-terrestre-roulette-industrielle.pdf',
              us: '02-2-roue-terrestre-roulette-industrielle-US.pdf',
            },
          },
        ],

        robotique: [
          {
            id: 'plaq-rob-ugv',
            familyId: '02-1',
            badge: 'Plaquette Officielle R2A · UGV & AgBots',
            badgeTone: 'info',
            icon: 'Bot',
            pages: 'Brochure officielle ENSTA (PDF)',
            title: 'Plaquette R2A — Roue Terrestre pour Robotique Mobile Tout-Terrain (UGV & AgBots)',
            titleUs: 'R2A Brochure — Terrestrial Wheel for All-Terrain Mobile Robotics (UGV & AgBots)',
            summary:
              "Franchissement passif d'obstacles sans capteurs ni vérins, stabilisation du mât capteurs (LiDAR/RTK) et économie de batterie face aux chenilles.",
            files: {
              fr: '/Plaquette/02-1-roue-terrestre-robotique-mobile.pdf',
              us: '/Plaquette/02-1-roue-terrestre-robotique-mobile-US.pdf',
            },
            filenames: {
              fr: '02-1-roue-terrestre-robotique-mobile.pdf',
              us: '02-1-roue-terrestre-robotique-mobile-US.pdf',
            },
          },
          {
            id: 'plaq-rob-mag',
            familyId: '01',
            badge: 'Plaquette Officielle R2A · Inspection Magnétique',
            badgeTone: 'purple',
            icon: 'ShieldCheck',
            pages: 'Brochure officielle ENSTA / EDF (PDF)',
            title: "Plaquette R2A — Roue Magnétique Auto-Adaptative (Crawlers d'Inspection EDF / Nucléaire)",
            titleUs: 'R2A Brochure — Self-Adaptive Magnetic Wheel (NDT Inspection Crawlers / Nuclear & Dams)',
            summary:
              "Roue à disques d'acier mobiles maximisant la surface de contact et l'attraction magnétique sur parois courbes (conduites forcées de barrages, cuves, coques).",
            files: {
              fr: '/Plaquette/01-roue-magnetique.pdf',
              us: '/Plaquette/01-roue-magnetique-US.pdf',
            },
            filenames: {
              fr: '01-roue-magnetique.pdf',
              us: '01-roue-magnetique-US.pdf',
            },
          },
          {
            id: 'plaq-rob-agv',
            familyId: '02-2',
            badge: 'Plaquette Officielle R2A · AGV / AMR Lourds',
            badgeTone: 'good',
            icon: 'Layers',
            pages: 'Brochure officielle ENSTA (PDF)',
            title: 'Plaquette R2A — Roulette Industrielle pour AGV / AMR Forte Charge',
            titleUs: 'R2A Brochure — Self-Adaptive Industrial Caster for Heavy-Payload AGV / AMR',
            summary:
              "Franchissement de seuils d'atelier, joints de dilatation et sols industriels dégradés sans secousses pour la charge transportée.",
            files: {
              fr: '/Plaquette/02-2-roue-terrestre-roulette-industrielle.pdf',
              us: '/Plaquette/02-2-roue-terrestre-roulette-industrielle-US.pdf',
            },
            filenames: {
              fr: '02-2-roue-terrestre-roulette-industrielle.pdf',
              us: '02-2-roue-terrestre-roulette-industrielle-US.pdf',
            },
          },
        ],
      },

      /* Catalogue intégral des 4 familles × 2 langues = 8 plaquettes PDF */
      allPortfolio: [
        {
          id: 'all-01',
          code: '01',
          title: 'Roue Magnétique Auto-Adaptative (Inspection Conduites & Nucléaire)',
          sectorTag: 'Robotique & Inspection',
          fr: '/Plaquette/01-roue-magnetique.pdf',
          us: '/Plaquette/01-roue-magnetique-US.pdf',
        },
        {
          id: 'all-02-1',
          code: '02-1',
          title: 'Roue Terrestre — Robotique Mobile Tout-Terrain (UGV & AgBots)',
          sectorTag: 'Robotique mobile',
          fr: '/Plaquette/02-1-roue-terrestre-robotique-mobile.pdf',
          us: '/Plaquette/02-1-roue-terrestre-robotique-mobile-US.pdf',
        },
        {
          id: 'all-02-2',
          code: '02-2',
          title: 'Roue Terrestre — Roulette Industrielle Forte Charge (GSE & AGV)',
          sectorTag: 'BTP / Manutention & AGV',
          fr: '/Plaquette/02-2-roue-terrestre-roulette-industrielle.pdf',
          us: '/Plaquette/02-2-roue-terrestre-roulette-industrielle-US.pdf',
        },
        {
          id: 'all-02-3',
          code: '02-3',
          title: 'Roue Terrestre — Porteurs Lourds (Agricole, Génie Civil & Mines)',
          sectorTag: 'Agricole & BTP',
          fr: '/Plaquette/02-3-roue-terrestre-porteur-lourd.pdf',
          us: '/Plaquette/02-3-roue-terrestre-porteur-lourd-US.pdf',
        },
      ],
    },
  },


  /* --------------------------------------------------------------------- */
  /*  CADRE & PARTENARIAT B2B (LICENCES, BREVETS, PÉRIMÈTRE + ACCORDÉON)   */
  /* --------------------------------------------------------------------- */
  strategicFramework: {
    eyebrow: 'Transfert Technologique & Licences B2B · ENSTA',
    title: 'Accords Industriels, Propriété Intellectuelle & Périmètre R2A',
    subtitleBySector: {
      agri: "Conditions officielles de transfert technologique de l'ENSTA pour les constructeurs de tracteurs, remorques agricoles, pulvérisateurs et équipementiers d'essieux.",
      btp: "Conditions officielles de transfert technologique de l'ENSTA pour les constructeurs d'engins de chantier, tombereaux, équipements miniers, convois SPMT et roulettes lourdes.",
      robotique:
        "Conditions officielles de transfert technologique de l'ENSTA pour les fabricants d'UGV tout-terrain, de robots agricoles autonomes, d'AGV logistiques et de crawlers d'inspection magnétique.",
    },

    /* 1. MODÈLES D'ACCORDS COMMERCIAUX & LICENCES (EN PREMIER) */
    agreements: {
      title: "1. Les 3 Modèles d'Accords Commerciaux & Licences Industrielles",
      subtitle:
        "Contractualisation encadrée par la Direction des Affaires Juridiques et Valorisation (DAJV) de l'ENSTA, adaptable selon votre volume industriel et votre stratégie d'intégration.",
      royaltyBanner: {
        badge: 'Conditions standards ENSTA',
        headline: 'Redevance de 2 à 6 % du prix de vente HT + part fixe initiale (upfront)',
        detail:
          "Licence exclusive (par domaine applicatif ou zone géographique) ou non-exclusive, assortie d'une possibilité de prêt/location d'un démonstrateur existant ou d'un contrat de R&D collaboratif.",
        contactsLabel: 'Interlocuteurs officiels Valorisation & Négociation :',
        contacts: [
          {
            name: 'Caroline PENGAM',
            role: 'Direction des Affaires Juridiques et Valorisation (Contrats & Licences)',
          },
          {
            name: 'Maryline BENARD',
            role: 'Direction Valorisation & Partenariats Industriels ENSTA',
          },
          {
            name: "Yannick ARGOUARC'H",
            role: 'Inventeur & Référent Technique R2A (Dimensionnement & Démonstrateurs)',
          },
        ],
      },
      models: [
        {
          id: 'licence-exploitation',
          icon: 'Award',
          badge: 'Modèle privilégié OEM & Équipementiers',
          title: "Licence d'Exploitation Industrielle (Exclusive ou Non-Exclusive)",
          terms: 'Redevance de 2 à 6 % du prix de vente HT + part fixe à la signature',
          description:
            "Concession des droits de fabrication et de commercialisation sur votre filière (ex. exclusivité Machinisme Agricole, Génie Civil/Mines ou Robotique/Inspection) avec transfert du dossier CAO et du savoir-faire d'industrialisation.",
          deliverables: [
            'Exclusivité sectorielle ou géographique négociable (Europe 17 pays, UK, Suisse, Canada)',
            'Accès complet aux dossiers plans CAO, notes de calculs et retours d’essais TRL 6',
            'Accompagnement au passage série (châssis à 2 lobes emboutis-soudés ou alliages dédiés)',
          ],
        },
        {
          id: 'pret-poc-rd',
          icon: 'Handshake',
          badge: 'Qualification terrain TRL 6 → TRL 8',
          title: 'Prêt / Location de Démonstrateur & Contrat de R&D Collaboratif',
          terms: 'Convention de prêt/location + budget R&D dédié avec option prioritaire de licence',
          description:
            "Évaluation rapide sur vos pistes d'essais grâce à la mise à disposition d'un démonstrateur R2A existant, ou co-dimensionnement d'un prototype adapté à votre essieu porteur ou moteur.",
          deliverables: [
            'Campagne de mesure sur vos propres véhicules, remorques, chariots ou plateformes UGV',
            'Adaptation CAO de l’interface moyeu, du tarage élastique et de l’étanchéité métier',
            'Option prioritaire de conversion en licence industrielle à l’issue de la validation',
          ],
        },
        {
          id: 'cession-spinoff',
          icon: 'Rocket',
          badge: 'Partenariat capitalistique ou exclusif global',
          title: 'Option Stratégique Portefeuille ou Partenariat Spin-off DeepTech',
          terms: 'Accord-cadre sur mesure négocié avec la DAJV ENSTA',
          description:
            "Structuration d'un partenariat industriel d'envergure visant la fourniture clé en main de roues/essieux complets R2A aux constructeurs (modèle équipementier de rang 1) ou la reprise d'un périmètre breveté.",
          deliverables: [
            'Sécurisation long terme de la barrière technologique face à la concurrence internationale',
            'Possibilité de co-marquage technologique R2A · ENSTA',
            'Intégration des développements futurs (couronne d’extraction interne, variantes matériaux)',
          ],
        },
      ],
    },

    /* 2. COUVERTURE GÉOGRAPHIQUE DES BREVETS (EN DEUXIÈME) */
    patentCoverage: {
      title: '2. Couverture Géographique & Titularité du Portefeuille de Brevets',
      subtitle:
        "Une protection internationale solide articulée autour d'un brevet d'amélioration terrestre 100 % ENSTA et d'un brevet socle Europe + Canada.",
      patents: [
        {
          id: 'pat-2',
          priorityTag: '100 % ENSTA seule · Liberté directe de licence terrestre',
          codes: 'FR2111969 · EP 4 180 239',
          title: 'Brevet 2 — Roue Terrestre Auto-Adaptative, Centrage Élastique & Anti-Vibration',
          holders: '100 % ENSTA (Titulaire unique)',
          inventors: "Yannick Argouarc'h & Hervé Trébaol",
          status: 'Brevet Unitaire Européen (17 pays UE) + France',
          territories: [
            'France',
            'Allemagne',
            'Italie',
            'Pays-Bas',
            'Belgique',
            'Autriche',
            'Finlande',
            'Suède',
            'Danemark',
            '+ 8 autres États membres du Brevet Unitaire (17 pays UE)',
          ],
          highlights: [
            "Couvre spécifiquement la roue terrestre à rappel élastique et butées amortissantes validée jusqu'à 50 km/h sans vibration.",
            "Propriété à 100 % de l'ENSTA : négociation agile en guichet unique avec la DAJV de l'École.",
          ],
        },
        {
          id: 'pat-1',
          priorityTag: 'Brevet Socle Délivré · Europe, UK, Suisse & Canada',
          codes: 'FR3110111 · EP 4 153 434 B1 · CA 3 183 669 A1',
          title: 'Brevet 1 — Dispositif de Roulement Auto-Adaptatif (Magnétique & Terrestre)',
          holders: 'Copropriété ENSTA / EDF',
          inventors: "Yannick Argouarc'h & Hervé Trébaol",
          status: 'Délivré en France & Europe (EP B1) · Étendu UK, Suisse & Canada',
          territories: [
            'France (FR3110111)',
            'Union Européenne (EP 4 153 434 B1)',
            'Royaume-Uni (UK)',
            'Suisse (CH)',
            'Canada (CA 3 183 669 A1)',
          ],
          highlights: [
            'Issu de la recherche partenariale ENSTA / EDF (2016–2021) sur les robots d’inspection de conduites forcées.',
            'Protège l’architecture fondamentale à balanciers tant pour la roue magnétique déformable à disques d’acier que pour la roue terrestre.',
          ],
        },
      ],
    },

    /* 3. PÉRIMÈTRE D'INGÉNIERIE (CŒUR DE CIBLE VS EXCLUSIONS) */
    scope: {
      title: "3. Périmètre d'Ingénierie R2A : Cœur de Cible vs Exclusions Techniques",
      subtitle:
        "La transparence technique fait partie de l'ADN ENSTA : le système R2A excelle sur les porteurs et robots évoluant jusqu'à 50 km/h.",
      inScopeTitle: 'Cœur de cible qualifié (≤ 50 km/h · Obstacles, Dévers & Forte Charge)',
      outOfScopeTitle: 'Exclusions techniques assumées (Hors périmètre)',
      inScope: [
        {
          sectorId: 'agri',
          icon: 'Tractor',
          title: 'Machinisme Agricole & Remorques (24–32 t)',
          detail:
            'Tracteurs de forte puissance (> 150 cv), bennes de moisson, tonnes à lisier, épandeurs et automoteurs de pulvérisation cherchant à préserver les sols et le GPS RTK jusqu’à 50 km/h.',
        },
        {
          sectorId: 'btp',
          icon: 'HardHat',
          title: 'BTP, Carrières, Mines, SPMT & Roulettes GSE',
          detail:
            'Tombereaux rigides/articulés, chargeuses souterraines surbaissées, remorques modulaires SPMT (éolien, nucléaire) et roulettes industrielles de manutention lourde.',
        },
        {
          sectorId: 'robotique',
          icon: 'Bot',
          title: 'Robotique Mobile UGV, Inspection Magnétique & AGV',
          detail:
            'Robots terrestres tout-terrain (défense, sécurité, AgBots), crawlers magnétiques en conduites forcées/cuves (CNPE, naval) et plateformes logistiques AGV.',
        },
      ],
      outOfScope: [
        {
          title: 'Transport routier rapide & Autoroute (> 50 km/h)',
          detail:
            'Poids lourds longue distance (80–90 km/h), véhicules légers particuliers et blindés rapides : à haute vitesse, les masses non suspendues imposent une suspension de châssis classique.',
        },
        {
          title: 'Trains d’atterrissage aéronautiques en vol',
          detail:
            'La masse mécanique du moyeu à balanciers pénalise la charge utile embarquée d’un aéronef (en revanche, les chariots de piste GSE au sol sont pleinement dans la cible).',
        },
      ],
    },

    /* 4. ACCORDÉON REPLIÉ PAR DÉFAUT : ÉQUIPE PROJET 6.1 & PLANNING */
    academicAccordion: {
      toggleLabel: "Afficher l'organisation de l'équipe projet ENSTA (Projet 6.1 & Planning)",
      hideLabel: "Masquer l'organisation de l'équipe projet ENSTA (Projet 6.1 & Planning)",
      badge: 'Gouvernance Académique & Étude de Valorisation ENSTA',
      problematic: {
        label: 'Mission d’étude technico-économique (Projet Application Système 6.1)',
        question:
          "« Comment transformer les 2 brevets de roues auto-adaptatives R2A de l'ENSTA (validés à TRL 6) en contrats de licences industrielles et partenariats R&D ciblés sur les segments à plus fort retour sur investissement ? »",
        pillars: [
          {
            id: 'p1',
            title: 'Qualification Technologique',
            detail: 'Audit objectif des essais TRL 6, chiffrage série emboutie et identification des verrous OEM par filière.',
          },
          {
            id: 'p2',
            title: 'Segmentation Marché B2B',
            detail: 'Priorisation Agricole, BTP/Mines/Manutention et Robotique/Inspection selon le gain TCO client.',
          },
          {
            id: 'p3',
            title: 'Enquête Prix & Van Westendorp',
            detail: 'Collecte structurée du consentement à payer (CAP) et des seuils de coût cible constructeurs.',
          },
          {
            id: 'p4',
            title: 'Transfert & Licences DAJV',
            detail: 'Préparation des dossiers de négociation pour la Direction des Affaires Juridiques et Valorisation.',
          },
        ],
      },
      lots: [
        {
          id: 'lot1',
          code: 'Lot 1',
          owner: 'Magda BIHAN',
          title: 'Technique & Description de l’Offre R2A',
          items: [
            'Analyse fonctionnelle des 4 démonstrateurs (tracteur/porteur Ø 1,80 m, UGV, roue magnétique, sous-marin)',
            'Synthèse des campagnes d’essais (16 jours Pencran, conduite forcée EDF) et pistes d’industrialisation série',
          ],
        },
        {
          id: 'lot2',
          code: 'Lot 2',
          owner: 'Mathéo JOLY',
          title: 'Business Plan, TCO & Stratégie de Licence',
          items: [
            'Modélisation financière TCO par secteur et analyse de sensibilité prix (méthode Van Westendorp)',
            'Structuration des scénarios de redevances (2 à 6 % du prix de vente HT + part fixe) avec la DAJV ENSTA',
          ],
        },
        {
          id: 'lot3',
          code: 'Lot 3',
          owner: 'Marc BONNAFOUX',
          title: 'Communication Industrielle & Prospection B2B',
          items: [
            'Déploiement du portail interactif R2A, des plaquettes bilingues FR/US et des supports Pitch Deck',
            'Prospection qualifiée auprès des constructeurs (OEM), équipementiers essieux et intégrateurs',
          ],
        },
      ],
      gantt: [
        { period: 'Oct. – Nov. 2026', phase: 'Phase 1 · Audit Brevets, Essais TRL 6 & Cadrage DAJV', status: 'done' },
        { period: 'Déc. 2026 – Jan. 2027', phase: 'Phase 2 · Portail B2B R2A, Modèles TCO & Lancement Enquête', status: 'active' },
        { period: 'Fév. 2027', phase: 'Phase 3 · Entretiens Constructeurs & Analyse Van Westendorp', status: 'planned' },
        { period: 'Mars 2027', phase: 'Phase 4 · Feuille de Route Licences & Remise Dossier DAJV', status: 'planned' },
      ],
    },
  },

  /* --------------------------------------------------------------------- */
  /*  ENQUÊTE INDUSTRIELLE B2B — 100 % ADAPTÉE DYNAMIQUEMENT PAR SECTEUR   */
  /* --------------------------------------------------------------------- */
  survey: {
    title: 'Consultation Industrielle & Qualification Partenaire R2A',
    introBySector: {
      agri: "Constructeur de machinisme agricole, fabricant de remorques/essieux, équipementier ou responsable de parc (CUMA / ETA) : évaluez en 3 minutes l'intérêt de la roue R2A pour vos engins et accédez à une étude d'intégration.",
      btp: "Constructeur d'engins TP/miniers, fabricant de remorques SPMT ou de roulettes lourdes, équipementier essieux ou directeur matériel BTP : évaluez en 3 minutes l'apport de la roue R2A sur vos porteurs.",
      robotique:
        "Constructeur d'UGV, de robots agricoles, d'AGV logistiques ou d'équipements d'inspection industrielle/nucléaire : qualifiez en 3 minutes votre besoin en liaison au sol passive ou magnétique R2A.",
    },
    intro:
      "Qualifiez en 3 minutes l'adéquation de la technologie brevetée R2A ENSTA avec vos véhicules ou plateformes et indiquez votre fourchette de prix cible.",
    confidentialityNote:
      "Données traitées dans le cadre exclusif de la valorisation industrielle de l'ENSTA (conformité RGPD — aucune cession à des tiers).",
    consentText:
      "J'accepte que mes coordonnées soient transmises à la Direction Valorisation de l'ENSTA (Caroline Pengam & Maryline Benard) aux seules fins de suivi de cet échange industriel.",
    thankYou: {
      title: 'Merci pour votre contribution industrielle',
      message:
        "Votre évaluation a bien été enregistrée et synchronisée. Si vous avez renseigné vos coordonnées professionnelles, la Direction Valorisation de l'ENSTA reviendra vers vous rapidement.",
      exploreCta: 'Explorer maintenant la Présentation Complète, les Vidéos & le Simulateur R2A →',
      resetCta: 'Nouvelle réponse (Réinitialiser le formulaire pour un autre interlocuteur)',
    },
    /* Encart synthétique affiché en haut de l'Étape 2 en mode "Questionnaire seul" (WelcomeGate -> Focus) */
    conceptRecapBySector: {
      agri: {
        badge: 'Rappel du principe breveté R2A · ENSTA (EP 4 180 239 & EP 4 153 434 B1)',
        lines: [
          'Deux jantes standards montées sur un moyeu à balanciers internes (+H/2 / −H/2) tournant à la même vitesse que l’essieu.',
          'Sur caillou ou dévers : les 2 pneus restent au sol (charge 50 % / 50 %, zéro éclatement unitaire) et l’inclinaison cabine / GPS RTK est divisée par 2 (α / 2).',
          '100 % mécanique passif (0 électronique, logé dans la jante), validé à TRL 6 jusqu’à 50 km/h + continuité Run-Flat sur 1 roue.',
        ],
      },
      btp: {
        badge: 'Rappel du principe breveté R2A · ENSTA (EP 4 180 239 & EP 4 153 434 B1)',
        lines: [
          'Suspension mécanique à balanciers (+H/2 / −H/2, course 16 cm) intégralement logée dans la jante (0 encombrement sous châssis).',
          'Au passage d’un bloc rocheux : maintien de l’appui 50 % / 50 %, roulis de benne divisé par 2 (α / 2) et éjection naturelle des pierres entre flancs.',
          'Continuité Run-Flat mécanique (retour atelier sur la roue intacte) et fonctionnement nominal jusqu’à 50 km/h.',
        ],
      },
      robotique: {
        badge: 'Rappel du principe breveté R2A · ENSTA (EP 4 180 239 & EP 4 153 434 B1)',
        lines: [
          'Liaison mécanique passive à balanciers (+H/2 / −H/2) logée dans le moyeu, déclinée en roue terrestre UGV/AGV et roue magnétique à disques d’acier.',
          'Sur obstacle ou cordon de soudure : maintien du contact au sol / magnétique et division par 2 du dépointage du mât LiDAR / Caméras (α / 2).',
          '0 Watt consommé (autonomie batterie préservée) et 0 électronique exposée (compatible nucléaire CNPE, eau, boue, jusqu’à 50 km/h).',
        ],
      },
    },
    estimatedMinutes: 3,

    /* Prix de référence indicatif par défaut d'un ensemble / essieu cible (utilisé uniquement pour conversion croisée % <-> € HT en Back-Office lorsque le répondant n'a pas renseigné referenceAssetPriceEur) */
    defaultReferencePriceBySector: {
      agri: 85000,
      btp: 140000,
      robotique: 45000,
    },

    /* Correspondance des champs pour création automatique de fiche CRM */
    fieldMap: {
      company: 'company',
      name: 'contactName',
      role: 'role',
      orgType: 'orgType',
      email: 'email',
      phone: 'phone',
      pilot: 'pilotInterest',
      pilotYesValue: 'oui_prioritaire',
      acquisition: 'acquisitionModel',
      partnership: 'partnershipModel',
      comment: 'openComment',
      consent: 'rgpdConsent',
    },

    steps: [
      /* ------------------------ ÉTAPE 1 : PROFIL ------------------------ */
      {
        id: 'profil',
        title: 'Profil & Parc',
        shortTitle: 'Profil',
        subtitle: 'Organisation & volumes',
        icon: 'Building2',
        introBySector: {
          agri: 'Votre positionnement dans la filière machinisme agricole et la typologie de vos engins.',
          btp: 'Votre positionnement dans la filière génie civil, mines ou manutention lourde.',
          robotique: 'Votre positionnement dans la filière robotique mobile, AGV ou inspection industrielle.',
        },
        questions: [
          {
            id: 'sectorConfirm',
            type: 'sector',
            label: 'Filière industrielle concernée par votre évaluation',
            required: true,
            analytics: true,
          },
          {
            id: 'orgType',
            type: 'single',
            label: 'Typologie de votre organisation',
            required: true,
            analytics: true,
            optionsBySector: {
              agri: [
                { value: 'oem_tracteur', label: 'Constructeur (OEM) de tracteurs ou automoteurs agricoles' },
                { value: 'oem_remorque', label: 'Constructeur de bennes, tonnes à lisier ou outils traînés' },
                { value: 'equipementier_essieu', label: 'Équipementier (essieux, jantes, pneumatiques, trains roulants)' },
                { value: 'exploitant_cuma_eta', label: 'Exploitation agricole, CUMA ou Entreprise de Travaux Agricoles (ETA)' },
                { value: 'rd_institution', label: 'Centre technique agricole, bureau d’études ou investisseur' },
              ],
              btp: [
                { value: 'oem_tp_mine', label: 'Constructeur (OEM) de tombereaux, camions TP ou engins miniers' },
                { value: 'oem_spmt_manut', label: 'Fabricant de remorques lourdes (SPMT), chariots ou roulettes GSE' },
                { value: 'equipementier_essieu', label: 'Équipementier (ponts, essieux, jantes, bandages/pneumatiques OTR)' },
                { value: 'exploitant_carriere', label: 'Exploitant de carrières/mines, major BTP ou loueur d’engins' },
                { value: 'rd_institution', label: 'Bureau d’études génie civil, donneur d’ordre énergie ou investisseur' },
              ],
              robotique: [
                { value: 'oem_ugv', label: 'Constructeur de robots terrestres tout-terrain (UGV défense, sécurité, AgBot)' },
                { value: 'oem_inspection', label: 'Fabricant de crawlers d’inspection (nucléaire, barrages, pétrochimie, naval)' },
                { value: 'oem_agv', label: 'Constructeur d’AGV / AMR logistiques ou de bases roulantes industrielles' },
                { value: 'operateur_industriel', label: 'Opérateur industriel / donneur d’ordre (énergie, défense, logistique)' },
                { value: 'rd_institution', label: 'Laboratoire robotique, intégrateur mécatronique ou investisseur DeepTech' },
              ],
            },
          },
          {
            id: 'role',
            type: 'single',
            label: 'Votre fonction principale',
            required: true,
            analytics: true,
            options: [
              { value: 'dir_rd', label: 'Direction R&D / Ingénierie / Bureau d’études trains roulants' },
              { value: 'dir_produit', label: 'Direction Produit / Innovation / Stratégie industrielle' },
              { value: 'dir_achats', label: 'Direction Achats / Industrialisation / Supply Chain' },
              { value: 'dir_parc', label: 'Direction Matériel / Exploitation / Maintenance de flotte' },
              { value: 'dir_gen', label: 'Direction Générale / Valorisation / Investissement' },
            ],
          },
          {
            id: 'fleetSize',
            type: 'number',
            labelBySector: {
              agri: 'Volume annuel produit (OEM) ou taille de flotte agricole équipée (unités)',
              btp: 'Volume annuel d’essieux/engins produits (OEM) ou taille de parc TP/minier (unités)',
              robotique: 'Volume annuel de plateformes robotisées produites ou exploitées (unités)',
            },
            label: 'Volume annuel produit (OEM) ou taille de flotte (unités)',
            placeholderBySector: {
              agri: 'Ex. : 250 remorques/an ou 12 ensembles tracteurs-bennes',
              btp: 'Ex. : 150 essieux TP/an ou 18 tombereaux en carrière',
              robotique: 'Ex. : 80 plateformes UGV/AGV par an ou 15 robots en flotte',
            },
            placeholder: 'Ex. : 50',
            min: 1,
            max: 100000,
            required: false,
            analytics: true,
          },
        ],
      },

      /* ------------------ ÉTAPE 2 : DOULEURS & USAGES ------------------- */
      {
        id: 'besoins',
        title: 'Contraintes Terrain',
        shortTitle: 'Contraintes',
        subtitle: 'Classement 1 à 5',
        icon: 'Wrench',
        introBySector: {
          agri: 'Classez de 1 à 5 les problématiques rencontrées sur chemins empierrés, au champ et sur route (≤ 50 km/h).',
          btp: 'Classez de 1 à 5 les contraintes subies sur pistes enrochées, galeries minières ou dalles industrielles.',
          robotique: 'Classez de 1 à 5 vos verrous actuels de franchissement, stabilisation capteurs ou adhérence magnétique.',
        },
        questions: [
          {
            id: 'currentEquip',
            type: 'single',
            labelBySector: {
              agri: 'Architecture de roulement principalement utilisée aujourd’hui',
              btp: 'Architecture de train roulant principalement utilisée aujourd’hui',
              robotique: 'Architecture de mobilité principalement utilisée sur vos plateformes',
            },
            label: 'Architecture de roulement actuelle principale',
            required: true,
            analytics: true,
            optionsBySector: {
              agri: [
                { value: 'jumelage_rigide', label: 'Jumelage rigide standard (fixe ou démontable)' },
                { value: 'pneus_vf_ctis', label: 'Pneus basse pression larges (IF / VF) avec ou sans télégonflage' },
                { value: 'chenilles_agri', label: 'Trains chenillés caoutchouc' },
                { value: 'essieu_tandem_remorque', label: 'Essieu tandem / tridem sur bennes ou tonnes agricoles' },
              ],
              btp: [
                { value: 'jumelage_tp', label: 'Jumelage rigide pneumatiques TP / génie civil' },
                { value: 'pneus_otr_geants', label: 'Pneumatiques géants simples OTR (carrières / mines)' },
                { value: 'essieux_spmt', label: 'Lignes d’essieux pendulaires hydrauliques (convois SPMT)' },
                { value: 'roulettes_bandages', label: 'Roulettes industrielles / bandages rigides forte charge (GSE / usine)' },
              ],
              robotique: [
                { value: 'roues_rigides_ugv', label: 'Roues simples ou jumelées sur essieu rigide (0 suspension)' },
                { value: 'suspension_active', label: 'Suspension articulée ou active pilotée (bras, vérins, capteurs)' },
                { value: 'micro_chenilles', label: 'Chenilles caoutchouc ou métalliques' },
                { value: 'roues_magnetiques_rigides', label: 'Roues magnétiques rigides (crawlers d’inspection parois acier)' },
              ],
            },
          },
          {
            id: 'painRanking',
            type: 'ranking',
            ranks: [1, 2, 3, 4, 5],
            label:
              'Classez ces 5 contraintes terrain par ordre de priorité pour vos machines (de 1 = Priorité n°1 à 5 = Priorité n°5 — un seul choix possible par colonne de rang) :',
            required: true,
            analytics: true,
            optionsBySector: {
              agri: [
                { value: 'casse_pneu_chemin', label: "Coupures / éclatements de pneus sur cailloux et chemins d'accès" },
                { value: 'derive_gps_rtk', label: "Basculement cabine perturbant l'antenne GPS RTK et les rampes" },
                { value: 'cout_vf_chenilles', label: "Coût d'achat et d'usure excessif des pneus VF ou des chenilles" },
                { value: 'tassement_sols', label: 'Compaction des parcelles humides et perte de rendement agronomique' },
                { value: 'arret_moisson', label: "Immobilisation critique d'un ensemble en pleine fenêtre de moisson" },
              ],
              btp: [
                { value: 'eclatement_roche', label: 'Éclatements de pneus par surcharge unitaire sur blocs rocheux' },
                { value: 'pierres_coincees', label: 'Pierres coincées entre roues jumelées endommageant les flancs' },
                { value: 'downtime_chantier', label: "Coût horaire d'arrêt machine (downtime) sur piste ou en galerie" },
                { value: 'encombrement_suspension', label: 'Manque de place sous châssis pour loger une suspension (mines / GSE)' },
                { value: 'stabilite_benne', label: 'Roulis des bennes ou charges hautes lors des franchissements' },
              ],
              robotique: [
                { value: 'depointage_lidar', label: 'Dépointage du mât LiDAR / caméras sur obstacles asymétriques' },
                { value: 'conso_chenilles', label: "Perte d'autonomie batterie due aux chenilles ou actionneurs actifs" },
                { value: 'decrochage_magnetique', label: 'Décrochage des roues magnétiques rigides sur parois courbes / soudures' },
                { value: 'fragilite_elec', label: "Vulnérabilité de l'électronique en milieu nucléaire, marin ou poussiéreux" },
                { value: 'echouage_mission', label: 'Intervention humaine coûteuse pour récupérer un robot bloqué' },
              ],
            },
          },
          {
            id: 'otherPainText',
            type: 'other_pain',
            priorityFieldId: 'otherPainPriority',
            label: 'Autre contrainte ou point de douleur (précisez)',
            placeholderBySector: {
              agri: "Autre problématique terrain ou contrainte d'intégration spécifique...",
              btp: 'Autre problématique chantier, galerie souterraine ou manutention lourde...',
              robotique: 'Autre contrainte de franchissement, environnement sévère ou intégration capteur...',
            },
            placeholder: 'Précisez une autre problématique spécifique...',
            required: false,
            analytics: true,
          },
          {
            id: 'painSeverity',
            type: 'scale',
            min: 1,
            max: 5,
            minLabel: '1 · Mineur',
            maxLabel: '5 · Critique',
            labelBySector: {
              agri: 'Impact financier et opérationnel de ces contraintes sur vos chantiers agricoles / votre gamme',
              btp: 'Impact financier et opérationnel de ces contraintes sur vos chantiers TP / carrières / mines',
              robotique: 'Impact opérationnel de ces contraintes sur la fiabilité de mission de vos plateformes robotisées',
            },
            label: 'Gravité opérationnelle et financière de ces contraintes sur votre activité',
            required: true,
            analytics: true,
          },
          {
            id: 'featureInterest',
            type: 'scale',
            min: 1,
            max: 5,
            minLabel: '1 · Peu critique',
            maxLabel: '5 · Décisif',
            labelBySector: {
              agri: 'Intérêt pour la division par 2 de la pression au sol et du roulis GPS RTK avec des pneus standards (≤ 50 km/h)',
              btp: 'Intérêt pour une suspension passive logée dans la jante (course 16 cm, anti-pierre & Run-Flat ≤ 50 km/h)',
              robotique: 'Intérêt pour une liaison 100 % passive (0 Watt, α/2) ou magnétique déformable sans électronique embarquée',
            },
            label: 'Intérêt global pour le principe mécanique passif R2A (pression ÷ 2, inclinaison α/2)',
            required: true,
            analytics: true,
          },
          {
            id: 'speedLimitPerception',
            type: 'single',
            columns: 1,
            labelBySector: {
              agri: "Quel est votre regard sur le plafond de vitesse nominal de 50 km/h et l'architecture mécanique à balanciers ?",
              btp: "Quel est votre regard sur le plafond de vitesse nominal de 50 km/h et l'architecture mécanique à balanciers ?",
              robotique: "Quel est votre regard sur le plafond de vitesse nominal de 50 km/h et l'architecture mécanique à balanciers ?",
            },
            label: "Quel est votre regard sur le plafond de vitesse nominal de 50 km/h et l'architecture mécanique à balanciers ?",
            required: true,
            analytics: true,
            options: [
              {
                value: 'compatible_50',
                label: 'Totalement compatible avec nos engins / usages (≤ 50 km/h)',
              },
              {
                value: 'Acceptable',
                label: 'Acceptable sous réserve de maintenance rapide (démontage pneu interne / étanchéité)',
              },
              {
                value: 'adaptation_rd',
                label: 'Point à adapter en co-développement R&D (masse ou encombrement)',
              },
              {
                value: 'Bloquant',
                label: 'Bloquant pour notre application principale (> 50 km/h requis)',
              },
            ],
          },
        ],
      },

      /* ---------- ÉTAPE 3 : MODÈLE D'ACQUISITION & PRIX (% / € HT) ------- */
      {
        id: 'budget',
        title: 'Valeur & Prix Cible',
        shortTitle: 'Prix & Modèle',
        subtitle: 'Modèle & Van Westendorp',
        icon: 'Euro',
        introBySector: {
          agri: "Choisissez votre formule d'intégration privilégiée et indiquez vos 4 seuils de sensibilité prix (en % de surcoût par défaut, ou en montant brut € HT par essieu équipé).",
          btp: "Choisissez votre formule d'intégration privilégiée et indiquez vos 4 seuils de sensibilité prix (en % de surcoût par défaut, ou en montant brut € HT par essieu porteur).",
          robotique: "Choisissez votre formule d'intégration privilégiée et indiquez vos 4 seuils de sensibilité prix (en % de surcoût par défaut, ou en montant brut € HT par train complet R2A).",
        },
        questions: [
          {
            id: 'acquisitionModel',
            type: 'single',
            columns: 1,
            label: 'Quelle formule d’acquisition ou de partenariat privilégieriez-vous pour intégrer la technologie R2A ?',
            required: true,
            analytics: true,
            options: [
              {
                value: 'licence_pct',
                label: "Licence d'exploitation au pourcentage (redevance de 2 à 6 % sur prix de vente + part fixe)",
              },
              {
                value: 'licence_cao_rd',
                label: "Licence + Prestation d'accompagnement CAO & Co-développement R&D sur-mesure avec l'ENSTA",
              },
              {
                value: 'achat_essieu_complet',
                label: "Achat d'essieux ou de roues complètes R2A prêtes à monter (via un équipementier licencié)",
              },
              {
                value: 'kit_retrofit',
                label: "Kit d'adaptation en seconde monte (rétrofit sur parc existant)",
              },
              {
                value: 'cession_exclusivite',
                label: 'Cession complète de brevet / Exclusivité sectorielle',
              },
            ],
          },
          {
            id: 'vwPriceMode',
            type: 'vw_mode',
            defaultValue: 'percent',
            sectionTitle: 'Sensibilité au prix — Méthode Van Westendorp (% ou € HT)',
            sectionSubtitle:
              'Saisissez 4 valeurs strictement positives (aucune valeur pré-remplie afin de garantir la neutralité de la mesure).',
            label: 'Mode d’expression des 4 seuils de prix',
            required: false,
            options: [
              {
                value: 'percent',
                label: "En % du prix de la machine / de l'essieu (ou % de surcoût acceptable)",
              },
              {
                value: 'eur',
                label: 'En montant brut (€ HT par essieu équipé)',
              },
            ],
          },
          {
            id: 'vwTooCheap',
            type: 'number',
            vw: 'tooCheap',
            positiveOnly: true,
            step: 'any',
            labelPercent:
              'À partir de quel % de surcoût jugeriez-vous le système R2A trop peu cher au point de douter de sa robustesse mécanique ? (%)',
            labelEur:
              'À partir de quel montant (€ HT) jugeriez-vous le système R2A trop peu cher au point de douter de sa robustesse mécanique ? (€ HT)',
            label:
              'À partir de quel % de surcoût jugeriez-vous le système R2A trop peu cher au point de douter de sa robustesse mécanique ? (%)',
            placeholder: '',
            required: true,
          },
          {
            id: 'vwCheap',
            type: 'number',
            vw: 'cheap',
            positiveOnly: true,
            step: 'any',
            labelPercent:
              'À quel % de surcoût jugeriez-vous le système R2A comme une très bonne affaire (excellent ROI) ? (%)',
            labelEur:
              'À quel montant (€ HT) jugeriez-vous le système R2A comme une très bonne affaire (excellent ROI) ? (€ HT)',
            label:
              'À quel % de surcoût jugeriez-vous le système R2A comme une très bonne affaire (excellent ROI) ? (%)',
            placeholder: '',
            required: true,
          },
          {
            id: 'vwExpensive',
            type: 'number',
            vw: 'expensive',
            positiveOnly: true,
            step: 'any',
            labelPercent:
              'À partir de quel % de surcoût le système R2A deviendrait-il élevé, mais encore envisageable après validation du gain ? (%)',
            labelEur:
              'À partir de quel montant (€ HT) le système R2A deviendrait-il élevé, mais encore envisageable après validation du gain ? (€ HT)',
            label:
              'À partir de quel % de surcoût le système R2A deviendrait-il élevé, mais encore envisageable après validation du gain ? (%)',
            placeholder: '',
            required: true,
          },
          {
            id: 'vwTooExpensive',
            type: 'number',
            vw: 'tooExpensive',
            positiveOnly: true,
            step: 'any',
            labelPercent:
              'À partir de quel % de surcoût jugeriez-vous le système R2A trop cher (rédhibitoire) ? (%)',
            labelEur:
              'À partir de quel montant (€ HT) jugeriez-vous le système R2A trop cher (rédhibitoire) ? (€ HT)',
            label:
              'À partir de quel % de surcoût jugeriez-vous le système R2A trop cher (rédhibitoire) ? (%)',
            placeholder: '',
            required: true,
          },
          {
            id: 'referenceAssetPriceEur',
            type: 'number',
            positiveOnly: true,
            step: 'any',
            unit: '€ HT',
            labelBySector: {
              agri: 'Prix de référence indicatif de votre machine ou essieu agricole actuel (€ HT, optionnel)',
              btp: 'Prix de référence indicatif de votre porteur ou essieu TP/minier actuel (€ HT, optionnel)',
              robotique: 'Prix de référence indicatif de votre plateforme ou base roulante actuelle (€ HT, optionnel)',
            },
            label: 'Prix de référence indicatif de votre machine ou essieu actuel (€ HT)',
            help: 'Optionnel — permet de projeter votre sensibilité prix simultanément en % et en € HT.',
            placeholder: '',
            required: false,
            analytics: true,
          },
          {
            id: 'annualBudget',
            type: 'number',
            positiveOnly: true,
            step: 'any',
            unit: '€ HT / an',
            labelBySector: {
              agri: 'Budget annuel approximatif pneumatiques + casses + arrêts associés (€ HT / an, optionnel)',
              btp: 'Budget annuel approximatif pneumatiques OTR/TP + arrêts crevaison (€ HT / an, optionnel)',
              robotique: 'Budget annuel approximatif trains roulants + MCO mobilité + récupérations (€ HT / an, optionnel)',
            },
            label: 'Budget annuel pneumatiques / trains roulants & arrêts associés (€ HT / an, optionnel)',
            placeholder: '',
            required: false,
            analytics: true,
          },
          {
            id: 'oemMaxUnitCost',
            type: 'number',
            positiveOnly: true,
            step: 'any',
            unit: '€ HT',
            labelBySector: {
              agri: 'Constructeur (OEM) agricole : coût de revient série maximal cible par roue nue (€ HT, optionnel)',
              btp: 'Constructeur (OEM) TP/Mines/GSE : coût de revient série maximal cible par roue nue (€ HT, optionnel)',
              robotique: 'Fabricant de robots (OEM) : coût de revient série maximal cible par roue R2A (€ HT, optionnel)',
            },
            label: 'Constructeurs (OEM) : coût de revient industriel maximal cible par unité (€ HT, optionnel)',
            placeholder: '',
            required: false,
            analytics: true,
          },
        ],
      },

      /* ---------------- ÉTAPE 4 : PARTENARIAT & CONTACT ----------------- */
      {
        id: 'partenariat',
        title: 'Licence & Essai Pilote',
        shortTitle: 'Partenariat',
        subtitle: 'Coordonnées obligatoires',
        icon: 'Handshake',
        introBySector: {
          agri: 'Indiquez la modalité de collaboration souhaitée avec la Direction Valorisation de l’ENSTA et renseignez vos coordonnées professionnelles (obligatoires pour valider l’envoi).',
          btp: 'Indiquez la modalité de collaboration souhaitée avec la Direction Valorisation de l’ENSTA et renseignez vos coordonnées professionnelles (obligatoires pour valider l’envoi).',
          robotique: 'Indiquez la modalité de collaboration souhaitée avec la Direction Valorisation de l’ENSTA et renseignez vos coordonnées professionnelles (obligatoires pour valider l’envoi).',
        },
        questions: [
          {
            id: 'partnershipModel',
            type: 'single',
            label: "Quel mode de collaboration opérationnelle avec l'ENSTA souhaitez-vous engager ?",
            required: true,
            analytics: true,
            options: [
              {
                value: 'licence_oem',
                label: "Licence d'exploitation industrielle (redevance de 2 à 6 % du prix de vente HT + part fixe, exclusive ou non)",
              },
              {
                value: 'pret_poc_rd',
                label: 'Prêt / location d’un démonstrateur R2A ou contrat de R&D collaboratif (PoC)',
              },
              {
                value: 'achat_equipement',
                label: 'Acquisition de roues / essieux équipés R2A auprès d’un licencié industriel',
              },
              {
                value: 'veille_technique',
                label: 'Échange exploratoire & réception du dossier technique détaillé',
              },
            ],
          },
          {
            id: 'pilotInterest',
            type: 'single',
            columns: 3,
            labelBySector: {
              agri: 'Souhaitez-vous organiser une réunion technique ou un essai sur ensemble agricole ?',
              btp: 'Souhaitez-vous organiser une réunion technique ou un essai sur porteur TP / chariot lourd ?',
              robotique: 'Souhaitez-vous organiser une réunion technique ou un essai sur plateforme UGV / crawler ?',
            },
            label: 'Souhaitez-vous planifier un échange technique avec l’équipe Valorisation ENSTA ?',
            required: true,
            analytics: true,
            options: [
              { value: 'oui_prioritaire', label: 'Oui, prioritairement' },
              { value: 'oui_info', label: 'Oui, après envoi du dossier' },
              { value: 'non', label: "Non, pas d'essai immédiat (envoi du dossier uniquement)" },
            ],
          },
          {
            id: 'company',
            type: 'text',
            minLength: 2,
            sectionTitle: 'Coordonnées professionnelles du répondant (obligatoires)',
            sectionSubtitle:
              'Ces 4 champs sont requis pour valider votre évaluation industrielle et vous transmettre votre accusé de réception.',
            label: 'Entreprise / Organisation',
            placeholderBySector: {
              agri: 'Ex. : Constructeur remorques / Machinisme Agricole SAS',
              btp: 'Ex. : Équipements Miniers & Travaux Publics SA',
              robotique: 'Ex. : Robotique Mobile & Inspection SAS',
            },
            placeholder: 'Nom de votre société ou organisation',
            required: true,
          },
          {
            id: 'contactName',
            type: 'text',
            minLength: 2,
            label: 'Nom & Prénom',
            placeholder: 'Ex. : Claire Martin',
            required: true,
          },
          {
            id: 'email',
            type: 'email',
            label: 'E-mail professionnel',
            placeholder: 'prenom.nom@entreprise.fr',
            required: true,
          },
          {
            id: 'phone',
            type: 'tel',
            minDigits: 8,
            label: 'Téléphone direct',
            placeholder: 'Numéro de téléphone professionnel direct',
            required: true,
          },
          {
            id: 'openComment',
            type: 'textarea',
            labelBySector: {
              agri: 'Précisions techniques (charge par essieu, dimension pneus actuelle, largeur inter-rang, vitesse max.)',
              btp: 'Précisions techniques (tonnage essieu, garde sous châssis, granulométrie piste, vitesse max.)',
              robotique: 'Précisions techniques (masse robot, diamètre roue, rayon de courbure conduite, environnement)',
            },
            label: 'Précisions sur votre cahier des charges ou vos contraintes d’intégration (optionnel)',
            placeholder: 'Dimensions de jantes, charge nominale, environnement d’exploitation...',
            required: false,
          },
          {
            id: 'rgpdConsent',
            type: 'consent',
            label:
              "J'accepte que mes coordonnées soient transmises à la Direction Valorisation de l'ENSTA aux seules fins de suivi de cet échange industriel.",
            required: true,
          },
        ],
      },
    ],
  },

  /* --------------------------------------------------------------------- */
  /*  CRM PROSPECTION B2B (PRÉ-PEUPLÉ AVEC CIBLES INDUSTRIELLES R2A)       */
  /* --------------------------------------------------------------------- */
  crm: {
    statuses: [
      { id: 'new', label: 'À contacter', color: '#94a3b8' },
      { id: 'contacted', label: 'Contact établi', color: '#38bdf8' },
      { id: 'meeting', label: 'RDV / NDA en cours', color: '#f59e0b' },
      { id: 'poc', label: 'Étude PoC / Licence', color: '#84cc16' },
      { id: 'closed', label: 'Classé / Hors cible', color: '#ef4444' },
    ],
    fields: [
      { id: 'company', label: 'Entreprise', type: 'text', required: true },
      { id: 'name', label: 'Contact', type: 'text', required: false },
      { id: 'role', label: 'Fonction', type: 'text', required: false },
      { id: 'sector', label: 'Secteur', type: 'sector', required: true },
      { id: 'status', label: 'Statut', type: 'status', required: true },
      { id: 'email', label: 'E-mail', type: 'email', required: false },
      { id: 'phone', label: 'Téléphone', type: 'text', required: false },
      { id: 'nextAction', label: 'Prochaine action', type: 'text', required: false },
      { id: 'notes', label: 'Notes techniques & NDA', type: 'textarea', required: false },
    ],
    seedContacts: [
      {
        id: 'seed_rolland_remorques',
        company: 'Rolland Remorques (Bretagne)',
        name: 'Direction Bureau d’Études Trains Roulants',
        role: 'Ingénierie Essieux & Bennes Agricoles',
        sector: 'agri',
        status: 'meeting',
        email: '',
        phone: '',
        source: 'Ciblage R2A Bretagne',
        nextAction: 'Présentation plaquette 02-3 Porteur Lourd & vidéo JD 6155R',
        notes: 'Cible prioritaire proximité Brest : bennes agricoles 24–32 t, intérêt anti-tassement et Run-Flat moisson.',
      },
      {
        id: 'seed_pichon_samson',
        company: 'Pichon / Samson Agro (Finistère)',
        name: 'Responsable Innovation Tonnes & Épandeurs',
        role: 'R&D Trains Roulants Haute Charge',
        sector: 'agri',
        status: 'contacted',
        email: '',
        phone: '',
        source: 'Ciblage R2A Bretagne',
        nextAction: 'Qualifier l’alternative aux pneus VF géants + télégonflage sur tonnes à lisier',
        notes: 'Site industriel à Guipavas/Landivisiau à proximité immédiate de Pencran et de l’ENSTA.',
      },
      {
        id: 'seed_claas_tractor',
        company: 'CLAAS Tractor (Vélizy / Le Mans)',
        name: 'Relais interne : Pierre Joly / Flavien Bouget',
        role: 'Ingénierie Tracteurs Axion & Moissonneuses Trion/Lexion',
        sector: 'agri',
        status: 'contacted',
        email: '',
        phone: '',
        source: 'Réseau Équipe R2A',
        nextAction: 'Alternative économique au Terra Trac sur tracteurs Axion & moissonneuses Trion/Lexion',
        notes: 'Relais interne qualifié : Pierre Joly / Flavien Bouget. Positionnement face au surcoût chenilles Terra Trac.',
      },
      {
        id: 'seed_kuhn_group',
        company: 'KUHN Group (Saverne / Châteaubriant)',
        name: 'Relais interne : Jordan Fipa',
        role: 'R&D Pulvérisation & Robotique Autonome',
        sector: 'agri',
        status: 'contacted',
        email: '',
        phone: '',
        source: 'Réseau Équipe R2A',
        nextAction: 'Qualifier le besoin sur pulvérisateurs traînés (stabilité rampes) et robot autonome Karl',
        notes: 'Relais interne qualifié : Jordan Fipa. Double intérêt : stabilité horizontale des rampes grandes largeurs (α/2) et AgBot Karl.',
      },
      {
        id: 'seed_exel_industries',
        company: 'EXEL Industries — Holmer / Berthoud / Exxact',
        name: 'Direction Innovation Groupe',
        role: 'R&D Arracheuses Lourdes, Pulvérisateurs & AgBots',
        sector: 'agri',
        status: 'new',
        email: '',
        phone: '',
        source: 'Ciblage Grands Comptes Agri',
        nextAction: 'Approcher la Direction Innovation (Arracheuses 40 t, Pulvérisateurs & AgBots)',
        notes: 'Synergie multi-filiales : protection des sols sous 40 t (Holmer), stabilité rampes (Berthoud) et robotique (Exxact).',
      },
      {
        id: 'seed_agco_massey_ferguson',
        company: 'AGCO — Massey Ferguson (Centre R&D Beauvais)',
        name: 'Direction Ingénierie Tracteurs Forte Puissance',
        role: 'Centre R&D Beauvais (Gammes 8S / 9S)',
        sector: 'agri',
        status: 'new',
        email: '',
        phone: '',
        source: 'Ciblage Grands Comptes Agri',
        nextAction: 'Proposer PoC sur tracteurs forte puissance 8S/9S (lestage utile 400 kg)',
        notes: 'Centre décisionnel R&D en France (Beauvais) : valorisation directe des 2 × 400 kg en masse de traction utile + GPS RTK.',
      },
      {
        id: 'seed_aramine_mines',
        company: 'Aramine / Équipements Miniers Souterrains',
        name: 'Direction Technique Chargeuses Surbaissées',
        role: 'Ingénierie Mobilité Souterraine',
        sector: 'btp',
        status: 'contacted',
        email: '',
        phone: '',
        source: 'Ciblage R2A Mines',
        nextAction: 'Envoyer plaquette 02-3 US/FR — argument suspension logée dans la jante',
        notes: 'Forte contrainte de hauteur en galerie minière : absence de place sous châssis pour une suspension classique.',
      },
      {
        id: 'seed_tii_nicolas',
        company: 'TII Group / Nicolas Industrie (SPMT)',
        name: 'Direction R&D Remorques Modulaires Lourdes',
        role: 'Convois Exceptionnels Éolien & Nucléaire',
        sector: 'btp',
        status: 'new',
        email: '',
        phone: '',
        source: 'Ciblage R2A Convois',
        nextAction: 'Proposer échange technique avec Y. Argouarc’h sur répartition 50/50',
        notes: 'Transport de transformateurs et composants éoliens à vitesse ≤ 50 km/h.',
      },
      {
        id: 'seed_manitou_group',
        company: 'Manitou Group (Loire-Atlantique)',
        name: 'Direction Innovation Gamme MHT Forte Charge',
        role: 'R&D Manutention Tout-Terrain',
        sector: 'btp',
        status: 'new',
        email: '',
        phone: '',
        source: 'Ciblage R2A Grand Ouest',
        nextAction: 'Transmettre plaquettes 02-2 Roulette Industrielle & 02-3 Porteur Lourd',
        notes: 'Stabilité angulaire α/2 critique lors de la manutention de charges lourdes en terrain dégradé.',
      },
      {
        id: 'seed_renault_trucks_k',
        company: 'RENAULT TRUCKS — Gamme K (Saint-Priest / Lyon)',
        name: 'Relais interne : Charly Voisin',
        role: 'Ingénierie Essieux & Châssis Construction / Carrière',
        sector: 'btp',
        status: 'contacted',
        email: '',
        phone: '',
        source: 'Réseau Équipe R2A',
        nextAction: "Cibler l'ingénierie essieux Gamme K (chantier/carrière, anti-pierres coincées)",
        notes: 'Relais interne qualifié : Charly Voisin. Cible usages carrières/mines ≤ 50 km/h (élimination pierres coincées & Run-Flat).',
      },
      {
        id: 'seed_caterpillar_france',
        company: 'CATERPILLAR France (Centre R&D Grenoble / Échirolles)',
        name: 'Bureau d’Études Undercarriage & Wheel Systems',
        role: 'Ingénierie Trains Roulants Génie Civil',
        sector: 'btp',
        status: 'new',
        email: '',
        phone: '',
        source: 'Ciblage Grands Comptes BTP',
        nextAction: 'Présenter plaquette 02-3 au BE Undercarriage & Wheel Systems',
        notes: 'Centre R&D européen majeur à Grenoble / Échirolles : réduction des coûts pneumatiques OTR et du Downtime piste.',
      },
      {
        id: 'seed_liebherr_mining',
        company: 'LIEBHERR Mining (Siège mondial Mining Colmar)',
        name: 'Direction Ingénierie Tombereaux & Porteurs Miniers',
        role: 'R&D Mining Equipment',
        sector: 'btp',
        status: 'new',
        email: '',
        phone: '',
        source: 'Ciblage Grands Comptes Mines',
        nextAction: 'Soumettre le dossier porteurs lourds & tombereaux sous NDA',
        notes: 'Siège mondial Mining en Alsace (Colmar) + couverture brevet R2A au Canada (CA 3 183 669 A1).',
      },
      {
        id: 'seed_exail_shark',
        company: 'Exail / Shark Robotics (UGV & Défense)',
        name: 'Architecte Plateformes Terrestres Autonomes',
        role: 'R&D Mobilité UGV',
        sector: 'robotique',
        status: 'meeting',
        email: '',
        phone: '',
        source: 'Ciblage R2A Robotique',
        nextAction: 'Démonstration vidéos plage/galets & plaquette 02-1 Robotique Mobile',
        notes: 'Intérêt fort pour la stabilisation passive α/2 du mât optronique/LiDAR avec 0 Watt consommé.',
      },
      {
        id: 'seed_edf_framatome',
        company: 'EDF / Framatome — Inspection Conduites & CNPE',
        name: 'Pôle Robotique d’Inspection Industrielle',
        role: 'Maintenance Barrages Hydroélectriques & Nucléaire',
        sector: 'robotique',
        status: 'poc',
        email: '',
        phone: '',
        source: 'Co-développement Brevet EP 4 153 434 B1',
        nextAction: 'Valoriser l’industrialisation de crawlers à roues magnétiques déformables (plaquette 01)',
        notes: 'Copropriétaire du brevet socle EP 4 153 434 B1 / CA 3 183 669 A1 — essais validés en conduite forcée.',
      },
      {
        id: 'seed_arquus_texelis',
        company: 'ARQUUS / TEXELIS (Satory / Limoges)',
        name: 'Relais interne : Magda',
        role: 'Ingénierie Mobilité UGV Tactiques & Porteurs Spéciaux',
        sector: 'robotique',
        status: 'contacted',
        email: '',
        phone: '',
        source: 'Réseau Équipe R2A',
        nextAction: 'Valoriser le Run-Flat mécanique natif et le franchissement pour UGV et porteurs spéciaux',
        notes: 'Relais interne : Magda. Synergie UGV lourds autonomes (Arquus) et ponts/trains roulants haute mobilité (Texelis).',
      },
    ],
  },

  /* --------------------------------------------------------------------- */
  /*  MODULE VALIDATION EN LIGNE PROFESSEUR / RÉFÉRENTS & ÉQUIPE PROJET    */
  /* --------------------------------------------------------------------- */
  reviewValidation: {
    professorCode: getEnvVar('VITE_PROFESSOR_CODE', 'R2A-PROF-2026'),
    teamCode: getEnvVar('VITE_TEAM_CODE', 'ENSTA-R2A-2026'),
    maxAttempts: 5,
    lockoutSeconds: 30,
    title: 'Validation Professeur & Équipe Projet R2A',
    subtitle:
      'Espace collaboratif sécurisé (Yannick Argouarc’h, Maryline Benard & Équipe Projet 6.1) sauvegardé en temps réel sur le serveur du PC.',
    sections: [
      { id: 'vision', label: '1. Vision & Argumentaire', targetId: 'pitch', icon: 'Compass' },
      { id: 'medias', label: '2. Vidéos & Plaquettes', targetId: 'demo', icon: 'Film' },
      { id: 'simulateur', label: '3. Simulateur Multi-Concurrents', targetId: 'simulateur', icon: 'Sliders' },
      { id: 'tco', label: '4. Calculateur TCO', targetId: 'tco', icon: 'Calculator' },
      { id: 'technologie', label: '5. Technologie & Brevets', targetId: 'technologie', icon: 'Cog' },
      { id: 'questionnaire', label: '6. Questionnaire B2B', targetId: 'enquete', icon: 'ClipboardList' },
    ],
    statuses: [
      { id: 'pending', label: 'En attente ⏳', tone: 'slate' },
      { id: 'validated', label: 'Validé ✅', tone: 'good' },
      { id: 'adjust', label: 'À ajuster 🛠️', tone: 'warn' },
    ],
    signatories: [
      { id: 'yannick', name: "Yannick ARGOUARC'H", role: 'Inventeur R2A & Référent Technique ENSTA', group: 'professor' },
      { id: 'maryline', name: 'Maryline BENARD', role: 'Encadrante Valorisation DAJV ENSTA', group: 'professor' },
      { id: 'magda', name: 'Magda BIHAN', role: 'Équipe Projet 6.1 — Lot 1 (Ingénierie & Brevets)', group: 'team' },
      { id: 'matheo', name: 'Mathéo JOLY', role: 'Équipe Projet 6.1 — Lot 2 (TCO & Enquête)', group: 'team' },
      { id: 'marc', name: 'Marc BONNAFOUX', role: 'Équipe Projet 6.1 — Lot 3 (Portail B2B & CRM)', group: 'team' },
    ],
  },

  /* --------------------------------------------------------------------- */
  /*  BACK-OFFICE VALORISATION & PARAMÈTRES DÉMO                           */
  /* --------------------------------------------------------------------- */
  admin: {
    accessCode: getEnvVar('VITE_ADMIN_PASSCODE', 'ENSTA2026'),
    maxAttempts: 5,
    lockoutSeconds: 30,
    title: 'Back-Office Valorisation R2A · ENSTA',
    subtitle: 'Analyse Van Westendorp (% et € HT) par filière, classement 1-5 des contraintes, réponses B2B, pipeline CRM & serveur Cloud PC.',
    tabs: [
      { id: 'overview', label: 'Vue d’ensemble', icon: 'LayoutDashboard' },
      { id: 'vanwestendorp', label: 'Van Westendorp (% & €)', icon: 'TrendingUp' },
      { id: 'responses', label: 'Réponses', icon: 'FileText' },
      { id: 'crm', label: 'CRM Prospection', icon: 'Users' },
      { id: 'data', label: 'Données & Serveur Cloud PC', icon: 'Database' },
    ],
    kpis: {
      interestQuestionId: 'featureInterest',
      severityQuestionId: 'painSeverity',
      pilotQuestionId: 'pilotInterest',
      pilotPositiveValues: ['oui_prioritaire', 'oui_info'],
    },
    demo: {
      count: 18,
      meanPercentBySector: {
        agri: 5.5,
        btp: 6.2,
        robotique: 7.5,
      },
      meanPriceBySector: {
        agri: 5400,
        btp: 8800,
        robotique: 3400,
      },
      roundingBySector: {
        agri: 100,
        btp: 250,
        robotique: 100,
      },
    },
  },

  storage: {
    namespace: 'ensta-roue-adaptative',
    pendingQueueKey: 'ensta_pending_submissions',
    defaultSessionCode: getEnvVar('VITE_SESSION_CODE', 'ENSTA-R2A-2026'),
    pollIntervalMs: 8000,
  },
};

export default projectData;
