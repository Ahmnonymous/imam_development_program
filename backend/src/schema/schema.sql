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
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    CONSTRAINT fk_center_id FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    -- ✅ Center_ID can be NULL for App Admin users (User_Type = 1)
    -- All other user types must have a valid center_id
    Center_ID BIGINT,
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
    CONSTRAINT fk_center_id FOREIGN KEY (Center_ID) REFERENCES Center_Detail(ID),
    CONSTRAINT fk_nationality FOREIGN KEY (Nationality) REFERENCES Nationality(ID),
    CONSTRAINT fk_race FOREIGN KEY (Race) REFERENCES Race(ID),
    CONSTRAINT fk_highest_education_level FOREIGN KEY (Highest_Education_Level) REFERENCES Education_Level(ID),
    CONSTRAINT fk_gender FOREIGN KEY (Gender) REFERENCES Gender(ID),
    CONSTRAINT fk_suburb FOREIGN KEY (Suburb) REFERENCES Suburb(ID),
    CONSTRAINT fk_blood_type FOREIGN KEY (Blood_Type) REFERENCES Blood_Type(ID),
    CONSTRAINT fk_user_type FOREIGN KEY (User_Type) REFERENCES User_Types(ID),
    CONSTRAINT fk_department FOREIGN KEY (Department) REFERENCES Departments(ID),
    -- ✅ CONSTRAINT: App Admin (User_Type = 1) must have NULL center_id
    CONSTRAINT chk_app_admin_no_center CHECK (
        (User_Type = 1 AND Center_ID IS NULL) OR
        (User_Type != 1)
    )
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
    center_id BIGINT,
    CONSTRAINT fk_employee_id_app FOREIGN KEY (Employee_ID) REFERENCES Employee(ID),
    CONSTRAINT fk_center_id_app FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_employee_id_init FOREIGN KEY (Employee_ID) REFERENCES Employee(ID),
    CONSTRAINT fk_center_id_init FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_employee_id_skills FOREIGN KEY (Employee_ID) REFERENCES Employee(ID),
    CONSTRAINT fk_course FOREIGN KEY (Course) REFERENCES Training_Courses(ID),
    CONSTRAINT fk_institution FOREIGN KEY (Institution) REFERENCES Training_Institutions(ID),
    CONSTRAINT fk_training_outcome FOREIGN KEY (Training_Outcome) REFERENCES Training_Outcome(ID),
    CONSTRAINT fk_center_id_skills FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT,
    CONSTRAINT fk_center_id_hseq FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_hseq_toolbox_meeting_id FOREIGN KEY (HSEQ_Toolbox_Meeting_ID) REFERENCES HSEQ_Toolbox_Meeting(ID),
    CONSTRAINT fk_status FOREIGN KEY (Status) REFERENCES Tasks_Status(ID),
    CONSTRAINT fk_center_id_hseq_tasks FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
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
    CONSTRAINT fk_center_id_app FOREIGN KEY (center_id) REFERENCES Center_Detail(ID),
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
    center_id BIGINT,
    CONSTRAINT fk_file_id FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_center_id_com FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_file_id_task FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_center_id_task FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_file_id_rel FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_relationship_type FOREIGN KEY (Relationship_Type) REFERENCES Relationship_Types(ID),
    CONSTRAINT fk_employment_status_rel FOREIGN KEY (Employment_Status) REFERENCES Employment_Status(ID),
    CONSTRAINT fk_gender_rel FOREIGN KEY (Gender) REFERENCES Gender(ID),
    CONSTRAINT fk_highest_education_rel FOREIGN KEY (Highest_Education) REFERENCES Education_Level(ID),
    CONSTRAINT fk_health_condition FOREIGN KEY (Health_Condition) REFERENCES Health_Conditions(ID),
    CONSTRAINT fk_center_id_rel FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_file_id_vis FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_center_id_vis FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_file_id_fin FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_assistance_type FOREIGN KEY (Assistance_Type) REFERENCES Assistance_Types(ID),
    CONSTRAINT fk_financial_assistance_assisted_by FOREIGN KEY (Assisted_By) REFERENCES Employee(ID),
    CONSTRAINT fk_recurring_source_id FOREIGN KEY (Recurring_Source_ID) REFERENCES Financial_Assistance(ID) ON DELETE CASCADE,
    CONSTRAINT fk_center_id_fin FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_file_id_food FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_hamper_type FOREIGN KEY (Hamper_Type) REFERENCES Hampers(ID),
    CONSTRAINT fk_food_assistance_assisted_by FOREIGN KEY (Assisted_By) REFERENCES Employee(ID),
    CONSTRAINT fk_center_id_food FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_file_id_att FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_center_id_att FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    CONSTRAINT fk_program_name FOREIGN KEY (Program_Name) REFERENCES Training_Courses(ID),
    CONSTRAINT fk_communicated_by FOREIGN KEY (Communicated_by) REFERENCES Employee(ID),
    CONSTRAINT fk_training_level FOREIGN KEY (Training_Level) REFERENCES Training_Level(ID),
    CONSTRAINT fk_training_provider FOREIGN KEY (Training_Provider) REFERENCES Training_Institutions(ID),
    CONSTRAINT fk_program_outcome FOREIGN KEY (Program_Outcome) REFERENCES Training_Outcome(ID),
    CONSTRAINT fk_person_trained FOREIGN KEY (Person_Trained_ID) REFERENCES Applicant_Details(ID),
    CONSTRAINT fk_center_id_prog FOREIGN KEY (center_id) REFERENCES Center_Detail(ID),
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
    center_id BIGINT, -- ✅ Fix Issue #1: Allow NULL for App Admin-created records (removed NOT NULL)
    Total_Income DECIMAL(12,2),
    Total_Expenses DECIMAL(12,2),
    Disposable_Income DECIMAL(12,2),
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_file_id FOREIGN KEY (File_ID) REFERENCES Applicant_Details(ID) ON DELETE CASCADE, -- ✅ Fix Issue #2: Add CASCADE to allow applicant deletion
    CONSTRAINT fk_center_id_fin_ass FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
            File_ID, center_id, Total_Income, Total_Expenses, Disposable_Income, Created_By
        ) VALUES (
            NEW.ID, 
            NEW.center_id, -- ✅ Fix Issue #1: Preserve NULL if App Admin created with NULL center_id (no auto-assignment)
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
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    center_id BIGINT NOT NULL,
    CONSTRAINT fk_center_id_service_rating FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

CREATE TABLE Supplier_Profile (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id BIGINT NOT NULL,
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
    CONSTRAINT fk_center_id_supplier FOREIGN KEY (center_id) REFERENCES Center_Detail(ID),
    CONSTRAINT fk_category_id FOREIGN KEY (Category_ID) REFERENCES Supplier_Category(ID)
);

CREATE TABLE Supplier_Evaluation (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id BIGINT NOT NULL,
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
    CONSTRAINT fk_center_id_sup_eval FOREIGN KEY (center_id) REFERENCES Center_Detail(ID),
    CONSTRAINT fk_supplier_id FOREIGN KEY (Supplier_ID) REFERENCES Supplier_Profile(ID) ON DELETE CASCADE
);

CREATE TABLE Supplier_Document (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id BIGINT NOT NULL,
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
    CONSTRAINT fk_center_id_sup_doc FOREIGN KEY (center_id) REFERENCES Center_Detail(ID),
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
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_hamper_type_inv FOREIGN KEY (Hamper_Type) REFERENCES Hampers(ID),
    CONSTRAINT fk_center_id_inv FOREIGN KEY (center_id) REFERENCES Center_Detail(ID),
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
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_item_id FOREIGN KEY (Item_ID) REFERENCES Inventory_Items(ID),
    CONSTRAINT fk_employee_id_trans FOREIGN KEY (Employee_ID) REFERENCES Employee(ID),
    CONSTRAINT fk_center_id_trans FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_center_id_conv FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

CREATE TABLE Conversation_Participants (
    ID SERIAL PRIMARY KEY,
    Conversation_ID BIGINT,
    Employee_ID BIGINT,
    Joined_Date DATE,
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_conversation_id FOREIGN KEY (Conversation_ID) REFERENCES Conversations(ID),
    CONSTRAINT fk_employee_id FOREIGN KEY (Employee_ID) REFERENCES Employee(ID),
    CONSTRAINT fk_center_id_part FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_conversation_id_msg FOREIGN KEY (Conversation_ID) REFERENCES Conversations(ID),
    CONSTRAINT fk_sender_id FOREIGN KEY (Sender_ID) REFERENCES Employee(ID),
    CONSTRAINT fk_center_id_msg FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
);

CREATE TABLE Folders (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255),
    Parent_ID BIGINT,
    Employee_ID BIGINT,
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_parent_id FOREIGN KEY (Parent_ID) REFERENCES Folders(ID),
    CONSTRAINT fk_employee_id_fold FOREIGN KEY (Employee_ID) REFERENCES Employee(ID),
    CONSTRAINT fk_center_id_fold FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
    center_id BIGINT,
    Created_By VARCHAR(255),
    Created_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    Updated_By VARCHAR(255),
    Updated_At TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_folder_id FOREIGN KEY (Folder_ID) REFERENCES Folders(ID),
    CONSTRAINT fk_employee_id_file FOREIGN KEY (Employee_ID) REFERENCES Employee(ID),
    CONSTRAINT fk_center_id_file FOREIGN KEY (center_id) REFERENCES Center_Detail(ID)
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
CREATE INDEX idx_supplier_profile_center ON Supplier_Profile (center_id);
CREATE INDEX idx_supplier_evaluation_center ON Supplier_Evaluation (center_id);
CREATE INDEX idx_supplier_document_center ON Supplier_Document (center_id);
CREATE INDEX idx_supplier_evaluation_supplier ON Supplier_Evaluation (Supplier_ID);
CREATE INDEX idx_supplier_document_supplier ON Supplier_Document (Supplier_ID);
CREATE INDEX idx_applicant_details_file_number ON Applicant_Details (File_Number);
CREATE INDEX idx_applicant_details_center_id ON Applicant_Details (center_id);
CREATE INDEX idx_applicant_details_id_number ON Applicant_Details (ID_Number);
CREATE INDEX idx_employee_center_id ON Employee (center_id);
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
CREATE INDEX idx_conversations_center_id ON Conversations (center_id);
CREATE INDEX idx_conversation_participants_conversation_id ON Conversation_Participants (Conversation_ID);
CREATE INDEX idx_messages_conversation_id ON Messages (Conversation_ID);
CREATE INDEX idx_financial_assessment_file_id ON Financial_Assessment (File_ID);
CREATE INDEX idx_financial_assessment_center_id ON Financial_Assessment (center_id);
CREATE INDEX idx_applicant_expense_assessment_id ON Applicant_Expense (Financial_Assessment_ID);
CREATE INDEX idx_applicant_expense_type_id ON Applicant_Expense (Expense_Type_ID);
CREATE INDEX idx_applicant_income_assessment_id ON Applicant_Income (Financial_Assessment_ID);
CREATE INDEX idx_applicant_income_type_id ON Applicant_Income (Income_Type_ID);

-- Imam Management System Indexes
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
    ('Org. Caseworkers');

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
    audit_date, audit_type, findings, recommendations, conducted_by, center_id, Created_By
) VALUES
    ('2024-01-15', 'Financial Audit', 'Compliant with regulations', 'Improve record-keeping', 'Auditor Jane', 1, 'admin');

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
-- User 1: App Admin (NO center_id - has access to all centers)
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Center_ID, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Super', 'Admin', 'admin', '12345', 1,
    NULL, 1, 14, 1, 1, 3,
    '+27123456789', '+27123456789', 1, NULL, NULL, 'system', 'system'
);

