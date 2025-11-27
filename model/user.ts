import { getCollection } from '../config/database';
import { CollectionName } from '../types/common/enums';
import { ObjectId } from 'mongodb';
import { User, UpdateUserProfileRequest, UserQueryParams } from '../types/user/request.js';

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);
    return await collection.findOne({
      _id: new ObjectId(userId)
    });
  } catch (error) {
    console.error('Lỗi get user by id:', error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);
    return await collection.findOne({ email });
  } catch (error) {
    console.error('Lỗi get user by email:', error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updateData: UpdateUserProfileRequest
): Promise<User | null> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);

    const updateFields: any = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(userId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update user profile:', error);
    return null;
  }
};

export const getAllUsers = async (
  queryParams: UserQueryParams = {}
): Promise<{ users: User[]; total: number }> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);

    const {
      page = 1,
      limit = 10,
      search,
      isInstructor,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isInstructor !== undefined) {
      filter.isInstructor = isInstructor;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await collection.countDocuments(filter);

    const users = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return { users, total };
  } catch (error) {
    console.error('Lỗi get all users:', error);
    return { users: [], total: 0 };
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);

    const result = await collection.deleteOne({
      _id: new ObjectId(userId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete user:', error);
    return false;
  }
};

export const addEnrolledCourse = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: { enrolledCourseIds: new ObjectId(courseId) },
        $set: { updatedAt: new Date() }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Lỗi add enrolled course:', error);
    return false;
  }
};

export const updateCourseProgress = async (
  userId: string,
  courseId: string,
  completedLectureId: string
): Promise<boolean> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);

    const user = await getUserById(userId);
    if (!user) return false;

    const progressIndex = user.courseProgress?.findIndex(
      (p) => p.courseId.toString() === courseId
    );

    if (progressIndex !== undefined && progressIndex >= 0) {
      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $addToSet: {
            [`courseProgress.${progressIndex}.completedLectures`]: new ObjectId(completedLectureId)
          },
          $set: {
            [`courseProgress.${progressIndex}.lastAccessedAt`]: new Date(),
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } else {
      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            courseProgress: {
              courseId: new ObjectId(courseId),
              completedLectures: [new ObjectId(completedLectureId)],
              lastAccessedAt: new Date(),
              progress: 0
            }
          },
          $set: { updatedAt: new Date() }
        }
      );
      return result.modifiedCount > 0;
    }
  } catch (error) {
    console.error('Lỗi update course progress:', error);
    return false;
  }
};
