#!/usr/bin/env python3
"""
Generate SQL INSERT statements for Country, Province, and Suburb tables
by fetching ALL data from public APIs (not just major countries).
"""

import json
import urllib.request
import urllib.parse
import time
from datetime import datetime

# API endpoints
COUNTRIES_API = "https://restcountries.com/v3.1/all?fields=name,cca2,cca3"
STATES_API_BASE = "https://countriesnow.space/api/v0.1/countries/states"
CITIES_API_BASE = "https://countriesnow.space/api/v0.1/countries/state/cities"

def fetch_json(url, retries=3, delay=1):
    """Fetch JSON data from URL with retry logic"""
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None  # Not found, skip
            if attempt < retries - 1:
                time.sleep(delay * (attempt + 1))
                continue
            print(f"    HTTP Error {e.code} for {url}")
            return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(delay * (attempt + 1))
                continue
            print(f"    Error: {e}")
            return None
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

def generate_province_inserts(countries_data):
    """Generate SQL INSERT statements for provinces/states - ALL countries"""
    sql = f"""-- ============================================================
-- PROVINCE/STATE DATA INSERT SCRIPT
-- ============================================================
-- Generated: {datetime.now().isoformat()}
-- Source: CountriesNow API (https://countriesnow.space)
-- Fetching provinces/states for ALL countries
-- ============================================================

"""
    
    province_values = []
    total_provinces = 0
    countries_with_provinces = 0
    failed_countries = []
    
    print(f"Fetching provinces/states for {len(countries_data)} countries...")
    
    for idx, country in enumerate(countries_data, 1):
        country_name = country.get('name', {}).get('common', '')
        country_code = country.get('cca2', '')
        
        if not country_name or not country_code:
            continue
        
        # Progress indicator
        if idx % 10 == 0:
            print(f"  Progress: {idx}/{len(countries_data)} countries processed...")
        
        # Fetch states for this country
        encoded_country = urllib.parse.quote(country_name)
        states_data = fetch_json(f"{STATES_API_BASE}?country={encoded_country}")
        
        if states_data:
            # Handle different response formats
            states = []
            if isinstance(states_data, dict):
                if states_data.get('data'):
                    if isinstance(states_data['data'], dict) and states_data['data'].get('states'):
                        states = states_data['data']['states']
                    elif isinstance(states_data['data'], list):
                        states = states_data['data']
                elif states_data.get('states'):
                    states = states_data['states']
            elif isinstance(states_data, list):
                states = states_data
            
            if states:
                countries_with_provinces += 1
                for state in states:
                    # Handle both dict and string formats
                    if isinstance(state, dict):
                        state_name = escape_sql_string(state.get('name', ''))
                        state_code = escape_sql_string(state.get('state_code', state.get('code', '')))
                    else:
                        state_name = escape_sql_string(state)
                        state_code = ""
                    
                    if state_name:
                        code_value = f"'{state_code}'" if state_code else "NULL"
                        province_values.append(
                            f"    ((SELECT ID FROM Country WHERE Code = '{country_code}' LIMIT 1), '{state_name}', {code_value}, 'system', 'system')"
                        )
                        total_provinces += 1
                
                # Small delay to avoid rate limiting (reduced for faster processing)
                time.sleep(0.05)
            else:
                failed_countries.append(country_name)
        else:
            failed_countries.append(country_name)
    
    print(f"\n[OK] Fetched provinces for {countries_with_provinces} countries")
    print(f"     Total provinces: {total_provinces}")
    if failed_countries:
        print(f"     Countries without province data: {len(failed_countries)}")
    
    if province_values:
        sql += f"-- Total Provinces: {total_provinces}\n"
        sql += f"-- Countries with provinces: {countries_with_provinces}\n\n"
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
    
    return sql, countries_data