-- User 2: HQ User (Multi-center access, cannot manage centers)
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Center_ID, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'HQ', 'User', 'hquser', '12345', 2,
    NULL, 1, 14, 1, 1, 3,
    '+27123456780', '+27123456780', 1, NULL, NULL, 'system', 'system'
);

-- User 3: Org Admin (Full CRUD within own center)
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Center_ID, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Org', 'Admin', 'orgadmin', '12345', 3,
    1, 1, 14, 1, 1, 3,
    '+27123456781', '+27123456781', 1, NULL, NULL, 'system', 'system'
);

-- User 4: Org Executive (Read-only within own center)
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Center_ID, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Org', 'Executive', 'orgexeuser', '12345', 4,
    1, 1, 14, 1, 1, 3,
    '+27123456782', '+27123456782', 1, NULL, NULL, 'system', 'system'
);

-- User 5: Org Caseworker (Limited access - Applicants & Tasks only)
INSERT INTO Employee (
    Name, Surname, Username, Password_Hash, User_Type, Center_ID, Suburb, Nationality, Race, Gender, 
    Highest_Education_Level, Contact_Number, Emergency_Contact, Blood_Type, Department, HSEQ_Related, Created_By, Updated_By
) VALUES (
    'Org', 'Caseworker', 'orgcaseuser', '12345', 5,
    1, 1, 14, 1, 1, 3,
    '+27123456783', '+27123456783', 1, NULL, NULL, 'system', 'system'
);

