# Quick Start Guide

## Chạy ngay không cần cấu hình Google Sheets

Ứng dụng có thể chạy ngay với mock database để demo, không cần cấu hình Google Sheets.

### 1. Cài đặt dependencies

```bash
# Chạy file setup (Windows)
setup.bat

# Hoặc chạy thủ công:
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Chạy ứng dụng

```bash
# Chạy file run (Windows)
run.bat

# Hoặc chạy thủ công:
npm run dev
```

### 3. Truy cập ứng dụng

- **Web App**: http://localhost:5173
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### 4. Đăng ký tài khoản

1. Mở http://localhost:5173
2. Click "tạo tài khoản mới"
3. Nhập email và mật khẩu
4. Đăng ký thành công sẽ tự động đăng nhập

### 5. Test các tính năng

**Quản lý Accounts:**
1. Vào menu "Accounts"
2. Click "Thêm tài khoản"
3. Nhập thông tin: Netflix, email@example.com, password123
4. Lưu và test reveal password

**Quản lý Subscriptions:**
1. Vào menu "Subscriptions"
2. Click "Thêm subscription"
3. Nhập: Netflix Premium, 180000 VND, Hàng tháng
4. Chọn ngày bắt đầu và lưu

**Dashboard:**
1. Vào menu "Dashboard"
2. Xem tổng quan chi phí
3. Xem top subscriptions

**Upcoming:**
1. Vào menu "Upcoming"
2. Xem các subscription sắp đến hạn
3. Test "Đã thanh toán" để chuyển sang kỳ tiếp theo

## Cấu hình Google Sheets (Production)

Để sử dụng Google Sheets làm database thực tế:

1. Đọc hướng dẫn trong `GOOGLE_SHEETS_SETUP.md`
2. Cấu hình file `backend/.env`
3. Restart backend

## Mobile App

Để chạy mobile app:

```bash
cd mobile
npm install
npx expo start
```

Chi tiết xem `MOBILE_QUICK_START.md`

## Tính năng đã hoàn thành

✅ **Authentication**
- Đăng ký/đăng nhập
- JWT token
- Session management

✅ **Accounts Management**
- CRUD operations
- Password encryption
- Reveal/hide password
- Copy to clipboard
- Search functionality

✅ **Subscriptions Management**
- CRUD operations
- Multiple billing cycles (Monthly/Yearly/Custom)
- Status management (Active/Paused/Cancelled)
- Move to next cycle
- Currency support

✅ **Dashboard**
- Monthly summary
- 30-day forecast
- Top subscriptions by amount
- Visual cards with icons

✅ **Upcoming Dues**
- Categorized view (Overdue/Due Soon/Later)
- Flexible time range (7/14/30/60 days)
- Quick actions
- Color-coded status

✅ **Mobile App**
- React Native với Expo
- Đầy đủ tính năng như web
- Cross-platform (iOS/Android)
- Secure storage

✅ **UI/UX**
- Responsive design
- Vietnamese interface
- Modern design with Tailwind CSS
- Modal forms
- Loading states
- Error handling

✅ **Security**
- Password hashing (bcrypt)
- Password encryption (AES)
- JWT authentication
- Rate limiting
- Input validation
- CORS protection

## Demo Data

Khi chạy với mock database, bạn có thể tạo data demo để test:

**Accounts mẫu:**
- Netflix: user@netflix.com / password123
- Spotify: user@spotify.com / music456
- Google Drive: user@gmail.com / drive789

**Subscriptions mẫu:**
- Netflix Premium: 180,000 VND/tháng
- Spotify Premium: 59,000 VND/tháng
- Google Drive 100GB: 45,000 VND/tháng
- Adobe Creative Cloud: 52 USD/tháng

## Troubleshooting

### Port đã được sử dụng
```bash
# Kiểm tra process đang dùng port
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Kill process nếu cần
taskkill /PID <process_id> /F
```

### Lỗi CORS
- Đảm bảo backend chạy trên port 3001
- Đảm bảo frontend chạy trên port 5173

### Lỗi dependencies
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Cấu hình Google Sheets** cho production
2. **Deploy** lên server (Heroku, Vercel, etc.)
3. **Thêm tính năng** từ backlog trong requirement.md
4. **Build mobile app** cho production

## Support

Nếu gặp vấn đề:
1. Kiểm tra console log trong browser (F12)
2. Kiểm tra terminal output của backend
3. Đọc file README.md để biết thêm chi tiết