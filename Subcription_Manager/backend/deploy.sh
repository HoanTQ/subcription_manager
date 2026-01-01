#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying Subscription Manager Backend to Cloud Run...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Please login to gcloud first${NC}"
    gcloud auth login
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No project set. Please set a project first:${NC}"
    echo "gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}📋 Using project: $PROJECT_ID${NC}"

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and submit
echo -e "${YELLOW}🏗️  Building container image...${NC}"
gcloud builds submit --tag gcr.io/$PROJECT_ID/subscription-backend

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy subscription-backend \
  --image gcr.io/$PROJECT_ID/subscription-backend \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars="NODE_ENV=production"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe subscription-backend --platform managed --region asia-southeast1 --format 'value(status.url)')
    
    echo -e "${GREEN}🌐 Your backend is now live at:${NC}"
    echo -e "${BLUE}$SERVICE_URL${NC}"
    echo -e "${GREEN}🔍 Health check:${NC}"
    echo -e "${BLUE}$SERVICE_URL/health${NC}"
    
    echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
    echo "1. Set environment variables with sensitive data"
    echo "2. Update frontend API URL to: $SERVICE_URL/api/v1"
    echo "3. Update mobile app API URL"
    
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi