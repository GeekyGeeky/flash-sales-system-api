import jwt from "jsonwebtoken";
import env from "../config/environment";
import { LoginDto, RegisterDto } from "../types/auth.types";
import User, { IUser } from "../models/user.model";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error.utils";

class AuthService {
  /**
   * Register a new user
   */
  public async register(
    userData: RegisterDto
  ): Promise<{ user: Partial<IUser>; token: string }> {
    // Check if user with same email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      throw new BadRequestError(
        existingUser.email === userData.email
          ? "Email already in use"
          : "Username already in use"
      );
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user data without password
    const userWithoutPassword = this.excludePassword(user);
    return { user: userWithoutPassword, token };
  }

  /**
   * Login user
   */
  public async login(
    loginData: LoginDto
  ): Promise<{ user: Partial<IUser>; token: string }> {
    // Find user by email
    const user = await User.findOne({
      $or: [
        { email: loginData.emailOrUsername },
        { username: loginData.emailOrUsername },
      ],
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(loginData.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user data without password
    const userWithoutPassword = this.excludePassword(user);
    return { user: userWithoutPassword, token };
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
  }

  /**
   * Exclude password from user object
   */
  private excludePassword(user: IUser): Partial<IUser> {
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }
}

export default AuthService;
