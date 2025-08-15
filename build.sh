#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Install Go ---
echo "Installing Go..."
GO_VERSION="1.21.5"
curl -L -o go.tar.gz "https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz"
tar -C /tmp -xzf go.tar.gz
export PATH="/tmp/go/bin:$PATH"
echo "Go installation complete. Version: $(go version)"

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

# --- Move Frontend Build to Vercel's Default Output Directory ---
echo "Moving frontend build to /public directory..."
mkdir -p public
mv frontend/build/* public/

echo "Build finished successfully!"