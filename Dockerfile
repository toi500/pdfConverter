# Use Node.js 18 as the base image
FROM node:18-slim

# Install dependencies needed for font verification and health checks
RUN apt-get update && apt-get install -y \
    file \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY src ./src
COPY tsconfig.json ./

# Create necessary directories for the application
RUN mkdir -p public/pdfs /app/fonts

# Copy local fonts into the Docker image
COPY fonts /app/fonts/

# Verify copied fonts
RUN echo "Listing /app/fonts directory:" && \
    ls -l /app/fonts && \
    echo "Checking font file types in /app/fonts:" && \
    file /app/fonts/*.ttf

# Build TypeScript code
RUN npm run build

# Expose the port defined in the .env or default
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
