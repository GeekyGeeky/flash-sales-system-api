import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface Environment {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
}

const env: Environment = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/flash-sale",
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret'
};

// Validate critical environment variables
if (env.NODE_ENV === "production") {
  const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
  for (const variable of requiredEnvVars) {
    if (!process.env[variable]) {
      throw new Error(
        `Environment variable ${variable} is required in production mode`
      );
    }
  }

  // Ensure JWT_SECRET is strong enough in production
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters long in production mode"
    );
  }
}

export default env;
