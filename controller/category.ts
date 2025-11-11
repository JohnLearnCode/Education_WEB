import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../service/category.js';
import { StatusCodes } from 'http-status-codes';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '../types/category/request.js';
import { CategoryMessage } from '../types/category/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Create a new category (instructor only)
 */
export const createCategory = async (
  req: Request<{}, {}, CreateCategoryRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await categoryService.createCategory(req.body);
    
    return ResponseHelper.success(
      res,
      CategoryMessage.SUCCESS_CREATE,
      category,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID (public)
 */
export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    
    return ResponseHelper.success(
      res,
      CategoryMessage.SUCCESS_GET,
      category,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories (public)
 */
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await categoryService.getAllCategories();
    
    return ResponseHelper.success(
      res,
      CategoryMessage.SUCCESS_GET_ALL,
      categories,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update category (instructor only)
 */
export const updateCategory = async (
  req: Request<{ id: string }, {}, UpdateCategoryRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);
    
    return ResponseHelper.success(
      res,
      CategoryMessage.SUCCESS_UPDATE,
      category,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category (instructor only)
 */
export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    
    return ResponseHelper.success(
      res,
      CategoryMessage.SUCCESS_DELETE,
      { message: 'Category deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
