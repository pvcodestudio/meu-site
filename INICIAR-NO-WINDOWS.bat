@echo off
setlocal
cd /d "%~dp0"
title PVcoding Studio - Servidor local

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js nao foi encontrado. Instale a versao 20 ou superior em https://nodejs.org/
  pause
  exit /b 1
)

if not exist ".env" (
  copy /Y ".env.example" ".env" >nul
  echo Arquivo .env criado. Configure seus dados de e-mail antes de testar o formulario.
)

if not exist "node_modules" (
  echo Instalando dependencias na primeira execucao...
  call npm install
  if errorlevel 1 (
    echo Falha ao instalar. Confira a conexao com a internet.
    pause
    exit /b 1
  )
)

echo.
echo O site sera executado em http://localhost:3000
ECHO Use Ctrl+C para encerrar.
echo.
call npm start
pause
