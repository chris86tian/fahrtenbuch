#!/bin/bash

# This script generates env.js with runtime environment variables
# It's used in production to inject environment variables into the browser

TARGET_DIR=${1:-dist}

cat > "$TARGET_DIR/env.js" << EOF
// Runtime environment variables injected by env.sh
window.ENV = {
  VITE_SUPABASE_URL: '${VITE_SUPABASE_URL:-https://supabase.lipahub.de}',
  VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdGZmZ2Rramp3cGRtbXBqcnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1ODM1MTAsImV4cCI6MjA2MTE1OTUxMH0.wZz2OxFQsSs-ESGGehxqyVUYJ9TXBnd9C_UDMQpTEuw}'
};
EOF

echo "Environment variables injected into $TARGET_DIR/env.js"
