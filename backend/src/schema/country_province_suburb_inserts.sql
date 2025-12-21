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
