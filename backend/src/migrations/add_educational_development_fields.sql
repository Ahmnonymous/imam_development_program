-- Migration: Add duration, cost_south_african_rand, brochure, invoice to educational_development
-- Run this on existing databases after schema.sql

ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS duration_course VARCHAR(255);
ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS cost_south_african_rand DECIMAL(12,2);
ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS brochure BYTEA;
ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS brochure_filename VARCHAR(255);
ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS brochure_mime VARCHAR(255);
ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS brochure_size INT;
ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS invoice BYTEA;
ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS invoice_filename VARCHAR(255);
ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS invoice_mime VARCHAR(255);
ALTER TABLE educational_development ADD COLUMN IF NOT EXISTS invoice_size INT;
