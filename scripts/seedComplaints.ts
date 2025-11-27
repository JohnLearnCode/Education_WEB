import dotenv from 'dotenv';
dotenv.config();

import { MongoClient, ObjectId } from 'mongodb';
import { ComplaintStatus, ComplaintType } from '../types/complaint/request';

const MONGODB_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'education_platform';

interface SeedComplaint {
  _id: ObjectId;
  userId: ObjectId;
  userName: string;
  userEmail: string;
  courseId?: ObjectId;
  courseName?: string;
  instructorId?: ObjectId;
  instructorName?: string;
  type: ComplaintType;
  title: string;
  description: string;
  status: ComplaintStatus;
  adminResponse?: string;
  adminId?: ObjectId;
  adminName?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function seedComplaintsData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Kết nối MongoDB thành công');
    
    const db = client.db(DB_NAME);
    
    // Get existing data
    const usersCollection = db.collection('users');
    const coursesCollection = db.collection('courses');
    const complaintsCollection = db.collection('complaints');
    
    // Get users
    const users = await usersCollection.find({}).limit(5).toArray();
    if (users.length === 0) {
      console.log('❌ Không tìm thấy users. Vui lòng tạo users trước.');
      return;
    }
    
    // Get courses
    const courses = await coursesCollection.find({}).limit(3).toArray();
    if (courses.length === 0) {
      console.log('❌ Không tìm thấy courses. Vui lòng tạo courses trước.');
      return;
    }
    
    // Get instructors
    const instructors = await usersCollection.find({ isInstructor: true }).limit(3).toArray();
    if (instructors.length === 0) {
      console.log('❌ Không tìm thấy instructors. Vui lòng tạo instructors trước.');
      return;
    }
    
    // Get admin
    const admin = await usersCollection.findOne({ isAdmin: true });
    
    console.log(`👥 Tìm thấy ${users.length} users`);
    console.log(`📚 Tìm thấy ${courses.length} courses`);
    console.log(`👨‍🏫 Tìm thấy ${instructors.length} instructors`);
    
    // Clear existing complaints
    await complaintsCollection.deleteMany({});
    console.log('🗑️ Đã xóa dữ liệu complaints cũ');
    
    const complaints: SeedComplaint[] = [];
    const now = new Date();
    
    // Complaint 1: Course complaint - Pending
    complaints.push({
      _id: new ObjectId(),
      userId: users[0]._id,
      userName: users[0].name || 'User 1',
      userEmail: users[0].email,
      courseId: courses[0]._id,
      courseName: courses[0].title,
      type: ComplaintType.COURSE,
      title: 'Nội dung khóa học không đúng như mô tả',
      description: 'Khóa học được quảng cáo là dành cho người mới bắt đầu nhưng nội dung quá nâng cao. Tôi không thể theo kịp các bài giảng và cảm thấy rất khó khăn. Mong nhà trường xem xét lại nội dung hoặc phân loại lại level của khóa học.',
      status: ComplaintStatus.PENDING,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    });
    
