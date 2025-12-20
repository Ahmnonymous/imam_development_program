# ==============================
# PostgreSQL DB Reset Script
# ==============================

# ---- CONFIG ----
$DB_NAME     = "idp_app"
$DB_USER     = "postgres"
$DB_HOST     = "localhost"
$DB_PORT     = "5432"
$SCHEMA_FILE = "D:\WORK\LUQMAN\IDP_Project\IDP\backend\src\schema\schema.sql"

# Optional: set password once (avoid prompt)
$env:PGPASSWORD = "123456"

# ---- SAFETY CHECK ----
if (-not (Test-Path $SCHEMA_FILE)) {
    Write-Error "Schema file not found: $SCHEMA_FILE"
    exit 1
}

Write-Host "Dropping database if exists..."
dropdb `
    --if-exists `
    -h $DB_HOST `
    -p $DB_PORT `
    -U $DB_USER `
    $DB_NAME

Write-Host "Creating database..."
createdb `
    -h $DB_HOST `
    -p $DB_PORT `
    -U $DB_USER `
    $DB_NAME

Write-Host "Loading schema from schema.sql..."
psql `
    -h $DB_HOST `
    -p $DB_PORT `
    -U $DB_USER `
    -d $DB_NAME `
    -f $SCHEMA_FILE

Write-Host "✅ Database reset completed successfully."
