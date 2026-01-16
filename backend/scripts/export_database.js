// Database Export Script for IDP App (Node.js)
// This script exports the PostgreSQL database to a SQL dump file
// Usage: node export_database.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection details
const DB_NAME = process.env.DB_NAME || 'idp_app';
const DB_HOST = process.env.DB_HOST || process.env.DATABASE_URL?.match(/@([^:]+)/)?.[1] || 'localhost';
const DB_PORT = process.env.DB_PORT || process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1] || '5432';
const DB_USER = process.env.DB_USER || process.env.DATABASE_URL?.match(/:\/\/([^:]+)/)?.[1] || 'postgres';

// Parse DATABASE_URL if provided
let parsedHost = DB_HOST;
let parsedPort = DB_PORT;
let parsedUser = DB_USER;
let parsedPassword = '';

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    parsedHost = url.hostname;
    parsedPort = url.port || '5432';
    parsedUser = url.username;
    parsedPassword = url.password;
    const dbNameFromUrl = url.pathname.replace('/', '');
    if (dbNameFromUrl) {
      DB_NAME = dbNameFromUrl;
    }
  } catch (e) {
    console.log('Could not parse DATABASE_URL, using defaults');
  }
}

// Output file with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputFile = path.join(__dirname, `../idp_app_backup_${timestamp}.sql`);

console.log('Exporting database:', DB_NAME);
console.log('Host:', parsedHost);
console.log('Port:', parsedPort);
console.log('User:', parsedUser);
console.log('Output file:', outputFile);
console.log('');

// Build pg_dump command
let pgDumpCmd = `pg_dump -h "${parsedHost}" -p "${parsedPort}" -U "${parsedUser}" -d "${DB_NAME}"`;
pgDumpCmd += ' --no-owner --no-privileges --clean --if-exists --create --format=plain';
pgDumpCmd += ` --file="${outputFile}"`;

// Set PGPASSWORD if password is provided
const env = { ...process.env };
if (parsedPassword) {
  env.PGPASSWORD = parsedPassword;
}

// Execute pg_dump
exec(pgDumpCmd, { env }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Database export failed!');
    console.error('Error:', error.message);
    if (stderr) {
      console.error('Details:', stderr);
    }
    console.log('\nMake sure:');
    console.log('1. PostgreSQL is installed and pg_dump is in your PATH');
    console.log('2. Database connection details are correct');
    console.log('3. You have permission to access the database');
    process.exit(1);
  }

  if (stderr && !stderr.includes('WARNING')) {
    console.warn('Warnings:', stderr);
  }

  console.log('✅ Database exported successfully!');
  console.log('📁 File:', outputFile);
  console.log('');
  console.log('To import on another server, use:');
  console.log(`  psql -h <host> -p <port> -U <user> -d <database> -f ${path.basename(outputFile)}`);
  console.log('');
  console.log('Or create a new database first:');
  console.log('  createdb -h <host> -p <port> -U <user> idp_app');
  console.log(`  psql -h <host> -p <port> -U <user> -d idp_app -f ${path.basename(outputFile)}`);
});

