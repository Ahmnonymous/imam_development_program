-- PostgreSQL Schema for Welfare Application
-- Updated to implement recommendations: Supplier_Category table, TIMESTAMPTZ standardization, secure password storage,
-- Employee_ID relationships, validation, HSEQ status consistency, inventory triggers, and documentation.
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

CREATE OR REPLACE FUNCTION update_financial_assessment_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Financial_Assessment fa
    SET 
        Total_Income = (SELECT COALESCE(SUM(Amount), 0) FROM Applicant_Income WHERE Financial_Assessment_ID = fa.ID),
        Total_Expenses = (SELECT COALESCE(SUM(Amount), 0) FROM Applicant_Expense WHERE Financial_Assessment_ID = fa.ID),
        Disposable_Income = (
            (SELECT COALESCE(SUM(Amount), 0) FROM Applicant_Income WHERE Financial_Assessment_ID = fa.ID) -
            (SELECT COALESCE(SUM(Amount), 0) FROM Applicant_Expense WHERE Financial_Assessment_ID = fa.ID)
        )
    WHERE fa.ID = COALESCE(NEW.Financial_Assessment_ID, OLD.Financial_Assessment_ID);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
DECLARE
    delta DECIMAL(12,2);
    item_id BIGINT;
    trans_type VARCHAR(50);
BEGIN
    item_id := COALESCE(NEW.Item_ID, OLD.Item_ID);
    trans_type := COALESCE(NEW.Transaction_Type, OLD.Transaction_Type);
    
    IF TG_OP = 'INSERT' THEN
        delta := NEW.Quantity;
    ELSIF TG_OP = 'UPDATE' THEN
        delta := NEW.Quantity - COALESCE(OLD.Quantity, 0);
    ELSIF TG_OP = 'DELETE' THEN
        delta := -COALESCE(OLD.Quantity, 0);
    END IF;

    UPDATE Inventory_Items
    SET Quantity = Quantity + 
        CASE 
            WHEN trans_type = 'IN' THEN delta
            WHEN trans_type = 'OUT' THEN -delta
            ELSE 0 
        END
    WHERE ID = item_id;

    IF (SELECT Quantity FROM Inventory_Items WHERE ID = item_id) < 0 THEN
        RAISE EXCEPTION 'Inventory quantity cannot be negative for item %', item_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Lookup Tables
