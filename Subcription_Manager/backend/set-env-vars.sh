#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting Environment Variables for Cloud Run...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found. Please create it first.${NC}"
    exit 1
fi

# Load environment variables from .env file
export $(cat .env | grep -v '^#' | xargs)

echo -e "${YELLOW}📋 Setting environment variables...${NC}"

# Set environment variables
gcloud run services update subscription-backend \
  --region asia-southeast1 \
  --set-env-vars="
    NODE_ENV=production,
    JWT_SECRET=$JWT_SECRET,
    JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET,
    ENCRYPTION_KEY=$ENCRYPTION_KEY,
    GOOGLE_SHEETS_ID=$GOOGLE_SHEETS_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL=$GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY=$GOOGLE_PRIVATE_KEY,
    FRONTEND_URL=https://your-project.web.app
  "

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Environment variables set successfully!${NC}"
    echo -e "${YELLOW}⚠️  Remember to update FRONTEND_URL with your actual Firebase Hosting URL${NC}"
else
    echo -e "${RED}❌ Failed to set environment variables${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Current environment variables:${NC}"
gcloud run services describe subscription-backend \
  --region asia-southeast1 \
  --format="value(spec.template.spec.template.spec.containers[0].env[].name)"