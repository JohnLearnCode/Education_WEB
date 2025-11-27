import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { NotFoundError } from '../errors/AppError';

interface GetUsersParams {
  page: number;
  limit: number;
  search: string;
  role: string;
}

export const adminUsersService = {
  /**
   * Get all users with pagination and filters
   */
  getAllUsers: async (params: GetUsersParams) => {
    const { page, limit, search, role } = params;
    const skip = (page - 1) * limit;

    const usersCollection = getCollection('users');

    // Build filter query
    const filter: any = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (role !== 'all') {
      if (role === 'admin') {
        filter.isAdmin = true;
      } else if (role === 'instructor') {
        filter.isInstructor = true;
        filter.isAdmin = { $ne: true };
      } else if (role === 'student') {
        filter.isInstructor = { $ne: true };
        filter.isAdmin = { $ne: true };
      }
    }

    // Get total count
    const total = await usersCollection.countDocuments(filter);

    // Get users
    const users = await usersCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({ password: 0 }) // Exclude password
      .toArray();

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string) => {
    const usersCollection = getCollection('users');
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  /**
   * Update user role
   */
  updateUserRole: async (
    userId: string,
    roleData: { isInstructor?: boolean; isAdmin?: boolean }
  ) => {
    const usersCollection = getCollection('users');

    const updateData: any = {};
    if (roleData.isInstructor !== undefined) {
      updateData.isInstructor = roleData.isInstructor;
    }
    if (roleData.isAdmin !== undefined) {
      updateData.isAdmin = roleData.isAdmin;
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result) {
      throw new NotFoundError('User not found');
    }

    return result;
  },

  /**
   * Toggle user status (active/inactive)
   */
  toggleUserStatus: async (userId: string, isActive: boolean) => {
    const usersCollection = getCollection('users');

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { isActive } },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result) {
      throw new NotFoundError('User not found');
    }

    return result;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string) => {
    const usersCollection = getCollection('users');

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError('User not found');
    }

    return true;
  },

  /**
   * Get user statistics
   */
  getUsersStats: async () => {
    const usersCollection = getCollection('users');

    const [totalUsers, totalStudents, totalInstructors, totalAdmins] = await Promise.all([
      usersCollection.countDocuments({}),
      usersCollection.countDocuments({ isInstructor: { $ne: true }, isAdmin: { $ne: true } }),
      usersCollection.countDocuments({ isInstructor: true }),
      usersCollection.countDocuments({ isAdmin: true }),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
    };
  },
};
