# Chatbot Setup Guide - Groq Integration

This guide will help you set up the AI-powered chatbot for your storefront using Groq's free tier.

## 🚀 Quick Setup

### 1. Create Groq Account

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account (no credit card required)
3. Create an API key
4. Copy your API key (starts with `gsk_`)

### 2. Configure Backend

Add to `backend/.env`:

```env
LLM_API_KEY=gsk_your_groq_api_key_here
LLM_MODEL=llama-3.1-70b-versatile
LLM_PROVIDER=groq
```

### 3. Restart Backend

```bash
cd backend
npm run dev
```

## ✅ Features

### **Free Tier Limits**
- **14,400 requests per day**
- **Unlimited messages**
- Fast response times (< 500ms)
- No credit card required

### **Model Options**

**Best Quality (Recommended):**
```env
LLM_MODEL=llama-3.1-70b-versatile
```

**Fastest:**
```env
LLM_MODEL=mixtral-8x7b-32768
```

**Balanced:**
```env
LLM_MODEL=llama-3.3-70b-versatile
```

## 🎯 How It Works

1. **User sends message** → Frontend calls `/api/assistant/message`
2. **Backend processes** → Groq API generates response
3. **Response delivered** → AI reply appears in chat
4. **Fallback** → If Groq unavailable, uses FAQ matching

## 💡 Chatbot Flow

### **FAQ Clicks (Instant Answers)**
- No pre-chat form required
- Goes directly to chat
- AI-powered responses

### **"Type inquiry" Field**
- User types question → Sends directly to chat
- No pre-chat form

### **"Chat with us" Button**
- Shows pre-chat form (name, email)
- Then starts chat session
- Tracks user info

## 🔧 Troubleshooting

### **404 Error**
- Make sure backend is running: `cd backend && npm run dev`
- Check that port 3001 is not in use

### **No AI Responses**
- Verify `LLM_API_KEY` is set in `backend/.env`
- Restart backend server
- Check Groq dashboard for API limits

### **Response Too Slow**
- Switch to faster model: `LLM_MODEL=mixtral-8x7b-32768`

## 📊 Production Monitoring

Groq provides free monitoring dashboard:
- Visit [console.groq.com](https://console.groq.com)
- View usage statistics
- Monitor request limits

## 💰 Cost After Free Tier

If you exceed free tier:
- **$0.27 per 1M input tokens**
- Very affordable for production
- Pay-as-you-go

## 🌐 Testing

Test the chatbot by:
1. Visiting your storefront
2. Clicking the chat widget (bottom right)
3. Sending a test message
4. Verify AI responds intelligently

## 📝 Database FAQ Integration

To use database-driven FAQs instead of hardcoded:

1. Run the seed file:
```bash
psql -d your_database -f database/migrations/2025-01-22_store_faqs_seed.sql
```

2. FAQs will be available from `store_faqs` table
3. Chatbot will use these for fallback matching

## 🎉 You're Done!

Your chatbot is now live with:
- ✅ Groq AI-powered responses
- ✅ Context-aware customer support
- ✅ Fast, reliable infrastructure
- ✅ Free tier (14,400 requests/day)
- ✅ Production-ready deployment

Enjoy your AI-powered customer support chatbot!

