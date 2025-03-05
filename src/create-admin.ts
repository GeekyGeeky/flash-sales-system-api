#!/usr/bin/env node
/**
 * This script creates a admin user securely.
 * It should be run directly from the command line and not exposed via API.
 *
 * Usage:
 *   NODE_ENV=production ADMIN_SECRET=your-admin-secret ts-node create-admin.ts
 *
 * Recommended: Set environment variables in a .env file that isn't committed to version control
 */

import dotenv from "dotenv";
import { program } from "commander";
import mongoose from "mongoose";
import readline from "readline";
import AuthService from "./services/auth.service";
import { RegisterDto } from "./types/auth.types";
import connectDatabase from "./config/database";
import { delay } from "./utils/helpers";

// Load environment variables
dotenv.config();

// Check for admin secret
const ADMIN_SECRET = process.env.ADMIN_SECRET;
if (!ADMIN_SECRET || ADMIN_SECRET === "your-admin-secret") {
  console.error(
    "\x1b[31mError: ADMIN_SECRET environment variable is not set or is using default value\x1b[0m"
  );
  console.error(
    "Please set a strong, unique ADMIN_SECRET in your environment variables"
  );
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Configure command-line interface
program
  .description("Create an admin user")
  .option("-u, --username <username>", "Admin username")
  .option("-e, --email <email>", "Admin email")
  .option("-n, --name <name>", "Admin name")
  .parse(process.argv);

const options = program.opts();

// Function to securely prompt for password (not displayed in terminal)
const promptPassword = (): Promise<string> => {
  return new Promise((resolve) => {
    // Use a custom implementation to hide password input
    process.stdout.write("Enter password: ");
    let password = "";

    process.stdin.on("data", (data) => {
      const char = data.toString("utf8");
      // Check for Enter key
      if (char === "\n" || char === "\r" || char === "\r\n") {
        process.stdin.pause();
        process.stdout.write("\n");
        resolve(password);
      } else if (char === "\u0003") {
        // Handle Ctrl+C
        process.exit(0);
      } else {
        password += char;
        process.stdout.write("*");
      }
    });
  });
};

// Function to validate secret
const validateSecret = (): Promise<boolean> => {
  return new Promise((resolve) => {
    rl.question("Enter admin secret: ", (secret) => {
      if (secret === ADMIN_SECRET) {
        resolve(true);
      } else {
        console.error("\x1b[31mInvalid admin secret\x1b[0m");
        resolve(false);
      }
    });
  });
};

// Function to prompt for user details
const promptUserDetails = async (): Promise<RegisterDto & { role: string }> => {
  const username =
    options.username ||
    (await new Promise<string>((resolve) => {
      rl.question("\nEnter username: ", resolve);
    }));

  const email =
    options.email ||
    (await new Promise<string>((resolve) => {
      rl.question("Enter email: ", resolve);
    }));

  const name =
    options.name ||
    (await new Promise<string>((resolve) => {
      rl.question("Enter name: ", resolve);
    }));

  const password = await promptPassword();

  if (!username || !email || !password) {
    console.error("\x1b[31mUsername, email, and password are required\x1b[0m");
    process.exit(1);
  }

  return {
    username,
    email,
    password,
    name,
    role: "admin",
  };
};

// Main function
const createAdmin = async (): Promise<void> => {
  try {
    console.log("\x1b[36m=== Admin Creation Utility ===\x1b[0m");

    // Validate admin secret
    const isValidSecret = await validateSecret();
    if (!isValidSecret) {
      process.exit(1);
    }

    // Connect to database
    await connectDatabase();

    await delay(2000);

    // Get user details
    const userData = await promptUserDetails();

    // Create admin
    const authService = new AuthService();
    const user = await authService.createUserWithRole(userData);

    console.log("\x1b[32mAdmin created successfully:\x1b[0m");
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);

    // Disconnect from database
    await mongoose.disconnect();
    rl.close();
  } catch (error: any) {
    console.error("\x1b[31mError creating admin:\x1b[0m", error.message);
    await mongoose.disconnect();
    rl.close();
    process.exit(1);
  }
};

// Run the script
createAdmin();
