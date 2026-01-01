# Requirements – Subscription Manager (Web + Mobile)

**Version:** 1.1  
**Date:** December 2025

## 📋 Tổng quan

Ứng dụng quản lý subscription với các tính năng:
- Quản lý tài khoản đăng nhập các dịch vụ
- Theo dõi subscription định kỳ
- Nhắc nhở thanh toán
- Dashboard tổng quan
- Hỗ trợ cả web và mobile

## 🎯 Tính năng chính

### 1. Quản lý tài khoản (Accounts)
- Lưu trữ thông tin đăng nhập các dịch vụ
- Mã hóa mật khẩu an toàn
- Phân loại theo category
- Ghi chú và tags

### 2. Quản lý subscription
- **Loại subscription:**
  - RECURRING: Thanh toán liên tục (không có ngày kết thúc)
  - FIXED_TERM: Thanh toán theo kỳ (có ngày bắt đầu và kết thúc)
- **Chu kỳ thanh toán:** Hàng ngày, hàng tháng, hàng năm, tùy chỉnh
- **Theo dõi:** Số tiền, ngày thanh toán tiếp theo
- **Trạng thái:** Active, Paused, Cancelled

### 3. Dashboard
- Tổng quan subscription
- Thống kê chi phí
- Danh sách sắp đến hạn thanh toán
- Top subscriptions đắt nhất

### 4. Tính năng khác
- Tìm kiếm và lọc
- Sắp xếp theo nhiều tiêu chí
- Thông báo toast thay vì popup
- Responsive design

## 🛠️ Công nghệ

### Backend
- Node.js + Express
- Google Sheets API (database)
- JWT authentication
- Encryption cho passwords

### Frontend (Web)
- React + Vite
- Tailwind CSS
- Axios
- Lucide React icons

### Mobile
- React Native + Expo
- Navigation
- AsyncStorage
- Native components

## 🔐 Bảo mật

- Mã hóa password accounts
- JWT tokens
- HTTPS/SSL
- Input validation
- CORS protection

## 📱 Platform hỗ trợ

- **Web:** Chrome, Firefox, Safari, Edge
- **Mobile:** iOS, Android (qua Expo)
- **Database:** Google Sheets

## 🚀 Deployment

- **Development:** localhost:5173 (web), localhost:3001 (API)
- **Database:** Google Sheets với service account
- **Mobile:** Expo development build

## 📊 Database Schema

### Users
- user_id, email, password_hash, status, created_at, updated_at

### Accounts  
- account_id, user_id, service_name, login_id, password_ciphertext, url, category_id, notes, created_at, updated_at

### Subscriptions
- subscription_id, user_id, account_id, service_name, plan_name, subscription_type, cycle, amount_per_cycle, currency, start_date, end_date, next_due_date, status, created_at, updated_at

### Categories
- category_id, user_id, name, created_at