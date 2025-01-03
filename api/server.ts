import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { Resend } from 'resend';

// Load environment variables
dotenv.config();

const app = express();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sendConfirmationEmail = async (recipientEmail: string) => {
  try {
    console.log(`Attempting to send email to: ${recipientEmail}`);
    await resend.emails.send({
      from: 'Guide2Umrah <noreply@guide2umrah.com>',
      to: recipientEmail,
      replyTo: 'support@guide2umrah.com',
      subject: 'Welkom bij Guide2Umrah - Jouw Registratie is Bevestigd',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #10B981; margin-bottom: 20px; text-align: center;">Welkom bij Guide2Umrah!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 20px;">
            Assalamu alaikum,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 20px;">
            Bedankt voor je registratie bij Guide2Umrah. Wij zijn er om je te helpen bij het plannen van je spirituele reis.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 20px;">
            We zijn momenteel hard bezig om het platform te perfectioneren zodat we je de best mogelijke ervaring kunnen bieden bij het plannen van je Umrah reis.
          </p>

          <ul style="color: #4B5563; margin-bottom: 20px; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Uitgebreide Umrah gidsen en tips</li>
            <li style="margin-bottom: 10px;">Persoonlijke reisplanning assistentie</li>
            <li style="margin-bottom: 10px;">Speciale aanbiedingen voor vroege gebruikers</li>
          </ul>

          <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 20px;">
            Heb je vragen? Aarzel dan niet om contact op te nemen met ons ondersteuningsteam.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 20px;">
            Met vriendelijke groet,<br/>
            Het Guide2Umrah Team
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #6B7280;">
          <p>Dit is een bevestigingsmail van Guide2Umrah. Voeg noreply@guide2umrah.com toe aan je veilige afzenders om toekomstige e-mails in je inbox te ontvangen.</p>
          <p> ${new Date().getFullYear()} Guide2Umrah. Alle rechten voorbehouden.</p>
        </div>
      </div>
    `
    });

    console.log(`Email verzonden naar ${recipientEmail}`);
  } catch (error: unknown) {
    console.error('Fout bij verzenden email:', {
      recipient: recipientEmail,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error && 'response' in error 
        ? (error as any).response?.data 
        : undefined
    });
    throw error;
  }
};

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: unknown) => console.error("Failed to connect to MongoDB", err));

// Helper to upload files to Cloudinary
const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload failed'));
        }
        resolve(result);
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
  photoPaths: string[];
}

const packageSchema = new mongoose.Schema<IPackage>({
  name: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  photoPaths: { type: [String], required: true },
});

const Package = mongoose.model<IPackage>("Package", packageSchema);

// Service schema and model
interface IService {
  name: string;
  description: string;
  price: number;
  photoPaths: string[];
}

const serviceSchema = new mongoose.Schema<IService>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  photoPaths: { type: [String], required: true },
});

const Service = mongoose.model<IService>("Service", serviceSchema);

// Background Image schema and model
interface IBackgroundImage {
  pageName: string;
  imageUrl: string;
  updatedAt: Date;
}

const backgroundImageSchema = new mongoose.Schema<IBackgroundImage>({
  pageName: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const BackgroundImage = mongoose.model<IBackgroundImage>("BackgroundImage", backgroundImageSchema);

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
  } catch (error: unknown) {
    console.error("Login error:", error instanceof Error ? error.message : String(error));
    res
      .status(500)
      .json({ message: "Er is iets misgegaan. Probeer het opnieuw." });
  }
});

// **Packages CRUD**
// GET all packages
app.get("/api/packages", async (req: Request, res: Response) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (error: unknown) {
    console.error("Fout bij het ophalen van pakketten:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Er is iets misgegaan." });
  }
});

// GET single package by ID
app.get("/api/packages/:id", async (req: Request, res: Response) => {
  try {
    const packageData = await Package.findById(req.params.id);
    if (!packageData) {
      return res.status(404).json({ message: "Pakket niet gevonden." });
    }
    res.json(packageData);
  } catch (error: unknown) {
    console.error("Error fetching package:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Error fetching package." });
  }
});

// POST create a new package
app.post(
  "/api/packages",
  upload.array("photos", 10),
  async (req: Request, res: Response) => {
    try {
      const { name, date, description, price } = req.body;

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ message: "Foto's zijn vereist." });
      }

      const photoResults = await Promise.all(
        (req.files as Express.Multer.File[]).map((file) =>
          uploadToCloudinary(file.buffer, "umrah-packages")
        )
      );
      const photoPaths = photoResults.map((result) => result.secure_url);

      const newPackage = new Package({
        name,
        date,
        description,
        price: parseFloat(price),
        photoPaths,
      });

      await newPackage.save();
      res.status(201).json({ message: "Pakket succesvol toegevoegd!" });
    } catch (error: unknown) {
      console.error("Fout bij het toevoegen van pakket:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Er is iets misgegaan." });
    }
  }
);

// PUT update a package
app.put(
  "/api/packages/:id",
  upload.array("photos", 10),
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

      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const photoResults = await Promise.all(
          (req.files as Express.Multer.File[]).map((file) =>
            uploadToCloudinary(file.buffer, "umrah-packages")
          )
        );
        updateData.photoPaths = photoResults.map((result) => result.secure_url);
      }

      const updatedPackage = await Package.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      res.status(200).json(updatedPackage);
    } catch (error: unknown) {
      console.error("Error updating package:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Failed to update package." });
    }
  }
);

// DELETE a package
app.delete("/api/packages/:id", async (req: Request, res: Response) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pakket succesvol verwijderd." });
  } catch (error: unknown) {
    console.error("Error deleting package:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Failed to delete package." });
  }
});

// **Services CRUD**
// GET all services
app.get("/api/services", async (req: Request, res: Response) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error: unknown) {
    console.error("Fout bij het ophalen van services:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Er is iets misgegaan." });
  }
});

// GET single service by ID
app.get("/api/services/:id", async (req: Request, res: Response) => {
  try {
    const serviceData = await Service.findById(req.params.id);
    if (!serviceData) {
      return res.status(404).json({ message: "Service niet gevonden." });
    }
    res.json(serviceData);
  } catch (error: unknown) {
    console.error("Error fetching service:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Error fetching service." });
  }
});

// POST create a new service
app.post(
  "/api/services",
  upload.array("photos", 10),
  async (req: Request, res: Response) => {
    try {
      const { name, description, price } = req.body;

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ message: "Foto's zijn vereist." });
      }

      const photoResults = await Promise.all(
        (req.files as Express.Multer.File[]).map((file) =>
          uploadToCloudinary(file.buffer, "umrah-services")
        )
      );
      const photoPaths = photoResults.map((result) => result.secure_url);

      const newService = new Service({
        name,
        description,
        price: parseFloat(price),
        photoPaths,
      });

      await newService.save();
      res.status(201).json({ message: "Service succesvol toegevoegd!" });
    } catch (error: unknown) {
      console.error("Fout bij het toevoegen van service:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Er is iets misgegaan." });
    }
  }
);

// PUT update a service
app.put(
  "/api/services/:id",
  upload.array("photos", 10),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price } = req.body;

    try {
      const updateData: any = { name, description, price: parseFloat(price) };

      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const photoResults = await Promise.all(
          (req.files as Express.Multer.File[]).map((file) =>
            uploadToCloudinary(file.buffer, "umrah-services")
          )
        );
        updateData.photoPaths = photoResults.map((result) => result.secure_url);
      }

      const updatedService = await Service.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      res.status(200).json(updatedService);
    } catch (error: unknown) {
      console.error("Error updating service:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Failed to update service." });
    }
  }
);

// DELETE a service
app.delete("/api/services/:id", async (req: Request, res: Response) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Service succesvol verwijderd." });
  } catch (error: unknown) {
    console.error("Error deleting service:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Failed to delete service." });
  }
});

// Background Image endpoints
app.post("/api/background-image", upload.single("image"), async (req: Request, res: Response) => {
  try {
    const { pageName } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Afbeelding is vereist." });
    }

    if (!pageName) {
      return res.status(400).json({ message: "Pagina naam is vereist." });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "backgrounds");

    // Update or create background image record
    const backgroundImage = await BackgroundImage.findOneAndUpdate(
      { pageName },
      { 
        imageUrl: result.secure_url,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: backgroundImage
    });

  } catch (error: unknown) {
    console.error("Error updating background image:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ 
      success: false,
      message: "Er is een fout opgetreden bij het bijwerken van de achtergrondafbeelding." 
    });
  }
});

app.get("/api/background-image/:pageName", async (req: Request, res: Response) => {
  try {
    const { pageName } = req.params;
    const backgroundImage = await BackgroundImage.findOne({ pageName });
    
    if (!backgroundImage) {
      return res.status(404).json({ 
        success: false,
        message: "Geen achtergrondafbeelding gevonden voor deze pagina." 
      });
    }

    res.json({
      success: true,
      data: backgroundImage
    });

  } catch (error: unknown) {
    console.error("Error fetching background image:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ 
      success: false,
      message: "Er is een fout opgetreden bij het ophalen van de achtergrondafbeelding." 
    });
  }
});

// Email Subscription Schema and Model
interface IEmailSubscription {
  email: string;
  subscriptionDate: Date;
}

const emailSubscriptionSchema = new mongoose.Schema<IEmailSubscription>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: "Please enter a valid email address"
    }
  },
  subscriptionDate: { 
    type: Date, 
    default: Date.now 
  }
});

const EmailSubscription = mongoose.model<IEmailSubscription>("EmailSubscription", emailSubscriptionSchema);

// Email subscription endpoint
app.post("/api/subscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Voer een geldig e-mailadres in." 
      });
    }

    // Check if email already exists
    const existingSubscription = await EmailSubscription.findOne({ email });
    if (existingSubscription) {
      return res.status(400).json({ 
        success: false, 
        message: "Dit e-mailadres is al geregistreerd." 
      });
    }

    // Create new subscription
    const newSubscription = new EmailSubscription({ email });
    await newSubscription.save();

    // Send confirmation email
    await sendConfirmationEmail(email);

    return res.status(201).json({ 
      success: true, 
      message: "Bedankt voor je inschrijving! We hebben je een bevestigingsmail gestuurd. Als je het niet direct ontvangt, zit het in je spam folder." 
    });

  } catch (error: unknown) {
    console.error("Error in email subscription:", error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      success: false, 
      message: "Er is iets misgegaan. Probeer het later opnieuw." 
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
