import Sale, { ISale } from "../models/sale.model";
import Product from "../models/product.model";
import { BadRequestError, NotFoundError } from "../utils/error.utils";
import { CreateSaleDto, UpdateSaleDto } from "../types/sale.types";

export default class SaleService {
  /**
   * Create a new flash sale
   */
  public async createSale(saleData: CreateSaleDto): Promise<ISale> {
    // Check if product exists
    const product = await Product.findById(saleData.productId);
    if (!product) {
      throw new BadRequestError("Product not found");
    }

    // Check if there's already an active sale for this product
    const existingActiveSale = await Sale.findOne({
      productId: saleData.productId,
      isActive: true,
    });

    if (existingActiveSale) {
      throw new BadRequestError("An active sale already exists for this product");
    }

    // Create new sale with default values
    const sale = new Sale({
      ...saleData,
      remainingUnits: saleData.totalUnits || 200,
    });

    return await sale.save();
  }

  /**
   * Get all sales with pagination
   */
  public async getSales(
    page = 1,
    limit = 10
  ): Promise<{ sales: ISale[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find()
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate("productId", "name basePrice salePrice"),
      Sale.countDocuments(),
    ]);

    return {
      sales,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get sale by ID
   */
  public async getSaleById(saleId: string): Promise<ISale> {
    const sale = await Sale.findById(saleId).populate(
      "productId",
      "name basePrice salePrice"
    );

    if (!sale) {
      throw new NotFoundError("Sale not found");
    }

    return sale;
  }

  /**
   * Get active sale
   */
  public async getActiveSale(): Promise<ISale | null> {
    return Sale.findOne({ isActive: true }).populate(
      "productId",
      "name basePrice salePrice"
    );
  }

  /**
   * Update sale
   */
  public async updateSale(
    saleId: string,
    updateData: UpdateSaleDto
  ): Promise<ISale> {
    const sale = await Sale.findById(saleId);

    if (!sale) {
      throw new NotFoundError("Sale not found");
    }

    // Check if trying to change product for an active sale
    if (updateData.productId && sale.isActive) {
      throw new BadRequestError("Cannot change product for an active sale");
    }

    // Apply updates
    Object.assign(sale, updateData);

    return await sale.save();
  }

  /**
   * Activate sale
   */
  public async activateSale(saleId: string): Promise<ISale> {
    const sale = await Sale.findById(saleId);

    if (!sale) {
      throw new NotFoundError("Sale not found");
    }

    // Check if there's already an active sale
    const existingActiveSale = await Sale.findOne({ isActive: true });

    if (existingActiveSale && existingActiveSale.id.toString() !== saleId) {
      throw new BadRequestError("Another sale is already active");
    }

    if (sale.remainingUnits <= 0) {
      throw new BadRequestError("Cannot activate sale with no remaining units");
    }

    const now = new Date();
    if (sale.startTime > now) {
      throw new BadRequestError(
        "Cannot activate sale before its scheduled start time"
      );
    }

    sale.isActive = true;
    return await sale.save();
  }

  /**
   * Deactivate sale
   */
  public async deactivateSale(saleId: string): Promise<ISale> {
    const sale = await Sale.findById(saleId);

    if (!sale) {
      throw new NotFoundError("Sale not found");
    }

    if (!sale.isActive) {
      throw new BadRequestError("Sale is already inactive");
    }

    sale.isActive = false;
    sale.endTime = new Date();

    return await sale.save();
  }

  /**
   * Reset sale inventory
   */
  public async resetSaleInventory(
    saleId: string,
    newTotalUnits?: number
  ): Promise<ISale> {
    const sale = await Sale.findById(saleId);

    if (!sale) {
      throw new NotFoundError("Sale not found");
    }

    if (sale.isActive) {
      throw new BadRequestError("Cannot reset inventory for an active sale");
    }

    const totalUnits = newTotalUnits || sale.totalUnits;

    sale.totalUnits = totalUnits;
    sale.remainingUnits = totalUnits;
    sale.endTime = null;

    return await sale.save();
  }
}
