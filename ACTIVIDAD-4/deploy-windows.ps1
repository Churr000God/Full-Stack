$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if (-not (Test-Path "package.json")) {
  Write-Error "Ejecuta este script dentro de la carpeta ACTIVIDAD-4"
}

if (-not (Test-Path ".env")) {
  Write-Error "Falta el archivo .env con DB_URI, JWT_SECRET y PORT"
}

npm.cmd install
npm.cmd start

