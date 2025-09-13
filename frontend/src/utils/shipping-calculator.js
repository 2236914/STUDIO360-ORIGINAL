// Philippine Region Mapping for Shipping Calculation
// Based on standard shipping regions used by courier companies

// Metro Manila
const METRO_MANILA_PROVINCES = [
  'METRO MANILA'
];

// Luzon (Outside Metro Manila) 
const LUZON_PROVINCES = [
  'BATANGAS', 'CAVITE', 'LAGUNA', 'RIZAL', 'QUEZON', // CALABARZON
  'BULACAN', 'NUEVA ECIJA', 'PAMPANGA', 'TARLAC', 'ZAMBALES', 'AURORA', 'BATAAN', // Central Luzon
  'ILOCOS NORTE', 'ILOCOS SUR', 'LA UNION', 'PANGASINAN', // Ilocos Region
  'ABRA', 'APAYAO', 'BENGUET', 'IFUGAO', 'KALINGA', 'MOUNTAIN PROVINCE', // Cordillera
  'CAGAYAN', 'ISABELA', 'NUEVA VIZCAYA', 'QUIRINO', // Cagayan Valley
  'ALBAY', 'CAMARINES NORTE', 'CAMARINES SUR', 'CATANDUANES', 'MASBATE', 'SORSOGON' // Bicol
];

// Visayas
const VISAYAS_PROVINCES = [
  'ILOILO', 'ANTIQUE', 'AKLAN', 'CAPIZ', 'NEGROS OCCIDENTAL', 'GUIMARAS', // Western Visayas
  'CEBU', 'BOHOL', 'NEGROS ORIENTAL', 'SIQUIJOR', // Central Visayas
  'LEYTE', 'SOUTHERN LEYTE', 'SAMAR', 'EASTERN SAMAR', 'NORTHERN SAMAR', 'BILIRAN' // Eastern Visayas
];

// Mindanao
const MINDANAO_PROVINCES = [
  'DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO OCCIDENTAL', 'DAVAO ORIENTAL', 'DAVAO DE ORO', // Davao Region
  'BUKIDNON', 'CAMIGUIN', 'LANAO DEL NORTE', 'MISAMIS OCCIDENTAL', 'MISAMIS ORIENTAL', // Northern Mindanao
  'DINAGAT ISLANDS', 'SURIGAO DEL NORTE', 'SURIGAO DEL SUR', 'AGUSAN DEL NORTE', 'AGUSAN DEL SUR', // Caraga
  'SOUTH COTABATO', 'SARANGANI', 'SULTAN KUDARAT', 'COTABATO', // SOCCSKSARGEN
  'LANAO DEL SUR', 'MAGUINDANAO', 'SULU', 'TAWI-TAWI', 'BASILAN', // ARMM/BARMM
  'ZAMBOANGA DEL NORTE', 'ZAMBOANGA DEL SUR', 'ZAMBOANGA SIBUGAY' // Zamboanga Peninsula
];

// Island Provinces (Remote areas with special shipping)
const ISLAND_PROVINCES = [
  'PALAWAN', 'BATANES', 'MARINDUQUE', 'OCCIDENTAL MINDORO', 'ORIENTAL MINDORO', 'ROMBLON'
];

/**
 * Determines the shipping region based on province
 * @param {string} province - The province name
 * @returns {string} - The shipping region (metro-manila, luzon, visayas, mindanao, islands)
 */
export function getShippingRegion(province) {
  if (!province) return null;
  
  const upperProvince = province.toUpperCase();
  
  if (METRO_MANILA_PROVINCES.includes(upperProvince)) {
    return 'metro-manila';
  }
  
  if (LUZON_PROVINCES.includes(upperProvince)) {
    return 'luzon';
  }
  
  if (VISAYAS_PROVINCES.includes(upperProvince)) {
    return 'visayas';
  }
  
  if (MINDANAO_PROVINCES.includes(upperProvince)) {
    return 'mindanao';
  }
  
  if (ISLAND_PROVINCES.includes(upperProvince)) {
    return 'islands';
  }
  
  // Default to Luzon if province not found (most common)
  return 'luzon';
}

/**
 * Mock seller shipping configuration (this would come from API/database in real app)
 */
export const MOCK_SELLER_SHIPPING_CONFIG = {
  freeShippingEnabled: true,
  freeShippingMinAmount: 2000,
  couriers: [
    { 
      id: '1', 
      name: 'JNT Express', 
      active: true, 
      status: 'active',
      regions: {
        'metro-manila': { fee: 120.00, active: true },
        'luzon': { fee: 150.00, active: true },
        'visayas': { fee: 180.00, active: false },
        'mindanao': { fee: 200.00, active: false },
        'islands': { fee: 250.00, active: false }
      }
    },
    { 
      id: '2', 
      name: 'SPX', 
      active: true, 
      status: 'active',
      regions: {
        'metro-manila': { fee: 130.00, active: true },
        'luzon': { fee: 160.00, active: true },
        'visayas': { fee: 190.00, active: true },
        'mindanao': { fee: 210.00, active: true },
        'islands': { fee: 280.00, active: false }
      }
    },
    { 
      id: '3', 
      name: 'LBC', 
      active: false, 
      status: 'inactive',
      regions: {
        'metro-manila': { fee: 140.00, active: false },
        'luzon': { fee: 170.00, active: false },
        'visayas': { fee: 200.00, active: false },
        'mindanao': { fee: 230.00, active: false },
        'islands': { fee: 300.00, active: false }
      }
    },
  ]
};

