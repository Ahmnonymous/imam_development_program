#!/bin/bash

# Database Export Script for IDP App
# This script exports the PostgreSQL database to a SQL dump file

# Database name
DB_NAME="idp_app"

# Get database connection details from environment or use defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"

# Output file with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="idp_app_backup_${TIMESTAMP}.sql"

echo "Exporting database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_USER"
echo "Output file: $OUTPUT_FILE"
echo ""

# Export database
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --create \
  --format=plain \
  --file="$OUTPUT_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Database exported successfully!"
  echo "📁 File: $OUTPUT_FILE"
  echo ""
  echo "To import on another server, use:"
  echo "  psql -h <host> -p <port> -U <user> -d <database> -f $OUTPUT_FILE"
  echo ""
  echo "Or create a new database first:"
  echo "  createdb -h <host> -p <port> -U <user> idp_app"
  echo "  psql -h <host> -p <port> -U <user> -d idp_app -f $OUTPUT_FILE"
else
  echo ""
  echo "❌ Database export failed!"
  exit 1
fi

