# 🚀 Hosting Guide - Google Cloud Platform

Hướng dẫn deploy Subscription Manager lên Google Cloud Platform một cách đơn giản nhất.

## 🎯 Kiến trúc hosting đề xuất

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Firebase Hosting  │    │   Cloud Run         │    │   Google Sheets     │
│   (Frontend)        │◄──►│   (Backend API)     │◄──►│   (Database)        │
│   Static Files      │    │   Container         │    │   Already Setup     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🌟 Tại sao chọn Google Cloud?

### ✅ **Ưu điểm:**
- **Tích hợp hoàn hảo:** Database đã dùng Google Sheets
- **Đơn giản:** Firebase Hosting cho frontend, Cloud Run cho backend
- **Miễn phí:** Generous free tier
- **Tự động scale:** Không cần quản lý server
- **HTTPS:** SSL certificates tự động
- **CDN:** Global content delivery
- **Monitoring:** Built-in logging và monitoring

### 💰 **Chi phí ước tính:**
- **Firebase Hosting:** FREE (10GB storage, 10GB/month transfer)
- **Cloud Run:** FREE tier (2 million requests/month)
- **Google Sheets API:** FREE (100 requests/100 seconds/user)
- **Total:** ~$0/month cho usage thấp

## 🔥 Option 1: Firebase Hosting + Cloud Run (Recommended)

### 🌐 Frontend - Firebase Hosting

#### Bước 1: Cài đặt Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### Bước 2: Khởi tạo Firebase project
```bash
cd frontend
firebase init hosting

# Chọn:
# - Create new project hoặc chọn existing project
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No
```

#### Bước 3: Build và deploy
```bash
npm run build
firebase deploy
```

#### Kết quả:
- URL: `https://your-project.web.app`
- HTTPS tự động
- CDN global
- Custom domain support

### ⚡ Backend - Cloud Run

#### Bước 1: Tạo Dockerfile
```dockerfile
# Subcription_Manager/backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "start"]
```

#### Bước 2: Cập nhật package.json
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

#### Bước 3: Cập nhật server port
```javascript
// src/index.js
const PORT = process.env.PORT || 8080; // Cloud Run requires PORT env
```

#### Bước 4: Deploy lên Cloud Run
```bash
cd backend

# Build và push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/subscription-backend

# Deploy to Cloud Run
gcloud run deploy subscription-backend \
  --image gcr.io/YOUR_PROJECT_ID/subscription-backend \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars="JWT_SECRET=your-jwt-secret,GOOGLE_SHEETS_ID=your-sheets-id"
```

#### Kết quả:
- URL: `https://subscription-backend-xxx-as.a.run.app`
- Auto-scaling
- HTTPS tự động
- Pay per request

### 🔧 Cấu hình Environment Variables

#### Cloud Run Environment Variables:
```bash
gcloud run services update subscription-backend \
  --set-env-vars="
    JWT_SECRET=your-super-secret-jwt-key,
    JWT_REFRESH_SECRET=your-refresh-secret,
    ENCRYPTION_KEY=your-32-character-encryption-key,
    GOOGLE_SHEETS_ID=1jsOOqz6OH-d0Vpaqz8NgGZ0k_sXJ-QejZBS9-dMFkQ8,
    GOOGLE_SERVICE_ACCOUNT_EMAIL=subscription-manager@gen-lang-client-0012236274.iam.gserviceaccount.com,
    GOOGLE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
    FRONTEND_URL=https://your-project.web.app
  "
```

### 🔗 Kết nối Frontend với Backend

#### Cập nhật API URL trong frontend:
```javascript
// frontend/src/utils/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://subscription-backend-xxx-as.a.run.app/api/v1'
  : 'http://localhost:3001/api/v1';
```

## 🚀 Option 2: App Engine (Alternative)

### Frontend - Firebase Hosting (same as above)

### Backend - App Engine
```yaml
# backend/app.yaml
runtime: nodejs18

env_variables:
  JWT_SECRET: "your-jwt-secret"
  GOOGLE_SHEETS_ID: "your-sheets-id"
  # ... other env vars

automatic_scaling:
  min_instances: 0
  max_instances: 10
```

