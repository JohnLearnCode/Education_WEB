import Joi from 'joi';

// Danh sách các domain email ảo phổ biến
const disposableEmailDomains = [
  'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'maildrop.cc', 'temp-mail.org', 'getnada.com',
  'trashmail.com', 'yopmail.com', 'fakeinbox.com', 'sharklasers.com',
  'guerrillamail.info', 'grr.la', 'guerrillamail.biz', 'guerrillamail.de',
  'spam4.me', 'tempinbox.com', 'emailondeck.com', 'mohmal.com'
];

// Custom validator để check email ảo
const validateDisposableEmail = (value: string, helpers: Joi.CustomHelpers) => {
  const domain = value.split('@')[1]?.toLowerCase();
  if (domain && disposableEmailDomains.includes(domain)) {
    return helpers.error('string.disposable');
  }
  return value;
};

// Custom validator để check tuổi tối thiểu 13 và tối đa 100
const validateMinAge = (value: Date, helpers: Joi.CustomHelpers) => {
  const today = new Date();
  const birthDate = new Date(value);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Điều chỉnh tuổi nếu chưa đến sinh nhật trong năm nay
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 13) {
    return helpers.error('date.minAge');
  }

  if (age > 100) {
    return helpers.error('date.maxAge');
  }

  return value;
};

export const authRegisterSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ỹ\s]+$/)
    .required()
    .messages({
      'string.empty': 'Tên không được để trống',
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được quá 50 ký tự',
      'string.pattern.base': 'Tên không được chứa ký tự đặc biệt hoặc số',
      'any.required': 'Tên không được để trống'
    }),
  email: Joi.string()
    .email()
    .min(5)
    .max(100)
    .custom(validateDisposableEmail)
    .required()
    .messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'string.min': 'Email phải có ít nhất 5 ký tự',
      'string.max': 'Email không được quá 100 ký tự',
      'string.disposable': 'Không được sử dụng email ảo',
      'any.required': 'Email không được để trống'
    }),
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.max': 'Mật khẩu không được quá 100 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số',
      'any.required': 'Mật khẩu không được để trống'
    }),
  dateOfBirth: Joi.date()
    .max('now')
    .custom(validateMinAge)
    .required()
    .messages({
      'date.base': 'Ngày sinh không hợp lệ',
      'date.max': 'Ngày sinh không được là ngày trong tương lai',
      'date.minAge': 'Bạn phải từ 13 tuổi trở lên',
      'date.maxAge': 'Tuổi không được vượt quá 100',
      'any.required': 'Ngày sinh không được để trống'
    }),
  phoneNumber: Joi.string()
    .pattern(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/)
    .required()
    .messages({
      'string.empty': 'Số điện thoại không được để trống',
      'string.pattern.base': 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam 10 số)',
      'any.required': 'Số điện thoại không được để trống'
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
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email không được để trống'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Mật khẩu không được để trống',
      'any.required': 'Mật khẩu không được để trống'
    })
});


