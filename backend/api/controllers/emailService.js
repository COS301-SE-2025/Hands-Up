import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create a transporter object using a generic email service like Gmail, SendGrid, etc.
// In a real application, you would store these credentials securely as environment variables.
const transporter = nodemailer.createTransport({
    service: 'Gmail', // or another service like 'SendGrid', 'Mailgun', etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    }
});

// Define the function that sends the email
export const sendRegistrationEmail = async (userEmail, username) => {
    // Set up email data with unicode symbols
    const mailOptions = {
        from: `Hands UP! <${process.env.EMAIL_USER}>`, // Sender address
        to: userEmail, // List of recipients
        subject: 'Welcome to Hands UP! 👋', // Subject line
        html: `
            <p>Hello ${username},</p>
            <p>Welcome to Hands UP! We're excited to have you on board.</p>
            <p>Get ready to start your journey into the beautiful world of sign language. Log in now and explore our lessons, translator, and games.</p>
            
            <p style="text-align: center;">
                <a href="https://handsup.onrender.com/login" 
                   style="background-color: #4CAF50; /* A nice green color */
                          color: white; 
                          padding: 15px 25px; 
                          text-align: center; 
                          text-decoration: none; 
                          display: inline-block;
                          border-radius: 5px;
                          font-weight: bold;">
                    Log In Now
                </a>
            </p>

            <p>Happy learning!</p>
            <p>The Hands UP Team</p>
        `,
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email.');
    }
};