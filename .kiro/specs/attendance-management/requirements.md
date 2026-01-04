# Requirements Document

## Giới thiệu

Phần mềm Quản lý Chấm công và Tính lương dành cho công ty xây dựng VectorCIC. Hệ thống cho phép quản lý chấm công theo ca (sáng/chiều/tối), tính toán lương dựa trên công nhật, phụ cấp cơm nước, tăng ca và xăng xe.

## Glossary

- **Attendance_System**: Hệ thống quản lý chấm công chính
- **Employee**: Nhân viên trong hệ thống
- **Workday**: Ngày công làm việc (sáng hoặc chiều được tính là 0.5 công, cả ngày là 1 công)
- **Overtime**: Giờ tăng ca (tính theo giờ, hệ số x1.5)
- **Daily_Rate**: Đơn giá công nhật của nhân viên
- **Meal_Allowance**: Phụ cấp cơm + nước (50,000 VND/ngày)
- **Overtime_Rate**: Đơn giá tăng ca = Daily_Rate / 8 * 1.5
- **Transport_Allowance**: Phụ cấp xăng xe (100,000 VND/ngày)
- **Project**: Công trình/dự án mà nhân viên làm việc
- **Timekeeper**: Người chấm công

## Requirements

### Requirement 1: Quản lý nhân viên

**User Story:** Là quản trị viên, tôi muốn quản lý thông tin nhân viên, để có thể theo dõi và tính lương chính xác cho từng người.

#### Acceptance Criteria

1. WHEN quản trị viên thêm nhân viên mới, THE Attendance_System SHALL lưu trữ họ tên, chức vụ và đơn giá công nhật
2. WHEN quản trị viên cập nhật thông tin nhân viên, THE Attendance_System SHALL cập nhật đơn giá công nhật và các phụ cấp tương ứng
3. WHEN quản trị viên xóa nhân viên, THE Attendance_System SHALL đánh dấu nhân viên là không hoạt động và giữ lại lịch sử chấm công
4. THE Attendance_System SHALL cho phép thiết lập đơn giá công nhật riêng cho từng nhân viên
5. THE Attendance_System SHALL cho phép thiết lập phụ cấp xăng xe (có/không) cho từng nhân và đơn giá phụ cấp xăng xe cho từng người. Mặc định sẽ là 100,000 VND/ngày

### Requirement 2: Quản lý công trình/dự án

**User Story:** Là quản trị viên, tôi muốn quản lý các công trình, để có thể phân bổ nhân viên và theo dõi chi phí nhân công theo từng dự án.

#### Acceptance Criteria

1. WHEN quản trị viên tạo công trình mới, THE Attendance_System SHALL lưu trữ tên công trình và thời gian bắt đầu
2. WHEN quản trị viên phân công nhân viên vào công trình, THE Attendance_System SHALL liên kết nhân viên với công trình đó
3. THE Attendance_System SHALL cho phép một nhân viên làm việc tại nhiều công trình khác nhau trong cùng tháng

### Requirement 3: Chấm công theo ca

**User Story:** Là người chấm công, tôi muốn ghi nhận công làm việc theo ca sáng/chiều/tối, để tính toán chính xác số công và giờ tăng ca.

#### Acceptance Criteria

