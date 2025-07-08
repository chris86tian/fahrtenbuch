#!/bin/sh
# env.sh - Generates a JavaScript file with runtime environment variables.

# The output directory for env.js. Defaults to the Nginx web root.
# This allows us to pass 'dist' as an argument for local preview.
OUTPUT_DIR=${1:-/usr/share/nginx/html}
ENV_FILE="$OUTPUT_DIR/env.js"

# Ensure the output directory exists
mkdir -p "$OUTPUT_DIR"

# Start the env.js file
echo "window.env = {" > "$ENV_FILE"

# Grep for all environment variables starting with VITE_ and append them
# to the window.env object in the env.js file.
env | grep ^VITE_ | while read -r line; do
  # Split variable into name and value
  varname=$(echo "$line" | cut -d '=' -f 1)
  varvalue=$(echo "$line" | cut -d '=' -f 2-)
  # Add the variable to the JS object
  echo "  $varname: \"$varvalue\"," >> "$ENV_FILE"
done

echo "}" >> "$ENV_FILE"

echo "✅ Runtime config created at $ENV_FILE"

# If the second argument is 'start_nginx', execute nginx.
# This is used by the Docker container's CMD.
if [ "$2" = "start_nginx" ]; then
  echo "🚀 Starting Nginx server..."
  # Use 'exec' to make Nginx the main process, which is crucial for
  # proper signal handling and graceful shutdowns in Docker.
  exec nginx -g 'daemon off;'
fi
