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
      "https://guide2umrah-api.herokuapp.com"
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
  description: string;
  isFree: boolean;
  destinations: Array<{
    location: string;
    startDate: string;
    endDate: string;
    photoPaths: string[];
    roomTypes: {
      singleRoom: { available: boolean; quantity: number; price: number };
      doubleRoom: { available: boolean; quantity: number; price: number };
      tripleRoom: { available: boolean; quantity: number; price: number };
      quadRoom: { available: boolean; quantity: number; price: number };
      customRoom: { available: boolean; quantity: number; capacity: number; price: number };
    };
  }>;
}

const packageSchema = new mongoose.Schema<IPackage>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  isFree: { type: Boolean, required: true, default: false },
  destinations: [{
    location: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    photoPaths: { type: [String], required: true },
    roomTypes: {
      singleRoom: {
        available: { type: Boolean, default: false },
        quantity: { type: Number, default: 0 },
        price: { type: Number, default: 0 }
      },
      doubleRoom: {
        available: { type: Boolean, default: false },
        quantity: { type: Number, default: 0 },
        price: { type: Number, default: 0 }
      },
      tripleRoom: {
        available: { type: Boolean, default: false },
        quantity: { type: Number, default: 0 },
        price: { type: Number, default: 0 }
      },
      quadRoom: {
        available: { type: Boolean, default: false },
        quantity: { type: Number, default: 0 },
        price: { type: Number, default: 0 }
      },
      customRoom: {
        available: { type: Boolean, default: false },
        quantity: { type: Number, default: 0 },
        capacity: { type: Number, default: 0 },
        price: { type: Number, default: 0 }
      }
    }
  }]
});

const Package = mongoose.model<IPackage>("Package", packageSchema);

// Service schema and model
interface IService {
  name: string;
  description: string;
  isFree: boolean;
  location: string;
  startDate?: string;  // Made optional
  endDate?: string;    // Made optional
  photoPaths: string[];
  price: number;
}

const serviceSchema = new mongoose.Schema<IService>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  isFree: { type: Boolean, default: false },
  location: { type: String, required: true },
  startDate: { type: String, required: false },  // Made optional
  endDate: { type: String, required: false },    // Made optional
  photoPaths: { type: [String], default: [] },
  price: { type: Number, required: true }
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

// Custom Package schema and model
interface ICustomPackage {
  departureLocation: string;
  destination: string;
  additionalStops: string[];
  startDate: string;
  endDate: string;
  numberOfPeople: number;
  hotelPreference: string;
  transportPreference: string;
  additionalServices: string[];
  specialRequests: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: Date;
}

const customPackageSchema = new mongoose.Schema<ICustomPackage>({
  departureLocation: { type: String, required: true },
  destination: { type: String, required: true },
  additionalStops: { type: [String], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  numberOfPeople: { type: Number, required: true },
  hotelPreference: { type: String, required: true },
  transportPreference: { type: String, required: true },
  additionalServices: { type: [String], required: true },
  specialRequests: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

const CustomPackage = mongoose.model<ICustomPackage>('CustomPackage', customPackageSchema);

// About Us schema and model
interface IAboutUs {
  content: string;
  updatedAt: Date;
}

const aboutUsSchema = new mongoose.Schema<IAboutUs>({
  content: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const AboutUs = mongoose.model<IAboutUs>("AboutUs", aboutUsSchema);

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
  upload.array("photos", 50), // Increased limit to handle multiple destinations
  async (req: Request, res: Response) => {
    try {
      const { name, description, isFree } = req.body;
      let destinations;
      try {
        destinations = JSON.parse(req.body.destinations);
      } catch (e) {
        console.error("Error parsing destinations:", e);
        return res.status(400).json({ message: "Invalid destinations data" });
      }

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ message: "Photos are required." });
      }

      const files = req.files as Express.Multer.File[];
      let currentFileIndex = 0;
      
      // Process each destination and its photos
      const processedDestinations = await Promise.all(
        destinations.map(async (dest: any) => {
          const numPhotos = dest.photoCount || 0; // Frontend should send photoCount
          const destinationFiles = files.slice(currentFileIndex, currentFileIndex + numPhotos);
          currentFileIndex += numPhotos;

          const photoResults = await Promise.all(
            destinationFiles.map((file) =>
              uploadToCloudinary(file.buffer, "umrah-packages")
            )
          );

          // Parse the stringified roomTypes
          let roomTypes;
          try {
            roomTypes = JSON.parse(dest.roomTypes);
          } catch (e) {
            console.error("Error parsing roomTypes:", e);
            throw new Error("Invalid roomTypes data");
          }

          return {
            location: dest.location,
            startDate: dest.startDate,
            endDate: dest.endDate,
            photoPaths: photoResults.map((result) => result.secure_url),
            roomTypes: roomTypes
          };
        })
      );

      const newPackage = new Package({
        name,
        description,
        isFree: isFree === "true",
        destinations: processedDestinations
      });

      await newPackage.save();
      res.status(201).json(newPackage);
    } catch (error: unknown) {
      console.error("Error creating package:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Failed to create package." });
    }
  }
);

