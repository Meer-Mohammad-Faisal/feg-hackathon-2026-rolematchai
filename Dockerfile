# Multi-stage build for SessionIQ Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm run build

# Production backend image
FROM node:20-alpine AS backend

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=backend-builder /app/backend/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]

# Frontend build stage
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/tsconfig.json ./
COPY frontend/next.config.ts ./
COPY frontend/src ./src
COPY frontend/public ./public

RUN npm run build

# Production frontend image
FROM node:20-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --only=production

COPY --from=frontend-builder /app/frontend/.next ./.next
COPY --from=frontend-builder /app/frontend/public ./public
COPY frontend/next.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]
