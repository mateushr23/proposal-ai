FROM node:22-alpine AS base
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source
COPY src/ ./src/

# Expose and run
EXPOSE 3001
CMD ["node", "src/index.js"]
