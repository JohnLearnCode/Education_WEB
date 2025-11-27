import { getCollection } from '../config/database';
import { CollectionName } from '../types/common/enums';
import { ObjectId } from 'mongodb';
import {
  InstructorEarnings,
  CreateInstructorEarningsRequest,
  EarningStatus,
  InstructorEarningsQueryParams,
  InstructorEarningsSummary
} from '../types/instructorEarnings/request.js';
import { PLATFORM_FEE_PERCENTAGE } from '../types/instructorEarnings/enums.js';

export const createInstructorEarnings = async (
  data: CreateInstructorEarningsRequest
): Promise<InstructorEarnings | null> => {
  try {
    const collection = getCollection<InstructorEarnings>(CollectionName.INSTRUCTOR_EARNINGS);

    const platformFee = data.amount * PLATFORM_FEE_PERCENTAGE;
    const netEarning = data.amount - platformFee;

    const newEarning = {
      instructorId: new ObjectId(data.instructorId),
      courseId: new ObjectId(data.courseId),
      orderId: new ObjectId(data.orderId),
      amount: data.amount,
      platformFee,
      netEarning,
      status: EarningStatus.PENDING,
      createdAt: new Date()
    };

    const result = await collection.insertOne(newEarning as unknown as InstructorEarnings);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo instructor earnings:', error);
    return null;
  }
};

export const getEarningById = async (earningId: string): Promise<InstructorEarnings | null> => {
  try {
    const collection = getCollection<InstructorEarnings>(CollectionName.INSTRUCTOR_EARNINGS);
    return await collection.findOne({
      _id: new ObjectId(earningId)
    });
  } catch (error) {
    console.error('Lỗi get earning by id:', error);
    return null;
  }
};

export const getEarningByOrderId = async (orderId: string): Promise<InstructorEarnings | null> => {
  try {
    const collection = getCollection<InstructorEarnings>(CollectionName.INSTRUCTOR_EARNINGS);
    return await collection.findOne({
      orderId: new ObjectId(orderId)
    });
  } catch (error) {
    console.error('Lỗi get earning by order id:', error);
    return null;
  }
};

export const getEarningsByInstructor = async (
  instructorId: string,
  queryParams: InstructorEarningsQueryParams = {}
): Promise<{ earnings: InstructorEarnings[]; total: number }> => {
  try {
    const collection = getCollection<InstructorEarnings>(CollectionName.INSTRUCTOR_EARNINGS);

    const {
      page = 1,
      limit = 10,
      courseId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    const skip = (page - 1) * limit;

    const filter: any = {
      instructorId: new ObjectId(instructorId)
    };

    if (courseId) {
      filter.courseId = new ObjectId(courseId);
    }

    if (status) {
      filter.status = status;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await collection.countDocuments(filter);

    const earnings = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return { earnings, total };
  } catch (error) {
    console.error('Lỗi get earnings by instructor:', error);
    return { earnings: [], total: 0 };
  }
};

export const updateEarningStatus = async (
  earningId: string,
  status: EarningStatus
): Promise<InstructorEarnings | null> => {
  try {
    const collection = getCollection<InstructorEarnings>(CollectionName.INSTRUCTOR_EARNINGS);

    const updateFields: any = { status };

    if (status === EarningStatus.PAID) {
      updateFields.paidAt = new Date();
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(earningId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    return result || null;
  } catch (error) {
    console.error('Lỗi update earning status:', error);
    return null;
  }
};

export const getInstructorEarningsSummary = async (
  instructorId: string
): Promise<InstructorEarningsSummary> => {
  try {
    const collection = getCollection<InstructorEarnings>(CollectionName.INSTRUCTOR_EARNINGS);

    const pipeline = [
      {
        $match: { instructorId: new ObjectId(instructorId) }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          totalPlatformFee: { $sum: '$platformFee' },
          totalNetEarning: { $sum: '$netEarning' },
          pendingEarnings: {
            $sum: {
              $cond: [{ $eq: ['$status', EarningStatus.PENDING] }, '$netEarning', 0]
            }
          },
          paidEarnings: {
            $sum: {
              $cond: [{ $eq: ['$status', EarningStatus.PAID] }, '$netEarning', 0]
            }
          },
          earningsCount: { $sum: 1 }
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();

    if (result.length > 0) {
      return {
        totalEarnings: result[0].totalEarnings || 0,
        totalPlatformFee: result[0].totalPlatformFee || 0,
        totalNetEarning: result[0].totalNetEarning || 0,
        pendingEarnings: result[0].pendingEarnings || 0,
        paidEarnings: result[0].paidEarnings || 0,
        earningsCount: result[0].earningsCount || 0
      };
    }

    return {
      totalEarnings: 0,
      totalPlatformFee: 0,
      totalNetEarning: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      earningsCount: 0
    };
  } catch (error) {
    console.error('Lỗi get instructor earnings summary:', error);
    return {
      totalEarnings: 0,
      totalPlatformFee: 0,
      totalNetEarning: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      earningsCount: 0
    };
  }
};

export const deleteEarning = async (earningId: string): Promise<boolean> => {
  try {
    const collection = getCollection<InstructorEarnings>(CollectionName.INSTRUCTOR_EARNINGS);

    const result = await collection.deleteOne({
      _id: new ObjectId(earningId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete earning:', error);
    return false;
  }
};