-- Insert into Employee_Appraisal (for orgadmin user)
INSERT INTO Employee_Appraisal (
    Employee_ID, Positions, Attendance, Job_Knowledge_Skills, Quality_of_Work, Initiative_And_Motivation,
    Teamwork, General_Conduct, Discipline, Special_Task, Overall_Comments, Room_for_Improvement, center_id, Created_By
) VALUES
    (3, 'Org Admin', 'Excellent', 'Proficient', 'High Quality', 'Proactive', 'Collaborative', 'Professional', 'Good', 'None', 'Excellent performance', 'Continue training', 1, 'system');

-- Insert into Employee_Initiative (for orgadmin user)
INSERT INTO Employee_Initiative (
    Employee_ID, Idea, Details, Idea_Date, Status, center_id, Created_By
) VALUES
    (3, 'Streamline Application Process', 'Automate data entry', '2024-02-01', 'Under Review', 1, 'system');

-- Insert into Employee_Skills (for orgadmin user)
INSERT INTO Employee_Skills (
    Employee_ID, Course, Institution, Date_Conducted, Date_Expired, Training_Outcome, center_id, Created_By
) VALUES
    (3, 1, 1, '2023-03-01', '2026-03-01', 2, 1, 'system');

-- Insert into HSEQ_Toolbox_Meeting
INSERT INTO HSEQ_Toolbox_Meeting (
    Meeting_Date, Conducted_By, In_Attendance, Health_Discussions, Safety_Discussions, center_id, Created_By
) VALUES
    ('2024-03-10', 'John Manager', 'Team Alpha, Team Beta', 'Hygiene protocols', 'Fire safety measures', 1, 'admin');

