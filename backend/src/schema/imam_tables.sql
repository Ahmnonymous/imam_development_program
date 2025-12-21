-- ============================================================
-- IDP - IMAM MANAGEMENT SYSTEM - BACKEND TABLES
-- ============================================================
-- Created: Auto-generated from Uchakide App Manager snapshot
-- Pattern: Similar to Applicants module (master-detail)
-- Sequencing: Lookups → Master → Child → Bug #9 Structural
-- ============================================================

-- ============================================================
-- PHASE 1: LOOKUP TABLES (with default data)
-- ============================================================

-- Title Lookup (Imam titles)
CREATE TABLE IF NOT EXISTS Title_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default titles
INSERT INTO Title_Lookup (Name, Created_By, Updated_By)
VALUES 
    ('Mufti', 'system', 'system'),
    ('Sheikh', 'system', 'system'),
    ('Moulana', 'system', 'system'),
    ('Imam', 'system', 'system'),
    ('Ustadh', 'system', 'system'),
    ('Muallimah', 'system', 'system'),
    ('Da''ee', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Madhab Lookup
CREATE TABLE IF NOT EXISTS Madhab (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default Madhab values
INSERT INTO Madhab (Name, Created_By, Updated_By)
VALUES 
    ('Hanafi', 'system', 'system'),
    ('Maliki', 'system', 'system'),
    ('Shafi''i', 'system', 'system'),
    ('Hanbali', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Status Lookup (for approval workflows)
CREATE TABLE IF NOT EXISTS Status (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default status values
INSERT INTO Status (Name, Created_By, Updated_By)
VALUES 
    ('Pending', 'system', 'system'),
    ('Approved', 'system', 'system'),
    ('Declined', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Yes_No Lookup
CREATE TABLE IF NOT EXISTS Yes_No (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default Yes/No values
INSERT INTO Yes_No (Name, Created_By, Updated_By)
VALUES 
    ('Yes', 'system', 'system'),
    ('No', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Resource Type Lookup (for Pearls of Wisdom)
CREATE TABLE IF NOT EXISTS Resource_Type (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default resource types
INSERT INTO Resource_Type (Name, Created_By, Updated_By)
VALUES 
    ('Read a book', 'system', 'system'),
    ('Read an article', 'system', 'system'),
    ('Read course material', 'system', 'system'),
    ('Listened to an audio lecture', 'system', 'system'),
    ('Watched a YouTube Lecture', 'system', 'system'),
    ('Watched a Course Video', 'system', 'system'),
    ('Attended a live Presentation', 'system', 'system'),
    ('Attended Masjid Lecture/Khutbah', 'system', 'system'),
    ('Attended a Community Halaqah', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Medical Visit Type Lookup
CREATE TABLE IF NOT EXISTS Medical_Visit_Type (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default visit types
INSERT INTO Medical_Visit_Type (Name, Created_By, Updated_By)
VALUES 
    ('Doctor Consult', 'system', 'system'),
    ('Dental Emergency', 'system', 'system'),
    ('Eye', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Medical Service Provider Lookup
CREATE TABLE IF NOT EXISTS Medical_Service_Provider (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default service providers
INSERT INTO Medical_Service_Provider (Name, Created_By, Updated_By)
VALUES 
    ('Private Doctor', 'system', 'system'),
    ('Private Hospital', 'system', 'system'),
    ('Clinic', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Community Engagement Type Lookup
CREATE TABLE IF NOT EXISTS Community_Engagement_Type (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Language Lookup
CREATE TABLE IF NOT EXISTS Language (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Currency Lookup
CREATE TABLE IF NOT EXISTS Currency (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Code VARCHAR(10) UNIQUE,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PHASE 2: MASTER TABLE - Imam Profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS Imam_Profiles (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Surname VARCHAR(255) NOT NULL,
    Nationality BIGINT,
    ID_Number VARCHAR(255),
    Title BIGINT,
    DOB DATE,
    Madhab BIGINT,
    Race BIGINT,
    Gender BIGINT,
    Marital_Status BIGINT,
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_imam_nationality FOREIGN KEY (Nationality) REFERENCES Nationality(ID),
    CONSTRAINT fk_imam_title FOREIGN KEY (Title) REFERENCES Title_Lookup(ID),
    CONSTRAINT fk_imam_madhab FOREIGN KEY (Madhab) REFERENCES Madhab(ID),
    CONSTRAINT fk_imam_race FOREIGN KEY (Race) REFERENCES Race(ID),
    CONSTRAINT fk_imam_gender FOREIGN KEY (Gender) REFERENCES Gender(ID),
    CONSTRAINT fk_imam_marital_status FOREIGN KEY (Marital_Status) REFERENCES Marital_Status(ID),
    CONSTRAINT fk_imam_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

-- ============================================================
-- PHASE 3: CHILD TABLES (linked to Imam Profiles)
-- ============================================================

-- Jumuah Khutbah Topic Submission
CREATE TABLE IF NOT EXISTS Jumuah_Khutbah_Topic_Submission (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    topic VARCHAR(500) NOT NULL,
    masjid_name VARCHAR(255) NOT NULL,
    town BIGINT,
    attendance_count INT,
    language BIGINT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_jumuah_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_jumuah_town FOREIGN KEY (town) REFERENCES Suburb(ID),
    CONSTRAINT fk_jumuah_language FOREIGN KEY (language) REFERENCES Language(ID),
    CONSTRAINT fk_jumuah_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_jumuah_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

-- Jumuah Audio Khutbah
CREATE TABLE IF NOT EXISTS Jumuah_Audio_Khutbah (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT,
    khutbah_topic VARCHAR(500) NOT NULL,
    khutbah_date DATE NOT NULL,
    Audio BYTEA,
    Audio_Filename VARCHAR(255),
    Audio_Mime VARCHAR(255),
    Audio_Size INT,
    Audio_Updated_At TIMESTAMPTZ,
    audio_show_link TEXT,
    attendance_count INT,
    language BIGINT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_audio_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_audio_language FOREIGN KEY (language) REFERENCES Language(ID),
    CONSTRAINT fk_audio_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_audio_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

-- Pearls of Wisdom
CREATE TABLE IF NOT EXISTS Pearls_Of_Wisdom (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    resource_type BIGINT,
    resource_title VARCHAR(500) NOT NULL,
    author_speaker VARCHAR(255),
    heading_description TEXT,
    pearl_one TEXT NOT NULL,
    pearl_two TEXT,
    pearl_three TEXT,
    pearl_four TEXT,
    pearl_five TEXT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_pearls_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_pearls_resource_type FOREIGN KEY (resource_type) REFERENCES Resource_Type(ID),
    CONSTRAINT fk_pearls_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_pearls_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

-- Medical Reimbursement
CREATE TABLE IF NOT EXISTS Medical_Reimbursement (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    relationship_type BIGINT,
    visit_type BIGINT,
    visit_date DATE NOT NULL,
    illness_description TEXT NOT NULL,
    service_provider BIGINT,
    amount DECIMAL(12,2) NOT NULL,
    Receipt BYTEA,
    Receipt_Filename VARCHAR(255),
    Receipt_Mime VARCHAR(255),
    Receipt_Size INT,
    Receipt_Updated_At TIMESTAMPTZ,
    receipt_show_link TEXT,
    Supporting_Docs BYTEA,
    Supporting_Docs_Filename VARCHAR(255),
    Supporting_Docs_Mime VARCHAR(255),
    Supporting_Docs_Size INT,
    Supporting_Docs_Updated_At TIMESTAMPTZ,
    supporting_docs_show_link TEXT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_medical_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_medical_relationship_type FOREIGN KEY (relationship_type) REFERENCES Relationship_Types(ID),
    CONSTRAINT fk_medical_visit_type FOREIGN KEY (visit_type) REFERENCES Medical_Visit_Type(ID),
    CONSTRAINT fk_medical_service_provider FOREIGN KEY (service_provider) REFERENCES Medical_Service_Provider(ID),
    CONSTRAINT fk_medical_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_medical_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

-- Community Engagement
CREATE TABLE IF NOT EXISTS Community_Engagement (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    engagement_type BIGINT,
    people_count INT NOT NULL,
    engagement_date DATE NOT NULL,
    Engagement_Image BYTEA,
    Engagement_Image_Filename VARCHAR(255),
    Engagement_Image_Mime VARCHAR(255),
    Engagement_Image_Size INT,
    Engagement_Image_Updated_At TIMESTAMPTZ,
    engagement_image_show_link TEXT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_engagement_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_engagement_type FOREIGN KEY (engagement_type) REFERENCES Community_Engagement_Type(ID),
    CONSTRAINT fk_engagement_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_engagement_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

-- Nikah Bonus
CREATE TABLE IF NOT EXISTS Nikah_Bonus (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    spouse_name VARCHAR(255) NOT NULL,
    nikah_date DATE NOT NULL,
    is_first_nikah BIGINT,
    Certificate BYTEA,
    Certificate_Filename VARCHAR(255),
    Certificate_Mime VARCHAR(255),
    Certificate_Size INT,
    Certificate_Updated_At TIMESTAMPTZ,
    certificate_show_link TEXT,
    Nikah_Image BYTEA,
    Nikah_Image_Filename VARCHAR(255),
    Nikah_Image_Mime VARCHAR(255),
    Nikah_Image_Size INT,
    Nikah_Image_Updated_At TIMESTAMPTZ,
    nikah_image_show_link TEXT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_nikah_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_nikah_first FOREIGN KEY (is_first_nikah) REFERENCES Yes_No(ID),
    CONSTRAINT fk_nikah_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_nikah_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

-- New Muslim Bonus
CREATE TABLE IF NOT EXISTS New_Muslim_Bonus (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    revert_name VARCHAR(255) NOT NULL,
    revert_gender BIGINT,
    revert_dob DATE,
    revert_phone VARCHAR(255),
    revert_email VARCHAR(255),
    revert_reason TEXT NOT NULL,
    revert_pack_requested BIGINT,
    course_completed BIGINT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_newmuslim_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_newmuslim_gender FOREIGN KEY (revert_gender) REFERENCES Gender(ID),
    CONSTRAINT fk_newmuslim_pack FOREIGN KEY (revert_pack_requested) REFERENCES Yes_No(ID),
    CONSTRAINT fk_newmuslim_course FOREIGN KEY (course_completed) REFERENCES Yes_No(ID),
    CONSTRAINT fk_newmuslim_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_newmuslim_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

-- New Baby Bonus
CREATE TABLE IF NOT EXISTS New_Baby_Bonus (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    spouse_name VARCHAR(255) NOT NULL,
    baby_name VARCHAR(255) NOT NULL,
    baby_gender BIGINT,
    baby_dob DATE NOT NULL,
    Baby_Image BYTEA,
    Baby_Image_Filename VARCHAR(255),
    Baby_Image_Mime VARCHAR(255),
    Baby_Image_Size INT,
    Baby_Image_Updated_At TIMESTAMPTZ,
    baby_image_show_link TEXT,
    Birth_Certificate BYTEA,
    Birth_Certificate_Filename VARCHAR(255),
    Birth_Certificate_Mime VARCHAR(255),
    Birth_Certificate_Size INT,
    Birth_Certificate_Updated_At TIMESTAMPTZ,
    birth_certificate_show_link TEXT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_baby_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_baby_gender FOREIGN KEY (baby_gender) REFERENCES Gender(ID),
    CONSTRAINT fk_baby_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_baby_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

-- ============================================================
-- PHASE 4: BUG #9 - COUNTRY → PROVINCE → SUBURB HIERARCHY
-- ============================================================

-- Country Lookup
CREATE TABLE IF NOT EXISTS Country (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Code VARCHAR(10) UNIQUE,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Province Lookup (linked to Country)
CREATE TABLE IF NOT EXISTS Province (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    country_id BIGINT NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_province_country FOREIGN KEY (country_id) REFERENCES Country(ID) ON DELETE CASCADE,
    CONSTRAINT uq_province_country UNIQUE (Name, country_id)
);

-- Add province_id to existing Suburb table (safe migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Suburb' AND column_name = 'province_id'
    ) THEN
        ALTER TABLE Suburb 
        ADD COLUMN province_id BIGINT,
        ADD CONSTRAINT fk_suburb_province FOREIGN KEY (province_id) REFERENCES Province(ID);
    END IF;
END $$;

-- ============================================================
-- SAFE MIGRATION: Add attachment columns to existing tables
-- ============================================================
-- This section safely adds bytea and metadata columns to tables
-- that may have been created without them

-- Jumuah_Audio_Khutbah: Add audio file columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jumuah_audio_khutbah') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jumuah_audio_khutbah' AND column_name = 'Audio') THEN
            ALTER TABLE Jumuah_Audio_Khutbah 
            ADD COLUMN Audio BYTEA,
            ADD COLUMN Audio_Filename VARCHAR(255) DEFAULT '',
            ADD COLUMN Audio_Mime VARCHAR(255) DEFAULT '',
            ADD COLUMN Audio_Size INT DEFAULT 0,
            ADD COLUMN Audio_Updated_At TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- Medical_Reimbursement: Add receipt and supporting docs columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_reimbursement') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_reimbursement' AND column_name = 'Receipt') THEN
            ALTER TABLE Medical_Reimbursement 
            ADD COLUMN Receipt BYTEA,
            ADD COLUMN Receipt_Filename VARCHAR(255) DEFAULT '',
            ADD COLUMN Receipt_Mime VARCHAR(255) DEFAULT '',
            ADD COLUMN Receipt_Size INT DEFAULT 0,
            ADD COLUMN Receipt_Updated_At TIMESTAMPTZ,
            ADD COLUMN Supporting_Docs BYTEA,
            ADD COLUMN Supporting_Docs_Filename VARCHAR(255) DEFAULT '',
            ADD COLUMN Supporting_Docs_Mime VARCHAR(255) DEFAULT '',
            ADD COLUMN Supporting_Docs_Size INT DEFAULT 0,
            ADD COLUMN Supporting_Docs_Updated_At TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- Community_Engagement: Add engagement image columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_engagement') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_engagement' AND column_name = 'Engagement_Image') THEN
            ALTER TABLE Community_Engagement 
            ADD COLUMN Engagement_Image BYTEA,
            ADD COLUMN Engagement_Image_Filename VARCHAR(255) DEFAULT '',
            ADD COLUMN Engagement_Image_Mime VARCHAR(255) DEFAULT '',
            ADD COLUMN Engagement_Image_Size INT DEFAULT 0,
            ADD COLUMN Engagement_Image_Updated_At TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- Nikah_Bonus: Add certificate and nikah image columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nikah_bonus') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nikah_bonus' AND column_name = 'Certificate') THEN
            ALTER TABLE Nikah_Bonus 
            ADD COLUMN Certificate BYTEA,
            ADD COLUMN Certificate_Filename VARCHAR(255) DEFAULT '',
            ADD COLUMN Certificate_Mime VARCHAR(255) DEFAULT '',
            ADD COLUMN Certificate_Size INT DEFAULT 0,
            ADD COLUMN Certificate_Updated_At TIMESTAMPTZ,
            ADD COLUMN Nikah_Image BYTEA,
            ADD COLUMN Nikah_Image_Filename VARCHAR(255) DEFAULT '',
            ADD COLUMN Nikah_Image_Mime VARCHAR(255) DEFAULT '',
            ADD COLUMN Nikah_Image_Size INT DEFAULT 0,
            ADD COLUMN Nikah_Image_Updated_At TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- New_Baby_Bonus: Add baby image and birth certificate columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'new_baby_bonus') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'new_baby_bonus' AND column_name = 'Baby_Image') THEN
            ALTER TABLE New_Baby_Bonus 
            ADD COLUMN Baby_Image BYTEA,
            ADD COLUMN Baby_Image_Filename VARCHAR(255) DEFAULT '',
            ADD COLUMN Baby_Image_Mime VARCHAR(255) DEFAULT '',
            ADD COLUMN Baby_Image_Size INT DEFAULT 0,
            ADD COLUMN Baby_Image_Updated_At TIMESTAMPTZ,
            ADD COLUMN Birth_Certificate BYTEA,
            ADD COLUMN Birth_Certificate_Filename VARCHAR(255) DEFAULT '',
            ADD COLUMN Birth_Certificate_Mime VARCHAR(255) DEFAULT '',
            ADD COLUMN Birth_Certificate_Size INT DEFAULT 0,
            ADD COLUMN Birth_Certificate_Updated_At TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_imam_profiles_center ON Imam_Profiles(center_id);
CREATE INDEX IF NOT EXISTS idx_imam_profiles_nationality ON Imam_Profiles(Nationality);
CREATE INDEX IF NOT EXISTS idx_jumuah_imam ON Jumuah_Khutbah_Topic_Submission(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_pearls_imam ON Pearls_Of_Wisdom(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_medical_imam ON Medical_Reimbursement(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_engagement_imam ON Community_Engagement(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_nikah_imam ON Nikah_Bonus(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_newmuslim_imam ON New_Muslim_Bonus(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_baby_imam ON New_Baby_Bonus(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_province_country ON Province(country_id);
CREATE INDEX IF NOT EXISTS idx_suburb_province ON Suburb(province_id);

