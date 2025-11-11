import Joi from 'joi';
import { CourseLevel } from '../types/course/enums.js';

export const createCourseSchema = Joi.object({
  title: Joi.string()
    .min(10)
    .max(100)
    .required()
    .messages({
      'string.min': 'Tiêu đề khóa học phải có ít nhất 10 ký tự',
      'string.max': 'Tiêu đề khóa học không được quá 100 ký tự',
      'any.required': 'Tiêu đề khóa học là bắt buộc'
    }),
  description: Joi.string()
    .min(50)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Mô tả khóa học phải có ít nhất 50 ký tự',
      'string.max': 'Mô tả khóa học không được quá 5000 ký tự',
      'any.required': 'Mô tả khóa học là bắt buộc'
    }),
  price: Joi.number()
    .min(0)
    .max(999999999)
    .required()
    .messages({
      'number.min': 'Giá khóa học không được âm',
      'number.max': 'Giá khóa học quá lớn',
      'any.required': 'Giá khóa học là bắt buộc'
    }),
  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Category ID không hợp lệ',
      'any.required': 'Category ID là bắt buộc'
    }),
  level: Joi.string()
    .valid(...Object.values(CourseLevel))
    .required()
    .messages({
      'any.only': 'Trình độ khóa học không hợp lệ',
      'any.required': 'Trình độ khóa học là bắt buộc'
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
    .optional()
    .messages({
      'number.integer': 'Số bài giảng phải là số nguyên',
      'number.min': 'Số bài giảng không được âm'
    })
});

export const updateCourseSchema = Joi.object({
  title: Joi.string()
    .min(10)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Tiêu đề khóa học phải có ít nhất 10 ký tự',
      'string.max': 'Tiêu đề khóa học không được quá 100 ký tự'
    }),
  description: Joi.string()
    .min(50)
    .max(5000)
    .optional()
    .messages({
      'string.min': 'Mô tả khóa học phải có ít nhất 50 ký tự',
      'string.max': 'Mô tả khóa học không được quá 5000 ký tự'
    }),
  price: Joi.number()
    .min(0)
    .max(999999999)
    .optional()
    .messages({
      'number.min': 'Giá khóa học không được âm',
      'number.max': 'Giá khóa học quá lớn'
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
    .optional()
    .messages({
      'number.integer': 'Số bài giảng phải là số nguyên',
      'number.min': 'Số bài giảng không được âm'
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
