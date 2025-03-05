import { Request, Response, NextFunction } from "express";
import SaleService from "../services/sale.service";
import { responseHandler } from "../utils/response";
import { CreateSaleDto, UpdateSaleDto } from "../types/sale.types";

export default class SaleController {
  private saleService: SaleService;

  constructor() {
    this.saleService = new SaleService();
  }

  /**
   * Create a new flash sale
   */
  public createSale = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const saleData: CreateSaleDto = req.body;
      const sale = await this.saleService.createSale(saleData);

      responseHandler.success(
        res,
        "Flash sale created successfully",
        sale,
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all sales with pagination
   */
  public getSales = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.saleService.getSales(page, limit);

      responseHandler.success(res, "Sales retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get sale by ID
   */
  public getSaleById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const sale = await this.saleService.getSaleById(id);

      responseHandler.success(res, "Sale retrieved successfully", sale);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active sale
   */
  public getActiveSale = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const activeSale = await this.saleService.getActiveSale();

      if (!activeSale) {
        responseHandler.success(res, "No active sales found", null);
        return;
      }

      responseHandler.success(
        res,
        "Active sale retrieved successfully",
        activeSale
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update sale
   */
  public updateSale = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateSaleDto = req.body;

      const updatedSale = await this.saleService.updateSale(id, updateData);

      responseHandler.success(res, "Sale updated successfully", updatedSale);
    } catch (error) {
      next(error);
    }
  };
  /**
   * Activate sale
   */
  public activateSale = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedSale = await this.saleService.activateSale(id);

      responseHandler.success(res, "Sale activated successfully", updatedSale);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deactivate sale
   */
  public deactivateSale = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedSale = await this.saleService.deactivateSale(id);

      responseHandler.success(
        res,
        "Sale deactivated successfully",
        updatedSale
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset sale inventory
   */
  public resetSaleInventory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { totalUnits } = req.body;

      const updatedSale = await this.saleService.resetSaleInventory(
        id,
        totalUnits
      );

      responseHandler.success(
        res,
        "Sale inventory reset successfully",
        updatedSale
      );
    } catch (error) {
      next(error);
    }
  };
}
