# Script de inicialización para Windows (PowerShell)

Write-Host "--- INICIALIZANDO PROYECTO GESTOR DE TAREAS (FULL STACK) ---" -ForegroundColor Cyan

# 1. Verificar si Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js no está instalado. Por favor instálalo desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 2. Configurar Backend
$backendPath = Join-Path $PSScriptRoot "BACKEND"
if (Test-Path $backendPath) {
    Write-Host "`n[1/3] Configurando Backend en: $backendPath" -ForegroundColor Yellow
    Push-Location $backendPath
    
    # Instalar dependencias si no existen node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Host "    Instalando dependencias (npm install)..." -ForegroundColor Gray
        npm install
    } else {
        Write-Host "    Dependencias ya instaladas." -ForegroundColor Green
    }
    
    Pop-Location
} else {
    Write-Host "Error: No se encuentra la carpeta BACKEND" -ForegroundColor Red
    exit 1
}

# 3. Instrucciones al usuario
Write-Host "`n[2/3] Preparando entorno..." -ForegroundColor Yellow
Write-Host "    El servidor se iniciará en una nueva ventana o proceso." -ForegroundColor Gray
Write-Host "    El Frontend debe abrirse manualmente en el navegador." -ForegroundColor Gray

# 4. Iniciar Servidor
Write-Host "`n[3/3] Iniciando Servidor..." -ForegroundColor Green
Write-Host ">>> Abre FRONTEND/index.html en tu navegador para usar la app <<<" -ForegroundColor Cyan

# Iniciamos el servidor en el directorio BACKEND
Set-Location $backendPath
node server.js
