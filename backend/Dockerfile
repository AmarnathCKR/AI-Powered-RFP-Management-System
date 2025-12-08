# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json + lock file first to optimize caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build your app
RUN npm run build


# -----------------------
# Production Stage
# -----------------------
FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy build output from first stage
COPY --from=build /app/dist ./dist

# Expose port (change if your app runs on another port)
EXPOSE 4000

# Start the app
CMD ["npm", "run", "start"]
