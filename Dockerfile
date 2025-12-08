# ---------- Build stage ----------
FROM node:22.21.1 AS builder

WORKDIR /app

# Copy backend package files and install deps
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source and build
COPY backend ./backend
RUN npm run build


# ---------- Runtime stage ----------
FROM node:22.21.1

WORKDIR /app/backend

# Copy just what we need from builder
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

# App listens on 4000 (same as your local logs)
EXPOSE 4000

# Start exactly like `npm start` locally
CMD ["npm", "run", "start"]
