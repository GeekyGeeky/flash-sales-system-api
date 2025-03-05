import { Request, Response, NextFunction } from "express";
import PurchaseService from "../services/purchase.service";
import { responseHandler } from "../utils/response";
import { CreatePurchaseDto } from "../types/purchase.types";

export default class PurchaseController {
  private purchaseService: PurchaseService;

  constructor() {
    this.purchaseService = new PurchaseService();
  }

  /**
   * Create a new purchase
   */
  public createPurchase = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const purchaseData: CreatePurchaseDto = req.body;

      const purchase = await this.purchaseService.createPurchase(
        userId,
        purchaseData
      );

      responseHandler.success(res, "Purchase successful", purchase, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get purchases by sale ID
   */
  public getPurchasesBySale = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { saleId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.purchaseService.getPurchasesBySale(
        saleId,
        page,
        limit
      );

      responseHandler.success(res, "Purchases retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get sale leaderboard
   */
  public getSaleLeaderboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { saleId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.purchaseService.getSaleLeaderboard(
        saleId,
        page,
        limit
      );

      responseHandler.success(
        res,
        "Leaderboard retrieved successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user purchase history
   */
  public getUserPurchaseHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.purchaseService.getUserPurchaseHistory(
        userId,
        page,
        limit
      );

      responseHandler.success(
        res,
        "Purchase history retrieved successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  };
}
