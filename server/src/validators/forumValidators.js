import Joi from "joi";

// Post Schema
export const postSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least 1 character",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),
  content: Joi.string().trim().min(1).max(5000).required().messages({
    "string.empty": "Content cannot be empty",
    "string.min": "Content must be at least 1 character",
    "string.max": "Content cannot exceed 5000 characters",
    "any.required": "Content is required",
  }),
});

// Comment Schema
export const commentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    "string.empty": "Comment cannot be empty",
    "string.min": "Comment must be at least 1 character",
    "string.max": "Comment cannot exceed 1000 characters",
    "any.required": "Comment is required",
  }),
  parentCommentId: Joi.string().optional().allow(null, "").messages({
    "string.base": "Parent comment ID must be a string",
  }),
});
