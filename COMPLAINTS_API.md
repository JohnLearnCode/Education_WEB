# Complaints API Documentation

## Tổng quan
API Khiếu nại (Complaints) cho phép người dùng gửi khiếu nại về khóa học hoặc giảng viên, và admin có thể quản lý các khiếu nại này.

## Data Structure

### Complaint Object
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  userName: string,
  userEmail: string,
  
  // Either courseId or instructorId
  courseId?: ObjectId,
  courseName?: string,
  
  instructorId?: ObjectId,
  instructorName?: string,
  
  type: 'course' | 'instructor',
  title: string,
  description: string,
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected',
  
  // Admin response
  adminResponse?: string,
  adminId?: ObjectId,
  adminName?: string,
  respondedAt?: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

## User Endpoints

### 1. Tạo khiếu nại mới
**POST** `/api/complaints`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "courseId": "69229b25173989b51a4c00f9",  // Hoặc instructorId
  "instructorId": "69229b25173989b51a4c00ee",  // Hoặc courseId
  "title": "Tiêu đề khiếu nại",
  "description": "Mô tả chi tiết khiếu nại"
}
```

**Note:** Chỉ cần cung cấp `courseId` HOẶC `instructorId`, không cả hai.

**Response:**
```json
{
  "success": true,
  "message": "Tạo khiếu nại thành công",
  "data": {
    "_id": "...",
    "userId": "6922b48b9921dcbd217cb928",
    "userName": "Nguyễn Văn A",
    "userEmail": "user@example.com",
    "courseId": "69229b25173989b51a4c00f9",
    "courseName": "Khóa học React",
    "type": "course",
    "title": "Tiêu đề khiếu nại",
    "description": "Mô tả chi tiết khiếu nại",
    "status": "pending",
    "createdAt": "2024-11-27T...",
    "updatedAt": "2024-11-27T..."
  }
}
```

### 2. Lấy danh sách khiếu nại của user
**GET** `/api/complaints`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số lượng items mỗi trang (default: 10)
- `status` (string, optional): Lọc theo trạng thái (pending, in_progress, resolved, rejected)
- `type` (string, optional): Lọc theo loại (course, instructor)
- `sortBy` (string, optional): Sắp xếp theo (createdAt, updatedAt, status)
- `sortOrder` (string, optional): Thứ tự sắp xếp (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách khiếu nại thành công",
  "data": {
    "complaints": [...],
    "total": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

### 3. Lấy chi tiết khiếu nại
**GET** `/api/complaints/:complaintId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin khiếu nại thành công",
  "data": {
    "_id": "...",
    "userId": "6922b48b9921dcbd217cb928",
    ...
  }
}
```

### 4. Cập nhật khiếu nại
**PUT** `/api/complaints/:complaintId`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Tiêu đề mới",
  "description": "Mô tả mới"
}
```

**Note:** Chỉ có thể cập nhật khi status là `pending`

### 5. Xóa khiếu nại
**DELETE** `/api/complaints/:complaintId`

**Headers:**
```
Authorization: Bearer <token>
```

**Note:** Chỉ có thể xóa khi status là `pending`

## Admin Endpoints

### 1. Lấy thống kê khiếu nại
**GET** `/api/admin/complaints/stats`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thống kê khiếu nại thành công",
  "data": {
    "total": 100,
    "pending": 20,
    "inProgress": 30,
    "resolved": 40,
    "rejected": 10,
    "byCourse": 60,
    "byInstructor": 40
  }
}
```

### 2. Lấy tất cả khiếu nại (Admin)
**GET** `/api/admin/complaints`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `status` (string, optional)
- `type` (string, optional)
- `search` (string, optional): Tìm kiếm theo title, description, userName, userEmail
- `sortBy` (string, optional)
- `sortOrder` (string, optional)

### 3. Lấy chi tiết khiếu nại (Admin)
**GET** `/api/admin/complaints/:complaintId`

**Headers:**
```
Authorization: Bearer <admin-token>
```

### 4. Cập nhật khiếu nại (Admin)
**PATCH** `/api/admin/complaints/:complaintId`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "status": "in_progress",
  "adminResponse": "Chúng tôi đang xử lý khiếu nại của bạn"
}
```

**Status values:**
- `pending`: Đang chờ xử lý
- `in_progress`: Đang xử lý
- `resolved`: Đã giải quyết
- `rejected`: Từ chối

### 5. Xóa khiếu nại (Admin)
**DELETE** `/api/admin/complaints/:complaintId`

**Headers:**
```
Authorization: Bearer <admin-token>
```

## Examples

### Ví dụ 1: User tạo khiếu nại về khóa học
```bash
curl -X POST http://localhost:3000/api/complaints \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "69229b25173989b51a4c00f9",
    "title": "Nội dung khóa học không đúng như mô tả",
    "description": "Khóa học quảng cáo là React nâng cao nhưng chỉ dạy cơ bản"
  }'
```

### Ví dụ 2: User tạo khiếu nại về giảng viên
```bash
curl -X POST http://localhost:3000/api/complaints \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "instructorId": "69229b25173989b51a4c00ee",
    "title": "Giảng viên không phản hồi câu hỏi",
    "description": "Tôi đã hỏi nhiều lần nhưng giảng viên không trả lời"
  }'
```

### Ví dụ 3: Admin cập nhật trạng thái khiếu nại
```bash
curl -X PATCH http://localhost:3000/api/admin/complaints/673e5f9a1234567890abcdef \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "adminResponse": "Chúng tôi đã liên hệ với giảng viên và vấn đề đã được giải quyết"
  }'
```

## Error Handling

### Common Errors:
- **400 Bad Request**: Dữ liệu không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc token không hợp lệ
- **403 Forbidden**: Không có quyền truy cập
- **404 Not Found**: Không tìm thấy khiếu nại
- **500 Internal Server Error**: Lỗi server

### Error Response Format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description",
  "timestamp": "2024-11-27T..."
}
```
