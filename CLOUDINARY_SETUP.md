# 🚀 Cloudinary Setup Guide for STUDIO360

## Step 1: Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. Verify your email address

## Step 2: Get Your API Credentials
1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy these values:
   - **Cloud Name**: Found at the top of the dashboard
   - **API Key**: Found in the "API Keys" section
   - **API Secret**: Found in the "API Keys" section

## Step 3: Configure Environment Variables
Add these to your `backend/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## Step 4: Test the Setup
1. Restart your backend server: `npm run dev`
2. Try uploading an image in your inventory form
3. Check your Cloudinary dashboard to see uploaded images

## Features Included:
✅ **Single Image Upload** - Upload one image at a time
✅ **Multiple Image Upload** - Upload multiple images at once
✅ **URL Image Support** - Paste image URLs directly
✅ **Auto Optimization** - Images are automatically optimized
✅ **Secure URLs** - All images use HTTPS
✅ **Organized Storage** - Images stored in `studio360/products` folder
✅ **Image Deletion** - Delete images from Cloudinary
✅ **Image Info** - Get image metadata

## Free Tier Limits:
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Perfect for development and small businesses!**

## Usage:
1. **File Upload**: Drag & drop or click to select files
2. **URL Upload**: Paste image URLs directly
3. **Automatic Processing**: Images are optimized and stored securely
4. **Database Integration**: URLs are saved to your database automatically

## Troubleshooting:
- **"Authentication required"**: Make sure you're logged in
- **"Upload failed"**: Check your Cloudinary credentials
- **"Image failed to load"**: URL might be invalid or blocked by CORS

## Next Steps:
1. Set up your Cloudinary account
2. Add credentials to `.env` file
3. Restart backend server
4. Test image uploads!
