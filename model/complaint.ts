import { getCollection } from '../config/database';
import { CollectionName } from '../types/common/enums';
import { ObjectId } from 'mongodb';
import {
  Complaint,
  CreateComplaintRequest,
  UpdateComplaintRequest,
  AdminUpdateComplaintRequest,
  ComplaintQueryParams,
  ComplaintStatus,
  ComplaintType,
  ComplaintStats
} from '../types/complaint/request';
import { getUserById } from './user';
import { getCourseById } from './course';

/**
 * Create a new complaint
 */
export const createComplaint = async (
  complaintData: CreateComplaintRequest,
  userId: string
): Promise<Complaint | null> => {
  try {
    const collection = getCollection<Complaint>(CollectionName.COMPLAINTS);

    // Validate that either courseId or instructorId is provided
    if (!complaintData.courseId && !complaintData.instructorId) {
      throw new Error('Either courseId or instructorId must be provided');
    }

    if (complaintData.courseId && complaintData.instructorId) {
      throw new Error('Cannot complain about both course and instructor at the same time');
    }

    // Get user info for denormalization
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newComplaint: any = {
      userId: new ObjectId(userId),
      userName: user.name,
      userEmail: user.email,
      title: complaintData.title,
      description: complaintData.description,
      status: ComplaintStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Handle course complaint
    if (complaintData.courseId) {
      const course = await getCourseById(complaintData.courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      newComplaint.courseId = new ObjectId(complaintData.courseId);
      newComplaint.courseName = course.title;
      newComplaint.type = ComplaintType.COURSE;
    }

    // Handle instructor complaint
    if (complaintData.instructorId) {
      const instructor = await getUserById(complaintData.instructorId);
      if (!instructor) {
        throw new Error('Instructor not found');
      }
      newComplaint.instructorId = new ObjectId(complaintData.instructorId);
      newComplaint.instructorName = instructor.name;
      newComplaint.type = ComplaintType.INSTRUCTOR;
    }

    const result = await collection.insertOne(newComplaint as Complaint);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo khiếu nại:', error);
    throw error;
  }
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (complaintId: string): Promise<Complaint | null> => {
  try {
    const collection = getCollection<Complaint>(CollectionName.COMPLAINTS);
    return await collection.findOne({
      _id: new ObjectId(complaintId)
    });
  } catch (error) {
    console.error('Lỗi get complaint by id:', error);
    return null;
  }
};

/**
 * Get all complaints by user ID
 */
export const getComplaintsByUserId = async (
  userId: string,
  queryParams: ComplaintQueryParams = {}
): Promise<{ complaints: Complaint[]; total: number }> => {
  try {
    const collection = getCollection<Complaint>(CollectionName.COMPLAINTS);

    const {
      page = 1,
      limit = 10,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {
      userId: new ObjectId(userId)
    };

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await collection.countDocuments(filter);

    const complaints = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    return { complaints, total };
  } catch (error) {
    console.error('Lỗi get complaints by user id:', error);
    return { complaints: [], total: 0 };
  }
};

/**
 * Get all complaints (Admin)
 */
export const getAllComplaints = async (
  queryParams: ComplaintQueryParams = {}
): Promise<{ complaints: Complaint[]; total: number }> => {
  try {
    const collection = getCollection<Complaint>(CollectionName.COMPLAINTS);

    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await collection.countDocuments(filter);

    const complaints = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    return { complaints, total };
  } catch (error) {
    console.error('Lỗi get all complaints:', error);
    return { complaints: [], total: 0 };
  }
};

/**
 * Update complaint (User)
 */
export const updateComplaint = async (
  complaintId: string,
  userId: string,
  updateData: UpdateComplaintRequest
): Promise<Complaint | null> => {
  try {
    const collection = getCollection<Complaint>(CollectionName.COMPLAINTS);

    // Check if complaint exists and belongs to user
    const existingComplaint = await collection.findOne({
      _id: new ObjectId(complaintId),
      userId: new ObjectId(userId)
    });

    if (!existingComplaint) {
      return null;
    }

    // Only allow updates if complaint is still pending
    if (existingComplaint.status !== ComplaintStatus.PENDING) {
      throw new Error('Cannot update complaint that is not pending');
    }

    const updateFields: any = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(complaintId) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(complaintId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update complaint:', error);
    throw error;
  }
};

/**
 * Update complaint by admin
 */
export const adminUpdateComplaint = async (
  complaintId: string,
  adminId: string,
  updateData: AdminUpdateComplaintRequest
): Promise<Complaint | null> => {
  try {
    const collection = getCollection<Complaint>(CollectionName.COMPLAINTS);

    const existingComplaint = await getComplaintById(complaintId);
    if (!existingComplaint) {
      return null;
    }

    const admin = await getUserById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    const updateFields: any = {
      ...updateData,
      updatedAt: new Date()
    };

    // If admin is responding, add admin info
    if (updateData.adminResponse) {
      updateFields.adminId = new ObjectId(adminId);
      updateFields.adminName = admin.name;
      updateFields.respondedAt = new Date();
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(complaintId) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(complaintId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi admin update complaint:', error);
    throw error;
  }
};

/**
 * Delete complaint
 */
export const deleteComplaint = async (
  complaintId: string,
  userId: string
): Promise<boolean> => {
  try {
    const collection = getCollection<Complaint>(CollectionName.COMPLAINTS);

    // Check if complaint exists and belongs to user
    const existingComplaint = await collection.findOne({
      _id: new ObjectId(complaintId),
      userId: new ObjectId(userId)
    });

    if (!existingComplaint) {
      return false;
    }

    // Only allow deletion if complaint is still pending
    if (existingComplaint.status !== ComplaintStatus.PENDING) {
      throw new Error('Cannot delete complaint that is not pending');
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(complaintId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete complaint:', error);
    throw error;
  }
};

/**
 * Admin delete complaint
 */
export const adminDeleteComplaint = async (complaintId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Complaint>(CollectionName.COMPLAINTS);

    const result = await collection.deleteOne({
      _id: new ObjectId(complaintId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi admin delete complaint:', error);
    return false;
  }
};

/**
 * Get complaint statistics
 */
export const getComplaintStats = async (): Promise<ComplaintStats> => {
  try {
    const collection = getCollection<Complaint>(CollectionName.COMPLAINTS);

    const total = await collection.countDocuments({});
    const pending = await collection.countDocuments({ status: ComplaintStatus.PENDING });
    const inProgress = await collection.countDocuments({ status: ComplaintStatus.IN_PROGRESS });
    const resolved = await collection.countDocuments({ status: ComplaintStatus.RESOLVED });
    const rejected = await collection.countDocuments({ status: ComplaintStatus.REJECTED });
    const byCourse = await collection.countDocuments({ type: ComplaintType.COURSE });
    const byInstructor = await collection.countDocuments({ type: ComplaintType.INSTRUCTOR });

    return {
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      byCourse,
      byInstructor
    };
  } catch (error) {
    console.error('Lỗi get complaint stats:', error);
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
      byCourse: 0,
      byInstructor: 0
    };
  }
};
