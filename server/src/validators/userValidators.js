import Joi from "joi";

// Settings/Profile Update Schema
export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Za-z\s'-]+$/)
    .messages({
      "string.empty": "First name cannot be empty",
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
      "string.pattern.base":
        "First name can only contain letters, spaces, hyphens, and apostrophes",
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Za-z\s'-]+$/)
    .messages({
      "string.empty": "Last name cannot be empty",
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
      "string.pattern.base":
        "Last name can only contain letters, spaces, hyphens, and apostrophes",
    }),
  bio: Joi.string().trim().max(300).allow("").messages({
    "string.max": "Bio cannot exceed 300 characters",
  }),
});

// Login Schema
export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
});

// Register Schema
export const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Za-z\s'-]+$/)
    .required()
    .messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
      "string.pattern.base":
        "First name can only contain letters, spaces, hyphens, and apostrophes",
      "any.required": "First name is required",
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Za-z\s'-]+$/)
    .required()
    .messages({
      "string.empty": "Last name is required",
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
      "string.pattern.base":
        "Last name can only contain letters, spaces, hyphens, and apostrophes",
      "any.required": "Last name is required",
    }),
  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-z0-9_]+$/i)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username cannot exceed 30 characters",
      "string.pattern.base":
        "Username can only contain letters, numbers, and underscores",
      "any.required": "Username is required",
    }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  studentNumber: Joi.string()
    .trim()
    .pattern(/^\d{9}$/)
    .required()
    .messages({
      "string.empty": "Student number is required",
      "string.pattern.base": "Student number must be exactly 9 digits",
      "any.required": "Student number is required",
    }),
  yearLevel: Joi.string()
    .valid("1st Year", "2nd Year", "3rd Year", "4th Year")
    .required()
    .messages({
      "any.only": "Please select a valid year level",
      "any.required": "Year level is required",
    }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
});
