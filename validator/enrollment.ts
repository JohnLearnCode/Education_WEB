import Joi from 'joi';

export const enrollCourseSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Course ID không hợp lệ',
      'any.required': 'Course ID là bắt buộc'
    })
});

export const markLectureCompletedSchema = Joi.object({
  lectureId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Lecture ID không hợp lệ',
      'any.required': 'Lecture ID là bắt buộc'
    })
});
