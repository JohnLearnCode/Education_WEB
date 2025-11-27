import { EnrollmentResponse, ProgressSummary } from "../types/enrollment/request";
import * as enrollmentModel from '../model/enrollment.js';
import * as courseModel from '../model/course.js';
import * as courseService from './course.js';
import * as lectureModel from '../model/lecture.js';
import * as userModel from '../model/user.js';
import { EnrollmentMessage } from '../types/enrollment/enums.js';

/**
 * Enroll in a course
 */
export const enrollCourse = async (
  courseId: string,
  userId: string
): Promise<EnrollmentResponse> => {
  // Check if course exists
  const course = await courseModel.getCourseById(courseId);
  if (!course) {
    throw new Error(EnrollmentMessage.COURSE_NOT_FOUND);
  }

  // Check if already enrolled
  const existingEnrollment = await enrollmentModel.getEnrollmentByUserAndCourse(userId, courseId);
  if (existingEnrollment) {
    throw new Error(EnrollmentMessage.ALREADY_ENROLLED);
  }

  // Create enrollment
  const enrollment = await enrollmentModel.createEnrollment({
    userId,
    courseId
  });

  if (!enrollment) {
    throw new Error(EnrollmentMessage.FAIL_ENROLL);
  }

  // Add courseId to user's enrolledCourseIds
  await userModel.addEnrolledCourse(userId, courseId);

  // Convert ObjectId to string for response
  const response: EnrollmentResponse = {
    ...enrollment,
    userId: enrollment.userId.toString(),
    courseId: enrollment.courseId.toString()
  };

  return response;
};

/**
 * Get enrollment by ID
 */
export const getEnrollmentById = async (
  enrollmentId: string,
  userId: string
): Promise<EnrollmentResponse> => {
  const enrollment = await enrollmentModel.getEnrollmentById(enrollmentId);
  
  if (!enrollment) {
    throw new Error(EnrollmentMessage.ENROLLMENT_NOT_FOUND);
  }

  // Verify that the enrollment belongs to the user
  if (enrollment.userId.toString() !== userId) {
    throw new Error('Bạn không có quyền xem thông tin đăng ký này');
  }

  // Convert ObjectId to string for response
  const response: EnrollmentResponse = {
    ...enrollment,
    userId: enrollment.userId.toString(),
    courseId: enrollment.courseId.toString()
  };

  return response;
};

/**
 * Get all enrollments by user
 */
export const getEnrollmentsByUserId = async (userId: string): Promise<EnrollmentResponse[]> => {
  const enrollments = await enrollmentModel.getEnrollmentsByUserId(userId);

  // Convert ObjectId to string for each enrollment
  const responseEnrollments: EnrollmentResponse[] = enrollments.map(enrollment => ({
    ...enrollment,
    userId: enrollment.userId.toString(),
    courseId: enrollment.courseId.toString()
  }));

  return responseEnrollments;
};

/**
 * Get all enrolled courses with course details by user
 */
export const getEnrolledCoursesWithDetails = async (userId: string): Promise<any[]> => {
  const enrollments = await enrollmentModel.getEnrollmentsByUserId(userId);

  // Get course details for each enrollment
  const enrolledCoursesWithDetails = await Promise.all(
    enrollments.map(async (enrollment) => {
      try {
        // Use courseService to get full course details with instructor info
        const course = await courseService.getCourseById(enrollment.courseId.toString());
        
        return {
          enrollmentId: enrollment._id?.toString(),
          courseId: enrollment.courseId.toString(),
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt,
          completedAt: enrollment.completedAt,
          completedLectures: enrollment.completedLectures,
          course: {
            _id: course._id?.toString(),
            title: course.title,
            description: course.description,
            imageUrl: course.imageUrl,
            price: course.price,
            level: course.level,
            rating: course.rating,
            ratingCount: course.ratingCount,
            studentCount: course.studentCount,
            totalDuration: course.totalDuration,
            lectureCount: course.lectureCount,
            instructor: course.instructor,
            slug: course.slug
          }
        };
      } catch (error) {
        // If course not found, return null
        console.error('Error fetching course details:', error);
        return null;
      }
    })
  );

  // Filter out null values (courses that were not found)
  return enrolledCoursesWithDetails.filter(item => item !== null);
};

/**
 * Get enrollment by user and course
 */
export const getEnrollmentByUserAndCourse = async (
  userId: string,
  courseId: string
): Promise<EnrollmentResponse | null> => {
  const enrollment = await enrollmentModel.getEnrollmentByUserAndCourse(userId, courseId);

  if (!enrollment) {
    return null;
  }

  // Convert ObjectId to string for response
  const response: EnrollmentResponse = {
    ...enrollment,
    userId: enrollment.userId.toString(),
    courseId: enrollment.courseId.toString()
  };

  return response;
};

/**
 * Mark lecture as completed and update progress
 */
