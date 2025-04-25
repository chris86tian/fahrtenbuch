#!/bin/sh
set -e

echo "Starting Fahrtenbuch application..."
echo "Checking nginx configuration..."
nginx -t

echo "Starting nginx..."
exec "$@"