-- Insert into HSEQ_Toolbox_Meeting_Tasks
INSERT INTO HSEQ_Toolbox_Meeting_Tasks (
    HSEQ_Toolbox_Meeting_ID, Task_Description, Completion_Date, Responsible, Status, Notes, center_id, Created_By
) VALUES
    (1, 'Install fire extinguishers', '2024-04-01', 'Safety Officer', 3, 'Urgent task', 1, 'admin');

-- Insert into Applicant_Details
INSERT INTO Applicant_Details (
    Name, Surname, ID_Number, Race, Nationality, Gender, Born_Religion_ID, Period_As_Muslim_ID, File_Number,
    File_Condition, File_Status, Date_Intake, Highest_Education_Level, Marital_Status, Employment_Status,
    Cell_Number, Email_Address, Suburb, Street_Address, Dwelling_Type, Dwelling_Status, Health, Skills, center_id, Created_By
) VALUES
    ('Ahmed', 'raza', '8705051234081', 2, 14, 1, 4, 1, 'APP-2024-001', 1, 1, '2024-01-10', 3, 2, 1,
     '+27812345678', 'ahmed.raza@example.com', 1, '456 Oak St, Soweto', 1, 3, 1, 2, 1, 'admin');

-- Insert into Comments
INSERT INTO Comments (
    File_ID, Comment, Comment_Date, center_id, Created_By
) VALUES
    (1, 'Initial assessment completed', '2024-01-11', 1, 'admin');

