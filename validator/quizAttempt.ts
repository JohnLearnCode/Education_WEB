import Joi from 'joi';

export const submitQuizAttemptSchema = Joi.object({
  quizId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Quiz ID không hợp lệ',
      'any.required': 'Quiz ID là bắt buộc'
    }),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Question ID không hợp lệ',
            'any.required': 'Question ID là bắt buộc'
          }),
        selectedAnswerIds: Joi.array()
          .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
          .min(1)
          .required()
          .messages({
            'array.min': 'Phải chọn ít nhất một đáp án',
            'any.required': 'Danh sách đáp án được chọn là bắt buộc'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Phải có ít nhất một câu trả lời',
      'any.required': 'Danh sách câu trả lời là bắt buộc'
    })
});
