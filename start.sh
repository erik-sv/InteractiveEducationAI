#!/bin/sh
set -e

# Start Nginx in the background
nginx -g 'daemon off;' &

# Start Next.js (assumes build is already done)
npm run start
