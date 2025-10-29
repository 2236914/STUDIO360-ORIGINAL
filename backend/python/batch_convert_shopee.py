#!/usr/bin/env python3
"""
Batch conversion script for multiple years of Shopee data
Usage: python batch_convert_shopee.py
"""

import json
import os
import sys
from datetime import datetime

def batch_convert_years():
    """
    Convert Shopee data for multiple years (2024, 2025)
    """
    years = [2024, 2025]
    input_file = 'shopee_data.json'  # Your main data file
    
    print("🚀 Starting batch conversion for multiple years...")
    print(f"📁 Input file: {input_file}")
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ Error: {input_file} not found!")
        print("Please place your Shopee data in shopee_data.json")
        return
    
    # Load the main data file
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            all_data = json.load(f)
        print(f"📊 Loaded {len(all_data)} total records")
    except Exception as e:
        print(f"❌ Error loading {input_file}: {e}")
        return
    
    # Process each year
    for year in years:
        print(f"\n🔄 Processing year {year}...")
        
        # Import the conversion function
        try:
            from convert_shopee_data import convert_shopee_data_to_forecast_json, save_forecast_data
        except ImportError:
            print("❌ Error: convert_shopee_data.py not found!")
            return
        
        # Convert data for this year
        year_data = convert_shopee_data_to_forecast_json(all_data, target_year=year)
        
        if year_data:
            # Save year-specific file
            output_file = f'shopee_forecast_data_{year}.json'
            save_forecast_data(year_data, output_file)
            
            # Print year summary
            total_sales = sum(p['metrics']['sales_amount'] for p in year_data)
            total_units = sum(p['metrics']['confirmed_units'] for p in year_data)
            
            print(f"✅ {year}: {len(year_data)} products, ₱{total_sales:,.2f} sales, {total_units:,} units")
        else:
            print(f"⚠️ {year}: No data found")
    
    print(f"\n🎉 Batch conversion complete!")
    print(f"📁 Generated files:")
    for year in years:
        filename = f'shopee_forecast_data_{year}.json'
        if os.path.exists(filename):
            print(f"   - {filename}")
    
    print(f"\n📋 Next steps:")
    print(f"1. Import each year's data into Supabase")
    print(f"2. Test the year toggle in the dashboard")
    print(f"3. Compare forecasts across years")

if __name__ == "__main__":
    batch_convert_years()
