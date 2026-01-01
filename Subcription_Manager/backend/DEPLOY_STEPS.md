# 🚀 Deploy Steps - Subscription Manager Backend

## 📥 Bước 1: Cài đặt Google Cloud CLI

### Windows Quick Install:
```powershell
# Download installer
Invoke-WebRequest -Uri "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -OutFile "$env:TEMP\GoogleCloudSDKInstaller.exe"

# Run installer
Start-Process -FilePath "$env:TEMP\GoogleCloudSDKInstaller.exe" -Wait
```

**Hoặc manual:**
1. Truy cập: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Download `GoogleCloudSDKInstaller.exe`
3. Chạy installer
4. **Restart PowerShell**

## 🔧 Bước 2: Setup Google Cloud

```bash
# Login
gcloud auth login

# Tạo project mới (hoặc dùng existing)
gcloud projects create subscription-manager-2024 --name="Subscription Manager"

# Set project
gcloud config set project subscription-manager-2024

# Enable billing (required - có free tier)
# Truy cập: https://console.cloud.google.com/billing

# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🚀 Bước 3: Deploy Backend

```bash
cd backend

# Chạy deploy script
deploy.bat

# Hoặc manual:
gcloud builds submit --tag gcr.io/subscription-manager-2024/subscription-backend
gcloud run deploy subscription-backend --image gcr.io/subscription-manager-2024/subscription-backend --platform managed --region asia-southeast1 --allow-unauthenticated
```

## 🔐 Bước 4: Set Environment Variables

```bash
# Set environment variables
gcloud run services update subscription-backend --region asia-southeast1 --set-env-vars="NODE_ENV=production,JWT_SECRET=your-jwt-secret,GOOGLE_SHEETS_ID=1jsOOqz6OH-d0Vpaqz8NgGZ0k_sXJ-QejZBS9-dMFkQ8,GOOGLE_SERVICE_ACCOUNT_EMAIL=subscription-manager@gen-lang-client-0012236274.iam.gserviceaccount.com,GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----..."
```

## ✅ Bước 5: Verify Deployment

```bash
# Get service URL
gcloud run services describe subscription-backend --region asia-southeast1 --format 'value(status.url)'

# Test health endpoint
curl https://your-service-url/health
```

---

## 🎯 Expected Results

After successful deployment:
- ✅ Backend URL: `https://subscription-backend-xxx-as.a.run.app`
- ✅ Health check: `https://subscription-backend-xxx-as.a.run.app/health`
- ✅ API endpoints: `https://subscription-backend-xxx-as.a.run.app/api/v1/*`

## 🔄 Next Steps

1. **Update Frontend API URL**
2. **Update Mobile App API URL**
3. **Test end-to-end functionality**

---

## 🆘 Need Help?

**Common Issues:**

1. **gcloud not found:** Restart terminal after installation
2. **Project not found:** Create project first with `gcloud projects create`
3. **Billing not enabled:** Enable in Google Cloud Console
4. **Build fails:** Check Dockerfile syntax
5. **Service won't start:** Check environment variables

**Quick Commands:**
```bash
# Check gcloud status
gcloud auth list
gcloud config list

# Check project
gcloud projects list

# Check services
gcloud run services list
```