#!/bin/bash
# Build script for Azure Static Web Apps

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
npm ci

# Run build
npm run build
