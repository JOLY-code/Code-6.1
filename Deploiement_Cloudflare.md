# Guide de Déploiement Cloudflare Tunnel & QR Codes Multi-Appareils
## Technologie R2A · Roues Auto-Adaptatives — ENSTA Bretagne (Projet 6.1)

Ce guide permet à l'équipe projet (**Magda BIHAN**, **Mathéo JOLY**, **Marc BONNAFOUX**) de rendre l'application accessible **partout dans le monde en HTTPS** (4G/5G, salons professionnels, tablettes d'industriels, réunions à distance) directement depuis votre PC, **sans payer aucun abonnement, sans ouvrir de ports sur votre box Internet et sans exposer votre adresse IP publique**.

---

## ⚡ Méthode Rapide (1 Double-Clic sur Windows)

Le projet intègre un script qui automatise l'intégralité des étapes ci-dessous :

1. Double-cliquez sur **`Lancer_Serveur_Cloud_PC.bat`** (situé à la racine du dossier).
2. Le script démarre automatiquement :
   - Le serveur local sécurisé Vite / Node sur le port `5173` avec écoute réseau (`--host`).
   - Le tunnel Cloudflare chiffré (`npx cloudflared tunnel --url http://localhost:5173`).
3. L'URL publique `https://xxxx.trycloudflare.com` est automatiquement détectée et transmise à l'application.
4. Les 2 QR Codes du Back-Office se mettent à jour instantanément !

Si vous préférez exécuter les commandes manuellement ou si vous êtes sur Mac / Linux, suivez le pas-à-pas ci-dessous.

---

## 🛠️ Méthode Manuelle Pas-à-Pas

### Étape 1 : Prérequis (Installation de `cloudflared`)

`cloudflared` est l'agent officiel et gratuit fourni par Cloudflare pour créer des tunnels sécurisés chiffrés de bout en bout.

#### Sur Windows :
- **Option A (Recommandée - via le terminal Windows / PowerShell)** :
  ```powershell
  winget install --id Cloudflare.cloudflared
  ```
- **Option B (Sans installation via npx)** :
  Si Node.js est installé, vous pouvez lancer `cloudflared` directement sans l'installer via :
  ```powershell
  npx cloudflared tunnel --url http://localhost:5173
  ```
- **Option C (Téléchargement direct du fichier exécutable)** :
  Téléchargez `cloudflared-windows-amd64.exe` depuis [la page officielle GitHub Cloudflare](https://github.com/cloudflare/cloudflared/releases), renommez-le en `cloudflared.exe` et placez-le dans un dossier de votre PATH (ex. `C:\Windows\System32`).

#### Sur macOS :
```bash
brew install cloudflared
```

---

### Étape 2 : Lancement du Serveur Local

Ouvrez un premier terminal dans le dossier `roue-adaptative-ensta` et lancez Vite en écoute réseau :

```bash
npm run dev -- --host
```

> **Pourquoi `--host` ?**  
> L'option `--host` indique à Vite d'écouter sur toutes les interfaces réseau locales (`0.0.0.0`) et non uniquement sur `127.0.0.1`, permettant à `cloudflared` et aux appareils sur le même Wi-Fi d'accéder au serveur.  
> La configuration `allowedHosts: true` est déjà activée dans `vite.config.js` pour autoriser les noms d'hôtes Cloudflare (`.trycloudflare.com`).

Laissez ce terminal ouvert en arrière-plan.

---

### Étape 3 : Création du Tunnel Cloudflare

Ouvrez un **deuxième terminal** et exécutez la commande suivante :

```bash
cloudflared tunnel --url http://localhost:5173
```
*(ou `npx cloudflared tunnel --url http://localhost:5173` si non installé globalement)*

Au bout de quelques secondes, Cloudflare affiche des lignes de logs. Repérez la ligne contenant votre adresse HTTPS publique :

```text
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://nom-aleatoire-temporaire.trycloudflare.com                                       |
+--------------------------------------------------------------------------------------------+
```

Copiez cette URL (par exemple : `https://alpha-beta-gamma.trycloudflare.com`).

> [!IMPORTANT]
> Ne fermez pas ce terminal : le tunnel reste actif tant que la fenêtre reste ouverte. Chaque relance génère une nouvelle URL sécurisée.

---

### Étape 4 : Configuration dans le Back-Office & Génération des QR Codes

1. Depuis votre PC, ouvrez votre navigateur sur le Back-Office :
   - Rendez-vous sur `http://localhost:5173`
   - Cliquez sur **`Back-Office`** en haut à droite (ou tapez le code d'accès)
2. Cliquez sur le 5ᵉ onglet : **`Données & Serveur Cloud PC`** (icône base de données).
3. Dans la section **« 1. Configuration de l'URL Publique (Cloud PC ou Wi-Fi LAN) »** :
   - Si vous avez utilisé le script `.bat`, l'URL Cloudflare est déjà auto-détectée.
   - En mode manuel, collez votre URL Cloudflare (ex. `https://alpha-beta-gamma.trycloudflare.com`) dans le champ **« URL Publique Cloud du PC »** et cliquez sur **« Enregistrer l'URL »**.
4. **Résultat immédiat** :
   Le système recalcule instantanément en pur SVG vectoriel les deux QR Codes officiels :
   - **QR Code & Lien 1 (Consultation Industrielle Directe)** :  
     URL : `https://alpha-beta-gamma.trycloudflare.com/?view=survey&sector=agri`  
     *Permet aux industriels de répondre directement au questionnaire en 3 minutes sur leur téléphone sans être influencés par les slides de présentation.*
   - **QR Code & Lien 2 (Portail B2B Complet en Mode Consultation Protégée)** :  
     URL : `https://alpha-beta-gamma.trycloudflare.com/?view=presentation&sector=agri`  
     *Donne accès aux vidéos, au simulateur cinématique, au calculateur TCO et aux plaquettes PDF avec anti-copie activée.*

Vous pouvez cliquer sur **« Télécharger le QR Code SVG »** pour chaque lien afin de les insérer dans vos présentations PowerPoint, vos fiches papier de salon ou vos plaquettes.

---

### Étape 5 : Test Réel avec un Smartphone en 4G/5G

Pour valider l'étanchéité et la fluidité de la collecte en situation réelle :

1. **Désactivez le Wi-Fi** de votre smartphone personnel pour forcer la connexion en **4G / 5G** (réseau externe simulant un client à distance).
2. **Scannez le QR Code 1** (Enquête directe) avec l'appareil photo du téléphone.
3. Remplissez le formulaire de test sur le smartphone :
   - Étape 1 : Choisissez *Constructeur (OEM)*, taille de parc *50*.
   - Étape 2 : Classez les 5 contraintes de 1 à 5.
   - Étape 3 : Choisissez le modèle *Licence 2 à 6 %*, saisissez des montants indicatifs (ex: 2 %, 3 %, 5 %, 8 %).
   - Étape 4 : Renseignez une entreprise test (*Ex. : Test 4G SAS*), votre nom, e-mail et téléphone, cochez le consentement RGPD et cliquez sur **« Envoyer mon évaluation »**.
4. **Vérification instantanée sur votre PC** :
   - L'écran du smartphone affiche la confirmation avec son numéro de reçu officiel (ex: `R2A-2026-XXXX`) et propose le téléchargement du justificatif `.json`.
   - Sur votre PC, dans l'onglet **`Réponses`** ou **`Vue d'ensemble`** du Back-Office, la réponse apparaît **en temps réel** !
   - Dans le dossier `./data/` de votre PC, vous pouvez constater que la réponse est sauvegardée à la fois dans `ensta-r2a-database.json` et dans le journal inaltérable `responses-append-log.jsonl`.

---

## 🔒 Sécurité & Protection des Données pendant le Déploiement

- **Zéro fuite des données concurrentes** : Même si 50 industriels ouvrent le lien en même temps sur un salon, l'API `/api/survey-submit` est en **Write-Only strict**. Aucun smartphone ne peut lire les réponses des autres participants.
- **Accès Back-Office protégé** : Les routes `/api/admin-data` et `/api/admin-sync` bloquent toute requête ne disposant pas du jeton d'authentification valide (`HTTP 401`).
- **Verrouillage anti-bruteforce** : En cas de tentative d'attaque par dictionnaire sur le mot de passe, l'adresse IP de l'attaquant est automatiquement bloquée pendant 30 secondes après 5 échecs (`HTTP 429`).
- **Dossier local ignoré par Git** : Toutes les données collectées restent stockées localement sur le PC dans le répertoire `./data/` qui est strictement exclu de Git (`.gitignore`).

