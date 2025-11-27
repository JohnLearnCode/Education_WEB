import Joi from 'joi';

export const addToWishlistSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Course ID không hợp lệ',
      'any.required': 'Course ID là bắt buộc'
    })
});

export const removeFromWishlistSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Course ID không hợp lệ',
      'any.required': 'Course ID là bắt buộc'
    })
});
