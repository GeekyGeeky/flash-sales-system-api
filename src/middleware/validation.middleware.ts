import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { ApiError } from "../utils/error.utils";

/**
 * Middleware to validate request data against a Joi schema
 */
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => detail.message);
      return next(new ApiError("Validation Error", 400, errorDetails));
    }

    next();
  };
};
