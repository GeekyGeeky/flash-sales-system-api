import Joi from "joi";
import { Types } from "mongoose";

// Helper to validate MongoDB ObjectId
const objectIdValidator = (value: string, helpers: Joi.CustomHelpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

// Auth validation schemas
export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});

// Product validation schemas
export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  basePrice: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().allow(null, ""),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().min(10).max(1000),
  basePrice: Joi.number().min(0),
  salePrice: Joi.number().min(0),
  imageUrl: Joi.string().uri().allow(null, ""),
}).min(1);

export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).optional().messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),

  sortBy: Joi.string()
    .valid("name", "basePrice", "salePrice", "createdAt")
    .optional()
    .messages({
      "any.only": "Invalid sort field",
    }),

  sortOrder: Joi.string().valid("asc", "desc").optional().messages({
    "any.only": 'Sort order must be either "asc" or "desc"',
  }),

  search: Joi.string().trim().optional().messages({
    "string.base": "Search term must be a string",
  }),

  minPrice: Joi.number().positive().optional().messages({
    "number.base": "Minimum price must be a number",
    "number.positive": "Minimum price must be a positive number",
  }),

  maxPrice: Joi.number().positive().optional().messages({
    "number.base": "Maximum price must be a number",
    "number.positive": "Maximum price must be a positive number",
  }),
});

// Sale validation schemas
export const createSaleSchema = Joi.object({
  productId: Joi.string().custom(objectIdValidator).required(),
  startTime: Joi.date().min("now").required(),
  totalUnits: Joi.number().integer().min(1).default(200),
  maxPurchasePerUser: Joi.number().integer().min(1).default(1),
});

export const updateSaleSchema = Joi.object({
  productId: Joi.string().custom(objectIdValidator),
  startTime: Joi.date().min("now"),
  totalUnits: Joi.number().integer().min(1),
  maxPurchasePerUser: Joi.number().integer().min(1),
}).min(1);

export const resetInventorySchema = Joi.object({
  totalUnits: Joi.number().integer().min(1),
});

// Purchase validation schemas
export const createPurchaseSchema = Joi.object({
  saleId: Joi.string().custom(objectIdValidator).required(),
  quantity: Joi.number().integer().min(1).required(),
});
