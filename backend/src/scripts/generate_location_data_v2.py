#!/usr/bin/env python3
"""
Generate SQL INSERT statements for Country, Province, and Suburb tables
by fetching data from public APIs with improved data quality.
"""

import json
import urllib.request
import urllib.parse
from datetime import datetime

# API endpoints
COUNTRIES_API = "https://restcountries.com/v3.1/all?fields=name,cca2,cca3"

# Curated province/state data for major countries (more reliable than API)
PROVINCES_DATA = {
    'ZA': [  # South Africa
        {'name': 'Eastern Cape', 'code': 'EC'},
        {'name': 'Free State', 'code': 'FS'},
        {'name': 'Gauteng', 'code': 'GP'},
        {'name': 'KwaZulu-Natal', 'code': 'KZN'},
        {'name': 'Limpopo', 'code': 'LP'},
        {'name': 'Mpumalanga', 'code': 'MP'},
        {'name': 'Northern Cape', 'code': 'NC'},
        {'name': 'North West', 'code': 'NW'},
        {'name': 'Western Cape', 'code': 'WC'}
    ],
    'US': [  # United States - Top 20 states
        {'name': 'Alabama', 'code': 'AL'}, {'name': 'Alaska', 'code': 'AK'},
        {'name': 'Arizona', 'code': 'AZ'}, {'name': 'Arkansas', 'code': 'AR'},
        {'name': 'California', 'code': 'CA'}, {'name': 'Colorado', 'code': 'CO'},
        {'name': 'Connecticut', 'code': 'CT'}, {'name': 'Delaware', 'code': 'DE'},
        {'name': 'Florida', 'code': 'FL'}, {'name': 'Georgia', 'code': 'GA'},
        {'name': 'Illinois', 'code': 'IL'}, {'name': 'Indiana', 'code': 'IN'},
        {'name': 'Massachusetts', 'code': 'MA'}, {'name': 'Michigan', 'code': 'MI'},
        {'name': 'New Jersey', 'code': 'NJ'}, {'name': 'New York', 'code': 'NY'},
        {'name': 'North Carolina', 'code': 'NC'}, {'name': 'Ohio', 'code': 'OH'},
        {'name': 'Pennsylvania', 'code': 'PA'}, {'name': 'Texas', 'code': 'TX'}
    ],
    'CA': [  # Canada
        {'name': 'Alberta', 'code': 'AB'}, {'name': 'British Columbia', 'code': 'BC'},
        {'name': 'Manitoba', 'code': 'MB'}, {'name': 'New Brunswick', 'code': 'NB'},
        {'name': 'Newfoundland and Labrador', 'code': 'NL'},
        {'name': 'Northwest Territories', 'code': 'NT'}, {'name': 'Nova Scotia', 'code': 'NS'},
        {'name': 'Nunavut', 'code': 'NU'}, {'name': 'Ontario', 'code': 'ON'},
        {'name': 'Prince Edward Island', 'code': 'PE'}, {'name': 'Quebec', 'code': 'QC'},
        {'name': 'Saskatchewan', 'code': 'SK'}, {'name': 'Yukon', 'code': 'YT'}
    ],
    'GB': [  # United Kingdom
        {'name': 'England', 'code': 'ENG'}, {'name': 'Scotland', 'code': 'SCT'},
        {'name': 'Wales', 'code': 'WLS'}, {'name': 'Northern Ireland', 'code': 'NIR'}
    ],
    'AU': [  # Australia
        {'name': 'New South Wales', 'code': 'NSW'}, {'name': 'Victoria', 'code': 'VIC'},
        {'name': 'Queensland', 'code': 'QLD'}, {'name': 'Western Australia', 'code': 'WA'},
        {'name': 'South Australia', 'code': 'SA'}, {'name': 'Tasmania', 'code': 'TAS'},
        {'name': 'Northern Territory', 'code': 'NT'},
        {'name': 'Australian Capital Territory', 'code': 'ACT'}
    ],
    'IN': [  # India - Top 15 states
        {'name': 'Andhra Pradesh', 'code': 'AP'}, {'name': 'Assam', 'code': 'AS'},
        {'name': 'Bihar', 'code': 'BR'}, {'name': 'Gujarat', 'code': 'GJ'},
        {'name': 'Haryana', 'code': 'HR'}, {'name': 'Karnataka', 'code': 'KA'},
        {'name': 'Kerala', 'code': 'KL'}, {'name': 'Madhya Pradesh', 'code': 'MP'},
        {'name': 'Maharashtra', 'code': 'MH'}, {'name': 'Odisha', 'code': 'OD'},
        {'name': 'Punjab', 'code': 'PB'}, {'name': 'Rajasthan', 'code': 'RJ'},
        {'name': 'Tamil Nadu', 'code': 'TN'}, {'name': 'Uttar Pradesh', 'code': 'UP'},
        {'name': 'West Bengal', 'code': 'WB'}
    ]
}