CREATE TABLE Supplier_Category (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(255) UNIQUE NOT NULL,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
CREATE TABLE Center_Detail (
    ID SERIAL PRIMARY KEY,
    Organisation_Name VARCHAR(255),
    Date_of_Establishment DATE,
    Contact_Number VARCHAR(255),
    Email_Address VARCHAR(255),
    Website_Link VARCHAR(255),
    Address VARCHAR(255),
    Area BIGINT,
    Ameer VARCHAR(255),
    Cell1 VARCHAR(255),
    Cell2 VARCHAR(255),
    Cell3 VARCHAR(255),
    Contact1 VARCHAR(255),
    Contact2 VARCHAR(255),
    Contact3 VARCHAR(255),
    Logo BYTEA,
    Logo_Filename VARCHAR(255),
    Logo_Mime VARCHAR(255),
    Logo_Size INT,
    NPO_Number VARCHAR(255),
    Service_Rating_Email VARCHAR(255),
    QR_Code_Service_URL BYTEA,
    QR_Code_Service_URL_Filename VARCHAR(255),
    QR_Code_Service_URL_Mime VARCHAR(255),
    QR_Code_Service_URL_Size INT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_area FOREIGN KEY (Area) REFERENCES Suburb(ID)
);

CREATE TABLE Center_Audits (
    ID SERIAL PRIMARY KEY,
    audit_date DATE,
    audit_type VARCHAR(255),
    findings VARCHAR(255),
    recommendations VARCHAR(255),
    attachments BYTEA,
    Attachments_Filename VARCHAR(255),
    Attachments_Mime VARCHAR(255),
    Attachments_Size INT,
    conducted_by VARCHAR(255),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE HSEQ_Toolbox_Meeting (
    ID SERIAL PRIMARY KEY,
    Meeting_Date DATE,
    Conducted_By VARCHAR(40),
    In_Attendance VARCHAR(1000),
    Guests VARCHAR(1000),
    Health_Discussions VARCHAR(1000),
    Safety_Discussions VARCHAR(1000),
    Quality_Discussions VARCHAR(1000),
    Productivity_Discussions VARCHAR(1000),
    Environment_Discussions VARCHAR(1000),
    General_Discussion VARCHAR(1000),
    Feedback VARCHAR(1000),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE HSEQ_Toolbox_Meeting_Tasks (
    ID SERIAL PRIMARY KEY,
    HSEQ_Toolbox_Meeting_ID BIGINT,
    Task_Description VARCHAR(100),
    Completion_Date DATE,
    Responsible VARCHAR(40),
    Status BIGINT,
    Notes VARCHAR(400),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_hseq_toolbox_meeting_id FOREIGN KEY (HSEQ_Toolbox_Meeting_ID) REFERENCES HSEQ_Toolbox_Meeting(ID),
    CONSTRAINT fk_status FOREIGN KEY (Status) REFERENCES Tasks_Status(ID)
);

CREATE TABLE Applicant_Details (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255),
    Surname VARCHAR(255),
    ID_Number VARCHAR(255),
    Race BIGINT,
    Nationality BIGINT,
    Nationality_Expiry_Date DATE,
    Gender BIGINT,
    Born_Religion_ID BIGINT,
    Period_As_Muslim_ID BIGINT,
    File_Number VARCHAR(255) UNIQUE,
    File_Condition BIGINT,
    File_Status BIGINT,
    Date_Intake DATE,
    Highest_Education_Level BIGINT,
    Marital_Status BIGINT,
    Employment_Status BIGINT,
    Cell_Number VARCHAR(255),
    Alternate_Number VARCHAR(255),
    Email_Address VARCHAR(255),
    Suburb BIGINT,
    Street_Address VARCHAR(255),
    Dwelling_Type BIGINT,
    Flat_Name VARCHAR(255),
    Flat_Number VARCHAR(255),
    Dwelling_Status BIGINT,
    Health BIGINT,
    Skills BIGINT,
    Signature BYTEA,
    Signature_Filename VARCHAR(255),
    Signature_Mime VARCHAR(255),
    Signature_Size INT,
    POPIA_Agreement VARCHAR(255),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_race FOREIGN KEY (Race) REFERENCES Race(ID),
    CONSTRAINT fk_nationality FOREIGN KEY (Nationality) REFERENCES Nationality(ID),
    CONSTRAINT fk_gender_app FOREIGN KEY (Gender) REFERENCES Gender(ID),
    CONSTRAINT fk_file_condition FOREIGN KEY (File_Condition) REFERENCES File_Condition(ID),
    CONSTRAINT fk_file_status FOREIGN KEY (File_Status) REFERENCES File_Status(ID),
    CONSTRAINT fk_highest_education_level_app FOREIGN KEY (Highest_Education_Level) REFERENCES Education_Level(ID),
    CONSTRAINT fk_marital_status FOREIGN KEY (Marital_Status) REFERENCES Marital_Status(ID),
    CONSTRAINT fk_employment_status FOREIGN KEY (Employment_Status) REFERENCES Employment_Status(ID),
    CONSTRAINT fk_suburb_app FOREIGN KEY (Suburb) REFERENCES Suburb(ID),
    CONSTRAINT fk_dwelling_type FOREIGN KEY (Dwelling_Type) REFERENCES Dwelling_Type(ID),
    CONSTRAINT fk_dwelling_status FOREIGN KEY (Dwelling_Status) REFERENCES Dwelling_Status(ID),
    CONSTRAINT fk_health FOREIGN KEY (Health) REFERENCES Health_Conditions(ID),
    CONSTRAINT fk_skills FOREIGN KEY (Skills) REFERENCES Skills(ID),
    CONSTRAINT fk_born_religion FOREIGN KEY (Born_Religion_ID) REFERENCES Born_Religion(ID),
    CONSTRAINT fk_period_as_muslim FOREIGN KEY (Period_As_Muslim_ID) REFERENCES Period_As_Muslim(ID)
);

CREATE TABLE Comments (
    ID SERIAL PRIMARY KEY,
    File_ID BIGINT,
    Comment TEXT,
    Comment_Date DATE,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_file_id FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID)
);

CREATE TABLE Tasks (
    ID SERIAL PRIMARY KEY,
    File_ID BIGINT,
    Task_Description TEXT,
    Date_Required DATE,
    Status VARCHAR(255),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_file_id_task FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID)
);

CREATE TABLE Relationships (
    ID SERIAL PRIMARY KEY,
    File_ID BIGINT,
    Relationship_Type BIGINT,
    Name VARCHAR(255),
    Surname VARCHAR(255),
    ID_Number VARCHAR(255),
    Date_of_Birth DATE,
    Employment_Status BIGINT,
    Gender BIGINT,
    Highest_Education BIGINT,
    Health_Condition BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_file_id_rel FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_relationship_type FOREIGN KEY (Relationship_Type) REFERENCES Relationship_Types(ID),
    CONSTRAINT fk_employment_status_rel FOREIGN KEY (Employment_Status) REFERENCES Employment_Status(ID),
    CONSTRAINT fk_gender_rel FOREIGN KEY (Gender) REFERENCES Gender(ID),
    CONSTRAINT fk_highest_education_rel FOREIGN KEY (Highest_Education) REFERENCES Education_Level(ID),
    CONSTRAINT fk_health_condition FOREIGN KEY (Health_Condition) REFERENCES Health_Conditions(ID)
);

