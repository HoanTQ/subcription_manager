# Implementation Plan: Hệ thống Quản lý Chấm công VectorCIC

## Overview

Triển khai hệ thống quản lý chấm công với React frontend, Node.js backend và Google Sheets làm database. Hệ thống hỗ trợ chấm công theo ca, tính lương tự động và phân quyền 4 vai trò.

## Tasks

- [x] 1. Setup project structure và core configuration
  - [x] 1.1 Khởi tạo backend Node.js/Express với TypeScript
    - Tạo thư mục `attendance-system/backend`
    - Cài đặt dependencies: express, typescript, googleapis, jsonwebtoken, bcrypt, uuid
    - Cấu hình tsconfig.json và package.json scripts
    - _Requirements: N/A (Setup)_

  - [x] 1.2 Khởi tạo frontend React với TypeScript và TailwindCSS
    - Tạo thư mục `attendance-system/frontend` với Vite
    - Cài đặt dependencies: react-router-dom, axios, tailwindcss
    - Cấu hình TailwindCSS
    - _Requirements: N/A (Setup)_

  - [x] 1.3 Cấu hình Google Sheets API credentials
    - Tạo Google Cloud Project và enable Sheets API
    - Tạo Service Account và download credentials.json
    - Tạo Google Spreadsheet với các sheets: Users, Employees, Projects, ProjectEmployees, Attendance, AuditLog
    - _Requirements: N/A (Setup)_

- [x] 2. Implement Google Sheets Service và Data Layer
  - [x] 2.1 Tạo GoogleSheetsService class
    - Implement getRows, appendRow, updateRow, deleteRow methods
    - Implement findRowById và findRowsByField methods
    - Xử lý authentication với Service Account
    - _Requirements: N/A (Infrastructure)_

  - [x] 2.2 Tạo Repository classes cho từng entity
    - UserRepository: CRUD operations cho Users sheet
    - EmployeeRepository: CRUD operations cho Employees sheet
    - ProjectRepository: CRUD operations cho Projects sheet
    - AttendanceRepository: CRUD operations cho Attendance sheet
    - AuditLogRepository: append-only operations cho AuditLog sheet
    - _Requirements: 1.1, 1.2, 2.1, 9.1_

  - [x] 2.3 Write property test cho GoogleSheetsService
    - **Property 10: Soft Delete Preserves History**
    - **Validates: Requirements 1.3**

- [x] 3. Implement Salary Calculation Module
  - [x] 3.1 Tạo salaryCalculator.ts với các hàm tính lương
    - calculateDailyWork(record): tính số công từ ca sáng/chiều
    - calculateMealAllowance(record): tính phụ cấp cơm nước
    - calculateOvertime(hours, dailyRate): tính tiền tăng ca với hệ số 1.5
    - calculateTransport(hasTransport): tính phụ cấp xăng xe
    - calculateMonthlySalary(records, employee): tính tổng lương tháng
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.2 Write property test cho Work Day Calculation
    - **Property 1: Work Day Calculation Consistency**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 3.3 Write property test cho Overtime Calculation
    - **Property 2: Overtime Calculation with 1.5x Multiplier**
    - **Validates: Requirements 3.4, 4.3, 6.2**

  - [x] 3.4 Write property test cho Salary Components Sum
    - **Property 3: Salary Components Sum to Total**
    - **Validates: Requirements 4.1, 4.2, 4.4, 4.5**

  - [x] 3.5 Write property test cho Meal Allowance
    - **Property 4: Meal Allowance Conditional on Work**
    - **Validates: Requirements 3.5, 4.2**

  - [x] 3.6 Write property test cho Transport Allowance
    - **Property 5: Transport Allowance Conditional on Usage**
    - **Validates: Requirements 3.6, 4.4**

- [x] 4. Checkpoint - Ensure salary calculation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Authentication và Authorization
  - [x] 5.1 Tạo auth middleware với JWT
    - Implement generateToken và verifyToken functions
    - Implement authMiddleware để validate JWT từ request header
    - Implement password hashing với bcrypt
    - _Requirements: 7.1_

  - [x] 5.2 Tạo permission system với multi-role support
    - Define Role enum: ADMIN, TIMEKEEPER, ACCOUNTANT, WORKER
    - Define permission mappings cho từng role
    - Implement hasPermission(user, permission) function
    - Implement requirePermission middleware
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 5.3 Write property test cho Permission Union
    - **Property 7: Permission Union for Multi-Role Users**
    - **Validates: Requirements 7.3, 7.8**

  - [x] 5.4 Write property test cho Worker Read-Only Access
    - **Property 8: Worker Read-Only Access**
    - **Validates: Requirements 7.4, 8.5**

