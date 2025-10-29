const express = require('express');
const router = express.Router();
const storePagesService = require('../../services/storePagesService');
const { authenticateTokenHybrid } = require('../../middleware/auth');

// ============================================
// HOMEPAGE ROUTES
// ============================================

/**
 * @route GET /api/store-pages/homepage
 * @desc Get complete homepage data
 * @access Private
 */
router.get('/homepage', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const homepageData = await storePagesService.getCompleteHomepageData(userId);
    
    res.json({
      success: true,
      data: homepageData
    });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/homepage/hero
 * @desc Update hero section
 * @access Private
 */
router.put('/homepage/hero', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const heroData = req.body;
    const updatedHero = await storePagesService.upsertHeroSection(userId, heroData);
    
    if (!updatedHero) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update hero section' 
      });
    }
    
    res.json({
      success: true,
      data: updatedHero,
      message: 'Hero section updated successfully'
    });
  } catch (error) {
    console.error('Error updating hero section:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/homepage/featured-products
 * @desc Update featured products section
 * @access Private
 */
router.put('/homepage/featured-products', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { productIds, ...featuredData } = req.body;
    
    // Update featured products section metadata
    const updatedFeatured = await storePagesService.upsertFeaturedProducts(userId, featuredData);
    
    // Update featured product items if productIds provided
    if (productIds !== undefined) {
      await storePagesService.upsertFeaturedProductItems(userId, productIds);
    }
    
    if (!updatedFeatured) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update featured products section' 
      });
    }
    
    res.json({
      success: true,
      data: updatedFeatured,
      message: 'Featured products section updated successfully'
    });
  } catch (error) {
    console.error('Error updating featured products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/store-pages/homepage/categories
 * @desc Get all categories
 * @access Private
 */
router.get('/homepage/categories', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const categories = await storePagesService.getCategories(userId);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/store-pages/homepage/categories
 * @desc Create a new category
 * @access Private
 */
router.post('/homepage/categories', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category name is required' 
      });
    }

    const categoryData = req.body;
    const newCategory = await storePagesService.createCategory(userId, categoryData);
    
    if (!newCategory) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create category' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/homepage/categories/:id
 * @desc Update category
 * @access Private
 */
router.put('/homepage/categories/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCategory = await storePagesService.updateCategory(id, updateData);
    
    if (!updatedCategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/store-pages/homepage/categories/:id
 * @desc Delete category
 * @access Private
 */
router.delete('/homepage/categories/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;

    const success = await storePagesService.deleteCategory(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/homepage/split-feature
 * @desc Update split feature section
 * @access Private
 */
router.put('/homepage/split-feature', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const featureData = req.body;
    const updatedFeature = await storePagesService.upsertSplitFeature(userId, featureData);
    
    if (!updatedFeature) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update split feature' 
      });
    }
    
    res.json({
      success: true,
      data: updatedFeature,
      message: 'Split feature updated successfully'
    });
  } catch (error) {
    console.error('Error updating split feature:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/homepage/coupon
 * @desc Update coupon section
 * @access Private
 */
router.put('/homepage/coupon', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const couponData = req.body;
    const updatedCoupon = await storePagesService.upsertCoupon(userId, couponData);
    
    if (!updatedCoupon) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update coupon' 
      });
    }
    
    res.json({
      success: true,
      data: updatedCoupon,
      message: 'Coupon updated successfully'
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/homepage/events
 * @desc Update events block
 * @access Private
 */
router.put('/homepage/events', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const eventsData = req.body;
    const updatedEvents = await storePagesService.upsertEventsBlock(userId, eventsData);
    
    if (!updatedEvents) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update events block' 
      });
    }
    
    res.json({
      success: true,
      data: updatedEvents,
      message: 'Events block updated successfully'
    });
  } catch (error) {
    console.error('Error updating events block:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/store-pages/homepage/platforms
 * @desc Get all platforms
 * @access Private
 */
router.get('/homepage/platforms', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const platforms = await storePagesService.getPlatforms(userId);
    
    res.json({
      success: true,
      data: platforms
    });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/store-pages/homepage/platforms
 * @desc Create a new platform
 * @access Private
 */
router.post('/homepage/platforms', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { platform_name, platform_url } = req.body;

    if (!platform_name || !platform_url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Platform name and URL are required' 
      });
    }

    const platformData = req.body;
    const newPlatform = await storePagesService.createPlatform(userId, platformData);
    
    if (!newPlatform) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create platform' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newPlatform,
      message: 'Platform created successfully'
    });
  } catch (error) {
    console.error('Error creating platform:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/homepage/platforms/:id
 * @desc Update platform
 * @access Private
 */
router.put('/homepage/platforms/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPlatform = await storePagesService.updatePlatform(id, updateData);
    
    if (!updatedPlatform) {
      return res.status(404).json({ 
        success: false, 
        message: 'Platform not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedPlatform,
      message: 'Platform updated successfully'
    });
  } catch (error) {
    console.error('Error updating platform:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/store-pages/homepage/platforms/:id
 * @desc Delete platform
 * @access Private
 */
router.delete('/homepage/platforms/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;

    const success = await storePagesService.deletePlatform(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Platform not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Platform deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting platform:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/homepage/announcement
 * @desc Update announcement
 * @access Private
 */
router.put('/homepage/announcement', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const announcementData = req.body;
    const updatedAnnouncement = await storePagesService.upsertAnnouncement(userId, announcementData);
    
    if (!updatedAnnouncement) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update announcement' 
      });
    }
    
    res.json({
      success: true,
      data: updatedAnnouncement,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// ABOUT PAGE ROUTES
// ============================================

/**
 * @route GET /api/store-pages/about
 * @desc Get complete about page data
 * @access Private
 */
router.get('/about', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const aboutData = await storePagesService.getCompleteAboutData(userId);
    
    res.json({
      success: true,
      data: aboutData
    });
  } catch (error) {
    console.error('Error fetching about data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/about/shop-story
 * @desc Update shop story
 * @access Private
 */
router.put('/about/shop-story', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const storyData = req.body;
    const updatedStory = await storePagesService.upsertShopStory(userId, storyData);
    
    if (!updatedStory) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update shop story' 
      });
    }
    
    res.json({
      success: true,
      data: updatedStory,
      message: 'Shop story updated successfully'
    });
  } catch (error) {
    console.error('Error updating shop story:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/about/social-media
 * @desc Update social media section
 * @access Private
 */
router.put('/about/social-media', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const socialData = req.body;
    const updatedSocial = await storePagesService.upsertSocialMedia(userId, socialData);
    
    if (!updatedSocial) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update social media section' 
      });
    }
    
    res.json({
      success: true,
      data: updatedSocial,
      message: 'Social media section updated successfully'
    });
  } catch (error) {
    console.error('Error updating social media:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/store-pages/about/social-platforms
 * @desc Get all social platforms
 * @access Private
 */
router.get('/about/social-platforms', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const platforms = await storePagesService.getSocialPlatforms(userId);
    
    res.json({
      success: true,
      data: platforms
    });
  } catch (error) {
    console.error('Error fetching social platforms:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/store-pages/about/social-platforms
 * @desc Create a new social platform
 * @access Private
 */
router.post('/about/social-platforms', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { platform_name, platform_url } = req.body;

    if (!platform_name || !platform_url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Platform name and URL are required' 
      });
    }

    const platformData = req.body;
    const newPlatform = await storePagesService.createSocialPlatform(userId, platformData);
    
    if (!newPlatform) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create social platform' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newPlatform,
      message: 'Social platform created successfully'
    });
  } catch (error) {
    console.error('Error creating social platform:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/about/social-platforms/:id
 * @desc Update social platform
 * @access Private
 */
router.put('/about/social-platforms/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPlatform = await storePagesService.updateSocialPlatform(id, updateData);
    
    if (!updatedPlatform) {
      return res.status(404).json({ 
        success: false, 
        message: 'Social platform not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedPlatform,
      message: 'Social platform updated successfully'
    });
  } catch (error) {
    console.error('Error updating social platform:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/store-pages/about/social-platforms/:id
 * @desc Delete social platform
 * @access Private
 */
router.delete('/about/social-platforms/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;

    const success = await storePagesService.deleteSocialPlatform(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Social platform not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Social platform deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting social platform:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// SHIPPING PAGE ROUTES
// ============================================

/**
 * @route GET /api/store-pages/shipping
 * @desc Get complete shipping page data
 * @access Private
 */
router.get('/shipping', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const shippingData = await storePagesService.getCompleteShippingData(userId);
    
    res.json({
      success: true,
      data: shippingData
    });
  } catch (error) {
    console.error('Error fetching shipping data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/shipping/local
 * @desc Update local shipping
 * @access Private
 */
router.put('/shipping/local', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const shippingData = req.body;
    const updated = await storePagesService.upsertLocalShipping(userId, shippingData);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update local shipping' 
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Local shipping updated successfully'
    });
  } catch (error) {
    console.error('Error updating local shipping:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/shipping/international
 * @desc Update international shipping
 * @access Private
 */
router.put('/shipping/international', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const shippingData = req.body;
    const updated = await storePagesService.upsertInternationalShipping(userId, shippingData);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update international shipping' 
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'International shipping updated successfully'
    });
  } catch (error) {
    console.error('Error updating international shipping:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/shipping/rates
 * @desc Update shipping rates
 * @access Private
 */
router.put('/shipping/rates', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const ratesData = req.body;
    const updated = await storePagesService.upsertShippingRates(userId, ratesData);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update shipping rates' 
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Shipping rates updated successfully'
    });
  } catch (error) {
    console.error('Error updating shipping rates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/shipping/return-policy
 * @desc Update return policy
 * @access Private
 */
router.put('/shipping/return-policy', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const policyData = req.body;
    const updated = await storePagesService.upsertReturnPolicy(userId, policyData);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update return policy' 
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Return policy updated successfully'
    });
  } catch (error) {
    console.error('Error updating return policy:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/store-pages/shipping/faqs
 * @desc Get all FAQs
 * @access Private
 */
router.get('/shipping/faqs', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const faqs = await storePagesService.getFAQs(userId);
    
    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/store-pages/shipping/faqs
 * @desc Create a new FAQ
 * @access Private
 */
router.post('/shipping/faqs', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question and answer are required' 
      });
    }

    const faqData = req.body;
    const newFAQ = await storePagesService.createFAQ(userId, faqData);
    
    if (!newFAQ) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create FAQ' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newFAQ,
      message: 'FAQ created successfully'
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/shipping/faqs/:id
 * @desc Update FAQ
 * @access Private
 */
router.put('/shipping/faqs/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedFAQ = await storePagesService.updateFAQ(id, updateData);
    
    if (!updatedFAQ) {
      return res.status(404).json({ 
        success: false, 
        message: 'FAQ not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedFAQ,
      message: 'FAQ updated successfully'
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/store-pages/shipping/faqs/:id
 * @desc Delete FAQ
 * @access Private
 */
router.delete('/shipping/faqs/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;

    const success = await storePagesService.deleteFAQ(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'FAQ not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// CUSTOMER SUPPORT ROUTES
// ============================================

/**
 * @route GET /api/store-pages/customer-support
 * @desc Get complete customer support data
 * @access Private
 */
router.get('/customer-support', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const supportData = await storePagesService.getCompleteCustomerSupportData(userId);
    
    res.json({
      success: true,
      data: supportData
    });
  } catch (error) {
    console.error('Error fetching customer support data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/customer-support/whatsapp
 * @desc Update WhatsApp settings
 * @access Private
 */
router.put('/customer-support/whatsapp', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const whatsappData = req.body;
    const updated = await storePagesService.upsertWhatsAppSettings(userId, whatsappData);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update WhatsApp settings' 
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'WhatsApp settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating WhatsApp settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/customer-support/gmail
 * @desc Update Gmail settings
 * @access Private
 */
router.put('/customer-support/gmail', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const gmailData = req.body;
    const updated = await storePagesService.upsertGmailSettings(userId, gmailData);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update Gmail settings' 
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Gmail settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating Gmail settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/customer-support/faq-chatbot
 * @desc Update FAQ Chatbot settings
 * @access Private
 */
router.put('/customer-support/faq-chatbot', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const chatbotData = req.body;
    const updated = await storePagesService.upsertFAQChatbotSettings(userId, chatbotData);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update FAQ Chatbot settings' 
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'FAQ Chatbot settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating FAQ Chatbot settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/store-pages/customer-support/faq-chatbot/items
 * @desc Get all FAQ Chatbot items
 * @access Private
 */
router.get('/customer-support/faq-chatbot/items', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const items = await storePagesService.getFAQChatbotItems(userId);
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching FAQ Chatbot items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/store-pages/customer-support/faq-chatbot/items
 * @desc Create a new FAQ Chatbot item
 * @access Private
 */
router.post('/customer-support/faq-chatbot/items', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question and answer are required' 
      });
    }

    const itemData = req.body;
    const newItem = await storePagesService.createFAQChatbotItem(userId, itemData);
    
    if (!newItem) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create FAQ Chatbot item' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newItem,
      message: 'FAQ Chatbot item created successfully'
    });
  } catch (error) {
    console.error('Error creating FAQ Chatbot item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/customer-support/faq-chatbot/items/:id
 * @desc Update FAQ Chatbot item
 * @access Private
 */
router.put('/customer-support/faq-chatbot/items/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedItem = await storePagesService.updateFAQChatbotItem(id, updateData);
    
    if (!updatedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'FAQ Chatbot item not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedItem,
      message: 'FAQ Chatbot item updated successfully'
    });
  } catch (error) {
    console.error('Error updating FAQ Chatbot item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/store-pages/customer-support/faq-chatbot/items/:id
 * @desc Delete FAQ Chatbot item
 * @access Private
 */
router.delete('/customer-support/faq-chatbot/items/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;

    const success = await storePagesService.deleteFAQChatbotItem(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'FAQ Chatbot item not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'FAQ Chatbot item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ Chatbot item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// EVENTS ROUTES
// ============================================

/**
 * @route GET /api/store-pages/events
 * @desc Get all events
 * @access Private
 */
router.get('/events', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const events = await storePagesService.getEvents(userId);
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/store-pages/events/active
 * @desc Get active events (for public storefront)
 * @access Private
 */
router.get('/events/active', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const events = await storePagesService.getActiveEvents(userId);
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching active events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/store-pages/events/:id
 * @desc Get event by ID
 * @access Private
 */
router.get('/events/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const event = await storePagesService.getEventById(id, userId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/store-pages/events
 * @desc Create a new event
 * @access Private
 */
router.post('/events', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { title, event_date } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and event date are required' 
      });
    }

    const eventData = req.body;
    const newEvent = await storePagesService.createEvent(userId, eventData);
    
    if (!newEvent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create event' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newEvent,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/store-pages/events/:id
 * @desc Update event
 * @access Private
 */
router.put('/events/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const eventData = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updatedEvent = await storePagesService.updateEvent(id, userId, eventData);
    
    if (!updatedEvent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/store-pages/events/:id
 * @desc Delete event
 * @access Private
 */
router.delete('/events/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const success = await storePagesService.deleteEvent(id, userId);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;

