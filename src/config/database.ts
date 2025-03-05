import mongoose from "mongoose";
import env from "./environment";
import logger from "./logger";

// Configure mongoose options
const mongooseOptions = {
  autoIndex: env.NODE_ENV !== "production", // Don't auto-build indexes in production
  serverSelectionTimeoutMS: 15000, // Timeout after 15s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

/**
 * Connect to MongoDB database
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI, mongooseOptions);

    mongoose.set("debug", env.NODE_ENV === "development");

    logger.info("MongoDB connected successfully");

    // Handle connection events
    mongoose.connection.on("error", (err: any) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected, attempting to reconnect...");
    });

    // Handle process termination and close MongoDB connection
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
