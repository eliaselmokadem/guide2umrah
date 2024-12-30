import nodemailer from 'nodemailer';

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use an app-specific password
  }
});

export const sendConfirmationEmail = async (recipientEmail: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Bedankt voor je interesse in Guide2Umrah',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Bedankt voor je interesse in Guide2Umrah!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">
          We sturen je bericht zodra de site online is.
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">
          Met vriendelijke groet,<br>
          Het Guide2Umrah Team
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
