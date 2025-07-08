#!/bin/sh
# env.sh - Generates env.js for runtime environment variables and starts nginx.

# The directory where Vite places the built static files.
# Nixpacks/Docker usually runs from /app, so this path should be relative to it.
BUILD_DIR=./dist

# Create the env.js file. This file will be served by Nginx.
# It creates a global window.ENV object for the frontend to use.
echo "window.ENV = {" > ${BUILD_DIR}/env.js
echo "  VITE_SUPABASE_URL: '${VITE_SUPABASE_URL}'," >> ${BUILD_DIR}/env.js
echo "  VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY}'" >> ${BUILD_DIR}/env.js
echo "};" >> ${BUILD_DIR}/env.js

echo "✅ Successfully created ${BUILD_DIR}/env.js"

# Start Nginx in the foreground.
# This is the standard command for running Nginx in a Docker container.
# 'exec' ensures that Nginx becomes the main process (PID 1),
# which is important for proper signal handling.
echo "🚀 Starting Nginx..."
exec nginx -g 'daemon off;'
