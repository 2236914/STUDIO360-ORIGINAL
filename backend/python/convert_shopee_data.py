import json
import os
import sys
from datetime import datetime

def convert_shopee_data_to_forecast_json(shopee_data, target_year=None):
    """
    Convert Shopee analytics data to forecasting format
    Focus on: Product Page Views, Units (Add to Cart), Sales (Confirmed Order)
    HANDLES DUPLICATIONS: Aggregates variations of the same Item ID
    SUPPORTS MULTI-YEAR: Can filter by year or process all years
    """
    
    # Dictionary to aggregate data by Item ID
    aggregated_products = {}
    
    for item in shopee_data:
        # Skip deleted products or products with no sales
        if (item.get("Current Item Status") == "Deleted" or 
            item.get("Units (Confirmed Order)") == 0 or
            item.get("Sales (Confirmed Order) (PHP)") == 0):
            continue
            
        # Filter by year if specified
        if target_year:
            # First try the new Year field
            item_year = item.get("Year")
            
            # If no Year field, try to extract from date fields
            if not item_year:
                date_fields = ["Date", "Order Date", "Created Date", "Updated Date"]
                for field in date_fields:
                    if field in item and item[field]:
                        try:
                            # Try to parse date and extract year
                            date_str = str(item[field])
                            if len(date_str) >= 4:
                                item_year = int(date_str[:4])
                                break
                        except (ValueError, TypeError):
                            continue
            
            # Skip if year doesn't match
            if item_year and item_year != target_year:
                continue
            
        item_id = item.get("Item ID", 0)
        product_name = item.get("Product", "Unknown Product")
        parent_sku = item.get("Parent SKU", "")
        sku = item.get("SKU", "")
        variation_name = item.get("Variation Name", "")
        
        # Convert sales amount (remove commas and convert to float)
        sales_amount = item.get("Sales (Confirmed Order) (PHP)", "0")
        if isinstance(sales_amount, str):
            sales_amount = sales_amount.replace(",", "").replace("PHP", "").strip()
        sales_amount = float(sales_amount) if sales_amount else 0
        
        # Get other metrics
        page_views = int(item.get("Product Page Views", 0)) if item.get("Product Page Views") != "-" else 0
        add_to_cart = int(item.get("Units (Add to Cart)", 0)) if item.get("Units (Add to Cart)") != "-" else 0
        confirmed_units = int(item.get("Units (Confirmed Order)", 0)) if item.get("Units (Confirmed Order)") != "-" else 0
        
        # Only process products with actual sales
        if sales_amount > 0 and confirmed_units > 0:
            # Check if this is a main product (no variation) or a variation
            is_main_product = (variation_name == "-" or variation_name == "")
            
            # If this Item ID already exists, we need to decide what to do
            if item_id in aggregated_products:
                existing = aggregated_products[item_id]
                
                # If this is a main product and we already have data, use the main product data
                if is_main_product:
                    # Main product takes precedence - replace existing data
                    existing["metrics"]["page_views"] = page_views
                    existing["metrics"]["add_to_cart_units"] = add_to_cart
                    existing["metrics"]["confirmed_units"] = confirmed_units
                    existing["metrics"]["sales_amount"] = sales_amount
                    existing["product_name"] = product_name
                    existing["product_sku"] = parent_sku if parent_sku != "-" else f"SHOPEE-{item_id}"
                    existing["variation_name"] = ""
                    
                    # Recalculate conversion rate
                    if page_views > 0:
                        existing["conversion_rate"] = (confirmed_units / page_views * 100)
                # If this is a variation, skip it (we already have main product data)
                else:
                    continue
                
            else:
                # Create new product entry
                # Determine the best SKU to use
                product_sku = sku if sku != "-" else parent_sku
                if product_sku == "-" or not product_sku:
                    product_sku = f"SHOPEE-{item_id}"
                
                # Use variation name if available
                display_name = product_name
                if variation_name and variation_name != "-":
                    display_name = f"{product_name} - {variation_name}"
                
                # Extract month and year from the data
                item_month = item.get("Month", 1)  # Default to January if not specified
                item_year = item.get("Year", 2024)  # Default to 2024 if not specified
                item_date = item.get("Date", f"{item_year}-{item_month:02d}-15")  # Default to 15th of month
                
                aggregated_products[item_id] = {
                    "item_id": item_id,
                    "product_name": display_name,
                    "product_sku": product_sku,
                    "variation_name": variation_name if variation_name != "-" else "",
                    "platform": "Shopee",
                    "metrics": {
                        "page_views": page_views,
                        "add_to_cart_units": add_to_cart,
                        "confirmed_units": confirmed_units,
                        "sales_amount": sales_amount
                    },
                    "conversion_rate": (confirmed_units / page_views * 100) if page_views > 0 else 0,
                    "import_date": item_date,
                    "month": item_month,
                    "year": item_year
                }
    
    # Convert dictionary back to list
    products_with_sales = list(aggregated_products.values())
    
    # Sort by sales amount (highest first)
    products_with_sales.sort(key=lambda x: x['metrics']['sales_amount'], reverse=True)
    
    return products_with_sales

