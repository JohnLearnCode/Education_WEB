import Joi from 'joi';
import { EarningStatus } from '../types/instructorEarnings/request.js';

export const createInstructorEarningsSchema = Joi.object({
  instructorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Instructor ID không hợp lệ',
      'any.required': 'Instructor ID là bắt buộc'
    }),
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Course ID không hợp lệ',
      'any.required': 'Course ID là bắt buộc'
    }),
  orderId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Order ID không hợp lệ',
      'any.required': 'Order ID là bắt buộc'
    }),
  amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Số tiền phải lớn hơn 0',
      'any.required': 'Số tiền là bắt buộc'
    })
});

export const updateEarningStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(EarningStatus))
    .required()
    .messages({
      'any.only': 'Trạng thái không hợp lệ',
      'any.required': 'Trạng thái là bắt buộc'
    })
});

export const instructorEarningsQuerySchema = Joi.object({
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
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Course ID không hợp lệ'
    }),
  status: Joi.string()
    .valid(...Object.values(EarningStatus))
    .optional()
    .messages({
      'any.only': 'Trạng thái không hợp lệ'
    }),
  sortBy: Joi.string()
    .valid('createdAt', 'amount', 'paidAt')
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
