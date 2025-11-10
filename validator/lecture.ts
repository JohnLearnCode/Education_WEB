import Joi from 'joi';

export const createLectureSchema = Joi.object({
  sectionId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Section ID không hợp lệ',
      'any.required': 'Section ID là bắt buộc'
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
      'string.min': 'Tiêu đề bài học phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề bài học không được quá 200 ký tự',
      'any.required': 'Tiêu đề bài học là bắt buộc'
    }),
  duration: Joi.string()
    .required()
    .messages({
      'any.required': 'Thời lượng là bắt buộc'
    }),
  type: Joi.string()
    .valid('video', 'text', 'attachment')
    .required()
    .messages({
      'any.only': 'Loại bài học phải là video, text hoặc attachment',
      'any.required': 'Loại bài học là bắt buộc'
    }),
  videoUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Video URL không hợp lệ'
    }),
  textContent: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Nội dung text phải là chuỗi'
    }),
  attachmentUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Attachment URL không hợp lệ'
    }),
  order: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.integer': 'Thứ tự phải là số nguyên',
      'number.min': 'Thứ tự phải lớn hơn 0',
      'any.required': 'Thứ tự là bắt buộc'
    })
});

export const updateLectureSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Tiêu đề bài học phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề bài học không được quá 200 ký tự'
    }),
  duration: Joi.string()
    .optional()
    .messages({
      'string.base': 'Thời lượng phải là chuỗi'
    }),
  type: Joi.string()
    .valid('video', 'text', 'attachment')
    .optional()
    .messages({
      'any.only': 'Loại bài học phải là video, text hoặc attachment'
    }),
  videoUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Video URL không hợp lệ'
    }),
  textContent: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Nội dung text phải là chuỗi'
    }),
  attachmentUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Attachment URL không hợp lệ'
    }),
  order: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.integer': 'Thứ tự phải là số nguyên',
      'number.min': 'Thứ tự phải lớn hơn 0'
    })
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});

export const reorderLecturesSchema = Joi.object({
  lectures: Joi.array()
    .items(
      Joi.object({
        lectureId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Lecture ID không hợp lệ',
            'any.required': 'Lecture ID là bắt buộc'
          }),
        order: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'number.integer': 'Thứ tự phải là số nguyên',
            'number.min': 'Thứ tự phải lớn hơn 0',
            'any.required': 'Thứ tự là bắt buộc'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Phải cung cấp ít nhất một lecture để sắp xếp lại',
      'any.required': 'Danh sách lectures là bắt buộc'
    })
});