def load_shopee_data_from_file(file_path):
    """
    Load Shopee data from JSON file
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: File {file_path} not found")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in {file_path}: {e}")
        return []
    except Exception as e:
        print(f"❌ Error loading file {file_path}: {e}")
        return []

def save_forecast_data(data, output_path):
    """
    Save forecast data to file
    """
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved forecast data to: {output_path}")
    except Exception as e:
        print(f"❌ Error saving file {output_path}: {e}")

def main():
    """
    Main function for deployment
    """
    # Get file paths and year from command line arguments or use defaults
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'shopee_data.json'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'shopee_forecast_data.json'
    target_year = int(sys.argv[3]) if len(sys.argv) > 3 else None
    
    print(f"🔄 Converting Shopee data from: {input_file}")
    print(f"📁 Output file: {output_file}")
    if target_year:
        print(f"📅 Filtering for year: {target_year}")
    
    # Load data
    shopee_data = load_shopee_data_from_file(input_file)
    if not shopee_data:
        print("❌ No data loaded. Exiting.")
        return
    
    print(f"📊 Processing {len(shopee_data)} raw records...")
    
    # Convert data
    forecast_data = convert_shopee_data_to_forecast_json(shopee_data, target_year)
    
    if not forecast_data:
        print("❌ No products with sales data found.")
        return
    
    # Save data
    save_forecast_data(forecast_data, output_file)
    
    # Print summary
    print(f"\n📊 Conversion Summary:")
    print(f"✅ Converted {len(forecast_data)} unique products with sales data")
    print(f"🔄 Aggregated variations to avoid duplications")
    
    total_sales = sum(p['metrics']['sales_amount'] for p in forecast_data)
    total_units = sum(p['metrics']['confirmed_units'] for p in forecast_data)
    
    print(f"💰 Total Sales: ₱{total_sales:,.2f}")
    print(f"📦 Total Units: {total_units:,}")
    
    print(f"\n🏆 Top 5 Products:")
    for i, product in enumerate(forecast_data[:5], 1):
        print(f"{i}. {product['product_name']}")
        print(f"   SKU: {product['product_sku']}")
        print(f"   Sales: ₱{product['metrics']['sales_amount']:,.2f} ({product['metrics']['confirmed_units']} units)")
        print(f"   Page Views: {product['metrics']['page_views']:,}")
        print()
    
    # Print JSON for Supabase (first 3 products only to avoid spam)
    print(f"\n📋 JSON Data for Supabase (first 3 products):")
    print(json.dumps(forecast_data[:3], indent=2, ensure_ascii=False))
    
    if len(forecast_data) > 3:
        print(f"... and {len(forecast_data) - 3} more products")

if __name__ == "__main__":
    main()
