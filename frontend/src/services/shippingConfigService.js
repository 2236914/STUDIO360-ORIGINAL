/**
 * Service to manage seller shipping configuration
 * This would typically connect to your backend API
 */

// For now, we'll use localStorage to simulate the seller's configuration
// In a real app, this would be API calls to your backend
const SELLER_SHIPPING_CONFIG_KEY = 'seller-shipping-config';

/**
 * Get seller's shipping configuration
 * @param {string} storeId - The store ID
 * @returns {Object} Seller's shipping configuration
 */
export function getSellerShippingConfig(storeId = 'kitschstudio') {
  try {
    // Try to get from localStorage first (from dashboard settings)
    const savedConfig = localStorage.getItem(`${SELLER_SHIPPING_CONFIG_KEY}-${storeId}`);
    
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    
    // Fallback to default configuration if none exists
    return getDefaultShippingConfig();
  } catch (error) {
    console.error('Error loading seller shipping config:', error);
    return getDefaultShippingConfig();
  }
}

/**
 * Save seller's shipping configuration
 * @param {string} storeId - The store ID
 * @param {Object} config - The shipping configuration to save
 */
export function saveSellerShippingConfig(storeId, config) {
  try {
    localStorage.setItem(`${SELLER_SHIPPING_CONFIG_KEY}-${storeId}`, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error saving seller shipping config:', error);
    return false;
  }
}

/**
 * Get default shipping configuration
 * @returns {Object} Default shipping configuration
 */
function getDefaultShippingConfig() {
  return {
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
}

/**
 * Update seller's courier configuration
 * @param {string} storeId - The store ID
 * @param {Array} couriers - Updated couriers array
 */
export function updateSellerCouriers(storeId, couriers) {
  const config = getSellerShippingConfig(storeId);
  config.couriers = couriers;
  return saveSellerShippingConfig(storeId, config);
}

/**
 * Update seller's free shipping settings
 * @param {string} storeId - The store ID
 * @param {boolean} enabled - Whether free shipping is enabled
 * @param {number} minAmount - Minimum amount for free shipping
 */
export function updateSellerFreeShipping(storeId, enabled, minAmount) {
  const config = getSellerShippingConfig(storeId);
  config.freeShippingEnabled = enabled;
  config.freeShippingMinAmount = minAmount;
  return saveSellerShippingConfig(storeId, config);
}

/**
 * Get shipping configuration for a specific store
 * This would be the main function called from checkout
 * @param {string} storeId - The store ID
 * @returns {Object} Shipping configuration for the store
 */
export function getShippingConfigForStore(storeId) {
  return getSellerShippingConfig(storeId);
}
