import mongoose, { ClientSession } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Purchase, { IPurchase } from '../models/purchase.model';
import Sale from '../models/sale.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import { ApiError, BadRequestError, NotFoundError } from "../utils/error.utils";
import { CreatePurchaseDto } from '../types/purchase.types';
import logger from '../config/logger';

export default class PurchaseService {
  /**
   * Process a purchase during a flash sale
   * Uses a MongoDB transaction to ensure atomicity
   */
  public async createPurchase(userId: string, purchaseData: CreatePurchaseDto): Promise<IPurchase> {
    // Start a MongoDB transaction session
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Check if user exists
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      
      // Find the active sale with a write lock (using findOneAndUpdate)
      const sale = await Sale.findOneAndUpdate(
        { _id: purchaseData.saleId, isActive: true },
        {}, // No updates yet
        { session, new: true, runValidators: true }
      );
      
      if (!sale) {
        throw new NotFoundError('Active sale not found');
      }
      
      // Check if the sale has started
      const now = new Date();
      if (sale.startTime > now) {
        throw new BadRequestError('Sale has not started yet');
      }
      
      // Check if the product exists and matches the sale
      const product = await Product.findById(sale.productId).session(session);
      if (!product) {
        throw new NotFoundError('Product not found');
      }
      
      // Validate purchase quantity
      if (!purchaseData.quantity || purchaseData.quantity <= 0) {
        throw new BadRequestError('Invalid purchase quantity');
      }
      
      if (purchaseData.quantity > sale.maxPurchasePerUser) {
        throw new BadRequestError(`Cannot purchase more than ${sale.maxPurchasePerUser} units per user`);
      }
      
      // Check user's previous purchases in this sale
      const userPurchasesCount = await Purchase.countDocuments({
        userId,
        saleId: sale._id,
      }).session(session);
      
      if (userPurchasesCount >= sale.maxPurchasePerUser) {
        throw new BadRequestError('You have already reached the maximum purchase limit for this sale');
      }
      
      // Check if there's enough stock
      if (sale.remainingUnits < purchaseData.quantity) {
        throw new BadRequestError('Not enough stock available');
      }
      
      // Update the remaining units with a findOneAndUpdate to handle race conditions
      const updatedSale = await Sale.findOneAndUpdate(
        { 
          _id: sale._id, 
          remainingUnits: { $gte: purchaseData.quantity } 
        },
        { 
          $inc: { remainingUnits: -purchaseData.quantity },
          // If inventory reaches zero, deactivate the sale
          $set: { 
            isActive: sale.remainingUnits - purchaseData.quantity > 0,
            ...(sale.remainingUnits - purchaseData.quantity <= 0 ? { endTime: now } : {})
          }
        },
        { session, new: true, runValidators: true }
      );
      
      if (!updatedSale) {
        throw new BadRequestError('Stock was depleted before your purchase could be processed');
      }
      
      // Calculate total price
      const totalPrice = product.salePrice * purchaseData.quantity;
      
      // Create the purchase record
      const purchase = new Purchase({
        userId: user._id,
        saleId: sale._id,
        productId: product._id,
        quantity: purchaseData.quantity,
        totalPrice,
        purchaseTime: now,
        transactionId: uuidv4(), // Generate unique transaction ID
      });
      
      await purchase.save({ session });
      
      // Commit the transaction
      await session.commitTransaction();
      
      return purchase;
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      
      // Re-throw the error
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error(`Purchase processing error: ${error}`);
      throw new ApiError('Failed to process purchase');
    } finally {
      // End the session
      session.endSession();
    }
  }
  
  /**
   * Get purchases by sale ID with pagination
   */
  public async getPurchasesBySale(
    saleId: string,
    page = 1,
    limit = 10
  ): Promise<{ purchases: IPurchase[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [purchases, total] = await Promise.all([
      Purchase.find({ saleId })
        .sort({ purchaseTime: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username')
        .populate('productId', 'name'),
      Purchase.countDocuments({ saleId }),
    ]);
    
    return {
      purchases,
      total,
      pages: Math.ceil(total / limit),
    };
  }
  
  /**
   * Get leaderboard (chronological list of purchases) for a sale
   */
  public async getSaleLeaderboard(
    saleId: string,
    page = 1,
    limit = 10
  ): Promise<{ leaderboard: any[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    // Validate sale existence
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new NotFoundError('Sale not found');
    }
    
    // Aggregate to get leaderboard data
    const [leaderboardData, totalCount] = await Promise.all([
      Purchase.aggregate([
        { $match: { saleId: new mongoose.Types.ObjectId(saleId) } },
        { $sort: { purchaseTime: 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            username: '$user.username',
            purchaseTime: 1,
            quantity: 1,
            totalPrice: 1,
            rank: { $add: [skip, { $indexOfArray: ['$_id', '$_id'] }, 1] },
          },
        },
      ]),
      Purchase.countDocuments({ saleId }),
    ]);
    
    // Add rank based on position
    const leaderboard = leaderboardData.map((item, index) => ({
      ...item,
      rank: skip + index + 1,
    }));
    
    return {
      leaderboard,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    };
  }
  
  /**
   * Get purchase history for a user
   */
  public async getUserPurchaseHistory(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ purchases: IPurchase[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [purchases, total] = await Promise.all([
      Purchase.find({ userId })
        .sort({ purchaseTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('productId', 'name')
        .populate('saleId', 'startTime endTime'),
      Purchase.countDocuments({ userId }),
    ]);
    
    return {
      purchases,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}