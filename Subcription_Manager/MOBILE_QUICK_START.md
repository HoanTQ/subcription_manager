# 📱 Mobile Quick Start Guide

Hướng dẫn nhanh để chạy ứng dụng mobile Subscription Manager.

## 🚀 Bước 1: Cài đặt dependencies

```bash
cd mobile
npm install
```

## 📱 Bước 2: Chạy ứng dụng

### Với Expo Go (Recommended)
```bash
npx expo start
```

Sau đó:
1. Cài đặt **Expo Go** app trên điện thoại
2. Scan QR code từ terminal
3. App sẽ load trên điện thoại

### Với Android Emulator
```bash
npx expo start --android
```

### Với iOS Simulator (chỉ trên Mac)
```bash
npx expo start --ios
```

## ⚙️ Cấu hình Backend

Đảm bảo backend đang chạy trên `http://localhost:3001`:

```bash
# Từ thư mục gốc
cd backend
npm run dev
```

## 📋 Tính năng Mobile App

### 🔐 Authentication
- Đăng nhập với email/password
- JWT token storage
- Auto-login

### 📊 Dashboard
- Tổng quan subscriptions
- Thống kê nhanh
- Subscriptions sắp đến hạn

### 👤 Accounts Management
- Danh sách tài khoản
- Thêm/sửa/xóa accounts
- Mã hóa password an toàn
- Categories và tags

### 💳 Subscriptions Management
- Danh sách subscriptions
- Thêm/sửa/xóa subscriptions
- 2 loại: RECURRING và FIXED_TERM
- Chu kỳ thanh toán đa dạng
- Trạng thái: Active/Paused/Cancelled

### ⏰ Upcoming Payments
- Danh sách sắp đến hạn
- Sắp xếp theo ngày
- Thông tin chi tiết

## 🎨 UI/UX Features

- **Native Navigation:** Tab navigation + Stack navigation
- **Responsive Design:** Tối ưu cho mọi kích thước màn hình
- **Loading States:** Skeleton loading và spinners
- **Error Handling:** Toast notifications
- **Pull to Refresh:** Làm mới dữ liệu
- **Search & Filter:** Tìm kiếm và lọc dữ liệu

## 🔧 Troubleshooting

### Lỗi kết nối Backend
```javascript
// Kiểm tra IP trong src/config/api.js
const API_BASE_URL = 'http://YOUR_IP:3001/api/v1';
```

### Lỗi Expo
```bash
# Clear cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache
```

### Lỗi Dependencies
```bash
# Xóa và cài lại
rm -rf node_modules
npm install
```

## 📱 Test Account

- **Email:** hoantq58@gmail.com
- **Password:** 123456

## 🚀 Build Production

### Android APK
```bash
npx expo build:android
```

### iOS IPA (cần Apple Developer Account)
```bash
npx expo build:ios
```

## 📚 Cấu trúc thư mục

```
mobile/
├── src/
│   ├── components/     # Reusable components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation setup
│   ├── contexts/       # React contexts
│   ├── config/         # Configuration
│   └── utils/          # Utility functions
├── assets/             # Images, fonts
├── app.json           # Expo configuration
└── package.json       # Dependencies
```

## 🎯 Next Steps

1. **Customize:** Thay đổi colors, fonts trong theme
2. **Add Features:** Push notifications, offline mode
3. **Deploy:** Publish lên App Store/Google Play
4. **Analytics:** Thêm tracking và analytics

**🚀 Enjoy your mobile Subscription Manager app!**