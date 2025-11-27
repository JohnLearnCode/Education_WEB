import Joi from 'joi';
import { QuizType } from '../types/common/enums.js';

// Answer schema for inline creation
const answerSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Nội dung câu trả lời phải có ít nhất 1 ký tự',
    'string.max': 'Nội dung câu trả lời không được quá 1000 ký tự',
    'any.required': 'Nội dung câu trả lời là bắt buộc'
  }),
  imageUrl: Joi.string().uri().allow(null, '').optional().messages({
    'string.uri': 'URL hình ảnh không hợp lệ'
  })
});

export const createQuizQuestionSchema = Joi.object({
  quizId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Quiz ID không hợp lệ',
      'any.required': 'Quiz ID là bắt buộc'
    }),
  questionText: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Câu hỏi phải có ít nhất 10 ký tự',
      'string.max': 'Câu hỏi không được quá 1000 ký tự',
      'any.required': 'Câu hỏi là bắt buộc'
    }),
  imageUrl: Joi.string()
    .uri()
    .allow(null, '')
    .optional()
    .messages({
      'string.uri': 'URL hình ảnh không hợp lệ'
    }),
  answers: Joi.array()
    .items(answerSchema)
    .min(2)
    .max(6)
    .required()
    .messages({
      'array.min': 'Phải có ít nhất 2 đáp án',
      'array.max': 'Không được quá 6 đáp án',
      'any.required': 'Danh sách đáp án là bắt buộc'
    }),
  correctAnswerIndices: Joi.array()
    .items(Joi.number().integer().min(0))
    .min(1)
    .required()
    .messages({
      'array.min': 'Phải có ít nhất 1 đáp án đúng',
      'any.required': 'Danh sách đáp án đúng là bắt buộc'
    }),
  type: Joi.string()
    .valid(...Object.values(QuizType))
    .required()
    .messages({
      'any.only': 'Loại câu hỏi không hợp lệ',
      'any.required': 'Loại câu hỏi là bắt buộc'
    })
});

export const updateQuizQuestionSchema = Joi.object({
  questionText: Joi.string()
    .min(10)
    .max(1000)
    .optional()
    .messages({
      'string.min': 'Câu hỏi phải có ít nhất 10 ký tự',
      'string.max': 'Câu hỏi không được quá 1000 ký tự'
    }),
  imageUrl: Joi.string()
    .uri()
    .allow(null, '')
    .optional()
    .messages({
      'string.uri': 'URL hình ảnh không hợp lệ'
    }),
  answerIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(2)
    .max(6)
    .optional()
    .messages({
      'array.min': 'Phải có ít nhất 2 đáp án',
      'array.max': 'Không được quá 6 đáp án'
    }),
  correctAnswerIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .optional()
    .messages({
      'array.min': 'Phải có ít nhất 1 đáp án đúng'
    }),
  requiredAnswers: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.min': 'Số đáp án cần chọn phải ít nhất là 1'
    }),
  type: Joi.string()
    .valid(...Object.values(QuizType))
    .optional()
    .messages({
      'any.only': 'Loại câu hỏi không hợp lệ'
    })
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});