-- Insert into Tasks
INSERT INTO Tasks (
    File_ID, Task_Description, Date_Required, Status, center_id, Created_By
) VALUES
    (1, 'Schedule home visit', '2024-02-15', 'In Progress', 1, 'admin');

-- Insert into Relationships
INSERT INTO Relationships (
    File_ID, Relationship_Type, Name, Surname, ID_Number, Date_of_Birth, Employment_Status, Gender,
    Highest_Education, Health_Condition, center_id, Created_By
) VALUES
    (1, 2, 'Aisha', 'raza', '1505051234082', '2015-05-05', 2, 2, 1, 1, 1, 'admin');

-- Insert into Home_Visit
INSERT INTO Home_Visit (
    File_ID, Visit_Date, Representative, Comments, center_id, Created_By
) VALUES
    (1, '2024-02-20', 'Case Worker Jane', 'Stable living conditions', 1, 'admin');

-- Insert into Financial_Assistance
INSERT INTO Financial_Assistance (
    File_ID, Assistance_Type, Financial_Amount, Date_of_Assistance, center_id, Created_By
) VALUES
    (1, 1, 1000.00, '2024-02-25', 1, 'admin');

-- Insert into Hampers
INSERT INTO Hampers (Name, Created_By) VALUES
    ('Basic Food Hamper', 'admin'),
    ('Emergency Food Hamper', 'admin'),
    ('Special Dietary Hamper', 'admin');

-- Insert into Food_Assistance
INSERT INTO Food_Assistance (
    File_ID, Distributed_Date, Hamper_Type, Financial_Cost, center_id, Created_By
) VALUES
    (1, '2024-02-28',
     (SELECT ID FROM Hampers WHERE Name = 'Basic Food Hamper'),
     250.00, 1, 'admin');

-- Insert into Attachments
INSERT INTO Attachments (
    File_ID, Attachment_Name, Attachment_Details, center_id, Created_By
) VALUES
    (1, 'ID Document Scan', 'Applicant ID copy', 1, 'admin');

-- Insert into Programs
INSERT INTO Programs (
    Person_Trained_ID, Program_Name, Means_of_communication, Date_of_program, Communicated_by,
    Training_Level, Training_Provider, Program_Outcome, center_id, Created_By
) VALUES
    (1, 1, 1, '2024-03-01', 1, 1, 1, 2, 1, 'admin');

-- Insert into Service_Rating
INSERT INTO Service_Rating (
    Overall_Experience, Respect_And_Dignity, Communication_And_Clarity, Timeliness_Of_Support, 
    Fairness_And_Equality, Usefulness_Of_Service, Friendliness_Of_Staff, Positive_Impact, 
    Access_Ease, Would_Recommend, Appreciate_Most, How_To_Improve, Other_Comments, center_id, Created_By
) VALUES
    (4, 5, 4, 3, 4, 5, 4, TRUE, 4, TRUE, 'Friendly staff', 'Faster response times', 
     'Great service overall', 1, 'admin');

