---
inclusion: manual
---
# Deployment Guide

Gọi file này bằng cách gõ `#deployment-guide` trong chat.

## Frontend (Firebase Hosting)
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## Backend (Cloud Run)
```bash
cd backend
gcloud run deploy subscription-backend --source . --region asia-southeast1
```

## Environment Variables
Đảm bảo set đầy đủ env vars trên Cloud Run:
- JWT_SECRET
- GOOGLE_SHEETS_ID
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_PRIVATE_KEY
- FRONTEND_URL
