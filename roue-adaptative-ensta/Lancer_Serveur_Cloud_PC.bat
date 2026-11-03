@echo off
chcp 65001 >nul
title Serveur Cloud PC - Technologie R2A ENSTA Bretagne

cd /d "%~dp0"

echo ============================================================================
echo   TECHNOLOGIE R2A - ROUES AUTO-ADAPTATIVES (ENSTA BRETAGNE)
echo   Serveur Cloud Restreint Multi-Appareils (Collecte Write-Only + HTTPS)
echo ============================================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe ou absent du PATH Windows.
    echo Installez Node.js LTS depuis https://nodejs.org/ puis relancez ce script.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/2] Installation initiale des dependances npm...
    call npm install
    if errorlevel 1 (
        echo [ERREUR] Echec de npm install.
        pause
        exit /b 1
    )
)

echo [2/2] Lancement unifie (Vite 'npm run dev -- --host' + Tunnel 'cloudflared')...
echo       Execution de start-cloud.js...
echo.
node start-cloud.js

if errorlevel 1 (
    echo.
    echo [INFO] Le serveur a ete arrete.
)
pause
