import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

// Load .env variables
dotenv.config();

const app = express();

// Use JSON middleware
app.use(express.json());

// CORS configuration using environment variables
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true); // Allow if origin is in the allowed list
      } else {
        callback(new Error("Not allowed by CORS")); // Block if origin is not allowed
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials like cookies
  })
);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Multer configureren
const storage = multer.memoryStorage(); // Bestanden in geheugen opslaan voor directe upload
const upload = multer({ storage });

// Verbind met MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Gebruikersschema en -model
interface IUser {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model<IUser>("User", userSchema);

// Pakketten schema en model
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

// Helperfunctie om te uploaden naar Cloudinary
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

    uploadStream.end(fileBuffer); // Stuur de buffer naar de stream
  });
};

// Login API
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

// Endpoint voor het toevoegen van een pakket
app.post(
  "/api/packages",
  upload.single("photo"), // Zorg ervoor dat de naam 'photo' overeenkomt met de frontend
  async (req: Request, res: Response) => {
    try {
      const { name, date, description, price } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Foto is vereist." });
      }

      // Upload bestand naar Cloudinary
      const result = await uploadToCloudinary(
        req.file.buffer,
        "umrah-packages"
      );

      // Nieuw pakket maken
      const newPackage = new Package({
        name,
        date,
        description,
        price: parseFloat(price),
        photoPath: result.secure_url, // URL van de afbeelding uit Cloudinary
      });

      await newPackage.save();
      res.status(201).json({
        message: "Pakket succesvol toegevoegd!",
        url: result.secure_url,
      });
    } catch (error) {
      console.error("Fout bij het toevoegen van pakket:", error);
      res
        .status(500)
        .json({ message: "Er is een fout opgetreden. Probeer het opnieuw." });
    }
  }
);

// Pakketten ophalen
app.get("/api/packages", async (req: Request, res: Response) => {
  try {
    const packages = await Package.find(); // Alle pakketten ophalen uit de database
    res.json(packages);
  } catch (error) {
    console.error("Fout bij het ophalen van pakketten:", error);
    res
      .status(500)
      .json({ message: "Er is iets misgegaan. Probeer het opnieuw." });
  }
});

app.put("/api/packages/:id", upload.single("photo"), async (req, res) => {
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
});

app.delete("/api/packages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Package.findByIdAndDelete(id);
    res.status(200).json({ message: "Pakket succesvol verwijderd." });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({ message: "Failed to delete package." });
  }
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
