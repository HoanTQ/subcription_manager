@echo off
echo 🚀 Deploying Subscription Manager Backend to Cloud Run...

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ gcloud CLI is not installed. Please install it first.
    echo Visit: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Get project ID
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ No project set. Please set a project first:
    echo gcloud config set project YOUR_PROJECT_ID
    pause
    exit /b 1
)

echo 📋 Using project: %PROJECT_ID%

REM Enable required APIs
echo 🔧 Enabling required APIs...
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

REM Build and submit
echo 🏗️ Building container image...
gcloud builds submit --tag gcr.io/%PROJECT_ID%/subscription-backend

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

REM Deploy to Cloud Run
echo 🚀 Deploying to Cloud Run...
gcloud run deploy subscription-backend --image gcr.io/%PROJECT_ID%/subscription-backend --platform managed --region asia-southeast1 --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --min-instances 0 --max-instances 10 --timeout 300 --set-env-vars="NODE_ENV=production"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Deployment successful!
    
    REM Get service URL
    for /f "tokens=*" %%i in ('gcloud run services describe subscription-backend --platform managed --region asia-southeast1 --format "value(status.url)" 2^>nul') do set SERVICE_URL=%%i
    
    echo 🌐 Your backend is now live at:
    echo %SERVICE_URL%
    echo 🔍 Health check:
    echo %SERVICE_URL%/health
    
    echo ⚠️ Don't forget to:
    echo 1. Set environment variables with sensitive data
    echo 2. Update frontend API URL to: %SERVICE_URL%/api/v1
    echo 3. Update mobile app API URL
    
) else (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

pause