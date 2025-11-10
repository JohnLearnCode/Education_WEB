import Joi from 'joi';

export const authRegisterSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username chỉ được chứa chữ cái và số',
      'string.min': 'Username phải có ít nhất 3 ký tự',
      'string.max': 'Username không được quá 30 ký tự',
      'any.required': 'Username là bắt buộc'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số',
      'any.required': 'Mật khẩu là bắt buộc'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ tên không được quá 50 ký tự',
      'any.required': 'Họ tên là bắt buộc'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
  dateOfBirth: Joi.date()
    .optional()
    .max('now')
    .messages({
      'date.max': 'Ngày sinh không được là tương lai'
    }),
  phoneNumber: Joi.string()
    .pattern(new RegExp('^[0-9]{10,11}$'))
    .optional()
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 số)'
    }),
  avatarUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Avatar URL không hợp lệ'
    }),
  isInstructor: Joi.boolean()
    .optional()
    .default(false)
});

export const authLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Mật khẩu là bắt buộc'
    })
});


