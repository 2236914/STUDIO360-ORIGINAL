# AI Bookkeeper API Endpoints

This document details the AI Bookkeeper API endpoints for automated transaction categorization and processing.

## 🔄 File Upload & Processing

### Upload Files for OCR Processing
```http
POST /api/ai/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request Body:**
```form-data
files: [file1, file2, ...]  // Receipts, invoices, Excel files
processType: "ocr" | "excel" | "csv"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "upload_123456",
    "files": [
      {
        "id": "file_001",
        "name": "receipt.jpg",
        "size": 245760,
        "type": "image/jpeg",
        "status": "uploaded"
      }
    ],
    "totalFiles": 1,
    "estimatedProcessingTime": "30 seconds"
  },
  "message": "Files uploaded successfully"
}
```

### Get Upload Status
```http
GET /api/ai/upload/{uploadId}/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "upload_123456",
    "status": "processing",
    "progress": 75,
    "completedFiles": 3,
    "totalFiles": 4,
    "estimatedTimeRemaining": "10 seconds"
  }
}
```

## 🏷️ Transaction Categorization

### Categorize Transactions
```http
POST /api/ai/categorize
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "uploadId": "upload_123456",
  "options": {
    "autoCategorize": true,
    "confidenceThreshold": 0.8,
    "preferredCategories": ["office_supplies", "travel", "meals"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categorizationId": "cat_789012",
    "transactions": [
      {
        "id": "txn_001",
        "description": "Office Depot - Printer Paper",
        "amount": 45.99,
        "date": "2024-12-04",
        "category": "office_supplies",
        "confidence": 0.95,
        "suggestedCategories": [
          {"name": "office_supplies", "confidence": 0.95},
          {"name": "equipment", "confidence": 0.03},
          {"name": "supplies", "confidence": 0.02}
        ]
      }
    ],
    "summary": {
      "totalTransactions": 15,
      "categorizedCount": 12,
      "uncategorizedCount": 3,
      "averageConfidence": 0.87
    }
  }
}
```

### Get Available Categories
```http
GET /api/ai/categories
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "office_supplies",
        "name": "Office Supplies",
        "description": "Office equipment and supplies",
        "color": "#1976d2",
        "icon": "ic-office"
      },
      {
        "id": "travel",
        "name": "Travel",
        "description": "Business travel expenses",
        "color": "#388e3c",
        "icon": "ic-travel"
      }
    ],
    "customCategories": [
      {
        "id": "custom_001",
        "name": "Marketing",
        "description": "Marketing and advertising",
        "color": "#f57c00",
        "icon": "ic-marketing"
      }
    ]
  }
}
```

## 📊 Categorization Logs

### Get Categorization Logs
```http
GET /api/ai/logs
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status (all, success, failed, pending)
- `dateFrom` (string): Start date (YYYY-MM-DD)
- `dateTo` (string): End date (YYYY-MM-DD)
- `category` (string): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_001",
        "uploadId": "upload_123456",
        "fileName": "receipt.jpg",
        "status": "success",
        "category": "office_supplies",
        "confidence": 0.95,
        "processedAt": "2024-12-04T18:30:00Z",
        "processingTime": "2.3 seconds"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "summary": {
      "totalProcessed": 150,
      "successful": 142,
      "failed": 8,
      "averageConfidence": 0.89
    }
  }
}
```

### Get Log Details
```http
GET /api/ai/logs/{logId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "log_001",
    "uploadId": "upload_123456",
    "fileName": "receipt.jpg",
    "fileSize": 245760,
    "fileType": "image/jpeg",
    "status": "success",
    "category": "office_supplies",
    "confidence": 0.95,
    "originalText": "Office Depot\nPrinter Paper\n$45.99",
    "extractedData": {
      "merchant": "Office Depot",
      "items": ["Printer Paper"],
      "total": 45.99,
      "tax": 3.68,
      "date": "2024-12-04"
    },
    "suggestedCategories": [
      {"name": "office_supplies", "confidence": 0.95},
      {"name": "equipment", "confidence": 0.03},
      {"name": "supplies", "confidence": 0.02}
    ],
    "processedAt": "2024-12-04T18:30:00Z",
    "processingTime": "2.3 seconds"
  }
}
```

## 🔧 Manual Override

### Update Transaction Category
```http
PUT /api/ai/transactions/{transactionId}/category
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "category": "travel",
  "reason": "Business trip expense",
  "confidence": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "txn_001",
    "category": "travel",
    "confidence": 1.0,
    "updatedAt": "2024-12-04T18:35:00Z",
    "updatedBy": "user_123"
  },
  "message": "Transaction category updated successfully"
}
```

## 🚨 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `UPLOAD_FAILED` | File upload failed | File could not be uploaded |
| `INVALID_FILE_TYPE` | Invalid file type | File type not supported |
| `PROCESSING_FAILED` | Processing failed | OCR/processing error |
| `LOW_CONFIDENCE` | Low confidence score | AI confidence below threshold |
| `CATEGORY_NOT_FOUND` | Category not found | Invalid category ID |

## 📝 Example Usage

### Complete Workflow
```bash
# 1. Upload files
curl -X POST /api/ai/upload \
  -H "Authorization: Bearer <token>" \
  -F "files=@receipt1.jpg" \
  -F "files=@receipt2.jpg" \
  -F "processType=ocr"

# 2. Check upload status
curl -X GET /api/ai/upload/upload_123456/status \
  -H "Authorization: Bearer <token>"

# 3. Categorize transactions
curl -X POST /api/ai/categorize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"uploadId": "upload_123456"}'

# 4. Get categorization logs
curl -X GET /api/ai/logs \
  -H "Authorization: Bearer <token>"
```

---

**Base URL**: `https://api.studio360.com/v1`  
**Version**: 1.0.0 