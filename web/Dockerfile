# syntax=docker/dockerfile:1.4
# Build arguments with Next.js 15
ARG NODE_VERSION=20.18.0
ARG NODE_IMAGE=public.ecr.aws/docker/library/node:${NODE_VERSION}-alpine
ARG DISTROLESS_IMAGE=gcr.io/distroless/nodejs20-debian12:nonroot
ARG PNPM_VERSION=9.15.2
ARG APP_USER=nextjs
ARG APP_GROUP=nodejs
ARG APP_UID=1001
ARG APP_GID=1001

# =============================================================================
# Base stage
# =============================================================================
FROM ${NODE_IMAGE} AS base

ARG PNPM_VERSION
ARG APP_USER
ARG APP_GROUP
ARG APP_UID
ARG APP_GID

# Create non-root user for security
RUN addgroup -g ${APP_GID} -S ${APP_GROUP} && \
    adduser -S ${APP_USER} -u ${APP_UID} -G ${APP_GROUP} -s /bin/sh

# Install system dependencies with security updates and build tools
RUN --mount=type=cache,target=/var/cache/apk,sharing=locked \
    --mount=type=cache,target=/var/lib/apk,sharing=locked \
    apk update && \
    apk upgrade && \
    apk add --no-cache \
        build-base \
        ca-certificates \
        curl \
        dumb-init \
        g++ \
        libc6-compat \
        make \
        python3 \
        tzdata \
        wget && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Install pnpm globally
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION} && \
    npm cache clean --force

# Environment variables optimized for Next.js 15
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=true \
    PNPM_HOME="/usr/local" \
    NEXT_SHARP=1 \
    NODE_OPTIONS="--max-old-space-size=4096 --enable-source-maps --dns-result-order=ipv4first --unhandled-rejections=strict" \
    NO_UPDATE_NOTIFIER=1 \
    NPM_CONFIG_FUND=false

WORKDIR /app
RUN chown -R ${APP_USER}:${APP_GROUP} /app

# =============================================================================
# Dependencies stage
# =============================================================================
FROM base AS deps

ARG APP_USER
ARG APP_GROUP
ARG APP_UID
ARG APP_GID

USER ${APP_USER}

# Copy package files with proper ownership
COPY --chown=${APP_USER}:${APP_GROUP} package.json pnpm-lock.yaml* .npmrc* ./

# Install dependencies with enhanced error handling
RUN --mount=type=cache,id=pnpm-store,target=/home/${APP_USER}/.pnpm-store,sharing=locked,uid=${APP_UID},gid=${APP_GID} \
    --mount=type=cache,id=pnpm-cache,target=/home/${APP_USER}/.cache/pnpm,sharing=locked,uid=${APP_UID},gid=${APP_GID} \
    set -eux && \
    mkdir -p /home/${APP_USER}/.pnpm-store && \
    mkdir -p /home/${APP_USER}/.cache/pnpm && \
    pnpm config set store-dir /home/${APP_USER}/.pnpm-store && \
    pnpm config set cache-dir /home/${APP_USER}/.cache/pnpm && \
    pnpm config set registry https://registry.npmjs.org/ && \
    # Run audit (non-blocking)
    pnpm audit --audit-level high --json || echo "Audit completed with warnings" && \
    # Install with corrected options
    pnpm install \
        --frozen-lockfile \
        --prefer-offline \
        --prod=false \
        --ignore-scripts=false \
        --reporter=default && \
    # Clean up
    pnpm store prune

# =============================================================================
# Build stage
# =============================================================================
FROM base AS builder

ARG APP_USER
ARG APP_GROUP
ARG APP_UID

USER ${APP_USER}

# Copy dependencies from deps stage
COPY --from=deps --chown=${APP_USER}:${APP_GROUP} /app/node_modules ./node_modules
COPY --from=deps --chown=${APP_USER}:${APP_GROUP} /app/package.json ./package.json
COPY --from=deps --chown=${APP_USER}:${APP_GROUP} /app/pnpm-lock.yaml* ./

# Copy source code (ensure .dockerignore excludes: node_modules, .git, .next, coverage, etc.)
COPY --chown=${APP_USER}:${APP_GROUP} . .

# Build environment optimized for Next.js 15
ARG GENERATE_SOURCEMAP=true
ENV GENERATE_SOURCEMAP=${GENERATE_SOURCEMAP} \
    NEXT_BUILD_CACHE=/app/.next/cache \
    NEXT_EXPERIMENTAL_BUILD_WORKER_THREADS=true

# Create build directories
RUN mkdir -p .next/cache

# Build with comprehensive caching
RUN --mount=type=cache,id=nextjs-build,target=/app/.next/cache,sharing=locked,uid=${APP_UID},gid=${APP_GID} \
    pnpm run build:docker && \
    if [ -f ".next/analyze/client.html" ]; then \
        echo "Bundle analysis available at .next/analyze/"; \
    fi && \
    mkdir -p .next/static

# Debug: Verify standalone build output
RUN echo "=== Checking .next directory structure ===" && \
    ls -la .next/ && \
    echo "=== Checking standalone directory ===" && \
    ls -la .next/standalone/ || echo "No standalone directory found" && \
    echo "=== Checking for server.js ===" && \
    find . -name "server.js" -type f || echo "No server.js found"

# =============================================================================
# Production stage
# =============================================================================
FROM ${DISTROLESS_IMAGE} AS production

# Enhanced production environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_RUNTIME_WEBPACK=false \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=2048 --unhandled-rejections=strict --dns-result-order=ipv4first" \
    FORCE_COLOR=0 \
    NO_UPDATE_NOTIFIER=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    SHUTDOWN_TIMEOUT=30000

# Copy essential binaries
COPY --from=base --link --chmod=755 /usr/bin/dumb-init /usr/local/bin/dumb-init
COPY --from=base --link --chmod=755 /usr/bin/curl /usr/local/bin/curl

WORKDIR /app

# Copy application files
COPY --from=builder --chown=nonroot:nonroot /app/package.json ./package.json
COPY --from=builder --chown=nonroot:nonroot /app/next.config.* ./
COPY --from=builder --chown=nonroot:nonroot /app/public ./public/

# Copy Next.js build outputs
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static/

USER nonroot

EXPOSE 3000

# Robust health check with readiness probe
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health 2>/dev/null || \
        curl -f http://localhost:3000/_next/static/health.txt 2>/dev/null || \
        curl -f http://localhost:3000 2>/dev/null || exit 1

# Graceful shutdown configuration
STOPSIGNAL SIGTERM

# Better entrypoint with shutdown handling
ENTRYPOINT ["dumb-init", "--single-child", "--rewrite", "15:2", "--"]
CMD ["/nodejs/bin/node", "server.js"]

# =============================================================================
# Enhanced metadata
# =============================================================================
LABEL org.opencontainers.image.title="Vrich Next.js Application" \
      org.opencontainers.image.description="Vrich Production Ready with Next.js 15" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.authors="Cariva Development Team" \
      org.opencontainers.image.vendor="Cariva" \
      app.name="vrich-app" \
      app.version="15.x" \
      app.tier="frontend" \
      app.runtime="nodejs20" \
      app.framework="nextjs15" \
      app.security.level="production"