import Joi from 'joi';
import { CourseLevel } from '../types/course/enums.js';

export const createCourseSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Tên khóa học phải có ít nhất 5 ký tự',
      'string.max': 'Tên khóa học không được quá 200 ký tự',
      'any.required': 'Tên khóa học là bắt buộc'
    }),
  description: Joi.string()
    .min(20)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Mô tả khóa học phải có ít nhất 20 ký tự',
      'string.max': 'Mô tả khóa học không được quá 5000 ký tự',
      'any.required': 'Mô tả khóa học là bắt buộc'
    }),
  price: Joi.number()
    .min(0)
    .max(100000000)
    .required()
    .messages({
      'number.min': 'Giá khóa học không được âm',
      'number.max': 'Giá khóa học không được vượt quá 100,000,000 VNĐ',
      'any.required': 'Giá khóa học là bắt buộc'
    }),
  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Danh mục không hợp lệ',
      'any.required': 'Vui lòng chọn danh mục'
    }),
  level: Joi.string()
    .valid(...Object.values(CourseLevel))
    .required()
    .messages({
      'any.only': 'Cấp độ không hợp lệ',
      'any.required': 'Vui lòng chọn cấp độ'
    }),
  imageUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'URL hình ảnh không hợp lệ'
    }),
  totalDuration: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Thời lượng phải là chuỗi ký tự'
    }),
  lectureCount: Joi.number()
    .integer()
    .min(0)
    .max(500)
    .optional()
    .messages({
      'number.integer': 'Số bài học phải là số nguyên',
      'number.min': 'Số bài học không được âm',
      'number.max': 'Số bài học không được vượt quá 500'
    })
});

export const updateCourseSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Tên khóa học phải có ít nhất 5 ký tự',
      'string.max': 'Tên khóa học không được quá 200 ký tự'
    }),
  description: Joi.string()
    .min(20)
    .max(5000)
    .optional()
    .messages({
      'string.min': 'Mô tả khóa học phải có ít nhất 20 ký tự',
      'string.max': 'Mô tả khóa học không được quá 5000 ký tự'
    }),
  price: Joi.number()
    .min(0)
    .max(100000000)
    .optional()
    .messages({
      'number.min': 'Giá khóa học không được âm',
      'number.max': 'Giá khóa học không được vượt quá 100,000,000 VNĐ'
    }),
  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Danh mục không hợp lệ'
    }),
  level: Joi.string()
    .valid(...Object.values(CourseLevel))
    .optional()
    .messages({
      'any.only': 'Cấp độ không hợp lệ'
    }),
  imageUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'URL hình ảnh không hợp lệ'
    }),
  totalDuration: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Thời lượng phải là chuỗi ký tự'
    }),
  lectureCount: Joi.number()
    .integer()
    .min(0)
    .max(500)
    .optional()
    .messages({
      'number.integer': 'Số bài học phải là số nguyên',
      'number.min': 'Số bài học không được âm',
      'number.max': 'Số bài học không được vượt quá 500'
    })
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});

export const courseQuerySchema = Joi.object({
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
  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Category ID không hợp lệ'
    }),
  level: Joi.string()
    .valid(...Object.values(CourseLevel))
    .optional()
    .messages({
      'any.only': 'Trình độ khóa học không hợp lệ'
    }),
  search: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Từ khóa tìm kiếm phải có ít nhất 1 ký tự',
      'string.max': 'Từ khóa tìm kiếm không được quá 100 ký tự'
    }),
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'title', 'price', 'rating', 'studentCount')
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
