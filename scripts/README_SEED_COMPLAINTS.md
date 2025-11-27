# Seed Complaints Data

## Mô tả
Script này tạo dữ liệu mẫu cho tính năng khiếu nại (complaints) trong hệ thống.

## Yêu cầu trước khi chạy
Đảm bảo database đã có dữ liệu sau:
- **Users**: Ít nhất 5 users
- **Courses**: Ít nhất 3 courses
- **Instructors**: Ít nhất 3 users có `isInstructor: true`
- **Admin** (optional): 1 user có `isAdmin: true` để gán admin response

## Cách chạy

### Chạy seed complaints riêng lẻ:
```bash
npm run seed:complaints
```

### Chạy tất cả seed (curriculum + quiz + complaints):
```bash
npm run seed:all
```

## Dữ liệu được tạo

Script sẽ tạo **10 complaints** với các trạng thái khác nhau:

### Phân loại theo Status:
- **Pending** (Đang chờ xử lý): 4 complaints
- **In Progress** (Đang xử lý): 3 complaints
- **Resolved** (Đã giải quyết): 2 complaints
- **Rejected** (Từ chối): 1 complaint

### Phân loại theo Type:
- **Course** (Khiếu nại về khóa học): 6 complaints
- **Instructor** (Khiếu nại về giảng viên): 4 complaints

## Chi tiết các complaints

### 1. Course Complaint - Pending
- **Tiêu đề**: Nội dung khóa học không đúng như mô tả
- **Mô tả**: Khóa học quảng cáo cho người mới nhưng nội dung quá nâng cao
- **Thời gian**: 2 ngày trước

### 2. Course Complaint - In Progress
- **Tiêu đề**: Video bài giảng bị lỗi không xem được
- **Mô tả**: Nhiều video không load được
- **Admin Response**: Đang kiểm tra với đội kỹ thuật
- **Thời gian**: 3 ngày trước

### 3. Instructor Complaint - Resolved
- **Tiêu đề**: Giảng viên không phản hồi câu hỏi
- **Mô tả**: Đã hơn 1 tuần không có phản hồi
- **Admin Response**: Đã liên hệ giảng viên, cam kết phản hồi trong 48h
- **Thời gian**: 7 ngày trước

### 4. Course Complaint - Pending
- **Tiêu đề**: Tài liệu học tập thiếu sót
- **Mô tả**: Thiếu slide và code mẫu
- **Thời gian**: 1 ngày trước

### 5. Instructor Complaint - Rejected
- **Tiêu đề**: Giảng viên giảng dạy không rõ ràng
- **Mô tả**: Nói quá nhanh, không giải thích kỹ
- **Admin Response**: Giảng viên đã giảng đầy đủ, có thể điều chỉnh tốc độ video
- **Thời gian**: 14 ngày trước

### 6. Course Complaint - In Progress
- **Tiêu đề**: Chứng chỉ hoàn thành không được cấp
- **Mô tả**: Đã hoàn thành 100% nhưng chưa nhận chứng chỉ
- **Admin Response**: Đang kiểm tra hệ thống
- **Thời gian**: 12 giờ trước

### 7. Instructor Complaint - Pending
- **Tiêu đề**: Giảng viên sử dụng ngôn ngữ không phù hợp
- **Mô tả**: Từ ngữ không chuyên nghiệp
- **Thời gian**: 4 giờ trước

### 8. Course Complaint - Resolved
- **Tiêu đề**: Giá khóa học tăng đột ngột
- **Mô tả**: Giá tăng từ 500k lên 800k không báo trước
- **Admin Response**: Gửi mã giảm giá 30%
- **Thời gian**: 9 ngày trước

### 9. Course Complaint - Pending
- **Tiêu đề**: Quiz quá khó so với nội dung học
- **Mô tả**: Câu hỏi không liên quan đến bài giảng
- **Thời gian**: 2 giờ trước

### 10. Instructor Complaint - In Progress
- **Tiêu đề**: Giảng viên cung cấp thông tin sai
- **Mô tả**: Thông tin về async/await không chính xác
- **Admin Response**: Đang xác minh với chuyên gia
- **Thời gian**: 24 giờ trước

## Kết quả sau khi chạy

```
✅ Kết nối MongoDB thành công
👥 Tìm thấy 5 users
📚 Tìm thấy 3 courses
👨‍🏫 Tìm thấy 3 instructors
🗑️ Đã xóa dữ liệu complaints cũ
✅ Đã tạo 10 Complaints

📊 Tổng kết:
   - Tổng số complaints: 10
   - Pending: 4
   - In Progress: 3
   - Resolved: 2
   - Rejected: 1
   - Khiếu nại về khóa học: 6
   - Khiếu nại về giảng viên: 4

✅ Seed complaints data hoàn tất!
🔌 Đã đóng kết nối MongoDB
```

## Lưu ý
- Script sẽ **XÓA TẤT CẢ** complaints hiện có trước khi tạo mới
- Đảm bảo đã có đủ dữ liệu users, courses và instructors
- Nếu không có admin, các complaint sẽ không có admin response
- Thời gian tạo complaints được phân bổ từ 14 ngày trước đến 2 giờ trước

## Kiểm tra dữ liệu

Sau khi seed, bạn có thể kiểm tra bằng cách:

### 1. Qua API:
```bash
# Lấy tất cả complaints (cần admin token)
GET http://localhost:3000/api/admin/complaints

# Lấy thống kê
GET http://localhost:3000/api/admin/complaints/stats
```

### 2. Qua MongoDB:
```javascript
db.complaints.find().pretty()
db.complaints.countDocuments()
db.complaints.countDocuments({ status: "pending" })
db.complaints.countDocuments({ type: "course" })
```

## Troubleshooting

### Lỗi: "Không tìm thấy users"
```bash
# Chạy seed users trước
npm run seed:curriculum
```

### Lỗi: "Không tìm thấy courses"
```bash
# Chạy seed courses trước
npm run seed:curriculum
```

### Lỗi: "Không tìm thấy instructors"
```bash
# Đảm bảo có users với isInstructor: true
# Hoặc tạo instructor thủ công trong database
```

### Lỗi kết nối MongoDB
```bash
# Kiểm tra file .env
MONGODB_URL=mongodb://localhost:27017
DB_NAME=education_platform

# Đảm bảo MongoDB đang chạy
```