    // Complaint 2: Course complaint - In Progress
    complaints.push({
      _id: new ObjectId(),
      userId: users[1]._id,
      userName: users[1].name || 'User 2',
      userEmail: users[1].email,
      courseId: courses[1]._id,
      courseName: courses[1].title,
      type: ComplaintType.COURSE,
      title: 'Video bài giảng bị lỗi không xem được',
      description: 'Tôi đã mua khóa học nhưng nhiều video bài giảng bị lỗi, không load được. Đã thử nhiều trình duyệt khác nhau nhưng vẫn không khắc phục được. Vui lòng kiểm tra và sửa lỗi.',
      status: ComplaintStatus.IN_PROGRESS,
      adminResponse: 'Chúng tôi đã nhận được khiếu nại của bạn và đang kiểm tra vấn đề với đội kỹ thuật. Dự kiến sẽ khắc phục trong 24h.',
      adminId: admin?._id,
      adminName: admin?.name || 'Admin',
      respondedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000)
    });
    
    // Complaint 3: Instructor complaint - Resolved
    complaints.push({
      _id: new ObjectId(),
      userId: users[2]._id,
      userName: users[2].name || 'User 3',
      userEmail: users[2].email,
      instructorId: instructors[0]._id,
      instructorName: instructors[0].name || 'Instructor 1',
      type: ComplaintType.INSTRUCTOR,
      title: 'Giảng viên không phản hồi câu hỏi',
      description: 'Tôi đã đặt nhiều câu hỏi trong phần Q&A của khóa học nhưng giảng viên không trả lời. Đã hơn 1 tuần rồi mà vẫn chưa có phản hồi nào.',
      status: ComplaintStatus.RESOLVED,
      adminResponse: 'Chúng tôi đã liên hệ với giảng viên và họ đã cam kết sẽ phản hồi các câu hỏi trong vòng 48h. Giảng viên cũng đã gửi lời xin lỗi vì sự chậm trễ.',
      adminId: admin?._id,
      adminName: admin?.name || 'Admin',
      respondedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    });
    
    // Complaint 4: Course complaint - Pending
    complaints.push({
      _id: new ObjectId(),
      userId: users[3]._id,
      userName: users[3].name || 'User 4',
      userEmail: users[3].email,
      courseId: courses[2]._id,
      courseName: courses[2].title,
      type: ComplaintType.COURSE,
      title: 'Tài liệu học tập thiếu sót',
      description: 'Khóa học thiếu tài liệu tham khảo và bài tập thực hành. Chỉ có video mà không có slide hoặc code mẫu để tham khảo.',
      status: ComplaintStatus.PENDING,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    });
    
    // Complaint 5: Instructor complaint - Rejected
    complaints.push({
      _id: new ObjectId(),
      userId: users[0]._id,
      userName: users[0].name || 'User 1',
      userEmail: users[0].email,
      instructorId: instructors[1]._id,
      instructorName: instructors[1].name || 'Instructor 2',
      type: ComplaintType.INSTRUCTOR,
      title: 'Giảng viên giảng dạy không rõ ràng',
      description: 'Giảng viên nói quá nhanh và không giải thích kỹ các khái niệm. Tôi cảm thấy rất khó hiểu.',
      status: ComplaintStatus.REJECTED,
      adminResponse: 'Sau khi xem xét, chúng tôi thấy rằng giảng viên đã giảng dạy đầy đủ và rõ ràng. Bạn có thể điều chỉnh tốc độ video hoặc xem lại nhiều lần. Nếu vẫn khó hiểu, hãy đặt câu hỏi cụ thể trong phần Q&A.',
      adminId: admin?._id,
      adminName: admin?.name || 'Admin',
      respondedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
    });
    
    // Complaint 6: Course complaint - In Progress
    complaints.push({
      _id: new ObjectId(),
      userId: users[1]._id,
      userName: users[1].name || 'User 2',
      userEmail: users[1].email,
      courseId: courses[0]._id,
      courseName: courses[0].title,
      type: ComplaintType.COURSE,
      title: 'Chứng chỉ hoàn thành không được cấp',
      description: 'Tôi đã hoàn thành 100% khóa học và đạt điểm cao trong tất cả các bài kiểm tra nhưng vẫn chưa nhận được chứng chỉ.',
      status: ComplaintStatus.IN_PROGRESS,
      adminResponse: 'Chúng tôi đang kiểm tra hệ thống cấp chứng chỉ. Vui lòng chờ trong 24-48h.',
      adminId: admin?._id,
      adminName: admin?.name || 'Admin',
      respondedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
      updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000)
    });
    
    // Complaint 7: Instructor complaint - Pending
    complaints.push({
      _id: new ObjectId(),
      userId: users[2]._id,
      userName: users[2].name || 'User 3',
      userEmail: users[2].email,
      instructorId: instructors[2]._id,
      instructorName: instructors[2].name || 'Instructor 3',
      type: ComplaintType.INSTRUCTOR,
      title: 'Giảng viên sử dụng ngôn ngữ không phù hợp',
      description: 'Trong một số video, giảng viên có sử dụng từ ngữ không chuyên nghiệp và thiếu tôn trọng học viên.',
      status: ComplaintStatus.PENDING,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000)
    });
    
    // Complaint 8: Course complaint - Resolved
    complaints.push({
      _id: new ObjectId(),
      userId: users[3]._id,
      userName: users[3].name || 'User 4',
      userEmail: users[3].email,
      courseId: courses[1]._id,
      courseName: courses[1].title,
      type: ComplaintType.COURSE,
      title: 'Giá khóa học tăng đột ngột',
      description: 'Tôi đang cân nhắc mua khóa học với giá 500k nhưng hôm sau giá tăng lên 800k mà không có thông báo trước.',
      status: ComplaintStatus.RESOLVED,
      adminResponse: 'Chương trình khuyến mãi đã kết thúc. Tuy nhiên, chúng tôi sẽ gửi cho bạn mã giảm giá 30% để bạn có thể mua với giá ưu đãi.',
      adminId: admin?._id,
      adminName: admin?.name || 'Admin',
      respondedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
      updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
    });
    
    // Complaint 9: Course complaint - Pending
    complaints.push({
      _id: new ObjectId(),
      userId: users[4]._id,
      userName: users[4].name || 'User 5',
      userEmail: users[4].email,
      courseId: courses[2]._id,
      courseName: courses[2].title,
      type: ComplaintType.COURSE,
      title: 'Quiz quá khó so với nội dung học',
      description: 'Các câu hỏi trong quiz không liên quan đến nội dung đã học trong video. Nhiều câu hỏi quá khó và không có trong bài giảng.',
      status: ComplaintStatus.PENDING,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    });
    
    // Complaint 10: Instructor complaint - In Progress
    complaints.push({
      _id: new ObjectId(),
      userId: users[4]._id,
      userName: users[4].name || 'User 5',
      userEmail: users[4].email,
      instructorId: instructors[0]._id,
      instructorName: instructors[0].name || 'Instructor 1',
      type: ComplaintType.INSTRUCTOR,
      title: 'Giảng viên cung cấp thông tin sai',
      description: 'Trong bài giảng về JavaScript, giảng viên đã cung cấp một số thông tin không chính xác về cách hoạt động của async/await.',
      status: ComplaintStatus.IN_PROGRESS,
      adminResponse: 'Chúng tôi đang xác minh thông tin với giảng viên và các chuyên gia. Sẽ cập nhật sớm nhất có thể.',
      adminId: admin?._id,
      adminName: admin?.name || 'Admin',
      respondedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000), // 18 hours ago
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
      updatedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000)
    });
    
    // Insert all complaints
    await complaintsCollection.insertMany(complaints);
    console.log(`✅ Đã tạo ${complaints.length} Complaints`);
    
    // Statistics
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === ComplaintStatus.PENDING).length,
      inProgress: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length,
      resolved: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
      rejected: complaints.filter(c => c.status === ComplaintStatus.REJECTED).length,
      byCourse: complaints.filter(c => c.type === ComplaintType.COURSE).length,
      byInstructor: complaints.filter(c => c.type === ComplaintType.INSTRUCTOR).length
    };
    
    // Summary
    console.log('\n📊 Tổng kết:');
    console.log(`   - Tổng số complaints: ${stats.total}`);
    console.log(`   - Pending: ${stats.pending}`);
    console.log(`   - In Progress: ${stats.inProgress}`);
    console.log(`   - Resolved: ${stats.resolved}`);
    console.log(`   - Rejected: ${stats.rejected}`);
    console.log(`   - Khiếu nại về khóa học: ${stats.byCourse}`);
    console.log(`   - Khiếu nại về giảng viên: ${stats.byInstructor}`);
    
    console.log('\n✅ Seed complaints data hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi seed data:', error);
  } finally {
    await client.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Run seed
seedComplaintsData();
