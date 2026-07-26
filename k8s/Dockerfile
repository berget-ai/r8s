# r8s Documentation Site
# Multi-stage build for minimal image

FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies (includes workspace packages)
RUN npm ci

# Copy workspace packages and build them
COPY packages/ ./packages/
COPY tsconfig.json ./
RUN npx tsc -b

# Copy docs package files and install docs dependencies
COPY docs/package.json docs/package-lock.json ./docs/
RUN cd docs && npm ci

# Copy docs source
COPY docs/ ./docs/

# Build the docs site (generates docs data from source, then builds)
WORKDIR /app/docs
RUN npm run build

# Production image
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/docs/dist /usr/share/nginx/html

# Copy nginx config
COPY k8s/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
