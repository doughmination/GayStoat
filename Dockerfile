# Copyright (c) 2026 Clove Twilight
# Licensed under the ESAL-1.3 Licence.
# See LICENCE in the project root for full licence information.

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm install -g @dotenvx/dotenvx

COPY --from=builder /app/dist ./dist

RUN adduser -D -u 1001 botuser && \
    mkdir -p /app/.logs && \
    chown -R botuser:botuser /app

USER botuser

CMD ["dotenvx", "run", "--", "npm", "start"]
