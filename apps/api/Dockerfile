# ── Builder ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install deps (monorepo root + workspace manifests)
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ui/package*.json ./packages/ui/
COPY apps/api/package*.json ./apps/api/

RUN npm ci --legacy-peer-deps

# Copy source
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/
COPY apps/api ./apps/api

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Compile NestJS
RUN npm run build --workspace=kanban-api

# ── Production runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

# Copy compiled app
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Copy root manifests for workspace resolution
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/ui/package.json ./packages/ui/

# Install production deps (includes @prisma/client + generated engine)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules ./node_modules

USER nestjs
EXPOSE 3001
ENV API_PORT=3001

CMD ["node", "apps/api/dist/main.js"]
