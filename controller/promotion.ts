import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/response.js';
import { StatusCodes } from 'http-status-codes';
import * as promotionModel from '../model/promotion.js';
import { ObjectId } from 'mongodb';

/**
 * Get all promotions
 * @route GET /api/admin/promotions
 */
export const getAllPromotions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, isActive, includeExpired, courseId } = req.query;

    const result = await promotionModel.getAllPromotions({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      includeExpired: includeExpired === 'true',
      courseId: courseId as string
    });

    ResponseHelper.success(res, 'Lấy danh sách promotion thành công', {
      promotions: result.promotions,
      total: result.total,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    });
  } catch (error) {
    console.error('Error in getAllPromotions controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi lấy danh sách promotion',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Get promotion by ID
 * @route GET /api/admin/promotions/:id
 */
export const getPromotionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const promotion = await promotionModel.getPromotionById(id);

    if (!promotion) {
      ResponseHelper.error(res, 'Không tìm thấy promotion', StatusCodes.NOT_FOUND.toString());
      return;
    }

    ResponseHelper.success(res, 'Lấy promotion thành công', promotion);
  } catch (error) {
    console.error('Error in getPromotionById controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi lấy promotion',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Create promotion
 * @route POST /api/admin/promotions
 */
export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, discountType, discountValue, targetCourseIds, startDate, endDate, isActive } = req.body;

    const promotion = await promotionModel.createPromotion({
      name,
      description,
      discountType,
      discountValue,
      targetCourseIds: targetCourseIds?.map((id: string) => new ObjectId(id)),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive
    });

    if (!promotion) {
      ResponseHelper.error(res, 'Không thể tạo promotion', StatusCodes.BAD_REQUEST.toString());
      return;
    }

    ResponseHelper.success(res, 'Tạo promotion thành công', promotion, StatusCodes.CREATED);
  } catch (error) {
    console.error('Error in createPromotion controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi tạo promotion',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Update promotion
 * @route PUT /api/admin/promotions/:id
 */
export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert date strings to Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.targetCourseIds) {
      updateData.targetCourseIds = updateData.targetCourseIds.map((cid: string) => new ObjectId(cid));
    }

    const promotion = await promotionModel.updatePromotion(id, updateData);

    if (!promotion) {
      ResponseHelper.error(res, 'Không tìm thấy promotion để cập nhật', StatusCodes.NOT_FOUND.toString());
      return;
    }

    ResponseHelper.success(res, 'Cập nhật promotion thành công', promotion);
  } catch (error) {
    console.error('Error in updatePromotion controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi cập nhật promotion',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Delete promotion (soft delete)
 * @route DELETE /api/admin/promotions/:id
 */
export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await promotionModel.deletePromotion(id);

    if (!success) {
      ResponseHelper.error(res, 'Không tìm thấy promotion để xóa', StatusCodes.NOT_FOUND.toString());
      return;
    }

    ResponseHelper.success(res, 'Xóa promotion thành công', { deleted: true });
  } catch (error) {
    console.error('Error in deletePromotion controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi xóa promotion',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};
