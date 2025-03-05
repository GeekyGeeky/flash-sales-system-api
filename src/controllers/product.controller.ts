import { Request, Response, NextFunction } from "express";
import ProductService from "../services/product.service";
import { responseHandler } from "../utils/response";
import { ProductQueryDto } from "../types/product.types";

export default class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Get all products
   * GET /api/products
   */
  public getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract query parameters
      const query: ProductQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
        search: req.query.search as string | undefined,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
      };

      // Handle special filter for products on sale
      if (req.query.onSale === "true") {
        const result = await this.productService.getProductsOnSale(query);
        responseHandler.success(
          res,
          "Products on sale retrieved successfully",
          result
        );
        return;
      }

      // Get all products
      const result = await this.productService.getAllProducts(query);
      responseHandler.success(res, "Products retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a product by ID
   * GET /api/products/:id
   */
  public getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      responseHandler.success(res, "Product retrieved successfully", product);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new product
   * POST /api/products
   * Admin only
   */
  public createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const productData = req.body;
      const product = await this.productService.createProduct(productData);
      responseHandler.success(
        res,
        "Product created successfully",
        product,
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a product
   * PUT /api/products/:id
   * Admin only
   */
  public updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const product = await this.productService.updateProduct(id, updateData);
      responseHandler.success(res, "Product updated successfully", product);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a product
   * DELETE /api/products/:id
   * Admin only
   */
  public deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);
      responseHandler.success(res, "Product deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