CREATE TABLE Home_Visit (
    ID SERIAL PRIMARY KEY,
    File_ID BIGINT,
    Visit_Date DATE,
    Representative VARCHAR(255),
    Comments TEXT,
    Attachment_1 BYTEA,
    Attachment_1_Filename VARCHAR(255),
    Attachment_1_Mime VARCHAR(255),
    Attachment_1_Size INT,
    Attachment_2 BYTEA,
    Attachment_2_Filename VARCHAR(255),
    Attachment_2_Mime VARCHAR(255),
    Attachment_2_Size INT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_file_id_vis FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID)
);

CREATE TABLE Financial_Assistance (
    ID SERIAL PRIMARY KEY,
    File_ID BIGINT,
    Assistance_Type BIGINT,
    Financial_Amount DECIMAL(12,2),
    Date_of_Assistance DATE,
    Assisted_By BIGINT,
    Sector VARCHAR(255),
    Program VARCHAR(255),
    Project VARCHAR(255),
    Give_To VARCHAR(255),
    Starting_Date DATE,
    End_Date DATE,
    Frequency VARCHAR(20),
    Is_Recurring BOOLEAN DEFAULT false,
    Is_Auto_Generated BOOLEAN DEFAULT false,
    Recurring_Source_ID BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_file_id_fin FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_assistance_type FOREIGN KEY (Assistance_Type) REFERENCES Assistance_Types(ID),
    CONSTRAINT fk_financial_assistance_assisted_by FOREIGN KEY (Assisted_By) REFERENCES Employee(ID),
    CONSTRAINT fk_recurring_source_id FOREIGN KEY (Recurring_Source_ID) REFERENCES Financial_Assistance(ID) ON DELETE CASCADE
);

CREATE TABLE Recurring_Invoice_Log (
    ID SERIAL PRIMARY KEY,
    Applicant_ID BIGINT REFERENCES Applicant_Details(ID) ON DELETE CASCADE,
    Financial_Aid_ID BIGINT REFERENCES Financial_Assistance(ID) ON DELETE CASCADE,
    Source_Financial_Aid_ID BIGINT REFERENCES Financial_Assistance(ID) ON DELETE CASCADE,
    Created_Date TIMESTAMPTZ NOT NULL DEFAULT now(),
    Next_Run_Date DATE,
    Frequency VARCHAR(20),
    Created_By_System BOOLEAN DEFAULT true,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Food_Assistance (
    ID SERIAL PRIMARY KEY,
    File_ID BIGINT,
    Distributed_Date DATE,
    Hamper_Type BIGINT,
    Financial_Cost DECIMAL(12,2),
    Assisted_By BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_file_id_food FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_hamper_type FOREIGN KEY (Hamper_Type) REFERENCES Hampers(ID),
    CONSTRAINT fk_food_assistance_assisted_by FOREIGN KEY (Assisted_By) REFERENCES Employee(ID)
);

CREATE TABLE Attachments (
    ID SERIAL PRIMARY KEY,
    File_ID BIGINT,
    Attachment_Name VARCHAR(255),
    Attachment_Details VARCHAR(255),
    File BYTEA,
    File_Filename VARCHAR(255),
    File_Mime VARCHAR(255),
    File_Size INT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_file_id_att FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID)
);

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
    CONSTRAINT fk_person_trained FOREIGN KEY (Person_Trained_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_means_of_communication FOREIGN KEY (Means_of_communication) REFERENCES Means_of_communication(ID)
);

CREATE TABLE Applicant_Income (
    ID SERIAL PRIMARY KEY,
    Financial_Assessment_ID BIGINT NOT NULL,
    Income_Type_ID BIGINT NOT NULL,
    Amount DECIMAL(12,2),
    Description TEXT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_income_type_id FOREIGN KEY (Income_Type_ID) REFERENCES Income_Type(ID)
);

CREATE TABLE Applicant_Expense (
    ID SERIAL PRIMARY KEY,
    Financial_Assessment_ID BIGINT NOT NULL,
    Expense_Type_ID BIGINT NOT NULL,
    Amount DECIMAL(12,2),
    Description TEXT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_expense_type_id FOREIGN KEY (Expense_Type_ID) REFERENCES Expense_Type(ID)
);

