import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../utils/error.utils";
import { responseHandler } from "../utils/response";
import logger from "../config/logger";

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error(`Error: ${err.message}`);

  // Set default error values
  let statusCode = 500;
  let message = "Server Error";
  let errors = null;

  // Handle custom AppError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((error) => error.message);
  }

  // Handle Mongoose CastError (invalid ID)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Handle duplicate key errors
  if (err.name === "MongoError" && (err as any).code === 11000) {
    statusCode = 409;
    message = "Duplicate field value entered";
    const field = Object.keys((err as any).keyValue)[0];
    errors = [`${field} already exists`];
  }

  // Handle JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token identifier, please login";
  }

  if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Token identifier expired, please login";
  }

  // Send error response
  responseHandler.error(res, statusCode, message, errors);
};
