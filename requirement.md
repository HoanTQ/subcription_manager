BUSINESS REQUIREMENTS DOCUMENT (BRD)
Ứng dụng Theo Dõi Subscription & Dashboard Cá Nhân
1. Tổng quan tài liệu
1.1 Mục đích
Tài liệu này mô tả các yêu cầu nghiệp vụ cấp cao cho việc xây dựng một ứng dụng giúp người dùng:

Theo dõi các subscription (đăng ký dịch vụ) hàng tháng

Quản lý chi phí định kỳ

Trực quan hóa dữ liệu thông qua dashboard

Hỗ trợ ra quyết định tài chính cá nhân

Tài liệu này không đi sâu vào thiết kế kỹ thuật, mà tập trung vào cái gì hệ thống cần làm và vì sao.

1.2 Phạm vi

Trong phạm vi (In-scope):

Quản lý danh sách subscription

Theo dõi chi phí theo thời gian

Dashboard và báo cáo

Nhắc nhở gia hạn / thanh toán

Phân loại và phân tích chi tiêu

Ngoài phạm vi (Out-of-scope – giai đoạn 1):

Thanh toán trực tiếp trong app

Kết nối tự động với ngân hàng (Open Banking)

Quản lý tài chính gia đình/nhiều người dùng

AI dự báo nâng cao (giai đoạn sau)

2. Bối cảnh nghiệp vụ (Business Context)

2.1 Vấn đề hiện tại

Người dùng có nhiều subscription nhỏ lẻ (Netflix, Spotify, Cloud, SaaS…)

Dễ quên:

Gia hạn

Tổng chi phí hàng tháng

Subscription không còn sử dụng

Thiếu góc nhìn tổng thể về:

Xu hướng chi tiêu

Subscription “đắt nhưng ít dùng”

2.2 Cơ hội kinh doanh

Gia tăng nhận thức tài chính cá nhân

Giúp người dùng tối ưu chi phí định kỳ

Tạo nền tảng cho:

Gợi ý cắt giảm

Dự báo chi phí

Mô hình freemium / premium trong tương lai

3. Mục tiêu nghiệp vụ (Business Objectives)

IDMục tiêuChỉ số đo lườngBO-01Người dùng nắm được tổng chi phí subscription hàng thángTổng chi phí hiển thị rõ ràngBO-02Giảm subscription không cần thiết% subscription bị hủyBO-03Tránh quên gia hạnSố lần nhắc nhở thành côngBO-04Trải nghiệm trực quan, dễ hiểuThời gian thao tác < X phút

4. Stakeholders

NhómVai tròEnd UserNgười sử dụng ứng dụngProduct OwnerĐịnh hướng sản phẩmBusiness AnalystPhân tích & đặc tả yêu cầuDeveloperPhát triển hệ thốngUX/UI DesignerTrải nghiệm người dùng

5. Định nghĩa nghiệp vụ (Business Definitions)

Thuật ngữMô tảSubscriptionDịch vụ tính phí định kỳBilling CycleChu kỳ thanh toán (tháng/năm)Renewal DateNgày gia hạnCategoryNhóm dịch vụ (Streaming, Cloud, Productivity…)DashboardMàn hình tổng hợp số liệu

6. Nghiệp vụ hiện tại (As-Is)

Người dùng:

Ghi nhớ thủ công

Kiểm tra email / sao kê ngân hàng

Không có:

Tổng hợp chi phí

Cảnh báo tập trung

Phân tích xu hướng

7. Nghiệp vụ mong muốn (To-Be)

Người dùng:

Lưu toàn bộ subscription vào 1 ứng dụng

Xem dashboard chi phí theo thời gian

Nhận nhắc nhở trước ngày gia hạn

Phân tích & so sánh chi tiêu

8. Yêu cầu nghiệp vụ cấp cao (High-level Business Requirements)

8.1 Quản lý Subscription

IDYêu cầuBR-01Người dùng có thể thêm/sửa/xóa subscriptionBR-02Mỗi subscription có giá, chu kỳ, ngày gia hạnBR-03Hỗ trợ nhiều loại chu kỳ (tháng, năm)

8.2 Phân loại & Tag

IDYêu cầuBR-04Subscription được gán categoryBR-05Người dùng có thể tự tạo category

8.3 Dashboard & Báo cáo

IDYêu cầuBR-06Dashboard hiển thị tổng chi phí thángBR-07Biểu đồ chi phí theo thời gianBR-08Biểu đồ theo categoryBR-09So sánh tháng hiện tại vs tháng trước

8.4 Nhắc nhở & Thông báo

IDYêu cầuBR-10Nhắc trước ngày gia hạn (configurable)BR-11Thông báo subscription sắp thanh toánBR-12Đánh dấu subscription đã hủy

8.5 Phân tích & Insight (Cơ bản)

IDYêu cầuBR-13Xác định subscription ít sử dụng (manual flag)BR-14Gợi ý subscription có chi phí cao

9. Yêu cầu phi chức năng (Non-Functional Requirements)

NhómYêu cầuUsabilityGiao diện đơn giản, dễ dùngPerformanceDashboard load < 3 giâySecurityDữ liệu người dùng được bảo vệScalabilityCó thể mở rộng tính năngAvailability99% uptime (MVP)

10. Giả định & Ràng buộc

10.1 Giả định

Người dùng nhập dữ liệu thủ công (giai đoạn đầu)

Dùng cho cá nhân, 1 user = 1 account

10.2 Ràng buộc

Ngân sách hạn chế

Ưu tiên MVP nhanh

Triển khai đa nền tảng (web/mobile sau)

11. Rủi ro (High-level Risks)

IDRủi roGiảm thiểuR-01Người dùng lười nhập dữ liệuUX đơn giảnR-02Dashboard quá phức tạpIterative designR-03Feature creepQuản lý scope chặt

12. Tiêu chí thành công (Success Criteria)

Người dùng:

Thêm được subscription trong < 1 phút

Hiểu tổng chi phí ngay khi mở app

MVP được sử dụng thường xuyên (weekly active use)