import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validation.middleware";
import { registerSchema, loginSchema } from "../utils/validation";

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post("/login", validateRequest(loginSchema), authController.login);

export default router;
