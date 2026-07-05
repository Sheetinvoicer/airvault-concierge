FROM node:22-alpine AS base

# ── Dependencies (all — including dev, needed for the build) ─────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Pre-compile src/ (payload config + collections) to plain ESM JS so the
# runner does not need tsx to load .ts files at runtime
RUN node -e " \
  const esbuild = require('./node_modules/esbuild'); \
  esbuild.buildSync({ \
    entryPoints: ['src/payload.config.ts'], \
    bundle: true, \
    packages: 'external', \
    format: 'esm', \
    platform: 'node', \
    loader: { '.ts': 'ts', '.tsx': 'tsx' }, \
    outfile: 'dist/payload.config.mjs', \
  }); \
  console.log('esbuild done'); \
"

# ── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Point Payload at the pre-compiled ESM config (no tsx needed at runtime)
ENV PAYLOAD_CONFIG_PATH=dist/payload.config.mjs

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone Next.js build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Override node_modules with the full set (includes payload CLI + tsx for migrations)
# The standalone build embeds only what Next.js needs; we need payload's runtime deps too
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy the pre-compiled ESM config (esbuild output from builder)
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

USER nextjs

# Render sets $PORT; fall back to 3000 for local dev
ENV PORT=3000
EXPOSE 3000

# Run Payload DB migration (non-interactive, --force skips all prompts),
# then start the standalone Next.js server.
CMD ["sh", "-c", "node node_modules/payload/bin.js migrate --force && node server.js"]