// PUT update a package
app.put(
  "/api/packages/:id",
  upload.array("photos", 50), // Increased limit to handle multiple destinations
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, isFree } = req.body;
    
    try {
      let destinations;
      try {
        destinations = JSON.parse(req.body.destinations);
      } catch (e) {
        console.error("Error parsing destinations:", e);
        return res.status(400).json({ message: "Invalid destinations data" });
      }

      const files = req.files as Express.Multer.File[];
      let currentFileIndex = 0;
      
      // Process each destination and its photos
      const processedDestinations = await Promise.all(
        destinations.map(async (dest: any) => {
          const numPhotos = dest.photoCount || 0;
          const destinationFiles = files.slice(currentFileIndex, currentFileIndex + numPhotos);
          currentFileIndex += numPhotos;

          const photoResults = await Promise.all(
            destinationFiles.map((file) =>
              uploadToCloudinary(file.buffer, "umrah-packages")
            )
          );

          // Parse the stringified roomTypes
          let roomTypes;
          try {
            roomTypes = JSON.parse(dest.roomTypes);
          } catch (e) {
            console.error("Error parsing roomTypes:", e);
            throw new Error("Invalid roomTypes data");
          }

          return {
            location: dest.location,
            startDate: dest.startDate,
            endDate: dest.endDate,
            photoPaths: photoResults.map((result) => result.secure_url),
            roomTypes: roomTypes
          };
        })
      );

      const updateData = {
        name,
        description,
        isFree: isFree === "true",
        destinations: processedDestinations
      };

      const updatedPackage = await Package.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      
      if (!updatedPackage) {
        return res.status(404).json({ message: "Package not found" });
      }
      
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
      const { name, description, isFree, location, startDate, endDate, price } = req.body;

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ message: "Photos are required." });
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
        isFree: isFree === "true",
        location,
        startDate,
        endDate,
        photoPaths,
        price
      });

      await newService.save();
      res.status(201).json(newService);
    } catch (error: unknown) {
      console.error("Error creating service:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Failed to create service." });
    }
  }
);

