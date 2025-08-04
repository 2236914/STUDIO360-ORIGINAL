# Development Guide

This guide covers the development setup, workflow, and best practices for the STUDIO360 project.

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- Git
- VS Code (recommended)

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/sippinsalmon/STUDIO360.git
cd STUDIO360

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Start development servers
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm run dev
```

## 📁 Project Structure

```
STUDIO360/
├── frontend/          # React/Next.js Frontend
├── backend/           # Node.js/Express Backend
├── ai/               # AI/ML Services
├── database/         # Database Schemas & Migrations
├── docs/             # Documentation
└── setup.md          # Quick setup guide
```

## 🔧 Development Workflow

### 1. Frontend Development
- **Framework**: Next.js 14 with App Router
- **UI Library**: Material-UI (MUI)
- **State Management**: React Hooks
- **Styling**: MUI Theme + CSS-in-JS

### 2. Backend Development
- **Framework**: Node.js with Express
- **Database**: MongoDB/PostgreSQL
- **Authentication**: JWT
- **File Upload**: Multer

### 3. AI Services
- **OCR Processing**: Tesseract.js
- **Categorization**: Machine Learning models
- **Data Processing**: Python scripts

## 📋 Code Standards

### JavaScript/React
- Use functional components with hooks
- Follow ESLint configuration
- Use TypeScript for new components
- Write meaningful component names

### File Naming
- Components: `PascalCase` (e.g., `InvoiceList.jsx`)
- Pages: `kebab-case` (e.g., `invoice-list.jsx`)
- Utilities: `camelCase` (e.g., `formatCurrency.js`)

### Code Organization
```
src/
├── components/       # Reusable components
├── sections/         # Page-specific components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── _mock/           # Mock data
└── app/             # Next.js app router
```

## 🧪 Testing

### Frontend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Backend Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration
```

## 🔍 Debugging

### Frontend Debugging
- Use React Developer Tools
- Check browser console
- Use Next.js debug mode: `DEBUG=* npm run dev`

### Backend Debugging
- Use VS Code debugger
- Check server logs
- Use Postman for API testing

## 📚 Additional Resources

- [Frontend Setup](./frontend-setup.md)
- [Backend Setup](./backend-setup.md)
- [AI Services Setup](./ai-setup.md)
- [Database Setup](./database-setup.md)
- [Testing Guide](./testing.md)
- [Deployment Guide](../deployment/)

## 🚀 Quick Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript check

# Backend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run migrate      # Run database migrations
```

---

**Last Updated**: December 2024  
**Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md) 