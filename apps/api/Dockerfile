FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate
RUN npm run build -w @eventsphere/shared
RUN npm run build -w @eventsphere/api

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma
EXPOSE 4000
CMD ["node", "dist/main.js"]