// PUT update a service
app.put(
  "/api/services/:id",
  upload.array("photos", 10),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, isFree, location, startDate, endDate, price } = req.body;
    
    try {
      const updateData: any = {
        name,
        description,
        isFree: isFree === "true",
        location,
        startDate,
        endDate,
        price
      };

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
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
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

// Contact form endpoint
app.post("/api/contact", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Send email notification
    await resend.emails.send({
      from: 'Guide2Umrah <noreply@guide2umrah.com>',
      to: 'anouarregragui@gmail.com',
      replyTo: email,
      subject: `Nieuw contactformulier: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10B981;">Nieuw Contact Formulier Bericht</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Naam:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefoon:</strong> ${phone || 'Niet opgegeven'}</p>
            <p><strong>Onderwerp:</strong> ${subject}</p>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Bericht:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: 'Guide2Umrah <noreply@guide2umrah.com>',
      to: email,
      replyTo: 'info@guide2umrah.com',
      subject: 'Bedankt voor uw bericht - Guide2Umrah',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #10B981; margin-bottom: 20px;">Bedankt voor uw bericht!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 20px;">
              Beste ${name},
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 20px;">
              We hebben uw bericht ontvangen en zullen zo spoedig mogelijk contact met u opnemen.
            </p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4B5563;">Uw bericht:</h3>
              <p style="color: #4B5563;">${subject}</p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #4B5563;">
              Met vriendelijke groet,<br/>
              Het Guide2Umrah Team
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #6B7280;">
            <p>${new Date().getFullYear()} Guide2Umrah. Alle rechten voorbehouden.</p>
          </div>
        </div>
      `
    });

    res.status(200).json({ message: "Bericht succesvol verzonden" });
  } catch (error: unknown) {
    console.error('Error sending contact form:', error);
    res.status(500).json({ 
      error: "Er is een fout opgetreden bij het verzenden van uw bericht" 
    });
  }
});

// Custom Package endpoint
app.post('/api/custom-package', async (req, res) => {
  try {
    const customPackage = new CustomPackage(req.body);
    await customPackage.save();

    // Send email notification
    const emailHtml = `
      <h2>Nieuwe Aanvraag Custom Umrah Pakket</h2>
      <p><strong>Naam:</strong> ${req.body.name}</p>
      <p><strong>Email:</strong> ${req.body.email}</p>
      <p><strong>Telefoon:</strong> ${req.body.phone}</p>
      <p><strong>Vertrek vanaf:</strong> ${req.body.departureLocation}</p>
      <p><strong>Bestemming:</strong> ${req.body.destination}</p>
      ${req.body.additionalStops.length ? `
        <p><strong>Extra bestemmingen:</strong></p>
        <ul>
          ${req.body.additionalStops.map((stop: string) => `<li>${stop}</li>`).join('')}
        </ul>
      ` : ''}
      <p><strong>Periode:</strong> ${req.body.startDate} tot ${req.body.endDate}</p>
      <p><strong>Aantal personen:</strong> ${req.body.numberOfPeople}</p>
      <p><strong>Hotel voorkeur:</strong> ${req.body.hotelPreference}</p>
      <p><strong>Transport voorkeur:</strong> ${req.body.transportPreference}</p>
      ${req.body.additionalServices.length ? `
        <p><strong>Extra services:</strong></p>
        <ul>
          ${req.body.additionalServices.map((service: string) => `<li>${service}</li>`).join('')}
        </ul>
      ` : ''}
      ${req.body.specialRequests ? `
        <p><strong>Speciale verzoeken:</strong></p>
        <p>${req.body.specialRequests}</p>
      ` : ''}
    `;

    await resend.emails.send({
      from: 'Guide2Umrah <noreply@guide2umrah.com>',
      to: ['anouarregragui@gmail.com'],
      subject: 'Nieuwe Custom Umrah Pakket Aanvraag',
      html: emailHtml
    });

    // Send confirmation email to customer
    const confirmationHtml = `
      <h2>Bedankt voor je aanvraag!</h2>
      <p>Beste ${req.body.name},</p>
      <p>We hebben je aanvraag voor een custom Umrah pakket ontvangen. We nemen zo snel mogelijk contact met je op om je wensen te bespreken.</p>
      <h3>Je aanvraag details:</h3>
      <p><strong>Vertrek vanaf:</strong> ${req.body.departureLocation}</p>
      <p><strong>Bestemming:</strong> ${req.body.destination}</p>
      <p><strong>Periode:</strong> ${req.body.startDate} tot ${req.body.endDate}</p>
      <p><strong>Aantal personen:</strong> ${req.body.numberOfPeople}</p>
      <br>
      <p>Met vriendelijke groet,</p>
      <p>Team Guide2Umrah</p>
    `;

    await resend.emails.send({
      from: 'Guide2Umrah <noreply@guide2umrah.com>',
      to: [req.body.email],
      subject: 'Bevestiging van je Custom Umrah Pakket Aanvraag',
      html: confirmationHtml
    });

    res.status(201).json({ message: 'Custom package request received successfully' });
  } catch (error) {
    console.error('Error creating custom package:', error);
    res.status(500).json({ message: 'Error creating custom package request' });
  }
});