CREATE TABLE Financial_Assessment (
    ID SERIAL PRIMARY KEY,
    File_ID BIGINT NOT NULL,
    Total_Income DECIMAL(12,2),
    Total_Expenses DECIMAL(12,2),
    Disposable_Income DECIMAL(12,2),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_file_id FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID) ON DELETE CASCADE
);

CREATE TRIGGER Financial_Assessment_update_totals
    AFTER INSERT OR UPDATE OR DELETE ON Applicant_Income
    FOR EACH ROW EXECUTE FUNCTION update_financial_assessment_totals();

CREATE TRIGGER Applicant_Expense_update_totals
    AFTER INSERT OR UPDATE OR DELETE ON Applicant_Expense
    FOR EACH ROW EXECUTE FUNCTION update_financial_assessment_totals();

-- Ensure a minimal Financial_Assessment exists for every applicant
CREATE OR REPLACE FUNCTION ensure_financial_assessment_for_applicant()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a placeholder assessment so that later income/expense rows
    -- can automatically roll up via existing triggers
    IF NOT EXISTS (
        SELECT 1 FROM Financial_Assessment WHERE File_ID = NEW.ID
    ) THEN
        INSERT INTO Financial_Assessment (
            File_ID, Total_Income, Total_Expenses, Disposable_Income, Created_By
        ) VALUES (
            NEW.ID, 
            0, 0, 0, 
            COALESCE(NEW.created_by, 'Admin')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER Applicant_Details_create_financial_assessment
    AFTER INSERT ON Applicant_Details
    FOR EACH ROW EXECUTE FUNCTION ensure_financial_assessment_for_applicant();

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

CREATE TABLE Supplier_Profile (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(255) NOT NULL,
    Registration_No VARCHAR(100),
    Contact_Person VARCHAR(255),
    Contact_Email VARCHAR(255),
    Contact_Phone VARCHAR(50),
    Address TEXT,
    Category_ID UUID,
    Status VARCHAR(50),
    Created_By VARCHAR(255),
    Datestamp DATE DEFAULT CURRENT_DATE,
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_category_id FOREIGN KEY (Category_ID) REFERENCES Supplier_Category(ID)
);

CREATE TABLE Supplier_Evaluation (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Supplier_ID UUID NOT NULL,
    Eval_Date DATE NOT NULL,
    Quality_Score SMALLINT,
    Delivery_Score SMALLINT,
    Cost_Score SMALLINT,
    OHS_Score SMALLINT,
    Env_Score SMALLINT,
    Quality_Wt NUMERIC(5,2),
    Delivery_Wt NUMERIC(5,2),
    Cost_Wt NUMERIC(5,2),
    OHS_Wt NUMERIC(5,2),
    Env_Wt NUMERIC(5,2),
    Overall_Score NUMERIC(5,2),
    Status VARCHAR(50),
    Notes TEXT,
    Expiry_Date DATE,
    Created_By VARCHAR(255),
    Datestamp DATE DEFAULT CURRENT_DATE,
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_supplier_id FOREIGN KEY (Supplier_ID) REFERENCES Supplier_Profile(ID) ON DELETE CASCADE
);

CREATE TABLE Supplier_Document (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Supplier_ID UUID NOT NULL,
    Doc_Type VARCHAR(100) NOT NULL,
    Issued_At DATE,
    File BYTEA,
    File_Filename VARCHAR(255),
    File_Mime VARCHAR(255),
    File_Size INT,
    Description TEXT,
    Created_By VARCHAR(255),
    Datestamp DATE DEFAULT CURRENT_DATE,
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_supplier_id_doc FOREIGN KEY (Supplier_ID) REFERENCES Supplier_Profile(ID) ON DELETE CASCADE
);

CREATE TABLE Inventory_Items (
    ID SERIAL PRIMARY KEY,
    Item_Name VARCHAR(255),
    Description TEXT,
    Hamper_Type BIGINT,
    Quantity DECIMAL(12,2) DEFAULT 0,
    Unit VARCHAR(50),
    Min_Stock DECIMAL(12,2),
    Cost_Per_Unit DECIMAL(12,2),
    Supplier_ID UUID,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_hamper_type_inv FOREIGN KEY (Hamper_Type) REFERENCES Hampers(ID),
    CONSTRAINT fk_supplier_id FOREIGN KEY (Supplier_ID) REFERENCES Supplier_Profile(ID)
);

CREATE TABLE Inventory_Transactions (
    ID SERIAL PRIMARY KEY,
    Item_ID BIGINT,
    Transaction_Type VARCHAR(50),
    Quantity DECIMAL(12,2),
    Transaction_Date DATE,
    Notes TEXT,
    Employee_ID BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_item_id FOREIGN KEY (Item_ID) REFERENCES Inventory_Items(ID),
    CONSTRAINT fk_employee_id_trans FOREIGN KEY (Employee_ID) REFERENCES Employee(ID)
);

CREATE TRIGGER Inventory_Transactions_update_quantity
    AFTER INSERT OR UPDATE ON Inventory_Transactions
    FOR EACH ROW EXECUTE FUNCTION update_inventory_quantity();

CREATE TRIGGER Inventory_Transactions_update_quantity_delete
    AFTER DELETE ON Inventory_Transactions
    FOR EACH ROW EXECUTE FUNCTION update_inventory_quantity();

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

-- Supplier Lookup
CREATE TABLE IF NOT EXISTS Supplier_Lookup (
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
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_audio_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
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
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_borehole_imam FOREIGN KEY (imam_profile_id) REFERENCES Imam_Profiles(ID) ON DELETE CASCADE,
    CONSTRAINT fk_borehole_location FOREIGN KEY (where_required) REFERENCES Borehole_Location(ID),
    CONSTRAINT fk_borehole_electricity FOREIGN KEY (has_electricity) REFERENCES Yes_No(ID),
    CONSTRAINT fk_borehole_received_before FOREIGN KEY (received_borehole_before) REFERENCES Yes_No(ID),
    CONSTRAINT fk_borehole_water_source FOREIGN KEY (current_water_source) REFERENCES Water_Source(ID),
    CONSTRAINT fk_borehole_status FOREIGN KEY (status_id) REFERENCES Status(ID),
    CONSTRAINT fk_borehole_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    contributed_to_waqf_loan_fund BIGINT,
    loan_type VARCHAR(255),
    loan_reason TEXT,
    tried_employer_request VARCHAR(255),
    promise_to_repay BIGINT,
    understand_waqf_fund BIGINT,
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
    CONSTRAINT fk_waqf_loan_contributed FOREIGN KEY (contributed_to_waqf_loan_fund) REFERENCES Yes_No(ID),
    CONSTRAINT fk_waqf_loan_repay FOREIGN KEY (promise_to_repay) REFERENCES Yes_No(ID),
    CONSTRAINT fk_waqf_loan_understand FOREIGN KEY (understand_waqf_fund) REFERENCES Yes_No(ID),
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

-- Indexes
CREATE INDEX HSEQ_Toolbox_Meeting_Tasks_i1 ON HSEQ_Toolbox_Meeting_Tasks (HSEQ_Toolbox_Meeting_ID);
CREATE INDEX idx_service_rating_datestamp ON Service_Rating (Datestamp);
CREATE INDEX idx_service_rating_recommend ON Service_Rating (Would_Recommend);
CREATE INDEX idx_service_rating_positive ON Service_Rating (Positive_Impact);
CREATE INDEX idx_supplier_evaluation_supplier ON Supplier_Evaluation (Supplier_ID);
CREATE INDEX idx_supplier_document_supplier ON Supplier_Document (Supplier_ID);
CREATE INDEX idx_applicant_details_file_number ON Applicant_Details (File_Number);
CREATE INDEX idx_applicant_details_id_number ON Applicant_Details (ID_Number);
CREATE INDEX idx_employee_id_number ON Employee (ID_Number);
CREATE INDEX idx_employee_username ON Employee (Username);
CREATE INDEX idx_financial_assistance_file_type ON Financial_Assistance (File_ID, Assistance_Type);
CREATE INDEX idx_financial_assistance_assisted_by ON Financial_Assistance (Assisted_By);
CREATE INDEX idx_financial_assistance_recurring_source ON Financial_Assistance (Recurring_Source_ID);
CREATE INDEX idx_financial_assistance_recurring_flags ON Financial_Assistance (Is_Recurring, Is_Auto_Generated);
CREATE INDEX idx_recurring_invoice_log_source ON Recurring_Invoice_Log (Source_Financial_Aid_ID);
CREATE INDEX idx_food_assistance_file_id ON Food_Assistance (File_ID);
CREATE INDEX idx_food_assistance_assisted_by ON Food_Assistance (Assisted_By);
CREATE INDEX idx_home_visit_file_id ON Home_Visit (File_ID);
CREATE INDEX idx_comments_file_id ON Comments (File_ID);
CREATE INDEX idx_relationships_file_id ON Relationships (File_ID);
CREATE INDEX idx_programs_person_trained_id ON Programs (Person_Trained_ID);
CREATE INDEX idx_employee_appraisal_employee_id ON Employee_Appraisal (Employee_ID);
CREATE INDEX idx_employee_initiative_employee_id ON Employee_Initiative (Employee_ID);
CREATE INDEX idx_employee_skills_employee_id ON Employee_Skills (Employee_ID);
CREATE INDEX idx_inventory_items_supplier_id ON Inventory_Items (Supplier_ID);
CREATE INDEX idx_inventory_transactions_item_id ON Inventory_Transactions (Item_ID);
CREATE INDEX idx_supplier_profile_category_id ON Supplier_Profile (Category_ID);
CREATE INDEX idx_conversation_participants_conversation_id ON Conversation_Participants (Conversation_ID);
CREATE INDEX idx_messages_conversation_id ON Messages (Conversation_ID);
CREATE INDEX idx_financial_assessment_file_id ON Financial_Assessment (File_ID);
CREATE INDEX idx_applicant_expense_assessment_id ON Applicant_Expense (Financial_Assessment_ID);
CREATE INDEX idx_applicant_expense_type_id ON Applicant_Expense (Expense_Type_ID);
CREATE INDEX idx_applicant_income_assessment_id ON Applicant_Income (Financial_Assessment_ID);
CREATE INDEX idx_applicant_income_type_id ON Applicant_Income (Income_Type_ID);

-- Imam Management System Indexes (created conditionally to ensure tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Imam_Profiles' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_imam_profiles_nationality ON Imam_Profiles(Nationality);
        CREATE INDEX IF NOT EXISTS idx_imam_profiles_nationality_id ON Imam_Profiles(nationality_id);
        CREATE INDEX IF NOT EXISTS idx_imam_profiles_province_id ON Imam_Profiles(province_id);
        CREATE INDEX IF NOT EXISTS idx_imam_profiles_suburb_id ON Imam_Profiles(suburb_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Jumuah_Khutbah_Topic_Submission' AND table_schema = current_schema()) THEN
        CREATE INDEX IF NOT EXISTS idx_jumuah_imam ON Jumuah_Khutbah_Topic_Submission(imam_profile_id);
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
        WHERE table_name = 'Jumuah_Khutbah_Topic_Submission' 
        AND constraint_name = 'fk_jumuah_center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Jumuah_Khutbah_Topic_Submission DROP CONSTRAINT fk_jumuah_center_id;
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
        WHERE table_name = 'Jumuah_Khutbah_Topic_Submission' 
        AND column_name = 'center_id'
        AND table_schema = current_schema()
    ) THEN
        ALTER TABLE Jumuah_Khutbah_Topic_Submission DROP COLUMN center_id;
        RAISE NOTICE 'Dropped center_id from Jumuah_Khutbah_Topic_Submission';
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
    ('Imam User');

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

INSERT INTO Supplier_Category (Name) VALUES
    ('Food Supplier'),
    ('Medical Supplier'),
    ('Service Provider');

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
UPDATE Supplier_Category SET Created_By = 'admin', Updated_By = 'admin', Updated_At = now();
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

-- ✅ Insert seed data: Center and Test Users
-- Insert into Center_Detail
INSERT INTO Center_Detail (
    Organisation_Name, Date_of_Establishment, Contact_Number, Email_Address, Address, Area, NPO_Number, Created_By
) VALUES
    ('Welfare Center Alpha', '2020-01-01', '+27123456789', 'center.alpha@example.com', '123 Main St, Soweto', 1, 'NPO-2020-001', 'admin');

-- Insert into Center_Audits
INSERT INTO Center_Audits (
    audit_date, audit_type, findings, recommendations, conducted_by, Created_By
) VALUES
    ('2024-01-15', 'Financial Audit', 'Compliant with regulations', 'Improve record-keeping', 'Auditor Jane', 'admin');

-- Insert into Policy_and_Procedure
INSERT INTO Policy_and_Procedure (
    Name, Description, Type, Date_Of_Publication, Status, Field, Created_By
) VALUES
    ('Employee Safety Policy', 'Safety guidelines for staff',
     (SELECT ID FROM Policy_Procedure_Type WHERE Name = 'Health and Safety'),
     '2023-06-01',
     (SELECT ID FROM File_Status WHERE Name = 'Active'),
     (SELECT ID FROM Policy_Procedure_Field WHERE Name = 'Compliance'),
     'admin');

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

-- User 2: HQ User
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'HQ', 'User', 'hquser', '12345', 2,
    1, 14, 1, 1, 3,
    '+27123456780', '+27123456780', 1, NULL, NULL, 'system', 'system'
);

-- User 3: Org Admin
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Org', 'Admin', 'orgadmin', '12345', 3,
    1, 14, 1, 1, 3,
    '+27123456781', '+27123456781', 1, NULL, NULL, 'system', 'system'
);

-- User 4: Org Executive
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Org', 'Executive', 'orgexeuser', '12345', 4,
    1, 14, 1, 1, 3,
    '+27123456782', '+27123456782', 1, NULL, NULL, 'system', 'system'
);

