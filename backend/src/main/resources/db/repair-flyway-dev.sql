-- Flyway Repair Script for Development
-- This script manually updates the Flyway schema history table to fix checksum mismatches
--
-- ⚠️ WARNING: Only run this in DEVELOPMENT environment!
-- ⚠️ DO NOT run this in production unless you understand the consequences
--
-- This will update the checksum for migration V3 to match your local file

-- First, let's see what's in the flyway_schema_history table
SELECT
    version,
    description,
    type,
    script,
    checksum,
    installed_on,
    success
FROM flyway_schema_history
ORDER BY installed_rank;

-- To fix the checksum mismatch for V3, you have two options:

-- OPTION 1: Update the checksum to match the local file
-- Run this if you intentionally modified V3 and want to update the database record
-- UPDATE flyway_schema_history
-- SET checksum = -108703863
-- WHERE version = '3';

-- OPTION 2: Delete the V3 entry and let Flyway re-run it
-- WARNING: This might fail if the migration has already created tables/columns
-- DELETE FROM flyway_schema_history WHERE version = '3';

-- After running one of the above options, restart your application

-- BEST PRACTICE for future:
-- Never modify migration files that have already been applied!
-- Create new migration files (V4, V5, etc.) for any changes