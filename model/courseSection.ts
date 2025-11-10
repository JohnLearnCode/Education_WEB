import { getCollection } from "../config/database";
import { CreateCourseSectionRequest, UpdateCourseSectionRequest, CourseSection } from "../types/courseSection/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Create a new course section
 */
export const createCourseSection = async (sectionData: CreateCourseSectionRequest): Promise<CourseSection | null> => {
  try {
    const collection = getCollection<CourseSection>(CollectionName.COURSE_SECTIONS);

    const newSection = {
      courseId: new ObjectId(sectionData.courseId),
      title: sectionData.title,
      order: sectionData.order,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newSection as unknown as CourseSection);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo course section ở Model:', error);
    return null;
  }
};

/**
 * Get course section by ID
 */
export const getCourseSectionById = async (sectionId: string): Promise<CourseSection | null> => {
  try {
    const collection = getCollection<CourseSection>(CollectionName.COURSE_SECTIONS);
    return await collection.findOne({
      _id: new ObjectId(sectionId)
    });
  } catch (error) {
    console.error('Lỗi get course section by id:', error);
    return null;
  }
};

/**
 * Get sections by course ID
 */
export const getSectionsByCourseId = async (courseId: string): Promise<CourseSection[]> => {
  try {
    const collection = getCollection<CourseSection>(CollectionName.COURSE_SECTIONS);
    return await collection
      .find({ courseId: new ObjectId(courseId) })
      .sort({ order: 1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get sections by course id:', error);
    return [];
  }
};

/**
 * Update course section by ID
 */
export const updateCourseSection = async (
  sectionId: string,
  updateData: UpdateCourseSectionRequest
): Promise<CourseSection | null> => {
  try {
    const collection = getCollection<CourseSection>(CollectionName.COURSE_SECTIONS);

    // Prepare update data
    const updateFields: any = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(sectionId) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(sectionId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update course section:', error);
    return null;
  }
};

/**
 * Delete course section by ID
 */
export const deleteCourseSection = async (sectionId: string): Promise<boolean> => {
  try {
    const collection = getCollection<CourseSection>(CollectionName.COURSE_SECTIONS);

    const result = await collection.deleteOne({
      _id: new ObjectId(sectionId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete course section:', error);
    return false;
  }
};

/**
 * Delete all sections by course ID (when course is deleted)
 */
export const deleteSectionsByCourseId = async (courseId: string): Promise<boolean> => {
  try {
    const collection = getCollection<CourseSection>(CollectionName.COURSE_SECTIONS);

    const result = await collection.deleteMany({
      courseId: new ObjectId(courseId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete sections by course id:', error);
    return false;
  }
};

/**
 * Reorder sections (update order of multiple sections)
 */
export const reorderSections = async (sectionOrders: { sectionId: string; order: number }[]): Promise<boolean> => {
  try {
    const collection = getCollection<CourseSection>(CollectionName.COURSE_SECTIONS);

    const bulkOps = sectionOrders.map(({ sectionId, order }) => ({
      updateOne: {
        filter: { _id: new ObjectId(sectionId) },
        update: { $set: { order, updatedAt: new Date() } }
      }
    }));

    const result = await collection.bulkWrite(bulkOps);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Lỗi reorder sections:', error);
    return false;
  }
};

/**
 * Get next order number for a course
 */
export const getNextOrderNumber = async (courseId: string): Promise<number> => {
  try {
    const collection = getCollection<CourseSection>(CollectionName.COURSE_SECTIONS);
    
    const lastSection = await collection
      .find({ courseId: new ObjectId(courseId) })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    return lastSection.length > 0 ? lastSection[0].order + 1 : 1;
  } catch (error) {
    console.error('Lỗi get next order number:', error);
    return 1;
  }
};
