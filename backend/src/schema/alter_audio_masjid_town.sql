-- ============================================================
-- ALTER QUERY: Add masjid_name and town to Jumuah_Audio_Khutbah
-- ============================================================
-- This query adds the masjid_name and town fields to the Jumuah_Audio_Khutbah table
-- Run this query separately to add the fields to an existing database

-- ============================================================
-- ALTER QUERY: Add audio_created_date to Jumuah_Audio_Khutbah
-- ============================================================
-- This query adds the audio_created_date field to the Jumuah_Audio_Khutbah table
-- Run this query separately to add the field to an existing database

ALTER TABLE Jumuah_Audio_Khutbah 
ADD COLUMN IF NOT EXISTS audio_created_date DATE;

-- Optional: Add a comment to document the field
COMMENT ON COLUMN Jumuah_Audio_Khutbah.audio_created_date IS 'Date when the audio was created';


-- Add masjid_name column
ALTER TABLE Jumuah_Audio_Khutbah 
ADD COLUMN IF NOT EXISTS masjid_name VARCHAR(255);

-- Add town column
ALTER TABLE Jumuah_Audio_Khutbah 
ADD COLUMN IF NOT EXISTS town BIGINT;

-- Add foreign key constraint for town
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_audio_town' 
        AND table_name = 'jumuah_audio_khutbah'
    ) THEN
        ALTER TABLE Jumuah_Audio_Khutbah 
        ADD CONSTRAINT fk_audio_town FOREIGN KEY (town) REFERENCES Suburb(ID);
    END IF;
END $$;

-- Optional: Add comments to document the fields
COMMENT ON COLUMN Jumuah_Audio_Khutbah.masjid_name IS 'Name of the masjid where the khutbah was delivered';
COMMENT ON COLUMN Jumuah_Audio_Khutbah.town IS 'Town/Suburb where the masjid is located (references Suburb table)';

-- New_Baby_Bonus: Add gender column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'new_baby_bonus') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'new_baby_bonus' AND column_name = 'gender') THEN
            ALTER TABLE New_Baby_Bonus 
            ADD COLUMN gender BIGINT,
            ADD CONSTRAINT fk_baby_bonus_gender FOREIGN KEY (gender) REFERENCES Gender(ID);
        END IF;
    END IF;
END $$;

-- New_Baby_Bonus: Add identification number column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'new_baby_bonus') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'new_baby_bonus' AND column_name = 'identification_number') THEN
            ALTER TABLE New_Baby_Bonus 
            ADD COLUMN identification_number VARCHAR(255);
        END IF;
    END IF;
END $$;

-- New_Baby_Bonus: Change spouse_name to foreign key lookup to Imam_Relationships (husband/wife only)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'new_baby_bonus') THEN
        -- First, add the new foreign key column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'new_baby_bonus' AND column_name = 'spouse_relationship_id') THEN
            ALTER TABLE New_Baby_Bonus 
            ADD COLUMN spouse_relationship_id BIGINT;
            
            -- Add foreign key constraint
            ALTER TABLE New_Baby_Bonus 
            ADD CONSTRAINT fk_baby_bonus_spouse_relationship FOREIGN KEY (spouse_relationship_id) REFERENCES Imam_Relationships(ID) ON DELETE SET NULL;
            
            -- Create index for performance
            CREATE INDEX IF NOT EXISTS idx_baby_bonus_spouse_relationship ON New_Baby_Bonus(spouse_relationship_id);
        END IF;
        
        -- Note: The old spouse_name VARCHAR column is kept for backward compatibility
        -- You may want to migrate data and drop it later if needed
    END IF;
END $$;