# Curated major cities/suburbs for key provinces
CITIES_DATA = {
    ('ZA', 'Gauteng', 'GP'): ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Midrand', 'Centurion', 'Boksburg', 'Benoni', 'Germiston', 'Kempton Park'],
    ('ZA', 'Western Cape', 'WC'): ['Cape Town', 'Stellenbosch', 'Paarl', 'Worcester', 'George', 'Mossel Bay', 'Oudtshoorn', 'Knysna', 'Hermanus', 'Somerset West'],
    ('ZA', 'KwaZulu-Natal', 'KZN'): ['Durban', 'Pietermaritzburg', 'Newcastle', 'Ladysmith', 'Richards Bay', 'Pinetown', 'Amanzimtoti', 'Ballito', 'Umhlanga', 'Westville'],
    ('US', 'California', 'CA'): ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Oakland', 'Fresno', 'Long Beach', 'Santa Ana', 'Anaheim'],
    ('US', 'New York', 'NY'): ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'Yonkers', 'Utica', 'Schenectady', 'Mount Vernon', 'Troy'],
    ('US', 'Texas', 'TX'): ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo'],
    ('CA', 'Ontario', 'ON'): ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Mississauga', 'Brampton', 'Windsor', 'Kitchener', 'Markham', 'Vaughan'],
    ('CA', 'British Columbia', 'BC'): ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Kelowna', 'Abbotsford', 'Coquitlam', 'Saanich', 'Langley'],
    ('GB', 'England', 'ENG'): ['London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Leicester', 'Coventry', 'Nottingham'],
    ('AU', 'New South Wales', 'NSW'): ['Sydney', 'Newcastle', 'Wollongong', 'Albury', 'Wagga Wagga', 'Tamworth', 'Orange', 'Dubbo', 'Nowra', 'Grafton'],
    ('AU', 'Victoria', 'VIC'): ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Warrnambool', 'Mildura', 'Traralgon', 'Horsham', 'Colac'],
    ('IN', 'Maharashtra', 'MH'): ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Jalgaon'],
    ('IN', 'Karnataka', 'KA'): ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 'Bijapur', 'Shimoga']
}

def fetch_json(url):
    """Fetch JSON data from URL"""
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  Warning: {e}")
        return None

def escape_sql_string(s):
    """Escape single quotes for SQL"""
    if s is None:
        return ""
    return str(s).replace("'", "''")

def generate_country_inserts(countries):
    """Generate SQL INSERT statements for countries"""
    sql = f"""-- ============================================================
-- COUNTRY DATA INSERT SCRIPT
-- ============================================================
-- Generated: {datetime.now().isoformat()}
-- Source: REST Countries API (https://restcountries.com)
-- Total Countries: {len(countries)}
-- ============================================================

INSERT INTO Country (Name, Code, Created_By, Updated_By)
VALUES
"""
    
    values = []
    for country in countries:
        name = escape_sql_string(country.get('name', {}).get('common', ''))
        code = escape_sql_string(country.get('cca2', ''))
        if name and code:
            values.append(f"    ('{name}', '{code}', 'system', 'system')")
    
    sql += ',\n'.join(values)
    sql += "\nON CONFLICT (Name) DO NOTHING;\n\n"
    return sql

