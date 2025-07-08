# Dockerfile for a production-ready React application

# ---- Stage 1: Build ----
# Use an official Node.js image as a builder.
# Use a specific version for reproducible builds.
FROM node:20-alpine AS builder

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies.
# Using 'ci' is faster and safer for build environments.
RUN npm ci

# Copy the rest of the application source code.
COPY . .

# Build the application for production.
# This runs `tsc && vite build` as defined in package.json.
RUN npm run build

# ---- Stage 2: Production ----
# Use a lightweight Nginx image for the production environment.
FROM nginx:1.27-alpine

# Copy the custom Nginx configuration.
# This will replace the default Nginx config.
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the startup script that generates env.js.
COPY --from=builder /app/env.sh /app/env.sh
RUN chmod +x /app/env.sh

# Copy the built static files from the 'builder' stage to the Nginx server directory.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the Nginx server.
EXPOSE 80

# The command to run when the container starts.
# It first runs our script to create the env.js file,
# and then starts the Nginx server in the foreground.
CMD ["/app/env.sh"]
