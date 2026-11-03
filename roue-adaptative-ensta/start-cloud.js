import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const TUNNEL_URL_FILE = path.join(DATA_DIR, 'active-tunnel-url.txt');

// 1. Prépare le répertoire data et nettoie l'ancien fichier d'URL
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (fs.existsSync(TUNNEL_URL_FILE)) {
  try {
    fs.unlinkSync(TUNNEL_URL_FILE);
  } catch {
    /* ignore */
  }
}

console.log('\n' + '='.repeat(76));
console.log('   🚀 TECHNOLOGIE R2A · ROUES AUTO-ADAPTATIVES (ENSTA BRETAGNE)');
console.log('   Lancement Automatisé du Serveur Local & du Tunnel Cloudflare HTTPS');
console.log('='.repeat(76) + '\n');

console.log('[1/2] Démarrage du serveur local Vite (écoute réseau 0.0.0.0:5173)...');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

// Lance Vite avec écoute réseau --host
const viteProcess = spawn(npmCmd, ['run', 'dev', '--', '--host'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWin,
});

viteProcess.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  // Relaye les messages utiles de Vite (sans encombrer)
  if (text.includes('Local:') || text.includes('Network:')) {
    process.stdout.write(text);
  }
});

viteProcess.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

let tunnelProcess = null;
let detectedUrl = null;

// Lance Cloudflare Tunnel après 2.5 secondes (une fois le port 5173 ouvert)
setTimeout(() => {
  console.log('\n[2/2] Connexion au réseau Cloudflare Quick Tunnel (npx cloudflared)...');
  console.log('      Génération de votre adresse HTTPS mondiale sécurisée...\n');

  tunnelProcess = spawn(
    npxCmd,
    ['--yes', 'cloudflared', 'tunnel', '--url', 'http://localhost:5173'],
    {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWin,
    },
  );

  const handleTunnelData = (chunk) => {
    const output = chunk.toString();

    // Recherche de l'URL trycloudflare
    const match = output.match(/https:\/\/[a-zA-Z0-9.-]+\.trycloudflare\.com/i);
    if (match && !detectedUrl) {
      detectedUrl = match[0].replace(/\/+$/, '');

      // Écriture immédiate dans le fichier partagé ./data/active-tunnel-url.txt
      try {
        fs.writeFileSync(TUNNEL_URL_FILE, detectedUrl, 'utf8');
      } catch (err) {
        console.error('Erreur écriture active-tunnel-url.txt :', err);
      }

      console.log('\n' + '┌'.padEnd(76, '─') + '┐');
      console.log('│  🟢 TUNNEL CLOUDFLARE MONDIAL CONNECTÉ AVEC SUCCÈS !'.padEnd(75) + '│');
      console.log('├'.padEnd(76, '─') + '┤');
      console.log(`│  URL Publique HTTPS : ${detectedUrl}`.padEnd(75) + '│');
      console.log('│'.padEnd(75) + '│');
      console.log('│  📲 LIEN 1 (Questionnaire direct sans biais) :'.padEnd(75) + '│');
      console.log(`│     ${detectedUrl}/?view=survey&sector=agri`.padEnd(75) + '│');
      console.log('│'.padEnd(75) + '│');
      console.log('│  💻 LIEN 2 (Portail complet en Mode Consultation Protégée) :'.padEnd(75) + '│');
      console.log(`│     ${detectedUrl}/?view=presentation&sector=agri`.padEnd(75) + '│');
      console.log('├'.padEnd(76, '─') + '┤');
      console.log('│  ✨ Les QR Codes SVG du Back-Office sont synchronisés automatiquement !'.padEnd(75) + '│');
      console.log('│  (Gardez cette console ouverte pendant toute la durée de l’enquête)'.padEnd(75) + '│');
      console.log('└'.padEnd(76, '─') + '┘\n');
    }
  };

  if (tunnelProcess.stdout) tunnelProcess.stdout.on('data', handleTunnelData);
  if (tunnelProcess.stderr) tunnelProcess.stderr.on('data', handleTunnelData);

  tunnelProcess.on('error', (err) => {
    console.warn('\n⚠️ Avertissement Cloudflare :', err.message);
    console.log('   Si cloudflared n’est pas disponible, lancez `npm i -g cloudflared`.');
  });
}, 2500);

// Gestion propre de l'arrêt (Ctrl+C)
function cleanup() {
  console.log('\n\nArrêt du serveur et fermeture du tunnel Cloudflare...');
  try {
    if (fs.existsSync(TUNNEL_URL_FILE)) fs.unlinkSync(TUNNEL_URL_FILE);
  } catch {
    /* ignore */
  }
  if (tunnelProcess) {
    try {
      tunnelProcess.kill('SIGTERM');
    } catch {
      /* ignore */
    }
  }
  if (viteProcess) {
    try {
      viteProcess.kill('SIGTERM');
    } catch {
      /* ignore */
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

