import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(async () => {
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("test", 10);

    const user = new User({
      email: "test@test.com",
      password: hashedPassword,
    });

    await user.save();
    console.log("Testgebruiker toegevoegd");
    mongoose.disconnect();
  })
  .catch((err) => console.error("Failed to connect to MongoDB", err));
