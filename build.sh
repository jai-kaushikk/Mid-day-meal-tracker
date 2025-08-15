#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Build Frontend ---
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# --- Prepare Backend ---
echo "Preparing backend..."
cd backend
go mod tidy
cd ..

echo "Build finished successfully!"