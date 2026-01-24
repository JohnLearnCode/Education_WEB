import Joi from 'joi';

export const createCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(4)
    .max(20)
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      'string.empty': 'Mã coupon không được để trống',
      'string.min': 'Mã coupon phải có ít nhất 4 ký tự',
      'string.max': 'Mã coupon không được vượt quá 20 ký tự',
      'string.pattern.base': 'Mã coupon chỉ được chứa chữ cái và số',
      'any.required': 'Mã coupon là bắt buộc'
    }),
  discountType: Joi.string()
    .valid('percentage', 'fixed')
    .required()
    .messages({
      'any.only': 'Loại giảm giá phải là percentage hoặc fixed',
      'any.required': 'Loại giảm giá là bắt buộc'
    }),
  discountValue: Joi.number()
    .positive()
    .required()
    .when('discountType', {
      is: 'percentage',
      then: Joi.number().max(100).messages({
        'number.max': 'Phần trăm giảm giá không được vượt quá 100%'
      })
    })
    .messages({
      'number.positive': 'Giá trị giảm giá phải là số dương',
      'any.required': 'Giá trị giảm giá là bắt buộc'
    }),
  minOrderAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Giá trị đơn hàng tối thiểu không được âm'
    }),
  maxUses: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.min': 'Số lần sử dụng tối đa không được âm'
    }),
  maxUsesPerUser: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.min': 'Số lần sử dụng tối đa mỗi người không được âm'
    }),
  targetCourseIds: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional()
    .messages({
      'string.hex': 'ID khóa học không hợp lệ',
      'string.length': 'ID khóa học phải có 24 ký tự'
    }),
  startDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'Ngày bắt đầu không hợp lệ',
      'any.required': 'Ngày bắt đầu là bắt buộc'
    }),
  expiryDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.format': 'Ngày hết hạn không hợp lệ',
      'date.greater': 'Ngày hết hạn phải sau ngày bắt đầu',
      'any.required': 'Ngày hết hạn là bắt buộc'
    }),
  isActive: Joi.boolean()
    .optional()
    .default(true)
});

export const updateCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(4)
    .max(20)
    .pattern(/^[A-Z0-9]+$/)
    .optional()
    .messages({
      'string.min': 'Mã coupon phải có ít nhất 4 ký tự',
      'string.max': 'Mã coupon không được vượt quá 20 ký tự',
      'string.pattern.base': 'Mã coupon chỉ được chứa chữ cái và số'
    }),
  discountType: Joi.string()
    .valid('percentage', 'fixed')
    .optional()
    .messages({
      'any.only': 'Loại giảm giá phải là percentage hoặc fixed'
    }),
  discountValue: Joi.number()
    .positive()
    .optional()
    .when('discountType', {
      is: 'percentage',
      then: Joi.number().max(100).messages({
        'number.max': 'Phần trăm giảm giá không được vượt quá 100%'
      })
    })
    .messages({
      'number.positive': 'Giá trị giảm giá phải là số dương'
    }),
  minOrderAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Giá trị đơn hàng tối thiểu không được âm'
    }),
  maxUses: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Số lần sử dụng tối đa không được âm'
    }),
  maxUsesPerUser: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Số lần sử dụng tối đa mỗi người không được âm'
    }),
  targetCourseIds: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional()
    .messages({
      'string.hex': 'ID khóa học không hợp lệ',
      'string.length': 'ID khóa học phải có 24 ký tự'
    }),
  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Ngày bắt đầu không hợp lệ'
    }),
  expiryDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Ngày hết hạn không hợp lệ'
    }),
  isActive: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'Phải có ít nhất một trường để cập nhật'
});

export const validateCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Mã coupon không được để trống',
      'any.required': 'Mã coupon là bắt buộc'
    }),
  courseIds: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required()
    .messages({
      'array.min': 'Phải có ít nhất một khóa học',
      'any.required': 'Danh sách khóa học là bắt buộc'
    }),
  orderAmount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'Giá trị đơn hàng phải là số dương',
      'any.required': 'Giá trị đơn hàng là bắt buộc'
    })
});
