-- Migration: Add lookup tables for Borehole module
-- This migration creates lookup tables and updates the borehole table to use them

-- ============================================================
-- CREATE LOOKUP TABLES
-- ============================================================

-- Borehole Location Lookup (Where is the borehole required?)
CREATE TABLE IF NOT EXISTS Borehole_Location (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default borehole locations
INSERT INTO Borehole_Location (Name, Created_By, Updated_By)
VALUES 
    ('Masjid', 'system', 'system'),
    ('Madrasah', 'system', 'system'),
    ('Community Centre', 'system', 'system'),
    ('School', 'system', 'system'),
    ('Residential Area', 'system', 'system'),
    ('Other', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Water Source Lookup (What is the current source of water in your area?)
CREATE TABLE IF NOT EXISTS Water_Source (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default water sources
INSERT INTO Water_Source (Name, Created_By, Updated_By)
VALUES 
    ('Municipal Water', 'system', 'system'),
    ('Borehole', 'system', 'system'),
    ('Well', 'system', 'system'),
    ('River/Stream', 'system', 'system'),
    ('Rainwater Collection', 'system', 'system'),
    ('Water Tanker/Truck', 'system', 'system'),
    ('Other', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Water Usage Purpose Lookup (What will the water be used for?)
CREATE TABLE IF NOT EXISTS Water_Usage_Purpose (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default water usage purposes
INSERT INTO Water_Usage_Purpose (Name, Created_By, Updated_By)
VALUES 
    ('Domestic (Cooking, Bathing and washing)', 'system', 'system'),
    ('Agricultural', 'system', 'system'),
    ('Community (Schools, community centres)', 'system', 'system'),
    ('Masjid (Wudhu, maintenace etc)', 'system', 'system'),
    ('Sanitation (Toilets)', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- ============================================================
-- CREATE JUNCTION TABLE FOR MANY-TO-MANY RELATIONSHIP
-- ============================================================

-- Junction table for many-to-many relationship: Borehole to Water Usage Purposes
CREATE TABLE IF NOT EXISTS Borehole_Water_Usage_Purpose (
    ID BIGSERIAL PRIMARY KEY,
    borehole_id BIGINT NOT NULL,
    water_usage_purpose_id BIGINT NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_borehole_water_usage_borehole FOREIGN KEY (borehole_id) REFERENCES borehole(ID) ON DELETE CASCADE,
    CONSTRAINT fk_borehole_water_usage_purpose FOREIGN KEY (water_usage_purpose_id) REFERENCES Water_Usage_Purpose(ID) ON DELETE CASCADE,
    CONSTRAINT uq_borehole_water_usage UNIQUE (borehole_id, water_usage_purpose_id)
);

-- Create indexes for junction table
CREATE INDEX IF NOT EXISTS idx_borehole_water_usage_borehole ON Borehole_Water_Usage_Purpose(borehole_id);
CREATE INDEX IF NOT EXISTS idx_borehole_water_usage_purpose ON Borehole_Water_Usage_Purpose(water_usage_purpose_id);

-- ============================================================
-- UPDATE BOREHOLE TABLE
-- ============================================================

-- Add new columns for lookup foreign keys (if they don't exist)
DO $$
BEGIN
    -- Add where_required_lookup_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borehole' AND column_name = 'where_required_lookup_id') THEN
        ALTER TABLE borehole ADD COLUMN where_required_lookup_id BIGINT;
    END IF;
    
    -- Add current_water_source_lookup_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borehole' AND column_name = 'current_water_source_lookup_id') THEN
        ALTER TABLE borehole ADD COLUMN current_water_source_lookup_id BIGINT;
    END IF;
END $$;

-- Migrate existing data: Convert VARCHAR where_required to lookup ID
-- Note: This is a data migration step - you may need to manually map existing values
-- For now, we'll keep both columns and you can migrate data manually

-- Drop old VARCHAR column and rename lookup column (uncomment after data migration)
-- ALTER TABLE borehole DROP COLUMN IF EXISTS where_required;
-- ALTER TABLE borehole RENAME COLUMN where_required_lookup_id TO where_required;

-- Drop old VARCHAR column and rename lookup column for current_water_source (uncomment after data migration)
-- ALTER TABLE borehole DROP COLUMN IF EXISTS current_water_source;
-- ALTER TABLE borehole RENAME COLUMN current_water_source_lookup_id TO current_water_source;

-- Remove water_usage_purposes TEXT column (uncomment after data migration to junction table)
-- ALTER TABLE borehole DROP COLUMN IF EXISTS water_usage_purposes;

-- Add foreign key constraints
ALTER TABLE borehole 
    DROP CONSTRAINT IF EXISTS fk_borehole_location,
    ADD CONSTRAINT fk_borehole_location FOREIGN KEY (where_required) REFERENCES Borehole_Location(ID);

ALTER TABLE borehole 
    DROP CONSTRAINT IF EXISTS fk_borehole_water_source,
    ADD CONSTRAINT fk_borehole_water_source FOREIGN KEY (current_water_source) REFERENCES Water_Source(ID);

-- ============================================================
-- NOTES
-- ============================================================
-- 1. Run this migration script against your database
-- 2. After running, you may need to manually migrate existing data:
--    - Map existing where_required VARCHAR values to Borehole_Location IDs
--    - Map existing current_water_source VARCHAR values to Water_Source IDs
--    - Migrate existing water_usage_purposes TEXT (comma-separated) to Borehole_Water_Usage_Purpose junction table
-- 3. Once data is migrated, uncomment the DROP COLUMN statements above
-- 4. The lookup tables are now available in the Lookup Setup page

