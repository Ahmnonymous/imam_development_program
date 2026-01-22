-- ============================================================
-- ALTER QUERY: Add audio_created_date to Jumuah_Audio_Khutbah
-- ============================================================
-- This query adds the audio_created_date field to the Jumuah_Audio_Khutbah table
-- Run this query separately to add the field to an existing database

ALTER TABLE Jumuah_Audio_Khutbah 
ADD COLUMN IF NOT EXISTS audio_created_date DATE;

-- Optional: Add a comment to document the field
COMMENT ON COLUMN Jumuah_Audio_Khutbah.audio_created_date IS 'Date when the audio was created';

