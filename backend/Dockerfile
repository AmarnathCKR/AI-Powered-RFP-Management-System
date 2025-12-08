# ---------- Build stage ----------
FROM node:22.21.1 AS builder

WORKDIR /app

# Install deps using package.json + package-lock.json
COPY package*.json ./
RUN npm install

# Copy source code and build TS -> dist
COPY . .
RUN npm run build


# ---------- Runtime stage ----------
FROM node:22.21.1

WORKDIR /app

# Only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# If you need extra non-TS assets at runtime, copy them too:
# COPY --from=builder /app/some-folder ./some-folder

# App listens on 4000 (like your local log)
EXPOSE 4000

# Start exactly like `npm start` on your machine
CMD ["npm", "run", "start"]
