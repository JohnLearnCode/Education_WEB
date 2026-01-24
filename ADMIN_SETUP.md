# Admin Setup Guide

## Cấu trúc Admin System

Hệ thống đã được cập nhật với trường `isAdmin` để phân quyền admin.

### 1. Thay đổi trong Database Schema

**User Schema** giờ có thêm trường:
- `isAdmin: boolean` - Xác định user có phải admin hay không

### 2. JWT Token

JWT payload giờ bao gồm:
```typescript
{
  userId: string;
  email: string;
  isInstructor: boolean;
  isAdmin: boolean;  // ← Mới thêm
}
```

### 3. Middleware

**Middleware mới:**
- `requireAdmin` - Chỉ cho phép admin truy cập
- `requireAdminOrInstructor` - Cho phép admin hoặc instructor

**Cách sử dụng:**
```typescript
import { authenticateToken } from './middleware/auth.js';
import { requireAdmin } from './middleware/admin.js';

// Route chỉ dành cho admin
router.get('/admin/dashboard', authenticateToken, requireAdmin, getDashboard);

// Route cho admin hoặc instructor
router.get('/courses/manage', authenticateToken, requireAdminOrInstructor, manageCourses);
```

## Hướng dẫn Setup

### Bước 1: Migration Database

Nếu bạn đã có users trong database, chạy migration để thêm trường `isAdmin`:

```bash
npm run migrate:add-isadmin
```

Script này sẽ:
- Thêm `isAdmin: false` cho tất cả users hiện có
- Không ảnh hưởng đến dữ liệu khác

### Bước 2: Tạo Admin User Đầu Tiên

Chạy script interactive để tạo admin:

```bash
npm run create:admin
```

Script sẽ hỏi:
- Tên admin
- Email admin
- Password admin

Nếu user đã tồn tại, script sẽ hỏi có muốn cập nhật thành admin không.

### Bước 3: Tạo Admin qua API (Alternative)

Hoặc bạn có thể đăng ký user bình thường, sau đó update trong database:

```javascript
// Trong MongoDB shell hoặc Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

## Testing

### 1. Đăng nhập với Admin Account

```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

Response sẽ có:
```json
{
  "user": {
    "_id": "...",
    "email": "admin@example.com",
    "isAdmin": true,
    "isInstructor": false
  },
  "token": "eyJhbGc..."
}
```

### 2. Kiểm tra JWT Token

Decode token tại [jwt.io](https://jwt.io) và xác nhận có:
```json
{
  "userId": "...",
  "email": "admin@example.com",
  "isInstructor": false,
  "isAdmin": true
}
```

### 3. Test Admin Routes

```bash
GET /api/admin/dashboard
Authorization: Bearer <your-admin-token>
```

## Phân Quyền

| Role | isInstructor | isAdmin | Quyền |
|------|-------------|---------|-------|
| Student | false | false | Học khóa học, đánh giá |
| Instructor | true | false | Tạo/quản lý khóa học của mình |
| Admin | false | true | Quản lý toàn bộ hệ thống |
| Super Admin | true | true | Admin + có thể tạo khóa học |

## Security Notes

⚠️ **Quan trọng:**
- Không cho phép đăng ký trực tiếp với `isAdmin: true`
- Chỉ admin mới có thể set user khác thành admin
- Luôn kiểm tra `isAdmin` ở cả frontend và backend
- Sử dụng HTTPS trong production
- Thường xuyên rotate JWT secrets

## Troubleshooting

### Lỗi: "Property 'isAdmin' does not exist"

Chạy migration:
```bash
npm run migrate:add-isadmin
```

### Không thể tạo admin user

Kiểm tra:
1. Database connection
2. User đã tồn tại chưa
3. Password đủ mạnh chưa

### Token không có isAdmin

Đăng nhập lại để lấy token mới với payload đầy đủ.
