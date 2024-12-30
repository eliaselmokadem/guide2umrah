import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { handleEmailSubscription } from "./emailSubscription";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://guide2umrah.netlify.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://guide2umrah.com",
      "https://www.guide2umrah.com",
      "http://www.guide2umrah.com",
      "http://guide2umrah.com",
      "https://guide2umrah.be",
      "https://guide2umrah.nl",
      "https://guide2umrah.eu",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Add the email subscription endpoint
app.post("/api/subscribe", handleEmailSubscription);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
