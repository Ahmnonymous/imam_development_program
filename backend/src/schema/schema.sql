-- PostgreSQL Schema for Welfare Application
-- Updated to implement recommendations: TIMESTAMPTZ standardization, secure password storage,
-- Employee_ID relationships, validation, HSEQ status consistency, and documentation.
-- Removed set_created_updated_by_insert() and set_updated_by_at_timestamptz() triggers as they are handled by the application.
-- Aligned code for consistent formatting and readability.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Trigger Functions
CREATE OR REPLACE FUNCTION hash_employee_password()
RETURNS TRIGGER AS $$
BEGIN
    -- Only hash on INSERT when a plain password is provided
    IF TG_OP = 'INSERT' THEN
        IF NEW.Password_Hash IS NOT NULL AND NEW.Password_Hash !~ '^\$2[aby]\$\d\d\$' THEN
            NEW.Password_Hash := crypt(NEW.Password_Hash, gen_salt('bf'));
        END IF;
        RETURN NEW;
    END IF;

    -- Only hash on UPDATE if the password actually changed and is not already bcrypt
    IF TG_OP = 'UPDATE' THEN
        IF NEW.Password_Hash IS DISTINCT FROM OLD.Password_Hash THEN
            IF NEW.Password_Hash IS NOT NULL AND NEW.Password_Hash !~ '^\$2[aby]\$\d\d\$' THEN
                NEW.Password_Hash := crypt(NEW.Password_Hash, gen_salt('bf'));
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- Lookup Tables

