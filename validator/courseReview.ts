import Joi from 'joi';

export const createCourseReviewSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Course ID không hợp lệ',
      'any.required': 'Course ID là bắt buộc'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.integer': 'Rating phải là số nguyên',
      'number.min': 'Rating tối thiểu là 1',
      'number.max': 'Rating tối đa là 5',
      'any.required': 'Rating là bắt buộc'
    }),
  comment: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Nhận xét phải có ít nhất 1 ký tự',
      'string.max': 'Nhận xét không được quá 1000 ký tự',
      'any.required': 'Nhận xét là bắt buộc'
    })
});

export const updateCourseReviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.integer': 'Rating phải là số nguyên',
      'number.min': 'Rating tối thiểu là 1',
      'number.max': 'Rating tối đa là 5'
    }),
  comment: Joi.string()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'string.min': 'Nhận xét phải có ít nhất 1 ký tự',
      'string.max': 'Nhận xét không được quá 1000 ký tự'
    })
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});

export const courseReviewQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.integer': 'Page phải là số nguyên',
      'number.min': 'Page phải lớn hơn 0'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.integer': 'Limit phải là số nguyên',
      'number.min': 'Limit phải lớn hơn 0',
      'number.max': 'Limit không được quá 100'
    }),
  sortBy: Joi.string()
    .valid('createdAt', 'rating')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'Trường sắp xếp không hợp lệ'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
    .messages({
      'any.only': 'Thứ tự sắp xếp không hợp lệ'
    })
});
