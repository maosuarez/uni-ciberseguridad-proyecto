#!/bin/sh
set -e

# Cargar variables .env en Docker Compose o Docker Run
# Ejecutar migraciones
npx prisma migrate deploy

# Ejecutar seed
npx tsx src/lib/seed.ts

# Iniciar app
npm start
