import { Response } from "express";

/**
 * Response handler for standardized API responses
 */
export const responseHandler = {
  /**
   * Success response
   */
  success: (
    res: Response,
    message: string,
    data: any = null,
    statusCode: number = 200,
  ) => {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  },

  /**
   * Error response
   */
  error: (
    res: Response,
    statusCode: number,
    message: string,
    errors: any = null
  ) => {
    return res.status(statusCode).json({
      status: "error",
      message,
      errors,
    });
  },
};
