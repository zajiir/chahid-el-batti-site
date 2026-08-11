@echo off
setlocal
cd /d %~dp0

echo ============================================
echo   Chahid EL BATTI - Lancement du site
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js est introuvable sur cet ordinateur.
  echo Installe-le depuis https://nodejs.org ^(version LTS^), puis relance ce fichier.
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do echo Node.js detecte : %%v
for /f "tokens=*" %%v in ('npm -v') do echo npm detecte : %%v
echo.

if not exist node_modules (
  echo Installation des dependances, ca peut prendre une minute...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERREUR] L'installation des dependances a echoue.
    echo Verifie ta connexion internet et relance ce fichier.
    pause
    exit /b 1
  )
  echo.
)

powershell -NoProfile -Command "try{Invoke-WebRequest -Uri 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0}catch{exit 1}" >nul 2>nul
if not errorlevel 1 (
  echo Le site tourne deja, ouverture du navigateur...
  start http://localhost:5173/
  echo.
  echo Cette fenetre peut etre fermee sans probleme.
  pause
  exit /b 0
)

echo Demarrage du serveur dans une nouvelle fenetre...
start "Site - Chahid EL BATTI (ne pas fermer)" cmd /k "npm run dev"

echo Attente que le serveur soit pret ^(jusqu'a 90 secondes au premier lancement^)...
set READY=0
powershell -NoProfile -Command ^
  "for($i=0;$i-lt 180;$i++){try{Invoke-WebRequest -Uri 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0}catch{Start-Sleep -Milliseconds 500}}; exit 1"
if not errorlevel 1 set READY=1

echo.
if "%READY%"=="1" (
  echo Le site repond, ouverture du navigateur...
  start http://localhost:5173/
) else (
  echo Le serveur met plus de temps que prevu a demarrer.
  echo Regarde la fenetre "Site - Chahid EL BATTI" : le message d'erreur y sera affiche.
  echo Sinon, essaie d'ouvrir manuellement http://localhost:5173 dans ton navigateur.
)

echo.
echo Cette fenetre peut etre fermee sans probleme.
echo Pour ARRETER le site, ferme la fenetre "Site - Chahid EL BATTI".
pause