-- User 5: Org Caseworker
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Org', 'Caseworker', 'orgcaseuser', '12345', 5,
    1, 14, 1, 1, 3,
    '+27123456783', '+27123456783', 1, NULL, NULL, 'system', 'system'
);

-- Insert into Employee_Appraisal (for orgadmin user)
INSERT INTO Employee_Appraisal (
    Employee_ID, Positions, Attendance, Job_Knowledge_Skills, Quality_of_Work, Initiative_And_Motivation,
    Teamwork, General_Conduct, Discipline, Special_Task, Overall_Comments, Room_for_Improvement, Created_By
) VALUES
    (3, 'Org Admin', 'Excellent', 'Proficient', 'High Quality', 'Proactive', 'Collaborative', 'Professional', 'Good', 'None', 'Excellent performance', 'Continue training', 'system');

-- Insert into Employee_Initiative (for orgadmin user)
INSERT INTO Employee_Initiative (
    Employee_ID, Idea, Details, Idea_Date, Status, Created_By
) VALUES
    (3, 'Streamline Application Process', 'Automate data entry', '2024-02-01', 'Under Review', 'system');

-- Insert into Employee_Skills (for orgadmin user)
INSERT INTO Employee_Skills (
    Employee_ID, Course, Institution, Date_Conducted, Date_Expired, Training_Outcome, Created_By
) VALUES
    (3, 1, 1, '2023-03-01', '2026-03-01', 2, 'system');