def generate_suburb_inserts(countries_data):
    """Generate SQL INSERT statements for suburbs/cities - ALL provinces"""
    sql = f"""-- ============================================================
-- SUBURB/CITY DATA INSERT SCRIPT
-- ============================================================
-- Generated: {datetime.now().isoformat()}
-- Source: CountriesNow API (https://countriesnow.space)
-- Fetching cities/suburbs for ALL provinces
-- ============================================================

"""
    
    suburb_values = []
    total_suburbs = 0
    provinces_processed = 0
    provinces_with_cities = 0
    
    print(f"\nFetching cities/suburbs for all provinces...")
    print("This may take a while as we fetch cities for each province...")
    
    # First, get all provinces for each country
    country_provinces_map = {}
    
    for country in countries_data:
        country_name = country.get('name', {}).get('common', '')
        country_code = country.get('cca2', '')
        
        if not country_name or not country_code:
            continue
        
        # Fetch states for this country
        encoded_country = urllib.parse.quote(country_name)
        states_data = fetch_json(f"{STATES_API_BASE}?country={encoded_country}")
        
        if states_data:
            states = []
            if isinstance(states_data, dict):
                if states_data.get('data'):
                    if isinstance(states_data['data'], dict) and states_data['data'].get('states'):
                        states = states_data['data']['states']
                    elif isinstance(states_data['data'], list):
                        states = states_data['data']
            elif isinstance(states_data, list):
                states = states_data
            
            if states:
                country_provinces_map[country_code] = {
                    'name': country_name,
                    'provinces': states
                }
        
        time.sleep(0.1)  # Rate limiting
    
    # Now fetch cities for each province
    total_provinces_to_process = sum(len(v['provinces']) for v in country_provinces_map.values())
    current_province = 0
    
    for country_code, country_info in country_provinces_map.items():
        country_name = country_info['name']
        provinces = country_info['provinces']
        
        for province in provinces:
            current_province += 1
            
            # Progress indicator
            if current_province % 20 == 0:
                print(f"  Progress: {current_province}/{total_provinces_to_process} provinces processed...")
            
            # Get province name
            if isinstance(province, dict):
                province_name = province.get('name', '')
                province_code = province.get('state_code', province.get('code', ''))
            else:
                province_name = str(province)
                province_code = ""
            
            if not province_name:
                continue
            
            # Fetch cities for this province
            encoded_country = urllib.parse.quote(country_name)
            encoded_province = urllib.parse.quote(province_name)
            cities_data = fetch_json(f"{CITIES_API_BASE}?country={encoded_country}&state={encoded_province}")
            
            provinces_processed += 1
            
            if cities_data:
                cities = []
                if isinstance(cities_data, dict):
                    if cities_data.get('data'):
                        if isinstance(cities_data['data'], list):
                            cities = cities_data['data']
                elif isinstance(cities_data, list):
                    cities = cities_data
                
                if cities:
                    provinces_with_cities += 1
                    for city in cities:
                        city_name = escape_sql_string(city)
                        if city_name:
                            # Build province lookup - try code first, then name
                            province_lookup = ""
                            if province_code:
                                province_lookup = f"Code = '{province_code}'"
                            else:
                                province_lookup = f"Name = '{escape_sql_string(province_name)}'"
                            
                            suburb_values.append(
                                f"    ((SELECT ID FROM Province WHERE country_id = (SELECT ID FROM Country WHERE Code = '{country_code}' LIMIT 1) AND ({province_lookup}) LIMIT 1), '{city_name}', 'system', 'system')"
                            )
                            total_suburbs += 1
            
            # Rate limiting (reduced delay for faster processing)
            time.sleep(0.1)
    
    print(f"\n[OK] Processed {provinces_processed} provinces")
    print(f"     Provinces with cities: {provinces_with_cities}")
    print(f"     Total cities/suburbs: {total_suburbs}")
    
    if suburb_values:
        sql += f"-- Total Suburbs/Cities: {total_suburbs}\n"
        sql += f"-- Provinces processed: {provinces_processed}\n"
        sql += f"-- Provinces with cities: {provinces_with_cities}\n\n"
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
    print("=" * 70)
    print("Generating COMPLETE Country, Province, and Suburb SQL Insert Script")
    print("Fetching ALL data from APIs (not just major countries)")
    print("=" * 70)
    
    # Fetch countries
    print("\n[1/3] Fetching ALL countries from REST Countries API...")
    countries_data = fetch_json(COUNTRIES_API)
    
    if not countries_data:
        print("ERROR: Failed to fetch countries data")
        return
    
    print(f"[OK] Fetched {len(countries_data)} countries")
    
    # Generate country inserts
    country_sql = generate_country_inserts(countries_data)
    
    # Generate province inserts (ALL countries)
    print("\n[2/3] Generating province/state inserts for ALL countries...")
    province_sql, countries = generate_province_inserts(countries_data)
    
    # Generate suburb inserts (ALL provinces)
    print("\n[3/3] Generating suburb/city inserts for ALL provinces...")
    suburb_sql = generate_suburb_inserts(countries_data)
    
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
-- - Countries: REST Countries API (https://restcountries.com) - ALL countries
-- - Provinces: CountriesNow API (https://countriesnow.space) - ALL countries with provinces
-- - Suburbs: CountriesNow API (https://countriesnow.space) - ALL provinces with cities
-- 
-- Note: This script fetches ALL available data, not just major countries.
-- Execution time may vary based on API response times and rate limits.
-- ============================================================
"""
    
    # Write to file
    output_file = "country_province_suburb_inserts.sql"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(final_sql)
    
    print("\n" + "=" * 70)
    print(f"[SUCCESS] SQL script generated successfully: {output_file}")
    print("=" * 70)
    print("\nSummary:")
    print(f"  - Countries: {len(countries_data)} (ALL countries)")
    print(f"  - Provinces: Fetched for ALL countries with available data")
    print(f"  - Suburbs: Fetched for ALL provinces with available data")
    print(f"  - File ready to append to schema.sql")
    print(f"  - Safe migration: Uses ON CONFLICT DO NOTHING")
    print(f"  - WHO columns: All records include audit fields")
    print("\nNote: This is a comprehensive dataset with ALL available data.")
    print("      File size may be large depending on API data availability.\n")

if __name__ == "__main__":
    main()

