import { getCollection } from "../config/database";
import { CreateCourseRequest, UpdateCourseRequest, Course, CourseQueryParams } from "../types/course/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Generate slug from title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

/**
 * Create a new course
 */
export const createCourse = async (courseData: CreateCourseRequest, instructorId: string): Promise<Course | null> => {
  try {
    const collection = getCollection<Course>(CollectionName.COURSES);

    const newCourse = {
      title: courseData.title,
      description: courseData.description,
      instructorId: new ObjectId(instructorId),
      price: courseData.price,
      category: courseData.category,
      level: courseData.level,
      rating: 0,
      ratingCount: 0,
      imageUrl: courseData.imageUrl || '',
      slug: generateSlug(courseData.title) + '-' + Date.now(), // Ensure unique slug
      totalDuration: courseData.totalDuration || '0 hours',
      lectureCount: courseData.lectureCount || 0,
      studentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newCourse as unknown as Course);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo khóa học ở Model:', error);
    return null;
  }
};

/**
 * Get course by ID
 */
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const collection = getCollection<Course>(CollectionName.COURSES);
    return await collection.findOne({
      _id: new ObjectId(courseId)
    });
  } catch (error) {
    console.error('Lỗi get course by id:', error);
    return null;
  }
};

/**
 * Get courses by instructor ID
 */
export const getCoursesByInstructorId = async (
  instructorId: string,
  queryParams: CourseQueryParams = {}
): Promise<{ courses: Course[], total: number }> => {
  try {
    const collection = getCollection<Course>(CollectionName.COURSES);
    
    const {
      page = 1,
      limit = 10,
      category,
      level,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = {
      instructorId: new ObjectId(instructorId)
    };

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await collection.countDocuments(filter);

    // Get courses
    const courses = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return { courses, total };
  } catch (error) {
    console.error('Lỗi get courses by instructor id:', error);
    return { courses: [], total: 0 };
  }
};

/**
 * Update course by ID
 */
export const updateCourse = async (
  courseId: string,
  instructorId: string,
  updateData: UpdateCourseRequest
): Promise<Course | null> => {
  try {
    const collection = getCollection<Course>(CollectionName.COURSES);

    // Check if course exists and belongs to instructor
    const existingCourse = await collection.findOne({
      _id: new ObjectId(courseId),
      instructorId: new ObjectId(instructorId)
    });

    if (!existingCourse) {
      return null;
    }

    // Prepare update data
    const updateFields: any = {
      ...updateData,
      updatedAt: new Date()
    };

    // Update slug if title is updated
    if (updateData.title) {
      updateFields.slug = generateSlug(updateData.title) + '-' + Date.now();
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(courseId) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(courseId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update course:', error);
    return null;
  }
};

/**
 * Delete course by ID
 */
export const deleteCourse = async (courseId: string, instructorId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Course>(CollectionName.COURSES);

    // Check if course exists and belongs to instructor
    const existingCourse = await collection.findOne({
      _id: new ObjectId(courseId),
      instructorId: new ObjectId(instructorId)
    });

    if (!existingCourse) {
      return false;
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(courseId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete course:', error);
    return false;
  }
};

/**
 * Get all courses (for public view)
 */
export const getAllCourses = async (
  queryParams: CourseQueryParams = {}
): Promise<{ courses: Course[], total: number }> => {
  try {
    const collection = getCollection<Course>(CollectionName.COURSES);
    
    const {
      page = 1,
      limit = 10,
      category,
      level,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await collection.countDocuments(filter);

    // Get courses
    const courses = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return { courses, total };
  } catch (error) {
    console.error('Lỗi get all courses:', error);
    return { courses: [], total: 0 };
  }
};
