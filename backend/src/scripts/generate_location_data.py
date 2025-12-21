#!/usr/bin/env python3
"""
Generate SQL INSERT statements for Country, Province, and Suburb tables
by fetching data from public APIs.
"""

import json
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime

# API endpoints
COUNTRIES_API = "https://restcountries.com/v3.1/all?fields=name,cca2,cca3"
STATES_API_BASE = "https://countriesnow.space/api/v0.1/countries/states"
CITIES_API_BASE = "https://countriesnow.space/api/v0.1/countries/state/cities"

def fetch_json(url):
    """Fetch JSON data from URL"""
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def escape_sql_string(s):
    """Escape single quotes for SQL"""
    if s is None:
        return ""
    return str(s).replace("'", "''")

def generate_country_inserts(countries):
    """Generate SQL INSERT statements for countries"""
    sql = """-- ============================================================
-- COUNTRY DATA INSERT SCRIPT
-- ============================================================
-- Generated: {timestamp}
-- Source: REST Countries API (https://restcountries.com)
-- Total Countries: {count}
-- ============================================================

INSERT INTO Country (Name, Code, Created_By, Updated_By)
VALUES
""".format(
        timestamp=datetime.now().isoformat(),
        count=len(countries)
    )
    
    values = []
    for country in countries:
        name = escape_sql_string(country.get('name', {}).get('common', ''))
        code = escape_sql_string(country.get('cca2', ''))
        if name and code:
            values.append(f"    ('{name}', '{code}', 'system', 'system')")
    
    sql += ',\n'.join(values)
    sql += "\nON CONFLICT (Name) DO NOTHING;\n\n"
    return sql, countries

def generate_province_inserts(countries_data):
    """Generate SQL INSERT statements for provinces/states"""
    sql = """-- ============================================================
-- PROVINCE/STATE DATA INSERT SCRIPT
-- ============================================================
-- Generated: {timestamp}
-- Source: CountriesNow API (https://countriesnow.space)
-- ============================================================

""".format(timestamp=datetime.now().isoformat())
    
    province_values = []
    country_code_map = {}
    
    # Create country code to name mapping
    for country in countries_data:
        code = country.get('cca2', '')
        name = country.get('name', {}).get('common', '')
        if code and name:
            country_code_map[code.upper()] = name
    
    # Fetch provinces for major countries
    major_countries = ['ZA', 'US', 'CA', 'GB', 'AU', 'IN', 'BR', 'MX', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI']
    
    print("Fetching province/state data...")
    total_provinces = 0
    
    for country_code in major_countries:
        country_name = country_code_map.get(country_code)
        if not country_name:
            continue
        
        print(f"  Fetching states for {country_name} ({country_code})...")
        
        # Fetch states for this country (URL encode the country name)
        encoded_country = urllib.parse.quote(country_name)
        states_data = fetch_json(f"{STATES_API_BASE}?country={encoded_country}")
        
        if states_data:
            # Handle different response formats
            if isinstance(states_data, dict) and states_data.get('data'):
                if isinstance(states_data['data'], dict) and states_data['data'].get('states'):
                    states = states_data['data']['states']
                elif isinstance(states_data['data'], list):
                    states = states_data['data']
                else:
                    states = []
            elif isinstance(states_data, list):
                states = states_data
            else:
                states = []
            
            if states:
                for state in states:
                    # Handle both dict and string formats
                    if isinstance(state, dict):
                        state_name = escape_sql_string(state.get('name', ''))
                        state_code = escape_sql_string(state.get('state_code', ''))
                    else:
                        state_name = escape_sql_string(state)
                        state_code = ""
                    
                    if state_name:
                        # Use state_code if available, otherwise use NULL
                        code_value = f"'{state_code}'" if state_code else "NULL"
                        province_values.append(
                            f"    ((SELECT ID FROM Country WHERE Code = '{country_code}' LIMIT 1), '{state_name}', {code_value}, 'system', 'system')"
                        )
                        total_provinces += 1
    
    if province_values:
        sql += f"-- Total Provinces: {total_provinces}\n\n"
        sql += "INSERT INTO Province (country_id, Name, Code, Created_By, Updated_By)\n"
        sql += "SELECT * FROM (VALUES\n"
        sql += ',\n'.join(province_values)
        sql += "\n) AS v(country_id, name, code, created_by, updated_by)\n"
        sql += "WHERE NOT EXISTS (\n"
        sql += "    SELECT 1 FROM Province p\n"
        sql += "    WHERE p.country_id = v.country_id AND p.Name = v.name\n"
        sql += ");\n\n"
    else:
        sql += "-- No province data available\n\n"
    
    return sql

def generate_suburb_inserts():
    """Generate SQL INSERT statements for suburbs/cities"""
    sql = """-- ============================================================
-- SUBURB/CITY DATA INSERT SCRIPT
-- ============================================================
-- Generated: {timestamp}
-- Source: CountriesNow API (https://countriesnow.space)
-- ============================================================

""".format(timestamp=datetime.now().isoformat())
    
    # For suburbs, we'll fetch cities for major provinces
    # This is a more limited dataset due to API limitations
    major_province_combinations = [
        ('ZA', 'Gauteng', 'GP'),
        ('ZA', 'Western Cape', 'WC'),
        ('ZA', 'KwaZulu-Natal', 'KZN'),
        ('US', 'California', 'CA'),
        ('US', 'New York', 'NY'),
        ('US', 'Texas', 'TX'),
        ('CA', 'Ontario', 'ON'),
        ('CA', 'British Columbia', 'BC'),
        ('GB', 'England', 'ENG'),
        ('AU', 'New South Wales', 'NSW'),
        ('AU', 'Victoria', 'VIC'),
    ]
    
    suburb_values = []
    total_suburbs = 0
    
    print("Fetching city/suburb data...")
    
    for country_code, province_name, province_code in major_province_combinations:
        print(f"  Fetching cities for {province_name}, {country_code}...")
        
        # Fetch cities for this province (URL encode)
        encoded_country = urllib.parse.quote(country_code)
        encoded_province = urllib.parse.quote(province_name)
        cities_data = fetch_json(f"{CITIES_API_BASE}?country={encoded_country}&state={encoded_province}")
        
        if cities_data and cities_data.get('data'):
            cities = cities_data['data']
            # Limit to first 20 cities per province to keep file size manageable
            for city in cities[:20]:
                city_name = escape_sql_string(city)
                if city_name:
                    suburb_values.append(
                        f"    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = '{country_code}' LIMIT 1) AND (Code = '{province_code}' OR Name = '{escape_sql_string(province_name)}') LIMIT 1), '{city_name}', 'system', 'system')"
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
    else:
        sql += "-- No suburb data available\n\n"
    
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
    country_sql, countries = generate_country_inserts(countries_data)
    
    # Generate province inserts
    print("\n[2/3] Generating province/state inserts...")
    province_sql = generate_province_inserts(countries_data)
    
    # Generate suburb inserts
    print("\n[3/3] Generating suburb/city inserts...")
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
    print(f"  - File ready to append to schema.sql")
    print(f"  - Safe migration: Uses ON CONFLICT DO NOTHING")
    print(f"  - WHO columns: All records include audit fields")
    print("\n")

if __name__ == "__main__":
    main()

