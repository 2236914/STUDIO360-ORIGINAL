/**
 * Categorization Service for STUDIO360
 * Handles automatic transaction categorization using ML models
 */

const natural = require('natural');
const fs = require('fs').promises;
const path = require('path');

class CategorizationService {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.categories = this.loadCategories();
    this.trainingData = [];
    this.isTrained = false;
  }

  /**
   * Load predefined categories
   * @returns {Object} Categories with metadata
   */
  loadCategories() {
    return {
      office_supplies: {
        name: 'Office Supplies',
        keywords: ['office', 'supplies', 'paper', 'printer', 'ink', 'pens', 'staples'],
        color: '#1976d2',
        icon: 'ic-office'
      },
      travel: {
        name: 'Travel',
        keywords: ['travel', 'hotel', 'flight', 'uber', 'lyft', 'taxi', 'gas', 'fuel'],
        color: '#388e3c',
        icon: 'ic-travel'
      },
      meals: {
        name: 'Meals & Dining',
        keywords: ['restaurant', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'coffee'],
        color: '#f57c00',
        icon: 'ic-food'
      },
      marketing: {
        name: 'Marketing',
        keywords: ['advertising', 'marketing', 'social media', 'google ads', 'facebook ads'],
        color: '#7b1fa2',
        icon: 'ic-marketing'
      },
      software: {
        name: 'Software & Subscriptions',
        keywords: ['software', 'subscription', 'saas', 'app', 'tool', 'platform'],
        color: '#0288d1',
        icon: 'ic-software'
      },
      utilities: {
        name: 'Utilities',
        keywords: ['electricity', 'water', 'internet', 'phone', 'utility', 'bill'],
        color: '#d32f2f',
        icon: 'ic-utility'
      },
      equipment: {
        name: 'Equipment',
        keywords: ['computer', 'laptop', 'equipment', 'hardware', 'device', 'machine'],
        color: '#5d4037',
        icon: 'ic-equipment'
      },
      professional_services: {
        name: 'Professional Services',
        keywords: ['consulting', 'legal', 'accounting', 'service', 'professional'],
        color: '#455a64',
        icon: 'ic-service'
      }
    };
  }

  /**
   * Train the categorization model
   * @param {Array} trainingData - Array of training examples
   */
  async trainModel(trainingData = []) {
    try {
      console.log('Training categorization model...');

      // Load default training data if none provided
      if (trainingData.length === 0) {
        trainingData = await this.loadDefaultTrainingData();
      }

      // Add training examples to classifier
      for (const example of trainingData) {
        this.classifier.addDocument(example.text, example.category);
      }

      // Train the classifier
      this.classifier.train();

      this.isTrained = true;
      this.trainingData = trainingData;

      console.log(`Model trained with ${trainingData.length} examples`);
      return { success: true, trainingCount: trainingData.length };

    } catch (error) {
      console.error('Training failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load default training data
   * @returns {Array} Default training examples
   */
  async loadDefaultTrainingData() {
    return [
      // Office Supplies
      { text: 'Office Depot printer paper', category: 'office_supplies' },
      { text: 'Staples office supplies', category: 'office_supplies' },
      { text: 'Amazon pens and notebooks', category: 'office_supplies' },
      { text: 'Walmart office equipment', category: 'office_supplies' },

      // Travel
      { text: 'Marriott hotel stay', category: 'travel' },
      { text: 'Uber ride to airport', category: 'travel' },
      { text: 'Shell gas station', category: 'travel' },
      { text: 'Delta airline ticket', category: 'travel' },
      { text: 'Hertz car rental', category: 'travel' },

      // Meals
      { text: 'McDonald\'s lunch', category: 'meals' },
      { text: 'Starbucks coffee', category: 'meals' },
      { text: 'Pizza Hut dinner', category: 'meals' },
      { text: 'Subway sandwich', category: 'meals' },
      { text: 'Chipotle burrito', category: 'meals' },

      // Marketing
      { text: 'Google Ads advertising', category: 'marketing' },
      { text: 'Facebook marketing campaign', category: 'marketing' },
      { text: 'LinkedIn ads', category: 'marketing' },
      { text: 'Print advertising', category: 'marketing' },

      // Software
      { text: 'Adobe Creative Suite subscription', category: 'software' },
      { text: 'Microsoft Office 365', category: 'software' },
      { text: 'Slack premium plan', category: 'software' },
      { text: 'Zoom pro subscription', category: 'software' },

      // Utilities
      { text: 'Electricity bill', category: 'utilities' },
      { text: 'Water utility payment', category: 'utilities' },
      { text: 'Internet service provider', category: 'utilities' },
      { text: 'Phone bill', category: 'utilities' },

      // Equipment
      { text: 'Apple MacBook Pro', category: 'equipment' },
      { text: 'Dell computer purchase', category: 'equipment' },
      { text: 'Canon printer', category: 'equipment' },
      { text: 'Samsung monitor', category: 'equipment' },

      // Professional Services
      { text: 'Legal consultation', category: 'professional_services' },
      { text: 'Accounting services', category: 'professional_services' },
      { text: 'Business consulting', category: 'professional_services' },
      { text: 'IT support services', category: 'professional_services' }
    ];
  }

  /**
   * Categorize a transaction
   * @param {Object} transaction - Transaction data
   * @returns {Object} Categorization result
   */
  categorizeTransaction(transaction) {
    try {
      if (!this.isTrained) {
        throw new Error('Model not trained. Please train the model first.');
      }

      const { description, merchant, amount } = transaction;
      
      // Create text for classification
      const text = this.createClassificationText(description, merchant);
      
      // Get classification
      const category = this.classifier.classify(text);
      const confidence = this.calculateConfidence(text, category);
      
      // Get alternative categories
      const alternatives = this.getAlternativeCategories(text, category);

      return {
        success: true,
        category: category,
        confidence: confidence,
        alternatives: alternatives,
        metadata: {
          text: text,
          amount: amount,
          merchant: merchant,
          description: description
        }
      };

    } catch (error) {
      console.error('Categorization failed:', error);
      return {
        success: false,
        error: error.message,
        category: 'uncategorized',
        confidence: 0
      };
    }
  }

  /**
   * Create text for classification
   * @param {string} description - Transaction description
   * @param {string} merchant - Merchant name
   * @returns {string} Combined text for classification
   */
  createClassificationText(description, merchant) {
    const text = `${description || ''} ${merchant || ''}`.toLowerCase();
    
    // Clean and normalize text
    return text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate confidence score
   * @param {string} text - Input text
   * @param {string} category - Predicted category
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(text, category) {
    try {
      // Get classification scores
      const scores = this.classifier.getClassifications(text);
      
      // Find the score for the predicted category
      const categoryScore = scores.find(score => score.label === category);
      
      if (categoryScore) {
        return Math.min(categoryScore.value, 1.0);
      }
      
      return 0.5; // Default confidence
    } catch (error) {
      return 0.5;
    }
  }

  /**
   * Get alternative categories
   * @param {string} text - Input text
   * @param {string} primaryCategory - Primary category
   * @returns {Array} Alternative categories with scores
   */
  getAlternativeCategories(text, primaryCategory) {
    try {
      const scores = this.classifier.getClassifications(text);
      
      return scores
        .filter(score => score.label !== primaryCategory)
        .slice(0, 3) // Top 3 alternatives
        .map(score => ({
          category: score.label,
          confidence: Math.min(score.value, 1.0),
          name: this.categories[score.label]?.name || score.label
        }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Add training example
   * @param {string} text - Transaction text
   * @param {string} category - Correct category
   * @param {number} amount - Transaction amount
   */
  addTrainingExample(text, category, amount = 0) {
    try {
      // Validate category
      if (!this.categories[category]) {
        throw new Error(`Invalid category: ${category}`);
      }

      // Add to classifier
      this.classifier.addDocument(text.toLowerCase(), category);
      
      // Add to training data
      this.trainingData.push({
        text: text.toLowerCase(),
        category: category,
        amount: amount,
        timestamp: new Date()
      });

      // Retrain model
      this.classifier.train();

      return { success: true, message: 'Training example added' };

    } catch (error) {
      console.error('Failed to add training example:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all available categories
   * @returns {Object} Categories with metadata
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Get category statistics
   * @returns {Object} Category usage statistics
   */
  getCategoryStats() {
    const stats = {};
    
    for (const category of Object.keys(this.categories)) {
      const categoryData = this.trainingData.filter(item => item.category === category);
      
      stats[category] = {
        name: this.categories[category].name,
        count: categoryData.length,
        totalAmount: categoryData.reduce((sum, item) => sum + (item.amount || 0), 0),
        averageAmount: categoryData.length > 0 
          ? categoryData.reduce((sum, item) => sum + (item.amount || 0), 0) / categoryData.length 
          : 0
      };
    }
    
    return stats;
  }

  /**
   * Save model to file
   * @param {string} filepath - Path to save model
   */
  async saveModel(filepath) {
    try {
      const modelData = {
        classifier: this.classifier,
        trainingData: this.trainingData,
        categories: this.categories,
        isTrained: this.isTrained,
        timestamp: new Date()
      };

      await fs.writeFile(filepath, JSON.stringify(modelData, null, 2));
      return { success: true, filepath };
    } catch (error) {
      console.error('Failed to save model:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load model from file
   * @param {string} filepath - Path to load model from
   */
  async loadModel(filepath) {
    try {
      const data = await fs.readFile(filepath, 'utf8');
      const modelData = JSON.parse(data);
      
      this.classifier = modelData.classifier;
      this.trainingData = modelData.trainingData;
      this.categories = modelData.categories;
      this.isTrained = modelData.isTrained;
      
      return { success: true };
    } catch (error) {
      console.error('Failed to load model:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Batch categorize transactions
   * @param {Array} transactions - Array of transactions
   * @returns {Array} Categorized transactions
   */
  batchCategorize(transactions) {
    return transactions.map(transaction => {
      const result = this.categorizeTransaction(transaction);
      return {
        ...transaction,
        category: result.category,
        confidence: result.confidence,
        alternatives: result.alternatives
      };
    });
  }
}

module.exports = CategorizationService; 