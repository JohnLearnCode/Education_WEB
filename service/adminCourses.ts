import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { NotFoundError } from '../errors/AppError';

interface GetCoursesParams {
  page: number;
  limit: number;
  search: string;
  status: string;
  category: string;
}

export const adminCoursesService = {
  /**
   * Get all courses with pagination and filters
   */
  getAllCourses: async (params: GetCoursesParams) => {
    const { page, limit, search, status, category } = params;
    const skip = (page - 1) * limit;

    const coursesCollection = getCollection('courses');

    // Build filter query
    const filter: any = {};

    // Search by title
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Filter by status
    if (status !== 'all') {
      filter.status = status;
    }

    // Filter by category
    if (category !== 'all') {
      filter.categoryId = new ObjectId(category);
    }

    // Get total count
    const total = await coursesCollection.countDocuments(filter);

    // Get courses with instructor info
    const courses = await coursesCollection
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'instructorId',
            foreignField: '_id',
            as: 'instructor',
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $addFields: {
            instructorName: { $arrayElemAt: ['$instructor.name', 0] },
            categoryName: { $arrayElemAt: ['$category.name', 0] },
            studentCount: { $size: '$enrollments' },
          },
        },
        {
          $project: {
            instructor: 0,
            category: 0,
            enrollments: 0,
          },
        },
      ])
      .toArray();

    return {
      courses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get course by ID
   */
  getCourseById: async (courseId: string) => {
    const coursesCollection = getCollection('courses');
    
    const courses = await coursesCollection
      .aggregate([
        { $match: { _id: new ObjectId(courseId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'instructorId',
            foreignField: '_id',
            as: 'instructor',
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $addFields: {
            instructorName: { $arrayElemAt: ['$instructor.name', 0] },
            categoryName: { $arrayElemAt: ['$category.name', 0] },
            studentCount: { $size: '$enrollments' },
          },
        },
      ])
      .toArray();

    if (!courses || courses.length === 0) {
      throw new NotFoundError('Course not found');
    }

    return courses[0];
  },

  /**
   * Update course status
   */
  updateCourseStatus: async (courseId: string, status: string) => {
    const coursesCollection = getCollection('courses');

    const result = await coursesCollection.findOneAndUpdate(
      { _id: new ObjectId(courseId) },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new NotFoundError('Course not found');
    }

    return result;
  },

  /**
   * Delete course
   */
  deleteCourse: async (courseId: string) => {
    const coursesCollection = getCollection('courses');

    const result = await coursesCollection.deleteOne({
      _id: new ObjectId(courseId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Course not found');
    }

    return true;
  },

  /**
   * Get courses statistics
   */
  getCoursesStats: async () => {
    const coursesCollection = getCollection('courses');
    const enrollmentsCollection = getCollection('enrollments');

    const [totalCourses, publishedCourses, pendingCourses, totalStudents] = await Promise.all([
      coursesCollection.countDocuments({}),
      coursesCollection.countDocuments({ status: 'published' }),
      coursesCollection.countDocuments({ status: 'pending' }),
      enrollmentsCollection.countDocuments({}),
    ]);

    return {
      totalCourses,
      publishedCourses,
      pendingCourses,
      totalStudents,
    };
  },
};
