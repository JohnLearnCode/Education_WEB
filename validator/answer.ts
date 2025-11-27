import Joi from 'joi';

export const createAnswerSchema = Joi.object({
  text: Joi.string().required().min(1).max(1000).messages({
    'string.empty': 'Nội dung câu trả lời không được để trống',
    'string.min': 'Nội dung câu trả lời phải có ít nhất 1 ký tự',
    'string.max': 'Nội dung câu trả lời không được quá 1000 ký tự',
    'any.required': 'Nội dung câu trả lời là bắt buộc'
  }),
  imageUrl: Joi.string().uri().optional().messages({
    'string.uri': 'URL hình ảnh không hợp lệ'
  })
});

export const updateAnswerSchema = Joi.object({
  text: Joi.string().min(1).max(1000).optional().messages({
    'string.min': 'Nội dung câu trả lời phải có ít nhất 1 ký tự',
    'string.max': 'Nội dung câu trả lời không được quá 1000 ký tự'
  }),
  imageUrl: Joi.string().uri().allow(null, '').optional().messages({
    'string.uri': 'URL hình ảnh không hợp lệ'
  })
});

export const bulkCreateAnswersSchema = Joi.object({
  answers: Joi.array().items(createAnswerSchema).min(1).required().messages({
    'array.min': 'Phải có ít nhất 1 câu trả lời',
    'any.required': 'Danh sách câu trả lời là bắt buộc'
  })
});
