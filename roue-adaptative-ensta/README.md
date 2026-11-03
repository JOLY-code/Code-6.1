# Technologie R2A · Roues Auto-Adaptatives — ENSTA Bretagne

Portail industriel B2B de **valorisation technologique & transfert de licences**, de **simulation cinématique multi-concurrents en coupe frontale**, de **calcul de TCO**, de **validation Professeur / Équipe** et de **consultation partenaires sécurisée** autour du portefeuille de brevets **R2A — ENSTA Bretagne** :
- **FR2111969 · EP 4 180 239** (*100 % ENSTA Bretagne seule — Brevet Unitaire 17 pays UE + France*) — Roue terrestre auto-adaptative à rappel élastique, centrage dynamique et contrôle anti-vibration jusqu'à 50 km/h (`Y. Argouarc'h, H. Trébaol`).
- **FR3110111 · EP 4 153 434 B1 · CA 3 183 669 A1** (*Délivré Europe, Royaume-Uni, Suisse & Canada — Copropriété ENSTA Bretagne / EDF*) — Dispositif de roulement auto-adaptatif couvrant la roue terrestre et la roue magnétique déformable à disques d'acier (`Y. Argouarc'h, H. Trébaol`).

Stack : React 18 + Vite 5 + Tailwind CSS 3 + lucide-react + Middleware Node.js Write-Only (`server/r2aServerPlugin.js`). Synchronisation **100 % dynamique par filière** (`Agricole`, `BTP & Carrières`, `Robotique mobile`).

## Démarrage local ou Serveur Cloud PC (Multi-Appareils & 4G/5G)

### 1. Développement / Poste local
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # génère dist/
npm run preview
```

### 2. Hébergement Cloud restreint depuis votre PC (`Lancer_Serveur_Cloud_PC.bat`)
Double-cliquez sur **`Lancer_Serveur_Cloud_PC.bat`** :
1. Démarre le serveur Node/Vite local (`npm run dev -- --host`, `allowedHosts: true` activé dans `vite.config.js`).
2. Ouvre automatiquement un tunnel HTTPS chiffré (`npx cloudflared tunnel --url http://localhost:5173`, ou repli `localtunnel`) pour permettre aux clients de répondre en **4G / 5G / Wi-Fi distant** sans configuration routeur.
3. Détecte l'URL publique du tunnel (ou l'IP Wi-Fi locale `192.168.x.x`) et génère instantanément dans **Back-Office → Données & Sauvegarde** les **2 QR Codes SVG & liens** :
   - **Lien 1 — Questionnaire direct sans biais** (`?view=survey&sector=...`)
   - **Lien 2 — Portail complet en Mode Consultation Protégée** (`?view=presentation&sector=...`)

## Architecture Cybersécurité, Anti-Copie & Triple Sauvegarde

- **Mode Consultation Protégée (Anti-Copie Client)** : Pour tout visiteur externe non authentifié, les boutons d'upload/téléchargement brut de vidéos ou PDF, les chemins techniques (`/Video/...`, `.pdf`) et l'accordéon académique interne (*Projet 6.1 & Gantt*) sont masqués ; le clic droit, le glisser-déposer d'images/SVG, le téléchargement natif `<video>` (`nodownload`) et la copie en masse des slides/schémas CAO sont bloqués tout en laissant les champs du questionnaire et du calculateur TCO libres de saisie.
- **Collecte "Write-Only" (Zéro Fuite de Données)** : Les répondants soumettent uniquement via `POST /api/survey-submit` qui ne renvoie qu'un accusé `{ ok, id, receiptId, savedAt }`. Aucune route publique ne permet de lire les réponses d'autres industriels ni le CRM (`GET /api/admin-data` et `POST /api/admin-sync` exigent un jeton `X-Admin-Token` avec verrouillage anti-bruteforce de 30 s après 5 échecs ; accès direct à `/data/*` bloqué en `403`).
- **Triple Sauvegarde Multi-Appareils** :
  1. **Serveur PC (`./data/`, ignoré par Git)** : Base fusionnée `./data/ensta-r2a-database.json` + journal atomique append-only `./data/responses-append-log.jsonl` + snapshots horodatés dans `./data/backups/`.
  2. **File d'attente hors-ligne sur appareil (`ensta_pending_submissions`)** : Si la connexion coupe sur salon, la réponse est stockée localement et transmise automatiquement dès le retour du réseau.
  3. **Justificatif individuel `.json`** : Accusé de réception `receiptId` et téléchargement en 1 clic sur l'écran de remerciement (ré-importable dans le Back-Office).
