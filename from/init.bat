@echo off
if not exist "node_modules\@stripe\react-stripe-js\package.json" (
  echo Instalando dependencias del frontend...
  call npm install
  if errorlevel 1 exit /b 1
)

rem --force hace que Vite vuelva a descubrir paquetes agregados recientemente.
call npm run dev -- --force
