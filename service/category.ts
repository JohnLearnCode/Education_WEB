import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse
} from "../types/category/request";
import * as categoryModel from '../model/category.js';
import { CategoryMessage } from '../types/category/enums.js';

/**
 * Create a new category
 */
export const createCategory = async (
  categoryData: CreateCategoryRequest
): Promise<CategoryResponse> => {
  // Check if category name already exists
  const existingCategory = await categoryModel.getCategoryByName(categoryData.name);
  if (existingCategory) {
    throw new Error(CategoryMessage.CATEGORY_NAME_EXISTS);
  }

  // Create category
  const category = await categoryModel.createCategory(categoryData);

  if (!category) {
    throw new Error(CategoryMessage.FAIL_CREATE);
  }

  // Convert to response
  const response: CategoryResponse = {
    ...category,
    _id: category._id!.toString()
  };

  return response;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId: string): Promise<CategoryResponse> => {
  const category = await categoryModel.getCategoryById(categoryId);
  
  if (!category) {
    throw new Error(CategoryMessage.CATEGORY_NOT_FOUND);
  }

  // Convert to response
  const response: CategoryResponse = {
    ...category,
    _id: category._id!.toString()
  };

  return response;
};

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  const categories = await categoryModel.getAllCategories();

  // Convert to response array
  const responseCategories: CategoryResponse[] = categories.map(category => ({
    ...category,
    _id: category._id!.toString()
  }));

  return responseCategories;
};

/**
 * Update category
 */
export const updateCategory = async (
  categoryId: string,
  updateData: UpdateCategoryRequest
): Promise<CategoryResponse> => {
  // Check if category exists
  const existingCategory = await categoryModel.getCategoryById(categoryId);
  if (!existingCategory) {
    throw new Error(CategoryMessage.CATEGORY_NOT_FOUND);
  }

  // If updating name, check if new name already exists
  if (updateData.name && updateData.name !== existingCategory.name) {
    const categoryWithSameName = await categoryModel.getCategoryByName(updateData.name);
    if (categoryWithSameName) {
      throw new Error(CategoryMessage.CATEGORY_NAME_EXISTS);
    }
  }

  // Update category
  const updatedCategory = await categoryModel.updateCategory(categoryId, updateData);

  if (!updatedCategory) {
    throw new Error(CategoryMessage.FAIL_UPDATE);
  }

  // Convert to response
  const response: CategoryResponse = {
    ...updatedCategory,
    _id: updatedCategory._id!.toString()
  };

  return response;
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  // Check if category exists
  const category = await categoryModel.getCategoryById(categoryId);
  if (!category) {
    throw new Error(CategoryMessage.CATEGORY_NOT_FOUND);
  }

  // Check if category has courses
  if (category.courseCount > 0) {
    throw new Error(CategoryMessage.CATEGORY_HAS_COURSES);
  }

  // Delete category
  const success = await categoryModel.deleteCategory(categoryId);

  if (!success) {
    throw new Error(CategoryMessage.FAIL_DELETE);
  }

  return true;
};

/**
 * Increment course count for a category
 */
export const incrementCourseCount = async (categoryId: string): Promise<void> => {
  await categoryModel.incrementCourseCount(categoryId);
};

/**
 * Decrement course count for a category
 */
export const decrementCourseCount = async (categoryId: string): Promise<void> => {
  await categoryModel.decrementCourseCount(categoryId);
};
