import { ObjectId } from "mongoose";

export interface CreateSaleDto {
    productId: string | ObjectId; // Matches objectIdValidator
    startTime: Date;
    totalUnits: number;
    maxPurchasePerUser: number;
  }
  
  export interface UpdateSaleDto {
    productId?: string | ObjectId;
    startTime?: Date;
    totalUnits?: number;
    maxPurchasePerUser?: number;
  }
  
  export interface ResetInventoryDto {
    totalUnits: number;
  }