import express, { Request, Response } from "express";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Verbinding maken met MongoDB
const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://admin:admin@g2mdb.spmzf.mongodb.net/?retryWrites=true&w=majority&appName=g2mdb";

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// User schema en model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Endpoint voor login
app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Zoek gebruiker op basis van e-mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Vergelijk wachtwoord met bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Maak een JWT-token aan
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      {
        expiresIn: "1h",
      }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Serve static files from React's build folder
app.use(express.static(path.join(__dirname, "client/build")));

// When no other route matches, serve the index.html from React build
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

// Server starten
const PORT = process.env.PORT || 5000; // Gebruik dynamische poort als die beschikbaar is
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
