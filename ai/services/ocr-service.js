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
    // Currency symbols & codes we will recognize (add more as needed)
    this.currencySymbols = ['$', '€', '£', '¥', '₹', '₱', '₽', '₩', '₺', 'R$', 'C$', 'A$'];
    this.currencyCodes = ['USD','EUR','GBP','JPY','CAD','AUD','MXN','CHF','CNY','RMB','SEK','NOK','DKK','ZAR','INR','BRL'];
    this.currencyRegex = new RegExp(`(?:${[
      ...this.currencySymbols.map(s => this.escapeForRegex(s)),
      ...this.currencyCodes
    ].join('|')})`, 'i');
  }

  // Escape characters with special meaning in regex
  escapeForRegex(str) {
    return String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
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
    // Only match totals that include an explicit currency symbol or code
    const lines = text.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
    const keywordRegex = /(TOTAL|AMOUNT|BALANCE|GRAND\s+TOTAL)/i;
    let candidates = [];

    for (const line of lines) {
      if (!keywordRegex.test(line)) continue;
      if (!this.currencyRegex.test(line)) continue; // require currency indicator
      const amount = this.extractCurrencyAmountFromLine(line);
      if (amount !== null) candidates.push(amount);
    }

    // Fallback: last line with a currency amount if no keyworded line found
    if (candidates.length === 0) {
      for (let i = lines.length - 1; i >= 0; i--) {
        if (this.currencyRegex.test(lines[i])) {
          const amount = this.extractCurrencyAmountFromLine(lines[i]);
            if (amount !== null) {
              candidates.push(amount);
              break;
            }
        }
      }
    }

    if (candidates.length === 0) return null;
    // Heuristic: maximum amount usually the total
    return Math.max(...candidates);
  }

  /**
   * Extract tax amount from text
   * @param {string} text - OCR text
   * @returns {number} Tax amount
   */
  extractTax(text) {
    const taxKeywords = /(TAX|SALES\s+TAX|VAT|GST|IVA)/i;
    const lines = text.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (!taxKeywords.test(line)) continue;
      if (!this.currencyRegex.test(line)) continue; // ignore if no currency symbol/code
      const amount = this.extractCurrencyAmountFromLine(line);
      if (amount !== null) return amount;
    }
    return 0; // default
  }

  /**
   * Extract subtotal from text
   * @param {string} text - OCR text
   * @returns {number} Subtotal amount
   */
  extractSubtotal(text) {
    const subtotalKeywords = /(SUB\s*TOTAL)/i;
    const lines = text.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (!subtotalKeywords.test(line)) continue;
      if (!this.currencyRegex.test(line)) continue;
      const amount = this.extractCurrencyAmountFromLine(line);
      if (amount !== null) return amount;
    }
    return null;
  }

  /**
   * Extract individual items from text
   * @param {string} text - OCR text
   * @returns {Array} Array of items with descriptions and prices
   */
  extractItems(text) {
    const lines = text.split(/\n|\r/);
    const items = [];
    // Pattern requires a currency symbol or code either before or after amount
    const currencyGroup = '(?:' + [
      ...this.currencySymbols.map(s => this.escapeForRegex(s)),
      ...this.currencyCodes
    ].join('|') + ')';
    const amountPattern = '(?:' + currencyGroup + '\\s?([0-9]{1,3}(?:[0-9,]*)(?:\\.[0-9]{2})?)|([0-9]{1,3}(?:[0-9,]*)(?:\\.[0-9]{2})?)\\s?' + currencyGroup + ')';
  const itemRegex = new RegExp(`^(.+?)\\s+${amountPattern}$`, 'i');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const match = line.match(itemRegex);
      if (match) {
        const desc = match[1].trim();
        if (this.isHeaderOrFooter(desc)) continue;
        const amountStr = match[2] || match[3];
        const price = this.parseAmount(amountStr);
        if (!isNaN(price)) {
          items.push({ description: desc, price });
        }
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

  /**
   * Extract the first currency amount found in a line
   * @param {string} line
   * @returns {number|null}
   */
  extractCurrencyAmountFromLine(line) {
    if (!this.currencyRegex.test(line)) return null;
    // Build dynamic regex for currency with number in either order
    const currencyPart = '(?:' + [
      ...this.currencySymbols.map(s => this.escapeForRegex(s)),
      ...this.currencyCodes
    ].join('|') + ')';
    const numberPart = '([0-9]{1,3}(?:[0-9,]*)(?:\\.[0-9]{2})?)';
    const combined = new RegExp(`${currencyPart}\\s?${numberPart}|${numberPart}\\s?${currencyPart}`, 'i');
    const m = line.match(combined);
    if (!m) return null;
    const amountStr = m[1] || m[2];
    const amount = this.parseAmount(amountStr);
    return isNaN(amount) ? null : amount;
  }

  /**
   * Parse amount string removing commas
   * @param {string} str
   * @returns {number}
   */
  parseAmount(str) {
    return parseFloat(str.replace(/,/g, ''));
  }
}

module.exports = OCRService; 