-- Insert into HSEQ_Toolbox_Meeting
INSERT INTO HSEQ_Toolbox_Meeting (
    Meeting_Date, Conducted_By, In_Attendance, Health_Discussions, Safety_Discussions, Created_By
) VALUES
    ('2024-03-10', 'John Manager', 'Team Alpha, Team Beta', 'Hygiene protocols', 'Fire safety measures', 'admin');

-- Insert into HSEQ_Toolbox_Meeting_Tasks
INSERT INTO HSEQ_Toolbox_Meeting_Tasks (
    HSEQ_Toolbox_Meeting_ID, Task_Description, Completion_Date, Responsible, Status, Notes, Created_By
) VALUES
    (1, 'Install fire extinguishers', '2024-04-01', 'Safety Officer', 3, 'Urgent task', 'admin');

-- Insert into Applicant_Details
INSERT INTO Applicant_Details (
    Name, Surname, ID_Number, Race, Nationality, Gender, Born_Religion_ID, Period_As_Muslim_ID, File_Number,
    File_Condition, File_Status, Date_Intake, Highest_Education_Level, Marital_Status, Employment_Status,
    Cell_Number, Email_Address, Suburb, Street_Address, Dwelling_Type, Dwelling_Status, Health, Skills, Created_By
) VALUES
    ('Ahmed', 'raza', '8705051234081', 2, 14, 1, 4, 1, 'APP-2024-001', 1, 1, '2024-01-10', 3, 2, 1,
     '+27812345678', 'ahmed.raza@example.com', 1, '456 Oak St, Soweto', 1, 3, 1, 2, 'admin');

