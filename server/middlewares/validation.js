import { body, validationResult } from 'express-validator';

// Generic validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Customer validation rules
export const validateCustomer = [
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('whatsapp')
    .matches(/^[0-9]{10,15}$/)
    .withMessage('WhatsApp number must be 10-15 digits'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('website')
    .optional()
    .isURL({ require_protocol: false })
    .withMessage('Invalid website URL'),
    
  handleValidationErrors
];

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
    
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

// Schedule validation
export const validateSchedule = [
  body('customerId')
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
  
  body('scheduledAt')
    .isISO8601()
    .withMessage('Invalid date format'),
    
  handleValidationErrors
];

// Generic MongoDB ObjectId validation
export const validateObjectId = (paramName = 'id') => [
  body(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];
