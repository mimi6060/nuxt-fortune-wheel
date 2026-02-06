# Nuxt Fortune Wheel - Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies for Prisma and build tools
RUN apk add --no-cache openssl libc6-compat

# Copy root package files
COPY package*.json ./
COPY playground/package*.json ./playground/

# Install root dependencies
RUN npm install --legacy-peer-deps

# Copy playground dependencies separately
WORKDIR /app/playground
RUN npm install --legacy-peer-deps

# Back to root
WORKDIR /app

# Copy all source files
COPY . .

# Generate Prisma client (needs fake DATABASE_URL for validation)
WORKDIR /app/playground
RUN DATABASE_URL="postgresql://fake:fake@localhost:5432/fake" npx prisma generate

# Prepare the Nuxt module
WORKDIR /app
RUN npm run dev:prepare

# Expose the port
EXPOSE 3000

# Set working directory for runtime
WORKDIR /app

# Start the development server
CMD ["npm", "run", "dev"]
