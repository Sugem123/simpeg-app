FROM node:20-alpine AS builder

WORKDIR /app

ARG BACKEND_INTERNAL_URL=http://simpeg-backend:8000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

# Copy package files
COPY package.json bun.lock* package-lock.json* yarn.lock* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy project
COPY . .

# Build
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
