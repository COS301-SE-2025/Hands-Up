import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// If port 587 is still slow/failing, try port 2525.
const transporter = nodemailer.createTransport({
    // service: 'Gmail', // REMOVED the simplified service
    host: 'smtp.gmail.com',
    port: 587, // Standard STARTTLS port
    secure: false, // Use false for port 587/2525, use true for 465 (not recommended)
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your App Password for Gmail
    }
});

// Define the function that sends the email
export const sendRegistrationEmail = async (userEmail, username) => {
    console.log("sending welcome email");
    
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
        // Throw the error so the controller can log the failure
        throw new Error('Failed to send email.');
    }
};