-- Insert into Supplier_Profile
INSERT INTO Supplier_Profile (
    center_id, Name, Registration_No, Contact_Person, Contact_Email, Contact_Phone, Address, 
    Category_ID, Status, Created_By
) VALUES
    (1, 'Fresh Foods Ltd', 'REG-2023-001', 'John Supplier', 'john@freshfoods.com', '+27123456780', 
     '789 Market St, Sandton',
     (SELECT ID FROM Supplier_Category WHERE Name = 'Food Supplier'), 'Active', 'admin');

-- Insert into Supplier_Evaluation
INSERT INTO Supplier_Evaluation (
    center_id, Supplier_ID, Eval_Date, Quality_Score, Delivery_Score, Cost_Score, OHS_Score, Env_Score,
    Quality_Wt, Delivery_Wt, Cost_Wt, OHS_Wt, Env_Wt, Overall_Score, Status, Notes, Expiry_Date, Created_By
) VALUES
    (1, (SELECT ID FROM Supplier_Profile WHERE Name = 'Fresh Foods Ltd'), '2024-03-15', 4, 5, 3, 4, 4,
     0.30, 0.25, 0.20, 0.15, 0.10, 4.10, 'Approved', 'Reliable supplier', '2025-03-15', 'admin');

-- Insert into Supplier_Document
INSERT INTO Supplier_Document (
    center_id, Supplier_ID, Doc_Type, Issued_At, Description, Created_By
) VALUES
    (1, (SELECT ID FROM Supplier_Profile WHERE Name = 'Fresh Foods Ltd'), 'Tax Clearance', 
     '2024-01-01', 'Tax clearance certificate', 'admin');

-- Insert into Inventory_Items
INSERT INTO Inventory_Items (
    Item_Name, Description, Hamper_Type, Quantity, Unit, Min_Stock, Cost_Per_Unit, Supplier_ID, center_id, Created_By
) VALUES
    ('Rice 5kg', 'Long-grain white rice', 
     (SELECT ID FROM Hampers WHERE Name = 'Basic Food Hamper'), 100.00, 'kg', 20.00, 15.00,
     (SELECT ID FROM Supplier_Profile WHERE Name = 'Fresh Foods Ltd'), 1, 'admin');

-- Insert into Inventory_Transactions
INSERT INTO Inventory_Transactions (
    Item_ID, Transaction_Type, Quantity, Transaction_Date, Notes, Employee_ID, center_id, Created_By
) VALUES
    ((SELECT ID FROM Inventory_Items WHERE Item_Name = 'Rice 5kg'), 'IN', 50.00, '2024-03-20', 
     'Restock from supplier', 1, 1, 'admin');

-- Insert into Conversations
INSERT INTO Conversations (
    Title, Type, center_id, Created_By
) VALUES
    ('Team Coordination', 'Group', 1, 'admin');

-- Insert into Conversation_Participants
INSERT INTO Conversation_Participants (
    Conversation_ID, Employee_ID, Joined_Date, center_id, Created_By
) VALUES
    ((SELECT ID FROM Conversations WHERE Title = 'Team Coordination'), 1, '2024-03-21', 1, 'admin');

-- Insert into Messages
INSERT INTO Messages (
    Conversation_ID, Sender_ID, Message_Text, Read_Status, center_id, Created_By
) VALUES
    ((SELECT ID FROM Conversations WHERE Title = 'Team Coordination'), 1, 
     'Please review the new applicant process.', 'Unread', 1, 'admin');

-- Insert into Folders
INSERT INTO Folders (
    Name, Employee_ID, center_id, Created_By
) VALUES
    ('Case Files 2024', 1, 1, 'admin');

-- Insert into Personal_Files
INSERT INTO Personal_Files (
    Name, Folder_ID, Employee_ID, center_id, Created_By
) VALUES
    ('Performance Review Q1', (SELECT ID FROM Folders WHERE Name = 'Case Files 2024'), 1, 1, 'admin');

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
