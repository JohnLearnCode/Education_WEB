import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/response.js';
import { StatusCodes } from 'http-status-codes';
import * as couponModel from '../model/coupon.js';
import * as pricingService from '../service/pricing.js';
import { ObjectId } from 'mongodb';

// Extended Request type for authenticated routes
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Get all coupons
 * @route GET /api/admin/coupons
 */
export const getAllCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, isActive, includeExpired, code } = req.query;

    const result = await couponModel.getAllCoupons({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      includeExpired: includeExpired === 'true',
      code: code as string
    });

    ResponseHelper.success(res, 'Lấy danh sách coupon thành công', {
      coupons: result.coupons,
      total: result.total,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    });
  } catch (error) {
    console.error('Error in getAllCoupons controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi lấy danh sách coupon',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Get coupon by ID
 * @route GET /api/admin/coupons/:id
 */
export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await couponModel.getCouponById(id);

    if (!coupon) {
      ResponseHelper.error(res, 'Không tìm thấy coupon', StatusCodes.NOT_FOUND.toString());
      return;
    }

    ResponseHelper.success(res, 'Lấy coupon thành công', coupon);
  } catch (error) {
    console.error('Error in getCouponById controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi lấy coupon',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Create coupon
 * @route POST /api/admin/coupons
 */
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      code, discountType, discountValue, minOrderAmount,
      maxUses, maxUsesPerUser, targetCourseIds, startDate, expiryDate, isActive
    } = req.body;

    // Check if code already exists
    const existingCoupon = await couponModel.getCouponByCode(code);
    if (existingCoupon) {
      ResponseHelper.error(res, 'Mã coupon đã tồn tại', StatusCodes.CONFLICT.toString());
      return;
    }

    const coupon = await couponModel.createCoupon({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      maxUsesPerUser,
      targetCourseIds: targetCourseIds?.map((id: string) => new ObjectId(id)),
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      isActive
    });

    if (!coupon) {
      ResponseHelper.error(res, 'Không thể tạo coupon', StatusCodes.BAD_REQUEST.toString());
      return;
    }

    ResponseHelper.success(res, 'Tạo coupon thành công', coupon, StatusCodes.CREATED);
  } catch (error) {
    console.error('Error in createCoupon controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi tạo coupon',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Update coupon
 * @route PUT /api/admin/coupons/:id
 */
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert date strings to Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }
    if (updateData.targetCourseIds) {
      updateData.targetCourseIds = updateData.targetCourseIds.map((cid: string) => new ObjectId(cid));
    }

    // Check if new code conflicts with existing
    if (updateData.code) {
      const existingCoupon = await couponModel.getCouponByCode(updateData.code);
      if (existingCoupon && existingCoupon._id.toString() !== id) {
        ResponseHelper.error(res, 'Mã coupon đã tồn tại', StatusCodes.CONFLICT.toString());
        return;
      }
    }

    const coupon = await couponModel.updateCoupon(id, updateData);

    if (!coupon) {
      ResponseHelper.error(res, 'Không tìm thấy coupon để cập nhật', StatusCodes.NOT_FOUND.toString());
      return;
    }

    ResponseHelper.success(res, 'Cập nhật coupon thành công', coupon);
  } catch (error) {
    console.error('Error in updateCoupon controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi cập nhật coupon',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Delete coupon (soft delete)
 * @route DELETE /api/admin/coupons/:id
 */
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await couponModel.deleteCoupon(id);

    if (!success) {
      ResponseHelper.error(res, 'Không tìm thấy coupon để xóa', StatusCodes.NOT_FOUND.toString());
      return;
    }

    ResponseHelper.success(res, 'Xóa coupon thành công', { deleted: true });
  } catch (error) {
    console.error('Error in deleteCoupon controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi xóa coupon',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Get coupon usage history
 * @route GET /api/admin/coupons/:id/usages
 */
export const getCouponUsages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const result = await couponModel.getCouponUsages(id, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    ResponseHelper.success(res, 'Lấy lịch sử sử dụng coupon thành công', {
      usages: result.usages,
      total: result.total,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    });
  } catch (error) {
    console.error('Error in getCouponUsages controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi lấy lịch sử sử dụng',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Validate coupon code (public endpoint)
 * @route POST /api/coupons/validate
 */
export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, courseIds, orderAmount } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      ResponseHelper.error(res, 'Bạn cần đăng nhập để sử dụng coupon', StatusCodes.UNAUTHORIZED.toString());
      return;
    }

    const result = await pricingService.validateCoupon(code, courseIds, orderAmount, userId);

    ResponseHelper.success(res, result.valid ? 'Mã coupon hợp lệ' : result.message || 'Mã coupon không hợp lệ', result);
  } catch (error) {
    console.error('Error in validateCoupon controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Lỗi xác thực coupon',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};
