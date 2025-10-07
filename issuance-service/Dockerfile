# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
RUN mkdir -p /data
VOLUME ["/data"]
ENV DATA_DIR=/data
EXPOSE 3001
CMD ["node", "dist/index.js"]
