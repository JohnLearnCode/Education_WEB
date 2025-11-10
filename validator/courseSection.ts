import Joi from 'joi';

export const createCourseSectionSchema = Joi.object({
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
      'string.min': 'Tiêu đề chương phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề chương không được quá 200 ký tự',
      'any.required': 'Tiêu đề chương là bắt buộc'
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

export const updateCourseSectionSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Tiêu đề chương phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề chương không được quá 200 ký tự'
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

export const reorderSectionsSchema = Joi.object({
  sections: Joi.array()
    .items(
      Joi.object({
        sectionId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Section ID không hợp lệ',
            'any.required': 'Section ID là bắt buộc'
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
      'array.min': 'Phải cung cấp ít nhất một section để sắp xếp lại',
      'any.required': 'Danh sách sections là bắt buộc'
    })
});
