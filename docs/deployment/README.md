# Deployment Guide

This guide covers the production deployment process for the STUDIO360 application.

## 🚀 Deployment Options

### 1. Cloud Platforms
- **Vercel** (Frontend) - Recommended for Next.js
- **Railway** (Backend) - Easy deployment
- **Heroku** (Full Stack) - Traditional option
- **AWS** (Enterprise) - Scalable solution

### 2. Self-Hosted
- **Docker** - Containerized deployment
- **VPS** - Virtual private server
- **Dedicated Server** - Full control

## 📋 Pre-Deployment Checklist

### Environment Variables
```bash
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://api.studio360.com
NEXT_PUBLIC_APP_NAME=STUDIO360
NEXT_PUBLIC_APP_VERSION=1.0.0

# Backend (.env.production)
NODE_ENV=production
PORT=3000
DATABASE_URL=your-production-database-url
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://studio360.com
```

### Database Setup
- [ ] Production database configured
- [ ] Migrations run successfully
- [ ] Seed data populated
- [ ] Backup strategy in place

### Security Checklist
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting implemented
- [ ] Input validation active

## 🐳 Docker Deployment

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - database

  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=studio360
      - POSTGRES_USER=studio360
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## ☁️ Cloud Deployment

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Railway (Backend)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd backend
railway login
railway up
```

### Heroku (Full Stack)
```bash
# Install Heroku CLI
# Deploy frontend
cd frontend
heroku create studio360-frontend
git push heroku main

# Deploy backend
cd ../backend
heroku create studio360-backend
git push heroku main
```

## 🔧 Production Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name studio360.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name studio360.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring & Maintenance

### Health Checks
- Frontend: `GET /api/health`
- Backend: `GET /api/health`
- Database: Connection monitoring

### Logging
```bash
# Frontend logs
npm run logs

# Backend logs
npm run logs

# Database logs
docker logs studio360-database
```

### Backup Strategy
```bash
# Database backup
pg_dump studio360 > backup_$(date +%Y%m%d).sql

# File uploads backup
rsync -av uploads/ backup/uploads/
```

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify connection strings
3. **CORS Errors**: Check CORS configuration
4. **File Upload Issues**: Verify storage permissions

### Performance Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Monitor database queries

## 📚 Additional Resources

- [Vercel Deployment](./vercel.md)
- [Railway Deployment](./railway.md)
- [Heroku Deployment](./heroku.md)
- [Docker Deployment](./docker.md)
- [SSL Configuration](./ssl.md)
- [Monitoring Setup](./monitoring.md)

---

**Last Updated**: December 2024  
**Environment**: Production 