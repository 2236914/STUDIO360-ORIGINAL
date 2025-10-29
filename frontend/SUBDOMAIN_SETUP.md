# Subdomain Routing Setup Guide

This guide explains how to set up and use subdomain routing for your STUDIO360 multi-store platform.

## 🌐 Subdomain Structure

### Production URLs:
- **Main Site**: `studio360.com`
- **Store**: `storeid.studio360.com` (e.g., `kitschstudio.studio360.com`)
- **Dashboard**: `dashboard.studio360.com`
- **Admin**: `admin.studio360.com`

### Development URLs:
- **Main Site**: `localhost:3033`
- **Store**: `localhost:3033/storeid` (e.g., `localhost:3033/kitschstudio`)
- **Dashboard**: `localhost:3033/dashboard`
- **Admin**: `localhost:3033/admin`

### Legacy URLs (Still Supported):
- **Store**: `localhost:3033/stores/storeid` (backward compatibility)

## 🛠️ Setup Instructions

### 1. DNS Configuration (Production)

For production deployment, you'll need to configure DNS:

```bash
# Add these DNS records to your domain provider:
*.studio360.com    A    YOUR_SERVER_IP
studio360.com      A    YOUR_SERVER_IP
www.studio360.com  A    YOUR_SERVER_IP
```

### 2. SSL Certificate (Production)

Get a wildcard SSL certificate for `*.studio360.com`:
```bash
# Using Let's Encrypt (Certbot)
certbot certonly --manual --preferred-challenges dns -d *.studio360.com -d studio360.com
```

### 3. Environment Variables

Create `.env.local` in the frontend directory:

```env
# Enable subdomain routing in development
NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING=true

# Main domain for production
NEXT_PUBLIC_MAIN_DOMAIN=studio360.com

# Development domain
NEXT_PUBLIC_DEV_DOMAIN=localhost:3033

# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Enable debug mode for subdomain routing
NEXT_PUBLIC_DEBUG_SUBDOMAIN=false
```

### 4. Local Development with Subdomains

For local testing with actual subdomains, modify your `/etc/hosts` file:

```bash
# Add these lines to /etc/hosts (Windows: C:\Windows\System32\drivers\etc\hosts)
127.0.0.1 kitschstudio.localhost
127.0.0.1 dashboard.localhost
127.0.0.1 admin.localhost
```

Then access:
- `http://kitschstudio.localhost:3033` (Store subdomain)
- `http://dashboard.localhost:3033` (Dashboard subdomain)
- `http://admin.localhost:3033` (Admin subdomain)

Or use local subdomain routes:
- `http://localhost:3033/kitschstudio` (Store route)
- `http://localhost:3033/dashboard` (Dashboard route)
- `http://localhost:3033/admin` (Admin route)

## 📝 Usage Examples

### Store URLs
```javascript
import { paths } from 'src/routes/paths';

// Traditional routing
const traditionalUrl = paths.store.checkout('kitschstudio'); // /stores/kitschstudio/checkout

// Subdomain routing
const subdomainUrl = paths.store.subdomain.checkout('kitschstudio'); // https://kitschstudio.studio360.com/checkout
```

### Navigation
```javascript
import { navigateToStore, navigateToDashboard, navigateToAdmin } from 'src/utils/subdomain';

// Navigate to store
navigateToStore('kitschstudio', '/products');

// Navigate to dashboard
navigateToDashboard('/inventory');

// Navigate to admin
navigateToAdmin('/users');
```

### Current Context Detection
```javascript
import { 
  getCurrentSubdomain, 
  getCurrentStoreId, 
  isStoreSubdomain,
  isDashboardSubdomain,
  isAdminSubdomain 
} from 'src/utils/subdomain';

// Get current subdomain
const subdomain = getCurrentSubdomain(); // 'kitschstudio' or null

// Get current store ID
const storeId = getCurrentStoreId(); // 'kitschstudio' or null

// Check current context
const isStore = isStoreSubdomain(); // true if on store subdomain
const isDashboard = isDashboardSubdomain(); // true if on dashboard subdomain
const isAdmin = isAdminSubdomain(); // true if on admin subdomain
```

## 🔧 Middleware Configuration

The middleware automatically handles:
- Store subdomains → `/stores/[storeId]/*`
- Dashboard subdomain → `/dashboard/*`
- Admin subdomain → `/admin/*`
- Invalid subdomains → Redirect to main domain

## 🚀 Deployment

### Docker
Update your docker-compose.yml to handle subdomain routing:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3033:3033"
    environment:
      - NEXT_PUBLIC_MAIN_DOMAIN=studio360.com
```

### Nginx (Production)
```nginx
server {
    listen 443 ssl;
    server_name *.studio360.com studio360.com;
    
    ssl_certificate /path/to/wildcard.crt;
    ssl_certificate_key /path/to/wildcard.key;
    
    location / {
        proxy_pass http://localhost:3033;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐛 Troubleshooting

### Common Issues:

1. **Subdomain not working locally**
   - Check `/etc/hosts` file
   - Ensure middleware is properly configured
   - Verify environment variables

2. **Production subdomains not resolving**
   - Check DNS configuration
   - Verify SSL certificate covers wildcard domain
   - Check server configuration

3. **Routing issues**
   - Check middleware configuration
   - Verify path rewriting is working
   - Check browser network tab for redirects

### Debug Mode:
Set `NEXT_PUBLIC_DEBUG_SUBDOMAIN=true` to see subdomain detection logs in the console.

## 📚 Benefits

- **SEO**: Each store gets its own domain authority
- **Branding**: Professional subdomain structure
- **Performance**: Better caching and CDN distribution
- **User Experience**: Cleaner, more memorable URLs
- **Scalability**: Easy to add new stores and features