-- Insert into Comments
INSERT INTO Comments (
    File_ID, Comment, Comment_Date, Created_By
) VALUES
    (1, 'Initial assessment completed', '2024-01-11', 'admin');

-- Insert into Tasks
INSERT INTO Tasks (
    File_ID, Task_Description, Date_Required, Status, Created_By
) VALUES
    (1, 'Schedule home visit', '2024-02-15', 'In Progress', 'admin');

-- Insert into Relationships
INSERT INTO Relationships (
    File_ID, Relationship_Type, Name, Surname, ID_Number, Date_of_Birth, Employment_Status, Gender,
    Highest_Education, Health_Condition, Created_By
) VALUES
    (1, 2, 'Aisha', 'raza', '1505051234082', '2015-05-05', 2, 2, 1, 1, 'admin');

-- Insert into Home_Visit
INSERT INTO Home_Visit (
    File_ID, Visit_Date, Representative, Comments, Created_By
) VALUES
    (1, '2024-02-20', 'Case Worker Jane', 'Stable living conditions', 'admin');

-- Insert into Financial_Assistance
INSERT INTO Financial_Assistance (
    File_ID, Assistance_Type, Financial_Amount, Date_of_Assistance, Created_By
) VALUES
    (1, 1, 1000.00, '2024-02-25', 'admin');

-- Insert into Hampers
INSERT INTO Hampers (Name, Created_By) VALUES
    ('Basic Food Hamper', 'admin'),
    ('Emergency Food Hamper', 'admin'),
    ('Special Dietary Hamper', 'admin');

