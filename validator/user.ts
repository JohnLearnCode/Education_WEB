import Joi from 'joi';

export const updateUserProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được quá 100 ký tự'
    }),
  avatarUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'URL avatar không hợp lệ'
    }),
  dateOfBirth: Joi.date()
    .optional()
    .messages({
      'date.base': 'Ngày sinh không hợp lệ'
    }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Số điện thoại phải có 10-15 chữ số'
    })
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});

export const userQuerySchema = Joi.object({
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
  search: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Từ khóa tìm kiếm phải có ít nhất 1 ký tự',
      'string.max': 'Từ khóa tìm kiếm không được quá 100 ký tự'
    }),
  isInstructor: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isInstructor phải là boolean'
    }),
  sortBy: Joi.string()
    .valid('createdAt', 'name', 'email')
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
