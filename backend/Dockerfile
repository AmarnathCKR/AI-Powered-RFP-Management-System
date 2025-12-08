# Stage 1 — Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files first
COPY package*.json ./
RUN npm install

# Copy entire project
COPY . .
RUN npm run build


# Stage 2 — Production Stage
FROM node:18-alpine

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built output
COPY --from=builder /app/dist ./dist

# Expose backend port
EXPOSE 4000

# Start compiled app
CMD ["npm", "run", "start"]