-- Insert into Food_Assistance
INSERT INTO Food_Assistance (
    File_ID, Distributed_Date, Hamper_Type, Financial_Cost, Created_By
) VALUES
    (1, '2024-02-28',
     (SELECT ID FROM Hampers WHERE Name = 'Basic Food Hamper'),
     250.00, 'admin');

-- Insert into Attachments
INSERT INTO Attachments (
    File_ID, Attachment_Name, Attachment_Details, Created_By
) VALUES
    (1, 'ID Document Scan', 'Applicant ID copy', 'admin');

-- Insert into Programs
INSERT INTO Programs (
    Person_Trained_ID, Program_Name, Means_of_communication, Date_of_program, Communicated_by,
    Training_Level, Training_Provider, Program_Outcome, Created_By
) VALUES
    (1, 1, 1, '2024-03-01', 1, 1, 1, 2, 'admin');

-- Insert into Service_Rating
INSERT INTO Service_Rating (
    Overall_Experience, Respect_And_Dignity, Communication_And_Clarity, Timeliness_Of_Support, 
    Fairness_And_Equality, Usefulness_Of_Service, Friendliness_Of_Staff, Positive_Impact, 
    Access_Ease, Would_Recommend, Appreciate_Most, How_To_Improve, Other_Comments, Created_By
) VALUES
    (4, 5, 4, 3, 4, 5, 4, TRUE, 4, TRUE, 'Friendly staff', 'Faster response times', 
     'Great service overall', 'admin');

-- Insert into Supplier_Profile
INSERT INTO Supplier_Profile (
    Name, Registration_No, Contact_Person, Contact_Email, Contact_Phone, Address, 
    Category_ID, Status, Created_By
) VALUES
    ('Fresh Foods Ltd', 'REG-2023-001', 'John Supplier', 'john@freshfoods.com', '+27123456780', 
     '789 Market St, Sandton',
     (SELECT ID FROM Supplier_Category WHERE Name = 'Food Supplier'), 'Active', 'admin');

-- Insert into Supplier_Evaluation
INSERT INTO Supplier_Evaluation (
    Supplier_ID, Eval_Date, Quality_Score, Delivery_Score, Cost_Score, OHS_Score, Env_Score,
    Quality_Wt, Delivery_Wt, Cost_Wt, OHS_Wt, Env_Wt, Overall_Score, Status, Notes, Expiry_Date, Created_By
) VALUES
    ((SELECT ID FROM Supplier_Profile WHERE Name = 'Fresh Foods Ltd'), '2024-03-15', 4, 5, 3, 4, 4,
     0.30, 0.25, 0.20, 0.15, 0.10, 4.10, 'Approved', 'Reliable supplier', '2025-03-15', 'admin');

-- Insert into Supplier_Document
INSERT INTO Supplier_Document (
    Supplier_ID, Doc_Type, Issued_At, Description, Created_By
) VALUES
    ((SELECT ID FROM Supplier_Profile WHERE Name = 'Fresh Foods Ltd'), 'Tax Clearance', 
     '2024-01-01', 'Tax clearance certificate', 'admin');

-- Insert into Inventory_Items
INSERT INTO Inventory_Items (
    Item_Name, Description, Hamper_Type, Quantity, Unit, Min_Stock, Cost_Per_Unit, Supplier_ID, Created_By
) VALUES
    ('Rice 5kg', 'Long-grain white rice', 
     (SELECT ID FROM Hampers WHERE Name = 'Basic Food Hamper'), 100.00, 'kg', 20.00, 15.00,
     (SELECT ID FROM Supplier_Profile WHERE Name = 'Fresh Foods Ltd'), 'admin');

-- Insert into Inventory_Transactions
INSERT INTO Inventory_Transactions (
    Item_ID, Transaction_Type, Quantity, Transaction_Date, Notes, Employee_ID, Created_By
) VALUES
    ((SELECT ID FROM Inventory_Items WHERE Item_Name = 'Rice 5kg'), 'IN', 50.00, '2024-03-20', 
     'Restock from supplier', 1, 'admin');

-- Insert into Conversations
INSERT INTO Conversations (
    Title, Type, Created_By
) VALUES
    ('Team Coordination', 'Group', 'admin');

-- Insert into Conversation_Participants
INSERT INTO Conversation_Participants (
    Conversation_ID, Employee_ID, Joined_Date, Created_By
) VALUES
    ((SELECT ID FROM Conversations WHERE Title = 'Team Coordination'), 1, '2024-03-21', 'admin');

-- Insert into Messages
INSERT INTO Messages (
    Conversation_ID, Sender_ID, Message_Text, Read_Status, Created_By
) VALUES
    ((SELECT ID FROM Conversations WHERE Title = 'Team Coordination'), 1, 
     'Please review the new applicant process.', 'Unread', 'admin');

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
