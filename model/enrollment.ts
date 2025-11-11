import { getCollection } from "../config/database";
import { Enrollment } from "../types/enrollment/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Create a new enrollment
 */
export const createEnrollment = async (enrollmentData: {
  userId: string;
  courseId: string;
}): Promise<Enrollment | null> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);

    const now = new Date();
    const newEnrollment = {
      userId: new ObjectId(enrollmentData.userId),
      courseId: new ObjectId(enrollmentData.courseId),
      enrolledAt: now,
      progress: 0,
      lastAccessedAt: now,
      completedLectures: []
    };

    const result = await collection.insertOne(newEnrollment as unknown as Enrollment);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo enrollment ở Model:', error);
    return null;
  }
};

/**
 * Get enrollment by ID
 */
export const getEnrollmentById = async (enrollmentId: string): Promise<Enrollment | null> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);
    return await collection.findOne({
      _id: new ObjectId(enrollmentId)
    });
  } catch (error) {
    console.error('Lỗi get enrollment by id:', error);
    return null;
  }
};

/**
 * Get enrollment by user and course
 */
export const getEnrollmentByUserAndCourse = async (
  userId: string,
  courseId: string
): Promise<Enrollment | null> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);
    return await collection.findOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId)
    });
  } catch (error) {
    console.error('Lỗi get enrollment by user and course:', error);
    return null;
  }
};

/**
 * Get all enrollments by user
 */
export const getEnrollmentsByUserId = async (userId: string): Promise<Enrollment[]> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);
    return await collection
      .find({ userId: new ObjectId(userId) })
      .sort({ enrolledAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get enrollments by user id:', error);
    return [];
  }
};

/**
 * Get all enrollments for a course (for instructors)
 */
export const getEnrollmentsByCourseId = async (courseId: string): Promise<Enrollment[]> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);
    return await collection
      .find({ courseId: new ObjectId(courseId) })
      .sort({ enrolledAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get enrollments by course id:', error);
    return [];
  }
};

/**
 * Update enrollment progress
 */
export const updateEnrollmentProgress = async (
  enrollmentId: string,
  updateData: {
    progress: number;
    completedLectures: string[];
    completedAt?: Date;
  }
): Promise<Enrollment | null> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);

    const updateFields: any = {
      progress: updateData.progress,
      completedLectures: updateData.completedLectures,
      lastAccessedAt: new Date()
    };

    if (updateData.completedAt) {
      updateFields.completedAt = updateData.completedAt;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(enrollmentId) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(enrollmentId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update enrollment progress:', error);
    return null;
  }
};

/**
 * Update last accessed time
 */
export const updateLastAccessedAt = async (enrollmentId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);

    const result = await collection.updateOne(
      { _id: new ObjectId(enrollmentId) },
      { $set: { lastAccessedAt: new Date() } }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Lỗi update last accessed at:', error);
    return false;
  }
};

/**
 * Add completed lecture
 */
export const addCompletedLecture = async (
  enrollmentId: string,
  lectureId: string
): Promise<Enrollment | null> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);

    const result = await collection.updateOne(
      { _id: new ObjectId(enrollmentId) },
      {
        $addToSet: { completedLectures: lectureId },
        $set: { lastAccessedAt: new Date() }
      }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(enrollmentId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi add completed lecture:', error);
    return null;
  }
};

/**
 * Count enrollments for a course
 */
export const countEnrollmentsByCourse = async (courseId: string): Promise<number> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);
    return await collection.countDocuments({
      courseId: new ObjectId(courseId)
    });
  } catch (error) {
    console.error('Lỗi count enrollments:', error);
    return 0;
  }
};

/**
 * Get completed enrollments by user
 */
export const getCompletedEnrollmentsByUser = async (userId: string): Promise<Enrollment[]> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);
    return await collection
      .find({
        userId: new ObjectId(userId),
        completedAt: { $exists: true }
      })
      .sort({ completedAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get completed enrollments:', error);
    return [];
  }
};

/**
 * Delete enrollment
 */
export const deleteEnrollment = async (enrollmentId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);

    const result = await collection.deleteOne({
      _id: new ObjectId(enrollmentId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete enrollment:', error);
    return false;
  }
};

/**
 * Delete all enrollments by course ID (when course is deleted)
 */
export const deleteEnrollmentsByCourseId = async (courseId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Enrollment>(CollectionName.ENROLLMENTS);

    const result = await collection.deleteMany({
      courseId: new ObjectId(courseId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete enrollments by course id:', error);
    return false;
  }
};
