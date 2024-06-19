import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // service: 'gmail',
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASSWORD
        // user: 'your-email@gmail.com',  // your Gmail email address
        // pass: 'your-password'  // your Gmail password or App Password
    }
})
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"E-commerce App" <quickbuy@gmail.com>', // sender address
            to: to,  // list of receivers
            subject: subject,  // Subject line
            text: text,  // plain text body
            html: html  // html body
        });
        // console.log("Mail info: ", info);
        return info.messageId;
    } catch (error) {
        throw error;
    }
};

export default sendEmail;