1. WHEN người chấm công đánh dấu ca sáng (X), THE Attendance_System SHALL ghi nhận 0.5 công cho nhân viên
2. WHEN người chấm công đánh dấu ca chiều (X), THE Attendance_System SHALL ghi nhận 0.5 công cho nhân viên
3. WHEN người chấm công đánh dấu cả ca sáng và chiều, THE Attendance_System SHALL ghi nhận 1 công đầy đủ
4. WHEN người chấm công nhập số giờ tăng ca (tối), THE Attendance_System SHALL ghi nhận số giờ tăng ca với hệ số x1.5
5. WHEN người chấm công đánh dấu có đi làm đủ 2 buổi sáng và chiều, THE Attendance_System SHALL tự động tính phụ cấp cơm nước cho ngày đó
6. WHEN người chấm công đánh dấu đi làm đủ 2 buổi sáng và chiều, THE Attendance_System SHALL tự động đánh dấu phụ cấp xăng xe cho ngày đó, nhưng người dùng có thể bỏ đánh dấu thủ công nếu cần
7. THE Attendance_System SHALL tính phụ cấp xăng xe dựa trên checkbox "Xăng xe" được đánh dấu, không phụ thuộc vào việc đi làm đủ 2 ca
8. IF người chấm công chấm công cho ngày trong tương lai, THEN THE Attendance_System SHALL hiển thị thông báo lỗi "Không thể chấm công cho ngày trong tương lai"
9. THE Attendance_System SHALL cho phép chấm công cho ngày hiện tại và các ngày trong quá khứ
10. IF người chấm công nhập số giờ tăng ca âm, THEN THE Attendance_System SHALL hiển thị thông báo lỗi "Số giờ tăng ca không được âm"
11. IF người chấm công nhập số giờ tăng ca vượt quá 8 giờ, THEN THE Attendance_System SHALL hiển thị thông báo lỗi "Số giờ tăng ca không được vượt quá 8 giờ/ngày"
12. IF thiếu thông tin bắt buộc (nhân viên, công trình, ngày), THEN THE Attendance_System SHALL hiển thị thông báo lỗi tương ứng
13. IF nhân viên không tồn tại trong hệ thống, THEN THE Attendance_System SHALL hiển thị thông báo lỗi "Nhân viên không tồn tại"

### Requirement 4: Tính toán lương tự động

**User Story:** Là kế toán, tôi muốn hệ thống tự động tính toán lương, để giảm thiểu sai sót và tiết kiệm thời gian.

#### Acceptance Criteria

1. THE Attendance_System SHALL tính tiền công = Tổng công × Đơn giá công nhật
2. THE Attendance_System SHALL tính tiền cơm nước = Số ngày làm việc cả sáng và chiều × 50,000 VND
3. THE Attendance_System SHALL tính tiền tăng ca = Tổng giờ tăng ca × (Đơn giá công nhật / 8) × 1.5
4. THE Attendance_System SHALL tính tiền xăng xe = Số ngày có đánh dấu checkbox "Xăng xe" × 100,000 VND (hoặc đơn giá xăng xe của nhân viên)
5. THE Attendance_System SHALL tính tổng lương = Tiền công + Tiền cơm nước + Tiền tăng ca + Tiền xăng xe
6. WHEN dữ liệu chấm công thay đổi, THE Attendance_System SHALL tự động cập nhật các khoản tính toán

### Requirement 5: Báo cáo bảng lương theo tháng

**User Story:** Là kế toán, tôi muốn xuất báo cáo bảng lương theo tháng, để có thể thanh toán và lưu trữ hồ sơ.

#### Acceptance Criteria

1. WHEN kế toán chọn tháng và công trình, THE Attendance_System SHALL hiển thị bảng chấm công của tất cả nhân viên
2. THE Attendance_System SHALL hiển thị chi tiết từng ngày trong tháng với trạng thái ca sáng/chiều/tối
3. THE Attendance_System SHALL hiển thị tổng công, tiền công, tiền cơm nước, tiền tăng ca, tiền xăng xe và tổng lương cho mỗi nhân viên
4. THE Attendance_System SHALL hiển thị tổng chi phí nhân công của toàn bộ công trình trong tháng
5. WHEN kế toán yêu cầu xuất báo cáo, THE Attendance_System SHALL xuất file Excel với định dạng tương tự bảng lương mẫu
6. THE Attendance_System SHALL hiển thị thông tin người chấm công và ngày lập bảng

### Requirement 6: Quản lý đơn giá linh hoạt

**User Story:** Là Quản trị viên, tôi muốn thiết lập đơn giá khác nhau cho từng nhân viên, để phản ánh đúng mức lương theo năng lực và kinh nghiệm.

#### Acceptance Criteria

1. THE Attendance_System SHALL cho phép thiết lập đơn giá công nhật từ 500,000 đến 5,000,000 VND
2. THE Attendance_System SHALL tự động tính đơn giá tăng ca = Đơn giá công nhật / 8 × 1.5
3. WHEN đơn giá công nhật thay đổi, THE Attendance_System SHALL áp dụng đơn giá mới cho các ngày chấm công sau đó
4. THE Attendance_System SHALL giữ nguyên đơn giá cũ cho các ngày đã chấm công trước khi thay đổi

### Requirement 7: Xác thực và phân quyền

