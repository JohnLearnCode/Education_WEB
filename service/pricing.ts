import { getCourseById } from '../model/course.js';
import { getActivePromotionsForCourse } from '../model/promotion.js';
import { getCouponByCode, getUserCouponUsageCount } from '../model/coupon.js';
import { ObjectId } from 'mongodb';

export interface PriceCalculationResult {
  originalPrice: number;
  finalPrice: number;
  discount: number;
  appliedDiscount: {
    type: 'sale' | 'promotion' | 'coupon' | null;
    name?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
  };
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  };
}

/**
 * Calculate discount amount based on type
 */
const calculateDiscountAmount = (
  originalPrice: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number => {
  if (discountType === 'percentage') {
    return Math.round(originalPrice * (discountValue / 100));
  }
  return Math.min(discountValue, originalPrice);
};

/**
 * Calculate final price for a course
 * Priority: highest discount wins (course sale vs promotion vs coupon)
 */
export const calculateFinalPrice = async (
  courseId: string,
  couponCode?: string,
  userId?: string
): Promise<PriceCalculationResult> => {
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error('Không tìm thấy khóa học');
  }

  const originalPrice = course.price;
  let bestDiscount = 0;
  let appliedDiscount: PriceCalculationResult['appliedDiscount'] = { type: null };

  // 1. Check course-level sale price
  const now = new Date();
  if (course.salePrice !== undefined && course.salePrice < originalPrice) {
    if (
      (!course.saleStartDate || course.saleStartDate <= now) &&
      (!course.saleEndDate || course.saleEndDate >= now)
    ) {
      const saleDiscount = originalPrice - course.salePrice;
      if (saleDiscount > bestDiscount) {
        bestDiscount = saleDiscount;
        appliedDiscount = {
          type: 'sale',
          name: 'Sale Price',
          discountType: 'fixed',
          discountValue: saleDiscount
        };
      }
    }
  }

  // 2. Check course-level discount percent
  if (course.discountPercent && course.discountPercent > 0) {
    if (
      (!course.saleStartDate || course.saleStartDate <= now) &&
      (!course.saleEndDate || course.saleEndDate >= now)
    ) {
      const percentDiscount = calculateDiscountAmount(originalPrice, 'percentage', course.discountPercent);
      if (percentDiscount > bestDiscount) {
        bestDiscount = percentDiscount;
        appliedDiscount = {
          type: 'sale',
          name: 'Discount Percent',
          discountType: 'percentage',
          discountValue: course.discountPercent
        };
      }
    }
  }

  // 3. Check active promotions
  const promotions = await getActivePromotionsForCourse(courseId);
  for (const promo of promotions) {
    const promoDiscount = calculateDiscountAmount(
      originalPrice,
      promo.discountType,
      promo.discountValue
    );
    if (promoDiscount > bestDiscount) {
      bestDiscount = promoDiscount;
      appliedDiscount = {
        type: 'promotion',
        name: promo.name,
        discountType: promo.discountType,
        discountValue: promo.discountValue
      };
    }
  }

  // 4. Check coupon if provided
  if (couponCode && userId) {
    const couponResult = await validateCoupon(couponCode, [courseId], originalPrice, userId);
    if (couponResult.valid && couponResult.coupon) {
      const couponDiscount = couponResult.coupon.discountAmount;
      if (couponDiscount > bestDiscount) {
        bestDiscount = couponDiscount;
        appliedDiscount = {
          type: 'coupon',
          name: couponResult.coupon.code,
          discountType: couponResult.coupon.discountType,
          discountValue: couponResult.coupon.discountValue
        };
      }
    }
  }

  const finalPrice = Math.max(0, originalPrice - bestDiscount);

  return {
    originalPrice,
    finalPrice,
    discount: bestDiscount,
    appliedDiscount
  };
};

/**
 * Validate coupon code for given courses and order amount
 */
export const validateCoupon = async (
  code: string,
  courseIds: string[],
  orderAmount: number,
  userId: string
): Promise<CouponValidationResult> => {
  const coupon = await getCouponByCode(code);

  if (!coupon) {
    return { valid: false, message: 'Mã coupon không tồn tại' };
  }

  if (!coupon.isActive) {
    return { valid: false, message: 'Mã coupon đã bị vô hiệu hóa' };
  }

  const now = new Date();
  if (coupon.startDate > now) {
    return { valid: false, message: 'Mã coupon chưa có hiệu lực' };
  }

  if (coupon.expiryDate < now) {
    return { valid: false, message: 'Mã coupon đã hết hạn' };
  }

  // Check max uses
  if (coupon.maxUses > 0 && coupon.currentUses >= coupon.maxUses) {
    return { valid: false, message: 'Mã coupon đã hết lượt sử dụng' };
  }

  // Check user usage limit
  if (coupon.maxUsesPerUser > 0) {
    const userUsageCount = await getUserCouponUsageCount(coupon._id.toString(), userId);
    if (userUsageCount >= coupon.maxUsesPerUser) {
      return { valid: false, message: 'Bạn đã sử dụng hết lượt cho mã coupon này' };
    }
  }

  // Check minimum order amount
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Đơn hàng tối thiểu phải đạt ${coupon.minOrderAmount.toLocaleString('vi-VN')}đ`
    };
  }

  // Check target courses
  if (coupon.targetCourseIds.length > 0) {
    const targetIds = coupon.targetCourseIds.map(id => id.toString());
    const hasValidCourse = courseIds.some(id => targetIds.includes(id));
    if (!hasValidCourse) {
      return { valid: false, message: 'Mã coupon không áp dụng cho các khóa học này' };
    }
  }

  // Calculate discount
  const discountAmount = calculateDiscountAmount(
    orderAmount,
    coupon.discountType,
    coupon.discountValue
  );

  return {
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount
    }
  };
};

/**
 * Get best discount for display on course page
 */
export const getDisplayPrice = async (courseId: string): Promise<{
  originalPrice: number;
  displayPrice: number;
  hasDiscount: boolean;
  discountPercent?: number;
}> => {
  const result = await calculateFinalPrice(courseId);

  return {
    originalPrice: result.originalPrice,
    displayPrice: result.finalPrice,
    hasDiscount: result.discount > 0,
    discountPercent: result.discount > 0
      ? Math.round((result.discount / result.originalPrice) * 100)
      : undefined
  };
};
