import Joi from "joi";

export const projectSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "Project title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Project title is required",
  }),
  description: Joi.string().trim().min(10).max(5000).required().messages({
    "string.empty": "Project description is required",
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot exceed 5000 characters",
    "any.required": "Project description is required",
  }),
  skill: Joi.string().trim().required().messages({
    "string.empty": "Skill is required",
    "any.required": "Please select a skill",
  }),
  category: Joi.string().trim().required().messages({
    "string.empty": "Category is required",
    "any.required": "Please select a category",
  }),
  taggedUsers: Joi.string().optional().allow(""),
});
