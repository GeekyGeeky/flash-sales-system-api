import { FilterQuery } from "mongoose";
import Product, { IProduct } from "../models/product.model";
import { BadRequestError, NotFoundError } from "../utils/error.utils";
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from "../types/product.types";

class ProductService {
  /**
   * Get all products with pagination, sorting and filtering
   */
  public async getAllProducts(query: ProductQueryDto = {}): Promise<{
    products: IProduct[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      minPrice,
      maxPrice,
    } = query;

    // Build filter object
    const filter: FilterQuery<IProduct> = {};

    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.salePrice = {};
      if (minPrice !== undefined) {
        filter.salePrice.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.salePrice.$lte = maxPrice;
      }
    }

    // Count total matching documents
    const total = await Product.countDocuments(filter);

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get products with pagination and sorting
    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get a specific product by ID
   */
  public async getProductById(id: string): Promise<IProduct> {
    const product = await Product.findById(id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return product;
  }

  /**
   * Create a new product
   */
  public async createProduct(productData: CreateProductDto): Promise<IProduct> {
    // Validate that sale price is not higher than base price
    if (productData.salePrice > productData.basePrice) {
      throw new BadRequestError("Sale price cannot be higher than base price");
    }

    // Create and save the product
    const product = new Product(productData);
    await product.save();

    return product;
  }

  /**
   * Update an existing product
   */
  public async updateProduct(
    id: string,
    updateData: UpdateProductDto
  ): Promise<IProduct> {
    // Find the product first
    const product = await Product.findById(id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check if we're updating prices and validate them
    const basePrice = updateData.basePrice ?? product.basePrice;
    const salePrice = updateData.salePrice ?? product.salePrice;

    if (salePrice > basePrice) {
      throw new BadRequestError("Sale price cannot be higher than base price");
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      throw new NotFoundError("Product not found");
    }

    return updatedProduct;
  }

  /**
   * Delete a product
   */
  public async deleteProduct(id: string): Promise<void> {
    const result = await Product.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundError("Product not found");
    }
  }

  /**
   * Get products on sale (where salePrice < basePrice)
   */
  public async getProductsOnSale(query: ProductQueryDto = {}): Promise<{
    products: IProduct[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Modify the query to only include products on sale
    const saleQuery = {
      ...query,
    };

    // Add filter for products where salePrice is less than basePrice
    const filter: FilterQuery<IProduct> = {
      $expr: { $lt: ["$salePrice", "$basePrice"] },
    };

    // Add search functionality
    if (saleQuery.search) {
      filter.$or = [
        { name: { $regex: saleQuery.search, $options: "i" } },
        { description: { $regex: saleQuery.search, $options: "i" } },
      ];
    }

    // Add price range filtering
    if (saleQuery.minPrice !== undefined || saleQuery.maxPrice !== undefined) {
      filter.salePrice = filter.salePrice || {};
      if (saleQuery.minPrice !== undefined) {
        filter.salePrice.$gte = saleQuery.minPrice;
      }
      if (saleQuery.maxPrice !== undefined) {
        filter.salePrice.$lte = saleQuery.maxPrice;
      }
    }

    // Default pagination values
    const page = saleQuery.page || 1;
    const limit = saleQuery.limit || 10;
    const sortBy = saleQuery.sortBy || "createdAt";
    const sortOrder = saleQuery.sortOrder || "desc";

    // Count total matching documents
    const total = await Product.countDocuments(filter);

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get products on sale with pagination and sorting
    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages,
    };
  }
}

export default ProductService;