app.get('/api/custom-packages', async (req, res) => {
  try {
    const customPackages = await CustomPackage.find().sort({ createdAt: -1 });
    res.json(customPackages);
  } catch (error) {
    console.error('Error fetching custom packages:', error);
    res.status(500).json({ message: 'Error fetching custom packages' });
  }
});

interface IBookingRequest {
  packageId: string;
  packageName: string;
  selectedRooms: Array<{
    destinationIndex: number;
    roomType: string;
    quantity: number;
    price: number;
  }>;
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    comments?: string;
  };
}

// Booking request endpoint
app.post('/api/booking-request', async (req: Request, res: Response) => {
  try {
    const bookingData: IBookingRequest = req.body;

    // Send email to admin
    await resend.emails.send({
      from: 'Guide2Umrah <noreply@guide2umrah.com>',
      to: 'anouarregragui@gmail.com', // Replace with actual admin email
      subject: `Nieuwe Boeking Aanvraag - ${bookingData.packageName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10B981;">Nieuwe Boeking Aanvraag</h2>
          
          <h3>Pakket Informatie:</h3>
          <p>Pakket Naam: ${bookingData.packageName}</p>
          <p>Pakket ID: ${bookingData.packageId}</p>
          
          <h3>Geselecteerde Kamers:</h3>
          ${bookingData.selectedRooms.map(room => `
            <div style="margin-bottom: 10px; padding: 10px; background-color: #f3f4f6;">
              <p>Kamer Type: ${room.roomType.replace('Room', '-persoonskamer')}</p>
              <p>Aantal: ${room.quantity}</p>
              <p>Prijs: €${room.price}</p>
            </div>
          `).join('')}
          
          <h3>Totaal Bedrag: €${bookingData.selectedRooms.reduce((sum, room) => sum + room.price, 0)}</h3>
          
          <h3>Klant Informatie:</h3>
          <p>Naam: ${bookingData.userInfo.firstName} ${bookingData.userInfo.lastName}</p>
          <p>Email: ${bookingData.userInfo.email}</p>
          <p>Telefoon: ${bookingData.userInfo.phone}</p>
          ${bookingData.userInfo.comments ? `<p>Opmerkingen: ${bookingData.userInfo.comments}</p>` : ''}
        </div>
      `
    });

    // Send confirmation email to customer
    await resend.emails.send({
      from: 'Guide2Umrah <noreply@guide2umrah.com>',
      to: bookingData.userInfo.email,
      subject: 'Bevestiging van je Boeking Aanvraag - Guide2Umrah',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10B981;">Bedankt voor je Boeking Aanvraag</h2>
          
          <p>Beste ${bookingData.userInfo.firstName},</p>
          
          <p>We hebben je aanvraag voor het volgende pakket ontvangen:</p>
          <p style="font-weight: bold;">${bookingData.packageName}</p>
          
          <h3>Je geselecteerde kamers:</h3>
          ${bookingData.selectedRooms.map(room => `
            <div style="margin-bottom: 10px; padding: 10px; background-color: #f3f4f6;">
              <p>Kamer Type: ${room.roomType.replace('Room', '-persoonskamer')}</p>
              <p>Prijs: €${room.price}</p>
            </div>
          `).join('')}
          
          <p>Totaal Bedrag: €${bookingData.selectedRooms.reduce((sum, room) => sum + room.price, 0)}</p>
          
          <p>We nemen zo spoedig mogelijk contact met je op om je aanvraag te bespreken.</p>
          
          <p>Met vriendelijke groet,<br>Het Guide2Umrah Team</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Booking request received successfully' });
  } catch (error) {
    console.error('Error processing booking request:', error);
    res.status(500).json({ error: 'Failed to process booking request' });
  }
});

interface IServiceInquiry {
  serviceId: string;
  serviceName: string;
  price: number | null;
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    comments?: string;
  };
}

// Service inquiry endpoint
app.post('/api/service-inquiry', async (req: Request, res: Response) => {
  try {
    const inquiryData: IServiceInquiry = req.body;

    // Send email to admin
    await resend.emails.send({
      from: 'Guide2Umrah <noreply@guide2umrah.com>',
      to: 'anouarregragui@gmail.com',
      subject: `Nieuwe Dienst Aanvraag - ${inquiryData.serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10B981;">Nieuwe Dienst Aanvraag</h2>
          
          <h3>Dienst Informatie:</h3>
          <p>Dienst Naam: ${inquiryData.serviceName}</p>
          <p>Dienst ID: ${inquiryData.serviceId}</p>
          ${inquiryData.price ? `<p>Prijs: €${inquiryData.price}</p>` : ''}
          
          <h3>Klant Informatie:</h3>
          <p>Naam: ${inquiryData.userInfo.firstName} ${inquiryData.userInfo.lastName}</p>
          <p>Email: ${inquiryData.userInfo.email}</p>
          <p>Telefoon: ${inquiryData.userInfo.phone}</p>
          ${inquiryData.userInfo.comments ? `<p>Opmerkingen: ${inquiryData.userInfo.comments}</p>` : ''}
        </div>
      `
    });

    // Send confirmation email to customer
    await resend.emails.send({
      from: 'Guide2Umrah <noreply@guide2umrah.com>',
      to: inquiryData.userInfo.email,
      subject: 'Bevestiging van je Aanvraag - Guide2Umrah',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10B981;">Bedankt voor je Aanvraag</h2>
          
          <p>Beste ${inquiryData.userInfo.firstName},</p>
          
          <p>We hebben je aanvraag voor de volgende dienst ontvangen:</p>
          <p style="font-weight: bold;">${inquiryData.serviceName}</p>
          
          ${inquiryData.price ? `<p>Prijs: €${inquiryData.price}</p>` : ''}
          
          <p>We nemen zo spoedig mogelijk contact met je op om je aanvraag te bespreken.</p>
          
          <p>Met vriendelijke groet,<br>Het Guide2Umrah Team</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Service inquiry received successfully' });
  } catch (error) {
    console.error('Error processing service inquiry:', error);
    res.status(500).json({ error: 'Failed to process service inquiry' });
  }
});

// About Us endpoints
app.get('/api/about-us', async (req: Request, res: Response) => {
  try {
    const aboutUs = await AboutUs.findOne();
    res.json(aboutUs || { content: '' });
  } catch (error) {
    res.status(500).json({ message: "Error fetching about us content" });
  }
});

app.post('/api/about-us', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const aboutUs = await AboutUs.findOne();

    if (aboutUs) {
      aboutUs.content = content;
      aboutUs.updatedAt = new Date();
      await aboutUs.save();
    } else {
      await AboutUs.create({ content });
    }

    res.json({ message: "About us content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating about us content" });
  }
});

// Root route handler
app.get("/", (req: Request, res: Response) => {
  // Check if the client accepts HTML
  const acceptsHtml = req.accepts('html');
  const acceptsJson = req.accepts('json');

  if (acceptsHtml) {
    res.send(`
      <html>
        <head>
          <title>Guide2Umrah API</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
            h1 { color: #333; }
            .endpoint { background: #f4f4f4; padding: 10px; margin: 10px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>Guide2Umrah API</h1>
          <p>The API is running successfully. Available endpoints:</p>
          <div class="endpoint">/api/packages - Get all packages</div>
          <div class="endpoint">/api/services - Get all services</div>
          <div class="endpoint">/api/about-us - Get about us content</div>
        </body>
      </html>
    `);
  } else {
    res.json({ 
      message: "Guide2Umrah API is running!",
      endpoints: {
        packages: "/api/packages",
        services: "/api/services",
        aboutUs: "/api/about-us"
      }
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
