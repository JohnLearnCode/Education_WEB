import Joi from 'joi';

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
  options: Joi.array()
    .items(Joi.string().min(1).max(500))
    .min(2)
    .max(6)
    .required()
    .messages({
      'array.min': 'Phải có ít nhất 2 đáp án',
      'array.max': 'Không được quá 6 đáp án',
      'any.required': 'Danh sách đáp án là bắt buộc'
    }),
  correctAnswerIndex: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.integer': 'Chỉ số đáp án đúng phải là số nguyên',
      'number.min': 'Chỉ số đáp án đúng phải từ 0 trở lên',
      'any.required': 'Chỉ số đáp án đúng là bắt buộc'
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

export const updateQuizQuestionSchema = Joi.object({
  questionText: Joi.string()
    .min(10)
    .max(1000)
    .optional()
    .messages({
      'string.min': 'Câu hỏi phải có ít nhất 10 ký tự',
      'string.max': 'Câu hỏi không được quá 1000 ký tự'
    }),
  options: Joi.array()
    .items(Joi.string().min(1).max(500))
    .min(2)
    .max(6)
    .optional()
    .messages({
      'array.min': 'Phải có ít nhất 2 đáp án',
      'array.max': 'Không được quá 6 đáp án'
    }),
  correctAnswerIndex: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'Chỉ số đáp án đúng phải là số nguyên',
      'number.min': 'Chỉ số đáp án đúng phải từ 0 trở lên'
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

export const reorderQuestionsSchema = Joi.object({
  questions: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Question ID không hợp lệ',
            'any.required': 'Question ID là bắt buộc'
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
      'array.min': 'Phải cung cấp ít nhất một câu hỏi để sắp xếp lại',
      'any.required': 'Danh sách câu hỏi là bắt buộc'
    })
});
