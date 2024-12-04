import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

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
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Helper to upload files to Cloudinary
const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result as UploadApiResponse);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// User schema and model
interface IUser {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model<IUser>("User", userSchema);

// Package schema and model
interface IPackage {
  name: string;
  date: string;
  description: string;
  price: number;
  photoPath: string;
}

const packageSchema = new mongoose.Schema<IPackage>({
  name: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  photoPath: { type: String, required: true },
});

const Package = mongoose.model<IPackage>("Package", packageSchema);

// Service schema and model
interface IService {
  name: string;
  description: string;
  price: number;
  photoPath: string;
}

const serviceSchema = new mongoose.Schema<IService>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  photoPath: { type: String, required: true },
});

const Service = mongoose.model<IService>("Service", serviceSchema);

// User login
app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Gebruiker niet gevonden." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Ongeldig wachtwoord." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Er is iets misgegaan. Probeer het opnieuw." });
  }
});

// Packages CRUD
app.post(
  "/api/packages",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    try {
      const { name, date, description, price } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Foto is vereist." });
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        "umrah-packages"
      );

      const newPackage = new Package({
        name,
        date,
        description,
        price: parseFloat(price),
        photoPath: result.secure_url,
      });

      await newPackage.save();
      res.status(201).json({ message: "Pakket succesvol toegevoegd!" });
    } catch (error) {
      console.error("Fout bij het toevoegen van pakket:", error);
      res.status(500).json({ message: "Er is iets misgegaan." });
    }
  }
);

app.get("/api/packages", async (req: Request, res: Response) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (error) {
    console.error("Fout bij het ophalen van pakketten:", error);
    res.status(500).json({ message: "Er is iets misgegaan." });
  }
});

app.put(
  "/api/packages/:id",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, date, description, price } = req.body;

    try {
      const updateData: any = {
        name,
        date,
        description,
        price: parseFloat(price),
      };

      if (req.file) {
        const result = await uploadToCloudinary(
          req.file.buffer,
          "umrah-packages"
        );
        updateData.photoPath = result.secure_url;
      }

      const updatedPackage = await Package.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      res.status(200).json(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ message: "Failed to update package." });
    }
  }
);

app.delete("/api/packages/:id", async (req: Request, res: Response) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pakket succesvol verwijderd." });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({ message: "Failed to delete package." });
  }
});

// Services CRUD
app.post(
  "/api/services",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    try {
      const { name, description, price } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Foto is vereist." });
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        "umrah-services"
      );

      const newService = new Service({
        name,
        description,
        price: parseFloat(price),
        photoPath: result.secure_url,
      });

      await newService.save();
      res.status(201).json({ message: "Service succesvol toegevoegd!" });
    } catch (error) {
      console.error("Fout bij het toevoegen van service:", error);
      res.status(500).json({ message: "Er is iets misgegaan." });
    }
  }
);

app.get("/api/services", async (req: Request, res: Response) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    console.error("Fout bij het ophalen van services:", error);
    res.status(500).json({ message: "Er is iets misgegaan." });
  }
});

app.put(
  "/api/services/:id",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price } = req.body;

    try {
      const updateData: any = {
        name,
        description,
        price: parseFloat(price),
      };

      if (req.file) {
        const result = await uploadToCloudinary(
          req.file.buffer,
          "umrah-services"
        );
        updateData.photoPath = result.secure_url;
      }

      const updatedService = await Service.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      res.status(200).json(updatedService);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service." });
    }
  }
);

app.delete("/api/services/:id", async (req: Request, res: Response) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Service succesvol verwijderd." });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Failed to delete service." });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
