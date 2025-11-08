# ============================
#      Dockerfile Optimizado
# ============================

# Etapa 1: Construcción del proyecto
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Compilar la app
RUN npm run build

# ============================
# Etapa 2: Imagen final
# ============================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar solo lo necesario
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Exponer puerto
EXPOSE 3000

# Al iniciar el contenedor:
# - Asegura migraciones
# - Ejecuta la app
CMD ["npm", "start"]
