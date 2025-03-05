import { Router } from 'express';
import ProductController from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  productController.deleteProduct
);

export default router;