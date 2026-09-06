# syntax=docker/dockerfile:1
# (parser directive pinned to the stable dockerfile:1 frontend for the
# --parents flag in the COPY below; the dockerfile must start with it or
# it is ignored — older bundled frontends flatten glob matches into a
# single file, which survives only as a basename)

# r8s Documentation Site
# Multi-stage build for minimal image

FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files + every workspace manifest, keeping the
# packages/<name>/ structure (--parents: a plain multi-file COPY flattens
# matches into one file in the destination). npm ci needs the workspace
# package.jsons present to link the workspaces — without them no @r8s/*
# symlinks exist in node_modules and bare-specifier imports that lack a
# tsconfig paths entry (e.g. @r8s/operator-nginx-ingress) fail with TS2307.
COPY --parents package.json package-lock.json packages/*/package.json ./

# Install root dependencies (includes workspace packages)
RUN npm ci

# Copy the full workspace sources, tsconfig, and docs package.json (needed
# for dep extraction). Source-only changes don't bust the npm ci layer.
COPY packages/ ./packages/
COPY tsconfig.json ./
COPY docs/package.json ./docs/

# Build only the packages that docs depends on (derived from docs/package.json).
# cli and r8s-controller are excluded — they have runtime deps not needed for docs.
# Package list is extracted from docs/package.json @r8s/* dependencies.
RUN PACKAGES=$(node -e " \
  const deps = require('./docs/package.json').dependencies; \
  const pkgs = Object.keys(deps).filter(d => d.startsWith('@r8s/')).map(d => 'packages/' + d.replace('@r8s/', '')); \
  console.log(pkgs.join(' ')) \
") && npx tsc -b $PACKAGES

# Install docs dependencies
COPY docs/package-lock.json ./docs/
RUN cd docs && npm ci

# Copy docs source
COPY docs/ ./docs/

# Build the docs site (generates docs data from source, then builds)
WORKDIR /app/docs
RUN npm run build

# Production image
FROM nginx:alpine

# Copy built assets — all pages are prerendered to static HTML at build
# time (vike prerender), so dist/client is a complete static site and no
# Node SSR runtime is needed.
COPY --from=builder /app/docs/dist/client /usr/share/nginx/html

# Copy nginx config
COPY k8s/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
