import { Router } from 'express';
import PurchaseController from '../controllers/purchase.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createPurchaseSchema } from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';
import rateLimiter from '../middleware/rateLimiter.middleware';

const router = Router();
const purchaseController = new PurchaseController();

// Rate limit purchase requests to prevent abuse
const purchaseRateLimiter = rateLimiter(5, 60); // 5 purchase attempts per minute

/**
 * @route POST /api/purchases
 * @desc Create a new purchase
 * @access Private
 */
router.post(
  '/',
  authenticate,
  purchaseRateLimiter,
  validateRequest(createPurchaseSchema),
  purchaseController.createPurchase
);

/**
 * @route GET /api/purchases/history
 * @desc Get user purchase history
 * @access Private
 */
router.get(
  '/history',
  authenticate,
  purchaseController.getUserPurchaseHistory
);

/**
 * @route GET /api/purchases/sale/:saleId
 * @desc Get purchases by sale ID
 * @access Public
 */
router.get(
  '/sale/:saleId',
  purchaseController.getPurchasesBySale
);

/**
 * @route GET /api/purchases/leaderboard/:saleId
 * @desc Get sale leaderboard
 * @access Public
 */
router.get(
  '/leaderboard/:saleId',
  purchaseController.getSaleLeaderboard
);

export default router;