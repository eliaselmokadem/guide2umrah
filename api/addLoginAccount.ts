const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User schema en model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Functie om een nieuw login-account toe te voegen
const addLoginAccount = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    // Controleer of de gebruiker al bestaat
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return;
    }

    // Versleutel het wachtwoord met bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Maak een nieuw gebruiker object
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    // Sla de nieuwe gebruiker op in de database
    await newUser.save();
    console.log("New user account added");
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

// Verbind met MongoDB en voeg een nieuw account toe (voorbeeld)
mongoose
  .connect(
    "mongodb+srv://admin:admin@g2mdb.spmzf.mongodb.net/?retryWrites=true&w=majority&appName=g2mdb"
  )
  .then(() => {
    console.log("MongoDB connected");
    // Voeg een login-account toe
    addLoginAccount("anouarg2u@adming2u.be", "g2u2024m_m_a");
  })
  .catch((error: any) => {
    console.error("MongoDB connection error:", error);
  });
