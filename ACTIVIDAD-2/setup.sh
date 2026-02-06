#!/bin/bash

echo "--- INICIALIZANDO PROYECTO GESTOR DE TAREAS (FULL STACK) ---"

# 1. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js no está instalado."
    exit 1
fi

# 2. Configurar Backend
BASE_DIR=$(dirname "$0")
BACKEND_DIR="$BASE_DIR/BACKEND"

if [ -d "$BACKEND_DIR" ]; then
    echo -e "\n[1/3] Configurando Backend..."
    cd "$BACKEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo "    Instalando dependencias..."
        npm install
    else
        echo "    Dependencias ya instaladas."
    fi
else
    echo "Error: No se encuentra carpeta BACKEND"
    exit 1
fi

# 3. Iniciar Servidor
echo -e "\n[2/3] Iniciando Servidor..."
echo ">>> Abre FRONTEND/index.html en tu navegador <<<"

node server.js
