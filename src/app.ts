import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware";
import env from "./config/environment";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import purchaseRoutes from "./routes/purchase.routes";
import saleRoutes from "./routes/sale.routes";

const app: Application = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses

app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    version: process.env.npm_package_version || "1.0.0",
    environment: env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

export default app;
