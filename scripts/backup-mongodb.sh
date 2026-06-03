#!/bin/bash

# ==============================================================================
# Database Backup Automation Script for StockVibe Platform
# ==============================================================================

set -e

BACKUP_DIR="/home/ubuntu/app/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="stockvibe_backup_$TIMESTAMP"
RETENTION_DAYS=7

# Load variables if .env exists
if [ -f "/home/ubuntu/app/.env" ]; then
  export $(cat /home/ubuntu/app/.env | xargs)
fi

# Determine connection URI
MONGO_URI=${MONGODB_URI:-"mongodb://localhost:27017/inventory_db"}

echo "=== Initializing database snapshot: $BACKUP_NAME ==="
mkdir -p "$BACKUP_DIR"

# Perform mongodump using the mongo image container
docker run --rm --network stockvibe_network \
  -v "$BACKUP_DIR:/backup" \
  mongo:6.0 \
  mongodump --uri="$MONGO_URI" --archive="/backup/$BACKUP_NAME.gz" --gzip

echo "=== Backup completed: $BACKUP_DIR/$BACKUP_NAME.gz ==="

# Pruning backups older than retention period
echo "=== Purging snapshots older than $RETENTION_DAYS days ==="
find "$BACKUP_DIR" -type f -name "stockvibe_backup_*.gz" -mtime +$RETENTION_DAYS -delete
echo "=== Purge complete ==="
