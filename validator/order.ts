import Joi from 'joi';
import { OrderStatus, PaymentMethod } from '../types/order/enums.js';

export const createOrderSchema = Joi.object({
  courseIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Course ID không hợp lệ'
        })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Phải có ít nhất một khóa học',
      'any.required': 'Danh sách khóa học là bắt buộc'
    }),
  paymentMethod: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .required()
    .messages({
      'any.only': 'Phương thức thanh toán không hợp lệ',
      'any.required': 'Phương thức thanh toán là bắt buộc'
    })
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required()
    .messages({
      'any.only': 'Trạng thái đơn hàng không hợp lệ',
      'any.required': 'Trạng thái đơn hàng là bắt buộc'
    })
});
