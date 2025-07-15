#!/usr/bin/env bash
# Script that runs during the build process on Render

# Exit on error
set -e

# Install dependencies
npm install

# Run database setup script
echo "Setting up database..."
node scripts/setup-db.js

echo "Build completed successfully!"
