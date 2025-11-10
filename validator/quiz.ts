import Joi from 'joi';

export const createQuizSchema = Joi.object({
  lectureId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Lecture ID không hợp lệ',
      'any.required': 'Lecture ID là bắt buộc'
    }),
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Course ID không hợp lệ',
      'any.required': 'Course ID là bắt buộc'
    }),
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Tiêu đề quiz phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề quiz không được quá 200 ký tự',
      'any.required': 'Tiêu đề quiz là bắt buộc'
    }),
  passingScore: Joi.number()
    .min(0)
    .max(100)
    .required()
    .messages({
      'number.min': 'Điểm đạt phải từ 0 đến 100',
      'number.max': 'Điểm đạt phải từ 0 đến 100',
      'any.required': 'Điểm đạt là bắt buộc'
    }),
  timeLimit: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.integer': 'Thời gian làm bài phải là số nguyên',
      'number.min': 'Thời gian làm bài phải lớn hơn 0 phút',
      'any.required': 'Thời gian làm bài là bắt buộc'
    })
});

export const updateQuizSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Tiêu đề quiz phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề quiz không được quá 200 ký tự'
    }),
  passingScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.min': 'Điểm đạt phải từ 0 đến 100',
      'number.max': 'Điểm đạt phải từ 0 đến 100'
    }),
  timeLimit: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.integer': 'Thời gian làm bài phải là số nguyên',
      'number.min': 'Thời gian làm bài phải lớn hơn 0 phút'
    })
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});