/**
 * Calculates available shipping options based on customer address and seller configuration
 * @param {string} province - Customer's province
 * @param {string} city - Customer's city (optional, for future city-specific rates)
 * @param {Object} sellerConfig - Seller's shipping configuration (optional, uses mock if not provided)
 * @param {number} orderAmount - Total order amount to check free shipping eligibility (optional)
 * @returns {Array} - Available shipping options with prices
 */
export function calculateShippingOptions(province, city = null, sellerConfig = null, orderAmount = 0) {
  if (!province) {
    return [];
  }
  
  const region = getShippingRegion(province);
  const config = sellerConfig || MOCK_SELLER_SHIPPING_CONFIG;
  
  const availableOptions = [];
  
  // Process each active courier
  config.couriers
    .filter(courier => courier.active)
    .forEach(courier => {
      // Check if this courier serves the customer's region
      const regionData = courier.regions[region];
      
      if (regionData && regionData.active && regionData.fee > 0) {
        // Generate delivery time estimate based on region
        const deliveryTimes = {
          'metro-manila': '1-2 days delivery',
          'luzon': '2-3 days delivery', 
          'visayas': '3-5 days delivery',
          'mindanao': '4-6 days delivery',
          'islands': '5-7 days delivery'
        };

        availableOptions.push({
          id: `${courier.id}-${region}`,
          courierName: courier.name,
          region: region,
          fee: regionData.fee,
          description: deliveryTimes[region] || '3-5 days delivery',
          deliveryTime: deliveryTimes[region] || '3-5 days delivery',
          label: `${courier.name} - ₱${regionData.fee}`,
          value: regionData.fee
        });
      }
    });
  
  // Sort by price (cheapest first)
  availableOptions.sort((a, b) => a.fee - b.fee);
  
  // Add free shipping option if enabled and order meets minimum requirement
  const freeShippingEnabled = config.freeShippingEnabled || false;
  const freeShippingMinAmount = config.freeShippingMinAmount || 2000;
  const orderQualifiesForFreeShipping = orderAmount >= freeShippingMinAmount;
  
  if (freeShippingEnabled) {
    const freeShippingDescription = orderQualifiesForFreeShipping 
      ? '5-7 days delivery (Location independent)' 
      : `5-7 days delivery (Free for orders ₱${freeShippingMinAmount}+)`;
    
    const freeShippingOption = {
      id: 'free',
      courierName: 'Free Shipping',
      region: region,
      fee: 0,
      description: freeShippingDescription,
      deliveryTime: '5-7 days delivery',
      label: 'Free Shipping',
      value: 0,
      available: orderQualifiesForFreeShipping,
      minAmount: freeShippingMinAmount,
      isGlobalFreeShipping: true // Flag to identify this as the special free shipping option
    };
    
    // Only add to available options if customer qualifies
    if (orderQualifiesForFreeShipping) {
      availableOptions.unshift(freeShippingOption);
    } else {
      // Still show it but mark as unavailable (will be handled in UI)
      availableOptions.unshift({
        ...freeShippingOption,
        disabled: true,
        label: `Free Shipping (₱${freeShippingMinAmount} minimum)`,
        description: `Requires minimum order of ₱${freeShippingMinAmount}`
      });
    }
  }
  
  return availableOptions;
}

/**
 * Gets the region display name for UI
 * @param {string} region - The region code
 * @returns {string} - Display name
 */
export function getRegionDisplayName(region) {
  const regionNames = {
    'metro-manila': 'Metro Manila',
    'luzon': 'Luzon',
    'visayas': 'Visayas', 
    'mindanao': 'Mindanao',
    'islands': 'Island Provinces'
  };
  
  return regionNames[region] || 'Unknown Region';
}

/**
 * Formats shipping option for display
 * @param {Object} option - Shipping option object
 * @returns {Object} - Formatted option for UI components
 */
export function formatShippingOption(option) {
  return {
    value: option.fee,
      label: option.fee === 0 ? 'Free' : `PHP ${option.fee}`,
    description: option.description,
    courierName: option.courierName,
    region: getRegionDisplayName(option.region)
  };
}

/**
 * Categorizes shipping options by courier for better UI organization
 * @param {Array} shippingOptions - Array of shipping options
 * @returns {Object} - Categorized shipping options by courier
 */
export function categorizeShippingOptionsByCourier(shippingOptions) {
  const categorized = {};
  
  shippingOptions.forEach(option => {
    const courierName = option.courierName;
    
    if (!categorized[courierName]) {
      categorized[courierName] = {
        courier: courierName,
        options: [],
        totalOptions: 0,
        cheapestFee: null
      };
    }
    
    categorized[courierName].options.push(option);
    categorized[courierName].totalOptions += 1;
    
    // Track cheapest fee for this courier
    if (categorized[courierName].cheapestFee === null || option.fee < categorized[courierName].cheapestFee) {
      categorized[courierName].cheapestFee = option.fee;
    }
  });
  
  // Convert to array and sort by cheapest fee
  return Object.values(categorized).sort((a, b) => a.cheapestFee - b.cheapestFee);
}

/**
 * Example usage:
 * 
 * const options = calculateShippingOptions('BATANGAS', 'LIPA CITY', null, 1500);
 * console.log(options);
 * // [
 * //   { id: 'free', courierName: 'Standard', fee: 0, description: '5-7 days delivery...', disabled: true },
 * //   { id: '1-luzon', courierName: 'JNT Express', fee: 150, description: '2-3 days delivery' }
 * // ]
 * 
 * const categorized = categorizeShippingOptionsByCourier(options);
 * console.log(categorized);
 * // [
 * //   { courier: 'Standard', options: [freeOption], totalOptions: 1, cheapestFee: 0 },
 * //   { courier: 'JNT Express', options: [jntOption], totalOptions: 1, cheapestFee: 150 }
 * // ]
 */
