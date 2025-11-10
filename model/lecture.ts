import { getCollection } from "../config/database";
import { CreateLectureRequest, UpdateLectureRequest, Lecture } from "../types/lecture/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Create a new lecture
 */
export const createLecture = async (lectureData: CreateLectureRequest): Promise<Lecture | null> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);

    const newLecture = {
      sectionId: new ObjectId(lectureData.sectionId),
      courseId: new ObjectId(lectureData.courseId),
      title: lectureData.title,
      duration: lectureData.duration,
      type: lectureData.type,
      videoUrl: lectureData.videoUrl || '',
      textContent: lectureData.textContent || '',
      attachmentUrl: lectureData.attachmentUrl || '',
      order: lectureData.order,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newLecture as unknown as Lecture);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo lecture ở Model:', error);
    return null;
  }
};

/**
 * Get lecture by ID
 */
export const getLectureById = async (lectureId: string): Promise<Lecture | null> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);
    return await collection.findOne({
      _id: new ObjectId(lectureId)
    });
  } catch (error) {
    console.error('Lỗi get lecture by id:', error);
    return null;
  }
};

/**
 * Get lectures by section ID
 */
export const getLecturesBySectionId = async (sectionId: string): Promise<Lecture[]> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);
    return await collection
      .find({ sectionId: new ObjectId(sectionId) })
      .sort({ order: 1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get lectures by section id:', error);
    return [];
  }
};

/**
 * Get lectures by course ID
 */
export const getLecturesByCourseId = async (courseId: string): Promise<Lecture[]> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);
    return await collection
      .find({ courseId: new ObjectId(courseId) })
      .sort({ order: 1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get lectures by course id:', error);
    return [];
  }
};

/**
 * Update lecture by ID
 */
export const updateLecture = async (
  lectureId: string,
  updateData: UpdateLectureRequest
): Promise<Lecture | null> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);

    // Prepare update data
    const updateFields: any = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(lectureId) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(lectureId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update lecture:', error);
    return null;
  }
};

/**
 * Delete lecture by ID
 */
export const deleteLecture = async (lectureId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);

    const result = await collection.deleteOne({
      _id: new ObjectId(lectureId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete lecture:', error);
    return false;
  }
};

/**
 * Delete all lectures by section ID (when section is deleted)
 */
export const deleteLecturesBySectionId = async (sectionId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);

    const result = await collection.deleteMany({
      sectionId: new ObjectId(sectionId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete lectures by section id:', error);
    return false;
  }
};

/**
 * Delete all lectures by course ID (when course is deleted)
 */
export const deleteLecturesByCourseId = async (courseId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);

    const result = await collection.deleteMany({
      courseId: new ObjectId(courseId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete lectures by course id:', error);
    return false;
  }
};

/**
 * Reorder lectures (update order of multiple lectures)
 */
export const reorderLectures = async (lectureOrders: { lectureId: string; order: number }[]): Promise<boolean> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);

    const bulkOps = lectureOrders.map(({ lectureId, order }) => ({
      updateOne: {
        filter: { _id: new ObjectId(lectureId) },
        update: { $set: { order, updatedAt: new Date() } }
      }
    }));

    const result = await collection.bulkWrite(bulkOps);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Lỗi reorder lectures:', error);
    return false;
  }
};

/**
 * Get next order number for a section
 */
export const getNextOrderNumber = async (sectionId: string): Promise<number> => {
  try {
    const collection = getCollection<Lecture>(CollectionName.LECTURES);
    
    const lastLecture = await collection
      .find({ sectionId: new ObjectId(sectionId) })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    return lastLecture.length > 0 ? lastLecture[0].order + 1 : 1;
  } catch (error) {
    console.error('Lỗi get next order number:', error);
    return 1;
  }
};
