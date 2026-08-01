# r8s Documentation Site
# Multi-stage build for minimal image

FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies (includes workspace packages)
RUN npm ci

# Copy workspace packages, tsconfig, and docs package.json (needed for dep extraction)
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
