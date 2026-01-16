-- ============================================================
-- Migration Script: Add Unique Constraint on Email for Imam_Profiles
-- ============================================================
-- This script adds a unique constraint on the Email column in the Imam_Profiles table
-- It first checks for duplicate emails and provides a report before applying the constraint
-- ============================================================

DO $$
DECLARE
    duplicate_count INTEGER;
    duplicate_emails TEXT;
BEGIN
    -- Step 1: Check if the constraint already exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Imam_Profiles' 
        AND constraint_name = 'uq_imam_email' 
        AND table_schema = current_schema()
    ) THEN
        RAISE NOTICE 'Unique constraint uq_imam_email already exists on Imam_Profiles.Email';
        RETURN;
    END IF;

    -- Step 2: Check for duplicate emails (excluding NULL values)
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT Email, COUNT(*) as cnt
        FROM Imam_Profiles 
        WHERE Email IS NOT NULL 
        GROUP BY Email 
        HAVING COUNT(*) > 1
    ) duplicates;

    -- Step 3: If duplicates exist, report them and abort
    IF duplicate_count > 0 THEN
        -- Collect duplicate email addresses for reporting
        SELECT string_agg(DISTINCT Email, ', ') INTO duplicate_emails
        FROM (
            SELECT Email
            FROM Imam_Profiles 
            WHERE Email IS NOT NULL 
            GROUP BY Email 
            HAVING COUNT(*) > 1
        ) dup_emails;

        RAISE EXCEPTION 'Cannot add unique constraint: Found % duplicate email(s) in Imam_Profiles. Duplicate emails: %. Please resolve duplicates before adding the constraint.', 
            duplicate_count, 
            COALESCE(duplicate_emails, 'N/A');
    END IF;

    -- Step 4: Add the unique constraint
    ALTER TABLE Imam_Profiles 
    ADD CONSTRAINT uq_imam_email UNIQUE (Email);

    RAISE NOTICE 'Successfully added unique constraint uq_imam_email on Imam_Profiles.Email';
END $$;

-- ============================================================
-- Verification Query (run separately to check constraint exists)
-- ============================================================
-- SELECT 
--     constraint_name, 
--     table_name, 
--     column_name
-- FROM information_schema.constraint_column_usage
-- WHERE table_name = 'Imam_Profiles' 
--     AND constraint_name = 'uq_imam_email';

-- ============================================================
-- Query to find duplicates (run before migration if needed)
-- ============================================================
-- SELECT 
--     Email, 
--     COUNT(*) as duplicate_count,
--     string_agg(id::text, ', ') as profile_ids
-- FROM Imam_Profiles 
-- WHERE Email IS NOT NULL 
-- GROUP BY Email 
-- HAVING COUNT(*) > 1
-- ORDER BY duplicate_count DESC;

