import Joi from 'joi';

// User registration validation schema
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required',
  }),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  role: Joi.string().valid('event_creator', 'customer', 'website_owner').required().messages({
    'any.only': 'Role must be one of: event_creator, customer, website_owner',
    'any.required': 'Role is required',
  }),
});

// User login validation schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Event creation validation schema
export const eventSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 255 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().max(2000).optional().messages({
    'string.max': 'Description cannot exceed 2000 characters',
  }),
  location: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Location must be at least 3 characters long',
    'string.max': 'Location cannot exceed 255 characters',
    'any.required': 'Location is required',
  }),
  eventDate: Joi.date().iso().min('now').required().messages({
    'date.min': 'Event date must be in the future',
    'any.required': 'Event date is required',
  }),
  eventTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Please provide a valid time in HH:MM format',
    'any.required': 'Event time is required',
  }),
  commissionRate: Joi.number().min(0).max(100).default(5).messages({
    'number.min': 'Commission rate cannot be negative',
    'number.max': 'Commission rate cannot exceed 100',
  }),
});

// Ticket type validation schema
export const ticketTypeSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Ticket type name is required',
    'string.max': 'Ticket type name cannot exceed 100 characters',
    'any.required': 'Ticket type name is required',
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required',
  }),
  quantityAvailable: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.integer': 'Quantity must be a whole number',
    'any.required': 'Quantity is required',
  }),
});

// Validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: errorMessage,
        error: error.details,
      });
    }
    next();
  };
};