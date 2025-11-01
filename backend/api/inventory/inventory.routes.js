const express = require('express');
const router = express.Router();
const inventoryService = require('../../services/inventoryService');
const { authenticateTokenHybrid } = require('../../middleware/auth');

// ============================================
// PRODUCT ROUTES
// ============================================

/**
 * @route GET /api/inventory/products
 * @desc Get all products with optional filters
 * @access Private
 */
router.get('/products', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const filters = {
      status: req.query.status ? req.query.status.split(',') : [],
      stock: req.query.stock ? req.query.stock.split(',') : [],
      category: req.query.category,
      search: req.query.search,
    };

    const products = await inventoryService.getProducts(userId, filters);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/inventory/products/:id
 * @desc Get product by ID
 * @access Private
 */
router.get('/products/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const product = await inventoryService.getProductById(id, userId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/inventory/products
 * @desc Create a new product
 * @access Private
 */
router.post('/products', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const productData = req.body;
    
    if (!productData.name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product name is required' 
      });
    }

    const newProduct = await inventoryService.createProduct(userId, productData);
    
    if (!newProduct) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create product' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/inventory/products/:id
 * @desc Update product
 * @access Private
 */
router.put('/products/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    console.log(`[PUT /api/inventory/products/:id] Request received:`, {
      productId: id,
      userId: userId,
      updateDataKeys: Object.keys(req.body || {})
    });
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    const updateData = req.body;
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Update data is required' 
      });
    }

    const updatedProduct = await inventoryService.updateProduct(id, userId, updateData);
    
    if (!updatedProduct) {
      console.error(`[PUT /api/inventory/products/:id] Product not found or update failed:`, {
        productId: id,
        userId: userId
      });
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found or update failed. Please check if the product exists and belongs to your account.' 
      });
    }
    
    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/inventory/products/:id] Error updating product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

/**
 * @route DELETE /api/inventory/products/:id
 * @desc Delete product
 * @access Private
 */
router.delete('/products/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const success = await inventoryService.deleteProduct(id, userId);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/inventory/products
 * @desc Delete multiple products
 * @access Private
 */
router.delete('/products', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product IDs array is required' 
      });
    }

    const success = await inventoryService.deleteProducts(ids, userId);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete products' 
      });
    }
    
    res.json({
      success: true,
      message: `${ids.length} product(s) deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// PRODUCT VARIATIONS ROUTES
// ============================================

/**
 * @route GET /api/inventory/products/:id/variations
 * @desc Get variations for a product
 * @access Private
 */
router.get('/products/:id/variations', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const variations = await inventoryService.getProductVariations(id, userId);
    
    res.json({
      success: true,
      data: variations
    });
  } catch (error) {
    console.error('Error fetching variations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/inventory/variations
 * @desc Create a product variation
 * @access Private
 */
router.post('/variations', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const variationData = req.body;
    const newVariation = await inventoryService.createVariation(userId, variationData);
    
    if (!newVariation) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create variation' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newVariation,
      message: 'Variation created successfully'
    });
  } catch (error) {
    console.error('Error creating variation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/inventory/variations/:id
 * @desc Update product variation
 * @access Private
 */
router.put('/variations/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updateData = req.body;
    const updatedVariation = await inventoryService.updateVariation(id, userId, updateData);
    
    if (!updatedVariation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Variation not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedVariation,
      message: 'Variation updated successfully'
    });
  } catch (error) {
    console.error('Error updating variation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/inventory/variations/:id
 * @desc Delete product variation
 * @access Private
 */
router.delete('/variations/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const success = await inventoryService.deleteVariation(id, userId);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Variation not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Variation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting variation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// WHOLESALE PRICING ROUTES
// ============================================

/**
 * @route GET /api/inventory/products/:id/wholesale
 * @desc Get wholesale pricing for a product
 * @access Private
 */
router.get('/products/:id/wholesale', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const pricing = await inventoryService.getWholesalePricing(id, userId);
    
    res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Error fetching wholesale pricing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/inventory/wholesale
 * @desc Create wholesale price tier
 * @access Private
 */
router.post('/wholesale', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const tierData = req.body;
    const newTier = await inventoryService.createWholesaleTier(userId, tierData);
    
    if (!newTier) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create wholesale tier' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newTier,
      message: 'Wholesale tier created successfully'
    });
  } catch (error) {
    console.error('Error creating wholesale tier:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/inventory/wholesale/:id
 * @desc Update wholesale price tier
 * @access Private
 */
router.put('/wholesale/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updateData = req.body;
    const updatedTier = await inventoryService.updateWholesaleTier(id, userId, updateData);
    
    if (!updatedTier) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wholesale tier not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedTier,
      message: 'Wholesale tier updated successfully'
    });
  } catch (error) {
    console.error('Error updating wholesale tier:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/inventory/wholesale/:id
 * @desc Delete wholesale price tier
 * @access Private
 */
router.delete('/wholesale/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const success = await inventoryService.deleteWholesaleTier(id, userId);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wholesale tier not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Wholesale tier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting wholesale tier:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// CATEGORIES ROUTES
// ============================================

/**
 * @route GET /api/inventory/categories
 * @desc Get all categories
 * @access Private
 */
router.get('/categories', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const categories = await inventoryService.getCategories(userId);
    
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
 * @route POST /api/inventory/categories
 * @desc Create category
 * @access Private
 */
router.post('/categories', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const categoryData = req.body;
    const newCategory = await inventoryService.createCategory(userId, categoryData);
    
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
 * @route PUT /api/inventory/categories/:id
 * @desc Update category
 * @access Private
 */
router.put('/categories/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updateData = req.body;
    const updatedCategory = await inventoryService.updateCategory(id, userId, updateData);
    
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
 * @route DELETE /api/inventory/categories/:id
 * @desc Delete category
 * @access Private
 */
router.delete('/categories/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const success = await inventoryService.deleteCategory(id, userId);
    
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

// ============================================
// STOCK MOVEMENTS ROUTES
// ============================================

/**
 * @route GET /api/inventory/products/:id/movements
 * @desc Get stock movements for a product
 * @access Private
 */
router.get('/products/:id/movements', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const movements = await inventoryService.getStockMovements(id, userId, limit);
    
    res.json({
      success: true,
      data: movements
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// STATISTICS ROUTES
// ============================================

/**
 * @route GET /api/inventory/stats
 * @desc Get inventory statistics
 * @access Private
 */
router.get('/stats', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const stats = await inventoryService.getInventoryStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;

