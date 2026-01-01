# 🚀 Backend Deployment to Google Cloud Run

## 📋 Prerequisites

1. **Google Cloud CLI installed:**
   ```bash
   # Install gcloud CLI
   # Visit: https://cloud.google.com/sdk/docs/install
   ```

2. **Login and set project:**
   ```bash
   gcloud auth login
   gcloud config set project gen-lang-client-0012236274
   ```

3. **Enable required APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## 🚀 Quick Deploy

### Option 1: Using deploy script (Recommended)
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option 2: Manual deployment
```bash
# Build and push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/subscription-backend

# Deploy to Cloud Run
gcloud run deploy subscription-backend \
  --image gcr.io/YOUR_PROJECT_ID/subscription-backend \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## 🔧 Set Environment Variables

### Option 1: Using script
```bash
# Make script executable
chmod +x set-env-vars.sh

# Set environment variables
./set-env-vars.sh
```

### Option 2: Manual setup
```bash
gcloud run services update subscription-backend \
  --region asia-southeast1 \
  --set-env-vars="
    NODE_ENV=production,
    JWT_SECRET=your-jwt-secret,
    JWT_REFRESH_SECRET=your-refresh-secret,
    ENCRYPTION_KEY=your-32-character-key,
    GOOGLE_SHEETS_ID=your-sheets-id,
    GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com,
    GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...,
    FRONTEND_URL=https://your-project.web.app
  "
```

## 🔍 Verify Deployment

1. **Check service status:**
   ```bash
   gcloud run services list
   ```

2. **Get service URL:**
   ```bash
   gcloud run services describe subscription-backend \
     --region asia-southeast1 \
     --format 'value(status.url)'
   ```

3. **Test health endpoint:**
   ```bash
   curl https://your-service-url/health
   ```

## 📊 Monitoring

### View logs:
```bash
gcloud logs tail --follow --resource-type cloud_run_revision \
  --resource-labels service_name=subscription-backend
```

### View metrics:
```bash
# Open in browser
gcloud run services describe subscription-backend \
  --region asia-southeast1 \
  --format 'value(status.url)' | sed 's|https://|https://console.cloud.google.com/run/detail/asia-southeast1/subscription-backend/metrics?project=|'
```

## 🔄 Update Deployment

### Update code:
```bash
# After making code changes
./deploy.sh
```

### Update environment variables:
```bash
./set-env-vars.sh
```

### Rollback:
```bash
# List revisions
gcloud run revisions list --service subscription-backend --region asia-southeast1

# Rollback to specific revision
gcloud run services update-traffic subscription-backend \
  --to-revisions REVISION-NAME=100 \
  --region asia-southeast1
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Build fails:**
   ```bash
   # Check Dockerfile syntax
   docker build -t test .
   ```

2. **Service won't start:**
   ```bash
   # Check logs
   gcloud logs read --service subscription-backend --limit 50
   ```

3. **Environment variables not set:**
   ```bash
   # Verify env vars
   gcloud run services describe subscription-backend \
     --region asia-southeast1 \
     --format="table(spec.template.spec.template.spec.containers[0].env[].name,spec.template.spec.template.spec.containers[0].env[].value)"
   ```

4. **CORS issues:**
   - Make sure FRONTEND_URL is set correctly
   - Update CORS configuration in src/index.js

## 💰 Cost Optimization

### Current configuration:
- **Memory:** 512Mi (can reduce to 256Mi if needed)
- **CPU:** 1 (minimum for Node.js)
- **Min instances:** 0 (cold starts but cost-effective)
- **Max instances:** 10 (adjust based on traffic)

### Monitor costs:
```bash
# View billing
gcloud billing accounts list
gcloud billing projects describe YOUR_PROJECT_ID
```

## 🔐 Security

### Best practices applied:
- ✅ Non-root user in container
- ✅ Health checks enabled
- ✅ Environment variables for secrets
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ Helmet security headers

### Additional security:
```bash
# Enable Cloud Armor (if needed)
gcloud compute security-policies create subscription-policy

# Set up IAM roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/run.invoker"
```

## 📱 Update Mobile App

After deployment, update mobile app API URL:

```javascript
// mobile/src/contexts/AuthContext.js
const API_BASE_URL = __DEV__ 
  ? 'http://10.94.13.38:3001'
  : 'https://your-cloud-run-url';
```

## 🎉 Success!

Your backend is now running on Google Cloud Run with:
- ✅ Auto-scaling
- ✅ HTTPS enabled
- ✅ Global load balancing
- ✅ Pay-per-request pricing
- ✅ Zero maintenance

**Next steps:**
1. Deploy frontend to Firebase Hosting
2. Update API URLs in frontend and mobile
3. Test end-to-end functionality