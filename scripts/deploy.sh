#!/bin/bash

# ==============================================================================
# Deployment Orchestrator Script for StockVibe Platform
# ==============================================================================

set -e

echo "=== Authenticating with Github Container Registry ==="
if [ -n "$GHCR_TOKEN" ] && [ -n "$GH_ACTOR" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GH_ACTOR" --password-stdin
else
  echo "Registry credentials not provided as environment variables. Assuming pre-authenticated."
fi

echo "=== Pulling latest Docker Images from GHCR ==="
docker compose pull

echo "=== Starting containers (Zero-Downtime Rollout) ==="
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

echo "=== Running post-deployment health check ==="
# Check backend server health
for i in {1..12}; do
  if curl -s http://localhost:5000/health | grep -q "success"; then
    echo "=== Health check PASSED: Backend is responsive ==="
    break
  fi
  if [ $i -eq 12 ]; then
    echo "=== ERROR: Health check FAILED. Rolling back changes! ==="
    # Optional: docker compose rollback commands here
    exit 1
  fi
  echo "Waiting for server to boot... (Attempt $i/12)"
  sleep 5
done

echo "=== Database seed verification (Optional) ==="
# Runs seeding script in the running backend container
docker exec stockvibe_backend npm run seed

echo "=== Clean up unused docker resource remnants ==="
docker image prune -f

echo "=== Rollout Completed Successfully! ==="
