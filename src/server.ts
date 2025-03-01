import app from "./app";
import connectDB from "./config/database";
import env from "./config/environment";
import logger from "./config/logger";

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start the server once DB is connected
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (err: Error) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      logger.error(err.stack);

      // Gracefully close server and exit process
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((error) => {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });
