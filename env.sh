#!/bin/sh
# env.sh - Generates a JavaScript file with runtime environment variables.

# The output directory for env.js. Expects 'dist' as an argument.
OUTPUT_DIR=$1
if [ -z "$OUTPUT_DIR" ]; then
  echo "Error: Output directory not specified." >&amp;2
  echo "Usage: $0 <output_directory>" >&amp;2
  exit 1
fi

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
  # Use sed to properly escape double quotes inside the value
  varvalue=$(echo "$line" | cut -d '=' -f 2- | sed 's/"/\\"/g')
  # Add the variable to the JS object
  echo "  $varname: \"$varvalue\"," >> "$ENV_FILE"
done

echo "}" >> "$ENV_FILE"

echo "✅ Runtime config created at $ENV_FILE"