export const markLectureCompleted = async (
  lectureId: string,
  userId: string
): Promise<ProgressSummary> => {
  // Get lecture details
  const lecture = await lectureModel.getLectureById(lectureId);
  if (!lecture) {
    throw new Error('Không tìm thấy bài học');
  }

  const courseId = lecture.courseId.toString();

  // Get enrollment
  const enrollment = await enrollmentModel.getEnrollmentByUserAndCourse(userId, courseId);
  if (!enrollment) {
    throw new Error('Bạn chưa đăng ký khóa học này');
  }

  // Check if lecture already completed
  if (enrollment.completedLectures.includes(lectureId)) {
    // Already completed, just return current progress
    return await getProgressSummary(enrollment._id!.toString(), userId);
  }

  // Add lecture to completed list
  const updatedCompletedLectures = [...enrollment.completedLectures, lectureId];

  // Get total lectures in course
  const allLectures = await lectureModel.getLecturesByCourseId(courseId);
  const totalLectures = allLectures.length;

  // Calculate progress
  const progress = totalLectures > 0 
    ? Math.round((updatedCompletedLectures.length / totalLectures) * 100) 
    : 0;

  // Check if course is completed
  const isCompleted = progress === 100;
  const completedAt = isCompleted ? new Date() : undefined;

  // Update enrollment
  const updatedEnrollment = await enrollmentModel.updateEnrollmentProgress(
    enrollment._id!.toString(),
    {
      progress,
      completedLectures: updatedCompletedLectures,
      completedAt
    }
  );

  if (!updatedEnrollment) {
    throw new Error(EnrollmentMessage.FAIL_UPDATE_PROGRESS);
  }

  // Return progress summary
  const progressSummary: ProgressSummary = {
    enrollmentId: updatedEnrollment._id!.toString(),
    courseId: updatedEnrollment.courseId.toString(),
    progress,
    totalLectures,
    completedLectures: updatedCompletedLectures.length,
    isCompleted,
    enrolledAt: updatedEnrollment.enrolledAt,
    lastAccessedAt: updatedEnrollment.lastAccessedAt,
    completedAt: updatedEnrollment.completedAt
  };

  return progressSummary;
};

/**
 * Get progress summary for an enrollment
 */
export const getProgressSummary = async (
  enrollmentId: string,
  userId: string
): Promise<ProgressSummary> => {
  const enrollment = await enrollmentModel.getEnrollmentById(enrollmentId);
  
  if (!enrollment) {
    throw new Error(EnrollmentMessage.ENROLLMENT_NOT_FOUND);
  }

  // Verify that the enrollment belongs to the user
  if (enrollment.userId.toString() !== userId) {
    throw new Error('Bạn không có quyền xem thông tin đăng ký này');
  }

  // Get total lectures in course
  const allLectures = await lectureModel.getLecturesByCourseId(enrollment.courseId.toString());
  const totalLectures = allLectures.length;

  const progressSummary: ProgressSummary = {
    enrollmentId: enrollment._id!.toString(),
    courseId: enrollment.courseId.toString(),
    progress: enrollment.progress,
    totalLectures,
    completedLectures: enrollment.completedLectures.length,
    isCompleted: enrollment.progress === 100,
    enrolledAt: enrollment.enrolledAt,
    lastAccessedAt: enrollment.lastAccessedAt,
    completedAt: enrollment.completedAt
  };

  return progressSummary;
};

/**
 * Get all enrollments for a course (for instructors)
 */
export const getEnrollmentsByCourseId = async (
  courseId: string,
  instructorId: string
): Promise<EnrollmentResponse[]> => {
  // Verify course exists and instructor owns it
  const course = await courseModel.getCourseById(courseId);
  if (!course) {
    throw new Error(EnrollmentMessage.COURSE_NOT_FOUND);
  }

  if (course.instructorId.toString() !== instructorId) {
    throw new Error('Bạn không có quyền xem danh sách học viên của khóa học này');
  }

  const enrollments = await enrollmentModel.getEnrollmentsByCourseId(courseId);

  // Convert ObjectId to string for each enrollment
  const responseEnrollments: EnrollmentResponse[] = enrollments.map(enrollment => ({
    ...enrollment,
    userId: enrollment.userId.toString(),
    courseId: enrollment.courseId.toString()
  }));

  return responseEnrollments;
};

/**
 * Get completed courses by user
 */
export const getCompletedCoursesByUser = async (userId: string): Promise<EnrollmentResponse[]> => {
  const enrollments = await enrollmentModel.getCompletedEnrollmentsByUser(userId);

  // Convert ObjectId to string for each enrollment
  const responseEnrollments: EnrollmentResponse[] = enrollments.map(enrollment => ({
    ...enrollment,
    userId: enrollment.userId.toString(),
    courseId: enrollment.courseId.toString()
  }));

  return responseEnrollments;
};

/**
 * Update last accessed time
 */
export const updateLastAccessedAt = async (
  courseId: string,
  userId: string
): Promise<boolean> => {
  const enrollment = await enrollmentModel.getEnrollmentByUserAndCourse(userId, courseId);
  
  if (!enrollment) {
    return false;
  }

  return await enrollmentModel.updateLastAccessedAt(enrollment._id!.toString());
};

/**
 * Delete enrollment (unenroll)
 */
export const deleteEnrollment = async (
  enrollmentId: string,
  userId: string
): Promise<boolean> => {
  const enrollment = await enrollmentModel.getEnrollmentById(enrollmentId);
  
  if (!enrollment) {
    throw new Error(EnrollmentMessage.ENROLLMENT_NOT_FOUND);
  }

  // Verify that the enrollment belongs to the user
  if (enrollment.userId.toString() !== userId) {
    throw new Error('Bạn không có quyền hủy đăng ký này');
  }

  const success = await enrollmentModel.deleteEnrollment(enrollmentId);
  
  if (!success) {
    throw new Error('Hủy đăng ký thất bại');
  }

  return true;
};
