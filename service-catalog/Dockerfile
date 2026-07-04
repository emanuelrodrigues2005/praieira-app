# ========== Builder stage ==========
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --ignore-scripts

COPY prisma/ ./prisma/

RUN npx prisma generate

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/

RUN npm run build

# ========== Runner stage ==========
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install OpenSSL for Prisma engine compatibility
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

EXPOSE 3002

CMD ["./entrypoint.sh"]
