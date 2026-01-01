# 📥 Cài đặt Google Cloud CLI

## 🪟 Trên Windows

### Option 1: Sử dụng Installer (Recommended)
1. **Download installer:**
   - Truy cập: https://cloud.google.com/sdk/docs/install-sdk#windows
   - Download file: `GoogleCloudSDKInstaller.exe`

2. **Chạy installer:**
   - Double-click file đã download
   - Follow installation wizard
   - Chọn "Install bundled Python" nếu chưa có Python

3. **Restart terminal** sau khi cài đặt xong

### Option 2: Sử dụng PowerShell
```powershell
# Download và install
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

## 🔧 Bước 2: Khởi tạo gcloud

Sau khi cài đặt xong, mở **Command Prompt mới** hoặc **PowerShell mới**:

```bash
# Khởi tạo gcloud
gcloud init

# Hoặc login riêng
gcloud auth login
```

## 🎯 Bước 3: Tạo/Chọn Google Cloud Project

### Tạo project mới:
```bash
# Tạo project mới
gcloud projects create subscription-manager-2024 --name="Subscription Manager"

# Set project
gcloud config set project subscription-manager-2024
```

### Hoặc chọn project có sẵn:
```bash
# List projects
gcloud projects list

# Set project
gcloud config set project YOUR_PROJECT_ID
```

## ✅ Bước 4: Verify Installation

```bash
# Check version
gcloud --version

# Check current config
gcloud config list

# Check authentication
gcloud auth list
```

## 🚀 Bước 5: Enable Billing (Required)

1. **Truy cập Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Enable billing cho project:**
   - Navigation menu → Billing
   - Link a billing account (có thể dùng free tier)

3. **Enable required APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## 🎉 Ready to Deploy!

Sau khi hoàn thành các bước trên, bạn có thể chạy:

```bash
cd backend
deploy.bat
```

---

## 🆘 Troubleshooting

### Lỗi "gcloud not found":
- Restart terminal/PowerShell
- Check PATH environment variable
- Reinstall gcloud CLI

### Lỗi authentication:
```bash
gcloud auth login --no-launch-browser
```

### Lỗi project not found:
```bash
gcloud projects create YOUR_PROJECT_ID
gcloud config set project YOUR_PROJECT_ID
```

### Lỗi billing:
- Enable billing trong Google Cloud Console
- Free tier có $300 credit cho new users