import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(async () => {
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email: "test@test.be" });
    console.log("Found user:", user);

    mongoose.disconnect();
  })
  .catch((err) => console.error("Failed to connect to MongoDB", err));
