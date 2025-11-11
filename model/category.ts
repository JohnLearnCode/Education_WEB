import { getCollection } from "../config/database";
import { Category } from "../types/category/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Create a new category
 */
export const createCategory = async (categoryData: {
  name: string;
  description: string;
}): Promise<Category | null> => {
  try {
    const collection = getCollection<Category>(CollectionName.CATEGORIES);

    const now = new Date();
    const newCategory = {
      name: categoryData.name,
      description: categoryData.description,
      courseCount: 0,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newCategory as unknown as Category);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo category ở Model:', error);
    return null;
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    const collection = getCollection<Category>(CollectionName.CATEGORIES);
    return await collection.findOne({
      _id: new ObjectId(categoryId)
    });
  } catch (error) {
    console.error('Lỗi get category by id:', error);
    return null;
  }
};

/**
 * Get category by name
 */
export const getCategoryByName = async (name: string): Promise<Category | null> => {
  try {
    const collection = getCollection<Category>(CollectionName.CATEGORIES);
    return await collection.findOne({ name });
  } catch (error) {
    console.error('Lỗi get category by name:', error);
    return null;
  }
};

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const collection = getCollection<Category>(CollectionName.CATEGORIES);
    return await collection
      .find({})
      .sort({ name: 1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get all categories:', error);
    return [];
  }
};

/**
 * Update category
 */
export const updateCategory = async (
  categoryId: string,
  updateData: {
    name?: string;
    description?: string;
  }
): Promise<Category | null> => {
  try {
    const collection = getCollection<Category>(CollectionName.CATEGORIES);

    const result = await collection.updateOne(
      { _id: new ObjectId(categoryId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(categoryId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update category:', error);
    return null;
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Category>(CollectionName.CATEGORIES);

    const result = await collection.deleteOne({
      _id: new ObjectId(categoryId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi delete category:', error);
    return false;
  }
};

/**
 * Increment course count
 */
export const incrementCourseCount = async (categoryId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Category>(CollectionName.CATEGORIES);

    const result = await collection.updateOne(
      { _id: new ObjectId(categoryId) },
      {
        $inc: { courseCount: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Lỗi increment course count:', error);
    return false;
  }
};

/**
 * Decrement course count
 */
export const decrementCourseCount = async (categoryId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Category>(CollectionName.CATEGORIES);

    const result = await collection.updateOne(
      { _id: new ObjectId(categoryId) },
      {
        $inc: { courseCount: -1 },
        $set: { updatedAt: new Date() }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Lỗi decrement course count:', error);
    return false;
  }
};

/**
 * Update course count (recalculate from actual courses)
 */
export const updateCourseCount = async (
  categoryId: string,
  count: number
): Promise<boolean> => {
  try {
    const collection = getCollection<Category>(CollectionName.CATEGORIES);

    const result = await collection.updateOne(
      { _id: new ObjectId(categoryId) },
      {
        $set: {
          courseCount: count,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Lỗi update course count:', error);
    return false;
  }
};
