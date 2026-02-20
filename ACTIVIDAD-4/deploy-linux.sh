#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f package.json ]; then
  echo "Ejecuta este script dentro de la carpeta ACTIVIDAD-4"
  exit 1
fi

if [ ! -f .env ]; then
  echo "Falta el archivo .env con DB_URI, JWT_SECRET y PORT"
  exit 1
fi

npm install
npm start

