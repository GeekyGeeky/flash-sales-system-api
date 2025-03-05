import { Router } from "express";
import SaleController from "../controllers/sale.controller";
import { validateRequest } from "../middleware/validation.middleware";
import {
  createSaleSchema,
  updateSaleSchema,
  resetInventorySchema,
} from "../utils/validation";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const saleController = new SaleController();

/**
 * @route POST /api/sales
 * @desc Create a new flash sale
 * @access Admin
 */
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validateRequest(createSaleSchema),
  saleController.createSale
);

/**
 * @route GET /api/sales
 * @desc Get all sales with pagination
 * @access Public
 */
router.get("/", saleController.getSales);

/**
 * @route GET /api/sales/active
 * @desc Get active sale
 * @access Public
 */
router.get("/active", saleController.getActiveSale);

/**
 * @route GET /api/sales/:id
 * @desc Get sale by ID
 * @access Public
 */
router.get("/:id", saleController.getSaleById);

/**
 * @route PUT /api/sales/:id
 * @desc Update sale
 * @access Admin
 */
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),

  validateRequest(updateSaleSchema),
  saleController.updateSale
);

/**
 * @route POST /api/sales/:id/activate
 * @desc Activate sale
 * @access Admin
 */
router.post(
  "/:id/activate",
  authenticate,
  authorize(["admin"]),

  saleController.activateSale
);

/**
 * @route POST /api/sales/:id/deactivate
 * @desc Deactivate sale
 * @access Admin
 */
router.post(
  "/:id/deactivate",
  authenticate,
  authorize(["admin"]),

  saleController.deactivateSale
);

/**
 * @route POST /api/sales/:id/reset
 * @desc Reset sale inventory
 * @access Admin
 */
router.post(
  "/:id/reset",
  authenticate,
  authorize(["admin"]),

  validateRequest(resetInventorySchema),
  saleController.resetSaleInventory
);

export default router;
