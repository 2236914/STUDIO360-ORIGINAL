# STUDIO360 Setup Guide

This guide will help you set up and run the STUDIO360 AI Bookkeeping System on your local machine.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

### **Required Software**
- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** (v1.22.0 or higher)
- **Git** - [Download here](https://git-scm.com/)

### **Verify Installation**
```bash
node --version
npm --version
git --version
```

## 🚀 Getting Started

### **1. Clone the Repository**
```bash
git clone https://github.com/sippinsalmon/STUDIO360.git
cd STUDIO360
```

### **2. Project Structure**
```
STUDIO360/
├── frontend/          # React/Next.js Frontend Application
├── next-js/          # Next.js Application
├── README.md         # Project documentation
└── setup.md          # This setup guide
```

## 🎯 Frontend Setup (Main Application)

### **1. Navigate to Frontend Directory**
```bash
cd frontend
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. Environment Configuration**
Create a `.env.local` file in the `frontend` directory:
```env
# App Configuration
NEXT_PUBLIC_APP_NAME=STUDIO360
NEXT_PUBLIC_APP_VERSION=1.0.0

# API Configuration (if needed)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Authentication (if using external auth)
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_AUTH_CLIENT_ID=your-client-id
```

### **4. Start Development Server**
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at: **http://localhost:3000**

## 🔧 Next.js Setup (Alternative Application)

### **1. Navigate to Next.js Directory**
```bash
cd next-js
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. Environment Configuration**
Create a `.env.local` file in the `next-js` directory:
```env
# App Configuration
NEXT_PUBLIC_APP_NAME=STUDIO360
NEXT_PUBLIC_APP_VERSION=1.0.0

# Database (if using)
DATABASE_URL=your-database-url

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3001
```

### **4. Start Development Server**
```bash
npm run dev
# or
yarn dev
```

The Next.js app will be available at: **http://localhost:3001**

## 🎨 Features Available

### **AI Bookkeeper System**
- **Upload Button**: Located on the AI Bookkeeper page
- **File Dropzone**: Drag & drop support for receipts, Excel files, CSV
- **Step-by-Step Process**: 4-step AI bookkeeping workflow
- **Manual Editing**: Edit AI categorizations if needed

### **Navigation Structure**
- **Book of Accounts**: Traditional bookkeeping tools
  - General Journal
  - General Ledger
  - Cash Disbursement Book
  - Cash Receipt Journal
- **AI Bookkeeper**: AI-powered tools
  - AI Bookkeeper (main interface)
  - AI Categorization Log (with charts)

### **Supported File Types**
- **Images**: JPG, JPEG, PNG
- **Documents**: PDF
- **Spreadsheets**: Excel (.xlsx, .xls)
- **Data**: CSV

## 🛠️ Troubleshooting

### **Common Issues**

#### **Port Already in Use**
If you get a "port already in use" error:
```bash
# Kill process on port 3000
npx kill-port 3000
# or
npx kill-port 3001
```

#### **Node Modules Issues**
If you encounter dependency issues:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Git Issues**
If you have trouble with Git:
```bash
# Configure Git (if not done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### **Performance Issues**
- Make sure you have at least 4GB RAM available
- Close other applications to free up memory
- Use SSD storage for better performance

## 📱 Browser Compatibility

### **Supported Browsers**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### **Mobile Support**
- iOS Safari (iOS 12+)
- Chrome Mobile (Android 8+)

## 🔒 Security Notes

### **Development Environment**
- Never commit `.env` files to Git
- Use `.env.local` for local development
- Keep API keys and secrets secure

### **Production Deployment**
- Set up proper environment variables
- Use HTTPS in production
- Implement proper authentication

## 📚 Additional Resources

### **Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com/)

### **Useful Commands**

#### **Frontend Commands**
```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

#### **Next.js Commands**
```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Export static files
npm run export
```

## 🎯 Quick Start Summary

1. **Clone**: `git clone https://github.com/sippinsalmon/STUDIO360.git`
2. **Navigate**: `cd STUDIO360/frontend`
3. **Install**: `npm install`
4. **Start**: `npm run dev`
5. **Open**: http://localhost:3000

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Make sure you're in the correct directory
4. Check the console for error messages

---

**Happy coding! 🚀**

*STUDIO360 - AI-Powered Bookkeeping System* 