- **Module "Validation Professeur / Équipe"** : Accessible depuis la barre supérieure (codes dédiés Référents ENSTA & Équipe Projet) pour valider chaque section (`Validé ✅` / `À ajuster 🛠️` / `En attente ⏳`), déposer des commentaires signés horodatés et consulter la gouvernance Projet 6.1 & le planning Gantt.

## Médias officiels intégrés (`public/`)

- `public/Logo/ENSTA.webp` : Logo officiel ENSTA Bretagne affiché dans le bandeau supérieur et le pied de page.
- `public/Video/` : Vidéos d'essais terrain filtrées automatiquement par filière (`Reinvent_the_wheel.mp4`, `Robotique_mobile-test-plage.mp4`, `Roue Magnetique.mp4`, `Roue Magnetique dans conduite .mp4`, `Roue Terrestre.MTS`, `Roues auto_adaptatives.mov`).
- `public/Plaquette/` : Les 8 plaquettes PDF officielles bilingues Français (`FR`) et Anglais (`-US.pdf`) filtrées par secteur avec bascule `FR / EN (US)` et aperçu intégré.

## Tout se modifie dans `src/config/projectData.js`

| Besoin | Section à éditer dans `src/config/projectData.js` |
| --- | --- |
| Écran d'accueil double entrée (`?view=survey` / `?view=presentation`) | `welcomeGate` |
| Identité B2B, Logo, Contacts DAJV (`Caroline Pengam`, `Maryline Benard`, `Yannick Argouarc'h`), Brevets | `meta`, `valorisationContacts`, `patents` |
| Personnalisation 100 % par secteur (Hero, 3 KPIs, Trilemme, Cartes Vision, Encadré Simulateur) | `sectors` (`agri`, `btp`, `robotique`) |
| Hub Médias par secteur (Playlists vidéos `/Video/`, Pitch Deck 6 slides 16:9, Plaquettes `/Plaquette/` FR/US) | `mediaHub` (`videosBySector`, `pitchDeckBySector`, `plaquettes`) |
| Simulateur multi-concurrents en coupe frontale (12 technologies concurrentes, obstacle `H`, charge `F`, Run-Flat) | `kinematics` (`competitorsBySector`) & `sectors[].kinematicsLabels` |
| Calculateur financier TCO par secteur | `tco.sectors.<secteur>` (`inputs`, `capex`, `annual`) |
| Nomenclature CAO (6 sous-ensembles), Variante Roue Magnétique EDF, Forces, Limites & TRL 6 | `techSpecs.bySector.<secteur>` |
| Accords de Licences (2 à 6 % + part fixe), Couverture Brevets & Périmètre | `strategicFramework` |
| Module Validation Professeur / Équipe (Sections, Statuts, Signataires & Codes d'accès) | `reviewValidation` |
| Enquête industrielle B2B en 4 étapes (Matrice Rang 1-5 + Autre, Modèle d'achat, Van Westendorp `%` / `€ HT`, Coordonnées obligatoires) | `survey.steps[].questions` & `survey.conceptRecapBySector` |
| 15 Cibles Industrielles CRM & Accès Back-Office | `crm.seedContacts`, `storage`, `admin.accessCode` |
