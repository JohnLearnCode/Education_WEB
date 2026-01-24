import Joi from 'joi';

export const createPromotionSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Tên promotion không được để trống',
      'string.min': 'Tên promotion phải có ít nhất 2 ký tự',
      'string.max': 'Tên promotion không được vượt quá 100 ký tự',
      'any.required': 'Tên promotion là bắt buộc'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Mô tả không được vượt quá 500 ký tự'
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
  endDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.format': 'Ngày kết thúc không hợp lệ',
      'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu',
      'any.required': 'Ngày kết thúc là bắt buộc'
    }),
  isActive: Joi.boolean()
    .optional()
    .default(true)
});

export const updatePromotionSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Tên promotion phải có ít nhất 2 ký tự',
      'string.max': 'Tên promotion không được vượt quá 100 ký tự'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Mô tả không được vượt quá 500 ký tự'
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
  endDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Ngày kết thúc không hợp lệ'
    }),
  isActive: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'Phải có ít nhất một trường để cập nhật'
});