Deploy:
```bash
cd backend
gcloud app deploy
```

## 📱 Mobile App Hosting

### Expo Application Services (EAS)
```bash
cd mobile

# Install EAS CLI
npm install -g @expo/eas-cli

# Login and configure
eas login
eas build:configure

# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

### Update API URL for production:
```javascript
// mobile/src/contexts/AuthContext.js
const API_BASE_URL = __DEV__ 
  ? 'http://10.94.13.38:3001'
  : 'https://subscription-backend-xxx-as.a.run.app';
```

## 🔧 Setup Script

Tạo script tự động deploy:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying Subscription Manager..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build

# Deploy frontend
echo "🌐 Deploying frontend to Firebase..."
firebase deploy --only hosting

# Deploy backend
echo "⚡ Deploying backend to Cloud Run..."
cd ../backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/subscription-backend
gcloud run deploy subscription-backend \
  --image gcr.io/YOUR_PROJECT_ID/subscription-backend \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated

echo "✅ Deployment completed!"
echo "🌐 Frontend: https://your-project.web.app"
echo "⚡ Backend: https://subscription-backend-xxx-as.a.run.app"
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Không commit secrets vào Git
- Sử dụng Google Secret Manager cho sensitive data
- Rotate keys định kỳ

### 2. CORS Configuration
```javascript
// backend/src/index.js
app.use(cors({
  origin: [
    'https://your-project.web.app',
    'https://your-project.firebaseapp.com'
  ],
  credentials: true
}));
```

### 3. Firebase Security Rules
```javascript
// firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          }
        ]
      }
    ]
  }
}
```

## 📊 Monitoring & Analytics

### Google Cloud Monitoring
- **Cloud Run:** Request latency, error rates
- **Firebase Hosting:** Page views, bandwidth
- **Sheets API:** Quota usage

### Setup Alerts
```bash
# CPU usage alert
gcloud alpha monitoring policies create \
  --policy-from-file=monitoring-policy.yaml
```

## 🎯 Domain Setup

### Custom Domain
1. **Firebase Hosting:**
   ```bash
   firebase hosting:channel:deploy production --expires 30d
   ```

2. **Cloud Run:**
   ```bash
   gcloud run domain-mappings create \
     --service subscription-backend \
     --domain api.yourdomain.com
   ```

## 📈 Scaling Considerations

### Auto-scaling Settings
```yaml
# Cloud Run
metadata:
  annotations:
    autoscaling.knative.dev/minScale: "0"
    autoscaling.knative.dev/maxScale: "10"
    run.googleapis.com/cpu-throttling: "false"
```

### Performance Optimization
- **Frontend:** Gzip compression, image optimization
- **Backend:** Connection pooling, caching
- **Database:** Batch operations, indexing

## 💡 Tips & Tricks

### 1. Development Workflow
```bash
# Local development
npm run dev

# Staging deployment
firebase hosting:channel:deploy staging

# Production deployment
firebase deploy --only hosting
```

### 2. Rollback Strategy
```bash
# Rollback frontend
firebase hosting:clone source-site-id:source-channel-id target-site-id:live

# Rollback backend
gcloud run services replace-traffic subscription-backend --to-revisions=REVISION-NAME=100
```

### 3. Cost Optimization
- Sử dụng Cloud Run min instances = 0
- Enable Firebase Hosting caching
- Optimize bundle size

## 🎉 Kết luận

**Recommended Setup:**
- ✅ **Frontend:** Firebase Hosting (free, fast, reliable)
- ✅ **Backend:** Cloud Run (serverless, auto-scale, pay-per-use)
- ✅ **Database:** Google Sheets (already setup)
- ✅ **Mobile:** Expo EAS (easy deployment)

**Total Cost:** ~$0-5/month cho small to medium usage

**Deployment Time:** ~30 minutes setup, 5 minutes per deploy

**Maintenance:** Minimal, fully managed services

---

**🚀 Ready to deploy? Follow the steps above and your Subscription Manager will be live on Google Cloud!**