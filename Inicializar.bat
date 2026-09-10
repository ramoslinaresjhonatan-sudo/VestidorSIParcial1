@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "BACK_DIR=%ROOT_DIR%back"
set "FRONT_DIR=%ROOT_DIR%from"

echo Iniciando EduGestion...
echo.

if not exist "%BACK_DIR%\venv\Scripts\python.exe" (
  echo [ERROR] No se encontro el entorno virtual del backend.
  echo Ruta esperada: %BACK_DIR%\venv\Scripts\python.exe
  pause
  exit /b 1
)

if not exist "%FRONT_DIR%\node_modules" (
  echo [ERROR] No se encontraron las dependencias del frontend.
  echo Ejecuta npm install dentro de: %FRONT_DIR%
  pause
  exit /b 1
)

if not exist "%FRONT_DIR%\node_modules\@stripe\react-stripe-js\package.json" (
  echo Instalando la integracion de Stripe...
  pushd "%FRONT_DIR%"
  call npm install
  if errorlevel 1 (
    popd
    echo [ERROR] No se pudieron instalar las dependencias del frontend.
    pause
    exit /b 1
  )
  popd
)


start "EduGestion - Backend" /D "%BACK_DIR%" cmd /k "venv\Scripts\python.exe manage.py runserver"
start "EduGestion - Frontend" /D "%FRONT_DIR%" cmd /k "npm run dev -- --force"

echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Los servicios se abrieron en terminales separadas.

timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"

endlocal
