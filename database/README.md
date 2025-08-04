# STUDIO360 Database

This directory contains database schemas, models, migrations, and seed data for the STUDIO360 bookkeeping system.

## 📁 Project Structure

```
database/
├── models/           # Database models and schemas
├── migrations/       # Database migrations
├── seeds/           # Seed data for development
├── connections/     # Database connection configurations
└── README.md        # This file
```

## 🗄️ Database Schema

### Core Entities

#### Users
- Authentication and user management
- Role-based access control
- Profile information

#### Invoices
- Invoice creation and management
- PDF generation
- Status tracking

#### Transactions
- Financial transactions
- Categorization
- Audit trail

#### Categories
- Expense categories
- Income categories
- Custom categories

## 🚀 Quick Start

```bash
# Run migrations
npm run migrate

# Seed database
npm run seed

# Reset database
npm run db:reset
```

## 📊 Database Models

### User Model
```javascript
{
  email: String,
  password: String,
  name: String,
  role: String,
  createdAt: Date
}
```

### Invoice Model
```javascript
{
  invoiceNumber: String,
  client: Object,
  items: Array,
  total: Number,
  status: String,
  dueDate: Date
}
```

### Transaction Model
```javascript
{
  description: String,
  amount: Number,
  category: String,
  date: Date,
  type: String
}
```

## 🔧 Migrations

Migrations are used to:
- Create database tables
- Modify existing schemas
- Add indexes and constraints
- Update data structures

## 🌱 Seed Data

Seed data includes:
- Default categories
- Sample users
- Test invoices
- Sample transactions

## 📋 Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/studio360
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/studio360
```

---

**Database Version**: 1.0.0  
**Last Updated**: December 2024 