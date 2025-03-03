import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import { responseHandler } from "../utils/response";
import { RegisterDto, LoginDto } from "../types/auth.types";

export default class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  public register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: RegisterDto = req.body;
      const result = await this.authService.register(userData);

      responseHandler.success(
        res,
        "User registered successfully",
        {
          user: result.user,
          token: result.token,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const loginData: LoginDto = req.body;
      const result = await this.authService.login(loginData);

      responseHandler.success(res, "Login successful", {
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  };
}