- [x] 6. Implement Backend API Routes
  - [x] 6.1 Tạo Auth routes
    - POST /api/auth/login: validate credentials, return JWT
    - POST /api/auth/logout: invalidate token (client-side)
    - GET /api/auth/me: return current user info
    - _Requirements: 7.1_

  - [x] 6.2 Tạo Employee routes
    - GET /api/employees: list all employees (Admin only)
    - POST /api/employees: create employee (Admin only)
    - PUT /api/employees/:id: update employee (Admin only)
    - DELETE /api/employees/:id: soft delete employee (Admin only)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 6.3 Write property test cho Daily Rate Validation
    - **Property 6: Daily Rate Validation Range**
    - **Validates: Requirements 1.4, 6.1**

  - [x] 6.4 Tạo Project routes
    - GET /api/projects: list all projects
    - POST /api/projects: create project (Admin only)
    - PUT /api/projects/:id: update project (Admin only)
    - POST /api/projects/:id/assign: assign employee to project (Admin only)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 6.5 Tạo Attendance routes
    - GET /api/attendance: get attendance by month/project (Timekeeper, Accountant)
    - POST /api/attendance: create/update attendance record (Timekeeper)
    - GET /api/attendance/my: get personal attendance (Worker)
    - _Requirements: 3.1-3.7, 8.1, 8.4_

  - [x] 6.6 Write property test cho Invalid Attendance Input Rejection
    - **Property 12: Invalid Attendance Input Rejection**
    - **Validates: Requirements 3.7**

  - [x] 6.7 Tạo Report routes
    - GET /api/reports/salary: get salary report by month/project (Accountant)
    - GET /api/reports/export: export Excel file (Accountant)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 6.8 Write property test cho Project Total Calculation
    - **Property 11: Project Total Equals Sum of Employee Salaries**
    - **Validates: Requirements 5.4**

  - [x] 6.9 Tạo Audit routes
    - GET /api/audit/:entityType/:id: get audit history (Admin only)
    - _Requirements: 9.2_

  - [x] 6.10 Write property test cho Audit Log Completeness
    - **Property 9: Audit Log Completeness**
    - **Validates: Requirements 9.1**

- [x] 7. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Frontend Core Components
  - [x] 8.1 Tạo AuthContext và Login page
    - Implement AuthContext với login/logout functions
    - Tạo Login.tsx page với form đăng nhập
    - Implement ProtectedRoute component
    - _Requirements: 7.1_

  - [x] 8.2 Tạo Layout components
    - Header.tsx: hiển thị user info, logout button
    - Sidebar.tsx: navigation menu theo role
    - Layout.tsx: wrapper component
    - _Requirements: 7.2, 7.3_

  - [x] 8.3 Tạo API client với axios
    - Cấu hình axios instance với base URL
    - Implement request interceptor để attach JWT
    - Implement response interceptor để handle errors
    - _Requirements: N/A (Infrastructure)_

- [x] 9. Implement Attendance Table UI
  - [x] 9.1 Tạo AttendanceGrid component
    - Hiển thị bảng với cột là ngày trong tháng
    - Hiển thị thứ trong tuần (T2-CN) cho mỗi ngày
    - Phân biệt màu sắc cho Chủ nhật
    - _Requirements: 10.1, 10.2, 10.6_

  - [x] 9.2 Tạo AttendanceCell component
    - Input cho ca sáng/chiều (X/0)
    - Input cho giờ tăng ca (số)
    - Input cho xăng xe (checkbox)
    - Hỗ trợ keyboard navigation (Tab, Enter, Arrow keys)
    - _Requirements: 10.3, 10.5_

  - [x] 9.3 Tạo AttendanceSummary component
    - Hiển thị tổng công, tiền công, tiền cơm, tiền tăng ca, tiền xăng, tổng lương
    - Auto-update khi dữ liệu thay đổi
    - _Requirements: 10.4, 5.3_

  - [x] 9.4 Tạo Attendance page
    - Dropdown chọn tháng/năm và công trình
    - Tích hợp AttendanceGrid và AttendanceSummary
    - Nút lưu dữ liệu
    - _Requirements: 5.1, 4.6_

- [x] 10. Implement Employee và Project Management UI
  - [x] 10.1 Tạo Employees page
    - Danh sách nhân viên với search/filter
    - Form thêm/sửa nhân viên
    - Validation đơn giá công nhật (500,000 - 1,000,000)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 10.2 Tạo Projects page
    - Danh sách công trình
    - Form thêm/sửa công trình
    - Phân công nhân viên vào công trình
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 11. Implement Reports và Export
  - [x] 11.1 Tạo Reports page
    - Hiển thị bảng lương theo tháng/công trình
    - Hiển thị tổng chi phí nhân công
    - Hiển thị thông tin người chấm công và ngày lập
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [x] 11.2 Implement Excel export
    - Sử dụng ExcelJS để tạo file Excel
    - Format theo mẫu bảng lương công ty
    - Download file từ frontend
    - _Requirements: 5.5_

- [x] 12. Implement Worker Personal View
  - [x] 12.1 Tạo MyAttendance page
    - Hiển thị bảng chấm công cá nhân tháng hiện tại
    - Hiển thị chi tiết: ca sáng, ca chiều, giờ tăng ca, xăng xe
    - Hiển thị tổng lương dự kiến
    - Dropdown chọn tháng để xem lịch sử
    - Read-only mode (không cho chỉnh sửa)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 13. Implement Audit Log UI
  - [x] 13.1 Tạo AuditLog component
    - Hiển thị lịch sử thay đổi của một record
    - Hiển thị: người thay đổi, thời gian, giá trị cũ/mới
    - Modal hoặc expandable section
    - _Requirements: 9.1, 9.2_

- [x] 14. Final Checkpoint - Integration Testing
  - Ensure all tests pass, ask the user if questions arise.
  - Test luồng chấm công hoàn chỉnh
  - Test xuất báo cáo Excel
  - Test phân quyền các vai trò

## Notes

- All tasks including property-based tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Google Sheets API có rate limit, cần implement caching nếu cần thiết
