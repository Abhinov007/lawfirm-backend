const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS 
            }
        }); 

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });

        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error("❌ Email sending failed:", error);
    }
};

module.exports = sendEmail;

