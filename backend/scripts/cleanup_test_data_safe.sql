-- ============================================================
-- SAFE Cleanup Script: Preview and Remove Test Imam Users and Imam Profile Data
-- ============================================================
-- This script will:
-- 1. Show what will be deleted (PREVIEW)
-- 2. Delete all data from imam profile detail tables
-- 3. Delete all data from Imam_Profiles master table
-- 4. Delete all test imam users (User_Type = 6), keeping only App Admin users (User_Type = 1)
-- ============================================================

-- ============================================================
-- STEP 0: PREVIEW - See what will be deleted
-- ============================================================

SELECT '=== PREVIEW: What will be deleted ===' as info;

-- Count detail records
SELECT 'Jumuah_Khutbah_Topic' as table_name, COUNT(*) as records FROM Jumuah_Khutbah_Topic
UNION ALL
SELECT 'Jumuah_Audio_Khutbah', COUNT(*) FROM Jumuah_Audio_Khutbah
UNION ALL
SELECT 'Pearls_Of_Wisdom', COUNT(*) FROM Pearls_Of_Wisdom
UNION ALL
SELECT 'Medical_Reimbursement', COUNT(*) FROM Medical_Reimbursement
UNION ALL
SELECT 'Community_Engagement', COUNT(*) FROM Community_Engagement
UNION ALL
SELECT 'Nikah_Bonus', COUNT(*) FROM Nikah_Bonus
UNION ALL
SELECT 'New_Muslim_Bonus', COUNT(*) FROM New_Muslim_Bonus
UNION ALL
SELECT 'New_Baby_Bonus', COUNT(*) FROM New_Baby_Bonus
UNION ALL
SELECT 'Imam_Relationships', COUNT(*) FROM Imam_Relationships
UNION ALL
SELECT 'borehole', COUNT(*) FROM borehole
UNION ALL
SELECT 'borehole_construction_tasks', COUNT(*) FROM borehole_construction_tasks
UNION ALL
SELECT 'borehole_repairs_matrix', COUNT(*) FROM borehole_repairs_matrix
UNION ALL
SELECT 'imam_financial_assistance', COUNT(*) FROM imam_financial_assistance
UNION ALL
SELECT 'educational_development', COUNT(*) FROM educational_development
UNION ALL
SELECT 'tree_planting', COUNT(*) FROM tree_planting
UNION ALL
SELECT 'waqf_loan', COUNT(*) FROM waqf_loan
UNION ALL
SELECT 'hardship_relief', COUNT(*) FROM hardship_relief
UNION ALL
SELECT 'higher_education_request', COUNT(*) FROM higher_education_request
UNION ALL
SELECT 'tickets (imam related)', COUNT(*) FROM tickets WHERE imam_profile_id IS NOT NULL;

-- Count Imam Profiles
SELECT '=== Imam Profiles to be deleted ===' as info;
SELECT COUNT(*) as total_imam_profiles FROM Imam_Profiles;
SELECT ID, Name, Surname, Email, File_Number FROM Imam_Profiles LIMIT 10;

-- Count Imam Users to be deleted
SELECT '=== Imam Users to be deleted ===' as info;
SELECT COUNT(*) as total_imam_users FROM Employee WHERE User_Type = 6;
SELECT ID, Name, Surname, Username, Email FROM Employee WHERE User_Type = 6 LIMIT 10;

-- Show App Admin users that will be kept
SELECT '=== App Admin users that will be KEPT ===' as info;
SELECT ID, Name, Surname, Username, Email FROM Employee WHERE User_Type = 1;

-- ============================================================
-- UNCOMMENT THE SECTION BELOW TO EXECUTE THE DELETION
-- ============================================================

/*
BEGIN;

-- Step 1: Delete all detail table records
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

-- Step 3: Delete all Imam Users (User_Type = 6)
DELETE FROM Employee WHERE User_Type = 6;

COMMIT;

-- Verify cleanup
SELECT '=== Cleanup Complete ===' as info;
SELECT 'Remaining App Admin Users' as info, COUNT(*) as count FROM Employee WHERE User_Type = 1;
SELECT 'Remaining Imam Profiles' as info, COUNT(*) as count FROM Imam_Profiles;
SELECT 'Remaining Imam Users' as info, COUNT(*) as count FROM Employee WHERE User_Type = 6;
*/

