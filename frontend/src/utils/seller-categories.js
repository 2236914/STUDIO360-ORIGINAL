// Seller Categories & Themes Utility
// This utility manages dynamic categories and themes that sellers can create

// Default category suggestions (can be extended by sellers)
export const DEFAULT_CATEGORY_OPTIONS = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Accessories',
];

// Default theme suggestions (can be extended by sellers)
export const DEFAULT_THEME_OPTIONS = [
  'Ballet',
  'Ocean',
  'Winter',
  'Work',
  'Classic',
  'Formal',
  'Outdoor',
  'Elegant',
  'Casual',
  'Vintage',
];

// Helper functions for category management
export const getCategoriesKey = (sellerId = 'default') => `seller_categories_${sellerId}`;
export const getThemesKey = (sellerId = 'default') => `seller_themes_${sellerId}`;

export const getSellerCategories = (sellerId = 'default') => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(getCategoriesKey(sellerId));
    return stored ? JSON.parse(stored) : [...DEFAULT_CATEGORY_OPTIONS];
  }
  return [...DEFAULT_CATEGORY_OPTIONS];
};

export const getSellerThemes = (sellerId = 'default') => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(getThemesKey(sellerId));
    return stored ? JSON.parse(stored) : [...DEFAULT_THEME_OPTIONS];
  }
  return [...DEFAULT_THEME_OPTIONS];
};

export const saveSellerCategories = (categories, sellerId = 'default') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(getCategoriesKey(sellerId), JSON.stringify(categories));
  }
};

export const saveSellerThemes = (themes, sellerId = 'default') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(getThemesKey(sellerId), JSON.stringify(themes));
  }
};

export const addNewCategory = (newCategory, sellerId = 'default') => {
  const currentCategories = getSellerCategories(sellerId);
  if (!currentCategories.includes(newCategory)) {
    const updatedCategories = [...currentCategories, newCategory];
    saveSellerCategories(updatedCategories, sellerId);
    return updatedCategories;
  }
  return currentCategories;
};

export const addNewTheme = (newTheme, sellerId = 'default') => {
  const currentThemes = getSellerThemes(sellerId);
  if (!currentThemes.includes(newTheme)) {
    const updatedThemes = [...currentThemes, newTheme];
    saveSellerThemes(updatedThemes, sellerId);
    return updatedThemes;
  }
  return currentThemes;
};

// Get unique categories from products data (for backward compatibility)
export const getCategoriesFromProducts = (products = []) => {
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
  return ['all', ...categories];
};

// Get unique themes from products data (for backward compatibility)
export const getThemesFromProducts = (products = []) => {
  const themes = [...new Set(products.map(product => product.theme).filter(Boolean))];
  return ['all', ...themes];
};

// Merge seller categories with product categories for filtering
export const getFilteringCategories = (sellerId = 'default', products = []) => {
  const sellerCategories = getSellerCategories(sellerId);
  const productCategories = getCategoriesFromProducts(products);
  
  // Remove 'all' from productCategories and merge
  const cleanProductCategories = productCategories.filter(cat => cat !== 'all');
  const mergedCategories = [...new Set([...sellerCategories, ...cleanProductCategories])];
  
  return ['all', ...mergedCategories.sort()];
};

// Merge seller themes with product themes for filtering
export const getFilteringThemes = (sellerId = 'default', products = []) => {
  const sellerThemes = getSellerThemes(sellerId);
  const productThemes = getThemesFromProducts(products);
  
  // Remove 'all' from productThemes and merge
  const cleanProductThemes = productThemes.filter(theme => theme !== 'all');
  const mergedThemes = [...new Set([...sellerThemes, ...cleanProductThemes])];
  
  return ['all', ...mergedThemes.sort()];
};
