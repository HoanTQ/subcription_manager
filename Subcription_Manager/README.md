# Subscription Manager

Ứng dụng quản lý subscription và tài khoản theo yêu cầu trong file `requirement.md`.

## 🌐 Live Demo

- **Web App:** https://gen-lang-client-0012236274.web.app
- **Backend API:** https://subscription-backend-huvta3w7yq-as.a.run.app

### Test Account
- Email: `hoantq58@gmail.com`
- Password: `123456`

## Tính năng chính

- **Quản lý tài khoản**: Lưu trữ thông tin đăng nhập các dịch vụ với mã hóa bảo mật
- **Quản lý subscription**: Theo dõi chu kỳ thanh toán, ngày đến hạn, số tiền
- **Dashboard**: Tổng quan chi phí theo tháng, subscription sắp đến hạn
- **Nhắc nhở**: Hiển thị các subscription sắp đến hạn
- **Web app**: Giao diện responsive với React
- **Backend API**: Node.js + Express + Google Sheets làm database

## Cấu trúc project

```
├── backend/          # Backend API (Node.js + Express)
├── frontend/         # Frontend Web App (React + Vite)
├── package.json      # Root package.json để chạy cả 2
└── README.md
```

## Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
# Cài đặt tất cả dependencies
npm run install:all
```

### 2. Cấu hình Google Sheets

1. Tạo Google Sheets mới
2. Tạo Service Account trong Google Cloud Console
3. Chia sẻ Google Sheets với email của Service Account
4. Copy file `.env.example` thành `.env` trong thư mục `backend/`
5. Điền thông tin Google Sheets và Service Account vào file `.env`

### 3. Chạy ứng dụng

```bash
# Chạy cả backend và frontend
npm run dev

# Hoặc chạy riêng lẻ:
npm run dev:backend   # Backend chạy trên port 3001
npm run dev:frontend  # Frontend chạy trên port 5173
```

### 4. Truy cập ứng dụng

**Production (Deployed):**
- Web app: https://gen-lang-client-0012236274.web.app
- API: https://subscription-backend-huvta3w7yq-as.a.run.app
- Health check: https://subscription-backend-huvta3w7yq-as.a.run.app/health

**Local Development:**
- Web app: http://localhost:5173
- API: http://localhost:3001
- Health check: http://localhost:3001/health

## Cấu hình Google Sheets

### Tạo Service Account

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable Google Sheets API
4. Tạo Service Account:
   - IAM & Admin > Service Accounts > Create Service Account
   - Tạo key JSON cho Service Account
5. Copy email của Service Account

### Cấu hình Sheets

1. Tạo Google Sheets mới
2. Share với email Service Account (Editor permission)
3. Copy Sheets ID từ URL (phần giữa `/d/` và `/edit`)

### File .env

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Google Sheets API
GOOGLE_SHEETS_ID=your-google-sheets-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/auth/me` - Thông tin user hiện tại
- `POST /api/v1/auth/logout` - Đăng xuất

### Accounts
- `GET /api/v1/accounts` - Danh sách tài khoản
- `POST /api/v1/accounts` - Tạo tài khoản mới
- `GET /api/v1/accounts/:id` - Chi tiết tài khoản
- `PUT /api/v1/accounts/:id` - Cập nhật tài khoản
- `DELETE /api/v1/accounts/:id` - Xóa tài khoản
- `POST /api/v1/accounts/:id/reveal-password` - Hiển thị mật khẩu

### Subscriptions
- `GET /api/v1/subscriptions` - Danh sách subscription
- `POST /api/v1/subscriptions` - Tạo subscription mới
- `GET /api/v1/subscriptions/:id` - Chi tiết subscription
- `PUT /api/v1/subscriptions/:id` - Cập nhật subscription
- `DELETE /api/v1/subscriptions/:id` - Xóa subscription
- `POST /api/v1/subscriptions/:id/move-next` - Chuyển sang kỳ tiếp theo
- `POST /api/v1/subscriptions/:id/pause` - Tạm dừng
- `POST /api/v1/subscriptions/:id/resume` - Tiếp tục
- `POST /api/v1/subscriptions/:id/cancel` - Hủy

### Dashboard
- `GET /api/v1/dashboard/summary` - Tổng quan dashboard
- `GET /api/v1/dashboard/upcoming` - Subscription sắp đến hạn
- `GET /api/v1/dashboard/forecast` - Dự báo chi phí

## Tính năng đã implement

✅ **MVP Core Features:**
- Authentication (đăng ký/đăng nhập)
- Quản lý Accounts với mã hóa password
- Quản lý Subscriptions với chu kỳ thanh toán
- Dashboard với tổng quan chi phí
- Upcoming dues với phân loại (overdue, due soon, later)
- Move to next cycle (quick action)
- Pause/Resume/Cancel subscription

✅ **Security:**
- JWT authentication
- Password encryption (AES)
- Rate limiting
- HTTPS ready
- Input validation

✅ **UI/UX:**
- Responsive design với Tailwind CSS
- Vietnamese interface
- Modal forms
- Search và filter
- Copy to clipboard
- Password reveal/hide

## Tính năng chưa implement (có thể mở rộng)

- Android app
- Calendar view
- Categories management
- Advanced forecast (multiple cycles per month)
- Audit logs
- Biometric authentication
- Web push notifications
- Export/Import data
- Multi-currency advanced features

## Công nghệ sử dụng

**Backend:**
- Node.js + Express
- Google Sheets API (database)
- JWT authentication
- bcryptjs (password hashing)
- crypto (encryption)

**Frontend:**
- React 18
- Vite (build tool)
- React Router (routing)
- Tailwind CSS (styling)
- Axios (HTTP client)
- Lucide React (icons)

## Lưu ý bảo mật

- Mật khẩu được mã hóa trước khi lưu vào Google Sheets
- JWT token có thời hạn 24h
- Rate limiting để chống brute force
- Input validation và sanitization
- HTTPS bắt buộc trong production

## Troubleshooting

### Lỗi Google Sheets API
- Kiểm tra Service Account có quyền truy cập Sheets
- Kiểm tra GOOGLE_SHEETS_ID đúng format
- Kiểm tra GOOGLE_PRIVATE_KEY có đúng format (có \\n)

### Lỗi CORS
- Kiểm tra FRONTEND_URL trong backend .env
- Đảm bảo frontend chạy đúng port 5173

### Lỗi Database
- Sheets sẽ tự động tạo các sheet cần thiết khi kết nối lần đầu
- Nếu lỗi, thử xóa và tạo lại Google Sheets

## License

MIT License