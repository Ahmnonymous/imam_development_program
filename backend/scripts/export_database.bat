@echo off
REM Database Export Script for IDP App (Windows)
REM This script exports the PostgreSQL database to a SQL dump file

REM Database name
set DB_NAME=idp_app

REM Get database connection details from environment or use defaults
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432
if "%DB_USER%"=="" set DB_USER=postgres

REM Output file with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%
set OUTPUT_FILE=idp_app_backup_%TIMESTAMP%.sql

echo Exporting database: %DB_NAME%
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo User: %DB_USER%
echo Output file: %OUTPUT_FILE%
echo.

REM Export database
pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --no-owner --no-privileges --clean --if-exists --create --format=plain --file=%OUTPUT_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Database exported successfully!
    echo File: %OUTPUT_FILE%
    echo.
    echo To import on another server, use:
    echo   psql -h ^<host^> -p ^<port^> -U ^<user^> -d ^<database^> -f %OUTPUT_FILE%
    echo.
    echo Or create a new database first:
    echo   createdb -h ^<host^> -p ^<port^> -U ^<user^> idp_app
    echo   psql -h ^<host^> -p ^<port^> -U ^<user^> -d idp_app -f %OUTPUT_FILE%
) else (
    echo.
    echo Database export failed!
    exit /b 1
)

pause

