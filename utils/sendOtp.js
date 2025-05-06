//importing modules
import nodemailer from 'nodemailer'
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

//setting path for render .ejs file for email
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//this function send email to user for otp varification, this function take user email and otp
export const sendOtp = async (email, otp) => {
    const htmlContent = await ejs.renderFile(
        path.join(__dirname, '../view/user/emailOtp.ejs'),
        { otp }
    );

    try {

        //setting sender email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADMIN,
                pass: process.env.EMAIL_PASS
            }
        })

        //setting content for user mail
        const emailOptions = {
            from: process.env.email_user,
            to: email,
            subject: 'Your Shoppi OTP code',
            html: htmlContent
        }

        //sending send otp to user email
        const result = await transporter.sendMail(emailOptions);
        console.log('OTP email sent: ', result.response, otp);
        return true;

    } catch (error) {
        console.log('Error sending OTP: ', error);
        return false;
    }
}