**User Story:** Là quản trị viên, tôi muốn phân quyền người dùng, để đảm bảo an toàn dữ liệu và trách nhiệm rõ ràng.

#### Acceptance Criteria

1. THE Attendance_System SHALL yêu cầu đăng nhập trước khi truy cập hệ thống
2. THE Attendance_System SHALL phân biệt 4 vai trò: Quản trị viên, Người chấm công, Kế toán, Công nhân
3. THE Attendance_System SHALL cho phép một người dùng được gán nhiều vai trò cùng lúc
4. WHILE người dùng có vai trò Công nhân, THE Attendance_System SHALL chỉ cho phép xem thông tin công của chính mình mà không được chỉnh sửa
5. WHILE người dùng có vai trò Người chấm công, THE Attendance_System SHALL cho phép nhập và sửa dữ liệu chấm công
6. WHILE người dùng có vai trò Kế toán, THE Attendance_System SHALL cho phép xem báo cáo và xuất file
7. WHILE người dùng có vai trò Quản trị viên, THE Attendance_System SHALL cho phép truy cập tất cả chức năng
8. WHEN người dùng có nhiều vai trò, THE Attendance_System SHALL cấp quyền tổng hợp của tất cả các vai trò được gán

### Requirement 8: Xem thông tin công cá nhân (Công nhân)

**User Story:** Là công nhân, tôi muốn xem thông tin công của mình, để biết được số công đã làm và lương dự kiến.

#### Acceptance Criteria

1. WHEN công nhân đăng nhập, THE Attendance_System SHALL hiển thị bảng chấm công cá nhân của tháng hiện tại
2. THE Attendance_System SHALL hiển thị chi tiết từng ngày: ca sáng, ca chiều, giờ tăng ca, xăng xe
3. THE Attendance_System SHALL hiển thị tổng công, tiền công, tiền cơm nước, tiền tăng ca, tiền xăng xe và tổng lương dự kiến
4. THE Attendance_System SHALL cho phép công nhân xem lịch sử chấm công các tháng trước
5. THE Attendance_System SHALL KHÔNG cho phép công nhân chỉnh sửa bất kỳ dữ liệu nào
6. THE Attendance_System SHALL KHÔNG cho phép công nhân xem thông tin cá nhân của người khác.

### Requirement 9: Lịch sử và kiểm toán

**User Story:** Là quản trị viên, tôi muốn theo dõi lịch sử thay đổi, để có thể kiểm tra và xử lý khi có sai sót.

#### Acceptance Criteria

1. WHEN dữ liệu chấm công được thay đổi, THE Attendance_System SHALL ghi lại người thay đổi, thời gian và giá trị cũ/mới
2. THE Attendance_System SHALL cho phép xem lịch sử thay đổi của từng bản ghi chấm công
3. THE Attendance_System SHALL lưu trữ dữ liệu chấm công tối thiểu 2 năm

### Requirement 10: Giao diện nhập liệu dạng bảng

**User Story:** Là người chấm công, tôi muốn giao diện nhập liệu dạng bảng giống Excel, để dễ dàng nhập và kiểm tra dữ liệu.

#### Acceptance Criteria

1. THE Attendance_System SHALL hiển thị bảng chấm công với các cột là ngày trong tháng và các hàng là nhân viên
2. THE Attendance_System SHALL hiển thị thứ trong tuần (T2-CN) cho mỗi ngày
3. THE Attendance_System SHALL cho phép chấm công ca sáng/chiều bằng một click chuột, hiển thị dấu tích xanh khi có mặt
4. THE Attendance_System SHALL tự động tính toán và hiển thị tổng công khi nhập liệu
5. WHEN người dùng di chuyển giữa các ô, THE Attendance_System SHALL hỗ trợ phím tắt (Tab, Enter, mũi tên)
6. THE Attendance_System SHALL phân biệt màu sắc cho ngày Chủ nhật và ngày nghỉ lễ
7. THE Attendance_System SHALL hiển thị các cột tổng hợp lương cho từng nhân viên bao gồm: Tổng công, Tiền công, Tiền cơm, Tiền tăng ca, Tiền xăng, Tổng lương
8. WHEN dữ liệu chấm công thay đổi, THE Attendance_System SHALL tự động cập nhật các cột tổng hợp lương theo thời gian thực
