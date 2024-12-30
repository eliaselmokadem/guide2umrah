import mongoose from "mongoose";
import { Request, Response } from "express";

// Email Subscription Schema
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

// Handler for email subscription
export const handleEmailSubscription = async (req: Request, res: Response) => {
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

    return res.status(201).json({ 
      success: true, 
      message: "Bedankt voor je inschrijving! We houden je op de hoogte." 
    });

  } catch (error) {
    console.error("Error in email subscription:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Er is iets misgegaan. Probeer het later opnieuw." 
    });
  }
};
