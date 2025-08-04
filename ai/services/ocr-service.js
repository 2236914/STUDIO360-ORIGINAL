/**
 * OCR Service for STUDIO360
 * Handles text extraction from receipts and invoices
 */

const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');

class OCRService {
  constructor() {
    this.supportedLanguages = ['eng', 'spa', 'fra', 'deu'];
    this.imageFormats = ['jpg', 'jpeg', 'png', 'tiff', 'bmp'];
  }

  /**
   * Process image and extract text
   * @param {Buffer|string} image - Image buffer or file path
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Extracted text and metadata
   */
  async extractText(image, options = {}) {
    try {
      const {
        language = 'eng',
        preprocess = true,
        confidence = 60
      } = options;

      // Validate input
      if (!this.isValidImage(image)) {
        throw new Error('Invalid image format');
      }

      // Preprocess image if requested
      let processedImage = image;
      if (preprocess) {
        processedImage = await this.preprocessImage(image);
      }

      // Extract text using Tesseract
      const result = await Tesseract.recognize(processedImage, language, {
        logger: m => console.log(m)
      });

      // Filter results by confidence
      const filteredText = this.filterByConfidence(result.data, confidence);

      return {
        success: true,
        text: filteredText.text,
        confidence: filteredText.confidence,
        words: filteredText.words,
        processingTime: result.data.processingTime,
        language: language,
        metadata: {
          imageSize: processedImage.length,
          wordCount: filteredText.words.length,
          averageConfidence: this.calculateAverageConfidence(filteredText.words)
        }
      };

    } catch (error) {
      console.error('OCR processing failed:', error);
      return {
        success: false,
        error: error.message,
        text: '',
        confidence: 0
      };
    }
  }

  /**
   * Preprocess image for better OCR results
   * @param {Buffer} imageBuffer - Original image buffer
   * @returns {Promise<Buffer>} Processed image buffer
   */
  async preprocessImage(imageBuffer) {
    try {
      const processed = await sharp(imageBuffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .sharpen()
        .normalize()
        .threshold(128)
        .png()
        .toBuffer();

      return processed;
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }

  /**
   * Extract structured data from receipt
   * @param {string} text - Extracted text from OCR
   * @returns {Object} Structured receipt data
   */
  extractReceiptData(text) {
    const data = {
      merchant: this.extractMerchant(text),
      date: this.extractDate(text),
      total: this.extractTotal(text),
      items: this.extractItems(text),
      tax: this.extractTax(text),
      subtotal: this.extractSubtotal(text)
    };

    return data;
  }

  /**
   * Extract merchant name from text
   * @param {string} text - OCR text
   * @returns {string} Merchant name
   */
  extractMerchant(text) {
    // Simple regex pattern for merchant extraction
    const lines = text.split('\n');
    const firstLine = lines[0]?.trim();
    
    // Look for common merchant patterns
    const merchantPatterns = [
      /^([A-Z][A-Z\s&]+)/i,
      /^([A-Z][a-z\s]+(?:STORE|SHOP|MARKET|DEPOT))/i
    ];

    for (const pattern of merchantPatterns) {
      const match = firstLine?.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return firstLine || 'Unknown Merchant';
  }

  /**
   * Extract date from text
   * @param {string} text - OCR text
   * @returns {string} Extracted date
   */
  extractDate(text) {
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * Extract total amount from text
   * @param {string} text - OCR text
   * @returns {number} Total amount
   */
  extractTotal(text) {
    const totalPatterns = [
      /TOTAL[:\s]*\$?(\d+\.?\d*)/i,
      /AMOUNT[:\s]*\$?(\d+\.?\d*)/i,
      /BALANCE[:\s]*\$?(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)\s*$/m
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return null;
  }

  /**
   * Extract tax amount from text
   * @param {string} text - OCR text
   * @returns {number} Tax amount
   */
  extractTax(text) {
    const taxPatterns = [
      /TAX[:\s]*\$?(\d+\.?\d*)/i,
      /SALES\s+TAX[:\s]*\$?(\d+\.?\d*)/i,
      /VAT[:\s]*\$?(\d+\.?\d*)/i
    ];

    for (const pattern of taxPatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return 0;
  }

  /**
   * Extract subtotal from text
   * @param {string} text - OCR text
   * @returns {number} Subtotal amount
   */
  extractSubtotal(text) {
    const subtotalPatterns = [
      /SUBTOTAL[:\s]*\$?(\d+\.?\d*)/i,
      /SUB\s+TOTAL[:\s]*\$?(\d+\.?\d*)/i
    ];

    for (const pattern of subtotalPatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return null;
  }

  /**
   * Extract individual items from text
   * @param {string} text - OCR text
   * @returns {Array} Array of items with descriptions and prices
   */
  extractItems(text) {
    const lines = text.split('\n');
    const items = [];

    // Simple item extraction pattern
    const itemPattern = /^(.+?)\s+\$?(\d+\.?\d*)$/;

    for (const line of lines) {
      const match = line.match(itemPattern);
      if (match && !this.isHeaderOrFooter(match[1])) {
        items.push({
          description: match[1].trim(),
          price: parseFloat(match[2])
        });
      }
    }

    return items;
  }

  /**
   * Check if text is header or footer
   * @param {string} text - Text to check
   * @returns {boolean} True if header/footer
   */
  isHeaderOrFooter(text) {
    const headerFooterKeywords = [
      'TOTAL', 'TAX', 'SUBTOTAL', 'CHANGE', 'CASH', 'CARD',
      'RECEIPT', 'THANK', 'WELCOME', 'STORE', 'PHONE'
    ];

    return headerFooterKeywords.some(keyword => 
      text.toUpperCase().includes(keyword)
    );
  }

  /**
   * Validate image format
   * @param {Buffer|string} image - Image to validate
   * @returns {boolean} True if valid
   */
  isValidImage(image) {
    if (Buffer.isBuffer(image)) {
      return true; // Assume valid if buffer
    }

    if (typeof image === 'string') {
      const ext = path.extname(image).toLowerCase().slice(1);
      return this.imageFormats.includes(ext);
    }

    return false;
  }

  /**
   * Filter OCR results by confidence
   * @param {Object} data - OCR result data
   * @param {number} minConfidence - Minimum confidence threshold
   * @returns {Object} Filtered results
   */
  filterByConfidence(data, minConfidence) {
    const filteredWords = data.words.filter(word => 
      word.confidence >= minConfidence
    );

    return {
      text: filteredWords.map(word => word.text).join(' '),
      confidence: data.confidence,
      words: filteredWords
    };
  }

  /**
   * Calculate average confidence
   * @param {Array} words - Array of word objects
   * @returns {number} Average confidence
   */
  calculateAverageConfidence(words) {
    if (words.length === 0) return 0;
    
    const totalConfidence = words.reduce((sum, word) => 
      sum + word.confidence, 0
    );
    
    return totalConfidence / words.length;
  }
}

module.exports = OCRService; 