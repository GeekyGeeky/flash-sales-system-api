import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/error.utils";

/**
 * Factory function to create rate limiters
 * @param max Number of requests allowed in the window
 * @param windowMinutes Time window in minutes
 */
const rateLimiter = (max: number, windowMinutes: number) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req: Request, res: Response, next: NextFunction) => {
      next(new ApiError("Too many requests, please try again later", 429));
    },
  });
};

export default rateLimiter;