CREATE TABLE Suburb (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Nationality (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Departments (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Health_Conditions (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Skills (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Relationship_Types (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Tasks_Status (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Assistance_Types (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE File_Status (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE File_Condition (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Dwelling_Status (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Race (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Dwelling_Type (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Marital_Status (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Education_Level (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Means_of_communication (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Employment_Status (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Gender (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Training_Outcome (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Training_Level (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Blood_Type (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Rating (
    ID SERIAL PRIMARY KEY,
    Score INT UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE User_Types (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Policy_Procedure_Type (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Policy_Procedure_Field (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Income_Type (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Expense_Type (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Hampers (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Born_Religion (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Period_As_Muslim (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Hadith (
    ID SERIAL PRIMARY KEY,
    Hadith_Arabic TEXT NOT NULL,
    Hadith_English TEXT NOT NULL,
    Created_On TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Updated_On TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255)
);

-- Main Tables

CREATE TABLE Training_Institutions (
    ID SERIAL PRIMARY KEY,
    Institute_Name VARCHAR(255),
    Contact_Person VARCHAR(255),
    Contact_Number VARCHAR(255),
    Email_Address VARCHAR(255),
    Seta_Number VARCHAR(255),
    Address VARCHAR(255),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Training_Courses (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255),
    Description VARCHAR(255),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Policy_and_Procedure (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255),
    Description VARCHAR(255),
    Type BIGINT,
    Date_Of_Publication DATE,
    Status BIGINT,
    File BYTEA,
    File_Filename VARCHAR(255),
    File_Mime VARCHAR(255),
    File_Size INT,
    Field BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_type FOREIGN KEY (Type) REFERENCES Policy_Procedure_Type(ID),
    CONSTRAINT fk_status FOREIGN KEY (Status) REFERENCES File_Status(ID),
    CONSTRAINT fk_field FOREIGN KEY (Field) REFERENCES Policy_Procedure_Field(ID)
);

CREATE TABLE Employee (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255),
    Surname VARCHAR(255),
    ID_Number VARCHAR(255),
    Date_of_Birth DATE,
    Nationality BIGINT,
    Race BIGINT,
    Highest_Education_Level BIGINT,
    Gender BIGINT,
    Employment_Date DATE,
    Suburb BIGINT,
    Home_Address VARCHAR(255),
    Emergency_Contact VARCHAR(255),
    Contact_Number VARCHAR(255),
    Email VARCHAR(255),
    Blood_Type BIGINT,
    Username VARCHAR(255) UNIQUE,
    Password_Hash VARCHAR(255),
    User_Type BIGINT,
    Department BIGINT,
    HSEQ_Related VARCHAR(1),
    employee_avatar VARCHAR(1000),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_nationality FOREIGN KEY (Nationality) REFERENCES Nationality(ID),
    CONSTRAINT fk_race FOREIGN KEY (Race) REFERENCES Race(ID),
    CONSTRAINT fk_highest_education_level FOREIGN KEY (Highest_Education_Level) REFERENCES Education_Level(ID),
    CONSTRAINT fk_gender FOREIGN KEY (Gender) REFERENCES Gender(ID),
    CONSTRAINT fk_suburb FOREIGN KEY (Suburb) REFERENCES Suburb(ID),
    CONSTRAINT fk_blood_type FOREIGN KEY (Blood_Type) REFERENCES Blood_Type(ID),
    CONSTRAINT fk_user_type FOREIGN KEY (User_Type) REFERENCES User_Types(ID),
    CONSTRAINT fk_department FOREIGN KEY (Department) REFERENCES Departments(ID)
);

CREATE TRIGGER Employee_password_hash
    BEFORE INSERT OR UPDATE ON Employee
    FOR EACH ROW EXECUTE FUNCTION hash_employee_password();

-- Password Reset Tokens Table
-- Stores temporary tokens for password reset functionality
CREATE TABLE IF NOT EXISTS Password_Reset_Tokens (
    ID BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    employee_id BIGINT,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_employee_reset FOREIGN KEY (employee_id) REFERENCES Employee(ID) ON DELETE CASCADE
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON Password_Reset_Tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON Password_Reset_Tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON Password_Reset_Tokens(expires_at);

CREATE TABLE Employee_Appraisal (
    ID SERIAL PRIMARY KEY,
    Employee_ID BIGINT NOT NULL,
    Positions VARCHAR(255),
    Attendance VARCHAR(255),
    Job_Knowledge_Skills VARCHAR(255),
    Quality_of_Work VARCHAR(255),
    Initiative_And_Motivation VARCHAR(255),
    Teamwork VARCHAR(255),
    General_Conduct VARCHAR(255),
    Discipline VARCHAR(255),
    Special_Task VARCHAR(255),
    Overall_Comments VARCHAR(255),
    Room_for_Improvement VARCHAR(255),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_employee_id_app FOREIGN KEY (Employee_ID) REFERENCES Employee(ID)
);

CREATE TABLE Employee_Initiative (
    ID SERIAL PRIMARY KEY,
    Employee_ID BIGINT NOT NULL,
    Idea VARCHAR(255),
    Details VARCHAR(255),
    Idea_Date DATE,
    Status VARCHAR(255),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_employee_id_init FOREIGN KEY (Employee_ID) REFERENCES Employee(ID)
);

CREATE TABLE Employee_Skills (
    ID SERIAL PRIMARY KEY,
    Employee_ID BIGINT NOT NULL,
    Course BIGINT,
    Institution BIGINT,
    Date_Conducted DATE,
    Date_Expired DATE,
    Attachment BYTEA,
    Attachment_Filename VARCHAR(255),
    Attachment_Mime VARCHAR(255),
    Attachment_Size INT,
    Training_Outcome BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_employee_id_skills FOREIGN KEY (Employee_ID) REFERENCES Employee(ID),
    CONSTRAINT fk_course FOREIGN KEY (Course) REFERENCES Training_Courses(ID),
    CONSTRAINT fk_institution FOREIGN KEY (Institution) REFERENCES Training_Institutions(ID),
    CONSTRAINT fk_training_outcome FOREIGN KEY (Training_Outcome) REFERENCES Training_Outcome(ID)
);



-- Tables with File_ID have been removed: Comments, Tasks, Relationships, Home_Visit, Financial_Assistance, Food_Assistance, Attachments, Recurring_Invoice_Log

CREATE TABLE Programs (
    ID SERIAL PRIMARY KEY,
    Person_Trained_ID BIGINT,
    Program_Name BIGINT,
    Means_of_communication BIGINT,
    Date_of_program DATE,
    Communicated_by BIGINT,
    Training_Level BIGINT,
    Training_Provider BIGINT,
    Attachment BYTEA,
    Attachment_Filename VARCHAR(255),
    Attachment_Mime VARCHAR(255),
    Attachment_Size INT,
    Program_Outcome BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_program_name FOREIGN KEY (Program_Name) REFERENCES Training_Courses(ID),
    CONSTRAINT fk_communicated_by FOREIGN KEY (Communicated_by) REFERENCES Employee(ID),
    CONSTRAINT fk_training_level FOREIGN KEY (Training_Level) REFERENCES Training_Level(ID),
    CONSTRAINT fk_training_provider FOREIGN KEY (Training_Provider) REFERENCES Training_Institutions(ID),
    CONSTRAINT fk_program_outcome FOREIGN KEY (Program_Outcome) REFERENCES Training_Outcome(ID),
    CONSTRAINT fk_means_of_communication FOREIGN KEY (Means_of_communication) REFERENCES Means_of_communication(ID)
);





CREATE TABLE Service_Rating (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Overall_Experience SMALLINT,
    Respect_And_Dignity SMALLINT,
    Communication_And_Clarity SMALLINT,
    Timeliness_Of_Support SMALLINT,
    Fairness_And_Equality SMALLINT,
    Usefulness_Of_Service SMALLINT,
    Friendliness_Of_Staff SMALLINT,
    Positive_Impact BOOLEAN,
    No_Positive_Impact_Reason TEXT,
    Access_Ease SMALLINT,
    Would_Recommend BOOLEAN,
    Appreciate_Most TEXT,
    How_To_Improve TEXT,
    Other_Comments TEXT,
    Datestamp DATE DEFAULT CURRENT_DATE,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);



-- Secondary Features Tables
CREATE TABLE Conversations (
    ID SERIAL PRIMARY KEY,
    Title VARCHAR(255),
    Type VARCHAR(50),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Conversation_Participants (
    ID SERIAL PRIMARY KEY,
    Conversation_ID BIGINT,
    Employee_ID BIGINT,
    Joined_Date DATE,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL,
    last_restored_at TIMESTAMPTZ NULL,
    CONSTRAINT fk_conversation_id FOREIGN KEY (Conversation_ID) REFERENCES Conversations(ID),
    CONSTRAINT fk_employee_id FOREIGN KEY (Employee_ID) REFERENCES Employee(ID)
);

CREATE TABLE Messages (
    ID SERIAL PRIMARY KEY,
    Conversation_ID BIGINT,
    Sender_ID BIGINT,
    Message_Text TEXT,
    Attachment BYTEA,
    Attachment_Filename VARCHAR(255),
    Attachment_Mime VARCHAR(255),
    Attachment_Size INT,
    Read_Status VARCHAR(50) DEFAULT 'Unread',
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_conversation_id_msg FOREIGN KEY (Conversation_ID) REFERENCES Conversations(ID),
    CONSTRAINT fk_sender_id FOREIGN KEY (Sender_ID) REFERENCES Employee(ID)
);

-- Per-Participant Message Read Status Tracking
-- Tracks read status per participant per message
-- This allows each participant to have their own read status
-- Critical for Announcement conversations where read_status
-- should be tracked individually for each participant
CREATE TABLE IF NOT EXISTS Message_Read_Status (
    ID SERIAL PRIMARY KEY,
    Message_ID BIGINT NOT NULL,
    Employee_ID BIGINT NOT NULL,
    Read_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_message_read_status_message FOREIGN KEY (Message_ID) REFERENCES Messages(ID) ON DELETE CASCADE,
    CONSTRAINT fk_message_read_status_employee FOREIGN KEY (Employee_ID) REFERENCES Employee(ID) ON DELETE CASCADE,
    CONSTRAINT uq_message_read_status_unique UNIQUE (Message_ID, Employee_ID)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_message_read_status_message 
ON Message_Read_Status(Message_ID);

CREATE INDEX IF NOT EXISTS idx_message_read_status_employee 
ON Message_Read_Status(Employee_ID);

CREATE INDEX IF NOT EXISTS idx_message_read_status_message_employee 
ON Message_Read_Status(Message_ID, Employee_ID);

-- Add indexes for Conversation_Participants
CREATE INDEX IF NOT EXISTS idx_conversation_participants_deleted_at 
ON Conversation_Participants(conversation_id, employee_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_last_restored_at 
ON Conversation_Participants(conversation_id, employee_id, last_restored_at);

-- Add comments for documentation
COMMENT ON TABLE Message_Read_Status IS 'Tracks per-participant read status for messages. Each participant can have their own read status independent of others.';
COMMENT ON COLUMN Message_Read_Status.Message_ID IS 'Reference to the message that was read';
COMMENT ON COLUMN Message_Read_Status.Employee_ID IS 'Reference to the employee who read the message';
COMMENT ON COLUMN Message_Read_Status.Read_At IS 'Timestamp when the message was read by this participant';
COMMENT ON COLUMN Conversation_Participants.deleted_at IS 'Timestamp when user deleted/hid this conversation. NULL means conversation is visible. When new messages arrive, this is set to NULL to restore the conversation.';
COMMENT ON COLUMN Conversation_Participants.last_restored_at IS 'Timestamp when conversation was last restored after being deleted. Used to filter messages - only messages after this timestamp are shown (like WhatsApp behavior).';

CREATE TABLE Folders (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255),
    Parent_ID BIGINT,
    Employee_ID BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_parent_id FOREIGN KEY (Parent_ID) REFERENCES Folders(ID),
    CONSTRAINT fk_employee_id_fold FOREIGN KEY (Employee_ID) REFERENCES Employee(ID)
);

CREATE TABLE Personal_Files (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255),
    Folder_ID BIGINT,
    File BYTEA,
    File_Filename VARCHAR(255),
    File_Mime VARCHAR(255),
    File_Size INT,
    Employee_ID BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_folder_id FOREIGN KEY (Folder_ID) REFERENCES Folders(ID),
    CONSTRAINT fk_employee_id_file FOREIGN KEY (Employee_ID) REFERENCES Employee(ID)
);

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

-- Request For Lookup (for Hardship Relief)
CREATE TABLE IF NOT EXISTS Request_For_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default Request For values
INSERT INTO Request_For_Lookup (Name, Created_By, Updated_By)
VALUES 
    ('Myself (Imam/Muallimah)', 'system', 'system'),
    ('Community Member (1 person or a family)', 'system', 'system'),
    ('Community (A group of people in the community/community event)', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Yes No Some Not Lookup (for Hardship Relief)
CREATE TABLE IF NOT EXISTS Yes_No_Some_Not_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default Yes/No/Some Not values
INSERT INTO Yes_No_Some_Not_Lookup (Name, Created_By, Updated_By)
VALUES 
    ('Yes', 'system', 'system'),
    ('No', 'system', 'system'),
    ('Some are Muslim and some are not', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Classification Lookup (for Tickets)
CREATE TABLE IF NOT EXISTS Classification_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- Course Type Lookup (for Higher Education Request)
CREATE TABLE IF NOT EXISTS Course_Type_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default course types
INSERT INTO Course_Type_Lookup (Name, Created_By, Updated_By)
VALUES 
    ('Higher Certificate', 'system', 'system'),
    ('Diploma', 'system', 'system'),
    ('Degree', 'system', 'system'),
    ('Honours Degree', 'system', 'system'),
    ('Master''s degree', 'system', 'system'),
    ('Doctoral Degree (PhD)', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Course Duration Lookup (for Higher Education Request)
CREATE TABLE IF NOT EXISTS Course_Duration_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default course durations
INSERT INTO Course_Duration_Lookup (Name, Created_By, Updated_By)
VALUES 
    ('1 Year', 'system', 'system'),
    ('2 Years', 'system', 'system'),
    ('3 Years', 'system', 'system'),
    ('4 Years', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Study Method Lookup (for Higher Education Request)
CREATE TABLE IF NOT EXISTS Study_Method_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default study methods
INSERT INTO Study_Method_Lookup (Name, Created_By, Updated_By)
VALUES 
    ('Part time', 'system', 'system'),
    ('Full time', 'system', 'system'),
    ('Online', 'system', 'system'),
    ('Through correspondence', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Attendance Frequency Lookup (for Higher Education Request)
CREATE TABLE IF NOT EXISTS Attendance_Frequency_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default attendance frequencies
INSERT INTO Attendance_Frequency_Lookup (Name, Created_By, Updated_By)
VALUES 
    ('1 day a week', 'system', 'system'),
    ('2 days a week', 'system', 'system'),
    ('3 days a week', 'system', 'system'),
    ('4 days a week', 'system', 'system'),
    ('5 days a week', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Semesters Per Year Lookup (for Higher Education Request)
CREATE TABLE IF NOT EXISTS Semesters_Per_Year_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default semesters per year
INSERT INTO Semesters_Per_Year_Lookup (Name, Created_By, Updated_By)
VALUES 
    ('1 Semester', 'system', 'system'),
    ('2 Semesters', 'system', 'system'),
    ('3 Semesters', 'system', 'system'),
    ('4 Semesters', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Borehole Construction Tasks Lookup
CREATE TABLE IF NOT EXISTS Borehole_Construction_Tasks_Lookup (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Employment Type Lookup (for Imam Profiles)
CREATE TABLE IF NOT EXISTS Employment_Type (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default employment types
INSERT INTO Employment_Type (Name, Created_By, Updated_By)
VALUES 
    ('Full Time', 'system', 'system'),
    ('Part Time', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Teaching Frequency Lookup (for Imam Profiles)
CREATE TABLE IF NOT EXISTS Teaching_Frequency (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default teaching frequencies
INSERT INTO Teaching_Frequency (Name, Created_By, Updated_By)
VALUES 
    ('Daily', 'system', 'system'),
    ('Few times a week', 'system', 'system'),
    ('Weekends', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Teach Adults Community Classes Lookup (for Imam Profiles)
CREATE TABLE IF NOT EXISTS Teach_Adults_Community_Classes (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default teach adults values
INSERT INTO Teach_Adults_Community_Classes (Name, Created_By, Updated_By)
VALUES 
    ('Yes', 'system', 'system'),
    ('Occasionally', 'system', 'system'),
    ('No', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Average Students Taught Daily Lookup (for Imam Profiles)
CREATE TABLE IF NOT EXISTS Average_Students_Taught_Daily (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default average students values
INSERT INTO Average_Students_Taught_Daily (Name, Created_By, Updated_By)
VALUES 
    ('Between 10 and 20', 'system', 'system'),
    ('Between 20 and 30', 'system', 'system'),
    ('Between 30 and 50', 'system', 'system'),
    ('Between 50 and 100', 'system', 'system'),
    ('More than 100', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Prayers Lead Daily Lookup (for Imam Profiles)
CREATE TABLE IF NOT EXISTS Prayers_Lead_Daily (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default prayers lead daily values
INSERT INTO Prayers_Lead_Daily (Name, Created_By, Updated_By)
VALUES 
    ('Leading 1 prayer a day', 'system', 'system'),
    ('Leading 2 prayer a day', 'system', 'system'),
    ('Leading 3 prayer a day', 'system', 'system'),
    ('Leading 4 prayer a day', 'system', 'system'),
    ('Leading 5 prayer a day', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Jumuah Prayers Lead Lookup (for Imam Profiles)
CREATE TABLE IF NOT EXISTS Jumuah_Prayers_Lead (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default jumuah prayers values
INSERT INTO Jumuah_Prayers_Lead (Name, Created_By, Updated_By)
VALUES 
    ('1', 'system', 'system'),
    ('2', 'system', 'system'),
    ('3', 'system', 'system'),
    ('4', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Average Attendees Lookup (for Imam Profiles - used for all prayer times)
CREATE TABLE IF NOT EXISTS Average_Attendees (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default average attendees values
INSERT INTO Average_Attendees (Name, Created_By, Updated_By)
VALUES 
    ('Less than 10', 'system', 'system'),
    ('Between 10 and 20', 'system', 'system'),
    ('Between 20 and 30', 'system', 'system'),
    ('Between 30 and 50', 'system', 'system'),
    ('between 50 and 100', 'system', 'system'),
    ('More than 100', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Proficiency Lookup (for Imam Profiles - used for English, Arabic, Quran Reading, Public Speaking)
CREATE TABLE IF NOT EXISTS Proficiency (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default proficiency values
INSERT INTO Proficiency (Name, Created_By, Updated_By)
VALUES 
    ('Basic', 'system', 'system'),
    ('Intermediate', 'system', 'system'),
    ('Proficient', 'system', 'system'),
    ('Advanced', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Quran Memorization Lookup (for Imam Profiles)
CREATE TABLE IF NOT EXISTS Quran_Memorization (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default quran memorization values
INSERT INTO Quran_Memorization (Name, Created_By, Updated_By)
VALUES 
    ('Memorised the short surah only', 'system', 'system'),
    ('Memorised 5 juz or less', 'system', 'system'),
    ('Memorised 15 juz or more', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Additional Weekly Tasks Lookup (for Imam Profiles)
CREATE TABLE IF NOT EXISTS Additional_Weekly_Tasks (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default additional weekly tasks values
INSERT INTO Additional_Weekly_Tasks (Name, Created_By, Updated_By)
VALUES 
    ('Khateeb for Jumuah', 'system', 'system'),
    ('Guest Khateeb for Jumuah at surrounding Masjid', 'system', 'system'),
    ('Hifz/Hidth Teacher', 'system', 'system'),
    ('Active in Street Dawah', 'system', 'system'),
    ('Ghusl/Burial duties', 'system', 'system'),
    ('Nikah duties', 'system', 'system'),
    ('Prison visits', 'system', 'system'),
    ('Hospital visits', 'system', 'system'),
    ('Counselling Sessions (Individual/Marriage etc)', 'system', 'system'),
    ('Food/Hamper distribution', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- ============================================================
-- PHASE 2: MASTER TABLE - Imam Profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS Imam_Profiles (
    ID BIGSERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Surname VARCHAR(255) NOT NULL,
    Email VARCHAR(255),
    ID_Number VARCHAR(255),
    File_Number VARCHAR(255),
    Cell_Number VARCHAR(255),
    Contact_Number VARCHAR(255),
    Title BIGINT,
    DOB DATE,
    Madhab BIGINT,
    Race BIGINT,
    Gender BIGINT,
    Marital_Status BIGINT,
    nationality_id BIGINT,
    province_id BIGINT,
    suburb_id BIGINT,
    status_id BIGINT NOT NULL DEFAULT 1,
    employee_id BIGINT NOT NULL UNIQUE,
    Employment_Type BIGINT,
    Lead_Salah_In_Masjid BIGINT,
    Teach_Maktab_Madrassah BIGINT,
    Do_Street_Dawah BIGINT,
    Teaching_Frequency BIGINT,
    Teach_Adults_Community_Classes BIGINT,
    Average_Students_Taught_Daily BIGINT,
    Prayers_Lead_Daily BIGINT,
    Jumuah_Prayers_Lead BIGINT,
    Average_Fajr_Attendees BIGINT,
    Average_Dhuhr_Attendees BIGINT,
    Average_Asr_Attendees BIGINT,
    Average_Maghrib_Attendees BIGINT,
    Average_Esha_Attendees BIGINT,
    English_Proficiency BIGINT,
    Arabic_Proficiency BIGINT,
    Quran_Reading_Ability BIGINT,
    Public_Speaking_Khutbah_Skills BIGINT,
    Quran_Memorization VARCHAR(255),
    Additional_Weekly_Tasks TEXT,
    Acknowledge BOOLEAN DEFAULT false,
    Masjid_Image BYTEA,
    Masjid_Image_Filename VARCHAR(255),
    Masjid_Image_Mime VARCHAR(255),
    Masjid_Image_Size INT,
    Longitude DECIMAL(10, 8),
    Latitude DECIMAL(10, 8),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_imam_title FOREIGN KEY (Title) REFERENCES Title_Lookup(ID),
    CONSTRAINT fk_imam_madhab FOREIGN KEY (Madhab) REFERENCES Madhab(ID),
    CONSTRAINT fk_imam_race FOREIGN KEY (Race) REFERENCES Race(ID),
    CONSTRAINT fk_imam_gender FOREIGN KEY (Gender) REFERENCES Gender(ID),
    CONSTRAINT fk_imam_marital_status FOREIGN KEY (Marital_Status) REFERENCES Marital_Status(ID),
    CONSTRAINT fk_imam_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_imam_employee FOREIGN KEY (employee_id) REFERENCES Employee(ID),
    CONSTRAINT fk_imam_employment_type FOREIGN KEY (Employment_Type) REFERENCES Employment_Type(ID),
    CONSTRAINT fk_imam_lead_salah FOREIGN KEY (Lead_Salah_In_Masjid) REFERENCES Yes_No(ID),
    CONSTRAINT fk_imam_teach_maktab FOREIGN KEY (Teach_Maktab_Madrassah) REFERENCES Yes_No(ID),
    CONSTRAINT fk_imam_street_dawah FOREIGN KEY (Do_Street_Dawah) REFERENCES Yes_No(ID),
    CONSTRAINT fk_imam_teaching_frequency FOREIGN KEY (Teaching_Frequency) REFERENCES Teaching_Frequency(ID),
    CONSTRAINT fk_imam_teach_adults FOREIGN KEY (Teach_Adults_Community_Classes) REFERENCES Teach_Adults_Community_Classes(ID),
    CONSTRAINT fk_imam_avg_students FOREIGN KEY (Average_Students_Taught_Daily) REFERENCES Average_Students_Taught_Daily(ID),
    CONSTRAINT fk_imam_prayers_lead FOREIGN KEY (Prayers_Lead_Daily) REFERENCES Prayers_Lead_Daily(ID),
    CONSTRAINT fk_imam_jumuah_prayers FOREIGN KEY (Jumuah_Prayers_Lead) REFERENCES Jumuah_Prayers_Lead(ID),
    CONSTRAINT fk_imam_avg_fajr FOREIGN KEY (Average_Fajr_Attendees) REFERENCES Average_Attendees(ID),
    CONSTRAINT fk_imam_avg_dhuhr FOREIGN KEY (Average_Dhuhr_Attendees) REFERENCES Average_Attendees(ID),
    CONSTRAINT fk_imam_avg_asr FOREIGN KEY (Average_Asr_Attendees) REFERENCES Average_Attendees(ID),
    CONSTRAINT fk_imam_avg_maghrib FOREIGN KEY (Average_Maghrib_Attendees) REFERENCES Average_Attendees(ID),
    CONSTRAINT fk_imam_avg_esha FOREIGN KEY (Average_Esha_Attendees) REFERENCES Average_Attendees(ID),
    CONSTRAINT fk_imam_english_proficiency FOREIGN KEY (English_Proficiency) REFERENCES Proficiency(ID),
    CONSTRAINT fk_imam_arabic_proficiency FOREIGN KEY (Arabic_Proficiency) REFERENCES Proficiency(ID),
    CONSTRAINT fk_imam_quran_reading FOREIGN KEY (Quran_Reading_Ability) REFERENCES Proficiency(ID),
    CONSTRAINT fk_imam_public_speaking FOREIGN KEY (Public_Speaking_Khutbah_Skills) REFERENCES Proficiency(ID),
    CONSTRAINT uq_imam_employee UNIQUE (employee_id)
    -- Note: Foreign keys for nationality_id, province_id, suburb_id are added by migration block
    -- after Country, Province, and Suburb tables are created
    -- Note: Quran_Memorization is stored as VARCHAR(255) text, not a foreign key
    -- Note: Additional_Weekly_Tasks is stored as TEXT (comma-separated or JSON), not a foreign key
);

-- ============================================================
-- PHASE 3: CHILD TABLES (linked to Imam Profiles)
-- ============================================================

-- Jumuah Khutbah Topic Submission
CREATE TABLE IF NOT EXISTS Jumuah_Khutbah_Topic (
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
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_jumuah_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_jumuah_town FOREIGN KEY (town) REFERENCES Suburb(ID),
    CONSTRAINT fk_jumuah_language FOREIGN KEY (language) REFERENCES Language(ID),
    CONSTRAINT fk_jumuah_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

-- Jumuah Audio Khutbah
CREATE TABLE IF NOT EXISTS Jumuah_Audio_Khutbah (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT,
    khutbah_topic VARCHAR(500) NOT NULL,
    khutbah_date DATE NOT NULL,
    masjid_name VARCHAR(255),
    town BIGINT,
    Audio BYTEA,
    Audio_Filename VARCHAR(255),
    Audio_Mime VARCHAR(255),
    Audio_Size INT,
    Audio_Updated_At TIMESTAMPTZ,
    audio_show_link TEXT,
    audio_created_date DATE,
    attendance_count INT,
    language BIGINT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_audio_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_audio_town FOREIGN KEY (town) REFERENCES Suburb(ID),
    CONSTRAINT fk_audio_language FOREIGN KEY (language) REFERENCES Language(ID),
    CONSTRAINT fk_audio_status FOREIGN KEY (status_id) REFERENCES Status(ID)
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
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_pearls_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_pearls_resource_type FOREIGN KEY (resource_type) REFERENCES Resource_Type(ID),
    CONSTRAINT fk_pearls_status FOREIGN KEY (status_id) REFERENCES Status(ID)
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
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_medical_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_medical_relationship_type FOREIGN KEY (relationship_type) REFERENCES Relationship_Types(ID),
    CONSTRAINT fk_medical_visit_type FOREIGN KEY (visit_type) REFERENCES Medical_Visit_Type(ID),
    CONSTRAINT fk_medical_service_provider FOREIGN KEY (service_provider) REFERENCES Medical_Service_Provider(ID),
    CONSTRAINT fk_medical_status FOREIGN KEY (status_id) REFERENCES Status(ID)
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
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_engagement_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_engagement_type FOREIGN KEY (engagement_type) REFERENCES Community_Engagement_Type(ID),
    CONSTRAINT fk_engagement_status FOREIGN KEY (status_id) REFERENCES Status(ID)
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
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_nikah_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_nikah_first FOREIGN KEY (is_first_nikah) REFERENCES Yes_No(ID),
    CONSTRAINT fk_nikah_status FOREIGN KEY (status_id) REFERENCES Status(ID)
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
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_newmuslim_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_newmuslim_gender FOREIGN KEY (revert_gender) REFERENCES Gender(ID),
    CONSTRAINT fk_newmuslim_pack FOREIGN KEY (revert_pack_requested) REFERENCES Yes_No(ID),
    CONSTRAINT fk_newmuslim_course FOREIGN KEY (course_completed) REFERENCES Yes_No(ID),
    CONSTRAINT fk_newmuslim_status FOREIGN KEY (status_id) REFERENCES Status(ID)
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
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_baby_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_baby_gender FOREIGN KEY (baby_gender) REFERENCES Gender(ID),
    CONSTRAINT fk_baby_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

-- Imam Relationships
CREATE TABLE IF NOT EXISTS Imam_Relationships (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    Relationship_Type BIGINT,
    Name VARCHAR(255),
    Surname VARCHAR(255),
    ID_Number VARCHAR(255),
    Date_of_Birth DATE,
    Employment_Status BIGINT,
    Gender BIGINT,
    Highest_Education BIGINT,
    Health_Condition BIGINT,
    status_id BIGINT NOT NULL DEFAULT 1,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_imam_rel_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_imam_rel_type FOREIGN KEY (Relationship_Type) REFERENCES Relationship_Types(ID),
    CONSTRAINT fk_imam_rel_employment FOREIGN KEY (Employment_Status) REFERENCES Employment_Status(ID),
    CONSTRAINT fk_imam_rel_gender FOREIGN KEY (Gender) REFERENCES Gender(ID),
    CONSTRAINT fk_imam_rel_education FOREIGN KEY (Highest_Education) REFERENCES Education_Level(ID),
    CONSTRAINT fk_imam_rel_health FOREIGN KEY (Health_Condition) REFERENCES Health_Conditions(ID),
    CONSTRAINT fk_relationships_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

-- Borehole
CREATE TABLE IF NOT EXISTS borehole (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    where_required BIGINT,
    has_electricity BIGINT,
    received_borehole_before BIGINT,
    current_water_source BIGINT,
    distance_to_water_source NUMERIC(10, 2),
    beneficiaries_count INT,
    challenges_due_to_lack_of_water TEXT,
    motivation TEXT,
    current_water_source_image BYTEA,
    current_water_source_image_filename VARCHAR(255),
    current_water_source_image_mime VARCHAR(255),
    current_water_source_image_size INT,
    current_water_source_image_updated_at TIMESTAMPTZ,
    current_water_source_image_show_link TEXT,
    masjid_area_image BYTEA,
    masjid_area_image_filename VARCHAR(255),
    masjid_area_image_mime VARCHAR(255),
    masjid_area_image_size INT,
    masjid_area_image_updated_at TIMESTAMPTZ,
    masjid_area_image_show_link TEXT,
    longitude NUMERIC(10, 8),
    latitude NUMERIC(10, 8),
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_borehole_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_borehole_location FOREIGN KEY (where_required) REFERENCES Borehole_Location(ID),
    CONSTRAINT fk_borehole_electricity FOREIGN KEY (has_electricity) REFERENCES Yes_No(ID),
    CONSTRAINT fk_borehole_received_before FOREIGN KEY (received_borehole_before) REFERENCES Yes_No(ID),
    CONSTRAINT fk_borehole_water_source FOREIGN KEY (current_water_source) REFERENCES Water_Source(ID),
    CONSTRAINT fk_borehole_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_borehole_imam ON borehole(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_borehole_water_usage_borehole ON Borehole_Water_Usage_Purpose(borehole_id);
CREATE INDEX IF NOT EXISTS idx_borehole_water_usage_purpose ON Borehole_Water_Usage_Purpose(water_usage_purpose_id);

-- ============================================================
-- PHASE 3.5: ADDITIONAL CHILD TABLES (linked to Imam Profiles)
-- ============================================================

-- Financial Assistance (for Imam Profiles)
CREATE TABLE IF NOT EXISTS imam_financial_assistance (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    assistance_type VARCHAR(255),
    amount_required DECIMAL(12,2),
    amount_required_currency BIGINT,
    reason_for_assistance TEXT,
    monthly_income DECIMAL(12,2),
    monthly_expenses DECIMAL(12,2),
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_imam_financial_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_imam_financial_currency FOREIGN KEY (amount_required_currency) REFERENCES Currency(ID),
    CONSTRAINT fk_imam_financial_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

-- Educational Development
CREATE TABLE IF NOT EXISTS educational_development (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    course_name VARCHAR(500),
    institution_name VARCHAR(255),
    course_type VARCHAR(255),
    start_date DATE,
    end_date DATE,
    cost DECIMAL(12,2),
    cost_currency BIGINT,
    funding_source VARCHAR(255),
    completion_status VARCHAR(255),
    certificate_obtained BOOLEAN DEFAULT false,
    certificate BYTEA,
    certificate_filename VARCHAR(255),
    certificate_mime VARCHAR(255),
    certificate_size INT,
    certificate_updated_at TIMESTAMPTZ,
    certificate_show_link TEXT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_educational_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_educational_currency FOREIGN KEY (cost_currency) REFERENCES Currency(ID),
    CONSTRAINT fk_educational_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

-- Tree Planting
CREATE TABLE IF NOT EXISTS tree_planting (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    number_of_trees INT,
    tree_type VARCHAR(255),
    planting_location VARCHAR(500),
    planting_date DATE,
    planting_image BYTEA,
    planting_image_filename VARCHAR(255),
    planting_image_mime VARCHAR(255),
    planting_image_size INT,
    planting_image_updated_at TIMESTAMPTZ,
    planting_image_show_link TEXT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_tree_planting_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_tree_planting_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

-- WAQF Loan
CREATE TABLE IF NOT EXISTS waqf_loan (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    participated_recent_bonuses_90_days BIGINT,
    recent_bonuses_details TEXT,
    active_dawah BIGINT,
    dawah_activities_details TEXT,
    contributed_to_waqf_loan_fund TEXT,
    loan_type VARCHAR(255),
    loan_type_other TEXT,
    loan_reason TEXT,
    tried_employer_request VARCHAR(255),
    promise_to_repay BIGINT,
    understand_waqf_fund BIGINT,
    agree_to_pay_bank_service_costs BIGINT,
    amount_required DECIMAL(12,2),
    monthly_income DECIMAL(12,2),
    monthly_expenses DECIMAL(12,2),
    repayment_structure DECIMAL(12,2),
    repayment_explanation TEXT,
    first_guarantor_name VARCHAR(255),
    first_guarantor_contact VARCHAR(255),
    second_guarantor_name VARCHAR(255),
    second_guarantor_contact VARCHAR(255),
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    comment TEXT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_waqf_loan_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_waqf_loan_bonuses FOREIGN KEY (participated_recent_bonuses_90_days) REFERENCES Yes_No(ID),
    CONSTRAINT fk_waqf_loan_dawah FOREIGN KEY (active_dawah) REFERENCES Yes_No(ID),
    CONSTRAINT fk_waqf_loan_repay FOREIGN KEY (promise_to_repay) REFERENCES Yes_No(ID),
    CONSTRAINT fk_waqf_loan_understand FOREIGN KEY (understand_waqf_fund) REFERENCES Yes_No(ID),
    CONSTRAINT fk_waqf_loan_bank_costs FOREIGN KEY (agree_to_pay_bank_service_costs) REFERENCES Yes_No(ID),
    CONSTRAINT fk_waqf_loan_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_imam_financial_imam ON imam_financial_assistance(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_educational_imam ON educational_development(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_tree_planting_imam ON tree_planting(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_waqf_loan_imam ON waqf_loan(imam_profile_id);

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

-- Fix Suburb table UNIQUE constraint: Change from Name-only to (Name, province_id)
-- This allows same suburb name in different provinces (e.g., "Newcastle", "London" in multiple provinces)
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    -- Find and drop ALL UNIQUE constraints on Suburb.Name alone (not composite)
    FOR constraint_rec IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
            AND tc.table_schema = ccu.table_schema
        WHERE tc.table_name = 'Suburb' 
        AND tc.constraint_type = 'UNIQUE'
        AND ccu.column_name = 'Name'
        AND tc.table_schema = current_schema()
        AND NOT EXISTS (
            -- Exclude composite constraints (those with multiple columns)
            SELECT 1 
            FROM information_schema.constraint_column_usage ccu2
            WHERE ccu2.constraint_name = tc.constraint_name
            AND ccu2.table_schema = tc.table_schema
            AND ccu2.column_name != 'Name'
        )
    LOOP
        EXECUTE 'ALTER TABLE Suburb DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_rec.constraint_name);
    END LOOP;
    
    -- Add composite UNIQUE constraint on (Name, province_id) if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Suburb' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name = 'uq_suburb_province'
        AND table_schema = current_schema()
    ) THEN
        -- Only add if province_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Suburb' 
            AND column_name = 'province_id'
            AND table_schema = current_schema()
        ) THEN
            ALTER TABLE Suburb 
            ADD CONSTRAINT uq_suburb_province UNIQUE (Name, province_id);
        END IF;
    END IF;
END $$;

-- ============================================================
-- SAFE MIGRATION: Add new columns to Imam_Profiles table
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Imam_Profiles' AND table_schema = current_schema()) THEN
        -- Add File_Number if it doesn't exist (check both cases)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imam_profiles' AND (column_name = 'File_Number' OR column_name = 'file_number') AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN File_Number VARCHAR(255);
            RAISE NOTICE 'Added File_Number column to Imam_Profiles';
        END IF;
        
        -- Add Cell_Number if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imam_profiles' AND (column_name = 'Cell_Number' OR column_name = 'cell_number') AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Cell_Number VARCHAR(255);
            RAISE NOTICE 'Added Cell_Number column to Imam_Profiles';
        END IF;
        
        -- Add Contact_Number if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imam_profiles' AND (column_name = 'Contact_Number' OR column_name = 'contact_number') AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Contact_Number VARCHAR(255);
            RAISE NOTICE 'Added Contact_Number column to Imam_Profiles';
        END IF;
        
        -- Add Employment_Type if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Employment_Type' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Employment_Type BIGINT;
            RAISE NOTICE 'Added Employment_Type column to Imam_Profiles';
        END IF;
        
        -- Add Lead_Salah_In_Masjid if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Lead_Salah_In_Masjid' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Lead_Salah_In_Masjid BIGINT;
            RAISE NOTICE 'Added Lead_Salah_In_Masjid column to Imam_Profiles';
        END IF;
        
        -- Add Teach_Maktab_Madrassah if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Teach_Maktab_Madrassah' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Teach_Maktab_Madrassah BIGINT;
            RAISE NOTICE 'Added Teach_Maktab_Madrassah column to Imam_Profiles';
        END IF;
        
        -- Add Do_Street_Dawah if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Do_Street_Dawah' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Do_Street_Dawah BIGINT;
            RAISE NOTICE 'Added Do_Street_Dawah column to Imam_Profiles';
        END IF;
        
        -- Add Teaching_Frequency if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Teaching_Frequency' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Teaching_Frequency BIGINT;
            RAISE NOTICE 'Added Teaching_Frequency column to Imam_Profiles';
        END IF;
        
        -- Add Teach_Adults_Community_Classes if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Teach_Adults_Community_Classes' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Teach_Adults_Community_Classes BIGINT;
            RAISE NOTICE 'Added Teach_Adults_Community_Classes column to Imam_Profiles';
        END IF;
        
        -- Add Average_Students_Taught_Daily if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Average_Students_Taught_Daily' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Average_Students_Taught_Daily BIGINT;
            RAISE NOTICE 'Added Average_Students_Taught_Daily column to Imam_Profiles';
        END IF;
        
        -- Add Prayers_Lead_Daily if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Prayers_Lead_Daily' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Prayers_Lead_Daily BIGINT;
            RAISE NOTICE 'Added Prayers_Lead_Daily column to Imam_Profiles';
        END IF;
        
        -- Add Jumuah_Prayers_Lead if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Jumuah_Prayers_Lead' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Jumuah_Prayers_Lead BIGINT;
            RAISE NOTICE 'Added Jumuah_Prayers_Lead column to Imam_Profiles';
        END IF;
        
        -- Add Average_Fajr_Attendees if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Average_Fajr_Attendees' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Average_Fajr_Attendees BIGINT;
            RAISE NOTICE 'Added Average_Fajr_Attendees column to Imam_Profiles';
        END IF;
        
        -- Add Average_Dhuhr_Attendees if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Average_Dhuhr_Attendees' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Average_Dhuhr_Attendees BIGINT;
            RAISE NOTICE 'Added Average_Dhuhr_Attendees column to Imam_Profiles';
        END IF;
        
        -- Add Average_Asr_Attendees if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Average_Asr_Attendees' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Average_Asr_Attendees BIGINT;
            RAISE NOTICE 'Added Average_Asr_Attendees column to Imam_Profiles';
        END IF;
        
        -- Add Average_Maghrib_Attendees if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Average_Maghrib_Attendees' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Average_Maghrib_Attendees BIGINT;
            RAISE NOTICE 'Added Average_Maghrib_Attendees column to Imam_Profiles';
        END IF;
        
        -- Add Average_Esha_Attendees if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Average_Esha_Attendees' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Average_Esha_Attendees BIGINT;
            RAISE NOTICE 'Added Average_Esha_Attendees column to Imam_Profiles';
        END IF;
        
        -- Add English_Proficiency if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'English_Proficiency' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN English_Proficiency BIGINT;
            RAISE NOTICE 'Added English_Proficiency column to Imam_Profiles';
        END IF;
        
        -- Add Arabic_Proficiency if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Arabic_Proficiency' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Arabic_Proficiency BIGINT;
            RAISE NOTICE 'Added Arabic_Proficiency column to Imam_Profiles';
        END IF;
        
        -- Add Quran_Reading_Ability if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Quran_Reading_Ability' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Quran_Reading_Ability BIGINT;
            RAISE NOTICE 'Added Quran_Reading_Ability column to Imam_Profiles';
        END IF;
        
        -- Add Public_Speaking_Khutbah_Skills if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Public_Speaking_Khutbah_Skills' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Public_Speaking_Khutbah_Skills BIGINT;
            RAISE NOTICE 'Added Public_Speaking_Khutbah_Skills column to Imam_Profiles';
        END IF;
        
        -- Add Quran_Memorization if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Quran_Memorization' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Quran_Memorization VARCHAR(255);
            RAISE NOTICE 'Added Quran_Memorization column to Imam_Profiles';
        END IF;
        
        -- Add Additional_Weekly_Tasks if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Additional_Weekly_Tasks' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Additional_Weekly_Tasks TEXT;
            RAISE NOTICE 'Added Additional_Weekly_Tasks column to Imam_Profiles';
        END IF;
        
        -- Add Acknowledge if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Acknowledge' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Acknowledge BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added Acknowledge column to Imam_Profiles';
        END IF;
        
        -- Add Masjid_Image if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Masjid_Image' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Masjid_Image BYTEA;
            RAISE NOTICE 'Added Masjid_Image column to Imam_Profiles';
        END IF;
        
        -- Add Masjid_Image_Filename if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Masjid_Image_Filename' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Masjid_Image_Filename VARCHAR(255);
            RAISE NOTICE 'Added Masjid_Image_Filename column to Imam_Profiles';
        END IF;
        
        -- Add Masjid_Image_Mime if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Masjid_Image_Mime' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Masjid_Image_Mime VARCHAR(255);
            RAISE NOTICE 'Added Masjid_Image_Mime column to Imam_Profiles';
        END IF;
        
        -- Add Masjid_Image_Size if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Masjid_Image_Size' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Masjid_Image_Size INT;
            RAISE NOTICE 'Added Masjid_Image_Size column to Imam_Profiles';
        END IF;
        
        -- Add Longitude if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Longitude' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Longitude DECIMAL(10, 8);
            RAISE NOTICE 'Added Longitude column to Imam_Profiles';
        END IF;
        
        -- Add Latitude if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Latitude' AND table_schema = current_schema()) THEN
            ALTER TABLE Imam_Profiles ADD COLUMN Latitude DECIMAL(10, 8);
            RAISE NOTICE 'Added Latitude column to Imam_Profiles';
        END IF;
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

-- Indexes
CREATE INDEX idx_service_rating_datestamp ON Service_Rating (Datestamp);
CREATE INDEX idx_service_rating_recommend ON Service_Rating (Would_Recommend);
CREATE INDEX idx_service_rating_positive ON Service_Rating (Positive_Impact);
CREATE INDEX idx_employee_id_number ON Employee (ID_Number);
CREATE INDEX idx_employee_username ON Employee (Username);
-- Indexes for removed tables (Financial_Assistance, Food_Assistance, Home_Visit, Comments, Relationships, Recurring_Invoice_Log) have been removed
CREATE INDEX idx_programs_person_trained_id ON Programs (Person_Trained_ID);
CREATE INDEX idx_employee_appraisal_employee_id ON Employee_Appraisal (Employee_ID);
CREATE INDEX idx_employee_initiative_employee_id ON Employee_Initiative (Employee_ID);
CREATE INDEX idx_employee_skills_employee_id ON Employee_Skills (Employee_ID);
CREATE INDEX idx_conversation_participants_conversation_id ON Conversation_Participants (Conversation_ID);
CREATE INDEX idx_messages_conversation_id ON Messages (Conversation_ID);

-- Imam Management System Indexes (created conditionally to ensure tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Imam_Profiles' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_imam_profiles_nationality ON Imam_Profiles(Nationality);
        CREATE INDEX IF NOT EXISTS idx_imam_profiles_nationality_id ON Imam_Profiles(nationality_id);
        CREATE INDEX IF NOT EXISTS idx_imam_profiles_province_id ON Imam_Profiles(province_id);
        CREATE INDEX IF NOT EXISTS idx_imam_profiles_suburb_id ON Imam_Profiles(suburb_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Jumuah_Khutbah_Topic' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_jumuah_imam ON Jumuah_Khutbah_Topic(imam_profile_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Pearls_Of_Wisdom' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_pearls_imam ON Pearls_Of_Wisdom(imam_profile_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Medical_Reimbursement' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_medical_imam ON Medical_Reimbursement(imam_profile_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Community_Engagement' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_engagement_imam ON Community_Engagement(imam_profile_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Nikah_Bonus' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_nikah_imam ON Nikah_Bonus(imam_profile_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'New_Muslim_Bonus' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_newmuslim_imam ON New_Muslim_Bonus(imam_profile_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'New_Baby_Bonus' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_baby_imam ON New_Baby_Bonus(imam_profile_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Province' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_province_country ON Province(country_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Suburb' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_suburb_province ON Suburb(province_id);
    END IF;
END $$;

-- ============================================================
-- IMAM MODULE REFACTOR: Remove center_id, Add Location Fields
-- (Safe migration for existing databases - runs after all tables are created)
-- ============================================================
DO $$
BEGIN
    -- Only run if tables exist (for existing database migrations)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Imam_Profiles' AND table_schema = current_schema()) THEN
        RETURN;
    END IF;

    -- Remove Nationality column and its foreign key constraint if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_imam_nationality' AND table_name = 'Imam_Profiles' AND table_schema = current_schema()) THEN
        ALTER TABLE Imam_Profiles DROP CONSTRAINT fk_imam_nationality;
        RAISE NOTICE 'Dropped fk_imam_nationality constraint';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'Nationality' AND table_schema = current_schema()) THEN
        ALTER TABLE Imam_Profiles DROP COLUMN "Nationality";
        RAISE NOTICE 'Dropped Nationality column from Imam_Profiles';
    END IF;

    -- Add employee_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Imam_Profiles' AND column_name = 'employee_id' AND table_schema = current_schema()) THEN
        ALTER TABLE Imam_Profiles ADD COLUMN employee_id BIGINT;
        RAISE NOTICE 'Added employee_id column to Imam_Profiles';
    END IF;

    -- Add unique constraint on employee_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Imam_Profiles' 
        AND constraint_name = 'uq_imam_employee' 
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Imam_Profiles ADD CONSTRAINT uq_imam_employee UNIQUE (employee_id);
        RAISE NOTICE 'Added unique constraint uq_imam_employee';
    END IF;

    -- Add foreign key constraint on employee_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Imam_Profiles' 
        AND constraint_name = 'fk_imam_employee' 
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Imam_Profiles ADD CONSTRAINT fk_imam_employee FOREIGN KEY (employee_id) REFERENCES Employee(ID);
        RAISE NOTICE 'Added foreign key constraint fk_imam_employee';
    END IF;

    -- Remove center_id from Imam_Profiles and all child tables
    -- Step 1: Drop foreign key constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Imam_Profiles' 
        AND constraint_name = 'fk_imam_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Imam_Profiles DROP CONSTRAINT fk_imam_center_id;
        RAISE NOTICE 'Dropped fk_imam_center_id constraint';
    END IF;

    -- Drop center_id from child tables
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Jumuah_Khutbah_Topic' 
        AND constraint_name = 'fk_jumuah_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Jumuah_Khutbah_Topic DROP CONSTRAINT fk_jumuah_center_id;
        RAISE NOTICE 'Dropped fk_jumuah_center_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Jumuah_Audio_Khutbah' 
        AND constraint_name = 'fk_audio_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Jumuah_Audio_Khutbah DROP CONSTRAINT fk_audio_center_id;
        RAISE NOTICE 'Dropped fk_audio_center_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Pearls_Of_Wisdom' 
        AND constraint_name = 'fk_pearls_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Pearls_Of_Wisdom DROP CONSTRAINT fk_pearls_center_id;
        RAISE NOTICE 'Dropped fk_pearls_center_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Medical_Reimbursement' 
        AND constraint_name = 'fk_medical_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Medical_Reimbursement DROP CONSTRAINT fk_medical_center_id;
        RAISE NOTICE 'Dropped fk_medical_center_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Community_Engagement' 
        AND constraint_name = 'fk_engagement_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Community_Engagement DROP CONSTRAINT fk_engagement_center_id;
        RAISE NOTICE 'Dropped fk_engagement_center_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Nikah_Bonus' 
        AND constraint_name = 'fk_nikah_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Nikah_Bonus DROP CONSTRAINT fk_nikah_center_id;
        RAISE NOTICE 'Dropped fk_nikah_center_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'New_Muslim_Bonus' 
        AND constraint_name = 'fk_newmuslim_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE New_Muslim_Bonus DROP CONSTRAINT fk_newmuslim_center_id;
        RAISE NOTICE 'Dropped fk_newmuslim_center_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'New_Baby_Bonus' 
        AND constraint_name = 'fk_baby_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE New_Baby_Bonus DROP CONSTRAINT fk_baby_center_id;
        RAISE NOTICE 'Dropped fk_baby_center_id constraint';
    END IF;

    -- Step 2: Drop indexes
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_imam_profiles_center'
        AND schemaname = current_schema()
    ) THEN
        DROP INDEX IF EXISTS idx_imam_profiles_center;
        RAISE NOTICE 'Dropped idx_imam_profiles_center index';
    END IF;

    -- Step 3: Drop center_id columns
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Imam_Profiles' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Imam_Profiles DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from Imam_Profiles';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Jumuah_Khutbah_Topic' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Jumuah_Khutbah_Topic DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from Jumuah_Khutbah_Topic';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Jumuah_Audio_Khutbah' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Jumuah_Audio_Khutbah DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from Jumuah_Audio_Khutbah';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Pearls_Of_Wisdom' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Pearls_Of_Wisdom DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from Pearls_Of_Wisdom';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Medical_Reimbursement' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Medical_Reimbursement DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from Medical_Reimbursement';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Community_Engagement' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Community_Engagement DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from Community_Engagement';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Nikah_Bonus' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Nikah_Bonus DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from Nikah_Bonus';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'New_Muslim_Bonus' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE New_Muslim_Bonus DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from New_Muslim_Bonus';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'New_Baby_Bonus' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE New_Baby_Bonus DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from New_Baby_Bonus';
    END IF;

    -- Step 4: Add location fields to Imam_Profiles (only if they don't exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Imam_Profiles' 
        AND column_name = 'nationality_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Imam_Profiles ADD COLUMN nationality_id BIGINT;
        RAISE NOTICE 'Added nationality_id to Imam_Profiles';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Imam_Profiles' 
        AND column_name = 'province_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Imam_Profiles ADD COLUMN province_id BIGINT;
        RAISE NOTICE 'Added province_id to Imam_Profiles';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Imam_Profiles' 
        AND column_name = 'suburb_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Imam_Profiles ADD COLUMN suburb_id BIGINT;
        RAISE NOTICE 'Added suburb_id to Imam_Profiles';
    END IF;

    -- Step 5: Add foreign key constraints for location fields (only if Country/Province/Suburb tables exist)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Country' AND table_schema = current_schema()) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'Imam_Profiles' 
            AND constraint_name = 'fk_imam_nationality_id'
            AND table_schema = current_schema()
        ) THEN
            ALTER TABLE Imam_Profiles 
            ADD CONSTRAINT fk_imam_nationality_id FOREIGN KEY (nationality_id) REFERENCES Country(ID);
            RAISE NOTICE 'Added fk_imam_nationality_id constraint';
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Province' AND table_schema = current_schema()) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'Imam_Profiles' 
            AND constraint_name = 'fk_imam_province_id'
            AND table_schema = current_schema()
        ) THEN
            ALTER TABLE Imam_Profiles 
            ADD CONSTRAINT fk_imam_province_id FOREIGN KEY (province_id) REFERENCES Province(ID);
            RAISE NOTICE 'Added fk_imam_province_id constraint';
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Suburb' AND table_schema = current_schema()) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'Imam_Profiles' 
            AND constraint_name = 'fk_imam_suburb_id'
            AND table_schema = current_schema()
        ) THEN
            ALTER TABLE Imam_Profiles 
            ADD CONSTRAINT fk_imam_suburb_id FOREIGN KEY (suburb_id) REFERENCES Suburb(ID);
            RAISE NOTICE 'Added fk_imam_suburb_id constraint';
        END IF;
    END IF;

    -- Step 6: Create indexes for location fields (if they don't exist)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_imam_profiles_nationality_id'
        AND schemaname = current_schema()
    ) THEN
        CREATE INDEX idx_imam_profiles_nationality_id ON Imam_Profiles(nationality_id);
        RAISE NOTICE 'Created idx_imam_profiles_nationality_id index';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_imam_profiles_province_id'
        AND schemaname = current_schema()
    ) THEN
        CREATE INDEX idx_imam_profiles_province_id ON Imam_Profiles(province_id);
        RAISE NOTICE 'Created idx_imam_profiles_province_id index';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_imam_profiles_suburb_id'
        AND schemaname = current_schema()
    ) THEN
        CREATE INDEX idx_imam_profiles_suburb_id ON Imam_Profiles(suburb_id);
        RAISE NOTICE 'Created idx_imam_profiles_suburb_id index';
    END IF;
END $$;

-- ============================================================
-- PHASE 1: REMOVE ALL center_id REFERENCES (MANDATORY)
-- Safe migration for existing databases
-- ============================================================
DO $$
DECLARE
    constraint_rec RECORD;
    index_rec RECORD;
    column_rec RECORD;
BEGIN
    -- Step 1: Drop all foreign key constraints related to center_id/Center_ID
    FOR constraint_rec IN
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = current_schema()
        AND (
            tc.constraint_name LIKE '%center_id%' OR
            tc.constraint_name LIKE '%Center_ID%' OR
            tc.constraint_name LIKE '%center%'
        )
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                constraint_rec.table_name, constraint_rec.constraint_name);
            RAISE NOTICE 'Dropped constraint % from table %', 
                constraint_rec.constraint_name, constraint_rec.table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop constraint % from table %: %', 
                constraint_rec.constraint_name, constraint_rec.table_name, SQLERRM;
        END;
    END LOOP;

    -- Step 2: Drop check constraint on Employee table
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Employee' 
        AND constraint_name = 'chk_app_admin_no_center'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Employee DROP CONSTRAINT IF EXISTS chk_app_admin_no_center;
        RAISE NOTICE 'Dropped chk_app_admin_no_center constraint';
    END IF;

    -- Step 3: Drop all indexes on center_id/Center_ID
    FOR index_rec IN
        SELECT indexname, tablename
        FROM pg_indexes
        WHERE schemaname = current_schema()
        AND (
            indexname LIKE '%center_id%' OR
            indexname LIKE '%Center_ID%' OR
            indexname LIKE '%center%'
        )
    LOOP
        BEGIN
            EXECUTE format('DROP INDEX IF EXISTS %I', index_rec.indexname);
            RAISE NOTICE 'Dropped index % from table %', 
                index_rec.indexname, index_rec.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop index %: %', index_rec.indexname, SQLERRM;
        END;
    END LOOP;

    -- Step 4: Drop center_id/Center_ID columns from all tables
    FOR column_rec IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = current_schema()
        AND (
            column_name = 'center_id' OR
            column_name = 'Center_ID'
        )
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS %I', 
                column_rec.table_name, column_rec.column_name);
            RAISE NOTICE 'Dropped column % from table %', 
                column_rec.column_name, column_rec.table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop column % from table %: %', 
                column_rec.column_name, column_rec.table_name, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE 'Completed center_id removal migration';
END $$;

-- Views
CREATE OR REPLACE VIEW Service_Rating_With_Score AS
SELECT
    sr.*,
    ROUND((
        (COALESCE(sr.Overall_Experience, 0) +
         COALESCE(sr.Respect_And_Dignity, 0) +
         COALESCE(sr.Communication_And_Clarity, 0) +
         COALESCE(sr.Timeliness_Of_Support, 0) +
         COALESCE(sr.Fairness_And_Equality, 0) +
         COALESCE(sr.Usefulness_Of_Service, 0) +
         COALESCE(sr.Friendliness_Of_Staff, 0))::numeric
        / NULLIF(
            (CASE WHEN sr.Overall_Experience IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN sr.Respect_And_Dignity IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN sr.Communication_And_Clarity IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN sr.Timeliness_Of_Support IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN sr.Fairness_And_Equality IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN sr.Usefulness_Of_Service IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN sr.Friendliness_Of_Staff IS NOT NULL THEN 1 ELSE 0 END),
            0
        )
    ), 2) AS average_score_out_of_5
FROM Service_Rating sr;

-- Insert Statements
INSERT INTO File_Status (Name) VALUES
    ('Active'),
    ('Inactive'),
    ('Once Off');

INSERT INTO File_Condition (Name) VALUES
    ('Satisfactory'),
    ('Caution'),
    ('High Risk');

INSERT INTO Dwelling_Status (Name) VALUES
    ('Fully Owned'),
    ('Bonded Owned'),
    ('Renting');

INSERT INTO Race (Name) VALUES
    ('African'),
    ('Asian'),
    ('Caucasian'),
    ('Coloured'),
    ('Malay');

INSERT INTO Dwelling_Type (Name) VALUES
    ('House'),
    ('Flat'),
    ('Hostel'),
    ('Hotel'),
    ('Backroom'),
    ('Homeless/On Street'),
    ('Old Age Home'),
    ('Shack'),
    ('Shelter');

INSERT INTO Marital_Status (Name) VALUES
    ('Single'),
    ('Nikah'),
    ('Married Not Islamic'),
    ('Talaq'),
    ('Widow'),
    ('Widower');

INSERT INTO Education_Level (Name) VALUES
    ('Grade 1-7'),
    ('Grade 8-11'),
    ('Matric - NQF 4'),
    ('Higher Certificate - NQF 5'),
    ('Diploma - NQF 6'),
    ('Degree - NQF 7'),
    ('Honours Degree - NQF 8'),
    ('Masters Degree - NQF 9'),
    ('PhD - NQF 10'),
    ('Doctorate - NQF 11');

INSERT INTO Means_of_communication (Name) VALUES
    ('Email'),
    ('Verbally'),
    ('Phone');

INSERT INTO Employment_Status (Name) VALUES
    ('Unemployed'),
    ('Student'),
    ('Full Time Employed'),
    ('Part-time Employed'),
    ('Disabled Grant'),
    ('Pensioner'),
    ('Self Employed');

INSERT INTO Gender (Name) VALUES
    ('Male'),
    ('Female');

INSERT INTO Training_Outcome (Name) VALUES
    ('Completed'),
    ('Certified'),
    ('Failed'),
    ('No Applicable');

INSERT INTO Training_Level (Name) VALUES
    ('NQF 4'),
    ('NQF 5'),
    ('NQF 6'),
    ('NQF 7'),
    ('NQF 8'),
    ('No Applicable');

INSERT INTO Blood_Type (Name) VALUES
    ('A Positive'),
    ('B Negative'),
    ('AB Negative'),
    ('AB Positive'),
    ('B Positive'),
    ('O Positive'),
    ('O Negative'),
    ('Rh-null');

INSERT INTO Rating (Score) VALUES
    (1),
    (2),
    (3),
    (4),
    (5);

INSERT INTO User_Types (Name) VALUES
    ('App Admin'),
    ('HQ'),
    ('Org. Admin'),
    ('Org. Executives'),
    ('Org. Caseworkers'),
    ('Imam User'),
    ('Admin');

INSERT INTO Tasks_Status (Name) VALUES
    ('Complete'),
    ('Incomplete'),
    ('In Progress');

INSERT INTO Nationality (Name) VALUES
    ('Angola'),
    ('Congo'),
    ('Equatorial Guinea'),
    ('Kenya'),
    ('Mozambique'),
    ('Nigeria'),
    ('Uganda'),
    ('India'),
    ('Botswana'),
    ('Central African Republic'),
    ('Ghana'),
    ('Malawi'),
    ('Pakistan'),
    ('South African'),
    ('Bangladesh'),
    ('Somalian'),
    ('Lesotho'),
    ('Ivory Coast'),
    ('Burundi');

INSERT INTO Born_Religion (Name) VALUES
    ('African beliefs'),
    ('Christianity'),
    ('Hinduism'),
    ('Islam'),
    ('Judaism');

INSERT INTO Period_As_Muslim (Name) VALUES
    ('1-3 Years'),
    ('3-7 Years'),
    ('7-14 Years');

INSERT INTO Hadith (Hadith_Arabic, Hadith_English, Created_By, Updated_By) VALUES
(
    'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
    'Actions are judged by intentions.',
    'admin',
    'admin'
),
(
    'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ صَالِحَ الأَخْلَاقِ',
    'I was sent to perfect good character.',
    'admin',
    'admin'
),
(
    'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَٰنُ',
    'The Most Merciful shows mercy to those who are merciful.',
    'admin',
    'admin'
),
(
    'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    'Smiling at your brother is a charity.',
    'admin',
    'admin'
),
(
    'يَسِّرُوا وَلَا تُعَسِّرُوا',
    'Make things easy and do not make them difficult.',
    'admin',
    'admin'
),
(
    'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    'None of you truly believes until he loves for his brother what he loves for himself.',
    'admin',
    'admin'
),
(
    'اللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ',
    'Allah helps His servant as long as the servant helps his brother.',
    'admin',
    'admin'
),
(
    'مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ',
    'Part of a man’s good Islam is leaving what does not concern him.',
    'admin',
    'admin'
),
(
    'الطُّهُورُ شَطْرُ الإِيمَانِ',
    'Purity is half of faith.',
    'admin',
    'admin'
),
(
    'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ',
    'The strong believer is better and more beloved to Allah than the weak believer.',
    'admin',
    'admin'
);


INSERT INTO Training_Courses (Name) VALUES
    ('First Aid'),
    ('Fire Fighter'),
    ('Time Management');

INSERT INTO Training_Institutions (Institute_Name, Seta_Number) VALUES
    ('Mancosa', '17289'),
    ('UNISA', '81213');

INSERT INTO Income_Type (Name) VALUES
    ('Salary'),
    ('Child Grant'),
    ('Pension');

INSERT INTO Expense_Type (Name) VALUES
    ('Rent'),
    ('Utilities'),
    ('Food');

INSERT INTO Assistance_Types (Name) VALUES
    ('Food Voucher'),
    ('Medical Aid'),
    ('Education Grant');

INSERT INTO Suburb (Name) VALUES
    ('ABC'),
    ('DEF'),
    ('XZY');

INSERT INTO Health_Conditions (Name) VALUES
    ('None'),
    ('Diabetes'),
    ('Hypertension');

INSERT INTO Skills (Name) VALUES
    ('Basic Literacy'),
    ('Computer Skills'),
    ('Driving');

INSERT INTO Relationship_Types (Name) VALUES
    ('Spouse'),
    ('Child'),
    ('Parent');

INSERT INTO Policy_Procedure_Type (Name) VALUES
    ('Policy'),
    ('Procedure');

INSERT INTO Policy_Procedure_Field (Name) VALUES
    ('Compliance'),
    ('Training'),
    ('Safety Protocols');

-- Update audit fields for existing data
UPDATE File_Status SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE File_Condition SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Dwelling_Status SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Race SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Dwelling_Type SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Marital_Status SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Education_Level SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Employment_Status SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Gender SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Training_Outcome SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Training_Level SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Blood_Type SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Rating SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE User_Types SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Tasks_Status SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Nationality SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Born_Religion SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Period_As_Muslim SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Means_of_communication SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Training_Courses SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Training_Institutions SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Income_Type SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Expense_Type SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Assistance_Types SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Suburb SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Health_Conditions SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Skills SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Relationship_Types SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Policy_Procedure_Type SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
UPDATE Policy_Procedure_Field SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();

-- Insert into Policy_and_Procedure
INSERT INTO Policy_and_Procedure (
    Name, Description, Type, Date_Of_Publication, Status, Field, Created_By
) VALUES
    ('Employee Safety Policy', 'Safety guidelines for staff',
     (SELECT ID FROM Policy_Procedure_Type WHERE Name = 'Policy' LIMIT 1),
     '2023-06-01',
     (SELECT ID FROM File_Status WHERE Name = 'Active' LIMIT 1),
     (SELECT ID FROM Policy_Procedure_Field WHERE Name = 'Compliance' LIMIT 1),
     'admin')
ON CONFLICT DO NOTHING;

-- ✅ Seed Test Users with proper role assignments
-- User 1: App Admin
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Super', 'Admin', 'admin', '12345', 1,
    1, 14, 1, 1, 3,
    '+27123456789', '+27123456789', 1, NULL, NULL, 'system', 'system'
);

INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Admin', 'User', 'adminuser', '12345', 7,
    1, 14, 1, 1, 3,
    '+27123456789', '+27123456789', 1, NULL, NULL, 'system', 'system'
);


-- Insert into Hampers
INSERT INTO Hampers (Name, Created_By) VALUES
    ('Basic Food Hamper', 'admin'),
    ('Emergency Food Hamper', 'admin'),
    ('Special Dietary Hamper', 'admin');


-- Insert into Service_Rating
INSERT INTO Service_Rating (
    Overall_Experience, Respect_And_Dignity, Communication_And_Clarity, Timeliness_Of_Support, 
    Fairness_And_Equality, Usefulness_Of_Service, Friendliness_Of_Staff, Positive_Impact, 
    Access_Ease, Would_Recommend, Appreciate_Most, How_To_Improve, Other_Comments, Created_By
) VALUES
    (4, 5, 4, 3, 4, 5, 4, TRUE, 4, TRUE, 'Friendly staff', 'Faster response times', 
     'Great service overall', 'admin');

-- Insert into Folders
INSERT INTO Folders (
    Name, Employee_ID, Created_By
) VALUES
    ('Case Files 2024', 1, 'admin');

-- Insert into Personal_Files
INSERT INTO Personal_Files (
    Name, Folder_ID, Employee_ID, Created_By
) VALUES
    ('Performance Review Q1', (SELECT ID FROM Folders WHERE Name = 'Case Files 2024'), 1, 'admin');

-- ============================================================
-- COUNTRY DATA INSERT SCRIPT
-- ============================================================
-- Generated: 2025-12-21T14:51:39.578045
-- Source: REST Countries API (https://restcountries.com)
-- Total Countries: 250
-- ============================================================
-- 
-- This script automatically fixes the Suburb table UNIQUE constraint
-- to allow same suburb names in different provinces (e.g., "London").
-- ============================================================

-- ============================================================
-- STEP 1: FIX SUBURB TABLE STRUCTURE AND CONSTRAINT
-- ============================================================
-- This ensures province_id exists, drops old UNIQUE constraint, and adds composite constraint
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    -- Step 1: Add province_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE LOWER(table_name) = 'suburb' 
        AND LOWER(column_name) = 'province_id'
        AND table_schema = current_schema()
    ) THEN
        BEGIN
            ALTER TABLE Suburb ADD COLUMN province_id BIGINT;
            RAISE NOTICE 'Added province_id column to Suburb table';
        EXCEPTION
            WHEN duplicate_column THEN
                RAISE NOTICE 'province_id column already exists (caught exception)';
        END;
    ELSE
        RAISE NOTICE 'province_id column already exists';
    END IF;
    
    -- Add foreign key constraint if it doesn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE LOWER(table_name) = 'province' 
        AND table_schema = current_schema()
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE LOWER(table_name) = 'suburb'
            AND constraint_name = 'fk_suburb_province'
            AND table_schema = current_schema()
        ) THEN
            BEGIN
                ALTER TABLE Suburb 
                ADD CONSTRAINT fk_suburb_province FOREIGN KEY (province_id) REFERENCES Province(ID);
                RAISE NOTICE 'Added foreign key constraint fk_suburb_province';
            EXCEPTION
                WHEN duplicate_object THEN
                    RAISE NOTICE 'Foreign key constraint fk_suburb_province already exists';
            END;
        ELSE
            RAISE NOTICE 'Foreign key constraint fk_suburb_province already exists';
        END IF;
    END IF;
    
    -- Step 2: Drop ALL UNIQUE constraints on Suburb that involve Name
    -- First, try to drop the known constraint name directly
    BEGIN
        ALTER TABLE Suburb DROP CONSTRAINT IF EXISTS suburb_name_key;
        RAISE NOTICE 'Attempted to drop constraint: suburb_name_key';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop suburb_name_key: %', SQLERRM;
    END;
    
    -- Also find and drop any other UNIQUE constraints on Suburb.Name alone
    FOR constraint_rec IN
        SELECT DISTINCT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
            AND tc.table_schema = ccu.table_schema
        WHERE LOWER(tc.table_name) = 'suburb' 
        AND tc.constraint_type = 'UNIQUE'
        AND LOWER(ccu.column_name) = 'name'
        AND tc.table_schema = current_schema()
        AND tc.constraint_name != 'uq_suburb_province'  -- Don't drop the composite one we want
        AND NOT EXISTS (
            -- Exclude composite constraints (those with multiple columns)
            SELECT 1 
            FROM information_schema.constraint_column_usage ccu2
            WHERE ccu2.constraint_name = tc.constraint_name
            AND ccu2.table_schema = tc.table_schema
            AND LOWER(ccu2.column_name) != 'name'
        )
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE Suburb DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_rec.constraint_name);
            RAISE NOTICE 'Dropped UNIQUE constraint: %', constraint_rec.constraint_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop constraint %: %', constraint_rec.constraint_name, SQLERRM;
        END;
    END LOOP;
    
    -- Step 3: Add composite UNIQUE constraint on (Name, province_id) if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'Suburb' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name = 'uq_suburb_province'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Suburb 
        ADD CONSTRAINT uq_suburb_province UNIQUE (Name, province_id);
        RAISE NOTICE 'Added composite UNIQUE constraint: uq_suburb_province (Name, province_id)';
    ELSE
        RAISE NOTICE 'Composite UNIQUE constraint already exists: uq_suburb_province';
    END IF;
END $$;

-- ============================================================
-- STEP 2: INSERT COUNTRY DATA
-- ============================================================

INSERT INTO Country (Name, Code, Created_By, Updated_By)
VALUES
    ('Antigua and Barbuda', 'AG', 'system', 'system'),
    ('Bhutan', 'BT', 'system', 'system'),
    ('Italy', 'IT', 'system', 'system'),
    ('Tuvalu', 'TV', 'system', 'system'),
    ('Anguilla', 'AI', 'system', 'system'),
    ('Australia', 'AU', 'system', 'system'),
    ('Belize', 'BZ', 'system', 'system'),
    ('Vanuatu', 'VU', 'system', 'system'),
    ('Belarus', 'BY', 'system', 'system'),
    ('Mauritius', 'MU', 'system', 'system'),
    ('Laos', 'LA', 'system', 'system'),
    ('Senegal', 'SN', 'system', 'system'),
    ('Turkey', 'TR', 'system', 'system'),
    ('Bolivia', 'BO', 'system', 'system'),
    ('Sri Lanka', 'LK', 'system', 'system'),
    ('Norfolk Island', 'NF', 'system', 'system'),
    ('China', 'CN', 'system', 'system'),
    ('Caribbean Netherlands', 'BQ', 'system', 'system'),
    ('Guernsey', 'GG', 'system', 'system'),
    ('Sudan', 'SD', 'system', 'system'),
    ('Mayotte', 'YT', 'system', 'system'),
    ('Saint Barthélemy', 'BL', 'system', 'system'),
    ('Vatican City', 'VA', 'system', 'system'),
    ('Turks and Caicos Islands', 'TC', 'system', 'system'),
    ('Curaçao', 'CW', 'system', 'system'),
    ('Botswana', 'BW', 'system', 'system'),
    ('Benin', 'BJ', 'system', 'system'),
    ('Lithuania', 'LT', 'system', 'system'),
    ('Montserrat', 'MS', 'system', 'system'),
    ('British Virgin Islands', 'VG', 'system', 'system'),
    ('Burundi', 'BI', 'system', 'system'),
    ('United States Minor Outlying Islands', 'UM', 'system', 'system'),
    ('Ireland', 'IE', 'system', 'system'),
    ('Solomon Islands', 'SB', 'system', 'system'),
    ('Bermuda', 'BM', 'system', 'system'),
    ('Finland', 'FI', 'system', 'system'),
    ('Peru', 'PE', 'system', 'system'),
    ('Bangladesh', 'BD', 'system', 'system'),
    ('Denmark', 'DK', 'system', 'system'),
    ('Saint Vincent and the Grenadines', 'VC', 'system', 'system'),
    ('Dominican Republic', 'DO', 'system', 'system'),
    ('Moldova', 'MD', 'system', 'system'),
    ('Bulgaria', 'BG', 'system', 'system'),
    ('Costa Rica', 'CR', 'system', 'system'),
    ('Namibia', 'NA', 'system', 'system'),
    ('Svalbard and Jan Mayen', 'SJ', 'system', 'system'),
    ('Luxembourg', 'LU', 'system', 'system'),
    ('Russia', 'RU', 'system', 'system'),
    ('United Arab Emirates', 'AE', 'system', 'system'),
    ('Sint Maarten', 'SX', 'system', 'system'),
    ('Bahamas', 'BS', 'system', 'system'),
    ('Japan', 'JP', 'system', 'system'),
    ('Nigeria', 'NG', 'system', 'system'),
    ('Ghana', 'GH', 'system', 'system'),
    ('Sierra Leone', 'SL', 'system', 'system'),
    ('Saint Pierre and Miquelon', 'PM', 'system', 'system'),
    ('Albania', 'AL', 'system', 'system'),
    ('Tokelau', 'TK', 'system', 'system'),
    ('Saint Helena, Ascension and Tristan da Cunha', 'SH', 'system', 'system'),
    ('Tonga', 'TO', 'system', 'system'),
    ('Turkmenistan', 'TM', 'system', 'system'),
    ('Djibouti', 'DJ', 'system', 'system'),
    ('Central African Republic', 'CF', 'system', 'system'),
    ('Lebanon', 'LB', 'system', 'system'),
    ('Latvia', 'LV', 'system', 'system'),
    ('Cocos (Keeling) Islands', 'CC', 'system', 'system'),
    ('Gambia', 'GM', 'system', 'system'),
    ('Honduras', 'HN', 'system', 'system'),
    ('Niue', 'NU', 'system', 'system'),
    ('Mauritania', 'MR', 'system', 'system'),
    ('Kosovo', 'XK', 'system', 'system'),
    ('Wallis and Futuna', 'WF', 'system', 'system'),
    ('South Georgia', 'GS', 'system', 'system'),
    ('French Polynesia', 'PF', 'system', 'system'),
    ('Togo', 'TG', 'system', 'system'),
    ('Belgium', 'BE', 'system', 'system'),
    ('Zambia', 'ZM', 'system', 'system'),
    ('Cayman Islands', 'KY', 'system', 'system'),
    ('Pitcairn Islands', 'PN', 'system', 'system'),
    ('Cook Islands', 'CK', 'system', 'system'),
    ('Madagascar', 'MG', 'system', 'system'),
    ('Montenegro', 'ME', 'system', 'system'),
    ('South Korea', 'KR', 'system', 'system'),
    ('Ethiopia', 'ET', 'system', 'system'),
    ('Mongolia', 'MN', 'system', 'system'),
    ('Slovakia', 'SK', 'system', 'system'),
    ('Cuba', 'CU', 'system', 'system'),
    ('Antarctica', 'AQ', 'system', 'system'),
    ('Guatemala', 'GT', 'system', 'system'),
    ('French Guiana', 'GF', 'system', 'system'),
    ('Norway', 'NO', 'system', 'system'),
    ('Grenada', 'GD', 'system', 'system'),
    ('Réunion', 'RE', 'system', 'system'),
    ('Chile', 'CL', 'system', 'system'),
    ('Colombia', 'CO', 'system', 'system'),
    ('Saudi Arabia', 'SA', 'system', 'system'),
    ('Israel', 'IL', 'system', 'system'),
    ('Germany', 'DE', 'system', 'system'),
    ('New Zealand', 'NZ', 'system', 'system'),
    ('Greenland', 'GL', 'system', 'system'),
    ('Kyrgyzstan', 'KG', 'system', 'system'),
    ('El Salvador', 'SV', 'system', 'system'),
    ('Faroe Islands', 'FO', 'system', 'system'),
    ('Palau', 'PW', 'system', 'system'),
    ('Malta', 'MT', 'system', 'system'),
    ('Syria', 'SY', 'system', 'system'),
    ('Timor-Leste', 'TL', 'system', 'system'),
    ('Croatia', 'HR', 'system', 'system'),
    ('Papua New Guinea', 'PG', 'system', 'system'),
    ('Netherlands', 'NL', 'system', 'system'),
    ('Liberia', 'LR', 'system', 'system'),
    ('Somalia', 'SO', 'system', 'system'),
    ('Venezuela', 'VE', 'system', 'system'),
    ('Haiti', 'HT', 'system', 'system'),
    ('Algeria', 'DZ', 'system', 'system'),
    ('Northern Mariana Islands', 'MP', 'system', 'system'),
    ('Saint Martin', 'MF', 'system', 'system'),
    ('Heard Island and McDonald Islands', 'HM', 'system', 'system'),
    ('Aruba', 'AW', 'system', 'system'),
    ('Egypt', 'EG', 'system', 'system'),
    ('Malawi', 'MW', 'system', 'system'),
    ('Equatorial Guinea', 'GQ', 'system', 'system'),
    ('United States Virgin Islands', 'VI', 'system', 'system'),
    ('Ecuador', 'EC', 'system', 'system'),
    ('Uzbekistan', 'UZ', 'system', 'system'),
    ('Gabon', 'GA', 'system', 'system'),
    ('South Sudan', 'SS', 'system', 'system'),
    ('Iran', 'IR', 'system', 'system'),
    ('Kazakhstan', 'KZ', 'system', 'system'),
    ('Nicaragua', 'NI', 'system', 'system'),
    ('Iceland', 'IS', 'system', 'system'),
    ('Slovenia', 'SI', 'system', 'system'),
    ('Guadeloupe', 'GP', 'system', 'system'),
    ('Cameroon', 'CM', 'system', 'system'),
    ('Argentina', 'AR', 'system', 'system'),
    ('Azerbaijan', 'AZ', 'system', 'system'),
    ('Uganda', 'UG', 'system', 'system'),
    ('Niger', 'NE', 'system', 'system'),
    ('Christmas Island', 'CX', 'system', 'system'),
    ('Myanmar', 'MM', 'system', 'system'),
    ('Poland', 'PL', 'system', 'system'),
    ('Jordan', 'JO', 'system', 'system'),
    ('Hong Kong', 'HK', 'system', 'system'),
    ('DR Congo', 'CD', 'system', 'system'),
    ('Eritrea', 'ER', 'system', 'system'),
    ('Kiribati', 'KI', 'system', 'system'),
    ('Marshall Islands', 'MH', 'system', 'system'),
    ('Burkina Faso', 'BF', 'system', 'system'),
    ('Zimbabwe', 'ZW', 'system', 'system'),
    ('Kenya', 'KE', 'system', 'system'),
    ('Comoros', 'KM', 'system', 'system'),
    ('Gibraltar', 'GI', 'system', 'system'),
    ('Brunei', 'BN', 'system', 'system'),
    ('Sweden', 'SE', 'system', 'system'),
    ('Lesotho', 'LS', 'system', 'system'),
    ('Isle of Man', 'IM', 'system', 'system'),
    ('Micronesia', 'FM', 'system', 'system'),
    ('Tanzania', 'TZ', 'system', 'system'),
    ('Cape Verde', 'CV', 'system', 'system'),
    ('Afghanistan', 'AF', 'system', 'system'),
    ('Andorra', 'AD', 'system', 'system'),
    ('Greece', 'GR', 'system', 'system'),
    ('Vietnam', 'VN', 'system', 'system'),
    ('French Southern and Antarctic Lands', 'TF', 'system', 'system'),
    ('Iraq', 'IQ', 'system', 'system'),
    ('Libya', 'LY', 'system', 'system'),
    ('Portugal', 'PT', 'system', 'system'),
    ('Pakistan', 'PK', 'system', 'system'),
    ('Maldives', 'MV', 'system', 'system'),
    ('Morocco', 'MA', 'system', 'system'),
    ('Bosnia and Herzegovina', 'BA', 'system', 'system'),
    ('Samoa', 'WS', 'system', 'system'),
    ('Palestine', 'PS', 'system', 'system'),
    ('Oman', 'OM', 'system', 'system'),
    ('Bahrain', 'BH', 'system', 'system'),
    ('United States', 'US', 'system', 'system'),
    ('Puerto Rico', 'PR', 'system', 'system'),
    ('British Indian Ocean Territory', 'IO', 'system', 'system'),
    ('Jersey', 'JE', 'system', 'system'),
    ('North Macedonia', 'MK', 'system', 'system'),
    ('Tunisia', 'TN', 'system', 'system'),
    ('Trinidad and Tobago', 'TT', 'system', 'system'),
    ('Estonia', 'EE', 'system', 'system'),
    ('Singapore', 'SG', 'system', 'system'),
    ('Panama', 'PA', 'system', 'system'),
    ('Switzerland', 'CH', 'system', 'system'),
    ('Uruguay', 'UY', 'system', 'system'),
    ('Tajikistan', 'TJ', 'system', 'system'),
    ('Taiwan', 'TW', 'system', 'system'),
    ('South Africa', 'ZA', 'system', 'system'),
    ('Liechtenstein', 'LI', 'system', 'system'),
    ('Brazil', 'BR', 'system', 'system'),
    ('Armenia', 'AM', 'system', 'system'),
    ('Georgia', 'GE', 'system', 'system'),
    ('Åland Islands', 'AX', 'system', 'system'),
    ('Qatar', 'QA', 'system', 'system'),
    ('Dominica', 'DM', 'system', 'system'),
    ('Ukraine', 'UA', 'system', 'system'),
    ('Guinea', 'GN', 'system', 'system'),
    ('Macau', 'MO', 'system', 'system'),
    ('Western Sahara', 'EH', 'system', 'system'),
    ('Czechia', 'CZ', 'system', 'system'),
    ('Austria', 'AT', 'system', 'system'),
    ('Saint Kitts and Nevis', 'KN', 'system', 'system'),
    ('Saint Lucia', 'LC', 'system', 'system'),
    ('Yemen', 'YE', 'system', 'system'),
    ('Rwanda', 'RW', 'system', 'system'),
    ('Monaco', 'MC', 'system', 'system'),
    ('São Tomé and Príncipe', 'ST', 'system', 'system'),
    ('Republic of the Congo', 'CG', 'system', 'system'),
    ('Paraguay', 'PY', 'system', 'system'),
    ('Bouvet Island', 'BV', 'system', 'system'),
    ('Mozambique', 'MZ', 'system', 'system'),
    ('France', 'FR', 'system', 'system'),
    ('Eswatini', 'SZ', 'system', 'system'),
    ('Barbados', 'BB', 'system', 'system'),
    ('Spain', 'ES', 'system', 'system'),
    ('Thailand', 'TH', 'system', 'system'),
    ('Guinea-Bissau', 'GW', 'system', 'system'),
    ('Angola', 'AO', 'system', 'system'),
    ('India', 'IN', 'system', 'system'),
    ('Martinique', 'MQ', 'system', 'system'),
    ('New Caledonia', 'NC', 'system', 'system'),
    ('Seychelles', 'SC', 'system', 'system'),
    ('Falkland Islands', 'FK', 'system', 'system'),
    ('United Kingdom', 'GB', 'system', 'system'),
    ('Fiji', 'FJ', 'system', 'system'),
    ('San Marino', 'SM', 'system', 'system'),
    ('Mali', 'ML', 'system', 'system'),
    ('Canada', 'CA', 'system', 'system'),
    ('Jamaica', 'JM', 'system', 'system'),
    ('Nauru', 'NR', 'system', 'system'),
    ('Indonesia', 'ID', 'system', 'system'),
    ('Guam', 'GU', 'system', 'system'),
    ('Ivory Coast', 'CI', 'system', 'system'),
    ('Kuwait', 'KW', 'system', 'system'),
    ('Philippines', 'PH', 'system', 'system'),
    ('Guyana', 'GY', 'system', 'system'),
    ('Hungary', 'HU', 'system', 'system'),
    ('Mexico', 'MX', 'system', 'system'),
    ('North Korea', 'KP', 'system', 'system'),
    ('Romania', 'RO', 'system', 'system'),
    ('Suriname', 'SR', 'system', 'system'),
    ('American Samoa', 'AS', 'system', 'system'),
    ('Nepal', 'NP', 'system', 'system'),
    ('Chad', 'TD', 'system', 'system'),
    ('Serbia', 'RS', 'system', 'system'),
    ('Cambodia', 'KH', 'system', 'system'),
    ('Malaysia', 'MY', 'system', 'system'),
    ('Cyprus', 'CY', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- ============================================================
-- PROVINCE/STATE DATA INSERT SCRIPT
-- ============================================================
-- Generated: 2025-12-21T14:51:39.578045
-- Source: Curated dataset for major countries
-- ============================================================

-- Total Provinces: 69

INSERT INTO Province (country_id, Name, Created_By, Updated_By)
SELECT * FROM (VALUES
    ((SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1), 'Eastern Cape', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1), 'Free State', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1), 'Gauteng', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1), 'KwaZulu-Natal', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1), 'Limpopo', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1), 'Mpumalanga', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1), 'Northern Cape', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1), 'North West', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1), 'Western Cape', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Alabama', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Alaska', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Arizona', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Arkansas', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'California', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Colorado', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Connecticut', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Delaware', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Florida', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Georgia', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Illinois', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Indiana', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Massachusetts', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Michigan', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'New Jersey', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'New York', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'North Carolina', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Ohio', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Pennsylvania', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'US' LIMIT 1), 'Texas', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Alberta', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'British Columbia', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Manitoba', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'New Brunswick', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Newfoundland and Labrador', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Northwest Territories', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Nova Scotia', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Nunavut', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Ontario', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Prince Edward Island', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Quebec', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Saskatchewan', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1), 'Yukon', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1), 'England', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1), 'Scotland', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1), 'Wales', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1), 'Northern Ireland', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1), 'New South Wales', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1), 'Victoria', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1), 'Queensland', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1), 'Western Australia', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1), 'South Australia', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1), 'Tasmania', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1), 'Northern Territory', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1), 'Australian Capital Territory', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Andhra Pradesh', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Assam', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Bihar', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Gujarat', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Haryana', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Karnataka', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Kerala', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Madhya Pradesh', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Maharashtra', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Odisha', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Punjab', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Rajasthan', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Tamil Nadu', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'Uttar Pradesh', 'system', 'system'),
    ((SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1), 'West Bengal', 'system', 'system')
) AS v(country_id, name, created_by, updated_by)
WHERE NOT EXISTS (
    SELECT 1 FROM Province p
    WHERE p.country_id = v.country_id AND p.Name = v.name
);

-- ============================================================
-- SUBURB/CITY DATA INSERT SCRIPT
-- ============================================================
-- Generated: 2025-12-21T14:51:39.578045
-- Source: Curated dataset for major provinces
-- ============================================================

-- Total Suburbs/Cities: 130

INSERT INTO Suburb (province_id, Name, Created_By, Updated_By)
SELECT * FROM (VALUES
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Johannesburg', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Pretoria', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Soweto', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Sandton', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Midrand', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Centurion', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Boksburg', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Benoni', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Germiston', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Gauteng' LIMIT 1), 'Kempton Park', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'Cape Town', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'Stellenbosch', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'Paarl', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'Worcester', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'George', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'Mossel Bay', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'Oudtshoorn', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'Knysna', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'Hermanus', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'Western Cape' LIMIT 1), 'Somerset West', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Durban', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Pietermaritzburg', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Newcastle', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Ladysmith', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Richards Bay', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Pinetown', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Amanzimtoti', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Ballito', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Umhlanga', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) AND Name = 'KwaZulu-Natal' LIMIT 1), 'Westville', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'Los Angeles', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'San Francisco', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'San Diego', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'San Jose', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'Sacramento', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'Oakland', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'Fresno', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'Long Beach', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'Santa Ana', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'California' LIMIT 1), 'Anaheim', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'New York City', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'Buffalo', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'Rochester', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'Albany', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'Syracuse', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'Yonkers', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'Utica', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'Schenectady', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'Mount Vernon', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'New York' LIMIT 1), 'Troy', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'Houston', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'Dallas', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'Austin', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'San Antonio', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'Fort Worth', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'El Paso', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'Arlington', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'Corpus Christi', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'Plano', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'US' LIMIT 1) AND Name = 'Texas' LIMIT 1), 'Laredo', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'Toronto', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'Ottawa', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'Hamilton', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'London', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'Mississauga', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'Brampton', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'Windsor', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'Kitchener', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'Markham', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'Ontario' LIMIT 1), 'Vaughan', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Vancouver', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Victoria', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Surrey', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Burnaby', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Richmond', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Kelowna', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Abbotsford', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Coquitlam', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Saanich', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'CA' LIMIT 1) AND Name = 'British Columbia' LIMIT 1), 'Langley', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'London', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'Birmingham', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'Manchester', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'Liverpool', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'Leeds', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'Sheffield', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'Bristol', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'Leicester', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'Coventry', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'GB' LIMIT 1) AND Name = 'England' LIMIT 1), 'Nottingham', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Sydney', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Newcastle', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Wollongong', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Albury', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Wagga Wagga', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Tamworth', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Orange', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Dubbo', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Nowra', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'New South Wales' LIMIT 1), 'Grafton', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Melbourne', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Geelong', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Ballarat', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Bendigo', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Shepparton', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Warrnambool', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Mildura', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Traralgon', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Horsham', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'AU' LIMIT 1) AND Name = 'Victoria' LIMIT 1), 'Colac', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Mumbai', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Pune', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Nagpur', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Nashik', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Aurangabad', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Solapur', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Amravati', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Kolhapur', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Sangli', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Maharashtra' LIMIT 1), 'Jalgaon', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Bangalore', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Mysore', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Hubli', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Mangalore', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Belgaum', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Gulbarga', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Davangere', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Bellary', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Bijapur', 'system', 'system'),
    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = 'IN' LIMIT 1) AND Name = 'Karnataka' LIMIT 1), 'Shimoga', 'system', 'system')
) AS v(province_id, name, created_by, updated_by)
WHERE NOT EXISTS (
    SELECT 1 FROM Suburb s
    WHERE s.province_id = v.province_id AND s.Name = v.name
);

-- ============================================================
-- END OF LOCATION DATA INSERT SCRIPT
-- ============================================================
-- 
-- Instructions:
-- 1. Review the generated data above
-- 2. Append this script to your schema.sql file or run it separately
-- 3. The script uses ON CONFLICT DO NOTHING to prevent duplicates
-- 4. Foreign key relationships are preserved through subqueries
-- 5. All records are created with WHO columns (created_by='system', updated_by='system')
-- 
-- Data Sources:
-- - Countries: REST Countries API (https://restcountries.com)
-- - Provinces: Curated dataset for major countries (ZA, US, CA, GB, AU, IN)
-- - Suburbs: Curated dataset for major provinces/cities
-- ============================================================

-- ============================================================
-- NEW TABLES FROM API SNAPSHOT (Status: In Progress)
-- ============================================================

-- Hardship Relief
CREATE TABLE IF NOT EXISTS hardship_relief (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    request_for BIGINT,
    is_muslim BIGINT,
    name_of_person_community TEXT,
    area_of_residence BIGINT,
    age_group TEXT,
    has_disabilities BIGINT,
    disability_details TEXT,
    dependents TEXT,
    assistance_type TEXT NOT NULL,
    amount_required_local_currency DECIMAL(12,2) NOT NULL,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_hardship_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_hardship_request_for FOREIGN KEY (request_for) REFERENCES Request_For_Lookup(ID),
    CONSTRAINT fk_hardship_is_muslim FOREIGN KEY (is_muslim) REFERENCES Yes_No_Some_Not_Lookup(ID),
    CONSTRAINT fk_hardship_area FOREIGN KEY (area_of_residence) REFERENCES Suburb(ID),
    CONSTRAINT fk_hardship_disabilities FOREIGN KEY (has_disabilities) REFERENCES Yes_No(ID),
    CONSTRAINT fk_hardship_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

-- Higher Education Request
CREATE TABLE IF NOT EXISTS higher_education_request (
    ID BIGSERIAL PRIMARY KEY,
    imam_profile_id BIGINT NOT NULL,
    course_type BIGINT,
    course_name VARCHAR(500),
    cost_local_currency DECIMAL(12,2),
    cost_south_african_rand DECIMAL(12,2),
    institute_name VARCHAR(500),
    duration BIGINT,
    start_date DATE,
    end_date DATE,
    study_method BIGINT,
    days_times_attending TEXT,
    times_per_month BIGINT,
    semesters_per_year BIGINT,
    will_stop_imam_duties BIGINT,
    course_brochure BYTEA,
    course_brochure_filename VARCHAR(255),
    course_brochure_mime VARCHAR(255),
    course_brochure_size INT,
    quotation BYTEA,
    quotation_filename VARCHAR(255),
    quotation_mime VARCHAR(255),
    quotation_size INT,
    motivation_letter BYTEA,
    motivation_letter_filename VARCHAR(255),
    motivation_letter_mime VARCHAR(255),
    motivation_letter_size INT,
    acknowledge BOOLEAN NOT NULL DEFAULT false,
    status_id BIGINT NOT NULL DEFAULT 1,
    datestamp DATE NOT NULL DEFAULT CURRENT_DATE,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_higher_ed_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_higher_ed_status FOREIGN KEY (status_id) REFERENCES Status(ID)
);

-- Borehole Construction Tasks
CREATE TABLE IF NOT EXISTS borehole_construction_tasks (
    ID BIGSERIAL PRIMARY KEY,
    borehole_id BIGINT,
    task BIGINT,
    appointed_supplier BIGINT,
    appointed_date DATE,
    estimated_completion_date DATE,
    warranty TEXT,
    cost DECIMAL(12,2),
    rating INT,
    status_id BIGINT,
    invoice BYTEA,
    invoice_filename VARCHAR(255),
    invoice_mime VARCHAR(255),
    invoice_size INT,
    datestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    comments TEXT,
    CONSTRAINT fk_borehole_construction_borehole FOREIGN KEY (borehole_id) REFERENCES borehole(ID) ON DELETE CASCADE
);

-- Borehole Repairs Matrix
CREATE TABLE IF NOT EXISTS borehole_repairs_matrix (
    ID BIGSERIAL PRIMARY KEY,
    borehole_id BIGINT NOT NULL,
    component TEXT,
    task BYTEA,
    task_filename VARCHAR(255),
    task_mime VARCHAR(255),
    task_size INT,
    supplier BIGINT,
    warranty TEXT,
    cost DECIMAL(12,2),
    invoice BYTEA,
    invoice_filename VARCHAR(255),
    invoice_mime VARCHAR(255),
    invoice_size INT,
    notes_comments TEXT,
    parts_image BYTEA,
    parts_image_filename VARCHAR(255),
    parts_image_mime VARCHAR(255),
    parts_image_size INT,
    datestamp DATE NOT NULL DEFAULT CURRENT_DATE,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_borehole_repairs_borehole FOREIGN KEY (borehole_id) REFERENCES borehole(ID) ON DELETE CASCADE
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
    ID BIGSERIAL PRIMARY KEY,
    classification_id BIGINT,
    description TEXT,
    status_id BIGINT NOT NULL DEFAULT 1,
    allocated_to INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ,
    closing_notes TEXT,
    media BYTEA,
    media_filename VARCHAR(255),
    media_mime VARCHAR(255),
    media_size INT,
    Created_By VARCHAR(255),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_tickets_classification FOREIGN KEY (classification_id) REFERENCES Classification_Lookup(ID),
    CONSTRAINT fk_tickets_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_tickets_allocated_to FOREIGN KEY (allocated_to) REFERENCES Employee(ID)
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_hardship_imam ON hardship_relief(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_higher_ed_imam ON higher_education_request(imam_profile_id);
CREATE INDEX IF NOT EXISTS idx_borehole_construction_borehole ON borehole_construction_tasks(borehole_id);
CREATE INDEX IF NOT EXISTS idx_borehole_repairs_borehole ON borehole_repairs_matrix(borehole_id);
CREATE INDEX IF NOT EXISTS idx_tickets_allocated ON tickets(allocated_to);

-- ============================================================
-- MIGRATION: Update tickets table to use status_id instead of status
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tickets' AND table_schema = current_schema()) THEN
        -- Add status_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'status_id' AND table_schema = current_schema()) THEN
            ALTER TABLE tickets ADD COLUMN status_id BIGINT NOT NULL DEFAULT 1;
            -- Migrate existing status values to status_id
            UPDATE tickets SET status_id = 1 WHERE status = 'Open' OR status IS NULL;
            UPDATE tickets SET status_id = 2 WHERE status = 'In Progress';
            UPDATE tickets SET status_id = 3 WHERE status = 'Closed';
            -- Add foreign key constraint
            ALTER TABLE tickets ADD CONSTRAINT fk_tickets_status FOREIGN KEY (status_id) REFERENCES Status(ID);
            RAISE NOTICE 'Added status_id column to tickets table and migrated data';
        END IF;
        
        -- Remove old status column if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'status' AND table_schema = current_schema()) THEN
            ALTER TABLE tickets DROP COLUMN status;
            RAISE NOTICE 'Removed old status column from tickets table';
        END IF;
        
        -- Add created_at and closed_at columns if they don't exist (rename from created_time/closed_time)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'created_at' AND table_schema = current_schema()) THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'created_time' AND table_schema = current_schema()) THEN
                ALTER TABLE tickets RENAME COLUMN created_time TO created_at;
                RAISE NOTICE 'Renamed created_time to created_at in tickets table';
            ELSE
                ALTER TABLE tickets ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
                RAISE NOTICE 'Added created_at column to tickets table';
            END IF;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'closed_at' AND table_schema = current_schema()) THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'closed_time' AND table_schema = current_schema()) THEN
                ALTER TABLE tickets RENAME COLUMN closed_time TO closed_at;
                RAISE NOTICE 'Renamed closed_time to closed_at in tickets table';
            ELSE
                ALTER TABLE tickets ADD COLUMN closed_at TIMESTAMPTZ;
                RAISE NOTICE 'Added closed_at column to tickets table';
            END IF;
        END IF;
    END IF;
END $$;

-- ============================================================
-- ============================================================
-- IMAM PROFILES SEED DATA
-- ============================================================

-- First, create additional employees for Imam Profiles (since employee_id must be unique)
-- Employee 6: Imam User 1
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Ahmad', 'Hassan', 'imam1', '12345', 6,
    1, 14, 1, 1, 3,
    '+27123456790', '+27123456790', 1, NULL, NULL, 'system', 'system'
) ON CONFLICT (Username) DO UPDATE SET Password_Hash = '12345';

-- Employee 7: Imam User 2
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Muhammad', 'Ali', 'imam2', '12345', 6,
    1, 14, 1, 1, 3,
    '+27123456791', '+27123456791', 1, NULL, NULL, 'system', 'system'
) ON CONFLICT (Username) DO UPDATE SET Password_Hash = '12345';

-- Employee 8: Imam User 3
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Ibrahim', 'Abdullah', 'imam3', '12345', 6,
    1, 14, 1, 1, 3,
    '+27123456792', '+27123456792', 1, NULL, NULL, 'system', 'system'
) ON CONFLICT (Username) DO UPDATE SET Password_Hash = '12345';

-- Insert Language lookup data if not exists
INSERT INTO Language (Name, Created_By, Updated_By)
VALUES 
    ('English', 'system', 'system'),
    ('Arabic', 'system', 'system'),
    ('Urdu', 'system', 'system'),
    ('Afrikaans', 'system', 'system'),
    ('Zulu', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Insert Currency lookup data if not exists
INSERT INTO Currency (Name, Code, Created_By, Updated_By)
VALUES 
    ('South African Rand', 'ZAR', 'system', 'system'),
    ('US Dollar', 'USD', 'system', 'system'),
    ('British Pound', 'GBP', 'system', 'system'),
    ('Euro', 'EUR', 'system', 'system')
ON CONFLICT (Name) DO NOTHING;

-- Insert Imam Profiles (Master Table)
INSERT INTO Imam_Profiles (
    Name, Surname, Email, ID_Number, File_Number, Cell_Number, Contact_Number,
    Title, DOB, Madhab, Race, Gender, Marital_Status, nationality_id, province_id, suburb_id,
    status_id, employee_id, Employment_Type, Lead_Salah_In_Masjid, Teach_Maktab_Madrassah,
    Do_Street_Dawah, Teaching_Frequency, Teach_Adults_Community_Classes, Average_Students_Taught_Daily,
    Prayers_Lead_Daily, Jumuah_Prayers_Lead, Average_Fajr_Attendees, Average_Dhuhr_Attendees,
    Average_Asr_Attendees, Average_Maghrib_Attendees, Average_Esha_Attendees,
    English_Proficiency, Arabic_Proficiency, Quran_Reading_Ability, Public_Speaking_Khutbah_Skills,
    Quran_Memorization, Additional_Weekly_Tasks, Acknowledge, Longitude, Latitude,
    Created_By, Updated_By
)
SELECT 
    'Ahmad', 'Hassan', 'ahmad.hassan@example.com', '8501015801081', 'IM-001',
    '+27123456790', '+27123456790',
    (SELECT ID FROM Title_Lookup WHERE Name = 'Imam' LIMIT 1),
    '1985-01-15',
    (SELECT ID FROM Madhab WHERE Name = 'Hanafi' LIMIT 1),
    (SELECT ID FROM Race WHERE Name = 'African' LIMIT 1),
    (SELECT ID FROM Gender WHERE Name = 'Male' LIMIT 1),
    (SELECT ID FROM Marital_Status WHERE Name = 'Nikah' LIMIT 1),
    (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1),
    (SELECT ID FROM Province WHERE Name = 'Gauteng' AND country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) LIMIT 1),
    (SELECT ID FROM Suburb WHERE Name = 'Johannesburg' AND province_id = (SELECT ID FROM Province WHERE Name = 'Gauteng' AND country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) LIMIT 1) LIMIT 1),
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    (SELECT ID FROM Employee WHERE Username = 'imam1' LIMIT 1),
    (SELECT ID FROM Employment_Type WHERE Name = 'Full Time' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Teaching_Frequency WHERE Name = 'Daily' LIMIT 1),
    (SELECT ID FROM Teach_Adults_Community_Classes WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Average_Students_Taught_Daily WHERE Name = 'Between 20 and 30' LIMIT 1),
    (SELECT ID FROM Prayers_Lead_Daily WHERE Name = 'Leading 5 prayer a day' LIMIT 1),
    (SELECT ID FROM Jumuah_Prayers_Lead WHERE Name = '1' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 20 and 30' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 30 and 50' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 20 and 30' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 30 and 50' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 50 and 100' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Proficient' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Advanced' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Advanced' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Proficient' LIMIT 1),
    'Memorised 15 juz or more',
    'Khateeb for Jumuah, Hifz/Hidth Teacher, Counselling Sessions (Individual/Marriage etc)',
    true, 28.0473, -26.2041,
    'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM Imam_Profiles WHERE employee_id = (SELECT ID FROM Employee WHERE Username = 'imam1' LIMIT 1));

INSERT INTO Imam_Profiles (
    Name, Surname, Email, ID_Number, File_Number, Cell_Number, Contact_Number,
    Title, DOB, Madhab, Race, Gender, Marital_Status, nationality_id, province_id, suburb_id,
    status_id, employee_id, Employment_Type, Lead_Salah_In_Masjid, Teach_Maktab_Madrassah,
    Do_Street_Dawah, Teaching_Frequency, Teach_Adults_Community_Classes, Average_Students_Taught_Daily,
    Prayers_Lead_Daily, Jumuah_Prayers_Lead, Average_Fajr_Attendees, Average_Dhuhr_Attendees,
    Average_Asr_Attendees, Average_Maghrib_Attendees, Average_Esha_Attendees,
    English_Proficiency, Arabic_Proficiency, Quran_Reading_Ability, Public_Speaking_Khutbah_Skills,
    Quran_Memorization, Additional_Weekly_Tasks, Acknowledge, Longitude, Latitude,
    Created_By, Updated_By
)
SELECT 
    'Muhammad', 'Ali', 'muhammad.ali@example.com', '8703055802082', 'IM-002',
    '+27123456791', '+27123456791',
    (SELECT ID FROM Title_Lookup WHERE Name = 'Sheikh' LIMIT 1),
    '1987-03-05',
    (SELECT ID FROM Madhab WHERE Name = 'Shafi''i' LIMIT 1),
    (SELECT ID FROM Race WHERE Name = 'Asian' LIMIT 1),
    (SELECT ID FROM Gender WHERE Name = 'Male' LIMIT 1),
    (SELECT ID FROM Marital_Status WHERE Name = 'Nikah' LIMIT 1),
    (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1),
    (SELECT ID FROM Province WHERE Name = 'Western Cape' AND country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) LIMIT 1),
    (SELECT ID FROM Suburb WHERE Name = 'Cape Town' AND province_id = (SELECT ID FROM Province WHERE Name = 'Western Cape' AND country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) LIMIT 1) LIMIT 1),
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    (SELECT ID FROM Employee WHERE Username = 'imam2' LIMIT 1),
    (SELECT ID FROM Employment_Type WHERE Name = 'Full Time' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'No' LIMIT 1),
    (SELECT ID FROM Teaching_Frequency WHERE Name = 'Few times a week' LIMIT 1),
    (SELECT ID FROM Teach_Adults_Community_Classes WHERE Name = 'Occasionally' LIMIT 1),
    (SELECT ID FROM Average_Students_Taught_Daily WHERE Name = 'Between 10 and 20' LIMIT 1),
    (SELECT ID FROM Prayers_Lead_Daily WHERE Name = 'Leading 5 prayer a day' LIMIT 1),
    (SELECT ID FROM Jumuah_Prayers_Lead WHERE Name = '1' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 10 and 20' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 20 and 30' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 10 and 20' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 20 and 30' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 30 and 50' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Advanced' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Advanced' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Advanced' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Advanced' LIMIT 1),
    'Memorised 15 juz or more',
    'Khateeb for Jumuah, Guest Khateeb for Jumuah at surrounding Masjid, Nikah duties',
    true, 18.4232, -33.9249,
    'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM Imam_Profiles WHERE employee_id = (SELECT ID FROM Employee WHERE Username = 'imam2' LIMIT 1));

INSERT INTO Imam_Profiles (
    Name, Surname, Email, ID_Number, File_Number, Cell_Number, Contact_Number,
    Title, DOB, Madhab, Race, Gender, Marital_Status, nationality_id, province_id, suburb_id,
    status_id, employee_id, Employment_Type, Lead_Salah_In_Masjid, Teach_Maktab_Madrassah,
    Do_Street_Dawah, Teaching_Frequency, Teach_Adults_Community_Classes, Average_Students_Taught_Daily,
    Prayers_Lead_Daily, Jumuah_Prayers_Lead, Average_Fajr_Attendees, Average_Dhuhr_Attendees,
    Average_Asr_Attendees, Average_Maghrib_Attendees, Average_Esha_Attendees,
    English_Proficiency, Arabic_Proficiency, Quran_Reading_Ability, Public_Speaking_Khutbah_Skills,
    Quran_Memorization, Additional_Weekly_Tasks, Acknowledge, Longitude, Latitude,
    Created_By, Updated_By
)
SELECT 
    'Ibrahim', 'Abdullah', 'ibrahim.abdullah@example.com', '8806105803083', 'IM-003',
    '+27123456792', '+27123456792',
    (SELECT ID FROM Title_Lookup WHERE Name = 'Moulana' LIMIT 1),
    '1988-06-10',
    (SELECT ID FROM Madhab WHERE Name = 'Hanafi' LIMIT 1),
    (SELECT ID FROM Race WHERE Name = 'Coloured' LIMIT 1),
    (SELECT ID FROM Gender WHERE Name = 'Male' LIMIT 1),
    (SELECT ID FROM Marital_Status WHERE Name = 'Nikah' LIMIT 1),
    (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1),
    (SELECT ID FROM Province WHERE Name = 'KwaZulu-Natal' AND country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) LIMIT 1),
    (SELECT ID FROM Suburb WHERE Name = 'Durban' AND province_id = (SELECT ID FROM Province WHERE Name = 'KwaZulu-Natal' AND country_id = (SELECT ID FROM Country WHERE Code = 'ZA' LIMIT 1) LIMIT 1) LIMIT 1),
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    (SELECT ID FROM Employee WHERE Username = 'imam3' LIMIT 1),
    (SELECT ID FROM Employment_Type WHERE Name = 'Part Time' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Teaching_Frequency WHERE Name = 'Weekends' LIMIT 1),
    (SELECT ID FROM Teach_Adults_Community_Classes WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Average_Students_Taught_Daily WHERE Name = 'Between 30 and 50' LIMIT 1),
    (SELECT ID FROM Prayers_Lead_Daily WHERE Name = 'Leading 3 prayer a day' LIMIT 1),
    (SELECT ID FROM Jumuah_Prayers_Lead WHERE Name = '1' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 30 and 50' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 50 and 100' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 30 and 50' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'Between 50 and 100' LIMIT 1),
    (SELECT ID FROM Average_Attendees WHERE Name = 'More than 100' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Intermediate' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Proficient' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Proficient' LIMIT 1),
    (SELECT ID FROM Proficiency WHERE Name = 'Intermediate' LIMIT 1),
    'Memorised 5 juz or less',
    'Active in Street Dawah, Hospital visits, Food/Hamper distribution',
    true, 31.0292, -29.8587,
    'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM Imam_Profiles WHERE employee_id = (SELECT ID FROM Employee WHERE Username = 'imam3' LIMIT 1));

-- Insert Child Table Records: Jumuah Khutbah Topic Submission
INSERT INTO Jumuah_Khutbah_Topic (
    imam_profile_id, topic, masjid_name, town, attendance_count, language, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1),
    'The Importance of Unity in the Muslim Community',
    'Al-Masjid Al-Awwal',
    (SELECT ID FROM Suburb WHERE Name = 'Johannesburg' LIMIT 1),
    150,
    (SELECT ID FROM Language WHERE Name = 'English' LIMIT 1),
    true,
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    'Excellent khutbah, well received by the community',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-001')
AND NOT EXISTS (SELECT 1 FROM Jumuah_Khutbah_Topic WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1) AND topic = 'The Importance of Unity in the Muslim Community');

INSERT INTO Jumuah_Khutbah_Topic (
    imam_profile_id, topic, masjid_name, town, attendance_count, language, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-002' LIMIT 1),
    'Patience and Perseverance in Times of Difficulty',
    'Masjid Al-Noor',
    (SELECT ID FROM Suburb WHERE Name = 'Cape Town' LIMIT 1),
    200,
    (SELECT ID FROM Language WHERE Name = 'Arabic' LIMIT 1),
    true,
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    'Very inspiring message',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-002')
AND NOT EXISTS (SELECT 1 FROM Jumuah_Khutbah_Topic WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-002' LIMIT 1) AND topic = 'Patience and Perseverance in Times of Difficulty');

-- Insert Child Table Records: Pearls of Wisdom
INSERT INTO Pearls_Of_Wisdom (
    imam_profile_id, resource_type, resource_title, author_speaker, heading_description,
    pearl_one, pearl_two, pearl_three, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1),
    (SELECT ID FROM Resource_Type WHERE Name = 'Read a book' LIMIT 1),
    'The Book of Guidance',
    'Ibn Qayyim Al-Jawziyya',
    'Wisdom on spiritual purification',
    'True knowledge comes from understanding the heart',
    'Patience is the key to success',
    'Gratitude multiplies blessings',
    true,
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    'Valuable insights shared',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-001')
AND NOT EXISTS (SELECT 1 FROM Pearls_Of_Wisdom WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1) AND resource_title = 'The Book of Guidance');

-- Insert Child Table Records: Medical Reimbursement
INSERT INTO Medical_Reimbursement (
    imam_profile_id, relationship_type, visit_type, visit_date, illness_description,
    service_provider, amount, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1),
    (SELECT ID FROM Relationship_Types WHERE Name = 'Spouse' LIMIT 1),
    (SELECT ID FROM Medical_Visit_Type WHERE Name = 'Doctor Consult' LIMIT 1),
    '2024-03-15',
    'Routine health checkup and consultation',
    (SELECT ID FROM Medical_Service_Provider WHERE Name = 'Private Doctor' LIMIT 1),
    850.00,
    true,
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    'Reimbursement processed',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-001')
AND NOT EXISTS (SELECT 1 FROM Medical_Reimbursement WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1) AND visit_date = '2024-03-15');

-- Insert Child Table Records: Community Engagement
INSERT INTO Community_Engagement (
    imam_profile_id, engagement_type, people_count, engagement_date, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1),
    (SELECT ID FROM Community_Engagement_Type WHERE Name = 'Community Event' LIMIT 1),
    250,
    '2024-04-20',
    true,
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    'Successful community outreach event',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-001')
AND NOT EXISTS (SELECT 1 FROM Community_Engagement WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1) AND engagement_date = '2024-04-20');

-- Insert Child Table Records: Nikah Bonus
INSERT INTO Nikah_Bonus (
    imam_profile_id, spouse_name, nikah_date, is_first_nikah, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1),
    'Fatima Hassan',
    '2020-05-15',
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    true,
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    'First nikah bonus approved',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-001')
AND NOT EXISTS (SELECT 1 FROM Nikah_Bonus WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1) AND nikah_date = '2020-05-15');

-- Insert Child Table Records: New Baby Bonus
INSERT INTO New_Baby_Bonus (
    imam_profile_id, spouse_name, baby_name, baby_gender, baby_dob, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1),
    'Fatima Hassan',
    'Yusuf Hassan',
    (SELECT ID FROM Gender WHERE Name = 'Male' LIMIT 1),
    '2023-08-10',
    true,
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    'New baby bonus approved',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-001')
AND NOT EXISTS (SELECT 1 FROM New_Baby_Bonus WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1) AND baby_dob = '2023-08-10');

-- Insert Child Table Records: Imam Financial Assistance
INSERT INTO imam_financial_assistance (
    imam_profile_id, assistance_type, amount_required, amount_required_currency,
    reason_for_assistance, monthly_income, monthly_expenses, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-002' LIMIT 1),
    'Medical Emergency',
    5000.00,
    (SELECT ID FROM Currency WHERE Code = 'ZAR' LIMIT 1),
    'Emergency medical treatment for family member',
    15000.00,
    12000.00,
    true,
    (SELECT ID FROM Status WHERE Name = 'Pending' LIMIT 1),
    'Under review',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-002')
AND NOT EXISTS (SELECT 1 FROM imam_financial_assistance WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-002' LIMIT 1) AND assistance_type = 'Medical Emergency');

-- Insert Child Table Records: Educational Development
INSERT INTO educational_development (
    imam_profile_id, course_name, institution_name, course_type, start_date, end_date,
    cost, cost_currency, funding_source, completion_status, certificate_obtained, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-002' LIMIT 1),
    'Advanced Islamic Studies',
    'International Islamic University',
    'Master''s degree',
    '2024-01-15',
    '2026-01-15',
    25000.00,
    (SELECT ID FROM Currency WHERE Code = 'ZAR' LIMIT 1),
    'Scholarship',
    'In Progress',
    false,
    true,
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    'Educational development approved',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-002')
AND NOT EXISTS (SELECT 1 FROM educational_development WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-002' LIMIT 1) AND course_name = 'Advanced Islamic Studies');

-- Insert Child Table Records: Borehole
INSERT INTO borehole (
    imam_profile_id, where_required, has_electricity, received_borehole_before,
    current_water_source, distance_to_water_source, beneficiaries_count,
    challenges_due_to_lack_of_water, motivation, acknowledge, status_id, comment, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-003' LIMIT 1),
    (SELECT ID FROM Borehole_Location WHERE Name = 'Masjid' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'Yes' LIMIT 1),
    (SELECT ID FROM Yes_No WHERE Name = 'No' LIMIT 1),
    (SELECT ID FROM Water_Source WHERE Name = 'Municipal Water' LIMIT 1),
    2.5,
    500,
    'Frequent water cuts affecting wudhu and daily activities',
    'To ensure continuous water supply for masjid activities',
    true,
    (SELECT ID FROM Status WHERE Name = 'Pending' LIMIT 1),
    'Borehole request under review',
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-003')
AND NOT EXISTS (SELECT 1 FROM borehole WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-003' LIMIT 1));

-- Insert into Borehole_Water_Usage_Purpose junction table
INSERT INTO Borehole_Water_Usage_Purpose (borehole_id, water_usage_purpose_id, Created_By, Updated_By)
SELECT 
    (SELECT ID FROM borehole WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-003' LIMIT 1) LIMIT 1),
    (SELECT ID FROM Water_Usage_Purpose WHERE Name = 'Masjid (Wudhu, maintenace etc)' LIMIT 1),
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM borehole WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-003' LIMIT 1))
AND NOT EXISTS (
    SELECT 1 FROM Borehole_Water_Usage_Purpose 
    WHERE borehole_id = (SELECT ID FROM borehole WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-003' LIMIT 1) LIMIT 1)
    AND water_usage_purpose_id = (SELECT ID FROM Water_Usage_Purpose WHERE Name = 'Masjid (Wudhu, maintenace etc)' LIMIT 1)
);

-- Insert Child Table Records: Imam Relationships
INSERT INTO Imam_Relationships (
    imam_profile_id, Relationship_Type, Name, Surname, ID_Number, Date_of_Birth,
    Employment_Status, Gender, Highest_Education, Health_Condition, status_id, Created_By, Updated_By
)
SELECT 
    (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1),
    (SELECT ID FROM Relationship_Types WHERE Name = 'Spouse' LIMIT 1),
    'Fatima',
    'Hassan',
    '9002155801082',
    '1990-02-15',
    (SELECT ID FROM Employment_Status WHERE Name = 'Full Time Employed' LIMIT 1),
    (SELECT ID FROM Gender WHERE Name = 'Female' LIMIT 1),
    (SELECT ID FROM Education_Level WHERE Name = 'Degree - NQF 7' LIMIT 1),
    (SELECT ID FROM Health_Conditions WHERE Name = 'None' LIMIT 1),
    (SELECT ID FROM Status WHERE Name = 'Approved' LIMIT 1),
    'system', 'system'
WHERE EXISTS (SELECT 1 FROM Imam_Profiles WHERE File_Number = 'IM-001')
AND NOT EXISTS (SELECT 1 FROM Imam_Relationships WHERE imam_profile_id = (SELECT ID FROM Imam_Profiles WHERE File_Number = 'IM-001' LIMIT 1) AND Name = 'Fatima' AND Surname = 'Hassan');

-- ============================================================
-- EMAIL TEMPLATES SYSTEM
-- ============================================================

-- Email Templates Table
CREATE TABLE IF NOT EXISTS Email_Templates (
    ID BIGSERIAL PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL UNIQUE,
    template_type VARCHAR(100), -- Deprecated: now using email_triggers instead
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    background_image BYTEA,
    background_image_filename VARCHAR(255),
    background_image_mime VARCHAR(255),
    background_image_size INT,
    background_image_updated_at TIMESTAMPTZ,
    background_image_show_link TEXT,
    background_color VARCHAR(50),
    text_color VARCHAR(50),
    button_color VARCHAR(50),
    button_text_color VARCHAR(50),
    image_position VARCHAR(50) DEFAULT 'center', -- 'top', 'center', 'bottom'
    text_alignment VARCHAR(50) DEFAULT 'left', -- 'left', 'center', 'right'
    available_variables TEXT, -- JSON array of available variables like ["{{imam_name}}", "((submission_date))"]
    recipient_type VARCHAR(50) NOT NULL DEFAULT 'imam', -- 'imam', 'admin', 'both'
    is_active BOOLEAN NOT NULL DEFAULT true,
    login_url TEXT,
    email_triggers TEXT, -- JSON array of email triggers like [{"table_name": "Jumuah_Khutbah_Topic", "action": "CREATE"}]
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration: Add email_triggers column and make template_type nullable
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Email_Templates' AND table_schema = current_schema()) THEN
        -- Add email_triggers column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Email_Templates' AND column_name = 'email_triggers' AND table_schema = current_schema()) THEN
            ALTER TABLE Email_Templates ADD COLUMN email_triggers TEXT;
            RAISE NOTICE 'Added email_triggers column to Email_Templates';
        END IF;
        
        -- Make template_type nullable if it's currently NOT NULL
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Email_Templates' 
                   AND column_name = 'template_type' 
                   AND is_nullable = 'NO'
                   AND table_schema = current_schema()) THEN
            ALTER TABLE Email_Templates ALTER COLUMN template_type DROP NOT NULL;
            RAISE NOTICE 'Made template_type column nullable in Email_Templates';
        END IF;
    END IF;
END $$;

-- ============================================================
-- EMAIL TEMPLATES INSERT STATEMENTS
-- ============================================================
INSERT INTO Email_Templates (
  template_name, subject, html_content, background_color, text_color, 
  button_color, button_text_color, image_position, text_alignment, 
  available_variables, recipient_type, is_active, login_url, email_triggers, Created_By, Updated_By
) VALUES (
  'Default Submission Template - Imam User',
  '{{table_label}} - Submission Received',
  '<body style="background-color: #fff;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>{{table_label}}</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="{{table_label}}" style="max-width:60%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Asalaamu Alaikum {{imam_name}},
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      JazakAllahu khayran for submitting your {{table_label}} on ((submission_date)).
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      We confirm that your submission has been successfully received and is currently marked as Pending Review.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      <strong>Submission:</strong> {{table_label}}<br/>
      <strong>Submission Date:</strong> ((submission_date))<br/>
      <strong>Current Status:</strong> Pending
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      The submitted {{topic}} will be reviewed by the relevant administrators.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      You may log in to the platform at any time to track the status of your submission.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      In sha'' Allah, your {{topic}} will be a means of goodness and guidance for your community.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      LOGIN HERE
    </a>
  </div>
</body>',
  '#8f98ff', '#666', '#BD1F5B', '#fff', 'center', 'left',
  '["{{imam_name}}","{{imam_surname}}","((submission_date))","{{topic}}","{{masjid_name}}","{{table_name}}","{{table_label}}"]',
  'imam', true, 'https://imamportal.com/dashboard',
  '[{"table_name":"Jumuah_Khutbah_Topic","action":"CREATE"},{"table_name":"Jumuah_Audio_Khutbah","action":"CREATE"},{"table_name":"Pearls_Of_Wisdom","action":"CREATE"},{"table_name":"Medical_Reimbursement","action":"CREATE"},{"table_name":"Community_Engagement","action":"CREATE"},{"table_name":"Nikah_Bonus","action":"CREATE"},{"table_name":"New_Muslim_Bonus","action":"CREATE"},{"table_name":"New_Baby_Bonus","action":"CREATE"},{"table_name":"imam_financial_assistance","action":"CREATE"}]',
  'system', 'system'
) ON CONFLICT (template_name) DO NOTHING;

INSERT INTO Email_Templates (
  template_name, subject, html_content, background_color, text_color, 
  button_color, button_text_color, image_position, text_alignment, 
  available_variables, recipient_type, is_active, login_url, email_triggers, Created_By, Updated_By
) VALUES (
  'Default Submission Template - App Admin',
  '{{table_label}} - New Submission',
  '<body style="background-color: #fff;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>{{table_label}}</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="{{table_label}}" style="max-width:60%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Asalaamu Alaikum,
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      A {{table_label}} has been submitted on ((submission_date)) and is currently marked as Pending Review.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      <strong>Submitted By:</strong> {{imam_name}}<br/>
      <strong>Submission:</strong> {{table_label}}<br/>
      <strong>Submission Date:</strong> ((submission_date))<br/>
      <strong>Current Status:</strong> Pending
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Please log in to the platform to review the submission and take the appropriate action.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      JazakAllahu khayran for your continued service and oversight.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      LOGIN HERE
    </a>
  </div>
</body>',
  '#8f98ff', '#666', '#BD1F5B', '#fff', 'center', 'left',
  '["{{imam_name}}","{{imam_surname}}","((submission_date))","{{topic}}","{{masjid_name}}","{{table_name}}","{{table_label}}"]',
  'admin', true, 'https://imamportal.com/dashboard',
  '[{"table_name":"Jumuah_Khutbah_Topic","action":"CREATE"},{"table_name":"Jumuah_Audio_Khutbah","action":"CREATE"},{"table_name":"Pearls_Of_Wisdom","action":"CREATE"},{"table_name":"Medical_Reimbursement","action":"CREATE"},{"table_name":"Community_Engagement","action":"CREATE"},{"table_name":"Nikah_Bonus","action":"CREATE"},{"table_name":"New_Muslim_Bonus","action":"CREATE"},{"table_name":"New_Baby_Bonus","action":"CREATE"},{"table_name":"imam_financial_assistance","action":"CREATE"}]',
  'system', 'system'
) ON CONFLICT (template_name) DO NOTHING;

-- Imam Profile Created - Admin Notification
INSERT INTO Email_Templates (
  template_name, subject, html_content, background_color, text_color, 
  button_color, button_text_color, image_position, text_alignment, 
  available_variables, recipient_type, is_active, login_url, email_triggers, Created_By, Updated_By
) VALUES (
  'Imam Profile Created - Admin Notification',
  'New Imam Profile Created',
  '<body style="background-color: #fff;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>New Imam Profile</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="Imam Profile" style="max-width:70%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Asalaamu Alaikum,
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      A new Imam Profile has been created and is currently marked as Pending Review.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      <strong>Imam Name:</strong> {{imam_name}}<br/>
      <strong>Email:</strong> {{imam_email}}<br/>
      <strong>File Number:</strong> {{file_number}}<br/>
      <strong>Created Date:</strong> ((submission_date))<br/>
      <strong>Current Status:</strong> Pending
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Please log in to the platform to review the Imam Profile and take the appropriate action.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      JazakAllahu khayran for your continued service and oversight.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      LOGIN HERE
    </a>
  </div>
</body>',
  '#8f98ff', '#666', '#BD1F5B', '#fff', 'center', 'left',
  '["{{imam_name}}","{{imam_surname}}","{{imam_email}}","{{file_number}}","((submission_date))","{{table_name}}","{{table_label}}"]',
  'admin', true, 'https://imamportal.com/dashboard',
  '[{"table_name":"Imam_Profiles","action":"CREATE"}]',
  'system', 'system'
) ON CONFLICT (template_name) DO NOTHING;

-- Imam Profile Approved - Imam User Notification
INSERT INTO Email_Templates (
  template_name, subject, html_content, background_color, text_color, 
  button_color, button_text_color, image_position, text_alignment, 
  available_variables, recipient_type, is_active, login_url, email_triggers, Created_By, Updated_By
) VALUES (
  'Imam Profile Approved - Imam User Notification',
  'Your Imam Profile Has Been Approved',
  '<body style="background-color: #fff;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>Profile Approved</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="Profile Approved" style="max-width:70%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Asalaamu Alaikum {{imam_name}},
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Alhamdulillah! Your Imam Profile has been reviewed and approved.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      <strong>Profile Status:</strong> Approved<br/>
      <strong>File Number:</strong> {{file_number}}<br/>
      <strong>Approval Date:</strong> ((submission_date))
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      You can now access all features of the Imam Development Plan platform. Please log in to view your profile and submit your activities.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      May Allah accept your efforts and grant you success in serving the community.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      LOGIN HERE
    </a>
  </div>
</body>',
  '#8f98ff', '#666', '#BD1F5B', '#fff', 'center', 'left',
  '["{{imam_name}}","{{imam_surname}}","{{imam_email}}","{{file_number}}","((submission_date))","{{table_name}}","{{table_label}}"]',
  'imam', true, 'https://imamportal.com/dashboard',
  '[{"table_name":"Imam_Profiles","action":"UPDATE","status_id":2}]',
  'system', 'system'
) ON CONFLICT (template_name) DO NOTHING;

-- Imam Profile Rejected - Imam User Notification
INSERT INTO Email_Templates (
  template_name, subject, html_content, background_color, text_color, 
  button_color, button_text_color, image_position, text_alignment, 
  available_variables, recipient_type, is_active, login_url, email_triggers, Created_By, Updated_By
) VALUES (
  'Imam Profile Rejected - Imam User Notification',
  'Imam Profile Update: {{imam_name}}',
  '<body style="background-color: #fff;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>Profile Review Update</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="Profile Review" style="max-width:70%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Asalaamu Alaikum {{imam_name}},
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Thank you for your interest in joining the Imam Development Plan. We have reviewed your Imam Profile application.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      <strong>Profile Status:</strong> Requires Additional Information<br/>
      <strong>File Number:</strong> {{file_number}}<br/>
      <strong>Review Date:</strong> ((submission_date))
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      At this time, your profile requires additional information or clarification before it can be approved. This is a normal part of our review process, and we encourage you to review your submission and provide any missing details.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      We value your dedication to serving the community and would be happy to assist you in completing your profile. Please feel free to reach out to our support team if you have any questions or need guidance.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      May Allah guide us all in our efforts to serve the Ummah with excellence and sincerity.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      REVIEW PROFILE
    </a>
  </div>
</body>',
  '#8f98ff', '#666', '#BD1F5B', '#fff', 'center', 'left',
  '["{{imam_name}}","{{imam_surname}}","{{imam_email}}","{{file_number}}","((submission_date))","{{table_name}}","{{table_label}}"]',
  'imam', true, 'https://imamportal.com/dashboard',
  '[{"table_name":"Imam_Profiles","action":"UPDATE","status_id":3}]',
  'system', 'system'
) ON CONFLICT (template_name) DO NOTHING;

-- New Message Received - User Notification
INSERT INTO Email_Templates (
  template_name, subject, html_content, background_color, text_color, 
  button_color, button_text_color, image_position, text_alignment, 
  available_variables, recipient_type, is_active, login_url, email_triggers, Created_By, Updated_By
) VALUES (
  'New Message Received - User Notification',
  'New Message from {{sender_name}}',
  '<body style="background-color: #fff;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>New Message</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="New Message" style="max-width:70%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Asalaamu Alaikum {{recipient_name}},
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      You have received a new message in your conversation.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      <strong>From:</strong> {{sender_name}}<br/>
      <strong>Conversation:</strong> {{conversation_title}}<br/>
      <strong>Message Date:</strong> ((submission_date))<br/>
      <strong>Message Preview:</strong> {{message_preview}}
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Please log in to view and respond to this message.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      VIEW MESSAGE
    </a>
  </div>
</body>',
  '#8f98ff', '#666', '#BD1F5B', '#fff', 'center', 'left',
  '["{{recipient_name}}","{{sender_name}}","{{conversation_title}}","{{message_preview}}","{{message_text}}","((submission_date))","{{table_name}}","{{table_label}}"]',
  'both', true, 'https://imamportal.com/dashboard',
  '[{"table_name":"Messages","action":"CREATE"}]',
  'system', 'system'
) ON CONFLICT (template_name) DO NOTHING;

-- Password Reset - User Notification
INSERT INTO Email_Templates (
  template_name, subject, html_content, background_color, text_color, 
  button_color, button_text_color, image_position, text_alignment, 
  available_variables, recipient_type, is_active, login_url, email_triggers, Created_By, Updated_By
) VALUES (
  'Password Reset - User Notification',
  'Password Reset Request - Imam Development Plan',
  '<body style="background-color: #f7f5f5;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>Password Reset</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="Password Reset" style="max-width:70%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Asalaamu Alaikum {{user_name}},
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      You have requested to reset your password for your Imam Development Plan account.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Click the button below to reset your password. This link will expire in {{expires_in}}.
    </p>
    <a href="{{reset_link}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      RESET PASSWORD
    </a>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:20px;text-align:left;">
      If you did not request this password reset, please ignore this email. Your password will remain unchanged.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      For security reasons, this link will expire in {{expires_in}}. If you need to reset your password again, please request a new reset link.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      LOGIN HERE
    </a>
  </div>
</body>',
  '#8f98ff', '#666', '#BD1F5B', '#fff', 'center', 'left',
  '["{{user_name}}","{{reset_link}}","{{expires_in}}","{{login_url}}"]',
  'both', true, 'https://imamdp.org/login',
  '[]',
  'system', 'system'
) ON CONFLICT (template_name) DO NOTHING;


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