def generate_province_inserts():
    """Generate SQL INSERT statements for provinces/states using curated data"""
    sql = f"""-- ============================================================
-- PROVINCE/STATE DATA INSERT SCRIPT
-- ============================================================
-- Generated: {datetime.now().isoformat()}
-- Source: Curated dataset for major countries
-- ============================================================

"""
    
    province_values = []
    total_provinces = 0
    
    for country_code, provinces in PROVINCES_DATA.items():
        for province in provinces:
            province_name = escape_sql_string(province['name'])
            
            province_values.append(
                f"    ((SELECT ID FROM Country WHERE Code = '{country_code}' LIMIT 1), '{province_name}', 'system', 'system')"
            )
            total_provinces += 1
    
    if province_values:
        sql += f"-- Total Provinces: {total_provinces}\n\n"
        sql += "INSERT INTO Province (country_id, Name, Created_By, Updated_By)\n"
        sql += "SELECT * FROM (VALUES\n"
        sql += ',\n'.join(province_values)
        sql += "\n) AS v(country_id, name, created_by, updated_by)\n"
        sql += "WHERE NOT EXISTS (\n"
        sql += "    SELECT 1 FROM Province p\n"
        sql += "    WHERE p.country_id = v.country_id AND p.Name = v.name\n"
        sql += ");\n\n"
    
    return sql

def generate_suburb_inserts():
    """Generate SQL INSERT statements for suburbs/cities using curated data"""
    sql = f"""-- ============================================================
-- SUBURB/CITY DATA INSERT SCRIPT
-- ============================================================
-- Generated: {datetime.now().isoformat()}
-- Source: Curated dataset for major provinces
-- ============================================================

"""
    
    suburb_values = []
    total_suburbs = 0
    
    for (country_code, province_name, province_code), cities in CITIES_DATA.items():
        for city in cities:
            city_name = escape_sql_string(city)
            suburb_values.append(
                f"    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = '{country_code}' LIMIT 1) AND Name = '{escape_sql_string(province_name)}' LIMIT 1), '{city_name}', 'system', 'system')"
            )
            total_suburbs += 1
    
    if suburb_values:
        sql += f"-- Total Suburbs/Cities: {total_suburbs}\n\n"
        sql += "INSERT INTO Suburb (province_id, Name, Created_By, Updated_By)\n"
        sql += "SELECT * FROM (VALUES\n"
        sql += ',\n'.join(suburb_values)
        sql += "\n) AS v(province_id, name, created_by, updated_by)\n"
        sql += "WHERE NOT EXISTS (\n"
        sql += "    SELECT 1 FROM Suburb s\n"
        sql += "    WHERE s.province_id = v.province_id AND s.Name = v.name\n"
        sql += ");\n\n"
    
    return sql

def main():
    """Main function to generate SQL script"""
    print("=" * 60)
    print("Generating Country, Province, and Suburb SQL Insert Script")
    print("=" * 60)
    
    # Fetch countries
    print("\n[1/3] Fetching countries from REST Countries API...")
    countries_data = fetch_json(COUNTRIES_API)
    
    if not countries_data:
        print("ERROR: Failed to fetch countries data")
        return
    
    print(f"[OK] Fetched {len(countries_data)} countries")
    
    # Generate country inserts
    country_sql = generate_country_inserts(countries_data)
    
    # Generate province inserts
    print("\n[2/3] Generating province/state inserts from curated data...")
    province_sql = generate_province_inserts()
    
    # Generate suburb inserts
    print("\n[3/3] Generating suburb/city inserts from curated data...")
    suburb_sql = generate_suburb_inserts()
    
    # Combine all SQL
    final_sql = country_sql + province_sql + suburb_sql
    final_sql += """-- ============================================================
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
"""
    
    # Write to file
    output_file = "country_province_suburb_inserts.sql"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(final_sql)
    
    print("\n" + "=" * 60)
    print(f"[SUCCESS] SQL script generated successfully: {output_file}")
    print("=" * 60)
    print("\nSummary:")
    print(f"  - Countries: {len(countries_data)}")
    print(f"  - Provinces: {sum(len(v) for v in PROVINCES_DATA.values())}")
    print(f"  - Suburbs: {sum(len(v) for v in CITIES_DATA.values())}")
    print(f"  - File ready to append to schema.sql")
    print(f"  - Safe migration: Uses ON CONFLICT DO NOTHING")
    print(f"  - WHO columns: All records include audit fields")
    print("\n")

if __name__ == "__main__":
    main()

