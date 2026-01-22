-- ============================================================
-- Cleanup Script: Remove Test Imam Users and Imam Profile Data
-- ============================================================
-- This script will:
-- 1. Delete all data from imam profile detail tables
-- 2. Delete all data from Imam_Profiles master table
-- 3. Delete all test imam users (User_Type = 6), keeping only one App Admin (User_Type = 1)
-- ============================================================

BEGIN;

-- Step 1: Delete all detail table records (these will cascade, but being explicit)
DELETE FROM Jumuah_Khutbah_Topic;
DELETE FROM Jumuah_Audio_Khutbah;
DELETE FROM Pearls_Of_Wisdom;
DELETE FROM Medical_Reimbursement;
DELETE FROM Community_Engagement;
DELETE FROM Nikah_Bonus;
DELETE FROM New_Muslim_Bonus;
DELETE FROM New_Baby_Bonus;
DELETE FROM Imam_Relationships;
DELETE FROM borehole;
DELETE FROM borehole_construction_tasks;
DELETE FROM borehole_repairs_matrix;
DELETE FROM imam_financial_assistance;
DELETE FROM educational_development;
DELETE FROM tree_planting;
DELETE FROM waqf_loan;
DELETE FROM hardship_relief;
DELETE FROM higher_education_request;
DELETE FROM tickets WHERE imam_profile_id IS NOT NULL;

-- Step 2: Delete all Imam Profiles
DELETE FROM Imam_Profiles;

-- Step 3: Delete all Imam Users (User_Type = 6), but keep one App Admin (User_Type = 1)
-- Keep the first App Admin user (usually the one with username 'admin')
DELETE FROM Employee 
WHERE User_Type = 6;

-- Optional: If you want to keep only ONE specific App Admin user, uncomment and modify:
-- DELETE FROM Employee 
-- WHERE User_Type = 1 
-- AND Username != 'admin';

-- Verify what remains
SELECT 
    'Remaining Users' as info,
    COUNT(*) as count,
    STRING_AGG(Username, ', ') as usernames
FROM Employee
WHERE User_Type = 1;

SELECT 
    'Remaining Imam Profiles' as info,
    COUNT(*) as count
FROM Imam_Profiles;

COMMIT;

-- ============================================================
-- Rollback if needed: ROLLBACK;
-- ============================================================

