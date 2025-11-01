const express = require('express');
const router = express.Router();

const { supabase } = require('../../services/supabaseClient');
const storePagesService = require('../../services/storePagesService');
const shopService = require('../../services/shopService');
const inventoryService = require('../../services/inventoryService');

async function getUserIdByShopName(shopName) {
  try {
    // Match case-insensitively to make storefront slugs forgiving
    // Try exact match first, then case-insensitive match
    let { data, error } = await supabase
      .from('shop_info')
      .select('user_id, shop_name')
      .eq('shop_name', shopName)
      .is('deleted_at', null)
      .single();

    // If no exact match, try case-insensitive match
    if (error || !data) {
      const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
        .from('shop_info')
        .select('user_id, shop_name')
        .ilike('shop_name', shopName)
        .is('deleted_at', null)
        .maybeSingle();

      if (!caseInsensitiveError && caseInsensitiveData) {
        return caseInsensitiveData.user_id;
      }
      
      // Log for debugging in production
      console.warn(`[Public Storefront] Shop not found: "${shopName}"`, { 
        exactError: error?.message, 
        ilikeError: caseInsensitiveError?.message 
      });
      return null;
    }
    
    return data.user_id;
  } catch (e) {
    console.error(`[Public Storefront] Error looking up shop "${shopName}":`, e);
    return null;
  }
}

async function ensureShop(req, res, next) {
  const { shopName } = req.params;
  
  if (!shopName || shopName.trim() === '') {
    return res.status(404).json({ success: false, message: 'Store name is required' });
  }
  
  const userId = await getUserIdByShopName(shopName.trim());
  if (!userId) {
    console.warn(`[Public Storefront] Store not found: "${shopName}"`);
    return res.status(404).json({ success: false, message: `Store "${shopName}" not found` });
  }
  
  req.publicUserId = userId;
  req.shopName = shopName.trim();
  return next();
}

// Debug route to test if router is working (remove in production if desired)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Public storefront routes are working' });
});

// GET /api/public/storefront/:shopName/info
router.get('/:shopName/info', ensureShop, async (req, res) => {
  try {
    console.log(`[Public Storefront] GET /info for shop: ${req.shopName}, userId: ${req.publicUserId}`);
    const info = await shopService.getShopInfo(req.publicUserId);
    // Try to include SEO settings if available
    let seo = null;
    try {
      seo = await storePagesService.getSeoSettings(req.publicUserId);
    } catch (_) { /* noop */ }
    const merged = {
      ...(info || {}),
      seo_title: info?.seo_title || seo?.title || null,
      seo_description: info?.seo_description || seo?.description || null,
      seo_image_url: info?.seo_image_url || seo?.social_image_url || null,
    };
    return res.json({ success: true, data: merged });
  } catch (error) {
    console.error(`[Public Storefront] Info error for shop "${req.shopName}":`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/public/storefront/:shopName/homepage
router.get('/:shopName/homepage', ensureShop, async (req, res) => {
  try {
    console.log(`[Public Storefront] GET /homepage for shop: ${req.shopName}, userId: ${req.publicUserId}`);
    const data = await storePagesService.getCompleteHomepageData(req.publicUserId);
    return res.json({ success: true, data });
  } catch (error) {
    console.error(`[Public Storefront] Homepage error for shop "${req.shopName}":`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/public/storefront/:shopName/partners
router.get('/:shopName/partners', ensureShop, async (req, res) => {
  try {
    const platforms = await storePagesService.getPlatforms(req.publicUserId);
    return res.json({ success: true, data: platforms });
  } catch (error) {
    console.error('Public storefront: partners error', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/public/storefront/:shopName/products
router.get('/:shopName/products', ensureShop, async (req, res) => {
  try {
    console.log(`[Public Storefront] GET /products for shop: ${req.shopName}, userId: ${req.publicUserId}`);
    // Only expose active products publicly
    const products = await inventoryService.getProducts(req.publicUserId, { status: ['active'] });
    return res.json({ success: true, data: products });
  } catch (error) {
    console.error(`[Public Storefront] Products error for shop "${req.shopName}":`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/public/storefront/:shopName/products/:slug
router.get('/:shopName/products/:slug', ensureShop, async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await inventoryService.getProductBySlug(req.publicUserId, slug);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: product });
  } catch (error) {
    console.error('Public storefront: product by slug error', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/public/storefront/:shopName/categories
router.get('/:shopName/categories', ensureShop, async (req, res) => {
  try {
    console.log(`[Public Storefront] GET /categories for shop: ${req.shopName}, userId: ${req.publicUserId}`);
    const categories = await inventoryService.getCategories(req.publicUserId);
    return res.json({ success: true, data: categories });
  } catch (error) {
    console.error(`[Public Storefront] Categories error for shop "${req.shopName}":`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/public/storefront/:shopName/coupon
router.get('/:shopName/coupon', ensureShop, async (req, res) => {
  try {
    console.log(`[Public Storefront] GET /coupon for shop: ${req.shopName}, userId: ${req.publicUserId}`);
    const coupon = await storePagesService.getCoupon(req.publicUserId);
    return res.json({ success: true, data: coupon });
  } catch (error) {
    console.error(`[Public Storefront] Coupon error for shop "${req.shopName}":`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/public/storefront/:shopName/split-feature
router.get('/:shopName/split-feature', ensureShop, async (req, res) => {
  try {
    console.log(`[Public Storefront] GET /split-feature for shop: ${req.shopName}, userId: ${req.publicUserId}`);
    const data = await storePagesService.getSplitFeature(req.publicUserId);
    return res.json({ success: true, data });
  } catch (error) {
    console.error(`[Public Storefront] Split-feature error for shop "${req.shopName}":`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/public/storefront/:shopName/welcome-popup
router.get('/:shopName/welcome-popup', ensureShop, async (req, res) => {
  try {
    console.log(`[Public Storefront] GET /welcome-popup for shop: ${req.shopName}, userId: ${req.publicUserId}`);
    const data = await storePagesService.getWelcomePopup(req.publicUserId);
    return res.json({ success: true, data });
  } catch (error) {
    console.error(`[Public Storefront] Welcome-popup error for shop "${req.shopName}":`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/public/storefront/:shopName/events
router.get('/:shopName/events', ensureShop, async (req, res) => {
  try {
    console.log(`[Public Storefront] GET /events for shop: ${req.shopName}, userId: ${req.publicUserId}`);
    const data = await storePagesService.getActiveEvents(req.publicUserId);
    return res.json({ success: true, data });
  } catch (error) {
    console.error(`[Public Storefront] Events error for shop "${req.shopName}":`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// About, Shipping, FAQs aggregations for public pages
router.get('/:shopName/about', ensureShop, async (req, res) => {
  try {
    const data = await storePagesService.getCompleteAboutData(req.publicUserId);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Public storefront: about error', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:shopName/shipping', ensureShop, async (req, res) => {
  try {
    const data = await storePagesService.getCompleteShippingData(req.publicUserId);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Public storefront: shipping error', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:shopName/faqs', ensureShop, async (req, res) => {
  try {
    const data = await storePagesService.getFAQs(req.publicUserId);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Public storefront: faqs error', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;


